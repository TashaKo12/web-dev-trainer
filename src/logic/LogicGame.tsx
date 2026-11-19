import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, Lightbulb, Lock, Star, X } from "lucide-react";
import { createStarStore } from "../lib/gameStars";
import { emitPixel } from "../lib/pixelBus";
import { BoltFigure, Dialogue } from "../quest/Dialogue";
import { ALL_PUZZLES, ISLANDS, LOGIC_INTRO, LOGIC_OUTRO, type ChoicePuzzle, type GridPuzzle, type Island, type Puzzle } from "./data";
import { CodeBox, TheoryButton, TheoryCard } from "../components/GameTheory";
import { ISLAND_THEORY, PUZZLE_CODE } from "./theory";
import { CatalogBanner } from "../components/CatalogBanner";

// «Остров загадок»: the island map (main menu) and one island with its six puzzles.

export const logicStars = createStarStore("wdt:logic", "logic", () => ALL_PUZZLES.map((p) => p.id));

const solved = (stars: Record<string, number>, island: Island) => island.puzzles.filter((p) => (stars[p.id] ?? 0) > 0).length;
const islandDone = (stars: Record<string, number>, island: Island) => solved(stars, island) === island.puzzles.length;
const islandOpen = (stars: Record<string, number>, i: number) => i === 0 || islandDone(stars, ISLANDS[i - 1]);

function Stars({ n, size = "h-4 w-4" }: { n: number; size?: string }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3].map((k) => (
        <Star key={k} className={`${size} ${k <= n ? "text-amber-400" : "text-slate-300"}`} fill="currentColor" strokeWidth={1.5} />
      ))}
    </span>
  );
}

