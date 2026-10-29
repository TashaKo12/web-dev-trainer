import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { TaskShell } from "../../components/TaskShell";
import { CompletionBanner } from "../../components/CompletionBanner";
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

function Tasks() {
  const stepper = useTaskStepper(5, "html-structure");
  const [matchDone, setMatchDone] = useState(false);
  const [mcqChoice, setMcqChoice] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState("");

  if (stepper.allAnswered) {
    return (
      <CompletionBanner
        score={stepper.score}
        total={5}
        onRestart={() => {
          stepper.restart();
          setMatchDone(false);
          setMcqChoice(null);
          setTextAnswer("");
        }}
      />
    );
  }

  const task = stepper.index;

  if (task === 0) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt="В какой части HTML-документа должен находиться тег <title>?"
        status={stepper.status}
        onCheck={() => stepper.markResult(mcqChoice === 1)}
        onNext={() => {
          stepper.goNext();
          setMcqChoice(null);
        }}
        checkDisabled={mcqChoice === null}
        isLast={false}
        feedback="«title» определяет текст в заголовке вкладки браузера, поэтому он живёт в <head> — служебной части документа, которая не выводится на экран страницы."
      >
        <McqOptions
          options={["<body>", "<head>", "<main>", "<footer>"]}
          selected={mcqChoice}
          onSelect={setMcqChoice}
          disabled={stepper.status !== "idle"}
        />
      </TaskShell>
    );
  }

  if (task === 1) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt="Какой тег лучше всего подходит для меню навигации по сайту?"
        status={stepper.status}
        onCheck={() => stepper.markResult(mcqChoice === 2)}
        onNext={() => {
          stepper.goNext();
          setMcqChoice(null);
        }}
        checkDisabled={mcqChoice === null}
        isLast={false}
        feedback="Тег <nav> специально создан для блоков со ссылками-навигацией — это сразу понятно и браузеру, и человеку, читающему код."
      >
        <McqOptions
          options={["<header>", "<aside>", "<nav>", "<span>"]}
          selected={mcqChoice}
          onSelect={setMcqChoice}
          disabled={stepper.status !== "idle"}
        />
      </TaskShell>
    );
  }

  if (task === 2) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt="Собери пары: тег ↔ что он означает."
        status={matchDone ? stepper.status : "idle"}
        onCheck={() => {}}
        checkDisabled
        hideCheck
        onNext={() => {
          stepper.goNext();
          setMatchDone(false);
        }}
        isLast={false}
        feedback="«ul» — список, «li» — пункт списка, «a» — ссылка (от англ. anchor), «img» — картинка (от англ. image)."
      >
        <MatchingTask
          onResult={(correct) => {
            setMatchDone(true);
            stepper.markResult(correct);
          }}
        />
      </TaskShell>
    );
  }

  if (task === 3) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt="Для блока с новостью на сайте разработчик выбирает между <div> и <article>. Почему <article> — лучший выбор?"
        status={stepper.status}
        onCheck={() => stepper.markResult(mcqChoice === 1)}
        onNext={() => {
          stepper.goNext();
          setMcqChoice(null);
        }}
        checkDisabled={mcqChoice === null}
        isLast={false}
        feedback="<article> показывает, что внутри — самостоятельный, законченный материал (новость, статья, пост). <div> ничего не говорит о смысле содержимого, хотя выглядеть блоки могут одинаково."
      >
        <McqOptions
          options={[
            "Потому что <div> вообще не умеют стилизовать через CSS",
            "Потому что <article> показывает, что это самостоятельный, законченный материал",
            "Потому что <article> работает быстрее, чем <div>",
            "Никакой разницы нет, теги взаимозаменяемы",
          ]}
          selected={mcqChoice}
          onSelect={setMcqChoice}
          disabled={stepper.status !== "idle"}
        />
      </TaskShell>
    );
  }

  return (
    <TaskShell
      index={task}
      total={5}
      statuses={stepper.statuses}
      prompt="Напиши название тега (без угловых скобок), который создаёт подвал страницы с копирайтом и контактами."
      status={stepper.status}
      onCheck={() =>
        stepper.markResult(textAnswer.trim().toLowerCase().replace(/[<>]/g, "") === "footer")
      }
      onNext={stepper.goNext}
      checkDisabled={!textAnswer.trim()}
      isLast
      feedback="footer — семантический тег для подвала страницы или раздела."
    >
      <input
        type="text"
        value={textAnswer}
        onChange={(e) => setTextAnswer(e.target.value)}
        disabled={stepper.status !== "idle"}
        placeholder="например: header"
        className="w-48 rounded-full border-2 border-slate-300 px-4 py-2 text-center font-mono font-semibold text-slate-700 outline-none focus:border-indigo-400 disabled:opacity-60"
      />
    </TaskShell>
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
        description="5 заданий о тегах и структуре документа."
      />
      <Tasks />
    </div>
  );
}
