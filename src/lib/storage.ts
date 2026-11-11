import { useSyncExternalStore } from "react";

// Everything the site remembers goes through here. Until the user agrees,
// data lives only in memory for the current tab; nothing is written to the browser.

export type Consent = "granted" | "denied";

const CONSENT_KEY = "wdt:consent";
const POINTS_KEY = "wdt:points";
const LEGACY_KEYS = ["theme", "web-dev-trainer:progress", "python-print-missions"];

function storageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // private mode or blocked storage — keep working in memory
  }
}

const memory = new Map<string, string>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

let consent: Consent | null = (() => {
  const v = storageGet(CONSENT_KEY);
  return v === "granted" || v === "denied" ? v : null;
})();

export function loadItem(key: string): string | null {
  if (memory.has(key)) return memory.get(key)!;
  return consent === "denied" ? null : storageGet(key);
}

export function saveItem(key: string, value: string) {
  memory.set(key, value);
  if (consent === "granted") storageSet(key, value);
}

export function loadJSON<T>(key: string): T | null {
  const raw = loadItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function saveJSON(key: string, value: unknown) {
  saveItem(key, JSON.stringify(value));
}

function clearSaved() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith("wdt:") || LEGACY_KEYS.includes(k))) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // nothing to clear
  }
}

export function setConsent(value: Consent) {
  if (value === "granted" && consent !== "granted") {
    // keep anything that was already saved on this device, then add this session on top
    for (const k of [...LEGACY_KEYS, POINTS_KEY]) {
      const stored = storageGet(k);
      if (stored !== null && !memory.has(k)) memory.set(k, stored);
    }
    memory.forEach((v, k) => storageSet(k, v));
  }
  if (value === "denied") clearSaved();
  consent = value;
  storageSet(CONSENT_KEY, value);
  emit();
}

const isOurKey = (k: string) => (k.startsWith("wdt:") || LEGACY_KEYS.includes(k)) && k !== CONSENT_KEY;

/** Everything this site remembers (saved on the device and kept in memory), for the restore code. */
export function exportData(): Record<string, string> {
  const data: Record<string, string> = {};
  if (consent !== "denied") {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && isOurKey(k)) data[k] = localStorage.getItem(k) ?? "";
      }
    } catch {
      // storage unavailable — memory below is still exported
    }
  }
  memory.forEach((v, k) => {
    if (isOurKey(k)) data[k] = v;
  });
  return data;
}

/** Restores data from a restore code. Requires consent, otherwise it would vanish on reload. */
export function importData(data: Record<string, string>) {
  if (consent !== "granted") setConsent("granted");
  for (const [k, v] of Object.entries(data)) {
    if (isOurKey(k) && typeof v === "string") saveItem(k, v);
  }
}

let points: Record<string, number> = loadJSON<Record<string, number>>(POINTS_KEY) ?? {};
let total = Object.values(points).reduce((a, b) => a + b, 0);

/** Records the best result for one source (a practice, a deck, missions); the total only grows. */
export function reportPoints(source: string, value: number) {
  if (value <= (points[source] ?? 0)) return;
  points = { ...points, [source]: value };
  total = Object.values(points).reduce((a, b) => a + b, 0);
  saveJSON(POINTS_KEY, points);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useConsent() {
  return useSyncExternalStore(subscribe, () => consent);
}

export function useTotalPoints() {
  return useSyncExternalStore(subscribe, () => total);
}

export const POINTS = { practice: 10, mission: 10, card: 5 } as const;
