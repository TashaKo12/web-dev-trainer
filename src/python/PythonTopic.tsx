import { RichText } from "../components/RichText";
import { ResetDraft, useDraft } from "../lib/drafts";
import { useState, type ReactNode } from "react";
import { TopicSlider } from "../components/TopicSlider";
import { TrainerHero } from "../components/TrainerHero";
import { SectionHeading } from "../components/SectionHeading";
import { CompletionBanner } from "../components/CompletionBanner";
import { LevelShell } from "../components/LevelShell";
import { useTaskStepper } from "../components/useTaskStepper";
import { TrueFalseDeck, type TrueFalseStatement } from "../components/TrueFalseDeck";
import { trainers } from "../trainers/registry";
import type { TrainerId } from "../lib/progress";
import { CodeEditor, RunButton, TerminalView, useProgramRunner } from "./CodeTerminal";
import { runPython, sameOutput, type RunResult } from "./interpreter";
import { MissionBoard, MissionFeedback, MissionGoal, RobotSays } from "./MissionBoard";
import { theorySlides, type Part } from "./PythonTheory";

// One Python topic built from data: theory → game missions → practice → true/false cards.
// Missions and practice run the student's code for real; practice checks it with several answers,
// so a program that only prints the expected text does not pass.

export function Code({ children }: { children: ReactNode }) {
  return <code className="rounded bg-slate-100 px-1 font-mono text-[0.92em] text-slate-800">{children}</code>;
}

export type PyMission = {
  title: string;
  body: ReactNode;
  goal: ReactNode;
  start: string;
  /** Runs once the program has finished without errors: true = mission complete, string = hint. */
  check: (r: RunResult, answers: string[], code: string) => true | string;
};

export type PyLevel = {
  badge: string;
  prompt: string;
  start: string;
  tests: { inputs: string[]; expected: string }[];
  /** An extra condition on how it is solved (for example: with a for loop). */
  rule?: (code: string, results: RunResult[]) => boolean;
  ruleHint?: string;
  explain: string;
};

/** Runs the code with test answers and tells whether it printed what was expected. */
export function passes(code: string, tests: { inputs: string[]; expected: string }[]) {
  return tests.every((t) => {
    const r = runPython(code, t.inputs);
    const ok = !r.error && !r.waiting && sameOutput(r.printed, t.expected);
    if (!ok) lastFailure = describeFailure(r, t);
    return ok;
  });
}

const shown = (s: string) => {
  const t = s.replace(/\n+$/, "");
  return `\`\`\`\n${t || "(ничего)"}\n\`\`\``;
};

/** What exactly went wrong, on the data of the check: the names of variables do not matter, only the result does. */
export function describeFailure(r: RunResult, t: { inputs: string[]; expected: string }) {
  const given = t.inputs.length ? `Если ввести ${t.inputs.map((x) => `«${x}»`).join(", ")}, программа` : "Программа";
  const got = r.error
    ? `остановилась с ошибкой ${r.error.type}: ${r.error.message}`
    : r.waiting
      ? "задала больше вопросов, чем нужно по условию"
      : `напечатала:\n${shown(r.printed)}`;
  return `${given} должна напечатать:\n${shown(t.expected)}\nа ${got}`;
}
let lastFailure: string | null = null;

