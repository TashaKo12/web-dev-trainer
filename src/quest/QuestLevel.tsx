import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Footprints, Lightbulb, Play, RotateCcw, Star, Trash2, Undo2 } from "lucide-react";
import { BAYS, DIARY } from "./data";
import { bestLength, blockCount, flatten, isLoop, parseMap, run, type Block, type Origin, type RunResult, type Tool } from "./engine";
import { Board } from "./Board";
import { BoltFigure } from "./Dialogue";
import { BLOCK, BODY_MAX, LOOP_STYLE, ProgramView } from "./Program";
import { finishLevel, levelOpen, useQuest } from "./progress";
import { emitPixel } from "../lib/pixelBus";

const MAX_BLOCKS = 30;
const STEP_MS = 480;

const PRAISE = ["Ура, получилось!", "Вот это программа!", "Пиксель в восторге!", "Отличная работа, инженер!"];

const plural = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? "блок" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "блока" : "блоков");

/** Where the mistake happened, in words a child understands. */
function place(o: Origin | undefined) {
  if (!o) return "";
  return o.inner < 0 ? `на ${o.top + 1}-м блоке` : `в повторе (блок ${o.top + 1}), на ${o.round + 1}-м круге`;
}

function boltSays(r: RunResult, program: Block[], at: Origin[]): string {
  const last = r.frames[r.frames.length - 1];
  const where = place(at[last.step]);
  switch (r.outcome) {
    case "bump":
      return `Бум! Пиксель врезался в стену ${where}. Посмотри, куда он смотрел перед этим шагом.`;
    case "dry":
      return `Ой, Пиксель полил пустой пол ${where}. Поливать можно только на клетке с ростком.`;
    case "unwatered":
      return "Дверь не открывается: ещё не все ростки политы. Вернись и полей их!";
    case "nogears":
      return "Дверь не открывается: собраны ещё не все детали ⚙️. Пройди по каждой!";
    case "short":
      return program.length ? "Команды закончились, а Пиксель ещё не у двери. Добавь блоков!" : "Программа пустая. Нажимай на блоки, чтобы добавить команды.";
    default:
      return PRAISE[Math.floor(Math.random() * PRAISE.length)];
  }
}

