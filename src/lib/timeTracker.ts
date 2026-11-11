import { loadJSON, saveJSON } from "./storage";

// Counts how long a participant actually works on a topic, a practice level and the missions.
// Time runs only while the tab is visible and someone has touched the page in the last 90 seconds.
// Keys: "<topic>" for the whole page, "<topic>#L<n>" for a level (zero-based), "<topic>#missions".

export const TIME_KEY = "wdt:time";

const TICK = 5;
const IDLE_AFTER_MS = 90_000;
const FLUSH_EVERY = 30;

let topic: string | null = null;
let level: { topic: string; index: number } | null = null;
let lastInput = Date.now();
let pending: Record<string, number> = {};
let sinceFlush = 0;
let started = false;

export const levelTimeKey = (topicId: string, i: number) => `${topicId}#L${i}`;
export const missionsTimeKey = (topicId: string) => `${topicId}#missions`;

export function setTimeTopic(next: string | null) {
  if (next !== topic) flush();
  topic = next;
}

/** Called by the practice of a topic; child effects can run before the layout sets the topic, so the topic is kept too. */
export function setTimeLevel(topicId: string, next: number | null) {
  if (next !== null) level = { topic: topicId, index: next };
  else if (level?.topic === topicId) level = null;
}

function onScreen(selector: string) {
  const el = document.querySelector(selector);
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.bottom > 80 && r.top < window.innerHeight - 80;
}

function add(key: string) {
  pending[key] = (pending[key] ?? 0) + TICK;
}

function flush() {
  if (!Object.keys(pending).length) return;
  const saved = loadJSON<Record<string, number>>(TIME_KEY) ?? {};
  for (const [k, v] of Object.entries(pending)) saved[k] = (saved[k] ?? 0) + v;
  pending = {};
  sinceFlush = 0;
  saveJSON(TIME_KEY, saved);
}

export function startTimeTracking() {
  if (started) return;
  started = true;
  const touch = () => {
    lastInput = Date.now();
  };
  for (const ev of ["pointerdown", "pointermove", "keydown", "scroll", "wheel", "touchstart"]) {
    window.addEventListener(ev, touch, { passive: true, capture: true });
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
    else touch();
  });
  window.addEventListener("pagehide", flush);

  setInterval(() => {
    if (!topic || document.visibilityState !== "visible" || Date.now() - lastInput > IDLE_AFTER_MS) return;
    add(topic);
    if (level?.topic === topic && onScreen("[data-practice]")) add(levelTimeKey(topic, level.index));
    if (onScreen("[data-missions]")) add(missionsTimeKey(topic));
    sinceFlush += TICK;
    if (sinceFlush >= FLUSH_EVERY) flush();
  }, TICK * 1000);
}
