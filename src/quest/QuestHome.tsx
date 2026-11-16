import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Lock, Star, X } from "lucide-react";
import { BAYS, DIARY, LOCKED_BAYS, PROLOGUE } from "./data";
import { Dialogue } from "./Dialogue";
import { PixelFigure } from "../components/PixelBuddy";
import { bayDone, bayOpen, markPrologue, useQuest } from "./progress";

// «Тайна станции»: the station map is the main menu of the quest.

const CARD = "relative overflow-hidden rounded-3xl border-2 p-4 text-left transition sm:p-5";

/** The invitation to the quest on the home page. */
export function QuestBanner() {
  return (
    <Link to="/quest" className="quest-banner group">
      <span className="pixel-bot quest-bot quest-banner-bot" data-mood="wink">
        <PixelFigure />
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="quest-banner-tag">Новое · для 7–9 лет</span>
        <span className="block text-xl font-extrabold sm:text-2xl">Тайна станции</span>
        <span className="mt-1 block text-sm text-violet-100">Собирай программу из блоков и веди Пикселя по станции.</span>
      </span>
      <span className="relative hidden text-3xl sm:block">→</span>
    </Link>
  );
}

function KeySlot({ color, got, size = "h-7 w-7" }: { color: string; got: boolean; size?: string }) {
  return (
    <span
      className={`inline-flex ${size} items-center justify-center rounded-full border-2 text-sm ${got ? "border-white shadow-[0_0_12px_currentColor]" : "border-dashed border-slate-300 bg-slate-100"}`}
      style={got ? { background: color, color } : undefined}
    >
      {got ? <span className="text-white">🔑</span> : null}
    </span>
  );
}

