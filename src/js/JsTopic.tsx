import { Fragment, useState, type ReactNode } from "react";
import { Check, Lightbulb, X } from "lucide-react";
import { TopicSlider } from "../components/TopicSlider";
import { TrainerHero } from "../components/TrainerHero";
import { SectionHeading } from "../components/SectionHeading";
import { CompletionBanner } from "../components/CompletionBanner";
import { LevelShell } from "../components/LevelShell";
import { useTaskStepper } from "../components/useTaskStepper";
import { TrueFalseDeck, type TrueFalseStatement } from "../components/TrueFalseDeck";
import { trainers } from "../trainers/registry";
import type { TrainerId } from "../lib/progress";
import { CodeEditor, RunButton } from "../python/CodeTerminal";
import { MissionBoard, MissionFeedback, MissionGoal, RobotSays } from "../python/MissionBoard";
import { PyTheory, type Part } from "../python/PythonTheory";
import { runJs, type JsResult } from "./runJs";

// One JavaScript topic built from data: theory → game missions → practice → true/false cards.
// The code really runs (in a worker); practice calls the student's functions with several arguments,
// so a function that only fits the example does not pass.

export function JsCode({ children }: { children: ReactNode }) {
  return <code className="rounded bg-slate-100 px-1 font-mono text-[0.92em] text-slate-800">{children}</code>;
}

export type JsMission = {
  title: string;
  body: ReactNode;
  goal: ReactNode;
  start: string;
  /** Expressions evaluated after the code, for example calls of the student's function. */
  calls?: string[];
  /** Runs once the program has finished without errors: true = mission complete, string = hint. */
  check: (r: JsResult, code: string) => true | string;
};

export type JsTest = {
  /** A call of the student's function, for example: sum(2, 3). */
  call: string;
  /** What the call must return (as console.log would show it: text without quotes). */
  returns?: string;
  /** What the call must print with console.log, line by line. */
  prints?: string;
};

export type JsLevel = {
  badge: string;
  prompt: ReactNode;
  start: string;
  /** What the whole program must print. */
  output?: string;
  tests?: JsTest[];
  rule?: (code: string) => boolean;
  ruleHint?: string;
  explain: string;
};

