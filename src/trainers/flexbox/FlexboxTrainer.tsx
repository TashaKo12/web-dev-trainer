import { useState, type CSSProperties } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { TaskShell } from "../../components/TaskShell";
import { CompletionBanner } from "../../components/CompletionBanner";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "flexbox")!;

const COLORS = ["bg-emerald-400", "bg-emerald-500", "bg-teal-500", "bg-teal-600", "bg-cyan-500"];

const DIRECTIONS = ["row", "column"] as const;
const JUSTIFY = ["flex-start", "center", "flex-end", "space-between", "space-around"] as const;
const ALIGN = ["flex-start", "center", "flex-end", "stretch"] as const;
const WRAP = ["nowrap", "wrap"] as const;

type FlexConfig = {
  direction: (typeof DIRECTIONS)[number];
  justify: (typeof JUSTIFY)[number];
  align: (typeof ALIGN)[number];
  wrap: (typeof WRAP)[number];
};

const DEFAULT_CONFIG: FlexConfig = {
  direction: "row",
  justify: "flex-start",
  align: "stretch",
  wrap: "nowrap",
};

function boxesFor(count: number) {
  return Array.from({ length: count }, (_, i) => i);
}

function FlexBoxes({ count, size = 48 }: { count: number; size?: number }) {
  return (
    <>
      {boxesFor(count).map((i) => (
        <div
          key={i}
          style={{ width: size, height: size, flexShrink: 0 }}
          className={`flex items-center justify-center rounded-lg text-sm font-bold text-white shadow ${COLORS[i % COLORS.length]}`}
        >
          {i + 1}
        </div>
      ))}
    </>
  );
}

function FlexContainer({
  config,
  height = 150,
  count = 5,
}: {
  config: FlexConfig;
  height?: number;
  count?: number;
}) {
  const style: CSSProperties = {
    display: "flex",
    flexDirection: config.direction,
    justifyContent: config.justify,
    alignItems: config.align,
    flexWrap: config.wrap,
    height,
    gap: 8,
  };
  return (
    <div style={style} className="w-full overflow-hidden rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/60 p-2">
      <FlexBoxes count={count} />
    </div>
  );
}

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-bold text-emerald-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-lg border-2 border-slate-200 bg-white px-2 py-1.5 font-mono text-xs"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Theory() {
  const [config, setConfig] = useState<FlexConfig>(DEFAULT_CONFIG);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-6 text-slate-600">
        Меняй значения свойств — блоки внутри контейнера сразу
        перестраиваются. Это и есть flexbox: ты не задаёшь позицию каждого
        блока вручную, а описываешь правило, по которому они сами
        расставляются.
      </p>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Select label="flex-direction" value={config.direction} options={DIRECTIONS} onChange={(v) => setConfig((c) => ({ ...c, direction: v }))} />
        <Select label="justify-content" value={config.justify} options={JUSTIFY} onChange={(v) => setConfig((c) => ({ ...c, justify: v }))} />
        <Select label="align-items" value={config.align} options={ALIGN} onChange={(v) => setConfig((c) => ({ ...c, align: v }))} />
        <Select label="flex-wrap" value={config.wrap} options={WRAP} onChange={(v) => setConfig((c) => ({ ...c, wrap: v }))} />
      </div>

      <FlexContainer config={config} />

      <p className="mt-4 text-sm text-slate-500">
        <strong>flex-direction</strong> выбирает ось (в ряд или колонкой),{" "}
        <strong>justify-content</strong> — расположение по главной оси,{" "}
        <strong>align-items</strong> — по поперечной, а{" "}
        <strong>flex-wrap</strong> разрешает блокам переходить на новую строку.
      </p>
    </div>
  );
}

type Level = {
  prompt: string;
  exposed: ("direction" | "justify" | "align" | "wrap")[];
  target: FlexConfig;
  start: FlexConfig;
  explain: string;
};

