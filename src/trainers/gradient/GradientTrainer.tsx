import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "gradient")!;

const DIRECTIONS = ["to right", "to left", "to bottom", "135deg"] as const;

function Theory() {
  const [dir, setDir] = useState<(typeof DIRECTIONS)[number]>("to right");
  const [c1, setC1] = useState("#f97316");
  const [c2, setC2] = useState("#ec4899");

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-6 text-slate-600">
        <code className="rounded bg-slate-100 px-1">linear-gradient()</code> — это значение для
        background-image, которое плавно перетекает из одного цвета в другой вместо обычного фото.
      </p>
      <div className="grid gap-5 sm:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {DIRECTIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDir(d)}
                className={`rounded-full border-2 px-3 py-1.5 font-mono text-xs font-bold transition ${
                  dir === d ? "border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700" : "border-slate-200 text-slate-500"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input type="color" value={c1} onChange={(e) => setC1(e.target.value)} className="h-9 w-9 rounded-full border-2 border-white shadow" />
            <input type="color" value={c2} onChange={(e) => setC2(e.target.value)} className="h-9 w-9 rounded-full border-2 border-white shadow" />
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 font-mono text-xs text-slate-600">
            background-image: linear-gradient({dir}, {c1}, {c2});
          </div>
        </div>
        <div style={{ backgroundImage: `linear-gradient(${dir}, ${c1}, ${c2})` }} className="h-40 w-full rounded-2xl" />
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
      <McqOptions mono={false} options={options} selected={choice} onSelect={(i) => !checked && setChoice(i)} disabled={checked} />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={choice === null}
            className="rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function DirectionMatchLevel({ target, onResult }: { target: string; onResult: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(selected === target);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Подбери направление так, чтобы твой градиент совпал с образцом.</p>
      <div className="mb-3 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Образец</p>
          <div style={{ backgroundImage: `linear-gradient(${target}, #f97316, #ec4899)` }} className="h-20 rounded-xl" />
        </div>
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Твой градиент</p>
          <div style={{ backgroundImage: `linear-gradient(${selected ?? "to right"}, #f97316, #ec4899)` }} className="h-20 rounded-xl" />
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {DIRECTIONS.map((d) => (
          <button
            key={d}
            type="button"
            disabled={checked}
            onClick={() => setSelected(d)}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition disabled:cursor-not-allowed ${
              selected === d ? "bg-fuchsia-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-fuchsia-100"
            }`}
          >
            {d}
          </button>
        ))}
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!selected}
            className="rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const TASK_META = [
  { badge: "выбери из списка", prompt: "Какое CSS-свойство принимает значение linear-gradient(...)?", explain: "background-image — градиент технически является особым значением именно этого свойства, хотя и не картинка в привычном смысле." },
  { badge: "подбери направление", prompt: "", explain: "to bottom — переход цветов сверху вниз." },
];

function Tasks() {
  const stepper = useTaskStepper(2, "gradient");
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
      nextClassName="bg-gradient-to-r from-fuchsia-500 to-pink-600"
    >
      {task === 0 && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <McqLevel key={task} options={["background-image", "background-color", "color", "border-image"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <DirectionMatchLevel key={task} target="to bottom" onResult={(c) => stepper.markResult(c)} />}
    </LevelShell>
  );
}

export function GradientTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="Плавный переход цветов"
        description="linear-gradient(направление, цвет1, цвет2) — градиент вместо обычной картинки."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="2 уровня — выбирай и подбирай направление." />
      <Tasks />
    </div>
  );
}
