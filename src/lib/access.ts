import { trainers } from "../trainers/registry";
import { sessionKey, type SavedSession } from "../components/useTaskStepper";
import { loadItem, loadJSON, saveJSON } from "./storage";

// What is open for a student: theory blocks already read, and topics where they already work.
// Saved with the progress, so it is the same on every computer and after every update of the site.

const KEY = "wdt:theory";
const LEGACY = "theory-read:"; // before: one key per block, only in this browser

/** A short name of a block: the titles are long, and there are hundreds of them. */
function hash(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

export function theoryRead(id: string) {
  return !!loadJSON<Record<string, 1>>(KEY)?.[hash(id)] || loadItem(LEGACY + id) === "1";
}

export function markTheoryRead(id: string) {
  saveJSON(KEY, { ...(loadJSON<Record<string, 1>>(KEY) ?? {}), [hash(id)]: 1 });
}

/** The student has passed a mission or answered a level here: the topic had been open. */
export function hasWorked(path: string) {
  const t = trainers.find((x) => x.path === path);
  if (!t) return false;
  if (t.missions && Number(loadItem(t.missions.storageKey)) > 0) return true;
  return !!loadJSON<SavedSession>(sessionKey(t.id))?.statuses?.some((s) => s !== "idle");
}

/** Blocks read in this browser before the update go to the account too. */
export function adoptOldTheory() {
  try {
    const add: Record<string, 1> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(LEGACY) && localStorage.getItem(k) === "1") add[hash(k.slice(LEGACY.length))] = 1;
    }
    const have = loadJSON<Record<string, 1>>(KEY) ?? {};
    if (Object.keys(add).some((k) => !have[k])) saveJSON(KEY, { ...add, ...have });
  } catch {
    // storage unavailable
  }
}