const LEVELS: Level[] = [
  {
    prompt: "Расставь блоки по центру контейнера — как на образце справа.",
    exposed: ["justify"],
    target: { ...DEFAULT_CONFIG, justify: "center" },
    start: DEFAULT_CONFIG,
    explain: "justify-content: center собирает блоки в центре главной оси.",
  },
  {
    prompt: "Разведи блоки по краям контейнера с равными промежутками — как на образце.",
    exposed: ["justify"],
    target: { ...DEFAULT_CONFIG, justify: "space-between" },
    start: DEFAULT_CONFIG,
    explain: "justify-content: space-between прижимает первый и последний блок к краям, а остальное пространство делит поровну.",
  },
  {
    prompt: "Прижми блоки к нижнему краю высокого контейнера — как на образце.",
    exposed: ["align"],
    target: { ...DEFAULT_CONFIG, align: "flex-end" },
    start: DEFAULT_CONFIG,
    explain: "align-items: flex-end прижимает блоки к концу поперечной оси (здесь это низ).",
  },
  {
    prompt: "Сделай из ряда блоков вертикальную колонку, собранную по центру — как на образце.",
    exposed: ["direction", "justify"],
    target: { ...DEFAULT_CONFIG, direction: "column", justify: "center" },
    start: DEFAULT_CONFIG,
    explain: "flex-direction: column меняет направление оси на вертикальное, а justify-content: center центрирует блоки вдоль неё.",
  },
  {
    prompt: "В узком контейнере блокам не хватает места в один ряд. Разреши им переходить на новую строку — как на образце.",
    exposed: ["wrap"],
    target: { ...DEFAULT_CONFIG, wrap: "wrap" },
    start: DEFAULT_CONFIG,
    explain: "flex-wrap: wrap разрешает блокам, которым не хватило места, перенестись на следующую строку.",
  },
];

function FlexLevel({ level, onResult }: { level: Level; onResult: (correct: boolean) => void }) {
  const [value, setValue] = useState<FlexConfig>(level.start);
  const [checked, setChecked] = useState(false);
  const isWrapLevel = level.exposed.includes("wrap");
  const containerWidth = isWrapLevel ? 220 : undefined;

  function check() {
    setChecked(true);
    const correct = level.exposed.every((k) => value[k] === level.target[k]);
    onResult(correct);
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Образец</p>
          <div style={{ width: containerWidth }} className="mx-auto">
            <FlexContainer config={level.target} height={110} count={isWrapLevel ? 8 : 5} />
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Твой контейнер</p>
          <div style={{ width: containerWidth }} className="mx-auto">
            <FlexContainer config={value} height={110} count={isWrapLevel ? 8 : 5} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {level.exposed.includes("direction") && (
          <Select label="flex-direction" value={value.direction} options={DIRECTIONS} onChange={(v) => !checked && setValue((c) => ({ ...c, direction: v }))} />
        )}
        {level.exposed.includes("justify") && (
          <Select label="justify-content" value={value.justify} options={JUSTIFY} onChange={(v) => !checked && setValue((c) => ({ ...c, justify: v }))} />
        )}
        {level.exposed.includes("align") && (
          <Select label="align-items" value={value.align} options={ALIGN} onChange={(v) => !checked && setValue((c) => ({ ...c, align: v }))} />
        )}
        {level.exposed.includes("wrap") && (
          <Select label="flex-wrap" value={value.wrap} options={WRAP} onChange={(v) => !checked && setValue((c) => ({ ...c, wrap: v }))} />
        )}
      </div>

      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-sm font-bold text-white shadow"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function Tasks() {
  const stepper = useTaskStepper(5, "flexbox");
  const [levelDone, setLevelDone] = useState(false);

  if (stepper.allAnswered) {
    return (
      <CompletionBanner
        score={stepper.score}
        total={5}
        onRestart={() => {
          stepper.restart();
          setLevelDone(false);
        }}
      />
    );
  }

  const level = LEVELS[stepper.index];

  return (
    <TaskShell
      index={stepper.index}
      total={5}
      statuses={stepper.statuses}
      prompt={level.prompt}
      status={levelDone ? stepper.status : "idle"}
      onCheck={() => {}}
      checkDisabled
      hideCheck
      onNext={() => {
        stepper.goNext();
        setLevelDone(false);
      }}
      isLast={stepper.isLast}
      feedback={level.explain}
    >
      <FlexLevel
        key={stepper.index}
        level={level}
        onResult={(correct) => {
          setLevelDone(true);
          stepper.markResult(correct);
        }}
      />
    </TaskShell>
  );
}

export function FlexboxTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} />
      <SectionHeading
        kicker="Теория"
        title="Поиграй со свойствами flex"
        description="Четыре свойства управляют расположением блоков внутри контейнера."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Собери образец" description="5 уровней — повтори расположение блоков с образца." />
      <Tasks />
    </div>
  );
}
