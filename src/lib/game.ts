import { useEffect, useState, useSyncExternalStore } from "react";
import { loadItem, loadJSON, saveJSON, useTotalPoints } from "./storage";
import { readReports, type TopicReport } from "./reports";
import { emitPixel, onPixel } from "./pixelBus";

// The game layer for the whole course: ranks by experience, achievements, streaks of right
// answers and stars for every topic. Experience (XP) is the same as the points.

export type Rank = { title: string; from: number };

export const RANKS: Rank[] = [
  { title: "Новичок", from: 0 },
  { title: "Стажёр", from: 50 },
  { title: "Верстальщик", from: 150 },
  { title: "Мастер тегов", from: 300 },
  { title: "Повелитель стилей", from: 600 },
  { title: "Веб-разработчик", from: 1000 },
  { title: "Гуру веба", from: 1600 },
];

export function rankFor(xp: number) {
  let i = 0;
  while (i + 1 < RANKS.length && xp >= RANKS[i + 1].from) i++;
  const next = RANKS[i + 1] ?? null;
  const progress = next ? (xp - RANKS[i].from) / (next.from - RANKS[i].from) : 1;
  return { rank: RANKS[i], level: i + 1, next, progress };
}

/** 0–3 stars: 1 — topic finished, 2 — at least 70% right, 3 — no mistakes. */
export function starsFor(r: TopicReport) {
  const total = r.statuses.length;
  if (!total || r.statuses.some((s) => s === "idle")) return 0;
  const ratio = r.solved / total;
  return ratio === 1 ? 3 : ratio >= 0.7 ? 2 : 1;
}

// ── streak of right answers in a row ──
const STREAK_KEY = "wdt:streak";
type Streak = { current: number; best: number };
let streak: Streak = loadJSON<Streak>(STREAK_KEY) ?? { current: 0, best: 0 };
const streakListeners = new Set<() => void>();

onPixel((e) => {
  if (e !== "correct" && e !== "wrong") return;
  const current = e === "correct" ? streak.current + 1 : 0;
  streak = { current, best: Math.max(streak.best, current) };
  saveJSON(STREAK_KEY, streak);
  streakListeners.forEach((l) => l());
  if (e === "correct" && [3, 5, 10, 15, 20].includes(current)) {
    setTimeout(() => emitPixel("streak"), 900);
  }
});

export function getStreak() {
  return streak;
}

export function useStreak() {
  return useSyncExternalStore(
    (l) => {
      streakListeners.add(l);
      return () => {
        streakListeners.delete(l);
      };
    },
    () => streak,
  );
}

// ── achievements ──
export type Achievement = { id: string; title: string; text: string; done: boolean };
type Facts = { reports: TopicReport[]; xp: number; best: number };

const section = (f: Facts, s: TopicReport["meta"]["section"]) => f.reports.filter((r) => r.meta.section === s);
const finished = (r: TopicReport) => starsFor(r) > 0;

const RULES: { id: string; title: string; text: string; test: (f: Facts) => boolean }[] = [
  { id: "first-step", title: "Первый шаг", text: "Реши первое задание верно", test: (f) => f.reports.some((r) => r.solved > 0) },
  { id: "first-topic", title: "Первая тема", text: "Пройди все уровни одной темы", test: (f) => f.reports.some(finished) },
  { id: "flawless", title: "Без единой ошибки", text: "Пройди тему на три звезды", test: (f) => f.reports.some((r) => starsFor(r) === 3) },
  { id: "five-topics", title: "Пять тем", text: "Пройди пять тем", test: (f) => f.reports.filter(finished).length >= 5 },
  { id: "ten-topics", title: "Десять тем", text: "Пройди десять тем", test: (f) => f.reports.filter(finished).length >= 10 },
  { id: "streak-5", title: "Серия из пяти", text: "Ответь верно пять раз подряд", test: (f) => f.best >= 5 },
  { id: "streak-10", title: "Неудержимый", text: "Ответь верно десять раз подряд", test: (f) => f.best >= 10 },
  { id: "xp-100", title: "Сотня", text: "Набери 100 очков", test: (f) => f.xp >= 100 },
  { id: "xp-500", title: "Пятьсот!", text: "Набери 500 очков", test: (f) => f.xp >= 500 },
  { id: "html", title: "Знаток HTML", text: "Пройди все темы по HTML", test: (f) => section(f, "html").every(finished) },
  { id: "css", title: "Стилист", text: "Пройди все темы по CSS", test: (f) => section(f, "css").every(finished) },
  { id: "js", title: "Программист", text: "Пройди все темы по JavaScript", test: (f) => section(f, "js").every(finished) },
];

const UNLOCKED_KEY = "wdt:achievements";

export function readGame() {
  const reports = readReports(loadItem);
  const points = loadJSON<Record<string, number>>("wdt:points") ?? {};
  const xp = Object.values(points).reduce((a, b) => a + (Number(b) || 0), 0);
  const facts: Facts = { reports, xp, best: streak.best };
  const achievements: Achievement[] = RULES.map((r) => ({ id: r.id, title: r.title, text: r.text, done: r.test(facts) }));
  return { xp, reports, achievements, ...rankFor(xp) };
}

/** Everything the game screens need; refreshes when points or the streak change. */
export function useGame() {
  const total = useTotalPoints();
  const s = useStreak();
  const [game, setGame] = useState(readGame);
  useEffect(() => setGame(readGame()), [total, s]);
  return { ...game, streak: s };
}

// ── news for the toast: a new achievement or a new rank ──
export type GameNews = { kind: "achievement" | "rank"; title: string; text: string };
const newsListeners = new Set<(n: GameNews) => void>();

export function onGameNews(listener: (n: GameNews) => void) {
  newsListeners.add(listener);
  return () => {
    newsListeners.delete(listener);
  };
}

/** Compares with what was already celebrated and announces anything new. */
export function checkGameNews() {
  const g = readGame();
  const seen = loadJSON<{ ids: string[]; level: number }>(UNLOCKED_KEY);
  const ids = g.achievements.filter((a) => a.done).map((a) => a.id);
  // first run: remember the current state quietly instead of flooding old achievements
  if (!seen) {
    saveJSON(UNLOCKED_KEY, { ids, level: g.level });
    return;
  }
  const fresh = g.achievements.filter((a) => a.done && !seen.ids.includes(a.id));
  if (!fresh.length && g.level <= seen.level) return;
  saveJSON(UNLOCKED_KEY, { ids, level: Math.max(seen.level, g.level) });
  if (g.level > seen.level) newsListeners.forEach((l) => l({ kind: "rank", title: g.rank.title, text: "Новое звание!" }));
  fresh.forEach((a) => newsListeners.forEach((l) => l({ kind: "achievement", title: a.title, text: a.text })));
}
