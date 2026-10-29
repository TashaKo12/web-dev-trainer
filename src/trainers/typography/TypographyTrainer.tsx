import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "typography")!;

const FONTS = ["sans-serif", "serif", "monospace", "cursive"] as const;
const ALIGNS = ["left", "center", "right", "justify"] as const;
const DECORATIONS = ["underline", "none", "line-through"] as const;

function Theory() {
  const [font, setFont] = useState<(typeof FONTS)[number]>("sans-serif");
  const [align, setAlign] = useState<(typeof ALIGNS)[number]>("left");
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [decoration, setDecoration] = useState<(typeof DECORATIONS)[number]>("underline");
  const [shadow, setShadow] = useState(false);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-6 text-slate-600">
        Меняй свойства ниже — текст справа сразу перестраивается, как в настоящем CSS.
      </p>

      <div className="grid gap-6 sm:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <Select label="font-family" value={font} options={FONTS} onChange={(v) => setFont(v)} />
          <Select label="text-align" value={align} options={ALIGNS} onChange={(v) => setAlign(v)} />
          <Select label="text-decoration (у ссылки)" value={decoration} options={DECORATIONS} onChange={(v) => setDecoration(v)} />
          <label className="block text-sm">
            <span className="mb-1 flex justify-between font-bold text-purple-700">
              <span>letter-spacing</span>
              <span>{letterSpacing}px</span>
            </span>
            <input type="range" min={0} max={6} value={letterSpacing} onChange={(e) => setLetterSpacing(Number(e.target.value))} className="w-full accent-purple-600" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 flex justify-between font-bold text-purple-700">
              <span>line-height</span>
              <span>{lineHeight}</span>
            </span>
            <input type="range" min={1} max={3} step={0.1} value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value))} className="w-full accent-purple-600" />
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-purple-700">
            <input type="checkbox" checked={shadow} onChange={(e) => setShadow(e.target.checked)} />
            text-shadow
          </label>
        </div>

        <div className="rounded-2xl bg-slate-50 p-5">
          <p
            style={{
              fontFamily: font,
              textAlign: align,
              letterSpacing,
              lineHeight,
              textShadow: shadow ? "2px 2px 2px rgba(124,58,237,0.4)" : "none",
            }}
            className="text-lg text-slate-700"
          >
            Этот рецепт оладий на молоке я использую уже долгие годы, так что он проверен временем.
          </p>
          <a
            style={{ textDecoration: decoration, fontFamily: font }}
            className="mt-3 block font-semibold text-purple-600"
          >
            Открыть рецепт
          </a>
        </div>
      </div>
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
      <span className="mb-1 block font-bold text-purple-700">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className="w-full rounded-lg border-2 border-slate-200 bg-white px-2 py-1.5 font-mono text-xs">
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
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
            className="rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function FontMatchTask({ onResult }: { onResult: (correct: boolean) => void }) {
  const target: (typeof FONTS)[number] = "monospace";
  const [value, setValue] = useState<(typeof FONTS)[number]>("sans-serif");
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(value === target);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Выбери font-family так, чтобы твой текст встал как на образце.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Образец</p>
          <p style={{ fontFamily: target }} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            Привет! Это пример текста.
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Твой текст</p>
          <p style={{ fontFamily: value }} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            Привет! Это пример текста.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {FONTS.map((f) => (
          <button
            key={f}
            type="button"
            disabled={checked}
            onClick={() => setValue(f)}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition disabled:cursor-not-allowed ${
              value === f ? "bg-purple-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-purple-100"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            className="rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-600 px-5 py-2 text-sm font-bold text-white shadow"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function DecorationTypeTask({ onResult }: { onResult: (correct: boolean) => void }) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(value.trim() === "none");
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        Ссылка подчёркнута по умолчанию. Напиши значение text-decoration, которое уберёт подчёркивание — и
        смотри на ссылку ниже.
      </p>
      <a style={{ textDecoration: value || undefined }} className="mb-4 block text-lg font-semibold text-purple-600 underline">
        Пример ссылки
      </a>
      <input
        type="text"
        value={value}
        onChange={(e) => !checked && setValue(e.target.value)}
        disabled={checked}
        placeholder="значение text-decoration"
        className="w-56 rounded-full border-2 border-purple-200 px-4 py-2 text-center font-mono text-sm outline-none focus:border-purple-400 disabled:opacity-60"
      />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!value.trim()}
            className="rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const TASK_META = [
  { badge: "подбери значение", prompt: "", explain: "font-family: monospace — моноширинный шрифт, у которого все буквы одинаковой ширины (как в коде)." },
  { badge: "выбери из списка", prompt: "Какое свойство увеличивает расстояние МЕЖДУ СТРОКАМИ текста (а не между буквами)?", explain: "line-height — межстрочный интервал. letter-spacing отвечает за расстояние между буквами." },
  {
    badge: "выбери из списка",
    prompt: (
      <>
        У тебя есть свой файл шрифта <code className="rounded bg-slate-100 px-1">Melodin.ttf</code> в папке{" "}
        <code className="rounded bg-slate-100 px-1">fonts</code>. Каким правилом подключить его в CSS?
      </>
    ),
    explain: "@font-face подключает собственный файл шрифта: указываешь font-family и src с путём к файлу.",
  },
  {
    badge: "выбери из списка",
    prompt: "А если шрифт берётся с Google Fonts (ты просто копируешь ссылку, файл сам не скачиваешь) — какая строка в начале style.css это сделает?",
    explain: "@import url('https://fonts.googleapis.com/...') — именно так Google Fonts подключают без скачивания файла.",
  },
  { badge: "напиши сам", prompt: "", explain: "text-decoration: none убирает любое оформление (подчёркивание, зачёркивание) у текста/ссылки." },
];

function Tasks() {
  const stepper = useTaskStepper(5, "typography");
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
      nextClassName="bg-gradient-to-r from-purple-500 to-fuchsia-600"
    >
      {meta.prompt && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <FontMatchTask key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <McqLevel key={task} options={["line-height", "letter-spacing", "text-align", "font-size"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && (
        <McqLevel
          key={task}
          options={['@import url("fonts/Melodin.ttf")', '<link href="Melodin.ttf">', "@font-face { src: url(fonts/Melodin.ttf); }", "font-family: Melodin.ttf;"]}
          correctIndex={2}
          onResult={(c) => stepper.markResult(c)}
        />
      )}
      {task === 3 && (
        <McqLevel
          key={task}
          options={["@import url('https://fonts.googleapis.com/...');", "@font-face { font-family: Roboto; }", "<a href='https://fonts.google.com'>", "font-family: url(google.com);"]}
          correctIndex={0}
          onResult={(c) => stepper.markResult(c)}
        />
      )}
      {task === 4 && <DecorationTypeTask key={task} onResult={(c) => stepper.markResult(c)} />}
    </LevelShell>
  );
}

export function TypographyTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="Поиграй со шрифтом и текстом"
        description="font-family, letter-spacing, line-height и text-decoration управляют тем, как читается текст."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="5 уровней — подбирай значения и пиши сам." />
      <Tasks />
    </div>
  );
}
