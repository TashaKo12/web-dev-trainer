import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "reset-box-sizing")!;

function Theory() {
  const [reset, setReset] = useState(false);
  const [borderBox, setBorderBox] = useState(false);
  const contentW = 160;
  const padding = 20;
  const border = 4;
  const renderedW = borderBox ? contentW : contentW + padding * 2 + border * 2;

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-6 text-slate-600">
        <code className="rounded bg-slate-100 px-1">* {"{"} margin: 0; padding: 0; {"}"}</code> убирает отступы,
        которые браузер ставит по умолчанию (у h1, p, ul и других). А{" "}
        <code className="rounded bg-slate-100 px-1">box-sizing: border-box</code> меняет саму формулу расчёта
        ширины — padding и border перестают ДОБАВЛЯТЬСЯ сверх заданной ширины.
      </p>

      <div className="mb-4 space-y-2">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
          <input type="checkbox" checked={reset} onChange={(e) => setReset(e.target.checked)} />
          * {"{"} margin: 0; padding: 0; {"}"}
        </label>
        <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
          <input type="checkbox" checked={borderBox} onChange={(e) => setBorderBox(e.target.checked)} />
          box-sizing: border-box
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="mb-2 text-xs font-bold uppercase text-slate-400">Отступы по умолчанию</p>
          <div className="rounded-lg border-2 border-dashed border-slate-300 bg-white">
            <h3 style={reset ? { margin: 0 } : undefined} className="bg-amber-100 font-bold">
              Заголовок
            </h3>
            <p style={reset ? { margin: 0 } : undefined} className="bg-sky-100">
              Абзац текста
            </p>
          </div>
          <p className="mt-2 text-xs text-slate-400">{reset ? "Отступы убраны — блоки прилипли друг к другу." : "У браузера есть свои умолчания margin, из-за них между блоками щели."}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="mb-2 text-xs font-bold uppercase text-slate-400">
            width: {contentW}px + padding {padding}px + border {border}px
          </p>
          <div style={{ width: renderedW }} className="flex items-center justify-center rounded-lg bg-orange-100" >
            <div style={{ padding, border: `${border}px solid #f97316` }} className="w-full bg-white text-center text-xs font-bold text-slate-500">
              блок
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400">Фактическая ширина на экране: {renderedW}px</p>
        </div>
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
            className="rounded-full bg-gradient-to-r from-slate-500 to-slate-700 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function WidthPredictLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [answer, setAnswer] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const contentW = 100;
  const padding = 20;
  const border = 5;

  function check() {
    setChecked(true);
    onResult(answer === contentW);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        У блока <code className="rounded bg-slate-100 px-1">width: 100px; padding: 20px; border: 5px;</code> и уже
        включён <code className="rounded bg-slate-100 px-1">box-sizing: border-box</code>. Какой будет ИТОГОВАЯ
        ширина блока на экране?
      </p>
      <div style={{ width: contentW, padding, border: `${border}px solid #475569`, boxSizing: "border-box" }} className="mb-4 bg-white text-center text-xs text-slate-500">
        блок
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {[100, 130, 150, 180].map((n) => (
          <button
            key={n}
            type="button"
            disabled={checked}
            onClick={() => setAnswer(n)}
            className={`rounded-lg px-4 py-1.5 font-mono text-sm font-bold transition disabled:cursor-not-allowed ${
              answer === n ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {n}px
          </button>
        ))}
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={answer === null}
            className="rounded-full bg-gradient-to-r from-slate-500 to-slate-700 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const TASK_META = [
  { badge: "выбери из списка", prompt: "Какой селектор означает «применить это правило вообще ко ВСЕМ элементам страницы»?", explain: "* — универсальный селектор, выбирает каждый элемент без исключения." },
  { badge: "посчитай ширину", prompt: "", explain: "С border-box padding и border «съедаются» изнутри заданной ширины — она остаётся ровно 100px, какой бы padding/border ни был." },
  { badge: "выбери из списка", prompt: "Без box-sizing: border-box (по умолчанию, content-box) итоговая ширина блока с padding и border будет...", explain: "...больше заданного width — padding и border добавляются ПОВЕРХ него. Именно поэтому border-box так часто включают глобально через *." },
];

function Tasks() {
  const stepper = useTaskStepper(3, "reset-box-sizing");
  const task = stepper.index;
  const meta = TASK_META[task];

  if (stepper.allAnswered) {
    return <CompletionBanner score={stepper.score} total={3} onRestart={() => stepper.restart()} />;
  }

  return (
    <LevelShell
      total={3}
      index={task}
      statuses={stepper.statuses}
      status={stepper.status}
      isLast={stepper.isLast}
      badge={meta.badge}
      explain={meta.explain}
      onJump={stepper.goTo}
      onNext={stepper.goNext}
      nextClassName="bg-gradient-to-r from-slate-500 to-slate-700"
    >
      {(task === 0 || task === 2) && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <McqLevel key={task} options={["*", "all", "html", "."]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <WidthPredictLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && <McqLevel key={task} mono={false} options={["такой же, как width", "больше заданного width", "меньше заданного width", "всегда 100%"]} correctIndex={1} onResult={(c) => stepper.markResult(c)} />}
    </LevelShell>
  );
}

export function ResetBoxSizingTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="Сброс умолчаний браузера"
        description="* обнуляет отступы по умолчанию, box-sizing: border-box меняет формулу расчёта ширины блока."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="3 уровня — выбирай и считай ширину." />
      <Tasks />
    </div>
  );
}