export function LogicHome() {
  const save = logicStars.use();
  const [intro, setIntro] = useState(!save.intro);
  const [chest, setChest] = useState(false);
  const total = ALL_PUZZLES.reduce((s, p) => s + (save.stars[p.id] ?? 0), 0);
  const locks = ISLANDS.filter((i) => islandDone(save.stars, i)).length;

  if (intro || chest)
    return (
      <div className="py-4">
        <h1 className="mb-8 text-center text-3xl font-extrabold text-slate-800 sm:text-4xl dark:text-slate-100">Остров загадок</h1>
        {chest && <p className="mb-6 text-center text-7xl" style={{ animation: "quest-pop 0.8s both" }}>🗺️</p>}
        <Dialogue
          key={chest ? "chest" : "intro"}
          lines={chest ? LOGIC_OUTRO : LOGIC_INTRO}
          doneLabel={chest ? "Ура!" : "К загадкам!"}
          onDone={() => {
            logicStars.markIntro();
            setIntro(false);
            setChest(false);
          }}
        />
      </div>
    );

  return (
    <div>
      <CatalogBanner image="logic" icon="💡" kicker="Программирование (1 ступень) · 7–9 лет" title="Остров загадок" note="Разгадай загадки всех пяти островов — и открой сундук с сокровищем." />

      <div className="mb-6 flex flex-wrap justify-center gap-2 text-sm font-extrabold">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-4 py-2 text-slate-700 shadow-sm">
          <Star className="h-4 w-4 text-amber-400" fill="currentColor" strokeWidth={1.5} /> {total} из {ALL_PUZZLES.length * 3}
        </span>
        <span className="rounded-full bg-white/90 px-4 py-2 text-slate-700 shadow-sm">🔓 Замки: {locks} из {ISLANDS.length}</span>
      </div>

      {/* the chest: one lock per island */}
      <button
        type="button"
        onClick={() => locks === ISLANDS.length && setChest(true)}
        className={`mb-6 flex w-full flex-col items-center gap-2 rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-900 via-amber-800 to-orange-900 p-5 text-white ${
          locks === ISLANDS.length ? "cursor-pointer shadow-[0_0_40px_rgb(251_191_36/0.5)]" : "cursor-default"
        }`}
      >
        <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-200">Сундук с сокровищем</span>
        <span className="flex items-center gap-2 text-3xl">
          {ISLANDS.map((i) => (
            <span key={i.id} title={i.name}>
              {islandDone(save.stars, i) ? "🔓" : "🔒"}
            </span>
          ))}
        </span>
        <span className="text-sm text-amber-100">{locks === ISLANDS.length ? "Все замки открыты! Нажми, чтобы заглянуть в сундук." : "Каждый остров открывает один замок."}</span>
      </button>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ISLANDS.map((island, i) => {
          const open = islandOpen(save.stars, i);
          const done = islandDone(save.stars, island);
          const n = solved(save.stars, island);
          const inner = (
            <>
              <div className="mb-2 flex items-start justify-between">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl" style={{ background: `${island.color}22` }}>
                  {island.emoji}
                </span>
                <span className="text-2xl">{done ? "🔓" : "🔒"}</span>
              </div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Остров {island.id}</p>
              <h3 className="text-lg font-extrabold text-slate-800">{island.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{island.about}</p>
              <p className="mt-3 text-sm font-bold" style={{ color: open ? island.color : undefined }}>
                {open ? (
                  <>
                    {n} из {island.puzzles.length} загадок {done ? "✓" : "→"}
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <Lock className="h-3.5 w-3.5" strokeWidth={2.5} /> Сначала разгадай остров {island.id - 1}
                  </span>
                )}
              </p>
            </>
          );
          return open ? (
            <Link key={island.id} to={`/logic/${island.id}`} className="rounded-xl border border-[#e6e7ee] bg-white p-5 shadow-sm transition hover:-translate-y-1">
              {inner}
            </Link>
          ) : (
            <div key={island.id} className="rounded-3xl border-2 border-slate-200 bg-white/60 p-5 opacity-70" aria-disabled="true">
              {inner}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <button type="button" onClick={() => setIntro(true)} className="rounded-full px-4 py-2 text-sm font-bold text-slate-400 hover:text-violet-600">
          Послушать начало истории ещё раз
        </button>
      </div>
    </div>
  );
}

function ChoiceView({ p, picked, onPick, locked }: { p: ChoicePuzzle; picked: number | null; onPick: (i: number) => void; locked: boolean }) {
  const big = p.options.every((o) => o.length <= 6);
  return (
    <div>
      {p.show && <p className="mb-6 rounded-3xl bg-slate-50 px-4 py-6 text-center text-4xl tracking-wider sm:text-5xl">{p.show}</p>}
      <div className={`grid gap-3 ${p.options.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"}`}>
        {p.options.map((o, i) => (
          <button
            key={o}
            type="button"
            disabled={locked}
            onClick={() => onPick(i)}
            className={`rounded-3xl border-4 px-4 py-5 font-extrabold transition hover:-translate-y-0.5 ${big ? "text-4xl" : "text-xl"} ${
              locked && i === p.answer
                ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                : picked === i
                  ? "border-rose-300 bg-rose-50 text-rose-700"
                  : "border-slate-200 bg-white text-slate-700 hover:border-violet-300"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function GridView({ p, places, onPlace, locked }: { p: GridPuzzle; places: (number | null)[]; onPlace: (who: number, where: number) => void; locked: boolean }) {
  return (
    <div>
      <ul className="mb-5 space-y-1.5">
        {p.clues.map((c) => (
          <li key={c} className="flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-2.5 font-semibold text-amber-800">
            <span>🔎</span> {c}
          </li>
        ))}
      </ul>
      <p className="mb-2 text-sm font-bold text-slate-500">Нажимай клетки: у каждого — одно место, и в каждом месте — только один.</p>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1.5 text-center">
          <thead>
            <tr>
              <th />
              {p.where.map((w) => (
                <th key={w} className="rounded-xl bg-slate-100 px-2 py-2 text-sm font-extrabold text-slate-600">
                  {w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {p.who.map((who, r) => (
              <tr key={who}>
                <th className="whitespace-nowrap rounded-xl bg-slate-100 px-3 py-2 text-left text-base font-extrabold text-slate-700">{who}</th>
                {p.where.map((w, c) => {
                  const on = places[r] === c;
                  return (
                    <td key={w}>
                      <button
                        type="button"
                        disabled={locked}
                        onClick={() => onPlace(r, c)}
                        className={`h-12 w-full min-w-[3rem] rounded-xl border-2 text-2xl transition ${
                          on ? "border-violet-500 bg-violet-500 text-white" : "border-slate-200 bg-white hover:border-violet-300"
                        }`}
                        aria-label={`${who} — ${w}`}
                      >
                        {on ? "✓" : ""}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Every island gets a fresh screen. */
export function LogicIsland() {
  const { island } = useParams();
  return <IslandScreen key={island} />;
}

function IslandScreen() {
  const { island: param } = useParams();
  const navigate = useNavigate();
  const save = logicStars.use();
  const idx = ISLANDS.findIndex((i) => String(i.id) === param);
  const island = ISLANDS[idx];
  const firstUnsolved = island ? island.puzzles.findIndex((p) => !(save.stars[p.id] > 0)) : 0;
  const [at, setAt] = useState(Math.max(0, firstUnsolved));
  const [tries, setTries] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [places, setPlaces] = useState<(number | null)[]>([]);
  const [result, setResult] = useState<"right" | "wrong" | null>(null);
  const [hint, setHint] = useState(false);
  // the theory comes first on a new island; later it opens with the «Теория» button
  const [theory, setTheory] = useState(() => !!island && solved(save.stars, island) === 0);

  if (!island) return <p className="text-center text-slate-500">Такого острова нет. <Link to="/logic" className="font-bold text-violet-600">На карту</Link></p>;
  if (!islandOpen(save.stars, idx))
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-white/90 p-8 text-center">
        <p className="mb-4 text-5xl">🔒</p>
        <p className="mb-4 font-bold text-slate-600">Этот остров пока закрыт. Сначала разгадай остров {island.id - 1}!</p>
        <Link to="/logic" className="font-bold text-violet-600">
          На карту →
        </Link>
      </div>
    );

  const puzzle: Puzzle = island.puzzles[at];
  const right = result === "right";
  const gridPlaces = puzzle.kind === "grid" ? (places.length === puzzle.who.length ? places : puzzle.who.map(() => null)) : [];

  function go(i: number) {
    setAt(i);
    setTries(0);
    setPicked(null);
    setPlaces([]);
    setResult(null);
    setHint(false);
  }

  function judge(ok: boolean) {
    const n = tries + 1;
    setTries(n);
    if (ok) {
      setResult("right");
      emitPixel("correct");
      logicStars.finish(puzzle.id, n === 1 ? 3 : n === 2 ? 2 : 1);
    } else {
      setResult("wrong");
      emitPixel("wrong");
      if (n >= 2) setHint(true);
    }
  }

  function place(who: number, where: number) {
    if (puzzle.kind !== "grid") return;
    const count = puzzle.who.length;
    setResult(null);
    // fast taps must not lose a mark: build on the latest placement
    setPlaces((prev) => {
      const next = prev.length === count ? [...prev] : Array<number | null>(count).fill(null);
      // a place holds one character: whoever was there moves out
      next.forEach((w, k) => w === where && k !== who && (next[k] = null));
      next[who] = next[who] === where ? null : where;
      return next;
    });
  }

  const gridFull = puzzle.kind === "grid" && gridPlaces.every((x) => x !== null);
  const last = at === island.puzzles.length - 1;
  const code = PUZZLE_CODE[puzzle.id];

  if (theory)
    return (
      <div>
        <p className="mb-4 text-center text-sm font-extrabold uppercase tracking-wide" style={{ color: island.color }}>
          {island.emoji} {island.name}
        </p>
        <TheoryCard theory={ISLAND_THEORY[island.id]} onDone={() => setTheory(false)} doneLabel="Понятно, к загадкам!" />
      </div>
    );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide" style={{ color: island.color }}>
            {island.emoji} {island.name} · загадка {at + 1} из {island.puzzles.length}
          </p>
          <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl dark:text-slate-100">{puzzle.q}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <TheoryButton onClick={() => setTheory(true)} />
          {island.puzzles.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => go(i)}
              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-extrabold ${
                i === at ? "border-violet-500 bg-violet-500 text-white" : save.stars[p.id] ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-400"
              }`}
              aria-label={`Загадка ${i + 1}`}
            >
              {save.stars[p.id] ? "✓" : i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[#e6e7ee] bg-white p-5 shadow-sm sm:p-8">
        {puzzle.kind === "choice" ? (
          <ChoiceView
            p={puzzle}
            picked={picked}
            locked={right}
            onPick={(i) => {
              setPicked(i);
              judge(i === puzzle.answer);
            }}
          />
        ) : (
          <GridView p={puzzle} places={gridPlaces} onPlace={place} locked={right} />
        )}

        {puzzle.kind === "grid" && !right && (
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              disabled={!gridFull}
              onClick={() => judge(gridPlaces.every((w, k) => w === puzzle.answer[k]))}
              className="rounded-lg bg-[#4d16c9] hover:bg-[#4514b5] px-8 py-3 text-lg font-extrabold text-white shadow disabled:opacity-40"
            >
              Проверить
            </button>
          </div>
        )}
      </div>

      {/* Bolt reacts */}
      <div className="mt-5 flex items-end gap-3">
        <BoltFigure className="w-16 shrink-0 sm:w-20" />
        <div
          className={`flex-1 rounded-3xl rounded-bl-md border px-4 py-3 text-base font-semibold sm:text-lg ${
            right ? "border-emerald-200 bg-emerald-50 text-emerald-800" : result === "wrong" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-orange-200 bg-orange-50 text-slate-700"
          }`}
        >
          {right ? (
            <span className="flex flex-wrap items-center gap-2">
              <Check className="h-5 w-5" strokeWidth={3} /> Верно! {puzzle.explain} <Stars n={tries === 1 ? 3 : tries === 2 ? 2 : 1} size="h-5 w-5" />
            </span>
          ) : result === "wrong" ? (
            <span className="flex items-center gap-2">
              <X className="h-5 w-5" strokeWidth={3} /> Не совсем. Подумай ещё — перечитай условие.
            </span>
          ) : (
            "Подумай хорошенько. С первой попытки — три звезды!"
          )}
          {hint && !right && (
            <p className="mt-2 flex items-start gap-2 text-sm text-amber-800">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} /> Подсказка: {puzzle.explain}
            </p>
          )}
        </div>
      </div>

      {right && code && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-violet-500">💻 Как это записал бы программист</p>
          <CodeBox {...code} />
        </div>
      )}

      {right && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => (last ? navigate("/logic") : go(at + 1))}
            className="rounded-lg bg-[#4d16c9] hover:bg-[#4514b5] px-8 py-3 text-lg font-extrabold text-white shadow"
          >
            {last ? "Замок открыт! На карту →" : "Следующая загадка →"}
          </button>
        </div>
      )}
    </div>
  );
}