export function QuestLevel() {
  const { bay: bayParam, level: levelParam } = useParams();
  const navigate = useNavigate();
  const save = useQuest();
  const bay = BAYS.find((b) => String(b.id) === bayParam);
  const index = Number(levelParam) - 1;
  const level = bay?.levels[index];

  const grid = useMemo(() => (level ? parseMap(level.map) : null), [level]);
  // the goal for the second star: with loops — the checked solution, without — the shortest plain program
  const best = useMemo(() => (level?.solution ? blockCount(level.solution) : grid && level ? bestLength(grid, level.dir, level.blocks) : null), [grid, level]);
  // optional finds for the third star: crystals and the diary page (gears are part of the goal)
  const items = useMemo(() => (grid ? grid.cells.flat().filter((c) => c === "*" || c === "D").length : 0), [grid]);

  const [program, setProgram] = useState<Block[]>([]);
  const [into, setInto] = useState<number | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [shown, setShown] = useState(0); // how many frames of the result are on the board
  const [playing, setPlaying] = useState(false);
  const [hint, setHint] = useState(false);
  const [won, setWon] = useState<{ stars: number; short: boolean; all: boolean; fresh: number; diary: boolean; count: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // a new level: start over
  useEffect(() => {
    setProgram([]);
    setInto(null);
    setResult(null);
    setShown(0);
    setPlaying(false);
    setHint(false);
    setWon(null);
    return () => clearTimeout(timer.current);
  }, [bayParam, levelParam]);

  if (!bay || !level || !grid) return <p className="text-center text-slate-500">Такого уровня нет. <Link to="/quest" className="font-bold text-violet-600">На карту станции</Link></p>;
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

  const done = result !== null && shown >= result.frames.length;
  const frame = result ? result.frames[Math.min(shown, result.frames.length) - 1] ?? result.frames[0] : { x: grid.start.x, y: grid.start.y, dir: level.dir, step: -1, got: [], watered: [] };
  const mood = !result ? "happy" : frame.event === "bump" || frame.event === "dry" ? "sad" : frame.event === "win" ? "love" : done && result.outcome !== "win" ? "thinking" : "happy";

  /** Fast taps must not lose blocks: build on the latest program, not on the one from the last render. */
  function change(update: (p: Block[]) => Block[]) {
    clearTimeout(timer.current);
    setPlaying(false);
    setResult(null);
    setShown(0);
    setProgram((p) => {
      const next = update(p);
      return blockCount(next) > MAX_BLOCKS ? p : next;
    });
  }

  /** A palette button: a command goes into the open repeat block (or to the end); "repeat" opens a new one. */
  function add(t: Tool) {
    if (t === "loop") {
      if (into !== null) return; // no loops inside loops for now
      setInto(program.length);
      change((p) => [...p, { n: 3, body: [] }]);
      return;
    }
    if (into !== null)
      change((p) => p.map((b, k) => (k === into && isLoop(b) && b.body.length < BODY_MAX ? { ...b, body: [...b.body, t] } : b)));
    else change((p) => [...p, t]);
  }

  function undo() {
    const open = into !== null ? program[into] : undefined;
    if (open && isLoop(open) && open.body.length) {
      change((p) => p.map((b, k) => (k === into && isLoop(b) ? { ...b, body: b.body.slice(0, -1) } : b)));
      return;
    }
    if (into === program.length - 1) setInto(null);
    change((p) => p.slice(0, -1));
  }

  const flat = flatten(program);

  function finish(r: RunResult) {
    if (r.outcome !== "win") {
      emitPixel("wrong");
      return;
    }
    const last = r.frames[r.frames.length - 1];
    const crystals = last.got.filter((k) => grid!.cells[+k.split(",")[1]][+k.split(",")[0]] === "*");
    // the third star counts only the optional finds — gears are part of the goal and are always collected
    const all = last.got.filter((k) => "*D".includes(grid!.cells[+k.split(",")[1]][+k.split(",")[0]])).length === items;
    const short = best !== null && blockCount(program) <= best;
    const stars = 1 + (short ? 1 : 0) + (all ? 1 : 0);
    const diaryHere = last.got.some((k) => grid!.cells[+k.split(",")[1]][+k.split(",")[0]] === "D");
    const diaryNew = diaryHere && !save.diary.includes(level!.id);
    const fresh = finishLevel(level!.id, stars, crystals, diaryHere);
    emitPixel("complete");
    setTimeout(() => setWon({ stars, short, all, fresh, diary: diaryNew, count: blockCount(program) }), 700);
  }

  function play(r: RunResult, from: number) {
    setPlaying(true);
    let i = from;
    const tick = () => {
      i++;
      setShown(i);
      if (i >= r.frames.length) {
        setPlaying(false);
        finish(r);
        return;
      }
      timer.current = setTimeout(tick, STEP_MS);
    };
    timer.current = setTimeout(tick, from === 0 ? 50 : STEP_MS);
  }

  function start() {
    clearTimeout(timer.current);
    setInto(null);
    const r = run(grid!, level!.dir, flat.cmds);
    setResult(r);
    setShown(1);
    play(r, 1);
  }

  function step() {
    clearTimeout(timer.current);
    setPlaying(false);
    if (!result || done) {
      setInto(null);
      const r = run(grid!, level!.dir, flat.cmds);
      setResult(r);
      setShown(1);
      return;
    }
    const next = shown + 1;
    setShown(next);
    if (next >= result.frames.length) finish(result);
  }

  function reset() {
    clearTimeout(timer.current);
    setPlaying(false);
    setResult(null);
    setShown(0);
  }

  const activeAt = result && !done && frame.step >= 0 ? (flat.at[frame.step] ?? null) : null;
  const failedAt = done && result && (result.outcome === "bump" || result.outcome === "dry") ? (flat.at[frame.step] ?? null) : null;
  const total = blockCount(program);
  const gears = grid.cells.flat().includes("G");
  const sprouts = grid.cells.flat().includes("P");
  const nextLevel = index + 1 < bay.levels.length ? `/quest/${bay.id}/${index + 2}` : `/quest/${bay.id}`;
  const gotStars = save.stars[level.id] ?? 0;

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
          {done && result ? boltSays(result, program, flat.at) : hint ? level.hint : level.intro}
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div>
          <Board grid={grid} frame={frame} exit={bay.exit} mood={mood} />
          <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-bold text-slate-500">
            <span>
              Цель: {sprouts ? "полить все 🌱 и " : ""}
              {gears ? "собрать все ⚙️ и " : ""}дойти до {bay.exit}
            </span>
            {items > 0 && <span>Собери: {"💎".repeat(grid.cells.flat().filter((c) => c === "*").length)}{grid.cells.flat().includes("D") ? " 📜" : ""}</span>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <p className="mb-2 text-sm font-extrabold text-slate-500">Команды — нажимай, чтобы добавить:</p>
            <div className="flex flex-wrap gap-2">
              {level.blocks.map((c) => {
                const b = c === "loop" ? LOOP_STYLE : BLOCK[c];
                const Icon = b.icon;
                return (
                  <button
                    key={c}
                    type="button"
                    disabled={total >= MAX_BLOCKS || (c === "loop" && into !== null)}
                    title={c === "loop" && into !== null ? "Сначала нажми «Готово» у открытого повтора" : undefined}
                    onClick={() => add(c)}
                    className={`flex min-w-[5.5rem] flex-col items-center gap-0.5 rounded-2xl border-b-4 px-3 py-2 text-white shadow transition active:translate-y-0.5 active:border-b-2 disabled:opacity-40 ${b.cls}`}
                  >
                    <Icon className="h-7 w-7" strokeWidth={2.5} />
                    <span className="text-sm font-extrabold">{b.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-extrabold text-slate-500">
                Программа Пикселя: {total} {plural(total)}
              </p>
              <div className="flex gap-1">
                <button type="button" onClick={undo} disabled={!program.length} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30" aria-label="Убрать последний блок" title="Убрать последний">
                  <Undo2 className="h-5 w-5" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInto(null);
                    change(() => []);
                  }}
                  disabled={!program.length} className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-30" aria-label="Очистить программу" title="Очистить всё">
                  <Trash2 className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
            </div>
            <ProgramView program={program} into={into} onInto={setInto} onChange={change} active={activeAt} failed={failedAt} />
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
              {result && (
                <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2.5 font-bold text-slate-400 hover:text-slate-600">
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
          {best !== null && <p className="text-center text-sm font-semibold text-slate-400">Лучшее решение — {best} {plural(best)}. Сможешь так же?</p>}
        </div>
      </div>

      {won && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="animate-fade-in w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
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
              <li>⭐ Дошёл до цели</li>
              <li className={won.short ? "" : "text-slate-400"}>
                {won.short ? "⭐" : "☆"} Программа не длиннее {best} {plural(best ?? 0)} (у тебя {won.count})
              </li>
              <li className={won.all ? "" : "text-slate-400"}>
                {won.all ? "⭐" : "☆"} Собрал всё: {grid.cells.flat().includes("D") ? "кристаллы и листок" : "все кристаллы"}
              </li>
            </ul>
            {won.fresh > 0 && <p className="mb-3 rounded-2xl bg-sky-50 p-2 font-bold text-sky-700">+{won.fresh} 💎 в копилку</p>}
            {won.diary && DIARY[level.id] && (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-left">
                <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-amber-700">📜 Ты нашёл листок из дневника! {DIARY[level.id].title}</p>
                <p className="font-serif italic text-slate-700">{DIARY[level.id].text}</p>
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" onClick={() => { setWon(null); reset(); }} className="rounded-full border-2 border-slate-200 px-5 py-2.5 font-bold text-slate-600">
                Ещё раз
              </button>
              <button type="button" onClick={() => navigate(nextLevel)} className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-2.5 font-extrabold text-white shadow">
                {index + 1 < bay.levels.length ? "Следующий уровень →" : "Чиним отсек! →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
