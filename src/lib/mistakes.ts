import { loadJSON, saveJSON } from "./storage";

// Every wrong attempt is remembered with its time — even if the student fixes it later.
// The teacher sums these across all students to see which tasks need rework.
// Key: "<topic>:L<n>" practice level, "<topic>:M<n>" mission, "<topic>:C<n>" true/false card (zero-based).

export const MISTAKES_KEY = "wdt:mistakes";
const KEEP = 50; // per task, the newest ones

export type MistakeLog = Record<string, string[]>;

export function logMistake(task: string) {
  const log = loadJSON<MistakeLog>(MISTAKES_KEY) ?? {};
  const list = Array.isArray(log[task]) ? log[task] : [];
  list.push(new Date().toISOString());
  log[task] = list.slice(-KEEP);
  saveJSON(MISTAKES_KEY, log);
}

export function describeTask(key: string) {
  const m = /^(.+):([LMC])(\d+)$/.exec(key);
  if (!m) return null;
  const n = Number(m[3]) + 1;
  return { topicId: m[1], kind: m[2] as "L" | "M" | "C", label: m[2] === "L" ? `уровень ${n}` : m[2] === "M" ? `миссия ${n}` : `карточка ${n}` };
}