export function QuestHome() {
  const save = useQuest();
  const [prologue, setPrologue] = useState(!save.prologue);
  const [diaryOpen, setDiaryOpen] = useState(false);

  if (prologue)
    return (
      <div className="py-4">
        <h1 className="mb-8 text-center text-3xl font-extrabold text-slate-800 sm:text-4xl dark:text-slate-100">Тайна станции</h1>
        <Dialogue
          lines={PROLOGUE}
          doneLabel="Помочь Пикселю!"
          onDone={() => {
            markPrologue();
            setPrologue(false);
          }}
        />
      </div>
    );

  const allLevels = BAYS.flatMap((b) => b.levels);
  const stars = allLevels.reduce((s, l) => s + (save.stars[l.id] ?? 0), 0);
  const keys = BAYS.filter((b) => bayDone(save, b.id)).length;
  const bays = [...BAYS, ...LOCKED_BAYS.map((b) => ({ ...b, levels: [] as typeof allLevels }))];

  const bayCard = (b: (typeof bays)[number]) => {
    const playable = b.levels.length > 0;
    const open = playable && bayOpen(save, b.id);
    const done = playable && bayDone(save, b.id);
    const passed = b.levels.filter((l) => (save.stars[l.id] ?? 0) > 0).length;
    const inner = (
      <>
        <div className="mb-2 flex items-start justify-between gap-2">
          <span className="text-4xl">{b.emoji}</span>
          <KeySlot color={b.key.color} got={done} />
        </div>
        <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Отсек {b.id}</p>
        <h3 className="text-lg font-extrabold leading-tight text-slate-800">{b.name}</h3>
        <p className="mt-1 text-sm text-slate-500">{done ? `Починен! ${b.key.name} у тебя.` : b.trouble}</p>
        <div className="mt-3 text-sm font-bold">
          {!playable ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-400">
              <Lock className="h-3.5 w-3.5" strokeWidth={2.5} /> Скоро
            </span>
          ) : !open ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-400">
              <Lock className="h-3.5 w-3.5" strokeWidth={2.5} /> Сначала почини отсек {b.id - 1}
            </span>
          ) : (
            <span className="text-violet-600">
              {passed} из {b.levels.length} уровней {done ? "✓" : "→"}
            </span>
          )}
        </div>
      </>
    );
    return open ? (
      <Link key={b.id} to={`/quest/${b.id}`} className={`${CARD} border-violet-200 bg-white/95 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 hover:border-violet-400`}>
        {!done && passed === 0 && <span className="absolute right-3 top-14 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-extrabold text-white">Новое!</span>}
        {inner}
      </Link>
    ) : (
      <div key={b.id} className={`${CARD} border-slate-200 bg-white/60 opacity-70`} aria-disabled="true">
        {inner}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 sm:text-4xl dark:text-slate-100">Тайна станции</h1>
        <p className="mx-auto mt-2 max-w-xl text-slate-500 dark:text-slate-400">
          Помоги Пикселю починить станцию, собрать шесть Ключей-Кристаллов и узнать, что спрятала Создательница.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-2 text-sm font-extrabold">
        <span className="rounded-full bg-white/90 px-4 py-2 text-slate-700 shadow-sm">🔑 Ключи: {keys} из 6</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-4 py-2 text-slate-700 shadow-sm">
          <Star className="h-4 w-4 text-amber-400" fill="currentColor" strokeWidth={1.5} /> {stars} из {allLevels.length * 3}
        </span>
        <span className="rounded-full bg-white/90 px-4 py-2 text-slate-700 shadow-sm">💎 Кристаллы: {save.crystals.length}</span>
        <button type="button" onClick={() => setDiaryOpen(true)} className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-4 py-2 text-amber-800 shadow-sm hover:bg-amber-200">
          <BookOpen className="h-4 w-4" strokeWidth={2.2} /> Дневник: {save.diary.length} из 6
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {bays.slice(0, 3).map(bayCard)}

        {/* the Heart of the Station: opens with all six keys */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-indigo-300 bg-gradient-to-br from-indigo-950 via-violet-900 to-fuchsia-900 p-5 text-center text-white sm:col-span-3">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgb(255_255_255/0.18),transparent_60%)]" />
          <p className="relative text-xs font-extrabold uppercase tracking-[0.2em] text-violet-200">Сердце станции</p>
          <div className="relative my-3 flex items-center justify-center gap-2 sm:gap-3">
            {[...BAYS, ...LOCKED_BAYS].slice(0, 3).map((b) => (
              <KeySlot key={b.id} color={b.key.color} got={bayDone(save, b.id)} size="h-9 w-9" />
            ))}
            <span className="mx-1 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-violet-300/60 bg-white/10 text-3xl">🔒</span>
            {[...BAYS, ...LOCKED_BAYS].slice(3, 6).map((b) => (
              <KeySlot key={b.id} color={b.key.color} got={bayDone(save, b.id)} size="h-9 w-9" />
            ))}
          </div>
          <p className="relative text-sm text-violet-100">Здесь Создательница спрятала самое важное. Дверь откроют шесть ключей.</p>
        </div>

        {bays.slice(3).map(bayCard)}
      </div>

      <div className="mt-8 flex justify-center">
        <button type="button" onClick={() => setPrologue(true)} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-slate-400 hover:text-violet-600">
          <span className="pixel-bot quest-bot inline-block h-6" data-mood="wink">
            <PixelFigure />
          </span>
          Посмотреть начало истории ещё раз
        </button>
      </div>

      {diaryOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={() => setDiaryOpen(false)}>
          <div className="animate-fade-in max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-amber-50 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-amber-900">📖 Дневник Создательницы</h2>
              <button type="button" onClick={() => setDiaryOpen(false)} className="rounded-full p-1.5 text-amber-700 hover:bg-amber-100" aria-label="Закрыть">
                <X className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </div>
            <div className="space-y-3">
              {Array.from({ length: 6 }, (_, i) => {
                const id = Object.keys(DIARY)[i];
                const found = id && save.diary.includes(id);
                return found ? (
                  <div key={i} className="rounded-2xl border border-amber-200 bg-white/70 p-3">
                    <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-amber-700">{DIARY[id].title}</p>
                    <p className="font-serif italic text-slate-700">{DIARY[id].text}</p>
                  </div>
                ) : (
                  <div key={i} className="rounded-2xl border-2 border-dashed border-amber-200 p-3 text-sm font-semibold text-amber-700/60">
                    Страница {i + 1} ещё не найдена. Ищи 📜 на уровнях!
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
