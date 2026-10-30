import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "transitions")!;

function Theory() {
  const [duration, setDuration] = useState(0.3);
  const [hover, setHover] = useState(false);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-6 text-slate-600">
        <code className="rounded bg-slate-100 px-1">transition</code> делает ПЕРЕХОД между состояниями плавным —
        например, когда цвет или размер меняются при :hover, вместо мгновенного скачка.
      </p>
      <label className="mb-4 block text-sm">
        <span className="mb-1 flex justify-between font-bold text-amber-700">
          <span>transition-duration</span>
          <span>{duration}s</span>
        </span>
        <input type="range" min={0} max={1} step={0.1} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full accent-amber-600" />
      </label>
      <div className="flex items-center justify-center rounded-2xl bg-slate-100 p-8">
        <button
          type="button"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            transition: `all ${duration}s`,
            transform: hover ? "scale(1.15)" : "scale(1)",
            background: hover ? "#f59e0b" : "#1e293b",
          }}
          className="rounded-xl px-6 py-3 text-sm font-bold text-white"
        >
          Наведи курсор
        </button>
      </div>
    </div>
  );
}

function McqLevel({ options, correctIndex, mono = true, onResult }: { options: string[]; correctIndex: number; mono?: boolean; onResult: (correct: boolean) => void }) {
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(choice === correctIndex);
  }

  return (
    <div>
      <McqOptions options={options} selected={choice} onSelect={(i) => !checked && setChoice(i)} disabled={checked} mono={mono} />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={choice === null}
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function CompareLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [picked, setPicked] = useState<"smooth" | "instant" | null>(null);
  const [checked, setChecked] = useState(false);
  const [hoverA, setHoverA] = useState(false);
  const [hoverB, setHoverB] = useState(false);

  function check() {
    setChecked(true);
    onResult(picked === "smooth");
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Наведи курсор на обе карточки. У какой из них переход цвета ПЛАВНЫЙ (с transition)?</p>
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div
          onMouseEnter={() => setHoverA(true)}
          onMouseLeave={() => setHoverA(false)}
          onClick={() => !checked && setPicked("instant")}
          style={{ background: hoverA ? "#f59e0b" : "#cbd5e1", transition: "none" }}
          className={`flex h-20 cursor-pointer items-center justify-center rounded-xl text-sm font-bold text-white ${picked === "instant" ? "ring-2 ring-amber-500" : ""}`}
        >
          Карточка A
        </div>
        <div
          onMouseEnter={() => setHoverB(true)}
          onMouseLeave={() => setHoverB(false)}
          onClick={() => !checked && setPicked("smooth")}
          style={{ background: hoverB ? "#f59e0b" : "#cbd5e1", transition: "background 0.5s" }}
          className={`flex h-20 cursor-pointer items-center justify-center rounded-xl text-sm font-bold text-white ${picked === "smooth" ? "ring-2 ring-amber-500" : ""}`}
        >
          Карточка Б
        </div>
      </div>
      <p className="mb-3 text-center text-sm text-slate-500">Кликни на ту карточку, у которой переход плавный.</p>
      {!checked && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!picked}
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const TASK_META = [
  { badge: "наведи и сравни", prompt: "", explain: "У карточки Б задан transition: background 0.5s — поэтому цвет меняется плавно, а не скачком, как у карточки А." },
  { badge: "выбери из списка", prompt: "transition анимирует переход между какими состояниями?", explain: "Между двумя СОСТОЯНИЯМИ элемента (например, обычным и :hover) — а не бесконечный цикл, как у @keyframes-анимации." },
];

function Tasks() {
  const stepper = useTaskStepper(2, "transitions");
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
      nextClassName="bg-gradient-to-r from-amber-500 to-orange-600"
    >
      {task === 1 && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <CompareLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && (
        <McqLevel
          key={task}
          mono={false}
          options={["Между двумя состояниями элемента (например, обычным и :hover)", "Между двумя разными страницами сайта", "Между двумя HTML-файлами", "Между цветами всей страницы сразу"]}
          correctIndex={0}
          onResult={(c) => stepper.markResult(c)}
        />
      )}
    </LevelShell>
  );
}

export function TransitionsTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="Плавные переходы"
        description="transition сглаживает смену состояний — например, цвета или размера при наведении."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="2 уровня — сравнивай вживую и выбирай." />
      <Tasks />
    </div>
  );
}
