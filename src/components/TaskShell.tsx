import type { ReactNode } from "react";
import type { TaskStatus } from "./useTaskStepper";
import { ProgressDots } from "./ProgressDots";

export function TaskShell({
  index,
  total,
  statuses,
  onJump,
  prompt,
  children,
  status,
  feedback,
  onCheck,
  checkDisabled,
  hideCheck,
  onNext,
  isLast,
}: {
  index: number;
  total: number;
  statuses: TaskStatus[];
  onJump?: (i: number) => void;
  prompt: ReactNode;
  children: ReactNode;
  status: TaskStatus;
  feedback?: ReactNode;
  onCheck: () => void;
  checkDisabled?: boolean;
  /** The task content has its own built-in "Проверить" button (e.g. drag/click puzzles). */
  hideCheck?: boolean;
  onNext: () => void;
  isLast: boolean;
}) {
  const answered = status !== "idle";

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md sm:p-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <span className="text-sm font-bold text-slate-400">
          Задание {index + 1} из {total}
        </span>
        <ProgressDots statuses={statuses} activeIndex={index} onJump={onJump} />
      </div>

      <p className="mb-5 text-lg font-semibold text-slate-800">{prompt}</p>

      <div className="mb-5">{children}</div>

      <div className="flex flex-wrap items-center gap-3">
        {!answered && !hideCheck && (
          <button
            type="button"
            onClick={onCheck}
            disabled={checkDisabled}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-2.5 text-sm font-bold text-white shadow hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        )}
        {answered && !isLast && (
          <button
            type="button"
            onClick={onNext}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-2.5 text-sm font-bold text-white shadow hover:opacity-90"
          >
            Следующее →
          </button>
        )}
        {status === "correct" && (
          <span className="font-bold text-emerald-600">✅ Верно!</span>
        )}
        {status === "wrong" && (
          <span className="font-bold text-rose-500">Не совсем — но ты уже близко</span>
        )}
      </div>

      {answered && feedback && (
        <div
          className={`mt-4 rounded-2xl p-4 text-sm leading-relaxed ${
            status === "correct"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-amber-50 text-amber-800"
          }`}
        >
          {feedback}
        </div>
      )}
    </div>
  );
}
