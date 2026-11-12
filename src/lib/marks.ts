import { trainers } from "../trainers/registry";
import { sessionKey, type SavedSession } from "../components/useTaskStepper";
import { missionDatesKey } from "../python/MissionBoard";
import { loadItem, notifyProgressReplaced, POINTS, reportPoints, saveItem } from "./storage";

// Tasks the teacher counted as done. Stored apart from the progress on the server, so a student's
// own save never wipes them; both the student's site and the dashboard fold them into the progress.

/** "headings:L2" (practice level, zero-based) or "python-print:M0" (mission) → date of the mark. */
export type Marks = Record<string, string>;

export const markKey = (topicId: string, kind: "L" | "M", index: number) => `${topicId}:${kind}${index}`;

type Patch = { items: Record<string, string>; points: Record<string, number> };

function parse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** What has to change in the progress so that every mark counts. Only real changes are returned. */
export function marksPatch(get: (key: string) => string | null, marks: Marks): Patch {
  const items: Record<string, string> = {};
  const points: Record<string, number> = {};
  const byTopic = new Map<string, { kind: string; index: number; at: string }[]>();
  for (const [key, at] of Object.entries(marks ?? {})) {
    const m = /^([a-z0-9-]+):([LM])(\d+)$/.exec(key);
    if (!m) continue;
    const list = byTopic.get(m[1]) ?? [];
    list.push({ kind: m[2], index: Number(m[3]), at: typeof at === "string" ? at : new Date().toISOString() });
    byTopic.set(m[1], list);
  }

  for (const t of trainers) {
    const list = byTopic.get(t.id);
    if (!list) continue;

    const levels = list.filter((x) => x.kind === "L" && x.index < t.taskCount);
    if (levels.length) {
      const saved = parse<Partial<SavedSession>>(get(sessionKey(t.id)));
      const statuses = Array.isArray(saved?.statuses) && saved.statuses.length === t.taskCount ? [...saved.statuses] : Array(t.taskCount).fill("idle");
      const dates = Array.isArray(saved?.dates) && saved.dates.length === t.taskCount ? [...saved.dates] : Array(t.taskCount).fill(null);
      let changed = false;
      for (const l of levels) {
        if (statuses[l.index] !== "correct") {
          statuses[l.index] = "correct";
          dates[l.index] = dates[l.index] ?? l.at;
          changed = true;
        }
      }
      if (changed) {
        items[sessionKey(t.id)] = JSON.stringify({ index: saved?.index ?? 0, statuses, dates });
        points[`practice:${t.id}`] = statuses.filter((s) => s === "correct").length * POINTS.practice;
      }
    }

    const missions = list.filter((x) => x.kind === "M");
    if (missions.length && t.missions) {
      const done = Math.min(Number(get(t.missions.storageKey)) || 0, t.missions.count);
      const target = Math.min(t.missions.count, Math.max(...missions.map((x) => x.index + 1)));
      if (target > done) {
        const dKey = missionDatesKey(`missions:${t.id}`);
        const dates = parse<(string | null)[]>(get(dKey)) ?? [];
        const at = missions[0].at;
        for (let i = 0; i < target; i++) dates[i] = dates[i] ?? at;
        items[t.missions.storageKey] = String(target);
        items[dKey] = JSON.stringify(dates);
        points[`missions:${t.id}`] = target * POINTS.mission;
      }
    }
  }
  return { items, points };
}

/** The progress as the teacher should see it: the student's data with the marks already counted. */
export function withMarks(data: Record<string, string>, marks: Marks | undefined): Record<string, string> {
  if (!marks || !Object.keys(marks).length) return data;
  const get = (k: string) => (typeof data[k] === "string" ? data[k] : null);
  const { items, points } = marksPatch(get, marks);
  const merged = { ...data, ...items };
  const current = parse<Record<string, number>>(get("wdt:points")) ?? {};
  for (const [src, v] of Object.entries(points)) current[src] = Math.max(current[src] ?? 0, v);
  merged["wdt:points"] = JSON.stringify(current);
  return merged;
}

/** On the student's device: count the teacher's marks in the local progress. Returns true if anything changed. */
export function applyMarksLocally(marks: Marks): boolean {
  const { items, points } = marksPatch(loadItem, marks);
  const keys = Object.keys(items);
  if (!keys.length) return false;
  for (const k of keys) saveItem(k, items[k]);
  for (const [src, v] of Object.entries(points)) reportPoints(src, v);
  notifyProgressReplaced();
  return true;
}
