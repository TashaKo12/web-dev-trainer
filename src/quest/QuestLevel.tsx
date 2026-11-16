import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowUp, Droplets, Footprints, Lightbulb, Play, RotateCcw, RotateCw, Star, Trash2, Undo2, X, type LucideIcon } from "lucide-react";
import { BAYS, DIARY } from "./data";
import { bestLength, parseMap, run, type Cmd, type RunResult } from "./engine";
import { Board } from "./Board";
import { BoltFigure } from "./Dialogue";
import { finishLevel, levelOpen, useQuest } from "./progress";
import { emitPixel } from "../lib/pixelBus";

const BLOCK: Record<Cmd, { label: string; icon: LucideIcon; cls: string }> = {
  F: { label: "Вперёд", icon: ArrowUp, cls: "bg-sky-500 border-sky-700" },
  L: { label: "Налево", icon: RotateCcw, cls: "bg-violet-500 border-violet-700" },
  R: { label: "Направо", icon: RotateCw, cls: "bg-fuchsia-500 border-fuchsia-700" },
  W: { label: "Полить", icon: Droplets, cls: "bg-emerald-500 border-emerald-700" },
};

const MAX_BLOCKS = 30;
const STEP_MS = 480;

const PRAISE = ["Ура, получилось!", "Вот это программа!", "Пиксель в восторге!", "Отличная работа, инженер!"];

function boltSays(r: RunResult, program: Cmd[]): string {
  const last = r.frames[r.frames.length - 1];
  const n = last.step + 1;
  switch (r.outcome) {
    case "bump":
      return `Бум! На ${n}-м блоке Пиксель врезался в стену. Посмотри, куда он смотрел перед этим шагом.`;
    case "dry":
      return `Ой, на ${n}-м блоке Пиксель полил пустой пол. Поливать можно только на клетке с ростком.`;
    case "unwatered":
      return "Дверь не открывается: ещё не все ростки политы. Вернись и полей их!";
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
  const best = useMemo(() => (grid && level ? bestLength(grid, level.dir, level.blocks) : null), [grid, level]);
  const items = useMemo(() => (grid ? grid.cells.flat().filter((c) => c === "*" || c === "D").length : 0), [grid]);

  const [program, setProgram] = useState<Cmd[]>([]);
  const [result, setResult] = useState<RunResult | null>(null);
  const [shown, setShown] = useState(0); // how many frames of the result are on the board
  const [playing, setPlaying] = useState(false);
  const [hint, setHint] = useState(false);
  const [won, setWon] = useState<{ stars: number; short: boolean; all: boolean; fresh: number; diary: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // a new level: start over
  useEffect(() => {
    setProgram([]);
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
  function change(update: (p: Cmd[]) => Cmd[]) {
    clearTimeout(timer.current);
    setPlaying(false);
    setResult(null);
    setShown(0);
    setProgram((p) => update(p).slice(0, MAX_BLOCKS));
  }

  function finish(r: RunResult) {
    if (r.outcome !== "win") {
      emitPixel("wrong");
      return;
    }
    const last = r.frames[r.frames.length - 1];
    const crystals = last.got.filter((k) => grid!.cells[+k.split(",")[1]][+k.split(",")[0]] === "*");
    const all = last.got.length === items;
    const short = best !== null && program.length <= best;
    const stars = 1 + (short ? 1 : 0) + (all ? 1 : 0);
    const diaryHere = last.got.some((k) => grid!.cells[+k.split(",")[1]][+k.split(",")[0]] === "D");
    const diaryNew = diaryHere && !save.diary.includes(level!.id);
    const fresh = finishLevel(level!.id, stars, crystals, diaryHere);
    emitPixel("complete");
    setTimeout(() => setWon({ stars, short, all, fresh, diary: diaryNew }), 700);
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
    const r = run(grid!, level!.dir, program);
    setResult(r);
    setShown(1);
    play(r, 1);
  }

  function step() {
    clearTimeout(timer.current);
    setPlaying(false);
    if (!result || done) {
      const r = run(grid!, level!.dir, program);
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

  const currentStep = result && !done ? frame.step : -1;
  const failedStep = done && result && result.outcome !== "win" && result.outcome !== "short" && result.outcome !== "unwatered" ? frame.step : -1;
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
          {done && result ? boltSays(result, program) : hint ? level.hint : level.intro}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <Board grid={grid} frame={frame} exit={bay.exit} mood={mood} />
          <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-bold text-slate-500">
            <span>
              Цель: {grid.cells.flat().includes("P") ? "полить все 🌱 и дойти до " : "дойти до "}
              {bay.exit}
            </span>
            {items > 0 && <span>Собери: {"💎".repeat(grid.cells.flat().filter((c) => c === "*").length)}{grid.cells.flat().includes("D") ? " 📜" : ""}</span>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <p className="mb-2 text-sm font-extrabold text-slate-500">Команды — нажимай, чтобы добавить:</p>
            <div className="flex flex-wrap gap-2">
              {level.blocks.map((c) => {
                const b = BLOCK[c];
                const Icon = b.icon;
                return (
                  <button
                    key={c}
                    type="button"
                    disabled={program.length >= MAX_BLOCKS}
                    onClick={() => change((p) => [...p, c])}
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
                Программа Пикселя: {program.length} {program.length === 1 ? "блок" : program.length >= 2 && program.length <= 4 ? "блока" : "блоков"}
              </p>
              <div className="flex gap-1">
                <button type="button" onClick={() => change((p) => p.slice(0, -1))} disabled={!program.length} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30" aria-label="Убрать последний блок" title="Убрать последний">
                  <Undo2 className="h-5 w-5" strokeWidth={2} />
                </button>
                <button type="button" onClick={() => change(() => [])} disabled={!program.length} className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-30" aria-label="Очистить программу" title="Очистить всё">
                  <Trash2 className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
            </div>
            <ol className="flex min-h-[4.5rem] flex-wrap gap-1.5 rounded-2xl bg-slate-100 p-2">
              {program.length === 0 && <li className="self-center px-2 text-sm text-slate-400">Тут пока пусто…</li>}
              {program.map((c, i) => {
                const b = BLOCK[c];
                const Icon = b.icon;
                const active = i === currentStep;
                const failed = i === failedStep;
                return (
                  <li key={i} className="group relative">
                    <span
                      className={`flex h-12 w-12 flex-col items-center justify-center rounded-xl border-b-4 text-white transition ${b.cls} ${
                        active ? "scale-110 ring-4 ring-amber-300" : ""
                      } ${failed ? "ring-4 ring-rose-500" : ""}`}
                      title={b.label}
                    >
                      <Icon className="h-6 w-6" strokeWidth={2.5} />
                      <span className="text-[10px] font-bold leading-none opacity-80">{i + 1}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => change((p) => p.filter((_, k) => k !== i))}
                      className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-white group-hover:flex"
                      aria-label={`Убрать блок ${i + 1}`}
                    >
                      <X className="h-3 w-3" strokeWidth={3} />
                    </button>
                  </li>
                );
              })}
            </ol>
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
          {best !== null && <p className="text-center text-sm font-semibold text-slate-400">Лучшее решение — {best} блоков. Сможешь так же?</p>}
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
                {won.short ? "⭐" : "☆"} Программа не длиннее {best} блоков (у тебя {program.length})
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
