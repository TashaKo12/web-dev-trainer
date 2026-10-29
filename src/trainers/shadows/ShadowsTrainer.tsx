import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "shadows")!;

function Card({ radius, shadow, size = 140 }: { radius: string; shadow: string; size?: number }) {
  return (
    <div className="flex items-center justify-center rounded-2xl bg-slate-100 p-8">
      <div
        style={{ width: size, height: size * 0.7, borderRadius: radius, boxShadow: shadow || "none" }}
        className="flex items-center justify-center bg-white text-xs font-bold text-slate-400"
      >
        карточка
      </div>
    </div>
  );
}

function Theory() {
  const [radius, setRadius] = useState(0);
  const [offsetY, setOffsetY] = useState(8);
  const [blur, setBlur] = useState(16);

  const shadow = `0 ${offsetY}px ${blur}px rgba(0,0,0,0.2)`;

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-6 text-slate-600">
        border-radius скругляет уголки блока, box-shadow рисует вокруг него тень. Подвигай ползунки — карточка
        справа меняется вживую.
      </p>

      <div className="grid gap-6 sm:grid-cols-[1fr_1.2fr]">
        <div className="space-y-5">
          <Slider label="border-radius" value={radius} max={70} unit="px" onChange={setRadius} />
          <Slider label="box-shadow: смещение вниз (Y)" value={offsetY} max={30} unit="px" onChange={setOffsetY} />
          <Slider label="box-shadow: размытие" value={blur} max={50} unit="px" onChange={setBlur} />
          <div className="rounded-2xl bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-600">
            border-radius: {radius}px;
            <br />
            box-shadow: 0 {offsetY}px {blur}px rgba(0,0,0,0.2);
          </div>
        </div>

        <Card radius={`${radius}px`} shadow={shadow} />
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex justify-between text-sm font-bold text-slate-600">
        <span>{label}</span>
        <span>
          {value}
          {unit}
        </span>
      </span>
      <input type="range" min={0} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-slate-600" />
    </label>
  );
}

type Level =
  | { mode: "choose-radius"; options: string[]; target: string; prompt: string; badge: string; explain: string; size?: number }
  | { mode: "choose-shadow"; options: string[]; target: string; prompt: string; badge: string; explain: string }
  | { mode: "type-radius"; check: (v: string) => boolean; prompt: string; badge: string; explain: string }
  | { mode: "type-shadow"; check: (v: string) => boolean; prompt: string; badge: string; explain: string };

const LEVELS: Level[] = [
  {
    mode: "choose-radius",
    options: ["0", "12px", "50%", "999px"],
    target: "50%",
    size: 120,
    prompt: "Квадратная карточка 120×120. Какое значение border-radius гарантированно превратит её в идеальный круг?",
    badge: "выбери из списка",
    explain: "50% скругляет на половину стороны — для квадрата это всегда идеальный круг, независимо от размера блока.",
  },
  {
    mode: "choose-radius",
    options: ["0", "8px", "50%", "1000px"],
    target: "8px",
    prompt: "Нужны мягкие, слегка скруглённые уголки у карточки — не круг, просто не острые углы. Какое значение подходит?",
    badge: "выбери из списка",
    explain: "Небольшое значение в px (например 8px) скругляет уголки, не превращая блок в круг или таблетку.",
  },
  {
    mode: "choose-shadow",
    options: ["0 0 0 rgba(0,0,0,.25)", "0 10px 20px rgba(0,0,0,.25)", "-10px 0 20px rgba(0,0,0,.25)", "0 -10px 20px rgba(0,0,0,.25)"],
    target: "0 10px 20px rgba(0,0,0,.25)",
    prompt: "Нужна мягкая тень СНИЗУ от карточки — она должна выглядеть слегка приподнятой над страницей. Какой box-shadow подходит?",
    badge: "выбери из списка",
    explain: "Первое число — смещение по X, второе — по Y. Положительный Y двигает тень вниз, поэтому карточка выглядит приподнятой.",
  },
  {
    mode: "choose-shadow",
    options: ["0 10px 20px rgba(0,0,0,.25)", "-10px 0 20px rgba(0,0,0,.25)", "10px 0 20px rgba(0,0,0,.25)", "0 0 0 rgba(0,0,0,.25)"],
    target: "-10px 0 20px rgba(0,0,0,.25)",
    prompt: "А теперь нужна тень СЛЕВА от карточки — как будто свет падает справа. Какой box-shadow?",
    badge: "выбери из списка",
    explain: "Отрицательное смещение по X двигает тень влево, положительное — вправо.",
  },
  {
    mode: "choose-radius",
    options: ["0", "8px", "9999px", "2px"],
    target: "9999px",
    prompt: "Кнопка должна стать полностью округлой — «таблеткой», как кнопка «Войти» в форме регистрации. Какое значение border-radius?",
    badge: "выбери из списка",
    explain: "Очень большое значение (например 9999px) гарантированно скругляет кнопку в «таблетку» при любой её высоте.",
  },
  {
    mode: "type-radius",
    check: (v) => v.trim().toLowerCase() === "50%",
    prompt: "Квадратная фотография профиля (аватар) должна стать идеальным кругом. Напиши значение border-radius.",
    badge: "напиши сам",
    explain: "50% — универсальный способ сделать круг из квадратного блока.",
  },
  {
    mode: "type-radius",
    check: (v) => {
      const m = v.trim().toLowerCase().match(/^(\d+)px$/);
      return !!m && Number(m[1]) >= 4 && Number(m[1]) <= 20;
    },
    prompt: "Напиши border-radius в px (любое число от 4 до 20), чтобы уголки стали мягкими, но карточка не превратилась в круг.",
    badge: "напиши сам",
    explain: "Подходит любое значение от 4px до 20px — главное, чтобы угол стал заметно мягче, но форма осталась прямоугольной.",
  },
  {
    mode: "type-shadow",
    check: (v) => {
      const n = v.trim().toLowerCase().replace(/\s+/g, " ");
      const m = n.match(/^0(?:px)?\s+10px\s+20px\s+rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0?\.(1|2|3)\s*\)$/);
      return !!m;
    },
    prompt: 'Напиши box-shadow так, чтобы тень была ровно ПОД карточкой (без смещения влево-вправо), сдвинута на 10px вниз и размыта на 20px, цвет — rgba(0,0,0,0.2).',
    badge: "напиши сам",
    explain: "0 10px 20px rgba(0,0,0,0.2) — сначала X (0, без сдвига по горизонтали), потом Y (10px вниз), потом размытие (20px), потом цвет.",
  },
];

