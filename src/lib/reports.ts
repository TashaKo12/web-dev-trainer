import { trainers, type TrainerMeta } from "../trainers/registry";
import { sessionKey, type SavedSession, type TaskStatus } from "../components/useTaskStepper";
import { missionDatesKey } from "../python/MissionBoard";
import { levelTimeKey, missionsTimeKey, TIME_KEY } from "./timeTracker";

// Turns stored progress (this browser's, or a participant's data from the server) into readable reports.

export type Getter = (key: string) => string | null;

export type TopicReport = {
  meta: TrainerMeta;
  statuses: TaskStatus[];
  dates: (string | null)[];
  solved: number;
  missionsDone: number;
  missionDates: (string | null)[];
  lastAt: string | null;
  /** Seconds: whole topic page, each practice level, missions. */
  time: number;
  levelTimes: number[];
  missionsTime: number;
};

export type Activity = { at: string; meta: TrainerMeta; label: string; ok: boolean; seconds: number };

function parse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function readReports(get: Getter): TopicReport[] {
  const times = parse<Record<string, number>>(get(TIME_KEY)) ?? {};
  return trainers.map((meta) => {
    const session = parse<Partial<SavedSession>>(get(sessionKey(meta.id)));
    const statuses: TaskStatus[] = Array.isArray(session?.statuses) ? session.statuses : Array(meta.taskCount).fill("idle");
    const dates = Array.isArray(session?.dates) ? session.dates : [];
    const missionsDone = meta.missions ? Math.min(Number(get(meta.missions.storageKey)) || 0, meta.missions.count) : 0;
    const missionDates = meta.missions ? (parse<(string | null)[]>(get(missionDatesKey(`missions:${meta.id}`))) ?? []) : [];
    const allDates = [...dates, ...missionDates].filter((d): d is string => !!d).sort();
    return {
      meta,
      statuses,
      dates,
      solved: statuses.filter((s) => s === "correct").length,
      missionsDone,
      missionDates,
      lastAt: allDates[allDates.length - 1] ?? null,
      time: times[meta.id] ?? 0,
      levelTimes: statuses.map((_, i) => times[levelTimeKey(meta.id, i)] ?? 0),
      missionsTime: times[missionsTimeKey(meta.id)] ?? 0,
    };
  });
}

export function buildActivity(reports: TopicReport[], limit = 10): Activity[] {
  return reports
    .flatMap((r) => [
      ...r.dates.flatMap((d, i) =>
        d ? [{ at: d, meta: r.meta, label: `Уровень ${i + 1}`, ok: r.statuses[i] === "correct", seconds: r.levelTimes[i] ?? 0 }] : [],
      ),
      ...r.missionDates.flatMap((d, i) => (d ? [{ at: d, meta: r.meta, label: `Миссия ${i + 1}`, ok: true, seconds: 0 }] : [])),
    ])
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit);
}

export function totalPoints(get: Getter) {
  const points = parse<Record<string, number>>(get("wdt:points")) ?? {};
  return Object.values(points).reduce((a, b) => a + (Number(b) || 0), 0);
}

export function formatDate(iso: string, withTime = true) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  return withTime ? `${date}, ${d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}` : date;
}

export function formatDuration(seconds: number) {
  if (!seconds) return "—";
  if (seconds < 60) return "меньше минуты";
  const min = Math.round(seconds / 60);
  if (min < 60) return `${min} мин`;
  const h = Math.floor(min / 60);
  return `${h} ч ${String(min % 60).padStart(2, "0")} мин`;
}
