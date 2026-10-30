import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "grid")!;

const CARDS = ["🍕", "🍔", "🍟", "🌮", "🍩", "🍦"];

const COLUMNS = ["1fr", "1fr 1fr", "1fr 1fr 1fr", "repeat(4, 1fr)"] as const;

function Theory() {
  const [columns, setColumns] = useState<(typeof COLUMNS)[number]>("1fr 1fr 1fr");
  const [gap, setGap] = useState(12);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-6 text-slate-600">
        <code className="rounded bg-slate-100 px-1">display: grid</code> + <code className="rounded bg-slate-100 px-1">grid-template-columns</code> расставляет
        карточки в ровную сетку из колонок. gap задаёт промежуток между ними.
      </p>
      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {COLUMNS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColumns(c)}
              className={`rounded-full border-2 px-3 py-1.5 font-mono text-xs font-bold transition ${
                columns === c ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="block text-sm">
          <span className="mb-1 flex justify-between font-bold text-emerald-700">
            <span>gap</span>
            <span>{gap}px</span>
          </span>
          <input type="range" min={0} max={30} value={gap} onChange={(e) => setGap(Number(e.target.value))} className="w-full accent-emerald-600" />
        </label>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: columns, gap }} className="rounded-2xl bg-slate-50 p-4">
        {CARDS.map((c) => (
          <div key={c} className="flex h-16 items-center justify-center rounded-xl bg-white text-2xl shadow-inner">
            {c}
          </div>
        ))}
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
            className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function ColumnsMatchLevel({ target, onResult }: { target: string; onResult: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(selected === target);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Выбери grid-template-columns так, чтобы получилось РОВНО 2 колонки.</p>
      <div style={{ display: "grid", gridTemplateColumns: selected ?? "1fr", gap: 10 }} className="mb-3 rounded-2xl bg-slate-50 p-4">
        {CARDS.map((c) => (
          <div key={c} className="flex h-14 items-center justify-center rounded-xl bg-white text-xl shadow-inner">
            {c}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {COLUMNS.map((c) => (
          <button
            key={c}
            type="button"
            disabled={checked}
            onClick={() => setSelected(c)}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition disabled:cursor-not-allowed ${
              selected === c ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-emerald-100"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!selected}
            className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const TASK_META = [
  { badge: "выбери из списка", prompt: "Какое свойство превращает элемент в сетку, расставляющую детей по рядам и колонкам?", explain: "display: grid — включает Grid-раскладку для контейнера." },
  { badge: "подбери колонки", prompt: "", explain: "1fr 1fr — две равные колонки (по одной дробной части каждая)." },
  { badge: "выбери из списка", prompt: "Чем принципиально отличается grid от flexbox?", explain: "flexbox выстраивает элементы в ОДНУ линию (строку или колонку), а grid сразу управляет и строками, и колонками одновременно — настоящая двумерная сетка." },
];

function Tasks() {
  const stepper = useTaskStepper(3, "grid");
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
      nextClassName="bg-gradient-to-r from-emerald-500 to-teal-600"
    >
      {(task === 0 || task === 2) && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <McqLevel key={task} options={["display: grid", "display: flex", "position: grid", "grid: true"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <ColumnsMatchLevel key={task} target="1fr 1fr" onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && (
        <McqLevel
          key={task}
          mono={false}
          options={["Ничем, это одно и то же", "grid управляет строками и колонками сразу, flexbox — только одной линией", "grid работает только в HTML-таблицах", "flexbox новее grid"]}
          correctIndex={1}
          onResult={(c) => stepper.markResult(c)}
        />
      )}
    </LevelShell>
  );
}

export function GridTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="Сетка из карточек"
        description="grid-template-columns задаёт колонки, gap — промежуток между ячейками."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="3 уровня — выбирай и подбирай колонки." />
      <Tasks />
    </div>
  );
}
