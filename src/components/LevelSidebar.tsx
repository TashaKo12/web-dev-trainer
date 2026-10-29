import type { TaskStatus } from "./useTaskStepper";

export function LevelSidebar({
  total,
  current,
  statuses,
  onJump,
}: {
  total: number;
  current: number;
  statuses: TaskStatus[];
  onJump: (i: number) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 sm:w-14 sm:flex-col sm:overflow-visible sm:pb-0">
      {Array.from({ length: total }, (_, i) => {
        const status = statuses[i];
        const isCurrent = i === current;
        const look =
          status === "correct"
            ? "border-emerald-400 bg-emerald-100 text-emerald-700"
            : status === "wrong"
              ? "border-rose-300 bg-rose-100 text-rose-600"
              : isCurrent
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-white text-slate-400";
        return (
          <button
            key={i}
            type="button"
            onClick={() => onJump(i)}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-mono text-sm font-bold transition ${look} ${
              isCurrent ? "ring-2 ring-indigo-300 ring-offset-2" : ""
            }`}
          >
            {status === "correct" ? "✓" : status === "wrong" ? "✗" : i + 1}
          </button>
        );
      })}
    </div>
  );
}
