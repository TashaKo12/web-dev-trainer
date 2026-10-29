import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "headings")!;

const LEVELS_H = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
const SIZE_CLS: Record<(typeof LEVELS_H)[number], string> = {
  h1: "text-3xl font-extrabold",
  h2: "text-2xl font-extrabold",
  h3: "text-xl font-bold",
  h4: "text-lg font-bold",
  h5: "text-base font-bold",
  h6: "text-sm font-bold uppercase tracking-wide",
};

function Theory() {
  const [active, setActive] = useState<(typeof LEVELS_H)[number]>("h1");

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-5 text-slate-600">
        Заголовков шесть уровней — от <code className="rounded bg-slate-100 px-1">h1</code> (самый крупный и
        важный) до <code className="rounded bg-slate-100 px-1">h6</code> (самый мелкий). Нажимай на теги —
        справа сразу видно, как они выглядят.
      </p>
      <div className="grid gap-5 sm:grid-cols-[1fr_1.3fr]">
        <div className="flex flex-wrap gap-2">
          {LEVELS_H.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setActive(h)}
              className={`rounded-full border-2 px-4 py-1.5 font-mono text-xs font-bold transition ${
                active === h ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-500 hover:border-rose-200"
              }`}
            >
              &lt;{h}&gt;
            </button>
          ))}
        </div>
        <div className="rounded-2xl bg-slate-50 p-5">
          <div className={`${SIZE_CLS[active]} text-slate-800`}>Заголовок {active}</div>
          <p className="mt-3 text-xs text-slate-400">
            {active === "h1"
              ? "Главный заголовок страницы — на странице он обычно один."
              : "Заголовок раздела — таких тегов на странице может быть много."}
          </p>
        </div>
      </div>
      <div className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm text-rose-800">
        Теги выбирают по СМЫСЛУ (главный раздел / подраздел), а не по тому, насколько крупным должен выглядеть
        текст — размер можно поменять потом через CSS.
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
            className="rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

type ArticleKey = "h1" | "h2a" | "p1" | "h2b" | "p2";

function MiniArticle({ selected, onPick }: { selected: ArticleKey | null; onPick: (k: ArticleKey) => void }) {
  function cls(key: ArticleKey, base: string) {
    const isSel = selected === key;
    return `${base} cursor-pointer rounded-lg px-2 py-1 transition ${isSel ? "bg-rose-100 ring-2 ring-rose-400" : "hover:bg-slate-100"}`;
  }
  return (
    <div className="rounded-2xl bg-white p-4 text-left shadow-inner">
      <div className={cls("h1", "text-xl font-extrabold text-slate-800")} onClick={() => onPick("h1")}>
        Меню кафе «Тыковка»
      </div>
      <div className={cls("h2a", "mt-2 text-base font-bold text-slate-700")} onClick={() => onPick("h2a")}>
        Основные блюда
      </div>
      <p className={cls("p1", "mt-1 text-sm text-slate-500")} onClick={() => onPick("p1")}>
        Тайская лапша с креветками, баттер чикен...
      </p>
      <div className={cls("h2b", "mt-2 text-base font-bold text-slate-700")} onClick={() => onPick("h2b")}>
        Напитки
      </div>
      <p className={cls("p2", "mt-1 text-sm text-slate-500")} onClick={() => onPick("p2")}>
        Молоко, лимонад, соки...
      </p>
    </div>
  );
}

function PickHeadingTask({ target, prompt, onResult }: { target: ArticleKey; prompt: string; onResult: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<ArticleKey | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(selected === target);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">{prompt}</p>
      <MiniArticle selected={selected} onPick={(k) => !checked && setSelected(k)} />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!selected}
            className="rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function TypeLevel({ expected, placeholder, onResult }: { expected: string; placeholder: string; onResult: (correct: boolean) => void }) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(text.trim().toLowerCase().replace(/[<>]/g, "") === expected);
  }

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={(e) => !checked && setText(e.target.value)}
        disabled={checked}
        placeholder={placeholder}
        className="w-48 rounded-full border-2 border-slate-300 px-4 py-2 text-center font-mono font-semibold text-slate-700 outline-none focus:border-rose-400 disabled:opacity-60"
      />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!text.trim()}
            className="rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const TASK_META = [
  { badge: "выбери из списка", prompt: "На странице должен быть ОДИН главный заголовок — название всей страницы. Какой тег?", explain: "h1 — главный заголовок. На странице он обычно один." },
  { badge: "выбери из списка", prompt: "Нужен заголовок РАЗДЕЛА внутри страницы — он меньше, чем h1, но крупнее h3. Какой тег?", explain: "h2 — заголовок раздела, на странице таких тегов может быть много." },
  { badge: "кликни на мини-странице", prompt: "", explain: "«Основные блюда» — это заголовок раздела внутри страницы, поэтому здесь используется h2, а не h1 (он уже занят названием кафе)." },
  { badge: "кликни на мини-странице", prompt: "", explain: "Второй h2 на странице — это нормально: у h1 (в отличие от h2) обычно только одна копия, а подзаголовков может быть сколько угодно." },
  { badge: "напиши сам", prompt: "Какой тег заголовка самый МЕЛКИЙ по иерархии (ниже него заголовков уже нет)?", explain: "h6 — последний, самый глубокий уровень заголовков." },
];

function Tasks() {
  const stepper = useTaskStepper(5, "headings");
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
      nextClassName="bg-gradient-to-r from-rose-500 to-pink-600"
    >
      {meta.prompt && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <McqLevel key={task} options={["h1", "h2", "h3", "p"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <McqLevel key={task} options={["h1", "h2", "h4", "h5"]} correctIndex={1} onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && <PickHeadingTask key={task} target="h2a" prompt='Кликни на элемент, который в этом макете должен быть тегом h2 — заголовок раздела "Основные блюда".' onResult={(c) => stepper.markResult(c)} />}
      {task === 3 && <PickHeadingTask key={task} target="h2b" prompt="А теперь найди ВТОРОЙ h2 на этой же мини-странице." onResult={(c) => stepper.markResult(c)} />}
      {task === 4 && <TypeLevel key={task} expected="h6" placeholder="название тега" onResult={(c) => stepper.markResult(c)} />}
    </LevelShell>
  );
}

export function HeadingsTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="Шесть уровней заголовков"
        description="h1 — главный заголовок страницы, h2–h6 — заголовки разделов и подразделов."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="5 уровней — выбирай, кликай на мини-странице и пиши сам." />
      <Tasks />
    </div>
  );
}
