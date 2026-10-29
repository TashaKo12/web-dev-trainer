import type { TaskStatus } from "./useTaskStepper";

export function ProgressDots({
  statuses,
  activeIndex,
  onJump,
}: {
  statuses: TaskStatus[];
  activeIndex: number;
  onJump?: (index: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {statuses.map((status, i) => {
        const isActive = i === activeIndex;
        const base = "h-2.5 w-2.5 rounded-full transition-all";
        const color =
          status === "correct"
            ? "bg-emerald-500"
            : status === "wrong"
              ? "bg-rose-400"
              : isActive
                ? "bg-indigo-500"
                : "bg-slate-200";
        return (
          <button
            key={i}
            type="button"
            aria-label={`Задание ${i + 1}`}
            onClick={() => onJump?.(i)}
            disabled={!onJump}
            className={`${base} ${color} ${isActive ? "scale-125" : ""}`}
          />
        );
      })}
    </div>
  );
}
