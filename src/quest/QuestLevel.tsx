import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Footprints, Lightbulb, Play, RotateCcw, Star, Trash2, Undo2 } from "lucide-react";
import { BAYS, DIARY, mapsOf } from "./data";
import {
  bestLength,
  blockCount,
  depthOf,
  EMPTY_PROGRAM,
  getList,
  key,
  ownerOf,
  parentOf,
  parseMap,
  run,
  updateList,
  type Frame,
  type Node,
  type Program,
  type RunResult,
  type Tool,
} from "./engine";
import { Board } from "./Board";
import { BoltFigure } from "./Dialogue";
import { CodeBox } from "../components/GameTheory";
import { programText } from "./theory";
import { BODY_MAX, ProgramView, TOOL } from "./Program";
import { finishLevel, levelOpen, useQuest } from "./progress";
import { emitPixel } from "../lib/pixelBus";

const MAX_BLOCKS = 40;
const STEP_MS = 420;
const CHECK_MS = 160;

const PRAISE = ["Ура, получилось!", "Вот это программа!", "Пиксель в восторге!", "Отличная работа, инженер!"];

const plural = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? "блок" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "блока" : "блоков");

/** Where the mistake happened, in words a child understands. */
function place(f: Frame) {
  if (!f.path) return "";
  if (f.path.startsWith("fn")) return "в твоей команде ⭐";
  const top = Number(f.path.split("/")[1].split(".")[0]);
  const round = f.rounds[`main/${top}`];
  return round === undefined ? `на ${top + 1}-м блоке` : `в блоке ${top + 1}, на ${round + 1}-м круге`;
}

function boltSays(r: RunResult, program: Program, variant: number, variants: number): string {
  const last = r.frames[r.frames.length - 1];
  const where = place(last);
  const prefix = variants > 1 && r.outcome !== "win" ? `В варианте ${variant + 1}: ` : "";
  switch (r.outcome) {
    case "bump":
      return `${prefix}Бум! Пиксель врезался в стену ${where}. Посмотри, куда он смотрел перед этим шагом.`;
    case "dry":
      return `${prefix}Ой, Пиксель полил пустой пол ${where}. Поливать можно только на клетке с ростком.`;
    case "unwatered":
      return `${prefix}Дверь не открывается: ещё не все ростки политы. Вернись и полей их!`;
    case "nogears":
      return `${prefix}Дверь не открывается: собрано ещё не всё. Пройди по каждой клетке с деталью!`;
    case "endless":
      return `${prefix}Пиксель ходит и ходит, а выхода всё нет. Проверь, что он делает внутри повтора.`;
    case "short":
      return blockCount(program)
        ? `${prefix}Команды закончились, а Пиксель ещё не у двери. Добавь блоков!`
        : "Программа пустая. Нажимай на блоки, чтобы добавить команды.";
    default:
      return PRAISE[Math.floor(Math.random() * PRAISE.length)];
  }
}

/** One step of the show: which variant is on the board and which frame of it. */
type Shot = { v: number; i: number };

/** A new level gets a fresh screen: nothing from the previous level (its runs, its variants) may leak in. */
export function QuestLevel() {
  const { bay, level } = useParams();
  return <LevelScreen key={`${bay}/${level}`} />;
}

