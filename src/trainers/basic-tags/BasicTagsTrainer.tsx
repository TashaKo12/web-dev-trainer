import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "basic-tags")!;

type Snippet = { code: string; note: string; preview: () => JSX.Element };

const SNIPPETS: Snippet[] = [
  {
    code: "<h1>Музеи мира</h1>",
    note: "h1 — самый крупный заголовок. На странице он обычно один — это главный заголовок.",
    preview: () => <h1 className="text-3xl font-extrabold text-slate-800">Музеи мира</h1>,
  },
  {
    code: "<h2>Музей современного искусства</h2>",
    note: "h2 — заголовок поменьше, для разделов внутри страницы. Заголовков h2 может быть много.",
    preview: () => <h2 className="text-xl font-bold text-slate-700">Музей современного искусства</h2>,
  },
  {
    code: "<p>Обычный текст абзаца...</p>",
    note: "p — абзац. Внутри него — обычный читаемый текст.",
    preview: () => <p className="text-slate-600">Обычный текст абзаца с описанием.</p>,
  },
  {
    code: '<a href="...">Открыть музей</a>',
    note: "a — ссылка. Атрибут href указывает, куда она ведёт.",
    preview: () => <a className="font-semibold text-rose-600 underline">Открыть музей</a>,
  },
  {
    code: '<img src="..." alt="...">',
    note: "img — картинка. src — путь к файлу, alt — текст на случай, если картинка не загрузится.",
    preview: () => (
      <div className="flex h-16 w-28 items-center justify-center rounded-lg bg-slate-200 text-xs font-bold text-slate-500">
        🖼️ картинка
      </div>
    ),
  },
  {
    code: "<ul><li>Яблочный</li><li>Ананасовый</li></ul>",
    note: "ul + li — маркированный список. Порядок пунктов не важен.",
    preview: () => (
      <ul className="list-disc pl-5 text-slate-600">
        <li>Яблочный</li>
        <li>Ананасовый</li>
      </ul>
    ),
  },
  {
    code: "<ol><li>Яйцо 1 шт.</li><li>Сахар 2 ст. ложки</li></ol>",
    note: "ol + li — нумерованный список. Используй его, когда порядок важен (шаги рецепта, инструкция).",
    preview: () => (
      <ol className="list-decimal pl-5 text-slate-600">
        <li>Яйцо 1 шт.</li>
        <li>Сахар 2 ст. ложки</li>
      </ol>
    ),
  },
];

function Theory() {
  const [active, setActive] = useState(0);
  const snippet = SNIPPETS[active];

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-5 text-slate-600">
        Нажимай на теги слева — справа появится то, как они выглядят на настоящей странице.
      </p>
      <div className="grid gap-5 sm:grid-cols-[1.1fr_1fr]">
        <div className="space-y-1.5">
          {SNIPPETS.map((s, i) => (
            <button
              key={s.code}
              type="button"
              onClick={() => setActive(i)}
              className={`block w-full rounded-lg px-3 py-2 text-left font-mono text-xs transition ${
                i === active ? "bg-rose-600 text-white shadow" : "bg-slate-50 text-slate-600 hover:bg-rose-50"
              }`}
            >
              {s.code}
            </button>
          ))}
        </div>
        <div className="flex min-h-[140px] flex-col items-start justify-center gap-2 rounded-2xl bg-slate-50 p-5">
          {snippet.preview()}
        </div>
      </div>
      <div className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm text-rose-800">{snippet.note}</div>
    </div>
  );
}

type ElKey = "h1" | "link-h2" | "img" | "p1" | "p2";

