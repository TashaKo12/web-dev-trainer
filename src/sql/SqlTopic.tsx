import { RichText } from "../components/RichText";
import { sqlExplain, sqlText } from "./pretty";
import { ResetDraft, useDraft } from "../lib/drafts";
import { useState, type ReactNode } from "react";
import { TopicSlider } from "../components/TopicSlider";
import { TrainerHero } from "../components/TrainerHero";
import { SectionHeading } from "../components/SectionHeading";
import { CompletionBanner } from "../components/CompletionBanner";
import { LevelShell } from "../components/LevelShell";
import { McqOptions } from "../components/McqOptions";
import { useTaskStepper } from "../components/useTaskStepper";
import { TrueFalseDeck, type TrueFalseStatement } from "../components/TrueFalseDeck";
import { trainers } from "../trainers/registry";
import type { TrainerId } from "../lib/progress";
import { CodeEditor } from "../python/CodeTerminal";
import { MissionBoard, MissionFeedback, MissionGoal } from "../python/MissionBoard";
import { DATABASES, type DbName } from "./databases";
import { runSql, type SqlRun } from "./engine";
import { DbBadge, EngineGate, LiveSql, ResultView, RunSqlButton, TableView, checkSql, expectedOf, type SqlTask } from "./SqlUi";

// One SQL topic built from data: theory with live queries → missions → practice → true/false cards.
// Every query really runs on a sample database; a task is solved when the result equals the reference solution's.

export type SqlExample = { code: string; db: DbName; note?: string };
export type SqlPart = { title: string; text: ReactNode; examples?: SqlExample[]; /** a picture or a scheme instead of / besides queries */ extra?: ReactNode };

export type SqlMission = SqlTask & { title: string; body: ReactNode; goal: ReactNode };

export type SqlLevel =
  | (SqlTask & { kind?: "query"; badge: string; prompt: ReactNode; explain: ReactNode; /** hide the expected table (when it would give the answer away) */ hideExpected?: boolean })
  | { kind: "choice"; badge: string; prompt: ReactNode; options: string[]; answer: number; explain: ReactNode };

export type SqlTopicData = {
  id: TrainerId;
  theory: { title: string; description: string; parts: SqlPart[] };
  game: { title: string; description: string; finish: string; missions: SqlMission[] };
  levels: SqlLevel[];
  cards: TrueFalseStatement[];
};