/** Some variable (under any name) is created and then printed. */
export function printsVariable(code: string) {
  const clean = code.replace(/#.*$/gm, "");
  const names = [...clean.matchAll(/(?:^|[\n;])[ \t]*([A-Za-zА-Яа-яЁё_][\wА-Яа-яЁё]*)[ \t]*=(?!=)/g)].map((m) => m[1]);
  return names.some((n) => new RegExp(`(^|[^\\wА-Яа-яЁё])${n}([^\\wА-Яа-яЁё]|$)`).test(codeOnly(code).match(/print\([\s\S]*/)?.[0] ?? "") || clean.includes(`{${n}`));
}
/** The code without comments (texts stay): to see whether a ready answer is written in it. */
export const noComments = (code: string) => code.replace(/#.*$/gm, "");

/** The code without strings and comments — to look for keywords like for or while. */
export const codeOnly = (code: string) => code.replace(/(["'])(?:\\.|(?!\1).)*\1/g, '""').replace(/#.*$/gm, "");
export const uses = (code: string, word: string) => new RegExp(`(^|[^A-Za-zА-Яа-яЁё_])${word}([^A-Za-zА-Яа-яЁё_0-9]|$)`).test(codeOnly(code));

const lastLine = (r: RunResult) => r.printed.replace(/\n$/, "").split("\n").pop() ?? "";

function MissionPlay({ mission, isDone, onComplete, onMistake }: { mission: PyMission; isDone: boolean; onComplete: () => void; onMistake: () => void }) {
  const [code, setCode] = useDraft(mission.start);
  const runner = useProgramRunner();
  const [solved, setSolved] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  function evaluate({ result, answers }: { result: RunResult; answers: string[] }) {
    setHint(null);
    if (result.waiting) return;
    if (result.error) {
      if (!isDone) onMistake();
      return;
    }
    lastFailure = null;
    const verdict = mission.check(result, answers, code);
    if (verdict === true) {
      setSolved(true);
      onComplete();
    } else {
      setHint(lastFailure ? `${lastFailure}\nПодсказка. ${verdict}\nСвои переменные называй как хочешь.` : verdict);
      if (!isDone) onMistake();
    }
  }

  const r = runner.result;
  const speech = !r ? null : r.error ? "…ой, я не понял команду" : r.waiting ? r.prompts[r.prompts.length - 1]?.trim() || "…жду ответа" : lastLine(r) || "Готово!";

  return (
    <div className="space-y-4">
      <div className="space-y-2 text-slate-600">{mission.body}</div>
      <MissionGoal>
        <p className="font-bold">Цель миссии:</p>
        <div className="mt-1">{mission.goal}</div>
      </MissionGoal>
      <RobotSays text={speech} />
      <CodeEditor value={code} onChange={setCode} onRun={() => evaluate(runner.run(code))} />
      <div className="flex flex-wrap items-center gap-3">
        <RunButton onClick={() => evaluate(runner.run(code))} />
        <MissionFeedback solved={solved} isDone={isDone} hint={hint} />
<ResetDraft value={code} start={mission.start} onReset={setCode} />
      </div>
      <TerminalView result={r} onAnswer={(text) => evaluate(runner.answer(text))} />
    </div>
  );
}

/** Every check of a task: what is typed in and what exactly must be printed. */
export function ExpectedList({ tests }: { tests: { inputs: string[]; expected: string }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="text-xs text-slate-500">
          <tr>
            <th className="py-1 pr-4 font-semibold">Если ввести</th>
            <th className="py-1 font-semibold">программа должна напечатать</th>
          </tr>
        </thead>
        <tbody>
          {tests.map((t, i) => (
            <tr key={i} className="border-t border-slate-200 align-top">
              <td className="whitespace-pre-wrap py-1.5 pr-4 font-mono font-bold text-slate-700">{t.inputs.join(", ")}</td>
              <td className="whitespace-pre-wrap py-1.5 font-mono text-slate-700">{t.expected || "(ничего)"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LevelTask({ level, onResult }: { level: PyLevel; onResult: (correct: boolean) => void }) {
  const [code, setCode] = useDraft(level.start);
  const runner = useProgramRunner();
  const [checked, setChecked] = useState<{ result: RunResult; inputs: string[]; failed: string | null } | null>(null);
  const [ruleNote, setRuleNote] = useState(false);

  function check() {
    const results = level.tests.map((t) => runPython(code, t.inputs));
    const passed = results.map((r, i) => !r.error && !r.waiting && sameOutput(r.printed, level.tests[i].expected));
    const failing = passed.indexOf(false);
    const ruleOk = level.rule ? level.rule(code, results) : true;
    const shown = failing === -1 ? 0 : failing;
    // the result is right, only the way is not the one of the task: not a mistake — let the student rewrite it
    if (failing === -1 && !ruleOk) return setRuleNote(true);
    setRuleNote(false);
    setChecked({ result: results[shown], inputs: level.tests[shown].inputs, failed: failing === -1 ? null : describeFailure(results[shown], level.tests[shown]) });
    onResult(failing === -1);
  }

  const sample = level.tests[0];
  const asks = sample.inputs.length > 0;

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-slate-700">{level.prompt}</p>
      {level.ruleHint && <p className="text-sm text-slate-600"><b>Условие:</b> {level.ruleHint}</p>}
      <div className="rounded-2xl bg-slate-50 p-3 text-sm">
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Что должно получиться</p>
        {asks ? (
          <ExpectedList tests={level.tests} />
        ) : (
          <>
            <p className="mb-1 mt-1 text-slate-600">Программа должна напечатать:</p>
            <pre className="whitespace-pre-wrap rounded-xl bg-slate-950 px-3 py-2 font-mono text-emerald-200">{sample.expected || "(ничего)"}</pre>
          </>
        )}
      </div>
      <CodeEditor value={code} onChange={setCode} onRun={() => runner.run(code)} disabled={!!checked} />
      {!checked && (
        <div className="flex flex-wrap items-center gap-3">
          <RunButton onClick={() => runner.run(code)} />
          <button
            type="button"
            onClick={check}
            disabled={!code.trim()}
            className="rounded-full bg-gradient-to-r from-violet-500 to-sky-500 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
          <span className="text-xs text-slate-400">{asks ? "Проверка запустит программу с разными ответами. Имена переменных — любые." : "Проверяется результат программы. Имена переменных — любые."}</span>
        </div>
      )}
      {ruleNote && !checked && (
        <p className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800">
          Результат верный! Осталось выполнить условие: {level.ruleHint ?? "прочитай задание ещё раз."} Исправь и проверь снова — это не ошибка.
        </p>
      )}
      {checked ? (
        <div className="space-y-2">
          {checked.failed && <div className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800"><RichText text={checked.failed} /></div>}
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            {checked.inputs.length ? `Проверка с ответами: ${checked.inputs.join(", ")}` : "Результат проверки"}
          </p>
          <TerminalView result={checked.result} />
        </div>
      ) : (
        <TerminalView result={runner.result} onAnswer={(t) => runner.answer(t)} />
      )}
    </div>
  );
}

function Tasks({ id, levels }: { id: TrainerId; levels: PyLevel[] }) {
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
      explain={
        <>
          <b>Пример решения</b> (свои переменные можно назвать иначе):
          <RichText text={level.explain} />
        </>
      }
      onJump={stepper.goTo}
      onNext={stepper.goNext}
      nextClassName="bg-gradient-to-r from-violet-500 to-sky-500"
    >
      <LevelTask key={stepper.index} level={level} onResult={(c) => stepper.markResult(c)} />
    </LevelShell>
  );
}

export type PythonTopicData = {
  id: TrainerId;
  theory: { title: string; description: string; parts: Part[] };
  game: { title: string; description: string; finish: string; missions: PyMission[] };
  levels: PyLevel[];
  cards: TrueFalseStatement[];
};

export function PythonTopicPage({ data }: { data: PythonTopicData }) {
  const meta = trainers.find((t) => t.id === data.id)!;
  return (
    <TopicSlider>
      <TrainerHero icon={meta.icon} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      {theorySlides(data.theory.title, data.theory.description, data.theory.parts)}
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
        description={`${data.levels.length} уровней: пиши программу, запускай её и проверяй — проверка прогонит код с разными ответами.`}
      />
      <div className="mb-10">
        <Tasks id={data.id} levels={data.levels} />
      </div>
      <SectionHeading kicker="Проверь себя" title="Верно или неверно?" description={`Пролистай ${data.cards.length} карточек — угадай, где правда, а где нет.`} />
      <TrueFalseDeck statements={data.cards} accent={meta.gradient} />
    </TopicSlider>
  );
}