function MiniArticle({ selected, onPick }: { selected: ElKey | null; onPick: (k: ElKey) => void }) {
  function cls(key: ElKey, base: string) {
    const isSel = selected === key;
    return `${base} cursor-pointer rounded-lg px-2 py-1 transition ${
      isSel ? "bg-rose-100 ring-2 ring-rose-400" : "hover:bg-slate-100"
    }`;
  }

  return (
    <div className="rounded-2xl bg-white p-4 text-left shadow-inner">
      <h1 className={cls("h1", "text-lg font-extrabold text-slate-800")} onClick={() => onPick("h1")}>
        Музеи мира
      </h1>
      <a className={cls("link-h2", "mt-2 block")} onClick={() => onPick("link-h2")}>
        <h2 className="text-base font-bold text-sky-700 underline">Музей современного искусства</h2>
      </a>
      <div className={cls("img", "mt-2 flex h-14 w-24 items-center justify-center bg-slate-200 text-[10px] font-bold text-slate-500")} onClick={() => onPick("img")}>
        🖼️ фото
      </div>
      <p className={cls("p1", "mt-2 text-sm text-slate-600")} onClick={() => onPick("p1")}>
        Музей спроектировал бразильский архитектор Оскар Нимейер.
      </p>
      <p className={cls("p2", "mt-2 text-sm text-slate-600")} onClick={() => onPick("p2")}>
        Билет в музей стоит недорого, по средам — бесплатно.
      </p>
    </div>
  );
}

function FindLinkTask({ onResult }: { onResult: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<ElKey | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(selected === "link-h2");
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        Как в проекте «Красивые музеи» — заголовок h2 обёрнут в тег ссылки a. Найди и нажми элемент, который
        одновременно и заголовок, и ссылка.
      </p>
      <MiniArticle selected={selected} onPick={(k) => !checked && setSelected(k)} />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!selected}
            className="rounded-full bg-gradient-to-r from-rose-500 to-red-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
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
            className="rounded-full bg-gradient-to-r from-rose-500 to-red-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function ImgTagLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(text.trim().toLowerCase().replace(/[<>]/g, "") === "img");
  }

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={(e) => !checked && setText(e.target.value)}
        disabled={checked}
        placeholder="название тега"
        className="w-48 rounded-full border-2 border-slate-300 px-4 py-2 text-center font-mono font-semibold text-slate-700 outline-none focus:border-rose-400 disabled:opacity-60"
      />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!text.trim()}
            className="rounded-full bg-gradient-to-r from-rose-500 to-red-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const TASK_META = [
  { badge: "выбери из списка", prompt: "На странице должен быть один главный, самый крупный заголовок. Какой тег для него нужен?", explain: "h1 — главный заголовок страницы. Обычно он один." },
  { badge: "выбери из списка", prompt: "Нужно вывести список ингредиентов рецепта, где порядок не важен (соль, сахар, молоко). Какой тег выбрать?", explain: "ul (unordered list) — маркированный список для пунктов без значимого порядка." },
  { badge: "выбери из списка", prompt: "А для шагов инструкции, где важен порядок («сначала взбей яйцо, потом добавь молоко»), подойдёт:", explain: "ol (ordered list) — нумерованный список, когда порядок пунктов важен." },
  { badge: "напиши сам", prompt: "Какой тег выводит на страницу картинку из файла (без учёта его атрибутов — просто имя тега)?", explain: "img — тег изображения. У него нет закрывающего тега, а путь к файлу указывается в атрибуте src." },
  { badge: "кликни на мини-странице", prompt: "Кликни по элементу, который одновременно и заголовок, и ссылка.", explain: 'Тег <a>, оборачивающий <h2>, делает заголовок кликабельным — это и заголовок, и ссылка одновременно.' },
];

function Tasks() {
  const stepper = useTaskStepper(5, "basic-tags");
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
      nextClassName="bg-gradient-to-r from-rose-500 to-red-600"
    >
      <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>
      {task === 0 && <McqLevel key={task} options={["h1", "h2", "h3", "p"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <McqLevel key={task} options={["ol", "ul", "li", "dl"]} correctIndex={1} onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && <McqLevel key={task} options={["ol", "ul", "a", "img"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 3 && <ImgTagLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 4 && <FindLinkTask key={task} onResult={(c) => stepper.markResult(c)} />}
    </LevelShell>
  );
}

export function BasicTagsTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} />
      <SectionHeading
        kicker="Теория"
        title="Разбери теги по кусочкам"
        description="Заголовки, абзацы, ссылки, картинки и списки — основа любой страницы."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="5 уровней — выбирай из списка, пиши сам и кликай на странице." />
      <Tasks />
    </div>
  );
}
