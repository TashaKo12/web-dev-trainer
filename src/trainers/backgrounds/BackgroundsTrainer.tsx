import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "backgrounds")!;

const SCENE_SVG = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><rect width="60" height="60" fill="#bae6fd"/><circle cx="44" cy="14" r="8" fill="#fbbf24"/><path d="M0 44 Q15 28 30 44 T60 44 V60 H0 Z" fill="#34d399"/></svg>',
)}`;

type BgConfig = { size: string; position: string; repeat: string };

function BgBox({ size, position, repeat }: BgConfig) {
  return (
    <div
      className="h-40 w-full rounded-xl border-2 border-cyan-200 bg-white"
      style={{
        backgroundImage: `url("${SCENE_SVG}")`,
        backgroundSize: size,
        backgroundPosition: position,
        backgroundRepeat: repeat,
      }}
    />
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
      <span className="mb-1 block font-bold text-cyan-700">{label}</span>
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

const SIZES = ["auto", "cover", "contain", "100% 100%"] as const;
const POSITIONS = ["top left", "center", "bottom right", "50% 20%"] as const;
const REPEATS = ["repeat", "no-repeat", "repeat-x", "repeat-y"] as const;

function Theory() {
  const [size, setSize] = useState<(typeof SIZES)[number]>("auto");
  const [position, setPosition] = useState<(typeof POSITIONS)[number]>("top left");
  const [repeat, setRepeat] = useState<(typeof REPEATS)[number]>("repeat");

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-6 text-slate-600">
        Фоновую картинку блока можно тянуть, двигать и повторять — тремя свойствами. Меняй значения слева —
        карточка справа сразу перестраивается, как в настоящем CSS.
      </p>

      <div className="grid gap-6 sm:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <Select label="background-size" value={size} options={SIZES} onChange={(v) => setSize(v)} />
          <Select label="background-position" value={position} options={POSITIONS} onChange={(v) => setPosition(v)} />
          <Select label="background-repeat" value={repeat} options={REPEATS} onChange={(v) => setRepeat(v)} />
          <div className="rounded-2xl bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-600">
            background-size: {size};
            <br />
            background-position: {position};
            <br />
            background-repeat: {repeat};
          </div>
        </div>

        <BgBox size={size} position={position} repeat={repeat} />
      </div>
    </div>
  );
}

type Level =
  | { mode: "choose"; prop: keyof BgConfig; base: BgConfig; options: string[]; target: string; prompt: string; badge: string; explain: string }
  | { mode: "type"; prop: keyof BgConfig; base: BgConfig; accepted: string[]; prompt: string; badge: string; explain: string };

const LEVELS: Level[] = [
  {
    mode: "choose",
    prop: "repeat",
    base: { size: "auto", position: "top left", repeat: "repeat" },
    options: ["repeat", "no-repeat", "repeat-x", "repeat-y"],
    target: "no-repeat",
    prompt: "Картинка повторяется мозаикой по всей карточке. Выбери значение background-repeat, чтобы она показалась только один раз — в углу.",
    badge: "выбери из списка",
    explain: "no-repeat выключает повторение: картинка показывается один раз там, куда её поставил background-position.",
  },
  {
    mode: "choose",
    prop: "position",
    base: { size: "auto", position: "top left", repeat: "no-repeat" },
    options: ["top left", "center", "bottom right", "50% 20%"],
    target: "bottom right",
    prompt: "Нужно поставить картинку в правый нижний угол карточки. Какое значение background-position?",
    badge: "выбери из списка",
    explain: "bottom right — ключевые слова работают по вертикали (top/center/bottom) и по горизонтали (left/center/right) одновременно.",
  },
  {
    mode: "choose",
    prop: "size",
    base: { size: "auto", position: "center", repeat: "no-repeat" },
    options: ["auto", "cover", "contain", "100% 100%"],
    target: "cover",
    prompt: "Нужно, чтобы картинка заполнила ВСЮ карточку без пустых полос — даже если часть обрежется по краям. Какое значение background-size?",
    badge: "выбери из списка",
    explain: "cover растягивает картинку так, чтобы она полностью закрыла блок, сохраняя пропорции — а лишнее просто обрезается.",
  },
  {
    mode: "choose",
    prop: "size",
    base: { size: "auto", position: "center", repeat: "no-repeat" },
    options: ["auto", "cover", "contain", "50%"],
    target: "contain",
    prompt: "А если наоборот — картинка должна быть видна ЦЕЛИКОМ, без обрезки, даже если останутся пустые поля по бокам?",
    badge: "выбери из списка",
    explain: "contain вписывает картинку целиком, сохраняя пропорции: свободное место просто остаётся пустым.",
  },
  {
    mode: "choose",
    prop: "repeat",
    base: { size: "auto", position: "top left", repeat: "repeat" },
    options: ["repeat", "repeat-x", "repeat-y", "no-repeat"],
    target: "repeat-x",
    prompt: "Нужно, чтобы картинка повторялась только по горизонтали — одной лентой сверху.",
    badge: "выбери из списка",
    explain: "repeat-x повторяет только по горизонтали, repeat-y — только по вертикали.",
  },
  {
    mode: "type",
    prop: "size",
    base: { size: "auto", position: "center", repeat: "no-repeat" },
    accepted: ["100% 100%"],
    prompt: "Напиши значение background-size, которое растянет картинку так, чтобы она заняла ровно всю ширину И всю высоту блока отдельно (пропорции можно не сохранять).",
    badge: "напиши сам",
    explain: "100% 100% — первое число задаёт ширину, второе — высоту, независимо друг от друга.",
  },
  {
    mode: "type",
    prop: "position",
    base: { size: "auto", position: "center", repeat: "no-repeat" },
    accepted: ["top left", "left top"],
    prompt: "Напиши значение background-position, чтобы картинка встала в левый верхний угол.",
    badge: "напиши сам",
    explain: "top left (или left top — порядок слов не важен) ставит картинку в левый верхний угол.",
  },
  {
    mode: "type",
    prop: "repeat",
    base: { size: "auto", position: "top left", repeat: "no-repeat" },
    accepted: ["repeat-y"],
    prompt: "Напиши значение background-repeat, чтобы картинка повторялась одной лентой сверху вниз, но не по горизонтали.",
    badge: "напиши сам",
    explain: "repeat-y — повтор только по вертикали.",
  },
];

function ChooseLevel({ level, onResult }: { level: Extract<Level, { mode: "choose" }>; onResult: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(selected === level.target);
  }

  const cfg: BgConfig = { ...level.base, [level.prop]: selected ?? level.base[level.prop] };

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-wrap gap-2">
          {level.options.map((opt) => (
            <button
              key={opt}
              type="button"
              disabled={checked}
              onClick={() => setSelected(opt)}
              className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition disabled:cursor-not-allowed ${
                selected === opt ? "bg-cyan-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-cyan-100"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <BgBox {...cfg} />
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!selected}
            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function TypeLevel({ level, onResult }: { level: Extract<Level, { mode: "type" }>; onResult: (correct: boolean) => void }) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(level.accepted.includes(value.trim().toLowerCase()));
  }

  const cfg: BgConfig = { ...level.base, [level.prop]: value.trim() ? value : level.base[level.prop] };

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[1fr_1.1fr]">
        <input
          type="text"
          value={value}
          onChange={(e) => !checked && setValue(e.target.value)}
          disabled={checked}
          placeholder={`значение background-${level.prop === "size" ? "size" : level.prop === "position" ? "position" : "repeat"}`}
          className="w-full rounded-xl border-2 border-cyan-200 px-3 py-2 font-mono text-sm outline-none focus:border-cyan-400 disabled:opacity-60"
        />
        <BgBox {...cfg} />
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!value.trim()}
            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function Tasks() {
  const stepper = useTaskStepper(LEVELS.length, "backgrounds");

  if (stepper.allAnswered) {
    return <CompletionBanner score={stepper.score} total={LEVELS.length} onRestart={() => stepper.restart()} />;
  }

  const level = LEVELS[stepper.index];

  return (
    <LevelShell
      total={LEVELS.length}
      index={stepper.index}
      statuses={stepper.statuses}
      status={stepper.status}
      isLast={stepper.isLast}
      badge={level.badge}
      explain={level.explain}
      onJump={stepper.goTo}
      onNext={stepper.goNext}
      nextClassName="bg-gradient-to-r from-cyan-500 to-blue-600"
    >
      <p className="mb-4 text-sm font-semibold text-slate-700">{level.prompt}</p>
      {level.mode === "choose" ? (
        <ChooseLevel key={stepper.index} level={level} onResult={(correct) => stepper.markResult(correct)} />
      ) : (
        <TypeLevel key={stepper.index} level={level} onResult={(correct) => stepper.markResult(correct)} />
      )}
    </LevelShell>
  );
}

export function BackgroundsTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="Подвигай фоновую картинку"
        description="background-size, background-position и background-repeat управляют тем, как картинка ведёт себя внутри блока."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="8 уровней — сначала выбирай значение, потом пиши сам." />
      <Tasks />
    </div>
  );
}
