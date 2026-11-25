import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { BookOpen, Lightbulb, Lock, Play, RotateCcw, Star } from "lucide-react";
import { readDraft, writeDraft } from "../lib/drafts";
import { createStarStore } from "../lib/gameStars";
import { emitPixel } from "../lib/pixelBus";
import { TheoryCard, type GameTheory } from "../components/GameTheory";
import { BoltFigure, Dialogue } from "../quest/Dialogue";
import { bayDone, useQuest } from "../quest/progress";
import { BeaconBoard } from "./BeaconBoard";
import { ALL_LEVELS, BEACON_INTRO, BEACON_OUTRO, DECKS, LANGUAGE_THEORY, type Deck } from "./data";
import { initial, parse, parseGrid, run, type RunResult } from "./engine";
import { CatalogBanner } from "../components/CatalogBanner";
import { useRoomBelow } from "../components/useRoomBelow";

// Станция «Маяк»: the station map (decks of levels) and one level — write the code, run it, watch Pixel.

export const beaconStars = createStarStore("wdt:beacon", "beacon", () => ALL_LEVELS.map((l) => l.id));

const FINALE_BAY = 7; // the Heart of the first station: the lighthouse is seen from there
const STEP_MS = 340;
const deckDone = (stars: Record<string, number>, d: Deck) => d.levels.every((l) => (stars[l.id] ?? 0) > 0);
const levelOpen = (stars: Record<string, number>, i: number) => i === 0 || (stars[ALL_LEVELS[i - 1].id] ?? 0) > 0;
/** The goal for the second star: as many lines as the checked solution. */
const BEST: Record<string, number> = Object.fromEntries(
  ALL_LEVELS.map((l) => {
    const p = parse(l.solution);
    return [l.id, p.ok ? p.prog.count : 99];
  }),
);
/** Unsent code of every level: kept while the page is open. */

const lines = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? "строка" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "строки" : "строк");

function Stars({ n, size = "h-4 w-4" }: { n: number; size?: string }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3].map((k) => (
        <Star key={k} className={`${size} ${k <= n ? "text-amber-400" : "text-slate-300"}`} fill="currentColor" strokeWidth={1.5} />
      ))}
    </span>
  );
}

function Locked({ text, to, label }: { text: string; to: string; label: string }) {
  return (
    <div className="mx-auto max-w-md rounded-3xl bg-white/90 p-8 text-center">
      <p className="mb-4 text-5xl">🔒</p>
      <p className="mb-4 font-bold text-slate-600">{text}</p>
      <Link to={to} className="font-bold text-violet-600">
        {label} →
      </Link>
    </div>
  );
}

