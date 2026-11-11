import { useEffect, useMemo, useState } from "react";
import { saveProgress, type TrainerId } from "../lib/progress";
import { loadJSON, POINTS, reportPoints, saveJSON } from "../lib/storage";

export type TaskStatus = "idle" | "correct" | "wrong";

type SavedSession = { index: number; statuses: TaskStatus[] };

function loadSession(key: string, total: number): SavedSession | null {
  const saved = loadJSON<SavedSession>(key);
  if (!saved || !Array.isArray(saved.statuses) || saved.statuses.length !== total) return null;
  return { index: Math.min(Math.max(saved.index | 0, 0), total - 1), statuses: saved.statuses };
}

export function useTaskStepper(total: number, trainerId: TrainerId) {
  const sessionKey = `wdt:session:${trainerId}`;
  const [index, setIndex] = useState(() => loadSession(sessionKey, total)?.index ?? 0);
  const [statuses, setStatuses] = useState<TaskStatus[]>(
    () => loadSession(sessionKey, total)?.statuses ?? Array(total).fill("idle"),
  );

  const score = useMemo(
    () => statuses.filter((s) => s === "correct").length,
    [statuses],
  );
  const allAnswered = statuses.every((s) => s !== "idle");

  useEffect(() => {
    saveJSON(sessionKey, { index, statuses });
  }, [sessionKey, index, statuses]);

  useEffect(() => {
    reportPoints(`practice:${trainerId}`, score * POINTS.practice);
  }, [trainerId, score]);

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
