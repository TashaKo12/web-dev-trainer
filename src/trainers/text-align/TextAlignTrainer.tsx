import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "text-align")!;

const ALIGNS = ["left", "center", "right", "justify"] as const;
type Align = (typeof ALIGNS)[number];

const SAMPLE = "Меню кафе «Тыковка»: основные блюда, закуски и напитки собраны в одном уютном месте.";

function Theory() {
  const [align, setAlign] = useState<Align>("left");

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-5 text-slate-600">
        <code className="rounded bg-slate-100 px-1">text-align</code> управляет тем, куда прижимается текст
        внутри своего блока. У justify, в отличие от остальных, выравниваются сразу ОБЕ стороны — кроме
        последней, самой короткой строки.
      </p>
      <div className="mb-4 flex flex-wrap gap-2">
        {ALIGNS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAlign(a)}
            className={`rounded-full border-2 px-4 py-1.5 font-mono text-xs font-bold transition ${
              align === a ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500 hover:border-sky-200"
            }`}
          >
            {a}
          </button>
        ))}
      </div>
      <p style={{ textAlign: align }} className="rounded-2xl bg-slate-50 p-5 text-slate-700">
        {SAMPLE}
      </p>
    </div>
  );
}

function MatchLevel({ target, onResult }: { target: Align; onResult: (correct: boolean) => void }) {
  const [value, setValue] = useState<Align>("left");
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(value === target);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Выбери text-align так, чтобы твой текст встал как на образце.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Образец</p>
          <p style={{ textAlign: target }} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            Привет! Это пример текста покороче.
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Твой текст</p>
          <p style={{ textAlign: value }} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            Привет! Это пример текста покороче.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {ALIGNS.map((a) => (
          <button
            key={a}
            type="button"
            disabled={checked}
            onClick={() => setValue(a)}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition disabled:cursor-not-allowed ${
              value === a ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-sky-100"
            }`}
          >
            {a}
          </button>
        ))}
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            className="rounded-full bg-gradient-to-r from-sky-400 to-blue-500 px-5 py-2 text-sm font-bold text-white shadow"
          >
            Проверить
          </button>
        </div>
      )}
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
            className="rounded-full bg-gradient-to-r from-sky-400 to-blue-500 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
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
  const value = ALIGNS.includes(text.trim().toLowerCase() as Align) ? (text.trim().toLowerCase() as Align) : "left";

  function check() {
    setChecked(true);
    onResult(text.trim().toLowerCase() === "center");
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Напиши значение text-align, чтобы заголовок встал ровно по центру карточки.</p>
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
        <input
          type="text"
          value={text}
          onChange={(e) => !checked && setText(e.target.value)}
          disabled={checked}
          placeholder="значение text-align"
          className="w-full rounded-xl border-2 border-sky-200 px-3 py-2 font-mono text-sm outline-none focus:border-sky-400 disabled:opacity-60"
        />
        <p style={{ textAlign: value }} className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
          Пиццерия «Ломтик»
        </p>
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!text.trim()}
            className="rounded-full bg-gradient-to-r from-sky-400 to-blue-500 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const TASK_META = [
  { badge: "подбери значение", prompt: "", explain: "text-align: center центрирует текст внутри его блока." },
  { badge: "подбери значение", prompt: "", explain: "text-align: right прижимает текст к правому краю блока." },
  { badge: "выбери из списка", prompt: "Какое значение text-align растягивает КАЖДУЮ строку так, чтобы её края ровно совпадали и слева, и справа (кроме последней, короткой строки)?", explain: "justify — «выключка», текст в газетах и книгах часто оформлен именно так." },
  { badge: "напиши сам", prompt: "", explain: "text-align: center — центрирует содержимое по горизонтали." },
];

function Tasks() {
  const stepper = useTaskStepper(4, "text-align");
  const task = stepper.index;
  const meta = TASK_META[task];

  if (stepper.allAnswered) {
    return <CompletionBanner score={stepper.score} total={4} onRestart={() => stepper.restart()} />;
  }

  return (
    <LevelShell
      total={4}
      index={task}
      statuses={stepper.statuses}
      status={stepper.status}
      isLast={stepper.isLast}
      badge={meta.badge}
      explain={meta.explain}
      onJump={stepper.goTo}
      onNext={stepper.goNext}
      nextClassName="bg-gradient-to-r from-sky-400 to-blue-500"
    >
      {task === 2 && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <MatchLevel key={task} target="center" onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <MatchLevel key={task} target="right" onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && <McqLevel key={task} options={["left", "center", "right", "justify"]} correctIndex={3} onResult={(c) => stepper.markResult(c)} />}
      {task === 3 && <TypeLevel key={task} onResult={(c) => stepper.markResult(c)} />}
    </LevelShell>
  );
}

export function TextAlignTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="Куда прижать текст"
        description="left, center, right, justify — четыре значения text-align."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="4 уровня — подбирай значение и пиши сам." />
      <Tasks />
    </div>
  );
}