function Theory({ part }: { part: SqlPart }) {
  return (
    <div className="rounded-xl border border-[#e6e7ee] bg-white p-6 shadow-sm sm:p-7 dark:border-slate-800">
      <div className="mb-4 space-y-2 text-sm leading-relaxed text-slate-600">{part.text}</div>
      {part.extra && <div className="mb-4">{part.extra}</div>}
      {part.examples && (
        <div className={`grid gap-3 ${part.examples.length > 1 ? "xl:grid-cols-2" : ""}`}>
          {part.examples.map((e) => (
            <div key={e.code} className="space-y-1.5">
              <DbBadge db={e.db} />
              <LiveSql code={e.code} db={e.db} note={e.note} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Expected({ task }: { task: SqlTask }) {
  const t = expectedOf(task);
  if (!t) return null;
  return <TableView table={t} caption={task.verify ? `Что должно получиться в базе (${task.verify})` : "Что должен показать запрос"} />;
}

function MissionPlay({ mission, isDone, onComplete, onMistake }: { mission: SqlMission; isDone: boolean; onComplete: () => void; onMistake: () => void }) {
  const [code, setCode] = useDraft(mission.start);
  const [run, setRun] = useState<SqlRun | null>(null);
  const [solved, setSolved] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  function exec() {
    run?.db.close();
    const v = checkSql(mission, code);
    setRun(v.run);
    setHint(v.hint);
    if (v.ok) {
      setSolved(true);
      onComplete();
    } else if (!isDone && !v.ruleOnly) onMistake();
  }
  return (
    <div className="space-y-4">
      <div className="space-y-2 text-slate-600">{mission.body}</div>
      <MissionGoal>
        <p className="font-bold">Цель миссии:</p>
        <div className="mt-1">{mission.goal}</div>
      </MissionGoal>
      <DbBadge db={mission.db} />
      <CodeEditor value={code} onChange={setCode} onRun={exec} lang="js" />
      <div className="flex flex-wrap items-center gap-3">
        <RunSqlButton onClick={exec} disabled={!code.trim()} />
        <MissionFeedback solved={solved} isDone={isDone} hint={hint && sqlText(hint)} />
<ResetDraft value={code} start={mission.start} onReset={setCode} />
      </div>
      <ResultView run={run} />
    </div>
  );
}

function QueryLevel({ level, onResult }: { level: Extract<SqlLevel, SqlTask>; onResult: (ok: boolean) => void }) {
  const [code, setCode] = useDraft(level.start);
  const [run, setRun] = useState<SqlRun | null>(null);
  const [checked, setChecked] = useState<{ ok: boolean; hint: string | null } | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const tryIt = () => {
    run?.db.close();
    setRun(runSql(DATABASES[level.db].setup, code));
  };
  function check() {
    run?.db.close();
    const v = checkSql(level, code);
    setRun(v.run);
    if (v.ruleOnly) return setNote(v.hint);
    setNote(null);
    setChecked({ ok: v.ok, hint: v.hint });
    onResult(v.ok);
  }
  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-slate-700">{level.prompt}</div>
      <DbBadge db={level.db} />
      {!level.hideExpected && <Expected task={level} />}
      <CodeEditor value={code} onChange={setCode} onRun={tryIt} disabled={!!checked} lang="js" />
      {!checked && (
        <div className="flex flex-wrap items-center gap-3">
          <RunSqlButton onClick={tryIt} disabled={!code.trim()} />
          <button
            type="button"
            onClick={check}
            disabled={!code.trim()}
            className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
          <span className="text-xs text-slate-400">Ctrl + Enter — выполнить. Каждый запуск — на свежей копии базы.</span>
        </div>
      )}
      {note && !checked && <p className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800">{note}</p>}
      {checked?.hint && <div className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800"><RichText text={sqlText(checked.hint)} /></div>}
      <ResultView run={run} />
    </div>
  );
}

function ChoiceLevel({ level, onResult }: { level: Extract<SqlLevel, { kind: "choice" }>; onResult: (ok: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-slate-700">{level.prompt}</div>
      <McqOptions
        options={level.options}
        selected={picked}
        disabled={picked !== null}
        mono={false}
        onSelect={(i) => {
          setPicked(i);
          onResult(i === level.answer);
        }}
      />
      {picked !== null && picked !== level.answer && <p className="text-sm text-slate-500">Правильный ответ: «{level.options[level.answer]}».</p>}
    </div>
  );
}

function Tasks({ id, levels }: { id: TrainerId; levels: SqlLevel[] }) {
  const stepper = useTaskStepper(levels.length, id);
  const level = levels[stepper.index];
  if (stepper.allAnswered) return <CompletionBanner score={stepper.score} total={levels.length} onRestart={() => stepper.restart()} />;
  return (
    <LevelShell
      total={levels.length}
      index={stepper.index}
      statuses={stepper.statuses}
      status={stepper.status}
      isLast={stepper.isLast}
      badge={level.badge}
      explain={typeof level.explain === "string" ? <RichText text={level.kind === "choice" ? level.explain : sqlExplain(level.explain, level.solution)} /> : level.explain}
      onJump={stepper.goTo}
      onNext={stepper.goNext}
      nextClassName="bg-gradient-to-r from-sky-500 to-indigo-500"
    >
      {level.kind === "choice" ? (
        <ChoiceLevel key={stepper.index} level={level} onResult={(c) => stepper.markResult(c)} />
      ) : (
        <QueryLevel key={stepper.index} level={level} onResult={(c) => stepper.markResult(c)} />
      )}
    </LevelShell>
  );
}

export function SqlTopicPage({ data }: { data: SqlTopicData }) {
  const meta = trainers.find((t) => t.id === data.id)!;
  const parts = data.theory.parts;
  return (
    <EngineGate>
      <TopicSlider>
        <TrainerHero icon={meta.icon} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
        {parts.flatMap((p, i) => [
          <SectionHeading
            key={`h:${p.title}`}
            kicker="Теория"
            title={p.title}
            description={
              <>
                <b className="text-slate-600">
                  Шаг {i + 1} из {parts.length} · {data.theory.title}
                </b>
                {i === 0 && <> — {data.theory.description}</>}
              </>
            }
          />,
          <div key={`b:${p.title}`} className="mb-10">
            <Theory part={p} />
          </div>,
        ])}
        <SectionHeading kicker="Игра" title={data.game.title} description={data.game.description} />
        <div className="mb-10">
          <MissionBoard
            missions={data.game.missions.map((m) => ({
              title: m.title,
              render: ({ isDone, onComplete, onMistake }) => <MissionPlay mission={m} isDone={isDone} onComplete={onComplete} onMistake={onMistake} />,
            }))}
            storageKey={meta.missions!.storageKey}
            pointsSource={`missions:${data.id}`}
            finishText={data.game.finish}
          />
        </div>
        <SectionHeading kicker="Практика" title="Закрепим" description={`${data.levels.length} заданий: пиши запросы и проверяй — результат должен совпасть с нужной таблицей.`} />
        <div className="mb-10">
          <Tasks id={data.id} levels={data.levels} />
        </div>
        <SectionHeading kicker="Проверь себя" title="Верно или неверно?" description={`Пролистай ${data.cards.length} карточек — угадай, где правда, а где нет.`} />
        <TrueFalseDeck statements={data.cards} accent={meta.gradient} />
      </TopicSlider>
    </EngineGate>
  );
}
