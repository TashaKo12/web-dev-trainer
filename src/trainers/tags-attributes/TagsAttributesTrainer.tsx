import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { useTaskStepper } from "../../components/useTaskStepper";
import { TrueFalseDeck, type TrueFalseStatement } from "../../components/TrueFalseDeck";
import { trainers } from "../registry";
import { TagCode, type TagExample } from "./TagCode";

const meta = trainers.find((t) => t.id === "tags-attributes")!;

const LEGEND_EXAMPLE: TagExample = { tagName: "p", attrs: [{ name: "class", value: "intro" }], content: "Привет!" };

const PARTS = [
  { key: "tag", label: "Тег", desc: 'Имя тега (p, h1, img...) определяет, ЧТО это за элемент. Пишется сразу после "<", а на закрывающем теге — после "</".' },
  { key: "attr-name-0", label: "Атрибут", desc: "Атрибут — это дополнительная настройка тега. Пишется внутри открывающего тега, через пробел после имени." },
  { key: "attr-value-0", label: "Значение атрибута", desc: "После знака = в кавычках пишется значение атрибута — конкретная настройка (например, какой именно класс)." },
  { key: "content", label: "Содержимое", desc: "Между открывающим и закрывающим тегом лежит содержимое — то, что увидит пользователь." },
];

