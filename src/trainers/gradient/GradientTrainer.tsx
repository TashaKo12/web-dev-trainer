import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "gradient")!;

const DIRECTIONS = ["to right", "to left", "to bottom", "135deg"] as const;

function Theory() {
  const [dir, setDir] = useState<(typeof DIRECTIONS)[number]>("to right");
  const [c1, setC1] = useState("#f97316");
  const [c2, setC2] = useState("#ec4899");

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-6 text-slate-600">
        <code className="rounded bg-slate-100 px-1">linear-gradient()</code> — это значение для
        background-image, которое плавно перетекает из одного цвета в другой вместо обычного фото.
      </p>
      <div className="grid gap-5 sm:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {DIRECTIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDir(d)}
                className={`rounded-full border-2 px-3 py-1.5 font-mono text-xs font-bold transition ${
                  dir === d ? "border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700" : "border-slate-200 text-slate-500"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input type="color" value={c1} onChange={(e) => setC1(e.target.value)} className="h-9 w-9 rounded-full border-2 border-white shadow" />
            <input type="color" value={c2} onChange={(e) => setC2(e.target.value)} className="h-9 w-9 rounded-full border-2 border-white shadow" />
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 font-mono text-xs text-slate-600">
            background-image: linear-gradient({dir}, {c1}, {c2});
          </div>
        </div>
        <div style={{ backgroundImage: `linear-gradient(${dir}, ${c1}, ${c2})` }} className="h-40 w-full rounded-2xl" />
      </div>
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
      <McqOptions mono={false} options={options} selected={choice} onSelect={(i) => !checked && setChoice(i)} disabled={checked} />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={choice === null}
            className="rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function DirectionMatchLevel({ target, onResult }: { target: string; onResult: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(selected === target);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Подбери направление так, чтобы твой градиент совпал с образцом.</p>
      <div className="mb-3 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Образец</p>
          <div style={{ backgroundImage: `linear-gradient(${target}, #f97316, #ec4899)` }} className="h-20 rounded-xl" />
        </div>
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Твой градиент</p>
          <div style={{ backgroundImage: `linear-gradient(${selected ?? "to right"}, #f97316, #ec4899)` }} className="h-20 rounded-xl" />
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {DIRECTIONS.map((d) => (
          <button
            key={d}
            type="button"
            disabled={checked}
            onClick={() => setSelected(d)}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition disabled:cursor-not-allowed ${
              selected === d ? "bg-fuchsia-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-fuchsia-100"
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
            className="rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function TypeGradientLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);

  function normalize(s: string) {
    return s.trim().toLowerCase().replace(/\s+/g, "");
  }

  function check() {
    setChecked(true);
    onResult(normalize(text) === "tobottom,#f97316,#ec4899");
  }

  const applied = /^[^,]+,\s*#?\w+,\s*#?\w+$/.test(text.trim()) ? `linear-gradient(${text})` : undefined;

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        Напиши аргументы linear-gradient (без самих слов "linear-gradient" и скобок), чтобы цвет шёл сверху вниз:
        направление, запятая, #f97316, запятая, #ec4899.
      </p>
      <input
        type="text"
        value={text}
        onChange={(e) => !checked && setText(e.target.value)}
        disabled={checked}
        placeholder="направление, цвет1, цвет2"
        className="mb-3 w-full rounded-xl border-2 border-fuchsia-200 px-3 py-2 font-mono text-sm outline-none focus:border-fuchsia-400 disabled:opacity-60"
      />
      <div style={{ backgroundImage: applied }} className="h-20 rounded-xl bg-slate-100" />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!text.trim()}
            className="rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function ColorCountLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [three, setThree] = useState(false);
  const [picked, setPicked] = useState<"two" | "more" | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(picked === "more");
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Включи третий цвет и посмотри на градиент. Можно ли указать в linear-gradient БОЛЬШЕ двух цветов?</p>
      <label className="mb-3 flex items-center gap-2 text-sm font-bold text-fuchsia-700">
        <input type="checkbox" checked={three} onChange={(e) => setThree(e.target.checked)} />
        добавить третий цвет
      </label>
      <div
        style={{ backgroundImage: three ? "linear-gradient(to right, #f97316, #22c55e, #3b82f6)" : "linear-gradient(to right, #f97316, #3b82f6)" }}
        className="mb-4 h-20 rounded-xl"
      />
      <div className="flex justify-center gap-2">
        <button
          type="button"
          disabled={checked}
          onClick={() => setPicked("two")}
          className={`rounded-lg px-4 py-1.5 text-sm font-bold transition disabled:cursor-not-allowed ${picked === "two" ? "bg-fuchsia-500 text-white" : "bg-slate-100 text-slate-600"}`}
        >
          Нет, максимум 2
        </button>
        <button
          type="button"
          disabled={checked}
          onClick={() => setPicked("more")}
          className={`rounded-lg px-4 py-1.5 text-sm font-bold transition disabled:cursor-not-allowed ${picked === "more" ? "bg-fuchsia-500 text-white" : "bg-slate-100 text-slate-600"}`}
        >
          Да, можно больше
        </button>
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!picked}
            className="rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const TASK_META = [
  { badge: "выбери из списка", prompt: "Какое CSS-свойство принимает значение linear-gradient(...)?", explain: "background-image — градиент технически является особым значением именно этого свойства, хотя и не картинка в привычном смысле." },
  { badge: "подбери направление", prompt: "", explain: "to bottom — переход цветов сверху вниз." },
  { badge: "подбери направление", prompt: "", explain: "to right — переход цветов слева направо." },
  { badge: "подбери направление", prompt: "", explain: "135deg — направление, заданное углом в градусах, по диагонали." },
  { badge: "подбери направление", prompt: "", explain: "to left — переход цветов справа налево." },
  { badge: "напиши сам", prompt: "", explain: "to bottom, #f97316, #ec4899 — направление и два цвета через запятую." },
  { badge: "проверь вживую", prompt: "", explain: "В linear-gradient можно указать сколько угодно цветов, не только два — браузер сам равномерно распределит переходы между ними." },
  { badge: "выбери из списка", prompt: "Чем radial-gradient отличается от linear-gradient?", explain: "radial-gradient расходится от центра наружу (кругом или эллипсом), а linear-gradient идёт по прямой линии в заданном направлении." },
  { badge: "выбери из списка", prompt: "Какая запись CSS-правила с градиентом верная?", explain: "background-image: linear-gradient(to right, red, blue); — правильное название свойства, функции и порядок аргументов." },
];

function Tasks() {
  const stepper = useTaskStepper(9, "gradient");
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
      nextClassName="bg-gradient-to-r from-fuchsia-500 to-pink-600"
    >
      {(task === 0 || task === 7 || task === 8) && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <McqLevel key={task} options={["background-image", "background-color", "color", "border-image"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <DirectionMatchLevel key={task} target="to bottom" onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && <DirectionMatchLevel key={task} target="to right" onResult={(c) => stepper.markResult(c)} />}
      {task === 3 && <DirectionMatchLevel key={task} target="135deg" onResult={(c) => stepper.markResult(c)} />}
      {task === 4 && <DirectionMatchLevel key={task} target="to left" onResult={(c) => stepper.markResult(c)} />}
      {task === 5 && <TypeGradientLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 6 && <ColorCountLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 7 && (
        <McqLevel
          key={task}
          options={[
            "radial расходится от центра, linear идёт по прямой",
            "Это одно и то же",
            "radial работает только с чёрным цветом",
            "linear работает только в Safari",
          ]}
          correctIndex={0}
          onResult={(c) => stepper.markResult(c)}
        />
      )}
      {task === 8 && (
        <McqLevel
          key={task}
          options={[
            "background-image: linear-gradient(to right, red, blue);",
            "background: gradient(red, blue, to right);",
            "background-image: gradient linear(red, blue);",
            "linear-gradient: background-image(red, blue);",
          ]}
          correctIndex={0}
          onResult={(c) => stepper.markResult(c)}
        />
      )}
    </LevelShell>
  );
}

export function GradientTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="Плавный переход цветов"
        description="linear-gradient(направление, цвет1, цвет2) — градиент вместо обычной картинки."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="9 уровней — выбирай, подбирай направление и пиши сам." />
      <Tasks />
    </div>
  );
}
