import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { useTaskStepper } from "../../components/useTaskStepper";
import { McqOptions } from "../../components/McqOptions";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "html-structure")!;

type SlotId = "header" | "nav" | "main" | "footer";

const SLOTS: { id: SlotId; label: string; hint: string }[] = [
  { id: "header", label: "Шапка сайта", hint: "логотип, название, слоган" },
  { id: "nav", label: "Меню навигации", hint: "ссылки на разделы сайта" },
  { id: "main", label: "Основной контент", hint: "то, ради чего пришёл посетитель" },
  { id: "footer", label: "Подвал страницы", hint: "копирайт, контакты, ссылки" },
];

const CHIPS: { id: string; tag: string; correctSlot: SlotId | null }[] = [
  { id: "c-header", tag: "header", correctSlot: "header" },
  { id: "c-nav", tag: "nav", correctSlot: "nav" },
  { id: "c-main", tag: "main", correctSlot: "main" },
  { id: "c-footer", tag: "footer", correctSlot: "footer" },
  { id: "c-span", tag: "span", correctSlot: null },
  { id: "c-aside", tag: "aside", correctSlot: null },
];

function Theory() {
  const [placed, setPlaced] = useState<Record<SlotId, string | null>>({
    header: null,
    nav: null,
    main: null,
    footer: null,
  });
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const placedChipIds = new Set(Object.values(placed).filter(Boolean) as string[]);
  const pool = CHIPS.filter((c) => !placedChipIds.has(c.id));

  function place(slot: SlotId) {
    if (!selectedChip) {
      if (placed[slot]) {
        setPlaced((p) => ({ ...p, [slot]: null }));
        setChecked(false);
      }
      return;
    }
    setPlaced((p) => ({ ...p, [slot]: selectedChip }));
    setSelectedChip(null);
    setChecked(false);
  }

  function reset() {
    setPlaced({ header: null, nav: null, main: null, footer: null });
    setSelectedChip(null);
    setChecked(false);
  }

  const allFilled = SLOTS.every((s) => placed[s.id]);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-5 text-slate-600">
        Собери скелет веб-страницы: выбери тег-карточку снизу, а затем нажми на
        нужный раздел макета, чтобы поставить тег туда. Не все теги здесь
        нужны — некоторые просто не подходят для верхнего уровня страницы.
      </p>

      <div className="mb-6 overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
        {SLOTS.map((slot) => {
          const chip = placed[slot.id] ? CHIPS.find((c) => c.id === placed[slot.id]) : null;
          const isCorrect = checked && chip?.correctSlot === slot.id;
          const isWrong = checked && chip && chip.correctSlot !== slot.id;
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => place(slot.id)}
              className={`flex w-full items-center justify-between border-b border-slate-200 px-5 py-4 text-left transition last:border-b-0 ${
                isCorrect
                  ? "bg-emerald-50"
                  : isWrong
                    ? "bg-rose-50"
                    : "bg-white hover:bg-indigo-50"
              }`}
            >
              <span>
                <span className="block text-sm font-bold text-slate-700">
                  {slot.label}
                </span>
                <span className="text-xs text-slate-400">{slot.hint}</span>
              </span>
              {chip ? (
                <code
                  className={`rounded-lg px-3 py-1.5 text-sm font-bold ${
                    isCorrect
                      ? "bg-emerald-500 text-white"
                      : isWrong
                        ? "bg-rose-400 text-white"
                        : "bg-indigo-100 text-indigo-700"
                  }`}
                >
                  &lt;{chip.tag}&gt;
                </code>
              ) : (
                <span className="rounded-lg border-2 border-dashed border-slate-300 px-4 py-1.5 text-sm text-slate-300">
                  пусто
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mb-2 text-sm font-bold text-slate-500">Теги для перетаскивания:</p>
      <div className="mb-5 flex flex-wrap gap-2">
        {pool.length === 0 && (
          <span className="text-sm text-slate-400">Все теги разобраны — нажми «Проверить».</span>
        )}
        {pool.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setSelectedChip((s) => (s === chip.id ? null : chip.id))}
            className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${
              selectedChip === chip.id
                ? "scale-110 bg-indigo-500 text-white shadow"
                : "bg-slate-100 text-slate-600 hover:bg-indigo-100"
            }`}
          >
            &lt;{chip.tag}&gt;
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setChecked(true)}
          disabled={!allFilled}
          className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
        >
          Проверить расположение
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-full border-2 border-slate-200 px-5 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50"
        >
          Сбросить
        </button>
      </div>

      {checked && (
        <div className="mt-5 rounded-2xl bg-sky-50 p-4 text-sm leading-relaxed text-sky-800">
          <p>
            <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>,{" "}
            <code>&lt;main&gt;</code> и <code>&lt;footer&gt;</code> — это
            семантические теги: по названию понятно, что у них внутри. Браузеру
            и программам для незрячих пользователей это помогает понимать
            структуру страницы, а не просто её внешний вид.
          </p>
          <p className="mt-2">
            <code>&lt;span&gt;</code> и <code>&lt;aside&gt;</code> тоже
            существуют, но для крупных разделов страницы не подходят:{" "}
            <code>&lt;span&gt;</code> — это маленький кусочек текста внутри
            строки, а <code>&lt;aside&gt;</code> — боковая, не самая важная
            информация.
          </p>
        </div>
      )}
    </div>
  );
}

type MatchPair = { tag: string; description: string };
const MATCH_PAIRS: MatchPair[] = [
  { tag: "ul", description: "список без номеров" },
  { tag: "li", description: "один пункт списка" },
  { tag: "a", description: "ссылка на другую страницу" },
  { tag: "img", description: "картинка на странице" },
];

function MatchingTask({ onResult }: { onResult: (correct: boolean) => void }) {
  const [matches, setMatches] = useState<Record<string, string | null>>({});
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const usedTags = new Set(Object.values(matches).filter(Boolean) as string[]);
  const tagPool = MATCH_PAIRS.map((p) => p.tag).filter((t) => !usedTags.has(t));
  const allMatched = MATCH_PAIRS.every((p) => matches[p.description]);

  function pickDescription(desc: string) {
    if (!selectedTag) {
      if (matches[desc]) setMatches((m) => ({ ...m, [desc]: null }));
      return;
    }
    setMatches((m) => ({ ...m, [desc]: selectedTag }));
    setSelectedTag(null);
  }

  function check() {
    setChecked(true);
    const correct = MATCH_PAIRS.every((p) => matches[p.description] === p.tag);
    onResult(correct);
  }

  return (
    <div>
      <div className="mb-4 space-y-2">
        {MATCH_PAIRS.map((p) => {
          const matchedTag = matches[p.description];
          const isCorrect = checked && matchedTag === p.tag;
          const isWrong = checked && matchedTag && matchedTag !== p.tag;
          return (
            <button
              key={p.description}
              type="button"
              onClick={() => pickDescription(p.description)}
              disabled={checked}
              className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-2.5 text-left text-sm transition ${
                isCorrect
                  ? "border-emerald-300 bg-emerald-50"
                  : isWrong
                    ? "border-rose-300 bg-rose-50"
                    : "border-slate-200 hover:border-indigo-200"
              }`}
            >
              <span>{p.description}</span>
              {matchedTag ? (
                <code className="rounded-lg bg-indigo-100 px-2 py-1 font-bold text-indigo-700">
                  &lt;{matchedTag}&gt;
                </code>
              ) : (
                <span className="text-slate-300">?</span>
              )}
            </button>
          );
        })}
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {tagPool.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setSelectedTag((t) => (t === tag ? null : tag))}
            className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${
              selectedTag === tag
                ? "scale-110 bg-indigo-500 text-white shadow"
                : "bg-slate-100 text-slate-600 hover:bg-indigo-100"
            }`}
          >
            &lt;{tag}&gt;
          </button>
        ))}
      </div>
      {!checked && (
        <button
          type="button"
          onClick={check}
          disabled={!allMatched}
          className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
        >
          Проверить пары
        </button>
      )}
    </div>
  );
}

function TitlePlacementTask({ onResult }: { onResult: (correct: boolean) => void }) {
  const [placed, setPlaced] = useState<"head" | "body" | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(placed === "head");
  }

  function zoneClass(id: "head" | "body") {
    const isSel = placed === id;
    const isCorrect = checked && id === "head";
    const isWrong = checked && isSel && id !== "head";
    return `rounded-2xl border-2 px-4 py-6 text-left transition ${
      isCorrect ? "border-emerald-400 bg-emerald-50" : isWrong ? "border-rose-300 bg-rose-50" : isSel ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-200"
    }`;
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        &lt;title&gt; задаёт текст на вкладке браузера — он не выводится на самой странице. Кликни на зону, куда
        его нужно поместить.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" disabled={checked} onClick={() => setPlaced("head")} className={zoneClass("head")}>
          <code className="mb-1 block font-bold text-slate-700">&lt;head&gt;</code>
          <span className="text-xs text-slate-500">служебная часть — не видна на странице</span>
        </button>
        <button type="button" disabled={checked} onClick={() => setPlaced("body")} className={zoneClass("body")}>
          <code className="mb-1 block font-bold text-slate-700">&lt;body&gt;</code>
          <span className="text-xs text-slate-500">видимое содержимое страницы</span>
        </button>
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!placed}
            className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function ZonePlacementTask({ question, correctZone, onResult }: { question: string; correctZone: "head" | "body"; onResult: (correct: boolean) => void }) {
  const [placed, setPlaced] = useState<"head" | "body" | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(placed === correctZone);
  }

  function zoneClass(id: "head" | "body") {
    const isSel = placed === id;
    const isCorrect = checked && id === correctZone;
    const isWrong = checked && isSel && id !== correctZone;
    return `rounded-2xl border-2 px-4 py-6 text-left transition ${
      isCorrect ? "border-emerald-400 bg-emerald-50" : isWrong ? "border-rose-300 bg-rose-50" : isSel ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-200"
    }`;
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">{question}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" disabled={checked} onClick={() => setPlaced("head")} className={zoneClass("head")}>
          <code className="mb-1 block font-bold text-slate-700">&lt;head&gt;</code>
          <span className="text-xs text-slate-500">служебная часть — не видна на странице</span>
        </button>
        <button type="button" disabled={checked} onClick={() => setPlaced("body")} className={zoneClass("body")}>
          <code className="mb-1 block font-bold text-slate-700">&lt;body&gt;</code>
          <span className="text-xs text-slate-500">видимое содержимое страницы</span>
        </button>
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!placed}
            className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
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
            className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function FooterTagLevel({ expected = "footer", onResult }: { expected?: string; onResult: (correct: boolean) => void }) {
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
        placeholder="например: header"
        className="w-48 rounded-full border-2 border-slate-300 px-4 py-2 text-center font-mono font-semibold text-slate-700 outline-none focus:border-indigo-400 disabled:opacity-60"
      />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!text.trim()}
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
  { badge: "кликни на зону", prompt: "", explain: "«title» определяет текст в заголовке вкладки браузера, поэтому он живёт в <head> — служебной части документа, которая не выводится на экран страницы." },
  { badge: "выбери из списка", prompt: "Какой тег лучше всего подходит для меню навигации по сайту?", explain: "Тег <nav> специально создан для блоков со ссылками-навигацией — это сразу понятно и браузеру, и человеку, читающему код." },
  { badge: "собери пары", prompt: "Собери пары: тег ↔ что он означает.", explain: "«ul» — список, «li» — пункт списка, «a» — ссылка (от англ. anchor), «img» — картинка (от англ. image)." },
  { badge: "выбери из списка", prompt: "На странице блог с новостями. Какой тег лучше всего подходит для ОДНОГО блока с новостью?", explain: "<article> показывает, что внутри — самостоятельный, законченный материал (новость, статья, пост). <div> ничего не говорит о смысле содержимого, хотя выглядеть блоки могут одинаково." },
  { badge: "напиши сам", prompt: "Напиши название тега (без угловых скобок), который создаёт подвал страницы с копирайтом и контактами.", explain: "footer — семантический тег для подвала страницы или раздела." },
  { badge: "кликни на зону", prompt: "", explain: 'meta charset="utf-8" — служебная настройка кодировки, она никак не видна на странице, поэтому живёт в <head>, как и title.' },
  { badge: "выбери из списка", prompt: "Нужен самостоятельный раздел страницы со своим заголовком — например «Отзывы» или «О компании» (не вся страница и не отдельная статья). Какой тег?", explain: "<section> группирует тематически связанный кусок страницы со своим заголовком — в отличие от <div>, у него есть смысл." },
  { badge: "кликни на зону", prompt: "", explain: "<h1> — видимый заголовок, который читает посетитель, поэтому он живёт в <body>, а не в <head>." },
  { badge: "напиши сам", prompt: "Напиши название тега (без угловых скобок) для бокового блока с рекламой или похожими статьями — второстепенной информации.", explain: "aside — семантический тег для содержимого, не являющегося главным на странице." },
];

function Tasks() {
  const stepper = useTaskStepper(9, "html-structure");
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
      nextClassName="bg-gradient-to-r from-sky-500 to-blue-600"
    >
      {meta.prompt && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <TitlePlacementTask key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <McqLevel key={task} options={["<header>", "<aside>", "<nav>", "<span>"]} correctIndex={2} onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && <MatchingTask key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 3 && <McqLevel key={task} options={["<div>", "<article>", "<aside>"]} correctIndex={1} onResult={(c) => stepper.markResult(c)} />}
      {task === 4 && <FooterTagLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 5 && <ZonePlacementTask key={task} question='Куда поместить <meta charset="utf-8">?' correctZone="head" onResult={(c) => stepper.markResult(c)} />}
      {task === 6 && <McqLevel key={task} options={["<div>", "<section>", "<span>", "<b>"]} correctIndex={1} onResult={(c) => stepper.markResult(c)} />}
      {task === 7 && <ZonePlacementTask key={task} question="Куда поместить <h1>Заголовок страницы</h1>?" correctZone="body" onResult={(c) => stepper.markResult(c)} />}
      {task === 8 && <FooterTagLevel key={task} expected="aside" onResult={(c) => stepper.markResult(c)} />}
    </LevelShell>
  );
}

export function HtmlStructureTrainer() {
  return (
    <div>
      <TrainerHero
        emoji={meta.emoji}
        title={meta.title}
        summary={meta.summary}
        gradient={meta.gradient}
        section={meta.section}
      />
      <SectionHeading
        kicker="Теория"
        title="Собери скелет страницы"
        description="Любая страница держится на нескольких крупных блоках. Расставь теги по местам."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading
        kicker="Практика"
        title="Закрепим"
        description="9 уровней — кликай, собирай пары и пиши сам."
      />
      <Tasks />
    </div>
  );
}
