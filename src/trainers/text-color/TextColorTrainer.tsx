import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "text-color")!;

const SWATCHES = ["#1e293b", "#dc2626", "#16a34a", "#2563eb", "#9333ea", "#ffffff"] as const;

function Theory() {
  const [color, setColor] = useState<(typeof SWATCHES)[number]>("#2563eb");
  const [custom, setCustom] = useState("");

  const applied = custom.trim() || color;

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-5 text-slate-600">
        Свойство <code className="rounded bg-slate-100 px-1">color</code> красит сам текст. Значение можно задать
        именем цвета (red, tomato), HEX-кодом (#2563eb) и другими способами.
      </p>
      <div className="grid gap-5 sm:grid-cols-[1fr_1.1fr]">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setColor(c);
                  setCustom("");
                }}
                className="h-8 w-8 rounded-full border-2 border-white shadow"
                style={{ background: c, outline: !custom && color === c ? "2px solid #334155" : "none" }}
              />
            ))}
          </div>
          <input
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="или впиши своё значение: tomato, #ff6b6b..."
            className="w-full rounded-lg border-2 border-slate-200 px-2 py-1.5 font-mono text-xs"
          />
          <div className="rounded-2xl bg-slate-50 p-3 font-mono text-xs text-slate-600">color: {applied};</div>
        </div>
        <div className="flex items-center justify-center rounded-2xl bg-white p-6 shadow-inner">
          <p style={{ color: applied }} className="text-2xl font-extrabold">
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
            className="rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
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
      <p className="mb-3 text-sm text-slate-500">Подбери цвет так, чтобы твой текст совпал с образцом.</p>
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Образец</p>
          <p style={{ color: target }} className="rounded-xl bg-slate-50 p-3 text-lg font-bold">
            Привет!
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Твой текст</p>
          <p style={{ color: selected ?? "#94a3b8" }} className="rounded-xl bg-slate-50 p-3 text-lg font-bold">
            Привет!
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {SWATCHES.map((c) => (
          <button
            key={c}
            type="button"
            disabled={checked}
            onClick={() => setSelected(c)}
            className="h-9 w-9 rounded-full border-2 border-white shadow disabled:cursor-not-allowed"
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
            className="rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function TypeLevel({ check, placeholder, prompt, preview, onResult }: { check: (v: string) => boolean; placeholder: string; prompt: string; preview: (v: string) => string; onResult: (correct: boolean) => void }) {
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
          className="w-full rounded-xl border-2 border-fuchsia-200 px-3 py-2 font-mono text-sm outline-none focus:border-fuchsia-400 disabled:opacity-60"
        />
        <div className="flex items-center justify-center rounded-2xl bg-slate-50 p-4">
          <p style={{ color: preview(text) }} className="text-lg font-bold">
            Привет!
          </p>
        </div>
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
            className="rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
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
  const options = ["#ffffff", "#1e293b", "#f8fafc", "#f1f5f9"];

  function check() {
    setChecked(true);
    onResult(selected === "#1e293b");
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        На карточке белый текст на белом фоне — его совсем не видно! Выбери цвет text-а, чтобы текст снова стал
        читаемым.
      </p>
      <div className="mb-4 rounded-xl bg-white p-4 text-center shadow-inner">
        <p style={{ color: selected ?? "#ffffff" }} className="font-bold">
          Важное сообщение
        </p>
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
            className="rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const TASK_META = [
  { badge: "выбери из списка", prompt: "Какое свойство красит сам ТЕКСТ (а не фон вокруг него)?", explain: "color — красит текст. background-color красит фон элемента, это другое свойство." },
  { badge: "подбери цвет", prompt: "", explain: "Значения цвета можно подбирать как по названию, так и по HEX-коду — главное, чтобы итоговый цвет совпал." },
  { badge: "напиши сам", prompt: "Напиши значение color именем цвета, чтобы текст стал красным.", explain: "red — одно из именованных CSS-значений цвета." },
  { badge: "напиши сам", prompt: "Напиши значение color в HEX-формате, чтобы текст стал чёрным.", explain: "#000000 (или короткая запись #000) — HEX-код чёрного цвета." },
  { badge: "почини баг", prompt: "", explain: "Тёмный цвет текста (например #1e293b) на светлом фоне карточки снова делает текст читаемым." },
];

function Tasks() {
  const stepper = useTaskStepper(5, "text-color");
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
      nextClassName="bg-gradient-to-r from-fuchsia-500 to-purple-600"
    >
      {task === 0 && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <McqLevel key={task} options={["color", "background-color", "border-color", "font-color"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <MatchLevel key={task} target="#16a34a" onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && (
        <TypeLevel
          key={task}
          prompt={meta.prompt}
          placeholder="значение color"
          preview={(v) => v || "#1e293b"}
          check={(v) => v.trim().toLowerCase() === "red"}
          onResult={(c) => stepper.markResult(c)}
        />
      )}
      {task === 3 && (
        <TypeLevel
          key={task}
          prompt={meta.prompt}
          placeholder="значение color"
          preview={(v) => v || "#1e293b"}
          check={(v) => ["#000000", "#000"].includes(v.trim().toLowerCase())}
          onResult={(c) => stepper.markResult(c)}
        />
      )}
      {task === 4 && <FixBugLevel key={task} onResult={(c) => stepper.markResult(c)} />}
    </LevelShell>
  );
}

export function TextColorTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="Покрась текст свойством color"
        description="Значение цвета можно задать именем, HEX-кодом или своим вариантом — всё применяется вживую."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="5 уровней — выбирай и пиши сам." />
      <Tasks />
    </div>
  );
}
