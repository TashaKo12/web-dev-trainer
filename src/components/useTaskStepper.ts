import { useEffect, useMemo, useState } from "react";
import { saveProgress, type TrainerId } from "../lib/progress";

export type TaskStatus = "idle" | "correct" | "wrong";

export function useTaskStepper(total: number, trainerId: TrainerId) {
  const [index, setIndex] = useState(0);
  const [statuses, setStatuses] = useState<TaskStatus[]>(() =>
    Array(total).fill("idle"),
  );

  const score = useMemo(
    () => statuses.filter((s) => s === "correct").length,
    [statuses],
  );
  const allAnswered = statuses.every((s) => s !== "idle");

  useEffect(() => {
    if (allAnswered) saveProgress(trainerId, score, total);
  }, [allAnswered, score, total, trainerId]);

  function markResult(correct: boolean) {
    setStatuses((prev) => {
      const next = [...prev];
      next[index] = correct ? "correct" : "wrong";
      return next;
    });
  }

  function goNext() {
    setIndex((i) => Math.min(i + 1, total - 1));
  }

  function goTo(i: number) {
    setIndex(Math.max(0, Math.min(i, total - 1)));
  }

  function restart() {
    setIndex(0);
    setStatuses(Array(total).fill("idle"));
  }

  return {
    index,
    status: statuses[index],
    statuses,
    score,
    allAnswered,
    isLast: index === total - 1,
    markResult,
    goNext,
    goTo,
    restart,
  };
}
