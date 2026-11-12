import { useEffect, useMemo, useState } from "react";
import { saveProgress, type TrainerId } from "../lib/progress";
import { loadJSON, onProgressReplaced, POINTS, reportPoints, saveJSON } from "../lib/storage";
import { setTimeLevel } from "../lib/timeTracker";
import { emitPixel } from "../lib/pixelBus";

export type TaskStatus = "idle" | "correct" | "wrong";

/** What is kept for each topic's practice: current level, answers and when each level was answered. */
export type SavedSession = { index: number; statuses: TaskStatus[]; dates: (string | null)[] };

export function sessionKey(trainerId: TrainerId) {
  return `wdt:session:${trainerId}`;
}

export function loadSession(trainerId: TrainerId, total: number): SavedSession | null {
  const saved = loadJSON<Partial<SavedSession>>(sessionKey(trainerId));
  if (!saved || !Array.isArray(saved.statuses) || saved.statuses.length !== total) return null;
  const dates = Array.isArray(saved.dates) && saved.dates.length === total ? saved.dates : Array(total).fill(null);
  return { index: Math.min(Math.max((saved.index ?? 0) | 0, 0), total - 1), statuses: saved.statuses, dates };
}

/** A link like #/headings?level=4 opens the practice right on that level (used by the teacher dashboard). */
function levelFromUrl(total: number) {
  const query = window.location.hash.split("?")[1];
  if (!query) return null;
  const n = Number(new URLSearchParams(query).get("level"));
  return Number.isInteger(n) && n >= 1 && n <= total ? n - 1 : null;
}

export function useTaskStepper(total: number, trainerId: TrainerId) {
  const [session, setSession] = useState<SavedSession>(() => {
    const saved = loadSession(trainerId, total) ?? { index: 0, statuses: Array(total).fill("idle"), dates: Array(total).fill(null) };
    const level = levelFromUrl(total);
    return level === null ? saved : { ...saved, index: level };
  });

  useEffect(() => {
    if (levelFromUrl(total) === null) return;
    const t = setTimeout(() => document.querySelector("[data-practice]")?.scrollIntoView({ behavior: "smooth", block: "start" }), 700);
    return () => clearTimeout(t);
  }, [total]);
  const { index, statuses } = session;

  const score = useMemo(
    () => statuses.filter((s) => s === "correct").length,
    [statuses],
  );
  const allAnswered = statuses.every((s) => s !== "idle");

  // the teacher counted levels: take them from storage before this page saves its own copy again
  useEffect(
    () =>
      onProgressReplaced(() => {
        const fresh = loadSession(trainerId, total);
        if (fresh) setSession((s) => ({ ...fresh, index: s.index }));
      }),
    [trainerId, total],
  );

  useEffect(() => {
    saveJSON(sessionKey(trainerId), session);
  }, [trainerId, session]);

  useEffect(() => {
    setTimeLevel(trainerId, index);
    return () => setTimeLevel(trainerId, null);
  }, [trainerId, index]);

  useEffect(() => {
    reportPoints(`practice:${trainerId}`, score * POINTS.practice);
  }, [trainerId, score]);

  useEffect(() => {
    if (allAnswered) saveProgress(trainerId, score, total);
  }, [allAnswered, score, total, trainerId]);

  function markResult(correct: boolean) {
    emitPixel(correct ? "correct" : "wrong");
    setSession((s) => {
      const statusesNext = [...s.statuses];
      const datesNext = [...s.dates];
      statusesNext[s.index] = correct ? "correct" : "wrong";
      datesNext[s.index] = new Date().toISOString();
      return { ...s, statuses: statusesNext, dates: datesNext };
    });
  }

  function goTo(i: number) {
    setSession((s) => ({ ...s, index: Math.max(0, Math.min(i, total - 1)) }));
  }

  function goNext() {
    setSession((s) => ({ ...s, index: Math.min(s.index + 1, total - 1) }));
  }

  function restart() {
    setSession({ index: 0, statuses: Array(total).fill("idle"), dates: Array(total).fill(null) });
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
