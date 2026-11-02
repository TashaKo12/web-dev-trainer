import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { TrueFalseDeck, type TrueFalseStatement } from "../../components/TrueFalseDeck";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "font-weight")!;

const TRUE_FALSE: TrueFalseStatement[] = [
  { text: "font-weight управляет насыщенностью (жирностью) текста.", answer: true, explain: "Да, это свойство делает текст тоньше или жирнее." },
  { text: "Числовое значение bold равно 700.", answer: true, explain: "bold — это именованный аналог числа 700." },
  { text: "normal соответствует числу 900.", answer: false, explain: "normal соответствует 400 — обычной, не жирной насыщенности. 900 — это максимально жирный текст." },
  { text: "Чем МЕНЬШЕ число в font-weight, тем ЖИРНЕЕ текст.", answer: false, explain: "Наоборот — чем больше число, тем жирнее текст. Маленькие числа вроде 300 делают шрифт тоньше." },
  { text: "900 — это максимальная жирность из стандартной шкалы значений font-weight.", answer: true, explain: "Да, шкала обычно идёт от 100 (самый тонкий) до 900 (самый жирный)." },
  { text: "font-weight можно задать и числом, и именованным словом вроде bold или normal.", answer: true, explain: "Да, оба варианта работают одинаково — bold это то же самое, что 700." },
  { text: "font-weight: 400 делает текст жирнее, чем font-weight: 800.", answer: false, explain: "Наоборот — 800 жирнее, чем 400. 400 — это обычная насыщенность текста." },
  { text: "300 — одно из более тонких (светлых) значений жирности шрифта.", answer: true, explain: "Да, 300 находится ниже стандартных 400 и делает текст тоньше обычного." },
  { text: "Если не указать font-weight вообще, текст всегда будет максимально жирным (900).", answer: false, explain: "По умолчанию браузер использует normal (400) — обычную насыщенность, а не максимальную жирность." },
  { text: "У font-weight есть только два возможных значения: bold и normal.", answer: false, explain: "На самом деле можно использовать и числа от 100 до 900 — вариантов намного больше, чем просто bold и normal." },
];

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

function TypeLevel({
  word = "bold",
  weightNum = 700,
  altAccept = "700",
  prompt = "Напиши значение font-weight, чтобы сделать текст жирным (именем, не числом).",
  onResult,
}: {
  word?: string;
  weightNum?: number;
  altAccept?: string;
  prompt?: string;
  onResult: (correct: boolean) => void;
}) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);
  const weight = /^\d+$/.test(text.trim()) ? Number(text.trim()) : text.trim().toLowerCase() === word ? weightNum : 400;

  function check() {
    setChecked(true);
    onResult(text.trim().toLowerCase() === word || text.trim() === altAccept);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">{prompt}</p>
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

function CompareBoldLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [picked, setPicked] = useState<"a" | "b" | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(picked === "b");
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Кликни на текст, у которого font-weight БОЛЬШЕ (он жирнее).</p>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={checked}
          onClick={() => setPicked("a")}
          style={{ fontWeight: 400 }}
          className={`rounded-xl border-2 p-4 text-lg text-slate-700 transition disabled:cursor-not-allowed ${picked === "a" ? "border-purple-500 bg-purple-50" : "border-slate-200"}`}
        >
          Текст А
        </button>
        <button
          type="button"
          disabled={checked}
          onClick={() => setPicked("b")}
          style={{ fontWeight: 800 }}
          className={`rounded-xl border-2 p-4 text-lg text-slate-700 transition disabled:cursor-not-allowed ${picked === "b" ? "border-purple-500 bg-purple-50" : "border-slate-200"}`}
        >
          Текст Б
        </button>
      </div>
      {!checked && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!picked}
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
  { badge: "подбери значение", prompt: "", explain: "300 — одно из более лёгких (тонких) значений жирности." },
  { badge: "подбери значение", prompt: "", explain: "900 — максимальная жирность из стандартной шкалы значений." },
  { badge: "выбери из списка", prompt: "Какое числовое значение font-weight соответствует именованному normal?", explain: "normal = 400 — это и есть обычная, не жирная и не тонкая насыщенность." },
  { badge: "напиши сам", prompt: "", explain: "normal (или числом 400) возвращает обычную, не жирную насыщенность." },
  { badge: "выбери из списка", prompt: "Какое значение из списка самое ТОНКОЕ (светлое)?", explain: "Чем меньше число, тем тоньше (светлее) шрифт — из перечисленных вариантов 300 самое лёгкое." },
  { badge: "кликни на жирный", prompt: "", explain: "font-weight: 800 заметно жирнее, чем font-weight: 400 — чем больше число, тем жирнее текст." },
];

function Tasks() {
  const stepper = useTaskStepper(9, "font-weight");
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
      {(task === 1 || task === 5 || task === 7) && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <MatchLevel key={task} target={700} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <McqLevel key={task} options={["400", "500", "700", "900"]} correctIndex={2} onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && <TypeLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 3 && <MatchLevel key={task} target={300} onResult={(c) => stepper.markResult(c)} />}
      {task === 4 && <MatchLevel key={task} target={900} onResult={(c) => stepper.markResult(c)} />}
      {task === 5 && <McqLevel key={task} options={["300", "400", "700", "900"]} correctIndex={1} onResult={(c) => stepper.markResult(c)} />}
      {task === 6 && <TypeLevel key={task} word="normal" weightNum={400} altAccept="400" prompt="Напиши значение font-weight, чтобы вернуть ОБЫЧНУЮ (не жирную) насыщенность." onResult={(c) => stepper.markResult(c)} />}
      {task === 7 && <McqLevel key={task} options={["900", "400", "300", "700"]} correctIndex={2} onResult={(c) => stepper.markResult(c)} />}
      {task === 8 && <CompareBoldLevel key={task} onResult={(c) => stepper.markResult(c)} />}
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
      <SectionHeading kicker="Практика" title="Закрепим" description="9 уровней — подбирай значение, выбирай и пиши сам." />
      <Tasks />
      <SectionHeading
        kicker="Проверь себя"
        title="Верно или неверно?"
        description="Пролистай 10 карточек — угадай, где правда, а где нет."
      />
      <TrueFalseDeck statements={TRUE_FALSE} accent={meta.gradient} />
    </div>
  );
}
