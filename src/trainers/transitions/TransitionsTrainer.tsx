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

function PropertyChooseLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const options = ["all", "background-color", "none", "color"];
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [hover, setHover] = useState(false);

  function check() {
    setChecked(true);
    onResult(selected === "all");
  }

  const prop = selected ?? "none";

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        При наведении у карточки меняется И цвет фона, И скругление углов. Выбери значение transition-property,
        чтобы ОБА свойства анимировались плавно одновременно — наводи курсор и проверяй.
      </p>
      <div className="mb-4 flex items-center justify-center rounded-2xl bg-slate-100 p-8">
        <div
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            transitionProperty: prop,
            transitionDuration: "0.6s",
            background: hover ? "#f59e0b" : "#1e293b",
            borderRadius: hover ? "9999px" : "6px",
          }}
          className="flex h-20 w-40 items-center justify-center text-sm font-bold text-white"
        >
          Наведи курсор
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            disabled={checked}
            onClick={() => setSelected(opt)}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition disabled:cursor-not-allowed ${
              selected === opt ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-amber-100"
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

const DURATIONS = ["0.1s", "0.4s", "0.8s", "1.5s"] as const;

function DurationMatchLevel({ target, onResult }: { target: (typeof DURATIONS)[number]; onResult: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<(typeof DURATIONS)[number] | null>(null);
  const [checked, setChecked] = useState(false);
  const [hoverTarget, setHoverTarget] = useState(false);
  const [hoverMine, setHoverMine] = useState(false);

  function check() {
    setChecked(true);
    onResult(selected === target);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        Наводи курсор то на образец, то на свою карточку — подбери transition-duration так, чтобы скорость
        совпала с образцом.
      </p>
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Образец</p>
          <div
            onMouseEnter={() => setHoverTarget(true)}
            onMouseLeave={() => setHoverTarget(false)}
            style={{ transition: `background ${target}`, background: hoverTarget ? "#f59e0b" : "#cbd5e1" }}
            className="flex h-20 items-center justify-center rounded-xl text-sm font-bold text-white"
          >
            Образец
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Твоя карточка</p>
          <div
            onMouseEnter={() => setHoverMine(true)}
            onMouseLeave={() => setHoverMine(false)}
            style={{ transition: `background ${selected ?? "0s"}`, background: hoverMine ? "#f59e0b" : "#cbd5e1" }}
            className="flex h-20 items-center justify-center rounded-xl text-sm font-bold text-white"
          >
            Твоя
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {DURATIONS.map((d) => (
          <button
            key={d}
            type="button"
            disabled={checked}
            onClick={() => setSelected(d)}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition disabled:cursor-not-allowed ${
              selected === d ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-amber-100"
            }`}
          >
            {d}
          </button>
        ))}
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

function TypeDurationLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);
  const [hover, setHover] = useState(false);

  function normalize(s: string) {
    return s.trim().toLowerCase();
  }

  function check() {
    setChecked(true);
    onResult(["0.5s", ".5s", "500ms"].includes(normalize(text)));
  }

  const duration = /^(\d*\.?\d+)(s|ms)$/i.test(text.trim()) ? text.trim() : "0s";

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Напиши значение transition-duration, чтобы переход занял ровно полсекунды.</p>
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
        <input
          type="text"
          value={text}
          onChange={(e) => !checked && setText(e.target.value)}
          disabled={checked}
          placeholder="значение transition-duration"
          className="w-full rounded-xl border-2 border-amber-200 px-3 py-2 font-mono text-sm outline-none focus:border-amber-400 disabled:opacity-60"
        />
        <div
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{ transition: `background ${duration}`, background: hover ? "#f59e0b" : "#cbd5e1" }}
          className="flex h-16 items-center justify-center rounded-xl text-xs font-bold text-white"
        >
          наведи после ввода
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

function TypeShorthandLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);
  const [hover, setHover] = useState(false);

  function check() {
    setChecked(true);
    onResult(/^all\s+0?\.3s$/i.test(text.trim()));
  }

  const applied = /^\S+\s+\S+/.test(text.trim()) ? text.trim() : "none";

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        Напиши значение transition целиком (коротко, одной строкой), чтобы плавно анимировались ВСЕ изменяющиеся
        свойства за 0.3 секунды.
      </p>
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
        <input
          type="text"
          value={text}
          onChange={(e) => !checked && setText(e.target.value)}
          disabled={checked}
          placeholder="свойство время"
          className="w-full rounded-xl border-2 border-amber-200 px-3 py-2 font-mono text-sm outline-none focus:border-amber-400 disabled:opacity-60"
        />
        <div
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{ transition: applied, background: hover ? "#f59e0b" : "#cbd5e1", borderRadius: hover ? "9999px" : "6px" }}
          className="flex h-16 items-center justify-center text-xs font-bold text-white"
        >
          наведи после ввода
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

function TimingFunctionLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const FUNCS = ["linear", "ease", "ease-in", "step-end"] as const;
  const [fn, setFn] = useState<(typeof FUNCS)[number]>("linear");
  const [moved, setMoved] = useState(false);

  function check(answer: (typeof FUNCS)[number]) {
    setFn(answer);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        Выбери transition-timing-function, подвигай курсор на и с дорожки несколько раз и посмотри, как движется
        шарик — потом отметь, какое значение создаёт эффект «сначала медленно, в середине быстро, в конце снова
        медленно».
      </p>
      <div
        onMouseEnter={() => setMoved(true)}
        onMouseLeave={() => setMoved(false)}
        className="relative mb-3 h-10 overflow-hidden rounded-full bg-slate-100"
      >
        <div
          style={{ transition: `transform 1.4s ${fn}`, transform: moved ? "translateX(240px)" : "translateX(4px)" }}
          className="absolute top-1 h-8 w-8 rounded-full bg-amber-500"
        />
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {FUNCS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => check(f)}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition ${
              fn === f ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-amber-100"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <TimingAnswer fn={fn} onResult={onResult} />
    </div>
  );
}

function TimingAnswer({ fn, onResult }: { fn: string; onResult: (correct: boolean) => void }) {
  const [checked, setChecked] = useState(false);
  function check() {
    setChecked(true);
    onResult(fn === "ease");
  }
  if (checked) return null;
  return (
    <div className="mt-4 flex justify-center">
      <button
        type="button"
        onClick={check}
        className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-sm font-bold text-white shadow"
      >
        Это оно — проверить
      </button>
    </div>
  );
}

const SPEED_OPTIONS = ["0.1s", "0.3s", "3s", "5s"] as const;

function FixSlowLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [hoverSlow, setHoverSlow] = useState(false);
  const [hoverFixed, setHoverFixed] = useState(false);
  const [selected, setSelected] = useState<(typeof SPEED_OPTIONS)[number] | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(selected === "0.3s");
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        У кнопки задано transition-duration: 3s — она реагирует раздражающе медленно. Подбери более уместную
        длительность для обычной кнопки (не мгновенную и не слишком долгую).
      </p>
      <div className="mb-3 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Как сейчас (3s)</p>
          <div
            onMouseEnter={() => setHoverSlow(true)}
            onMouseLeave={() => setHoverSlow(false)}
            style={{ transition: "background 3s", background: hoverSlow ? "#f59e0b" : "#cbd5e1" }}
            className="flex h-16 items-center justify-center rounded-xl text-xs font-bold text-white"
          >
            медленно
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Твой вариант</p>
          <div
            onMouseEnter={() => setHoverFixed(true)}
            onMouseLeave={() => setHoverFixed(false)}
            style={{ transition: `background ${selected ?? "0s"}`, background: hoverFixed ? "#f59e0b" : "#cbd5e1" }}
            className="flex h-16 items-center justify-center rounded-xl text-xs font-bold text-white"
          >
            твоё
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {SPEED_OPTIONS.map((d) => (
          <button
            key={d}
            type="button"
            disabled={checked}
            onClick={() => setSelected(d)}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition disabled:cursor-not-allowed ${
              selected === d ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-amber-100"
            }`}
          >
            {d}
          </button>
        ))}
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

const TASK_META = [
  { badge: "наведи и сравни", prompt: "", explain: "У карточки Б задан transition: background 0.5s — поэтому цвет меняется плавно, а не скачком, как у карточки А." },
  { badge: "выбери из списка", prompt: "", explain: 'transition-property: all — анимирует ЛЮБЫЕ изменяющиеся свойства сразу, а не только одно конкретное.' },
  { badge: "подбери скорость", prompt: "", explain: "Подходит только то же самое число секунд, что и у образца — иначе карточки будут реагировать с разной скоростью." },
  { badge: "выбери из списка", prompt: "transition анимирует переход между какими состояниями?", explain: "Между двумя СОСТОЯНИЯМИ элемента (например, обычным и :hover) — а не бесконечный цикл, как у @keyframes-анимации." },
  { badge: "напиши сам", prompt: "", explain: "0.5s (или 500ms) — ровно полсекунды." },
  { badge: "напиши сам", prompt: "", explain: "all 0.3s — сначала свойство (all = все сразу), потом время, через пробел." },
  { badge: "подвигай и сравни", prompt: "", explain: "ease — значение по умолчанию: старт и финиш движения плавные и медленные, а основное ускорение — в середине." },
  { badge: "почини скорость", prompt: "", explain: "0.3s — комфортная длительность для мелких интерфейсных элементов: заметно, но не раздражает ожиданием." },
  { badge: "подбери скорость", prompt: "", explain: "0.1s — очень быстрая, почти незаметная на глаз реакция." },
];

function Tasks() {
  const stepper = useTaskStepper(9, "transitions");
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
      {task === 3 && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <CompareLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <PropertyChooseLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && <DurationMatchLevel key={task} target="0.8s" onResult={(c) => stepper.markResult(c)} />}
      {task === 3 && (
        <McqLevel
          key={task}
          mono={false}
          options={["Между двумя состояниями элемента (например, обычным и :hover)", "Между двумя разными страницами сайта", "Между двумя HTML-файлами", "Между цветами всей страницы сразу"]}
          correctIndex={0}
          onResult={(c) => stepper.markResult(c)}
        />
      )}
      {task === 4 && <TypeDurationLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 5 && <TypeShorthandLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 6 && <TimingFunctionLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 7 && <FixSlowLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 8 && <DurationMatchLevel key={task} target="0.1s" onResult={(c) => stepper.markResult(c)} />}
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
      <SectionHeading kicker="Практика" title="Закрепим" description="9 уровней — сравнивай вживую, подвигай, выбирай и пиши сам." />
      <Tasks />
    </div>
  );
}