export function JsTerminal({ result, running }: { result: JsResult | null; running?: boolean }) {
  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-inner">
        <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-2 font-mono text-[11px] text-slate-500">консоль</span>
        </div>
        <div className="min-h-[5.5rem] px-4 py-3 font-mono text-sm leading-relaxed">
          <div className="text-slate-500">$ node script.js</div>
          {running && <div className="text-slate-500">…выполняю</div>}
          {!running && !result && <div className="text-slate-500">Нажми «Запустить», чтобы увидеть результат</div>}
          {!running && result && (
            <>
              {result.logs.map((l, i) => (
                <div key={i} className="whitespace-pre-wrap break-words text-emerald-200">
                  {l || " "}
                </div>
              ))}
              {!result.logs.length && !result.error && <div className="italic text-slate-500">(console.log ничего не вывел)</div>}
              {result.error && (
                <div className="whitespace-pre-wrap break-words text-rose-300">
                  {result.error.name === "Timeout" ? "Ошибка: " : `Uncaught ${result.error.name}: `}
                  {result.error.message}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {!running && result?.error && (
        <div className="mt-3 flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          <span>{result.error.hint}</span>
        </div>
      )}
    </div>
  );
}

/** Runs code and keeps the latest result; an older run that finishes late is ignored. */
function useJsRunner() {
  const [result, setResult] = useState<JsResult | null>(null);
  const [running, setRunning] = useState(false);
  const [ticket] = useState({ n: 0 });
  async function run(code: string, calls: string[] = []) {
    const my = ++ticket.n;
    setRunning(true);
    const r = await runJs(code, calls);
    if (my !== ticket.n) return null;
    setResult(r);
    setRunning(false);
    return r;
  }
  return { result, running, run };
}

const lastLine = (r: JsResult) => r.logs[r.logs.length - 1] ?? "";

function MissionPlay({ mission, isDone, onComplete, onMistake }: { mission: JsMission; isDone: boolean; onComplete: () => void; onMistake: () => void }) {
  const [code, setCode] = useState(mission.start);
  const runner = useJsRunner();
  const [solved, setSolved] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  async function go() {
    setHint(null);
    const r = await runner.run(code, mission.calls);
    if (!r) return;
    if (r.error) {
      if (!isDone) onMistake();
      return;
    }
    const verdict = mission.check(r, code);
    if (verdict === true) {
      setSolved(true);
      onComplete();
    } else {
      setHint(verdict);
      if (!isDone) onMistake();
    }
  }

  const r = runner.result;
  const speech = !r ? null : r.error ? "…ой, я не понял команду" : lastLine(r) || "Готово!";

  return (
    <div className="space-y-4">
      <div className="space-y-2 text-slate-600">{mission.body}</div>
      <MissionGoal>
        <p className="font-bold">Цель миссии:</p>
        <div className="mt-1">{mission.goal}</div>
      </MissionGoal>
      <RobotSays text={speech} />
      <CodeEditor lang="js" value={code} onChange={setCode} onRun={go} />
      <div className="flex flex-wrap items-center gap-3">
        <RunButton onClick={go} disabled={runner.running} />
        <MissionFeedback solved={solved} isDone={isDone} hint={hint} />
      </div>
      <JsTerminal result={r} running={runner.running} />
    </div>
  );
}

type TestRow = { test: JsTest; got: string; ok: boolean };

function testRows(level: JsLevel, r: JsResult): TestRow[] {
  return (level.tests ?? []).map((test, i) => {
    const c = r.calls[i];
    if (!c) return { test, got: "—", ok: false };
    if (!c.ok) return { test, got: c.value, ok: false };
    const printed = c.logs.join("\n");
    const okReturn = test.returns === undefined || c.value === test.returns;
    const okPrint = test.prints === undefined || printed.trim() === test.prints;
    const got = test.prints !== undefined ? printed || "(ничего не вывела)" : c.value;
    return { test, got, ok: okReturn && okPrint };
  });
}

function expectedOf(t: JsTest) {
  return t.prints ?? t.returns ?? "";
}

function LevelTask({ level, onResult }: { level: JsLevel; onResult: (correct: boolean) => void }) {
  const [code, setCode] = useState(level.start);
  const runner = useJsRunner();
  const [checked, setChecked] = useState<{ result: JsResult; rows: TestRow[]; outputOk: boolean; ruleFailed: boolean } | null>(null);
  const [checking, setChecking] = useState(false);

  async function check() {
    setChecking(true);
    const r = await runJs(code, (level.tests ?? []).map((t) => t.call));
    setChecking(false);
    const rows = r.error ? [] : testRows(level, r);
    const outputOk = level.output === undefined || r.logs.join("\n").trim() === level.output;
    const allOk = !r.error && outputOk && rows.every((x) => x.ok);
    const ruleOk = level.rule ? level.rule(code) : true;
    setChecked({ result: r, rows, outputOk, ruleFailed: allOk && !ruleOk });
    onResult(allOk && ruleOk);
  }

  const tests = level.tests ?? [];
  const shownTests = tests.slice(0, 2);

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-slate-700">{level.prompt}</div>
      <div className="rounded-2xl bg-slate-50 p-3 text-sm">
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Пример</p>
        {level.output !== undefined && (
          <>
            <p className="mb-1 text-slate-600">Программа должна вывести в консоль:</p>
            <pre className="whitespace-pre-wrap rounded-xl bg-slate-950 px-3 py-2 font-mono text-emerald-200">{level.output || "(ничего)"}</pre>
          </>
        )}
        {shownTests.length > 0 && (
          <div className="space-y-1 font-mono text-[13px]">
            {shownTests.map((t) => (
              <p key={t.call} className="text-slate-700">
                <span className="text-indigo-600">{t.call}</span>
                <span className="text-slate-400">{t.prints !== undefined ? "  выводит  " : "  →  "}</span>
                <b>{expectedOf(t)}</b>
              </p>
            ))}
            {tests.length > shownTests.length && <p className="font-sans text-xs text-slate-400">При проверке функцию вызовут и с другими аргументами.</p>}
          </div>
        )}
      </div>
      <CodeEditor lang="js" value={code} onChange={setCode} onRun={() => runner.run(code)} disabled={!!checked} />
      {!checked && (
        <div className="flex flex-wrap items-center gap-3">
          <RunButton onClick={() => runner.run(code)} disabled={runner.running} />
          <button
            type="button"
            onClick={check}
            disabled={!code.trim() || checking}
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
          <span className="text-xs text-slate-400">Tab — отступ, Ctrl + Enter — запуск</span>
        </div>
      )}
      {checked ? (
        <div className="space-y-3">
          {checked.ruleFailed && level.ruleHint && (
            <p className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800">Ответ верный, но решить нужно по условию: {level.ruleHint}</p>
          )}
          {checked.rows.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left font-mono text-[13px]">
                <thead className="bg-slate-50 font-sans text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-3 py-2">Вызов</th>
                    <th className="px-3 py-2">Нужно</th>
                    <th className="px-3 py-2">Получилось</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {checked.rows.map((x) => (
                    <tr key={x.test.call} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-indigo-600">{x.test.call}</td>
                      <td className="whitespace-pre-wrap px-3 py-2 text-slate-700">{expectedOf(x.test)}</td>
                      <td className={`whitespace-pre-wrap px-3 py-2 ${x.ok ? "text-emerald-700" : "text-rose-600"}`}>{x.got}</td>
                      <td className="px-3 py-2">
                        {x.ok ? <Check className="h-4 w-4 text-emerald-500" strokeWidth={3} /> : <X className="h-4 w-4 text-rose-500" strokeWidth={3} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!checked.outputOk && !checked.result.error && (
            <p className="rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700">Консоль вывела не то, что нужно в примере.</p>
          )}
          <JsTerminal result={checked.result} />
        </div>
      ) : (
        <JsTerminal result={runner.result} running={runner.running} />
      )}
    </div>
  );
}

function Tasks({ id, levels }: { id: TrainerId; levels: JsLevel[] }) {
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
      explain={level.explain}
      onJump={stepper.goTo}
      onNext={stepper.goNext}
      nextClassName="bg-gradient-to-r from-amber-500 to-orange-500"
    >
      <LevelTask key={stepper.index} level={level} onResult={(c) => stepper.markResult(c)} />
    </LevelShell>
  );
}

export type JsTopicData = {
  id: TrainerId;
  /** Each theory block is its own slide with its own reading timer. */
  theory: { title: string; description: string; parts: Part[]; widget?: ReactNode }[];
  game: { title: string; description: string; finish: string; missions: JsMission[] };
  levels: JsLevel[];
  cards: TrueFalseStatement[];
};

export function JsTopicPage({ data }: { data: JsTopicData }) {
  const meta = trainers.find((t) => t.id === data.id)!;
  return (
    <TopicSlider>
      <TrainerHero icon={meta.icon} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      {data.theory.map((t) => (
        <Fragment key={t.title}>
          <SectionHeading kicker="Теория" title={t.title} description={t.description} />
          <div className="mb-10 space-y-5">
            {t.widget}
            <PyTheory parts={t.parts} />
          </div>
        </Fragment>
      ))}
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
      <SectionHeading
        kicker="Практика"
        title="Закрепим"
        description={`${data.levels.length} уровней: пиши функцию, запускай и проверяй — проверка вызовет её с разными аргументами.`}
      />
      <div className="mb-10">
        <Tasks id={data.id} levels={data.levels} />
      </div>
      <SectionHeading kicker="Проверь себя" title="Верно или неверно?" description="Пролистай 10 карточек — угадай, где правда, а где нет." />
      <TrueFalseDeck statements={data.cards} accent={meta.gradient} />
    </TopicSlider>
  );
}
