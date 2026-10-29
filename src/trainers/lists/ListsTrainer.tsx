import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "lists")!;

function Theory() {
  const [type, setType] = useState<"ul" | "ol">("ul");
  const [nested, setNested] = useState(false);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-5 text-slate-600">
        <code className="rounded bg-slate-100 px-1">ul</code> — маркированный список (порядок не важен),{" "}
        <code className="rounded bg-slate-100 px-1">ol</code> — нумерованный (порядок важен). Каждый пункт — это{" "}
        <code className="rounded bg-slate-100 px-1">li</code>, а список можно вкладывать прямо внутрь пункта.
      </p>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex gap-2">
          {(["ul", "ol"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-full border-2 px-4 py-1.5 font-mono text-xs font-bold transition ${
                type === t ? "border-lime-500 bg-lime-50 text-lime-700" : "border-slate-200 text-slate-500 hover:border-lime-200"
              }`}
            >
              &lt;{t}&gt;
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm font-bold text-lime-700">
          <input type="checkbox" checked={nested} onChange={(e) => setNested(e.target.checked)} />
          вложенный список внутри пункта
        </label>
      </div>

      <div className="rounded-2xl bg-slate-50 p-5">
        {type === "ul" ? (
          <ul className="list-disc pl-5 text-slate-700">
            <li>Молоко</li>
            <li>Лимонад</li>
            <li>
              Соки:
              {nested && (
                <ul className="list-[circle] pl-5 text-slate-600">
                  <li>Яблочный</li>
                  <li>Ананасовый</li>
                </ul>
              )}
            </li>
          </ul>
        ) : (
          <ol className="list-decimal pl-5 text-slate-700">
            <li>Взбей яйцо</li>
            <li>Добавь сахар и соду</li>
            <li>
              Всыпь муку
              {nested && (
                <ol className="list-[lower-alpha] pl-5 text-slate-600">
                  <li>просеянную</li>
                  <li>постепенно, по ложке</li>
                </ol>
              )}
            </li>
          </ol>
        )}
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
            className="rounded-full bg-gradient-to-r from-lime-500 to-green-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

type PartKey = "ul-wrap" | "li1" | "li2" | "nested-ul" | "nested-li";

function ClickMenu({ selected, onPick }: { selected: PartKey | null; onPick: (k: PartKey) => void }) {
  function cls(key: PartKey, base: string) {
    const isSel = selected === key;
    return `${base} cursor-pointer rounded px-1 transition ${isSel ? "bg-lime-100 ring-2 ring-lime-400" : "hover:bg-slate-100"}`;
  }
  return (
    <div className="rounded-2xl bg-white p-4 text-left shadow-inner">
      <div className={cls("ul-wrap", "inline-block text-xs font-bold text-slate-400")} onClick={() => onPick("ul-wrap")}>
        &lt;ul&gt; (весь список напитков)
      </div>
      <ul className="mt-1 list-disc pl-5 text-slate-700">
        <li className={cls("li1", "")} onClick={() => onPick("li1")}>
          Молоко
        </li>
        <li className={cls("li2", "")} onClick={() => onPick("li2")}>
          Лимонад
        </li>
        <li>
          Соки:
          <ul className={cls("nested-ul", "list-[circle] pl-5 text-slate-600")} onClick={(e) => { e.stopPropagation(); onPick("nested-ul"); }}>
            <li className={cls("nested-li", "")} onClick={(e) => { e.stopPropagation(); onPick("nested-li"); }}>
              Яблочный
            </li>
            <li>Ананасовый</li>
          </ul>
        </li>
      </ul>
    </div>
  );
}

function ClickLevel({ target, prompt, onResult }: { target: PartKey; prompt: string; onResult: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<PartKey | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(selected === target);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">{prompt}</p>
      <ClickMenu selected={selected} onPick={(k) => !checked && setSelected(k)} />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!selected}
            className="rounded-full bg-gradient-to-r from-lime-500 to-green-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const TASK_META = [
  { badge: "выбери из списка", prompt: "Нужен список ингредиентов рецепта — порядок не важен (соль, сахар, молоко можно перечислить в любом порядке). Какой тег?", explain: "ul (unordered list) — маркированный список для пунктов без значимого порядка." },
  { badge: "выбери из списка", prompt: "А для шагов инструкции, где порядок важен («сначала взбей яйцо, потом добавь молоко»)?", explain: "ol (ordered list) — нумерованный список, когда порядок пунктов важен." },
  { badge: "кликни по списку", prompt: "Кликни на тег, который оборачивает ВЕСЬ список напитков целиком.", explain: "Внешний <ul> — это контейнер, который объединяет все пункты списка." },
  { badge: "кликни по списку", prompt: 'У пункта "Соки:" есть собственный вложенный список. Кликни на пункт этого ВНУТРЕННЕГО списка — «Яблочный».', explain: "Вложенный список (ul внутри li) устроен точно так же, как и обычный — просто живёт внутри одного пункта родительского списка." },
];

function Tasks() {
  const stepper = useTaskStepper(4, "lists");
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
      nextClassName="bg-gradient-to-r from-lime-500 to-green-600"
    >
      {(task === 0 || task === 1) && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <McqLevel key={task} options={["ol", "ul", "li", "dl"]} correctIndex={1} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <McqLevel key={task} options={["ol", "ul", "a", "img"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && <ClickLevel key={task} target="ul-wrap" prompt={meta.prompt} onResult={(c) => stepper.markResult(c)} />}
      {task === 3 && <ClickLevel key={task} target="nested-li" prompt={meta.prompt} onResult={(c) => stepper.markResult(c)} />}
    </LevelShell>
  );
}

export function ListsTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="Маркированные, нумерованные и вложенные"
        description="ul и ol хранят пункты li — а внутри пункта можно спрятать ещё один список целиком."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="4 уровня — выбирай и кликай по списку." />
      <Tasks />
    </div>
  );
}