function LevelScreen() {
  const { bay: bayParam, level: levelParam } = useParams();
  const navigate = useNavigate();
  const save = useQuest();
  const bay = BAYS.find((b) => String(b.id) === bayParam);
  const index = Number(levelParam) - 1;
  const level = bay?.levels[index];

  const maps = useMemo(() => (level ? mapsOf(level).map(parseMap) : []), [level]);
  // the goal for the second star: the checked solution, or the shortest plain program
  const best = useMemo(() => (level?.solution ? blockCount(level.solution) : level && maps[0] ? bestLength(maps[0], level.dir, level.blocks) : null), [level, maps]);
  const optionalIn = (g: (typeof maps)[number]) => g.cells.flat().filter((c) => c === "*" || c === "D").length;

  const [program, setProgram] = useState<Program>(EMPTY_PROGRAM);
  const [into, setInto] = useState("main");
  const [view, setView] = useState(0); // which variant is shown while editing
  const [results, setResults] = useState<RunResult[] | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [shown, setShown] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hint, setHint] = useState(false);
  const [won, setWon] = useState<{ stars: number; short: boolean; all: boolean; fresh: number; diary: boolean; count: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // a new level: start over
  useEffect(() => {
    setProgram(EMPTY_PROGRAM);
    setInto("main");
    setView(0);
    setResults(null);
    setShots([]);
    setShown(0);
    setPlaying(false);
    setHint(false);
    setWon(null);
    return () => clearTimeout(timer.current);
  }, [bayParam, levelParam]);

  if (!bay || !level || !maps.length) return <p className="text-center text-slate-500">Такого уровня нет. <Link to="/quest" className="font-bold text-violet-600">На карту станции</Link></p>;
  if (!levelOpen(save, bay.id, index))
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-white/90 p-8 text-center">
        <p className="mb-4 text-5xl">🔒</p>
        <p className="mb-4 font-bold text-slate-600">Этот уровень пока закрыт. Пройди предыдущие!</p>
        <Link to={`/quest/${bay.id}`} className="font-bold text-violet-600">
          К уровням отсека →
        </Link>
      </div>
    );

  const running = results !== null;
  const done = running && shown >= shots.length;
  const shot = running && shots.length ? shots[Math.min(Math.max(shown, 1), shots.length) - 1] : null;
  const variant = shot ? shot.v : view;
  const grid = maps[variant];
  const frame: Frame = shot && results ? results[shot.v].frames[shot.i] : { x: grid.start.x, y: grid.start.y, dir: level.dir, got: [], watered: [], path: "", rounds: {} };
  const lastResult = results ? results[shots.length ? shots[shots.length - 1].v : 0] : null;
  const mood = !running ? "happy" : frame.event === "bump" || frame.event === "dry" ? "sad" : frame.event === "win" ? "love" : done && lastResult?.outcome !== "win" ? "thinking" : "happy";

  // the dark mine: Pixel sees the cells around him and remembers the ones he has passed
  let visible: Set<string> | null = null;
  if (level.fog) {
    visible = new Set();
    const passed = shot && results ? results[shot.v].frames.slice(0, shot.i + 1) : [frame];
    for (const f of passed) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) visible.add(key(f.x + dx, f.y + dy));
  }

  const total = blockCount(program);
  const withFn = level.blocks.includes("A");

  function stop() {
    clearTimeout(timer.current);
    setPlaying(false);
    setResults(null);
    setShots([]);
    setShown(0);
  }

  /** Fast taps must not lose blocks: build on the latest program, not on the one from the last render. */
  function change(update: (p: Program) => Program) {
    stop();
    setProgram((p) => {
      const next = update(p);
      return blockCount(next) > MAX_BLOCKS ? p : next;
    });
  }

  /** May this tool go into the open container? Returns the reason when it may not. */
  function allowed(t: Tool): string | null {
    const depth = depthOf(into);
    const inFn = into.startsWith("fn");
    const slot = into.slice(into.lastIndexOf(".") + 1);
    if (t === "A" && inFn) return "Свою команду нельзя вызвать внутри неё самой";
    if ((t === "loop" || t === "while") && depth > 0) return "Повтор можно поставить только в саму программу";
    if (t === "if" && depth > 0 && slot !== "body") return "«Если» нельзя положить внутрь другого «Если»";
    if (depth > 0 && getList(program, into).length >= BODY_MAX) return "Сюда больше не помещается";
    return null;
  }

  function add(t: Tool) {
    if (allowed(t)) return;
    const len = getList(program, into).length;
    const node: Node =
      t === "loop" ? { k: "loop", n: 3, body: [] } : t === "while" ? { k: "while", body: [] } : t === "if" ? { k: "if", cond: "wall", then: [], else: [] } : { k: "cmd", c: t };
    change((p) => updateList(p, into, (list) => [...list, node]));
    if (node.k === "loop" || node.k === "while") setInto(`${into}/${len}.body`);
    if (node.k === "if") setInto(`${into}/${len}.then`);
  }

  function remove(nodePath: string) {
    const parent = parentOf(nodePath);
    const i = Number(nodePath.slice(nodePath.lastIndexOf("/") + 1).split(".")[0]);
    // paths after the removed block shift: go back to the top of the program
    setInto(nodePath.startsWith("fn") ? "fn" : "main");
    change((p) => updateList(p, parent, (list) => list.filter((_, k) => k !== i)));
  }

  function setCount(nodePath: string, n: number) {
    const parent = parentOf(nodePath);
    const i = Number(nodePath.slice(nodePath.lastIndexOf("/") + 1));
    change((p) => updateList(p, parent, (list) => list.map((x, k) => (k === i && x.k === "loop" ? { ...x, n } : x))));
  }

  function undo() {
    const list = getList(program, into);
    if (list.length) {
      change((p) => updateList(p, into, (l) => l.slice(0, -1)));
      return;
    }
    if (depthOf(into) > 0) remove(ownerOf(into)); // an empty box: remove the box itself
  }

  function finish(rs: RunResult[], played: Shot[]) {
    const allWin = rs.every((r) => r.outcome === "win");
    if (!allWin || played.length === 0) {
      emitPixel("wrong");
      return;
    }
    const lastOf = (v: number) => rs[v].frames[rs[v].frames.length - 1];
    const cell = (v: number, k: string) => maps[v].cells[+k.split(",")[1]][+k.split(",")[0]];
    const all = rs.every((_, v) => lastOf(v).got.filter((k) => "*D".includes(cell(v, k))).length === optionalIn(maps[v]));
    const short = best !== null && total <= best;
    const stars = 1 + (short ? 1 : 0) + (all ? 1 : 0);
    const crystals = lastOf(0).got.filter((k) => cell(0, k) === "*");
    const diaryHere = rs.some((_, v) => lastOf(v).got.some((k) => cell(v, k) === "D"));
    const diaryNew = diaryHere && !save.diary.includes(level!.id);
    const fresh = finishLevel(level!.id, stars, crystals, diaryHere);
    emitPixel("complete");
    setTimeout(() => setWon({ stars, short, all, fresh, diary: diaryNew, count: total }), 700);
  }

  /** Runs every variant; the show goes through them one by one and stops at the first that fails. */
  function prepare() {
    const rs = maps.map((g) => run(g, level!.dir, program));
    const list: Shot[] = [];
    for (let v = 0; v < rs.length; v++) {
      rs[v].frames.forEach((_, i) => list.push({ v, i }));
      if (rs[v].outcome !== "win") break;
    }
    setInto("main");
    setResults(rs);
    setShots(list);
    return { rs, list };
  }

  function start() {
    clearTimeout(timer.current);
    const { rs, list } = prepare();
    setShown(1);
    setPlaying(true);
    let i = 1;
    const tick = () => {
      i++;
      setShown(i);
      if (i >= list.length) {
        setPlaying(false);
        finish(rs, list);
        return;
      }
      // a short pause when the next variant starts; a wall check is only a quick flash
      const nextShot = list[i];
      const isCheck = nextShot && rs[nextShot.v].frames[nextShot.i]?.event === "check";
      timer.current = setTimeout(tick, nextShot?.i === 0 ? 900 : isCheck ? CHECK_MS : STEP_MS);
    };
    timer.current = setTimeout(tick, STEP_MS);
  }

  function step() {
    clearTimeout(timer.current);
    setPlaying(false);
    if (!running || done) {
      prepare();
      setShown(1);
      return;
    }
    const next = shown + 1;
    setShown(next);
    if (next >= shots.length && results) finish(results, shots);
  }

  const activeFrame = running && !done ? frame : null;
  const failedPath = done && lastResult && (lastResult.outcome === "bump" || lastResult.outcome === "dry") ? frame.path : null;
  const nextLevel = index + 1 < bay.levels.length ? `/quest/${bay.id}/${index + 2}` : `/quest/${bay.id}`;
  const gotStars = save.stars[level.id] ?? 0;
  const cellsAll = maps.flatMap((g) => g.cells.flat());
  const sprouts = cellsAll.includes("P");
  const gears = cellsAll.includes("G");
  const crystalsHere = grid.cells.flat().filter((c) => c === "*").length;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide text-violet-500">
            {bay.emoji} {bay.name} · уровень {index + 1} из {bay.levels.length}
            {level.boss && " · 👑 испытание"}
          </p>
          <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl dark:text-slate-100">{level.title}</h1>
        </div>
        <div className="flex gap-0.5" aria-label={`Лучший результат: ${gotStars} из 3 звёзд`}>
          {[1, 2, 3].map((n) => (
            <Star key={n} className={`h-7 w-7 ${n <= gotStars ? "text-amber-400" : "text-slate-300"}`} fill="currentColor" strokeWidth={1.5} />
          ))}
        </div>
      </div>

      {/* Bolt explains the level (or what went wrong) */}
      <div className="mb-5 flex items-end gap-3">
        <BoltFigure className="w-16 shrink-0 sm:w-20" />
        <div className="relative flex-1 rounded-3xl rounded-bl-md border border-orange-200 bg-orange-50 px-4 py-3 text-base font-semibold text-slate-700 sm:text-lg">
          {done && lastResult ? boltSays(lastResult, program, shots[shots.length - 1]?.v ?? 0, maps.length) : hint ? level.hint : level.intro}
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div>
          {maps.length > 1 && (
            <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm font-extrabold text-slate-500">{running ? "Проверяем:" : "Посмотри все варианты:"}</span>
              {maps.map((_, v) => {
                // a mark appears only once that variant has been played to the end on the board
                let lastOfV = -1;
                shots.forEach((s, k) => s.v === v && (lastOfV = k));
                const played = lastOfV >= 0 && shown > lastOfV;
                const status = results && played ? (results[v].outcome === "win" ? "✓" : "✗") : "";
                return (
                  <button
                    key={v}
                    type="button"
                    disabled={running}
                    onClick={() => setView(v)}
                    className={`rounded-full border-2 px-3 py-1 text-sm font-extrabold transition ${
                      v === variant ? "border-violet-500 bg-violet-500 text-white" : "border-slate-200 text-slate-500 hover:border-violet-300"
                    }`}
                  >
                    Вариант {v + 1} {status}
                  </button>
                );
              })}
            </div>
          )}
          <Board key={variant} grid={grid} frame={frame} exit={bay.exit} mood={mood} item={bay.item} visible={visible} />
          <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-bold text-slate-500">
            <span>
              Цель: {sprouts ? "полить все 🌱 и " : ""}
              {gears ? `собрать все ${bay.item ?? "⚙️"} и ` : ""}дойти до {bay.exit}
            </span>
            {crystalsHere > 0 && <span>Собери: {"💎".repeat(crystalsHere)}</span>}
            {level.fog && <span>🔦 Темно: видно только клетки рядом</span>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#e6e7ee] bg-white p-4 shadow-sm">
            <p className="mb-2 text-sm font-extrabold text-slate-500">Команды — нажимай, чтобы добавить:</p>
            <div className="flex flex-wrap gap-2">
              {level.blocks.map((t) => {
                const b = TOOL[t];
                const Icon = b.icon;
                const why = allowed(t);
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={total >= MAX_BLOCKS || !!why}
                    title={why ?? undefined}
                    onClick={() => add(t)}
                    className={`flex min-w-[5.5rem] flex-col items-center gap-0.5 rounded-2xl border-b-4 px-3 py-2 text-white shadow transition active:translate-y-0.5 active:border-b-2 disabled:opacity-40 ${b.cls}`}
                  >
                    <Icon className="h-7 w-7" strokeWidth={2.5} fill={t === "A" ? "currentColor" : "none"} />
                    <span className="text-sm font-extrabold">{b.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-[#e6e7ee] bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-extrabold text-slate-500">
                Программа Пикселя: {total} {plural(total)}
              </p>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={undo}
                  disabled={!total}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30"
                  aria-label="Убрать последний блок"
                  title="Убрать последний"
                >
                  <Undo2 className="h-5 w-5" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInto("main");
                    change(() => EMPTY_PROGRAM);
                  }}
                  disabled={!total}
                  className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-30"
                  aria-label="Очистить программу"
                  title="Очистить всё"
                >
                  <Trash2 className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
            </div>
            <ProgramView
              program={program}
              into={into}
              onInto={(c) => !playing && setInto(c)}
              onChange={change}
              frame={activeFrame}
              failed={failedPath}
              onRemove={remove}
              onSetCount={setCount}
              withFn={withFn}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={start}
                disabled={playing}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-lg font-extrabold text-white shadow disabled:opacity-50"
              >
                <Play className="h-5 w-5" fill="currentColor" strokeWidth={2} />
                Запустить
              </button>
              <button type="button" onClick={step} disabled={playing} className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-200 px-4 py-2.5 font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                <Footprints className="h-5 w-5" strokeWidth={2} />
                По шагам
              </button>
              {running && (
                <button type="button" onClick={stop} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2.5 font-bold text-slate-400 hover:text-slate-600">
                  <RotateCcw className="h-4 w-4" strokeWidth={2} />
                  На старт
                </button>
              )}
              <button type="button" onClick={() => setHint(true)} className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-bold text-amber-600 hover:bg-amber-50">
                <Lightbulb className="h-4 w-4" strokeWidth={2} />
                Подсказка
              </button>
            </div>
          </div>
          {best !== null && (
            <p className="text-center text-sm font-semibold text-slate-400">
              Лучшее решение — {best} {plural(best)}. Сможешь так же?
            </p>
          )}
        </div>
      </div>

      {won && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="animate-fade-in max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 text-center shadow-2xl">
            <p className="text-sm font-extrabold uppercase tracking-wide text-emerald-500">Уровень пройден!</p>
            <div className="my-3 flex justify-center gap-2">
              {[1, 2, 3].map((n) => (
                <Star
                  key={n}
                  className={`h-14 w-14 ${n <= won.stars ? "text-amber-400" : "text-slate-200"}`}
                  style={n <= won.stars ? { animation: `quest-pop 0.5s ${n * 0.2}s both` } : undefined}
                  fill="currentColor"
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <ul className="mb-4 space-y-1 text-left text-sm font-semibold text-slate-600">
              <li>⭐ Дошёл до цели{maps.length > 1 ? " во всех вариантах" : ""}</li>
              <li className={won.short ? "" : "text-slate-400"}>
                {won.short ? "⭐" : "☆"} Программа не длиннее {best} {plural(best ?? 0)} (у тебя {won.count})
              </li>
              <li className={won.all ? "" : "text-slate-400"}>
                {won.all ? "⭐" : "☆"} Собрал всё: {cellsAll.includes("D") ? "кристаллы и листок" : "все кристаллы"}
              </li>
            </ul>
            <div className="mb-4">
              <p className="mb-2 text-left text-sm font-extrabold uppercase tracking-wide text-violet-500">💻 Твоя программа текстом — как пишут программисты</p>
              <CodeBox code={programText(program)} />
            </div>
            {won.fresh > 0 && <p className="mb-3 rounded-2xl bg-sky-50 p-2 font-bold text-sky-700">+{won.fresh} 💎 в копилку</p>}
            {won.diary && DIARY[level.id] && (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-left">
                <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-amber-700">📜 Ты нашёл листок из дневника! {DIARY[level.id].title}</p>
                <p className="font-serif italic text-slate-700">{DIARY[level.id].text}</p>
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setWon(null);
                  stop();
                }}
                className="rounded-full border-2 border-slate-200 px-5 py-2.5 font-bold text-slate-600"
              >
                Ещё раз
              </button>
              <button type="button" onClick={() => navigate(nextLevel)} className="rounded-lg bg-[#4f1fd1] hover:bg-[#4318b8] px-6 py-2.5 font-extrabold text-white shadow">
                {index + 1 < bay.levels.length ? "Следующий уровень →" : bay.finale ? "Открыть Сердце! →" : "Чиним отсек! →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
