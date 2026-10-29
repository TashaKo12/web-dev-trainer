import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "background-color")!;

const SWATCHES = ["#f8fafc", "#fde68a", "#bbf7d0", "#bfdbfe", "#ddd6fe", "#111827"] as const;

function Card({ bg, textDark = true }: { bg: string; textDark?: boolean }) {
  return (
    <div style={{ background: bg }} className="flex h-28 w-full items-center justify-center rounded-2xl p-4 shadow-inner">
      <span className={`text-sm font-bold ${textDark ? "text-slate-700" : "text-white"}`}>Карточка</span>
    </div>
  );
}

function Theory() {
  const [bg, setBg] = useState<(typeof SWATCHES)[number]>("#fde68a");
  const [custom, setCustom] = useState("");
  const applied = custom.trim() || bg;

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-5 text-slate-600">
        <code className="rounded bg-slate-100 px-1">background-color</code> красит ФОН блока — всё содержимое
        внутри (текст, картинки) остаётся как было.
      </p>
      <div className="grid gap-5 sm:grid-cols-[1fr_1.1fr]">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setBg(c);
                  setCustom("");
                }}
                className="h-8 w-8 rounded-full border-2 border-slate-200 shadow"
                style={{ background: c, outline: !custom && bg === c ? "2px solid #7c3aed" : "none" }}
              />
            ))}
          </div>
          <input
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="или впиши своё значение: coral, #f87171..."
            className="w-full rounded-lg border-2 border-slate-200 px-2 py-1.5 font-mono text-xs"
          />
          <div className="rounded-2xl bg-slate-50 p-3 font-mono text-xs text-slate-600">background-color: {applied};</div>
        </div>
        <Card bg={applied} />
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
            className="rounded-full bg-gradient-to-r from-violet-500 to-purple-700 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function MatchLevel({ target, onResult }: { target: string; onResult: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(selected === target);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Подбери фон так, чтобы твоя карточка совпала с образцом.</p>
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Образец</p>
          <Card bg={target} />
        </div>
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Твоя карточка</p>
          <Card bg={selected ?? "#ffffff"} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {SWATCHES.map((c) => (
          <button
            key={c}
            type="button"
            disabled={checked}
            onClick={() => setSelected(c)}
            className="h-9 w-9 rounded-full border-2 border-slate-200 shadow disabled:cursor-not-allowed"
            style={{ background: c, outline: selected === c ? "2px solid #7c3aed" : "none" }}
          />
        ))}
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!selected}
            className="rounded-full bg-gradient-to-r from-violet-500 to-purple-700 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function TypeLevel({ check, placeholder, prompt, onResult }: { check: (v: string) => boolean; placeholder: string; prompt: string; onResult: (correct: boolean) => void }) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">{prompt}</p>
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
        <input
          type="text"
          value={text}
          onChange={(e) => !checked && setText(e.target.value)}
          disabled={checked}
          placeholder={placeholder}
          className="w-full rounded-xl border-2 border-violet-200 px-3 py-2 font-mono text-sm outline-none focus:border-violet-400 disabled:opacity-60"
        />
        <Card bg={text || "#f8fafc"} />
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => {
              setChecked(true);
              onResult(check(text));
            }}
            disabled={!text.trim()}
            className="rounded-full bg-gradient-to-r from-violet-500 to-purple-700 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function FixBugLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const options = ["#111827", "#1e293b", "#ffffff", "#334155"];

  function check() {
    setChecked(true);
    onResult(selected !== "#ffffff");
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        Текст карточки белый (color: white), а фон карточки сейчас тоже БЕЛЫЙ — текст сливается с фоном. Выбери
        ТЁМНЫЙ background-color, чтобы белый текст снова стало видно.
      </p>
      <div style={{ background: selected ?? "#ffffff" }} className="mb-4 flex h-24 items-center justify-center rounded-2xl shadow-inner">
        <span className="text-sm font-bold text-white">Важное сообщение</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((c) => (
          <button
            key={c}
            type="button"
            disabled={checked}
            onClick={() => setSelected(c)}
            className="h-9 w-9 rounded-full border-2 border-slate-300 shadow disabled:cursor-not-allowed"
            style={{ background: c, outline: selected === c ? "2px solid #7c3aed" : "none" }}
          />
        ))}
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!selected}
            className="rounded-full bg-gradient-to-r from-violet-500 to-purple-700 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const TASK_META = [
  { badge: "выбери из списка", prompt: "Какое свойство красит ФОН блока, а не сам текст внутри него?", explain: "background-color — красит фон. color красит текст, это другое свойство." },
  { badge: "подбери цвет", prompt: "", explain: "Фон можно подбирать и по названию цвета, и по HEX-коду — главное, чтобы итог совпал с образцом." },
  { badge: "напиши сам", prompt: "Напиши значение background-color именем цвета, чтобы фон стал голубым (skyblue).", explain: "skyblue — одно из именованных CSS-значений цвета." },
  { badge: "напиши сам", prompt: "Напиши значение background-color в HEX-формате, чтобы фон стал белым.", explain: "#ffffff (или #fff) — HEX-код белого цвета." },
  { badge: "почини баг", prompt: "", explain: "Тёмный фон (например #111827) делает белый текст снова читаемым — важно, чтобы цвет текста и цвет фона достаточно отличались." },
];

function Tasks() {
  const stepper = useTaskStepper(5, "background-color");
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
      nextClassName="bg-gradient-to-r from-violet-500 to-purple-700"
    >
      {task === 0 && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <McqLevel key={task} options={["background-color", "color", "border-color", "fill"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <MatchLevel key={task} target="#bfdbfe" onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && <TypeLevel key={task} prompt={meta.prompt} placeholder="значение background-color" check={(v) => v.trim().toLowerCase() === "skyblue"} onResult={(c) => stepper.markResult(c)} />}
      {task === 3 && <TypeLevel key={task} prompt={meta.prompt} placeholder="значение background-color" check={(v) => ["#ffffff", "#fff"].includes(v.trim().toLowerCase())} onResult={(c) => stepper.markResult(c)} />}
      {task === 4 && <FixBugLevel key={task} onResult={(c) => stepper.markResult(c)} />}
    </LevelShell>
  );
}

export function BackgroundColorTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="Покрась фон блока"
        description="background-color меняет фон карточки целиком — текст внутри цвет не меняет."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="5 уровней — выбирай и пиши сам." />
      <Tasks />
    </div>
  );
}
