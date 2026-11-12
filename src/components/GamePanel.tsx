import { Link } from "react-router-dom";
import { Award, Flame, Lock, Shield } from "lucide-react";
import { useGame } from "../lib/game";

/** Rank, experience to the next rank, streak and achievements — the game status of the student. */
export function GamePanel() {
  const { xp, rank, level, next, progress, achievements, streak } = useGame();
  const got = achievements.filter((a) => a.done).length;

  return (
    <div className="mb-12 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-7 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
      <div className="flex flex-wrap items-center gap-5">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          <Shield className="h-16 w-16 text-indigo-500 dark:text-indigo-400" strokeWidth={1.5} fill="currentColor" fillOpacity={0.15} />
          <span className="absolute text-xl font-extrabold text-indigo-600 dark:text-indigo-200">{level}</span>
        </div>

        <div className="min-w-[14rem] flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Твоё звание</p>
          <p className="text-2xl font-extrabold text-slate-800">{rank.title}</p>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-all duration-700"
              style={{ width: `${Math.max(4, progress * 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            {next ? (
              <>
                {xp} XP · до звания «{next.title}» ещё {next.from - xp} XP
              </>
            ) : (
              <>{xp} XP · высшее звание!</>
            )}
          </p>
        </div>

        <div className="flex gap-3">
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
            <Flame className={`mx-auto h-5 w-5 ${streak.current >= 3 ? "text-orange-500" : "text-slate-300"}`} strokeWidth={2} />
            <p className="mt-1 text-lg font-extrabold text-slate-800">{streak.current}</p>
            <p className="text-[11px] font-bold text-slate-400">серия · рекорд {streak.best}</p>
          </div>
          <Link to="/profile" className="rounded-2xl bg-slate-50 px-4 py-3 text-center hover:ring-2 hover:ring-amber-200">
            <Award className="mx-auto h-5 w-5 text-amber-500" strokeWidth={2} />
            <p className="mt-1 text-lg font-extrabold text-slate-800">
              {got}/{achievements.length}
            </p>
            <p className="text-[11px] font-bold text-slate-400">достижений</p>
          </Link>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {achievements.map((a) => (
          <span
            key={a.id}
            title={a.text}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              a.done
                ? "bg-gradient-to-r from-amber-300 to-orange-400 text-amber-950 shadow-sm"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {a.done ? <Award className="h-3.5 w-3.5" strokeWidth={2.2} /> : <Lock className="h-3 w-3" strokeWidth={2.2} />}
            {a.title}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Three stars for a topic card. */
export function Stars({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`Звёзд: ${count} из 3`}>
      {[0, 1, 2].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={`h-4 w-4 ${i < count ? "text-amber-400" : "text-slate-200 dark:text-slate-700"}`} aria-hidden="true">
          <path fill="currentColor" d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
        </svg>
      ))}
    </span>
  );
}
