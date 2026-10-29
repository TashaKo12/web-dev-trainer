import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "box-model")!;

function Theory() {
  const [margin, setMargin] = useState(16);
  const [border, setBorder] = useState(4);
  const [padding, setPadding] = useState(12);
  const contentW = 120;
  const contentH = 60;

  const borderBoxW = contentW + padding * 2 + border * 2;
  const totalFootprintW = borderBoxW + margin * 2;

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-6 text-slate-600">
        Подвигай ползунки — размеры слоёв реально поменяются, как в настоящем
        CSS. Каждый блок состоит из содержимого, отступа внутри (padding),
        рамки (border) и отступа снаружи (margin).
      </p>

      <div className="grid gap-8 sm:grid-cols-[1fr_auto]">
        <div className="space-y-5">
          <Slider label="margin (снаружи)" color="text-amber-600" value={margin} max={40} onChange={setMargin} />
          <Slider label="border (рамка)" color="text-orange-700" value={border} max={16} onChange={setBorder} />
          <Slider label="padding (внутри)" color="text-sky-600" value={padding} max={40} onChange={setPadding} />

          <div className="rounded-2xl bg-slate-50 p-4 font-mono text-sm text-slate-600">
            ширина блока с рамкой = {contentW} + 2×{padding} + 2×{border} ={" "}
            <span className="font-bold text-slate-800">{borderBoxW}px</span>
            <br />
            занимаемое место (с margin) = {borderBoxW} + 2×{margin} ={" "}
            <span className="font-bold text-slate-800">{totalFootprintW}px</span>
          </div>
        </div>

        <div className="flex items-center justify-center overflow-auto rounded-2xl bg-slate-100 p-6">
          <div
            style={{ padding: margin }}
            className="rounded-sm border border-dashed border-amber-400 bg-amber-50"
          >
            <div
              style={{ borderWidth: border }}
              className="border-solid border-orange-400 bg-orange-100"
            >
              <div style={{ padding }} className="bg-sky-100">
                <div
                  style={{ width: contentW, height: contentH }}
                  className="flex items-center justify-center bg-white text-center text-xs font-bold text-slate-500"
                >
                  content
                  <br />
                  {contentW}×{contentH}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  color,
  value,
  max,
  onChange,
}: {
  label: string;
  color: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className={`mb-1 flex justify-between text-sm font-bold ${color}`}>
        <span>{label}</span>
        <span>{value}px</span>
      </span>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-current"
      />
    </label>
  );
}

