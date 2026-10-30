import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "opacity")!;

function Theory() {
  const [opacity, setOpacity] = useState(1);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-6 text-slate-600">
        <code className="rounded bg-slate-100 px-1">opacity</code> управляет прозрачностью элемента — от 0
        (полностью невидим) до 1 (полностью непрозрачен). В отличие от удаления элемента, место под ним
        остаётся занятым.
      </p>
      <div className="grid gap-5 sm:grid-cols-[1fr_1.2fr]">
        <label className="block">
          <span className="mb-1 flex justify-between text-sm font-bold text-pink-700">
            <span>opacity</span>
            <span>{opacity}</span>
          </span>
          <input type="range" min={0} max={1} step={0.1} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full accent-pink-600" />
        </label>
        <div
          style={{
            backgroundImage: "repeating-conic-gradient(#e2e8f0 0 25%, white 0 50%)",
            backgroundSize: "20px 20px",
          }}
          className="flex items-center justify-center rounded-2xl p-6"
        >
          <div style={{ opacity }} className="flex h-20 w-32 items-center justify-center rounded-xl bg-pink-500 text-sm font-bold text-white">
            Карточка
          </div>
        </div>
      </div>
    </div>
  );
}

function McqLevel({ options, correctIndex, onResult }: { options: string[]; correctIndex: number; onResult: (correct: boolean) => void }) {
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(choice === correctIndex);
  }

  return (
    <div>
      <McqOptions options={options} selected={choice} onSelect={(i) => !checked && setChoice(i)} disabled={checked} />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={choice === null}
            className="rounded-full bg-gradient-to-r from-pink-500 to-rose-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function MatchLevel({ target, onResult }: { target: number; onResult: (correct: boolean) => void }) {
  const [value, setValue] = useState(1);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(Math.abs(value - target) <= 0.1);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Подвинь ползунок, чтобы прозрачность совпала с образцом.</p>
      <div className="mb-3 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Образец</p>
          <div style={{ opacity: target }} className="flex h-16 items-center justify-center rounded-xl bg-pink-500 text-xs font-bold text-white">
            Карточка
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Твоя карточка</p>
          <div style={{ opacity: value }} className="flex h-16 items-center justify-center rounded-xl bg-pink-500 text-xs font-bold text-white">
            Карточка
          </div>
        </div>
      </div>
      <input type="range" min={0} max={1} step={0.1} value={value} onChange={(e) => !checked && setValue(Number(e.target.value))} disabled={checked} className="w-full accent-pink-600" />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            className="rounded-full bg-gradient-to-r from-pink-500 to-rose-600 px-5 py-2 text-sm font-bold text-white shadow"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const TASK_META = [
  { badge: "выбери из списка", prompt: "Какое значение opacity делает элемент ПОЛНОСТЬЮ невидимым (но место под ним остаётся занятым)?", explain: "0 — полная прозрачность. Элемент не виден, но всё ещё занимает место в макете (в отличие от display: none)." },
  { badge: "подбери значение", prompt: "", explain: "0.5 — ровно половинная прозрачность, элемент виден наполовину." },
];

function Tasks() {
  const stepper = useTaskStepper(2, "opacity");
  const task = stepper.index;
  const meta = TASK_META[task];

  if (stepper.allAnswered) {
    return <CompletionBanner score={stepper.score} total={2} onRestart={() => stepper.restart()} />;
  }

  return (
    <LevelShell
      total={2}
      index={task}
      statuses={stepper.statuses}
      status={stepper.status}
      isLast={stepper.isLast}
      badge={meta.badge}
      explain={meta.explain}
      onJump={stepper.goTo}
      onNext={stepper.goNext}
      nextClassName="bg-gradient-to-r from-pink-500 to-rose-600"
    >
      {task === 0 && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <McqLevel key={task} options={["0", "0.5", "1", "100"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <MatchLevel key={task} target={0.5} onResult={(c) => stepper.markResult(c)} />}
    </LevelShell>
  );
}

export function OpacityTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="Прозрачность блока"
        description="opacity: от 0 (невидимо) до 1 (полностью видно) — место под элементом остаётся занятым."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="2 уровня — выбирай и подбирай значение." />
      <Tasks />
    </div>
  );
}
