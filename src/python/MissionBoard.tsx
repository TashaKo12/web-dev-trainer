import { useEffect, useState, type ReactNode } from "react";
import { emitPixel } from "../lib/pixelBus";
import { Bot, Check, ChevronRight, Lightbulb, Lock, Sparkles, Trophy } from "lucide-react";
import { loadItem, loadJSON, POINTS, reportPoints, saveItem, saveJSON } from "../lib/storage";

export function missionDatesKey(pointsSource: string) {
  return `wdt:mission-dates:${pointsSource}`;
}

export type MissionRender = (props: { isDone: boolean; onComplete: () => void }) => ReactNode;

const RANKS = ["Новичок", "Ученик робота", "Знаток", "Мастер терминала"];

function rankFor(done: number, total: number) {
  return RANKS[Math.min(RANKS.length - 1, Math.floor((done / total) * (RANKS.length - 1) + 0.0001))];
}

export function MissionBoard({
  missions,
  storageKey,
  pointsSource,
  finishText,
}: {
  missions: { title: string; render: MissionRender }[];
  storageKey: string;
  pointsSource: string;
  finishText: string;
}) {
  const readDone = () => {
    const n = Number(loadItem(storageKey));
    return Number.isFinite(n) ? Math.min(Math.max(n, 0), missions.length) : 0;
  };
  const [done, setDone] = useState(readDone);
  const [active, setActive] = useState(() => Math.min(readDone(), missions.length - 1));
  const [dates, setDates] = useState<(string | null)[]>(() => loadJSON<(string | null)[]>(missionDatesKey(pointsSource)) ?? []);

  const xp = done * POINTS.mission;
  const maxXp = missions.length * POINTS.mission;

  useEffect(() => {
    saveItem(storageKey, String(done));
    reportPoints(pointsSource, done * POINTS.mission);
  }, [storageKey, pointsSource, done]);

  useEffect(() => {
    saveJSON(missionDatesKey(pointsSource), dates);
  }, [pointsSource, dates]);

  function complete(i: number) {
    if (i !== done) return;
    emitPixel("correct");
    setDone(done + 1);
    setDates((d) => {
      const next = [...d];
      next[i] = new Date().toISOString();
      return next;
    });
  }

  return (
    <div data-missions className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Sparkles className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Звание</p>
            <p className="font-extrabold text-slate-800">{rankFor(done, missions.length)}</p>
          </div>
        </div>
        <div className="min-w-[12rem] flex-1 sm:max-w-xs">
          <div className="mb-1 flex justify-between text-xs font-bold text-slate-500">
            <span>Опыт</span>
            <span>
              {xp} / {maxXp} XP
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${(xp / maxXp) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {missions.map((m, i) => {
          const isDone = i < done;
          const isLocked = i > done;
          const isOpen = i === active && !isLocked;
          return (
            <div
              key={m.title}
              className={`rounded-2xl border-2 transition ${
                isOpen ? "border-sky-300 bg-white" : isDone ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
              }`}
            >
              <button
                type="button"
                disabled={isLocked}
                onClick={() => setActive(i)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left disabled:cursor-not-allowed"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    isDone ? "bg-emerald-500 text-white" : isLocked ? "bg-slate-200 text-slate-400" : "bg-sky-500 text-white"
                  }`}
                >
                  {isDone ? (
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  ) : isLocked ? (
                    <Lock className="h-3.5 w-3.5" strokeWidth={2.25} />
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="flex-1">
                  <span className="block text-xs font-bold uppercase tracking-wide text-slate-400">
                    Миссия {i + 1} из {missions.length}
                  </span>
                  <span className={`font-extrabold ${isLocked ? "text-slate-400" : "text-slate-800"}`}>{m.title}</span>
                </span>
                {!isOpen && !isLocked && <ChevronRight className="h-5 w-5 text-slate-400" strokeWidth={2} />}
              </button>
              {isOpen && (
                <div className="border-t border-slate-200 px-4 pb-5 pt-4">
                  <div key={i}>
                    {m.render({
                      isDone,
                      onComplete: () => complete(i),
                    })}
                  </div>
                  {isDone && i < missions.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setActive(i + 1)}
                      className="mt-4 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-5 py-2 text-sm font-bold text-white shadow"
                    >
                      Следующая миссия
                      <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {done === missions.length && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800">
          <Trophy className="h-6 w-6 shrink-0" strokeWidth={1.75} />
          <p className="text-sm font-bold">{finishText}</p>
        </div>
      )}
    </div>
  );
}

export function RobotSays({ text, placeholder = "Пиксель ждёт команду…" }: { text: string | null; placeholder?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow">
        <Bot className="h-7 w-7" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
        {text === null ? <span className="text-slate-400">{placeholder}</span> : <span className="whitespace-pre-wrap">{text}</span>}
      </div>
    </div>
  );
}

export function MissionGoal({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl bg-sky-50 p-4 text-sm text-sky-800">{children}</div>;
}

export function MissionFeedback({ solved, isDone, hint }: { solved: boolean; isDone: boolean; hint: string | null }) {
  if (solved || isDone) {
    return (
      <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
        <Check className="h-4 w-4" strokeWidth={2.5} />
        Миссия выполнена{solved ? ` · +${POINTS.mission} XP` : ""}
      </span>
    );
  }
  if (!hint) return null;
  return (
    <span className="flex items-start gap-1.5 text-sm font-bold text-amber-700">
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
      {hint}
    </span>
  );
}
