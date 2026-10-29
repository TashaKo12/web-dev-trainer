import type { ReactNode } from "react";
import { LevelSidebar } from "./LevelSidebar";
import type { TaskStatus } from "./useTaskStepper";

export function LevelShell({
  total,
  index,
  statuses,
  status,
  isLast,
  badge,
  explain,
  onJump,
  onNext,
  nextClassName = "bg-gradient-to-r from-indigo-500 to-violet-500",
  children,
}: {
  total: number;
  index: number;
  statuses: TaskStatus[];
  status: TaskStatus;
  isLast: boolean;
  badge?: string;
  explain?: ReactNode;
  onJump: (i: number) => void;
  onNext: () => void;
  nextClassName?: string;
  children: ReactNode;
}) {
  const answered = status !== "idle";

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row">
        <LevelSidebar total={total} current={index} statuses={statuses} onJump={onJump} />

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-slate-400">
              Уровень {index + 1} из {total}
            </span>
            {badge && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">{badge}</span>}
          </div>

          {children}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {answered && !isLast && (
              <button
                type="button"
                onClick={onNext}
                className={`rounded-full px-6 py-2.5 text-sm font-bold text-white shadow hover:opacity-90 ${nextClassName}`}
              >
                Следующий уровень →
              </button>
            )}
            {status === "correct" && <span className="font-bold text-emerald-600">✅ Верно!</span>}
            {status === "wrong" && <span className="font-bold text-rose-500">Не совсем — но ты уже близко</span>}
          </div>

          {answered && explain && (
            <div
              className={`mt-4 rounded-2xl p-4 text-sm leading-relaxed ${
                status === "correct" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
              }`}
            >
              {explain}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