function Theory() {
  const [active, setActive] = useState("tag");
  const part = PARTS.find((p) => p.key === active)!;

  const [tagName, setTagName] = useState("h2");
  const [attrName, setAttrName] = useState("class");
  const [attrValue, setAttrValue] = useState("title");
  const [content, setContent] = useState("Заголовок");

  const [selfClosing, setSelfClosing] = useState(false);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
      <p className="mb-5 text-slate-600">
        HTML-страница состоит из тегов. У тега есть имя, может быть несколько атрибутов (доп. настроек) и
        содержимое внутри. Нажимай на кнопки ниже — соответствующая часть подсветится прямо в коде.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {PARTS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setActive(p.key)}
            className={`rounded-full border-2 px-4 py-1.5 text-xs font-bold transition ${
              active === p.key ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-500 hover:border-amber-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <TagCode example={LEGEND_EXAMPLE} selected={active} />

      <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">{part.desc}</div>

      <div className="mt-6 border-t border-slate-100 pt-6">
        <p className="mb-3 text-sm font-bold text-amber-700">Собери свой тег:</p>
        <div className="grid gap-2 sm:grid-cols-4">
          <input value={tagName} onChange={(e) => setTagName(e.target.value)} placeholder="тег" className="rounded-lg border-2 border-slate-200 px-2 py-1.5 font-mono text-xs" />
          <input value={attrName} onChange={(e) => setAttrName(e.target.value)} placeholder="атрибут" className="rounded-lg border-2 border-slate-200 px-2 py-1.5 font-mono text-xs" />
          <input value={attrValue} onChange={(e) => setAttrValue(e.target.value)} placeholder="значение" className="rounded-lg border-2 border-slate-200 px-2 py-1.5 font-mono text-xs" />
          <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="содержимое" className="rounded-lg border-2 border-slate-200 px-2 py-1.5 font-mono text-xs" />
        </div>
        <div className="mt-3">
          <TagCode example={{ tagName: tagName || "тег", attrs: attrName ? [{ name: attrName, value: attrValue }] : [], content }} />
        </div>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-6">
        <p className="mb-3 text-sm font-bold text-amber-700">Самозакрывающиеся теги</p>
        <p className="mb-3 text-sm text-slate-600">
          У большинства тегов есть содержимое и отдельный закрывающий тег — как у <code className="rounded bg-slate-100 px-1">p</code>. Но у
          некоторых тегов просто нечему быть внутри: <code className="rounded bg-slate-100 px-1">img</code> — это картинка, а не
          контейнер для текста. У таких тегов нет закрывающей пары — они сами себя «закрывают». Переключи, чтобы сравнить.
        </p>
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setSelfClosing(false)}
            className={`rounded-full border-2 px-4 py-1.5 text-xs font-bold transition ${
              !selfClosing ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-500 hover:border-amber-200"
            }`}
          >
            Обычный тег
          </button>
          <button
            type="button"
            onClick={() => setSelfClosing(true)}
            className={`rounded-full border-2 px-4 py-1.5 text-xs font-bold transition ${
              selfClosing ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-500 hover:border-amber-200"
            }`}
          >
            Самозакрывающийся тег
          </button>
        </div>
        {selfClosing ? (
          <>
            <TagCode example={{ tagName: "img", attrs: [{ name: "src", value: "cat.jpg" }, { name: "alt", value: "Кот" }], selfClosing: true }} />
            <div className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
              У img нет содержимого и нет тега <code className="rounded bg-white px-1">{"</img>"}</code> — вся нужная информация (какую
              картинку показать) умещается в атрибутах. Слэш перед {" "}
              <code className="rounded bg-white px-1">{">"}</code> можно поставить (<code className="rounded bg-white px-1">{"/>"}</code>),
              а можно не ставить — браузер поймёт одинаково. Так же устроены <code className="rounded bg-white px-1">br</code>,{" "}
              <code className="rounded bg-white px-1">input</code> и <code className="rounded bg-white px-1">hr</code>.
            </div>
          </>
        ) : (
          <>
            <TagCode example={{ tagName: "p", attrs: [], content: "Текст абзаца" }} />
            <div className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
              У p есть содержимое («Текст абзаца»), поэтому обязательно нужен закрывающий тег{" "}
              <code className="rounded bg-white px-1">{"</p>"}</code> — иначе браузер не поймёт, где текст абзаца заканчивается.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

type Level =
  | { mode: "click"; example: TagExample; question: string; target: string; explain: string }
  | { mode: "type"; question: string; expected: string; explain: string };

const LEVELS: Level[] = [
  {
    mode: "click",
    example: { tagName: "h1", attrs: [{ name: "class", value: "title" }], content: "Заголовок" },
    question: "Кликни на ИМЯ ТЕГА.",
    target: "tag",
    explain: "h1 — это имя тега. Оно стоит сразу после «<» и повторяется в закрывающем теге после «</».",
  },
  {
    mode: "click",
    example: { tagName: "h1", attrs: [{ name: "class", value: "title" }], content: "Заголовок" },
    question: "Кликни на ИМЯ АТРИБУТА.",
    target: "attr-name-0",
    explain: "class — это имя атрибута. Он пишется внутри открывающего тега, через пробел после имени тега.",
  },
  {
    mode: "click",
    example: { tagName: "h1", attrs: [{ name: "class", value: "title" }], content: "Заголовок" },
    question: "Кликни на ЗНАЧЕНИЕ атрибута.",
    target: "attr-value-0",
    explain: "title — значение атрибута class. Оно всегда пишется в кавычках после знака =.",
  },
  {
    mode: "click",
    example: { tagName: "h1", attrs: [{ name: "class", value: "title" }], content: "Заголовок" },
    question: "Кликни на СОДЕРЖИМОЕ — то, что увидит пользователь.",
    target: "content",
    explain: "Содержимое лежит между открывающим и закрывающим тегом.",
  },
  {
    mode: "click",
    example: { tagName: "img", attrs: [{ name: "src", value: "cat.jpg" }, { name: "alt", value: "Кот" }], selfClosing: true },
    question: "У этого тега два атрибута. Кликни на значение атрибута alt (а не src!).",
    target: "attr-value-1",
    explain: "alt — второй по счёту атрибут, его значение «Кот». У img нет содержимого и закрывающего тега — он самозакрывающийся.",
  },
  {
    mode: "click",
    example: { tagName: "a", attrs: [{ name: "href", value: "about.html" }, { name: "target", value: "_blank" }], content: "Обо мне" },
    question: "У ссылки тоже может быть несколько атрибутов. Кликни на имя ПЕРВОГО атрибута.",
    target: "attr-name-0",
    explain: "href — первый атрибут, он указывает, куда ведёт ссылка.",
  },
  {
    mode: "type",
    question: 'Собери открывающий тег сам: p с атрибутом class, значение которого — intro.',
    expected: '<p class="intro">',
    explain: 'Тег: <p class="intro"> — имя тега, пробел, имя атрибута, =, значение в кавычках, >.',
  },
  {
    mode: "type",
    question: 'Собери самозакрывающийся тег img с атрибутами src="photo.jpg" и alt="Фото".',
    expected: '<img src="photo.jpg" alt="Фото">',
    explain: 'Тег: <img src="photo.jpg" alt="Фото"> (слэш перед > можно не ставить). Два атрибута через пробел, у каждого своё значение в кавычках.',
  },
  {
    mode: "click",
    example: { tagName: "label", attrs: [{ name: "for", value: "email" }, { name: "class", value: "field-label" }], content: "Почта" },
    question: "У этого тега тоже два атрибута. Кликни на значение ВТОРОГО атрибута.",
    target: "attr-value-1",
    explain: "field-label — второе по счёту значение, оно принадлежит атрибуту class.",
  },
  {
    mode: "type",
    question: 'Собери тег ссылки a с атрибутом href="contact.html" и текстом «Контакты».',
    expected: '<a href="contact.html">Контакты</a>',
    explain: 'Тег: <a href="contact.html">Контакты</a> — у ссылки есть закрывающий тег, текст лежит между ними.',
  },
];

const TRUE_FALSE: TrueFalseStatement[] = [
  {
    text: "Имя тега всегда пишется сразу после открывающей скобки <.",
    answer: true,
    explain: "Да — например, в <h1> имя тега h1 идёт сразу после <.",
  },
  {
    text: "У одного тега не может быть больше одного атрибута.",
    answer: false,
    explain: "Может — например, у <img src=\"cat.jpg\" alt=\"Кот\"> сразу два атрибута: src и alt.",
  },
  {
    text: "Значение атрибута всегда пишется в кавычках.",
    answer: true,
    explain: "Верно — после знака = значение атрибута заключают в кавычки, например class=\"title\".",
  },
  {
    text: "Тег <img> обязательно должен иметь закрывающий тег </img>.",
    answer: false,
    explain: "Нет — img самозакрывающийся, ему нечего содержать внутри, поэтому закрывающего тега нет.",
  },
  {
    text: "В закрывающем теге перед именем тега ставится слэш /.",
    answer: true,
    explain: "Да, например у <p>...</p> закрывающий тег — это </p>, со слэшем перед p.",
  },
  {
    text: "Атрибуты пишутся внутри закрывающего тега.",
    answer: false,
    explain: "Нет, атрибуты пишутся только внутри ОТКРЫВАЮЩЕГО тега, закрывающий тег атрибутов не содержит.",
  },
  {
    text: "Содержимое тега — это то, что находится между открывающим и закрывающим тегом.",
    answer: true,
    explain: "Верно, например в <p>Привет!</p> содержимое — это слово «Привет!».",
  },
  {
    text: "У тега a атрибут href указывает, куда ведёт ссылка.",
    answer: true,
    explain: "Да, href — главный атрибут ссылки, в нём записан адрес перехода.",
  },
  {
    text: "Имя атрибута и его значение разделяются запятой.",
    answer: false,
    explain: "Нет, они разделяются знаком равно =, например class=\"intro\" — без запятой.",
  },
  {
    text: "Несколько атрибутов одного тега пишутся через пробел.",
    answer: true,
    explain: "Верно — например, src=\"cat.jpg\" alt=\"Кот\" разделены пробелом.",
  },
];

function normalizeTag(s: string) {
  return s
    .trim()
    .replace(/\s+/g, " ")
    .replace(/"/g, "'")
    .replace(/\s*\/>$/, ">")
    .toLowerCase();
}

function ClickLevel({ level, onResult }: { level: Extract<Level, { mode: "click" }>; onResult: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(selected === level.target);
  }

  return (
    <div>
      <TagCode example={level.example} selected={selected} onPick={(p) => !checked && setSelected(p)} />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!selected}
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function TypeLevel({ level, onResult }: { level: Extract<Level, { mode: "type" }>; onResult: (correct: boolean) => void }) {
  const [code, setCode] = useState("");
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(normalizeTag(code) === normalizeTag(level.expected));
  }

  return (
    <div>
      <input
        type="text"
        value={code}
        onChange={(e) => !checked && setCode(e.target.value)}
        disabled={checked}
        placeholder="напиши тег целиком"
        className="w-full rounded-xl border-2 border-amber-200 px-3 py-2 font-mono text-sm outline-none focus:border-amber-400 disabled:opacity-60"
      />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!code.trim()}
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function Tasks() {
  const stepper = useTaskStepper(LEVELS.length, "tags-attributes");

  if (stepper.allAnswered) {
    return <CompletionBanner score={stepper.score} total={LEVELS.length} onRestart={() => stepper.restart()} />;
  }

  const level = LEVELS[stepper.index];

  return (
    <LevelShell
      total={LEVELS.length}
      index={stepper.index}
      statuses={stepper.statuses}
      status={stepper.status}
      isLast={stepper.isLast}
      badge={level.mode === "click" ? "кликни в коде" : "напиши сам"}
      explain={level.explain}
      onJump={stepper.goTo}
      onNext={stepper.goNext}
      nextClassName="bg-gradient-to-r from-amber-500 to-orange-600"
    >
      <p className="mb-4 text-sm font-semibold text-slate-700">{level.question}</p>
      {level.mode === "click" ? (
        <ClickLevel key={stepper.index} level={level} onResult={(correct) => stepper.markResult(correct)} />
      ) : (
        <TypeLevel key={stepper.index} level={level} onResult={(correct) => stepper.markResult(correct)} />
      )}
    </LevelShell>
  );
}

export function TagsAttributesTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="Разбери тег на части"
        description="Тег, атрибут, значение атрибута, содержимое — из этих кирпичиков состоит весь HTML."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="9 уровней — сначала кликай по частям тега, потом собирай тег сам." />
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