function ChoosePreview({ radius, shadow }: { radius?: string; shadow?: string }) {
  return <Card radius={radius ?? "0"} shadow={shadow ?? "none"} />;
}

function ChooseLevel({
  level,
  onResult,
}: {
  level: Extract<Level, { mode: "choose-radius" | "choose-shadow" }>;
  onResult: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const isRadius = level.mode === "choose-radius";

  function check() {
    setChecked(true);
    onResult(selected === level.target);
  }

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
                selected === opt ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <ChoosePreview
          radius={isRadius ? selected ?? "0" : "16px"}
          shadow={isRadius ? "0 4px 10px rgba(0,0,0,.15)" : selected ?? "none"}
        />
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!selected}
            className="rounded-full bg-gradient-to-r from-slate-600 to-zinc-700 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function TypeLevel({
  level,
  onResult,
}: {
  level: Extract<Level, { mode: "type-radius" | "type-shadow" }>;
  onResult: (correct: boolean) => void;
}) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const isRadius = level.mode === "type-radius";

  function check() {
    setChecked(true);
    onResult(level.check(value));
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[1fr_1.1fr]">
        <input
          type="text"
          value={value}
          onChange={(e) => !checked && setValue(e.target.value)}
          disabled={checked}
          placeholder={isRadius ? "значение border-radius" : "значение box-shadow"}
          className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-slate-500 disabled:opacity-60"
        />
        <ChoosePreview
          radius={isRadius ? (value.trim() || "0") : "16px"}
          shadow={isRadius ? "0 4px 10px rgba(0,0,0,.15)" : value.trim() || "none"}
        />
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!value.trim()}
            className="rounded-full bg-gradient-to-r from-slate-600 to-zinc-700 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function Tasks() {
  const stepper = useTaskStepper(LEVELS.length, "shadows");

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
      nextClassName="bg-gradient-to-r from-slate-600 to-zinc-700"
    >
      <p className="mb-4 text-sm font-semibold text-slate-700">{level.prompt}</p>
      {(level.mode === "choose-radius" || level.mode === "choose-shadow") && (
        <ChooseLevel key={stepper.index} level={level} onResult={(correct) => stepper.markResult(correct)} />
      )}
      {(level.mode === "type-radius" || level.mode === "type-shadow") && (
        <TypeLevel key={stepper.index} level={level} onResult={(correct) => stepper.markResult(correct)} />
      )}
    </LevelShell>
  );
}

export function ShadowsTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="Скругли и подвинь тень"
        description="border-radius скругляет уголки, box-shadow рисует тень вокруг блока — смещение, размытие и цвет задаются отдельно."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="8 уровней — сначала выбирай значение, потом пиши сам." />
      <Tasks />
    </div>
  );
}
