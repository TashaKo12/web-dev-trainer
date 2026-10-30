import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "font-weight")!;

const WEIGHTS = [300, 400, 500, 700, 900] as const;

function Theory() {
  const [weight, setWeight] = useState<(typeof WEIGHTS)[number]>(400);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-6 text-slate-600">
        <code className="rounded bg-slate-100 px-1">font-weight</code> задаёт насыщенность (жирность) шрифта — от
        тонкого до очень жирного. У именованных значений: normal = 400, bold = 700.
      </p>
      <div className="grid gap-5 sm:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-wrap gap-2">
          {WEIGHTS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWeight(w)}
              className={`rounded-full border-2 px-3 py-1.5 font-mono text-xs font-bold transition ${
                weight === w ? "border-purple-500 bg-purple-50 text-purple-700" : "border-slate-200 text-slate-500 hover:border-purple-200"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-center rounded-2xl bg-slate-50 p-5">
          <p style={{ fontWeight: weight }} className="text-2xl text-slate-700">
            Пример текста
          </p>
        </div>
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
      <McqOptions options={options} selected={choice} onSelect={(i) => !checked && setChoice(i)} disabled={checked} />
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

function MatchLevel({ target, onResult }: { target: number; onResult: (correct: boolean) => void }) {
  const [value, setValue] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(value === target);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Выбери font-weight так, чтобы твой текст совпал с образцом по жирности.</p>
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Образец</p>
          <p style={{ fontWeight: target }} className="rounded-xl bg-slate-50 p-3 text-center">
            Заголовок
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Твой текст</p>
          <p style={{ fontWeight: value ?? 400 }} className="rounded-xl bg-slate-50 p-3 text-center">
            Заголовок
          </p>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {WEIGHTS.map((w) => (
          <button
            key={w}
            type="button"
            disabled={checked}
            onClick={() => setValue(w)}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition disabled:cursor-not-allowed ${
              value === w ? "bg-purple-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-purple-100"
            }`}
          >
            {w}
          </button>
        ))}
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={value === null}
            className="rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
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
  const weight = /^\d+$/.test(text.trim()) ? Number(text.trim()) : text.trim().toLowerCase() === "bold" ? 700 : 400;

  function check() {
    setChecked(true);
    onResult(text.trim().toLowerCase() === "bold" || text.trim() === "700");
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Напиши значение font-weight, чтобы сделать текст жирным (именем, не числом).</p>
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
        <input
          type="text"
          value={text}
          onChange={(e) => !checked && setText(e.target.value)}
          disabled={checked}
          placeholder="значение font-weight"
          className="w-full rounded-xl border-2 border-purple-200 px-3 py-2 font-mono text-sm outline-none focus:border-purple-400 disabled:opacity-60"
        />
        <p style={{ fontWeight: weight }} className="rounded-2xl bg-slate-50 p-4 text-center text-slate-700">
          Пример текста
        </p>
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!text.trim()}
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
  { badge: "подбери значение", prompt: "", explain: "700 — числовой эквивалент именованного значения bold." },
  { badge: "выбери из списка", prompt: "Какое числовое значение font-weight соответствует именованному bold?", explain: "bold = 700. normal = 400." },
  { badge: "напиши сам", prompt: "", explain: "bold (или числом 700) делает текст жирным." },
];

function Tasks() {
  const stepper = useTaskStepper(3, "font-weight");
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
      nextClassName="bg-gradient-to-r from-purple-500 to-fuchsia-600"
    >
      {task === 1 && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <MatchLevel key={task} target={700} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <McqLevel key={task} options={["400", "500", "700", "900"]} correctIndex={2} onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && <TypeLevel key={task} onResult={(c) => stepper.markResult(c)} />}
    </LevelShell>
  );
}

export function FontWeightTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="Насыщенность шрифта"
        description="font-weight — от тонкого (300) до очень жирного (900). bold = 700, normal = 400."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="3 уровня — подбирай значение и пиши сам." />
      <Tasks />
    </div>
  );
}
