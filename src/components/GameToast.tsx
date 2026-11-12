import { useEffect, useState } from "react";
import { Award, Crown } from "lucide-react";
import { checkGameNews, onGameNews, useStreak, type GameNews } from "../lib/game";
import { useTotalPoints } from "../lib/storage";
import { emitPixel } from "../lib/pixelBus";

/** Pops up when a student earns an achievement or a new rank. */
export function GameToast() {
  const total = useTotalPoints();
  const streak = useStreak();
  const [queue, setQueue] = useState<GameNews[]>([]);

  useEffect(
    () =>
      onGameNews((n) => {
        setQueue((q) => [...q, n]);
        emitPixel("achievement");
      }),
    [],
  );

  // a moment later, so the answer itself is saved first
  useEffect(() => {
    const t = setTimeout(checkGameNews, 400);
    return () => clearTimeout(t);
  }, [total, streak]);

  useEffect(() => {
    if (!queue.length) return;
    const t = setTimeout(() => setQueue((q) => q.slice(1)), 4200);
    return () => clearTimeout(t);
  }, [queue]);

  const news = queue[0];
  if (!news) return null;
  const Icon = news.kind === "rank" ? Crown : Award;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4" aria-live="polite">
      <div key={news.title} className="game-toast flex items-center gap-3 rounded-2xl border border-amber-200 bg-white px-5 py-3 shadow-[0_16px_40px_rgb(0,0,0,0.25)] dark:border-amber-400/30 dark:bg-slate-900">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-white shadow">
          <Icon className="h-6 w-6" strokeWidth={2} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
            {news.kind === "rank" ? "Новое звание" : "Новое достижение"}
          </p>
          <p className="font-extrabold text-slate-800 dark:text-slate-100">{news.title}</p>
          {news.kind === "achievement" && <p className="text-sm text-slate-500 dark:text-slate-400">{news.text}</p>}
        </div>
      </div>
    </div>
  );
}
