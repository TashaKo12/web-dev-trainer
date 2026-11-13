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
    return !r.error && !r.waiting && sameOutput(r.printed, t.expected);
  });
}

/** The code without strings and comments — to look for keywords like for or while. */
export const codeOnly = (code: string) => code.replace(/(["'])(?:\\.|(?!\1).)*\1/g, '""').replace(/#.*$/gm, "");
export const uses = (code: string, word: string) => new RegExp(`(^|[^A-Za-zА-Яа-яЁё_])${word}([^A-Za-zА-Яа-яЁё_0-9]|$)`).test(codeOnly(code));

const lastLine = (r: RunResult) => r.printed.replace(/\n$/, "").split("\n").pop() ?? "";

function MissionPlay({ mission, isDone, onComplete, onMistake }: { mission: PyMission; isDone: boolean; onComplete: () => void; onMistake: () => void }) {
  const [code, setCode] = useState(mission.start);
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
    const verdict = mission.check(result, answers, code);
    if (verdict === true) {
      setSolved(true);
      onComplete();
    } else {
      setHint(verdict);
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
      </div>
      <TerminalView result={r} onAnswer={(text) => evaluate(runner.answer(text))} />
    </div>
  );
}

function LevelTask({ level, onResult }: { level: PyLevel; onResult: (correct: boolean) => void }) {
  const [code, setCode] = useState(level.start);
  const runner = useProgramRunner();
  const [checked, setChecked] = useState<{ result: RunResult; inputs: string[]; ruleFailed: boolean } | null>(null);

  function check() {
    const results = level.tests.map((t) => runPython(code, t.inputs));
    const passed = results.map((r, i) => !r.error && !r.waiting && sameOutput(r.printed, level.tests[i].expected));
    const failing = passed.indexOf(false);
    const ruleOk = level.rule ? level.rule(code, results) : true;
    const shown = failing === -1 ? 0 : failing;
    setChecked({ result: results[shown], inputs: level.tests[shown].inputs, ruleFailed: failing === -1 && !ruleOk });
    onResult(failing === -1 && ruleOk);
  }

  const sample = level.tests[0];
  const asks = sample.inputs.length > 0;

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-slate-700">{level.prompt}</p>
      <div className="rounded-2xl bg-slate-50 p-3 text-sm">
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Пример</p>
        {asks && (
          <p className="text-slate-600">
            Если ответить: <b className="font-mono">{sample.inputs.join(", ")}</b>
          </p>
        )}
        <p className="mb-1 mt-1 text-slate-600">Программа должна напечатать:</p>
        <pre className="whitespace-pre-wrap rounded-xl bg-slate-950 px-3 py-2 font-mono text-emerald-200">{sample.expected || "(ничего)"}</pre>
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
          <span className="text-xs text-slate-400">{asks ? "Проверка запустит программу с разными ответами" : "Tab — отступ, Ctrl + Enter — запуск"}</span>
        </div>
      )}
      {checked ? (
        <div className="space-y-2">
          {checked.ruleFailed && level.ruleHint && (
            <p className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800">Ответ верный, но решить нужно по условию: {level.ruleHint}</p>
          )}
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
      explain={level.explain}
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
      <SectionHeading kicker="Проверь себя" title="Верно или неверно?" description="Пролистай 10 карточек — угадай, где правда, а где нет." />
      <TrueFalseDeck statements={data.cards} accent={meta.gradient} />
    </TopicSlider>
  );
}
