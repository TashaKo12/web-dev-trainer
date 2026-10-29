import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { TaskShell } from "../../components/TaskShell";
import { CompletionBanner } from "../../components/CompletionBanner";
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

function Tasks() {
  const stepper = useTaskStepper(5, "typography");
  const [mcq, setMcq] = useState<number | null>(null);

  if (stepper.allAnswered) {
    return (
      <CompletionBanner
        score={stepper.score}
        total={5}
        onRestart={() => {
          stepper.restart();
          setMcq(null);
        }}
      />
    );
  }

  const task = stepper.index;
  const next = () => {
    stepper.goNext();
    setMcq(null);
  };

  if (task === 0) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt="Какое свойство выравнивает текст по центру блока?"
        status={stepper.status}
        onCheck={() => stepper.markResult(mcq === 1)}
        onNext={next}
        checkDisabled={mcq === null}
        isLast={false}
        feedback="text-align: center центрирует текст внутри его блока."
      >
        <McqOptions options={["line-height", "text-align", "letter-spacing", "text-decoration"]} selected={mcq} onSelect={setMcq} disabled={stepper.status !== "idle"} />
      </TaskShell>
    );
  }

  if (task === 1) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt="Какое свойство увеличивает расстояние МЕЖДУ СТРОКАМИ текста (а не между буквами)?"
        status={stepper.status}
        onCheck={() => stepper.markResult(mcq === 0)}
        onNext={next}
        checkDisabled={mcq === null}
        isLast={false}
        feedback="line-height — межстрочный интервал. letter-spacing отвечает за расстояние между буквами."
      >
        <McqOptions options={["line-height", "letter-spacing", "text-align", "font-size"]} selected={mcq} onSelect={setMcq} disabled={stepper.status !== "idle"} />
      </TaskShell>
    );
  }

  if (task === 2) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt={
          <>
            У тебя есть свой файл шрифта <code className="rounded bg-slate-100 px-1">Melodin.ttf</code> в папке{" "}
            <code className="rounded bg-slate-100 px-1">fonts</code>. Каким правилом подключить его в CSS?
          </>
        }
        status={stepper.status}
        onCheck={() => stepper.markResult(mcq === 2)}
        onNext={next}
        checkDisabled={mcq === null}
        isLast={false}
        feedback="@font-face подключает собственный файл шрифта: указываешь font-family и src с путём к файлу."
      >
        <McqOptions
          mono
          options={['@import url("fonts/Melodin.ttf")', '<link href="Melodin.ttf">', "@font-face { src: url(fonts/Melodin.ttf); }", "font-family: Melodin.ttf;"]}
          selected={mcq}
          onSelect={setMcq}
          disabled={stepper.status !== "idle"}
        />
      </TaskShell>
    );
  }

  if (task === 3) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt="А если шрифт берётся с Google Fonts (ты просто копируешь ссылку, файл сам не скачиваешь) — какая строка в начале style.css это сделает?"
        status={stepper.status}
        onCheck={() => stepper.markResult(mcq === 0)}
        onNext={next}
        checkDisabled={mcq === null}
        isLast={false}
        feedback="@import url('https://fonts.googleapis.com/...') — именно так Google Fonts подключают без скачивания файла."
      >
        <McqOptions
          mono
          options={["@import url('https://fonts.googleapis.com/...');", "@font-face { font-family: Roboto; }", "<a href='https://fonts.google.com'>", "font-family: url(google.com);"]}
          selected={mcq}
          onSelect={setMcq}
          disabled={stepper.status !== "idle"}
        />
      </TaskShell>
    );
  }

  return (
    <TaskShell
      index={task}
      total={5}
      statuses={stepper.statuses}
      prompt="Какое значение text-decoration убирает подчёркивание у ссылки?"
      status={stepper.status}
      onCheck={() => stepper.markResult(mcq === 1)}
      onNext={next}
      checkDisabled={mcq === null}
      isLast
      feedback="text-decoration: none убирает любое оформление (подчёркивание, зачёркивание) у текста/ссылки."
    >
      <McqOptions options={["underline", "none", "line-through", "overline"]} selected={mcq} onSelect={setMcq} disabled={stepper.status !== "idle"} />
    </TaskShell>
  );
}

export function TypographyTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} />
      <SectionHeading
        kicker="Теория"
        title="Поиграй со шрифтом и текстом"
        description="font-family, text-align, letter-spacing, line-height и text-decoration управляют тем, как читается текст."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="5 заданий про шрифты и оформление текста." />
      <Tasks />
    </div>
  );
}