function LayerClickTask({ onResult }: { onResult: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  function pick(layer: string) {
    if (checked) return;
    setSelected(layer);
  }

  function check() {
    setChecked(true);
    onResult(selected === "padding");
  }

  const layers = [
    { id: "margin", label: "margin", cls: "bg-amber-50 border-2 border-dashed border-amber-400" },
    { id: "border", label: "border", cls: "bg-orange-100 border-2 border-orange-400" },
    { id: "padding", label: "padding", cls: "bg-sky-100" },
    { id: "content", label: "content", cls: "bg-white" },
  ];

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        Нажми на тот слой диаграммы, который называется <strong>padding</strong>.
      </p>
      <div className="flex justify-center">
        <div className={`${layers[0].cls} p-5`} onClick={() => pick("margin")}>
          <div className={`${layers[1].cls} p-3`} onClick={(e) => { e.stopPropagation(); pick("border"); }}>
            <div className={`${layers[2].cls} p-4`} onClick={(e) => { e.stopPropagation(); pick("padding"); }}>
              <div
                className={`${layers[3].cls} flex h-14 w-28 items-center justify-center text-xs font-bold text-slate-400`}
                onClick={(e) => {
                  e.stopPropagation();
                  pick("content");
                }}
              >
                content
              </div>
            </div>
          </div>
        </div>
      </div>
      {selected && (
        <p className="mt-3 text-center text-sm font-bold text-indigo-600">
          Выбрано: {selected} {checked && (selected === "padding" ? "✅" : "❌")}
        </p>
      )}
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!selected}
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
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
      <McqOptions options={options} selected={choice} onSelect={(i) => !checked && setChoice(i)} disabled={checked} mono={options[0].length < 12} />
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

function TargetWidthTask({ onResult }: { onResult: (correct: boolean) => void }) {
  const [padding, setPadding] = useState(0);
  const [border, setBorder] = useState(0);
  const [checked, setChecked] = useState(false);
  const contentW = 100;
  const target = 130;
  const width = contentW + padding * 2 + border * 2;

  function check() {
    setChecked(true);
    onResult(width === target);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        content = {contentW}px. Подвинь padding и border так, чтобы итоговая ширина блока (с рамкой, без margin)
        стала ровно <strong>{target}px</strong>. Подходит любая комбинация значений.
      </p>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="space-y-4">
          <Slider label="padding" color="text-sky-600" value={padding} max={40} onChange={(v) => !checked && setPadding(v)} />
          <Slider label="border" color="text-orange-700" value={border} max={20} onChange={(v) => !checked && setBorder(v)} />
          <div className={`rounded-xl p-3 text-center font-mono text-sm font-bold ${width === target ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-600"}`}>
            {contentW} + 2×{padding} + 2×{border} = {width}px {width === target && "✅"}
          </div>
        </div>
        <div className="flex items-center justify-center rounded-2xl bg-slate-100 p-4">
          <div style={{ borderWidth: border }} className="border-solid border-orange-400 bg-orange-100">
            <div style={{ padding }} className="bg-sky-100">
              <div style={{ width: contentW, height: 50 }} className="flex items-center justify-center bg-white text-xs font-bold text-slate-500">
                content
              </div>
            </div>
          </div>
        </div>
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-sm font-bold text-white shadow"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const ORDER_CORRECT = ["content", "padding", "border", "margin"];
const ORDER_POOL = ["border", "content", "margin", "padding"];

function LayerOrderTask({ onResult }: { onResult: (correct: boolean) => void }) {
  const [seq, setSeq] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  function pick(label: string) {
    if (checked || seq.includes(label)) return;
    setSeq((s) => [...s, label]);
  }

  function check() {
    setChecked(true);
    onResult(seq.join(",") === ORDER_CORRECT.join(","));
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Кликай по слоям в порядке ОТ СОДЕРЖИМОГО НАРУЖУ.</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {ORDER_POOL.map((label) => (
          <button
            key={label}
            type="button"
            disabled={checked || seq.includes(label)}
            onClick={() => pick(label)}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-600 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mb-4 flex min-h-[2.5rem] flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3 font-mono text-sm">
        {seq.length === 0 && <span className="text-slate-300">кликай по слоям выше…</span>}
        {seq.map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            {i > 0 && <span className="text-slate-300">→</span>}
            <span className={checked ? (s === ORDER_CORRECT[i] ? "font-bold text-emerald-600" : "font-bold text-rose-500") : "font-bold text-indigo-600"}>{s}</span>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-4">
        {!checked && seq.length > 0 && (
          <button type="button" onClick={() => setSeq([])} className="text-xs font-semibold text-slate-400 underline">
            Сбросить
          </button>
        )}
        {!checked && (
          <button
            type="button"
            onClick={check}
            disabled={seq.length < 4}
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        )}
      </div>
    </div>
  );
}

const TASK_META = [
  { badge: "выбери из списка", prompt: "Какое свойство создаёт пространство МЕЖДУ рамкой (border) и содержимым внутри блока?", explain: "padding — внутренний отступ, он раздвигает содержимое от рамки блока." },
  { badge: "выбери из списка", prompt: "Какое свойство создаёт пространство СНАРУЖИ блока — между ним и соседними элементами?", explain: "margin — внешний отступ, он отодвигает блок от других элементов на странице." },
  { badge: "подвинь ползунки", prompt: "", explain: "Подходит любая пара значений, где padding + border = 15 — например 10 и 5, или 0 и 15." },
  { badge: "кликай по порядку", prompt: "", explain: "Правильный порядок: content → padding → border → margin — от центра наружу." },
  { badge: "кликни по диаграмме", prompt: "", explain: "padding находится сразу вокруг содержимого, внутри рамки (border)." },
];

function Tasks() {
  const stepper = useTaskStepper(5, "box-model");
  const task = stepper.index;
  const meta = TASK_META[task];

  if (stepper.allAnswered) {
    return <CompletionBanner score={stepper.score} total={5} onRestart={() => stepper.restart()} />;
  }

  return (
    <LevelShell
      total={5}
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
      {meta.prompt && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <McqLevel key={task} options={["margin", "padding", "border", "gap"]} correctIndex={1} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <McqLevel key={task} options={["padding", "border", "margin", "outline"]} correctIndex={2} onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && <TargetWidthTask key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 3 && <LayerOrderTask key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 4 && <LayerClickTask key={task} onResult={(c) => stepper.markResult(c)} />}
    </LevelShell>
  );
}

export function BoxModelTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} />
      <SectionHeading
        kicker="Теория"
        title="Подвигай слои блока"
        description="margin, border и padding — три слоя вокруг содержимого. Меняй значения и смотри, как складывается итоговый размер."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="5 уровней — выбирай, двигай ползунки и кликай по диаграмме." />
      <Tasks />
    </div>
  );
}
