import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "font-size")!;

function Theory() {
  const [size, setSize] = useState(24);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-6 text-slate-600">
        <code className="rounded bg-slate-100 px-1">font-size</code> задаёт размер текста. Чаще всего в пикселях
        (px), но бывает и в других единицах.
      </p>
      <div className="grid gap-5 sm:grid-cols-[1fr_1.2fr]">
        <label className="block">
          <span className="mb-1 flex justify-between text-sm font-bold text-purple-700">
            <span>font-size</span>
            <span>{size}px</span>
          </span>
          <input type="range" min={10} max={64} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-purple-600" />
        </label>
        <div className="flex items-center justify-center rounded-2xl bg-slate-50 p-5">
          <p style={{ fontSize: size }} className="font-bold text-slate-700">
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
  const [value, setValue] = useState(16);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(Math.abs(value - target) <= 2);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Подвинь ползунок так, чтобы твой текст стал примерно такого же размера, как образец.</p>
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Образец</p>
          <p style={{ fontSize: target }} className="rounded-xl bg-slate-50 p-3 text-center font-bold">
            Привет!
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Твой текст</p>
          <p style={{ fontSize: value }} className="rounded-xl bg-slate-50 p-3 text-center font-bold">
            Привет!
          </p>
        </div>
      </div>
      <input type="range" min={10} max={64} value={value} onChange={(e) => !checked && setValue(Number(e.target.value))} disabled={checked} className="w-full accent-purple-600" />
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

function FixBugLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [size, setSize] = useState(9);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(size >= 16);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Текст слишком мелкий, его неудобно читать. Увеличь font-size хотя бы до 16px.</p>
      <p style={{ fontSize: size }} className="mb-4 rounded-xl bg-slate-50 p-3 text-slate-700">
        Важное объявление для всех посетителей сайта.
      </p>
      <input type="range" min={8} max={32} value={size} onChange={(e) => !checked && setSize(Number(e.target.value))} disabled={checked} className="w-full accent-purple-600" />
      <p className="mt-1 text-xs text-slate-400">{size}px</p>
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

function TypePxLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);
  const size = /^\d+px$/.test(text.trim()) ? Number(text.trim().replace("px", "")) : 16;

  function check() {
    setChecked(true);
    onResult(text.trim().toLowerCase() === "24px");
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Напиши значение font-size в пикселях, чтобы текст стал ровно 24px.</p>
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
        <input
          type="text"
          value={text}
          onChange={(e) => !checked && setText(e.target.value)}
          disabled={checked}
          placeholder="значение font-size"
          className="w-full rounded-xl border-2 border-purple-200 px-3 py-2 font-mono text-sm outline-none focus:border-purple-400 disabled:opacity-60"
        />
        <p style={{ fontSize: size }} className="rounded-2xl bg-slate-50 p-4 text-center font-bold text-slate-700">
          Привет!
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

function ShrinkBugLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [size, setSize] = useState(48);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(size <= 14);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Подпись под картинкой получилась огромной. Уменьши font-size до 14px или меньше.</p>
      <p style={{ fontSize: size }} className="mb-4 rounded-xl bg-slate-50 p-3 text-slate-700">
        Фото с дня рождения, 2026 год
      </p>
      <input type="range" min={10} max={48} value={size} onChange={(e) => !checked && setSize(Number(e.target.value))} disabled={checked} className="w-full accent-purple-600" />
      <p className="mt-1 text-xs text-slate-400">{size}px</p>
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

const TASK_META = [
  { badge: "подбери значение", prompt: "", explain: "Точный px не важен — главное, чтобы размер текста совпал с образцом." },
  { badge: "выбери из списка", prompt: "Текст заголовка должен быть заметно крупнее обычного абзаца. Какое значение font-size для заголовка разумнее?", explain: "32px заметно крупнее стандартных 16px текста абзаца — заголовок будет выделяться." },
  { badge: "почини баг", prompt: "", explain: "16px — общепринятый минимум для комфортного чтения основного текста." },
  { badge: "подбери значение", prompt: "", explain: "Главное — совпасть с образцом, точное число не важно." },
  { badge: "подбери значение", prompt: "", explain: "Для очень крупного текста (например, большого заголовка) подходят значения от 48px и выше." },
  { badge: "напиши сам", prompt: "", explain: "24px — конкретное значение в пикселях, самая распространённая единица для font-size." },
  { badge: "выбери из списка", prompt: "Какая единица измерения чаще всего используется для font-size в CSS?", explain: "px (пиксели) — самая распространённая и понятная единица размера шрифта." },
  { badge: "выбери из списка", prompt: "Если font-size вообще не указывать, какой размер применит браузер по умолчанию?", explain: "16px — стандартный размер текста в большинстве браузеров без дополнительных настроек." },
  { badge: "почини баг", prompt: "", explain: "14px и меньше — подходящий размер для мелких подписей, которые не должны отвлекать внимание от главного." },
];

function Tasks() {
  const stepper = useTaskStepper(9, "font-size");
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
      nextClassName="bg-gradient-to-r from-purple-500 to-fuchsia-600"
    >
      {(task === 1 || task === 6 || task === 7) && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <MatchLevel key={task} target={40} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <McqLevel key={task} options={["12px", "16px", "32px", "16px (как и абзац)"]} correctIndex={2} onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && <FixBugLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 3 && <MatchLevel key={task} target={12} onResult={(c) => stepper.markResult(c)} />}
      {task === 4 && <MatchLevel key={task} target={56} onResult={(c) => stepper.markResult(c)} />}
      {task === 5 && <TypePxLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 6 && <McqLevel key={task} options={["px", "kg", "sec", "deg"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 7 && <McqLevel key={task} options={["16px", "10px", "20px", "0px"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 8 && <ShrinkBugLevel key={task} onResult={(c) => stepper.markResult(c)} />}
    </LevelShell>
  );
}

export function FontSizeTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="Размер текста"
        description="font-size управляет размером шрифта — обычно в пикселях."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="9 уровней — подбирай значение, выбирай и почини баг." />
      <Tasks />
    </div>
  );
}
