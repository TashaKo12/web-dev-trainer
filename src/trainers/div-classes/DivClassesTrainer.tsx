import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { TrueFalseDeck, type TrueFalseStatement } from "../../components/TrueFalseDeck";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "div-classes")!;

function Theory() {
  const [card, setCard] = useState(true);
  const [highlight, setHighlight] = useState(false);

  const classList = ["div", card && "card", highlight && "highlight"].filter(Boolean).join(" ");

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
      <p className="mb-3 text-slate-600">
        <code className="rounded bg-slate-100 px-1">div</code> — это тег-контейнер: прямоугольный блок, в который
        можно сложить любое содержимое (текст, картинки, другие теги), чтобы сгруппировать их вместе. Сам по себе он
        ничего не ЗНАЧИТ (в отличие от, например, h1 или p) и никак не выглядит — ни рамки, ни отступов, ни цвета,
        пока ему не назначили стиль.
      </p>
      <p className="mb-5 text-slate-600">
        Чтобы такой блок можно было оформить, ему дают «имя» — атрибут{" "}
        <code className="rounded bg-slate-100 px-1">class</code>. По этому имени потом цепляется CSS. Одной и той же
        стилью можно пометить сколько угодно блоков сразу — а ещё у ОДНОГО блока может быть сразу{" "}
        <b>несколько классов одновременно</b> — их просто перечисляют через пробел в одних кавычках.
      </p>

      <div className="mb-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
        <b>Два класса сразу:</b> <code className="rounded bg-white px-1">class="card highlight"</code> — это ОДИН
        атрибут class, в котором перечислены ДВА класса: «card» и «highlight». Элемент получает оформление сразу
        от обоих. Попробуй сам ниже.
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_1.1fr]">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-amber-700">
            <input type="checkbox" checked={card} onChange={(e) => setCard(e.target.checked)} />
            класс «card» (рамка + отступы)
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-amber-700">
            <input type="checkbox" checked={highlight} onChange={(e) => setHighlight(e.target.checked)} />
            класс «highlight» (жёлтый фон)
          </label>
          <div className="mt-3 rounded-2xl bg-slate-50 p-4 font-mono text-xs text-slate-600">
            &lt;div class="{classList.replace(/^div ?/, "")}"&gt;...&lt;/div&gt;
          </div>
        </div>

        <div className="flex items-center justify-center rounded-2xl bg-slate-100 p-6">
          <div
            className={`text-center text-sm text-slate-600 ${card ? "rounded-xl border-2 border-amber-400 p-4" : ""} ${
              highlight ? "bg-yellow-100 font-bold text-amber-800" : "bg-white"
            }`}
          >
            Карточка товара
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        Классы (как и их оформление) в реальном проекте пишут в отдельном файле style.css — на этой странице мы
        просто показываем, как это выглядело бы «вживую».
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
            className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function TypeLevel({ expected, placeholder, prompt, onResult }: { expected: string; placeholder: string; prompt: string; onResult: (correct: boolean) => void }) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);

  function normalize(s: string) {
    return s.trim().toLowerCase().replace(/\s+/g, " ").replace(/"/g, "'");
  }

  function check() {
    setChecked(true);
    onResult(normalize(text) === normalize(expected));
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">{prompt}</p>
      <input
        type="text"
        value={text}
        onChange={(e) => !checked && setText(e.target.value)}
        disabled={checked}
        placeholder={placeholder}
        className="w-full rounded-xl border-2 border-amber-200 px-3 py-2 font-mono text-sm outline-none focus:border-amber-400 disabled:opacity-60"
      />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!text.trim()}
            className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const TASK_META = [
  { badge: "выбери из списка", prompt: "Нужен просто контейнер — сгруппировать несколько элементов в один блок, без особого смысла. Какой тег для этого придумали?", explain: "div — универсальный блочный контейнер без собственного смысла." },
  { badge: "выбери из списка", prompt: "Нужно одинаково оформить СРАЗУ ТРИ карточки на странице. Какой атрибут для этого предназначен?", explain: "class — можно повесить на сколько угодно элементов, все они получат одно и то же оформление." },
  { badge: "выбери из списка", prompt: "Можно ли дать одному и тому же элементу сразу НЕСКОЛЬКО классов одновременно?", explain: 'Да — классы просто перечисляют через пробел в одном атрибуте: class="card highlight".' },
  { badge: "напиши сам", prompt: 'Напиши атрибут class со значением "card" так, как он пишется внутри тега.', explain: 'class="card" — имя атрибута, знак =, значение в кавычках.' },
  { badge: "напиши сам", prompt: 'У блока должно быть сразу ДВА класса: "card" и "highlight". Как записать оба класса в одном атрибуте class?', explain: 'class="card highlight" — несколько классов пишут через пробел внутри одних и тех же кавычек.' },
  { badge: "напиши сам", prompt: 'Теперь нужны сразу ТРИ класса: "card", "highlight" и "rounded". Напиши атрибут class целиком.', explain: 'class="card highlight rounded" — классов может быть сколько угодно, все через пробел в одних кавычках.' },
  { badge: "выбери из списка", prompt: "Чем нужно разделять несколько классов внутри одного атрибута class?", explain: "Пробелом — не запятой и не точкой с запятой, просто пробел между именами классов." },
  { badge: "выбери из списка", prompt: "Можно ли использовать ОДИН И ТОТ ЖЕ class у разных тегов (например, div, p и h2 одновременно)?", explain: "Да — class не привязан к конкретному тегу, им можно пометить любые элементы, которые должны выглядеть одинаково." },
  { badge: "напиши сам", prompt: "", explain: 'class="card rounded" — оба класса через пробел в одних кавычках, как и в прошлый раз с "card highlight".' },
];

const TRUE_FALSE: TrueFalseStatement[] = [
  {
    text: "div сам по себе как-то особо выглядит на странице без всякого CSS.",
    answer: false,
    explain: "Нет, div — это просто контейнер без собственного вида, пока к нему не применили стили.",
  },
  {
    text: "Один и тот же class можно повесить сразу на много разных элементов.",
    answer: true,
    explain: "Да, в этом и смысл class — одно оформление можно применить к сколь угодно большому числу блоков.",
  },
  {
    text: "У элемента может быть и один класс, и три класса сразу — ограничения на количество нет.",
    answer: true,
    explain: "Да, классов в атрибуте class может быть сколько угодно, лишь бы они шли через пробел.",
  },
  {
    text: "У одного элемента может быть сразу несколько классов одновременно.",
    answer: true,
    explain: "Да, классы просто перечисляют через пробел внутри одного атрибута class.",
  },
  {
    text: "class можно вешать только на теги div, на остальные теги — нельзя.",
    answer: false,
    explain: "Нет, class — универсальный атрибут, его можно поставить практически на любой HTML-тег.",
  },
  {
    text: "Несколько классов у одного элемента пишут через запятую: class=\"card, highlight\".",
    answer: false,
    explain: "Нет, классы разделяют просто пробелом внутри одних кавычек: class=\"card highlight\", без запятой.",
  },
  {
    text: "div используют, когда для содержимого нет более подходящего по смыслу тега.",
    answer: true,
    explain: "Да, div — универсальный «тег на крайний случай», когда семантический тег не подходит.",
  },
  {
    text: "Если убрать у элемента один из двух классов, второй класс тоже пропадёт.",
    answer: false,
    explain: "Нет, классы в атрибуте class не зависят друг от друга — можно убрать любой из них, остальные останутся как есть.",
  },
  {
    text: "class помогает CSS понять, какие элементы нужно оформить одинаково.",
    answer: true,
    explain: "Верно, именно за имя класса и «цепляется» CSS-стиль при оформлении блоков.",
  },
  {
    text: "div — это сокращение от слова division (раздел, деление).",
    answer: true,
    explain: "Да, исторически div происходит именно от слова division — раздел документа.",
  },
];

function Tasks() {
  const stepper = useTaskStepper(9, "div-classes");
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
      nextClassName="bg-gradient-to-r from-amber-400 to-orange-500"
    >
      {(task === 0 || task === 1 || task === 2 || task === 6 || task === 7) && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <McqLevel key={task} options={["div", "p", "span", "h2"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <McqLevel key={task} options={["class", "id", "href", "src"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && (
        <McqLevel
          key={task}
          mono={false}
          options={["Да, через пробел в одном атрибуте", "Нет, только один класс на элемент", "Да, но только два, не больше", "Нет, нужен отдельный тег на каждый класс"]}
          correctIndex={0}
          onResult={(c) => stepper.markResult(c)}
        />
      )}
      {task === 3 && <TypeLevel key={task} expected='class="card"' placeholder='class="..."' prompt={meta.prompt} onResult={(c) => stepper.markResult(c)} />}
      {task === 4 && <TypeLevel key={task} expected='class="card highlight"' placeholder='class="..."' prompt={meta.prompt} onResult={(c) => stepper.markResult(c)} />}
      {task === 5 && <TypeLevel key={task} expected='class="card highlight rounded"' placeholder='class="..."' prompt={meta.prompt} onResult={(c) => stepper.markResult(c)} />}
      {task === 6 && (
        <McqLevel
          key={task}
          mono={false}
          options={["Пробелом", "Запятой", "Точкой с запятой", "Новой строкой"]}
          correctIndex={0}
          onResult={(c) => stepper.markResult(c)}
        />
      )}
      {task === 7 && (
        <McqLevel
          key={task}
          mono={false}
          options={["Да, class можно вешать на любые теги", "Нет, у каждого тега свой набор классов", "Только на div", "Только на span"]}
          correctIndex={0}
          onResult={(c) => stepper.markResult(c)}
        />
      )}
      {task === 8 && <TypeLevel key={task} expected='class="card rounded"' placeholder='class="..."' prompt='У блока должны быть классы "card" и "rounded" одновременно. Напиши атрибут class целиком.' onResult={(c) => stepper.markResult(c)} />}
    </LevelShell>
  );
}

export function DivClassesTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="div — контейнер, class — его имя для CSS"
        description="div группирует содержимое в блок, а class даёт этому блоку имя, по которому его можно оформить."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="9 уровней — выбирай и пиши сам." />
      <div className="mb-10">
        <Tasks />
      </div>
      <SectionHeading
        kicker="Проверь себя"
        title="Верно или неверно?"
        description="Пролистай 10 карточек — угадай, где правда, а где нет."
      />
      <TrueFalseDeck statements={TRUE_FALSE} accent={meta.gradient} />
    </div>
  );
}
