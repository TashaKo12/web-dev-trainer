import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "semantic-tags")!;

const ZONES = [
  { key: "header", label: "header", desc: "Шапка страницы — логотип, название, навигация.", cls: "bg-sky-600" },
  { key: "nav", label: "nav", desc: "Блок навигационных ссылок (меню).", cls: "bg-sky-400" },
  { key: "main", label: "main", desc: "Главное, уникальное содержимое страницы. На странице он один.", cls: "bg-white border-2 border-sky-300" },
  { key: "aside", label: "aside", desc: "Боковая, второстепенная информация (реклама, похожие статьи).", cls: "bg-sky-200" },
  { key: "footer", label: "footer", desc: "Подвал страницы — копирайт, контакты, ссылки.", cls: "bg-sky-800" },
] as const;

type ZoneKey = (typeof ZONES)[number]["key"];

function Theory() {
  const [active, setActive] = useState<ZoneKey>("header");
  const zone = ZONES.find((z) => z.key === active)!;

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-5 text-slate-600">
        Семантические теги называют СМЫСЛ блока, а не просто группируют содержимое, как div. Это помогает
        поисковикам и программам чтения с экрана понимать структуру страницы. Нажимай на зоны макета.
      </p>
      <div className="grid gap-5 sm:grid-cols-[1.1fr_1fr]">
        <div className="overflow-hidden rounded-2xl border-2 border-slate-200">
          <div className={`cursor-pointer px-3 py-3 text-center text-xs font-bold text-white ${ZONES[0].cls} ${active === "header" ? "ring-2 ring-offset-2 ring-sky-500" : ""}`} onClick={() => setActive("header")}>
            header
          </div>
          <div className={`cursor-pointer px-3 py-2 text-center text-xs font-bold text-white ${ZONES[1].cls} ${active === "nav" ? "ring-2 ring-offset-2 ring-sky-500" : ""}`} onClick={() => setActive("nav")}>
            nav
          </div>
          <div className="flex">
            <div className={`flex-1 cursor-pointer px-3 py-10 text-center text-xs font-bold text-sky-700 ${ZONES[2].cls} ${active === "main" ? "ring-2 ring-offset-2 ring-sky-500" : ""}`} onClick={() => setActive("main")}>
              main
            </div>
            <div className={`w-20 cursor-pointer px-2 py-10 text-center text-xs font-bold text-sky-900 ${ZONES[3].cls} ${active === "aside" ? "ring-2 ring-offset-2 ring-sky-500" : ""}`} onClick={() => setActive("aside")}>
              aside
            </div>
          </div>
          <div className={`cursor-pointer px-3 py-3 text-center text-xs font-bold text-white ${ZONES[4].cls} ${active === "footer" ? "ring-2 ring-offset-2 ring-sky-500" : ""}`} onClick={() => setActive("footer")}>
            footer
          </div>
        </div>
        <div className="rounded-2xl bg-sky-50 p-4 text-sm text-sky-800">
          <p className="mb-1 font-mono font-bold">&lt;{zone.label}&gt;</p>
          {zone.desc}
        </div>
      </div>
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
            className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function ZoneClickLevel({ target, prompt, onResult }: { target: ZoneKey; prompt: string; onResult: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<ZoneKey | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(selected === target);
  }

  function cls(key: ZoneKey, base: string) {
    const isSel = selected === key;
    return `${base} cursor-pointer transition ${isSel ? "ring-2 ring-offset-2 ring-indigo-500" : ""}`;
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">{prompt}</p>
      <div className="overflow-hidden rounded-2xl border-2 border-slate-200">
        <div className={cls("header", "bg-sky-600 px-3 py-3 text-center text-xs font-bold text-white")} onClick={() => !checked && setSelected("header")}>
          header
        </div>
        <div className={cls("nav", "bg-sky-400 px-3 py-2 text-center text-xs font-bold text-white")} onClick={() => !checked && setSelected("nav")}>
          nav
        </div>
        <div className="flex">
          <div className={cls("main", "flex-1 border-2 border-sky-300 bg-white px-3 py-10 text-center text-xs font-bold text-sky-700")} onClick={() => !checked && setSelected("main")}>
            main
          </div>
          <div className={cls("aside", "w-20 bg-sky-200 px-2 py-10 text-center text-xs font-bold text-sky-900")} onClick={() => !checked && setSelected("aside")}>
            aside
          </div>
        </div>
        <div className={cls("footer", "bg-sky-800 px-3 py-3 text-center text-xs font-bold text-white")} onClick={() => !checked && setSelected("footer")}>
          footer
        </div>
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!selected}
            className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const TASK_META = [
  { badge: "выбери из списка", prompt: "Главное, уникальное содержимое страницы — такой тег на странице должен быть только ОДИН. Какой это тег?", explain: "main — главное содержимое. header, footer и nav обычно повторяются на каждой странице сайта." },
  { badge: "кликни по макету", prompt: "Кликни на зону, которая обычно содержит меню навигационных ссылок.", explain: "nav — специально для блока ссылок меню." },
  { badge: "кликни по макету", prompt: "Кликни на зону для второстепенной информации — например, рекламного блока или списка похожих статей.", explain: "aside — боковой, не главный контент." },
  { badge: "выбери из списка", prompt: "Чем article отличается от обычного div с тем же содержимым?", explain: "article помечает блок как самостоятельный, независимый кусок контента (например, статью) — это помогает поисковикам и читалкам понимать структуру страницы, в отличие от смыслонейтрального div." },
];

function Tasks() {
  const stepper = useTaskStepper(4, "semantic-tags");
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
      nextClassName="bg-gradient-to-r from-sky-500 to-blue-600"
    >
      {(task === 0 || task === 3) && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <McqLevel key={task} options={["main", "header", "footer", "nav"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <ZoneClickLevel key={task} target="nav" prompt={meta.prompt} onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && <ZoneClickLevel key={task} target="aside" prompt={meta.prompt} onResult={(c) => stepper.markResult(c)} />}
      {task === 3 && (
        <McqLevel
          key={task}
          mono={false}
          options={["Ничем, они абсолютно одинаковые", "article помечает самостоятельный блок контента по смыслу, div — нет", "article работает только внутри header", "div быстрее загружается"]}
          correctIndex={1}
          onResult={(c) => stepper.markResult(c)}
        />
      )}
    </LevelShell>
  );
}

export function SemanticTagsTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="header, nav, main, aside, footer"
        description="Кликай по зонам макета — у каждой есть собственный смысл, а не просто расположение."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="4 уровня — выбирай и кликай по макету." />
      <Tasks />
    </div>
  );
}