/** The lighthouse tower: one window per deck, its letter glows when the deck is repaired. */
function Tower({ stars }: { stars: Record<string, number> }) {
  const finale = deckDone(stars, DECKS[DECKS.length - 1]);
  return (
    <div className="flex flex-col items-center">
      <div className={`mb-1 h-10 w-24 rounded-t-full ${finale ? "bg-[#fde047] shadow-[0_0_60px_20px_#facc15]" : "bg-[#334155]"}`} />
      <div className="flex flex-col items-center gap-2 rounded-b-xl bg-gradient-to-b from-[#e2e8f0] to-[#94a3b8] px-5 py-3 [clip-path:polygon(18%_0,82%_0,100%_100%,0_100%)]">
        {DECKS.filter((d) => d.letter).map((d) => {
          const on = deckDone(stars, d);
          return (
            <span
              key={d.id}
              title={d.name}
              className={`flex h-11 w-11 items-center justify-center rounded-lg text-2xl font-black ${on ? "bg-[#fde047] text-[#92400e] shadow-[0_0_18px_#facc15]" : "bg-[#1e293b] text-[#475569]"}`}
            >
              {on ? d.letter : "?"}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function BeaconHome() {
  const save = beaconStars.use();
  const quest = useQuest();
  const location = useLocation();
  const [screen, setScreen] = useState<"story" | "lang" | "outro" | null>(() =>
    (location.state as { outro?: boolean } | null)?.outro ? "outro" : !save.intro ? "story" : null,
  );

  if (!bayDone(quest, FINALE_BAY))
    return <Locked text="Маяк виден только из Сердца первой станции. Сначала пройди «Тайну станции» до конца!" to="/quest" label="К первой станции" />;

  const title = <h1 className="mb-6 text-center text-3xl font-extrabold text-slate-800 sm:text-4xl dark:text-slate-100">Станция «Маяк»</h1>;
  if (screen === "story" || screen === "outro")
    return (
      <div className="py-4">
        {title}
        <Dialogue
          key={screen}
          lines={screen === "story" ? BEACON_INTRO : BEACON_OUTRO}
          doneLabel={screen === "story" ? "Узнать язык маяка" : "Ура!"}
          onDone={() => setScreen(screen === "story" ? "lang" : null)}
        />
      </div>
    );
  if (screen === "lang")
    return (
      <div>
        {title}
        <TheoryCard
          theory={LANGUAGE_THEORY}
          doneLabel="Понятно, чиним маяк!"
          onDone={() => {
            beaconStars.markIntro();
            setScreen(null);
          }}
        />
      </div>
    );

  const total = ALL_LEVELS.reduce((s, l) => s + (save.stars[l.id] ?? 0), 0);
  const finaleDone = deckDone(save.stars, DECKS[DECKS.length - 1]);
  return (
    <div>
      <CatalogBanner
        icon="🗼"
        kicker="Тайна станции · вторая станция"
        title="Станция «Маяк»"
        note="Здесь нет блоков: пиши команды словами, зажигай лампы и носи батарейки. Почини все палубы — и маяк засветится."
      />

      <div className="mb-8 grid items-center gap-6 md:grid-cols-[auto_1fr]">
        <Tower stars={save.stars} />
        <div className="flex flex-col gap-3">
          <p className="inline-flex w-fit items-center gap-1 rounded-full bg-white/90 px-4 py-2 text-sm font-extrabold text-slate-700 shadow-sm">
            <Star className="h-4 w-4 text-amber-400" fill="currentColor" strokeWidth={1.5} /> {total} из {ALL_LEVELS.length * 3}
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setScreen("lang")} className="inline-flex items-center gap-1.5 rounded-full border-2 border-violet-200 bg-white px-4 py-2 text-sm font-extrabold text-violet-600 hover:border-violet-400">
              <BookOpen className="h-4 w-4" strokeWidth={2.4} /> Язык маяка: все команды
            </button>
            <button type="button" onClick={() => setScreen("story")} className="rounded-full px-4 py-2 text-sm font-bold text-slate-400 hover:text-violet-600">
              Послушать историю ещё раз
            </button>
            {finaleDone && (
              <button type="button" onClick={() => setScreen("outro")} className="rounded-full border-2 border-amber-300 bg-amber-50 px-4 py-2 text-sm font-extrabold text-amber-700">
                🗼 Секрет маяка
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {DECKS.map((deck) => {
          const firstIndex = ALL_LEVELS.findIndex((l) => l.id === deck.levels[0].id);
          const open = levelOpen(save.stars, firstIndex);
          const done = deckDone(save.stars, deck);
          return (
            <section key={deck.id} className={`rounded-3xl border-2 p-5 ${open ? "border-white/70 bg-white/95 shadow-sm" : "border-slate-200 bg-white/60 opacity-70"}`}>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">{deck.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{deck.letter ? `Палуба ${deck.id}` : "Финал"}</p>
                  <h2 className="text-lg font-extrabold text-slate-800">{deck.name}</h2>
                  <p className="text-sm text-slate-500">{deck.about}</p>
                </div>
                {deck.letter && <span className={`rounded-xl px-3 py-1 text-lg font-black ${done ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-400"}`}>{done ? deck.letter : "?"}</span>}
                {!open && <Lock className="h-5 w-5 text-slate-400" strokeWidth={2.2} />}
              </div>
              <div className="flex flex-wrap gap-3">
                {deck.levels.map((l) => {
                  const i = ALL_LEVELS.findIndex((x) => x.id === l.id);
                  const lo = levelOpen(save.stars, i);
                  const st = save.stars[l.id] ?? 0;
                  const inner = (
                    <>
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-full border-b-4 text-lg font-black ${
                          !lo ? "border-slate-300 bg-slate-200 text-slate-400" : l.boss ? "border-amber-600 bg-gradient-to-br from-amber-300 to-orange-500 text-white" : "border-indigo-700 bg-gradient-to-br from-indigo-400 to-violet-500 text-white"
                        } ${lo && st === 0 ? "ring-4 ring-amber-300 ring-offset-2" : ""}`}
                      >
                        {!lo ? "🔒" : l.boss ? "👑" : l.id.split("-")[1]}
                      </span>
                      <span className="max-w-[7rem] text-center text-xs font-bold leading-tight text-slate-600">{l.title}</span>
                      <Stars n={st} size="h-3 w-3" />
                    </>
                  );
                  return lo ? (
                    <Link key={l.id} to={`/beacon/${l.id}`} className="flex flex-col items-center gap-1 transition hover:-translate-y-0.5">
                      {inner}
                    </Link>
                  ) : (
                    <div key={l.id} className="flex flex-col items-center gap-1" aria-disabled="true">
                      {inner}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

/** The code: line numbers on the left, Tab makes an indent, Enter keeps it (and adds one after «повтори» or «команда»). */
function CodeEditor({
  value,
  onChange,
  readOnly,
  active,
  error,
  area,
}: {
  value: string;
  onChange: (v: string) => void;
  readOnly: boolean;
  active: number | null;
  error: number | null;
  area: RefObject<HTMLTextAreaElement | null>;
}) {
  const count = Math.max(value.split("\n").length, 8);
  function insert(el: HTMLTextAreaElement, text: string) {
    const a = el.selectionStart;
    const b = el.selectionEnd;
    onChange(value.slice(0, a) + text + value.slice(b));
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = a + text.length;
    });
  }
  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (readOnly) return;
    const el = e.currentTarget;
    if (e.key === "Tab") {
      e.preventDefault();
      insert(el, "    ");
    } else if (e.key === "Enter") {
      e.preventDefault();
      const lineStart = value.lastIndexOf("\n", el.selectionStart - 1) + 1;
      const current = value.slice(lineStart, el.selectionStart);
      let pad = current.match(/^\s*/)?.[0] ?? "";
      // \b does not see Russian letters: check for a space or the end of the line instead
      if (/^\s*(повтори|команда)(?=\s|$)/i.test(current)) pad += "    ";
      insert(el, "\n" + pad);
    }
  }
  return (
    <div className="flex overflow-hidden rounded-2xl border-2 border-[#334155] bg-[#0f172a] font-mono text-lg leading-7">
      <div className="select-none bg-[#1e293b] py-3 text-right text-[#64748b]" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className={`px-3 ${error === i + 1 ? "bg-[#be123c] text-white" : active === i + 1 ? "bg-[#facc15] font-bold text-[#422006]" : ""}`}>
            {i + 1}
          </div>
        ))}
      </div>
      <textarea
        ref={area}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        readOnly={readOnly}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        wrap="off"
        placeholder={"вперёд\nсвети"}
        aria-label="Код Пикселя"
        className="min-w-0 flex-1 resize-none overflow-x-auto bg-transparent px-3 py-3 text-[#a7f3d0] caret-[#fde047] outline-none placeholder:text-[#334155]"
        style={{ height: `${count * 1.75 + 1.5}rem` }}
      />
    </div>
  );
}

/** Every level gets a fresh screen. */
export function BeaconLevelPage() {
  const { level } = useParams();
  return <LevelScreen key={level} />;
}

function LevelScreen() {
  const { level: param } = useParams();
  const navigate = useNavigate();
  const side = useRoomBelow<HTMLDivElement>();
  const save = beaconStars.use();
  const quest = useQuest();
  const index = ALL_LEVELS.findIndex((l) => l.id === param);
  const level = ALL_LEVELS[index];
  const deck = DECKS.find((d) => d.levels.some((l) => l.id === param));
  const grid = useMemo(() => parseGrid(level?.map ?? ["."]), [level]);
  const [code, setCode] = useState(() => readDraft(`beacon:${param}`) ?? "");
  const [result, setResult] = useState<RunResult | null>(null);
  const [shown, setShown] = useState(0);
  const [message, setMessage] = useState<{ tone: "bad" | "good"; text: string } | null>(null);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0); // runs stopped by a misspelled word
  const [hint, setHint] = useState(false);
  const [won, setWon] = useState<{ stars: number; count: number } | null>(null);
  const [theory, setTheory] = useState<GameTheory | null>(() => (deck && level && deck.levels[0].id === level.id && !(save.stars[level.id] > 0) ? deck.theory : null));
  const area = useRef<HTMLTextAreaElement>(null);

  const playing = result !== null && shown < result.frames.length - 1;

  // play the run frame by frame, then tell what happened
  useEffect(() => {
    if (!result || !level) return;
    if (shown < result.frames.length - 1) {
      const t = setTimeout(() => setShown((s) => s + 1), STEP_MS);
      return () => clearTimeout(t);
    }
    if (result.outcome === "win") {
      const p = parse(code);
      const count = p.ok ? p.prog.count : 99;
      const stars = 1 + (count <= BEST[level.id] ? 1 : 0) + (mistakes === 0 ? 1 : 0);
      beaconStars.finish(level.id, stars);
      emitPixel("complete");
      setWon({ stars, count });
    } else {
      emitPixel("wrong");
      setMessage({ tone: "bad", text: result.msg });
      setErrorLine(result.line ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, shown]);

  if (!level || !deck) return <p className="text-center text-slate-500">Такого уровня нет. <Link to="/beacon" className="font-bold text-violet-600">На карту маяка</Link></p>;
  if (!bayDone(quest, FINALE_BAY)) return <Locked text="Маяк откроется после первой станции." to="/quest" label="К первой станции" />;
  if (!levelOpen(save.stars, index)) return <Locked text="Этот уровень пока закрыт. Пройди предыдущий!" to="/beacon" label="На карту маяка" />;

  if (theory)
    return (
      <div>
        <p className="mb-4 text-center text-sm font-extrabold uppercase tracking-wide text-violet-500">
          {deck.emoji} {deck.name}
        </p>
        <TheoryCard theory={theory} onDone={() => setTheory(null)} doneLabel="Понятно, пишу код!" />
      </div>
    );

  function edit(v: string) {
    setCode(v);
    writeDraft(`beacon:${level.id}`, v);
    setResult(null);
    setShown(0);
    setErrorLine(null);
    setMessage(null);
  }

  function start() {
    const p = parse(code);
    setWon(null);
    if (!p.ok) {
      setMistakes((m) => m + 1);
      setErrorLine(p.line || null);
      setMessage({ tone: "bad", text: p.msg });
      setResult(null);
      emitPixel("wrong");
      return;
    }
    const missing = (level.require ?? []).find((w) => !p.prog.used.includes(w));
    if (missing) {
      setErrorLine(null);
      setMessage({ tone: "bad", text: `В этом уровне учимся слову «${missing}» — используй его в коде!` });
      return;
    }
    setErrorLine(null);
    setMessage({ tone: "good", text: "Маяк читает код…" });
    setShown(0);
    setResult(run(grid, level.start, p.prog));
  }

  function reset() {
    setResult(null);
    setShown(0);
    setErrorLine(null);
    setMessage(null);
  }

  /** A click on a word of the cheat sheet types it into the code (handy on a tablet). */
  function type(word: string) {
    const el = area.current;
    if (!el || playing) return;
    const a = el.selectionStart;
    const before = code.slice(0, a);
    const lineStart = before.lastIndexOf("\n") + 1;
    const needsBreak = before.slice(lineStart).trim() !== "";
    const text = (needsBreak ? "\n" : "") + word;
    edit(code.slice(0, a) + text + code.slice(el.selectionEnd));
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = a + text.length;
    });
  }

  const state = result ? result.frames[shown] : initial(grid, level.start);
  const parsed = parse(code);
  const count = parsed.ok ? parsed.prog.count : code.split("\n").filter((l) => l.trim() && l.trim().toLowerCase() !== "конец").length;
  const known = DECKS.slice(0, deck.id).flatMap((d) => d.words);
  const next = ALL_LEVELS[index + 1];
  const deckFinished = deck.levels[deck.levels.length - 1].id === level.id;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide text-violet-500">
            {deck.emoji} {deck.name} · уровень {level.id.split("-")[1]} из {deck.levels.length}
          </p>
          <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl dark:text-slate-100">
            {level.boss && "👑 "}
            {level.title}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Stars n={save.stars[level.id] ?? 0} size="h-6 w-6" />
          <button type="button" onClick={() => setTheory(deck.theory)} className="inline-flex items-center gap-1.5 rounded-full border-2 border-violet-200 bg-white px-4 py-1.5 text-sm font-extrabold text-violet-600 hover:border-violet-400">
            <BookOpen className="h-4 w-4" strokeWidth={2.4} /> Теория
          </button>
          <button type="button" onClick={() => setTheory(LANGUAGE_THEORY)} className="rounded-full border-2 border-slate-200 bg-white px-4 py-1.5 text-sm font-bold text-slate-500 hover:border-violet-300">
            Все команды
          </button>
        </div>
      </div>

      <div className="mb-5 flex items-end gap-3">
        <BoltFigure className="w-14 shrink-0 sm:w-16" />
        <div
          className={`flex-1 rounded-3xl rounded-bl-md border px-4 py-3 font-semibold ${
            message?.tone === "bad" ? "border-rose-200 bg-rose-50 text-rose-800" : message ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-orange-200 bg-orange-50 text-slate-700"
          }`}
        >
          {message?.text ?? level.intro}
          {hint && (
            <p className="mt-2 flex items-start gap-2 text-sm text-amber-800">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} /> {level.hint}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div>
          <BeaconBoard grid={grid} state={state} />
          <p className="mt-3 text-center text-sm font-semibold text-slate-400">
            Зажги все 💡{level.map.join("").includes("x") ? " и вставь батарейки 🔋 во все розетки 🔌" : ""}.
          </p>
        </div>

        <div ref={side.ref} style={{ maxHeight: side.room }} className="flex min-h-0 flex-col gap-4">
          <div className="flex min-h-0 flex-col rounded-xl border border-[#e6e7ee] bg-white p-4 shadow-sm">
            <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-extrabold uppercase tracking-wide text-slate-500">Код Пикселя</p>
              <p className="text-sm font-bold text-slate-400">
                {count} {lines(count)} · цель — не больше {BEST[level.id]}
              </p>
            </div>
            <div className="min-h-[7rem] overflow-y-auto rounded-2xl">
              <CodeEditor value={code} onChange={edit} readOnly={playing} active={result ? state.line : null} error={errorLine} area={area} />
            </div>
            <div className="mt-3 flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={start}
                disabled={playing || !code.trim()}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 font-extrabold text-white shadow disabled:opacity-40"
              >
                <Play className="h-4 w-4" fill="currentColor" strokeWidth={2} /> Запустить
              </button>
              <button type="button" onClick={reset} disabled={!result} className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-200 px-4 py-2 font-bold text-slate-600 disabled:opacity-40">
                <RotateCcw className="h-4 w-4" strokeWidth={2.2} /> Сначала
              </button>
              <button type="button" onClick={() => setHint(true)} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-bold text-amber-600 hover:bg-amber-50">
                <Lightbulb className="h-4 w-4" strokeWidth={2.2} /> Подсказка
              </button>
            </div>
          </div>

          <div className="min-h-[8rem] shrink overflow-y-auto rounded-xl border border-[#e6e7ee] bg-white p-4 shadow-sm">
            <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-slate-500">Шпаргалка</p>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {known.map((w) => (
                <li key={w.word}>
                  <button
                    type="button"
                    onClick={() => type(w.word)}
                    className="flex w-full items-baseline gap-2 rounded-xl px-2 py-1 text-left hover:bg-violet-50"
                    title="Нажми — слово появится в коде"
                  >
                    <code className="rounded-md bg-[#0f172a] px-2 py-0.5 font-mono text-sm font-bold text-[#a7f3d0]">{w.word}</code>
                    <span className="text-sm text-slate-500">{w.about}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-slate-400">Одна команда — одна строка. Tab делает отступ. Слово можно напечатать или нажать в шпаргалке.</p>
          </div>
        </div>
      </div>

      {won && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="animate-fade-in max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 text-center shadow-2xl">
            <p className="text-sm font-extrabold uppercase tracking-wide text-emerald-500">Уровень пройден!</p>
            <div className="my-3 flex justify-center">
              <Stars n={won.stars} size="h-14 w-14" />
            </div>
            <ul className="mb-4 space-y-1 text-left text-sm font-semibold text-slate-600">
              <li>⭐ Маяк выполнил код</li>
              <li className={won.count <= BEST[level.id] ? "" : "text-slate-400"}>
                {won.count <= BEST[level.id] ? "⭐" : "☆"} Не больше {BEST[level.id]} {lines(BEST[level.id])} (у тебя {won.count})
              </li>
              <li className={mistakes === 0 ? "" : "text-slate-400"}>
                {mistakes === 0 ? "⭐" : "☆"} Без ошибок в словах{mistakes ? ` (ошибок: ${mistakes})` : ""}
              </li>
            </ul>
            {deckFinished && deck.letter && (
              <p className="mb-4 rounded-2xl bg-amber-50 p-3 font-extrabold text-amber-700">🗼 На башне маяка загорелась буква «{deck.letter}»!</p>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" onClick={() => { setWon(null); reset(); }} className="rounded-full border-2 border-slate-200 px-5 py-2.5 font-bold text-slate-600">
                Ещё раз
              </button>
              <button
                type="button"
                onClick={() => (next ? navigate(`/beacon/${next.id}`) : navigate("/beacon", { state: { outro: true } }))}
                className="rounded-lg bg-[#4d16c9] hover:bg-[#4514b5] px-6 py-2.5 font-extrabold text-white shadow"
              >
                {next ? "Следующий уровень →" : "Маяк горит! →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
