import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "border")!;

const STYLES = ["solid", "dashed", "dotted", "double"] as const;

function Box({ width = 4, style = "solid", color = "#f97316", bottomOnly = false }: { width?: number; style?: string; color?: string; bottomOnly?: boolean }) {
  return (
    <div
      style={
        bottomOnly
          ? { borderBottom: `${width}px ${style} ${color}` }
          : { border: `${width}px ${style} ${color}` }
      }
      className="flex h-20 w-full items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-500"
    >
      Карточка
    </div>
  );
}

function Theory() {
  const [width, setWidth] = useState(4);
  const [style, setStyle] = useState<(typeof STYLES)[number]>("solid");
  const [bottomOnly, setBottomOnly] = useState(false);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-6 text-slate-600">
        border задаётся сразу тремя значениями: толщина, стиль линии и цвет. border-bottom делает рамку только
        снизу — частый приём для подчёркивания заголовков.
      </p>
      <div className="grid gap-5 sm:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 flex justify-between text-sm font-bold text-slate-600">
              <span>толщина</span>
              <span>{width}px</span>
            </span>
            <input type="range" min={1} max={12} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full accent-orange-600" />
          </label>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStyle(s)}
                className={`rounded-full border-2 px-3 py-1.5 font-mono text-xs font-bold transition ${
                  style === s ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-500"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm font-bold text-orange-700">
            <input type="checkbox" checked={bottomOnly} onChange={(e) => setBottomOnly(e.target.checked)} />
            только снизу (border-bottom)
          </label>
        </div>
        <div className="rounded-2xl bg-slate-100 p-6">
          <Box width={width} style={style} bottomOnly={bottomOnly} />
        </div>
      </div>
    </div>
  );
}

function ChooseLevel({ target, options, onResult }: { target: string; options: string[]; onResult: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(selected === target);
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              disabled={checked}
              onClick={() => setSelected(opt)}
              className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition disabled:cursor-not-allowed ${
                selected === opt ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-orange-100"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <Box style={selected ?? "none"} />
      </div>
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

function TypeLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);

  function normalize(s: string) {
    return s.trim().toLowerCase().replace(/\s+/g, " ");
  }

  function check() {
    setChecked(true);
    onResult(/^2px\s+solid\s+(#f97316|orange)$/i.test(normalize(text)));
  }

  const previewStyle = /^\d+px\s+\w+\s+\S+/.test(text.trim()) ? text : undefined;

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Напиши значение border, чтобы получилась сплошная оранжевая рамка толщиной 2px (цвет напиши словом orange).</p>
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
        <input
          type="text"
          value={text}
          onChange={(e) => !checked && setText(e.target.value)}
          disabled={checked}
          placeholder="толщина стиль цвет"
          className="w-full rounded-xl border-2 border-orange-200 px-3 py-2 font-mono text-sm outline-none focus:border-orange-400 disabled:opacity-60"
        />
        <div style={{ border: previewStyle }} className="flex h-20 items-center justify-center rounded-lg bg-slate-50 text-xs font-bold text-slate-400">
          Карточка
        </div>
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!text.trim()}
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function WidthMatchLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const target = 8;
  const [value, setValue] = useState(1);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(Math.abs(value - target) <= 1);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Подвинь ползунок толщины рамки так, чтобы она стала примерно такой же, как образец.</p>
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Образец</p>
          <Box width={target} style="solid" />
        </div>
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Твоя рамка</p>
          <Box width={value} style="solid" />
        </div>
      </div>
      <input type="range" min={1} max={16} value={value} onChange={(e) => !checked && setValue(Number(e.target.value))} disabled={checked} className="w-full accent-orange-600" />
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

function TypeBottomLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);

  function normalize(s: string) {
    return s.trim().toLowerCase().replace(/\s+/g, " ");
  }

  function check() {
    setChecked(true);
    onResult(/^3px\s+solid\s+(#000000|#000|black)$/i.test(normalize(text)));
  }

  const previewStyle = /^\d+px\s+\w+\s+\S+/.test(text.trim()) ? text : undefined;

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        Напиши значение для border-bottom — сплошная ЧЁРНАЯ линия толщиной 3px (цвет напиши словом black).
      </p>
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
        <input
          type="text"
          value={text}
          onChange={(e) => !checked && setText(e.target.value)}
          disabled={checked}
          placeholder="толщина стиль цвет"
          className="w-full rounded-xl border-2 border-orange-200 px-3 py-2 font-mono text-sm outline-none focus:border-orange-400 disabled:opacity-60"
        />
        <div style={{ borderBottom: previewStyle }} className="flex h-20 items-center justify-center rounded-lg bg-slate-50 text-xs font-bold text-slate-400">
          Заголовок
        </div>
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!text.trim()}
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
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
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt, i) => (
          <button
            key={opt}
            type="button"
            disabled={checked}
            onClick={() => setChoice(i)}
            className={`rounded-xl border-2 px-4 py-2.5 text-left text-sm transition disabled:cursor-not-allowed ${mono ? "font-mono" : "font-medium"} ${
              choice === i ? "border-orange-400 bg-orange-50" : "border-slate-200 hover:border-orange-200"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
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

const TASK_META = [
  { badge: "выбери из списка", prompt: "Нужна рамка из коротких штрихов. Какое значение border-style подходит?", explain: "dashed — штриховая линия. dotted — из точек, solid — сплошная." },
  { badge: "выбери из списка", prompt: "А какое значение даёт рамку из точек?", explain: "dotted — рамка из точек." },
  { badge: "напиши сам", prompt: "", explain: "border: 2px solid orange; — толщина, стиль и цвет через пробел, в любом порядке, но обычно пишут именно так." },
  { badge: "выбери из списка", prompt: "Какое значение border-style рисует рамку из ДВУХ параллельных линий?", explain: "double — двойная рамка, состоящая из двух линий с просветом между ними." },
  { badge: "выбери из списка", prompt: "Какое значение border-style — самая обычная, сплошная линия?", explain: "solid — сплошная рамка, самый распространённый вариант." },
  { badge: "подбери толщину", prompt: "", explain: "Главное — приблизительно совпасть с образцом по толщине." },
  { badge: "выбери из списка", prompt: "Какое значение border-style полностью УБИРАЕТ рамку?", explain: "none — значение по умолчанию, означающее «рамки нет»." },
  { badge: "напиши сам", prompt: "", explain: "border-bottom: 3px solid black; — та же структура значения, что и у border, просто другое свойство." },
  { badge: "выбери из списка", prompt: "Чем border-radius отличается от border?", explain: "border-radius скругляет УГЛЫ блока (не рисует саму линию), а border задаёт толщину, стиль и цвет самой рамки — это два разных свойства, которые часто используют вместе." },
];

function Tasks() {
  const stepper = useTaskStepper(9, "border");
  const task = stepper.index;
  const meta = TASK_META[task];

  if (stepper.allAnswered) {
    return <CompletionBanner score={stepper.score} total={9} onRestart={() => stepper.restart()} />;
  }

  return (
    <LevelShell
      total={9}
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
      {task === 0 && <ChooseLevel key={task} target="dashed" options={["solid", "dashed", "dotted", "double"]} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <ChooseLevel key={task} target="dotted" options={["solid", "dashed", "dotted", "double"]} onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && <TypeLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 3 && <ChooseLevel key={task} target="double" options={["solid", "dashed", "dotted", "double"]} onResult={(c) => stepper.markResult(c)} />}
      {task === 4 && <ChooseLevel key={task} target="solid" options={["solid", "dashed", "dotted", "double"]} onResult={(c) => stepper.markResult(c)} />}
      {task === 5 && <WidthMatchLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 6 && <McqLevel key={task} options={["none", "solid", "empty", "hidden"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 7 && <TypeBottomLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 8 && (
        <McqLevel
          key={task}
          mono={false}
          options={["Это одно и то же", "border-radius скругляет углы, border рисует саму линию", "border-radius работает только с кругами", "border медленнее border-radius"]}
          correctIndex={1}
          onResult={(c) => stepper.markResult(c)}
        />
      )}
    </LevelShell>
  );
}

export function BorderTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="Толщина, стиль и цвет рамки"
        description="border = толщина стиль цвет. border-bottom рисует рамку только снизу."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="9 уровней — выбирай, подбирай и пиши сам." />
      <Tasks />
    </div>
  );
}
