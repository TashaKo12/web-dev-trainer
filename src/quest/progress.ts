import { useSyncExternalStore } from "react";
import { loadJSON, onProgressReplaced, reportPoints, saveJSON } from "../lib/storage";
import { isTeacher } from "../lib/teacher";
import { BAYS, DIARY } from "./data";

// What the player has done in the quest. Saved like the rest of the progress (and synced to the account).

const KEY = "wdt:quest";
export const POINTS_PER_STAR = 5;

export type QuestSave = {
  prologue: boolean;
  /** Bays whose opening / closing scene was already shown. */
  intro: number[];
  outro: number[];
  /** Best stars for each level. */
  stars: Record<string, number>;
  /** Crystals picked up: "levelId:x,y". Every crystal counts once. */
  crystals: string[];
  /** Diary pages found (by level id). */
  diary: string[];
};

const EMPTY: QuestSave = { prologue: false, intro: [], outro: [], stars: {}, crystals: [], diary: [] };

const read = (): QuestSave => ({ ...EMPTY, ...(loadJSON<QuestSave>(KEY) ?? {}) });
let state: QuestSave = read();
const listeners = new Set<() => void>();

// progress came from the account (or the teacher changed it): read it again
onProgressReplaced(() => {
  state = read();
  listeners.forEach((l) => l());
});

/** The teacher's view: every bay repaired, every level on three stars, every crystal and diary page found. */
let teacherView: QuestSave | null = null;
function forTeacher(): QuestSave {
  if (!teacherView) {
    const ids = BAYS.map((b) => b.id);
    const levels = BAYS.flatMap((b) => b.levels);
    const crystals = levels.flatMap((l) => l.map.flatMap((row, y) => [...row].flatMap((c, x) => (c === "*" ? [`${l.id}:${x},${y}`] : []))));
    teacherView = {
      prologue: true,
      intro: ids,
      outro: ids,
      stars: Object.fromEntries(levels.map((l) => [l.id, 3])),
      crystals,
      diary: Object.keys(DIARY),
    };
  }
  return teacherView;
}

const current = () => (isTeacher() ? forTeacher() : state);

function commit(next: QuestSave) {
  if (isTeacher()) return; // the teacher's view is never saved
  state = next;
  saveJSON(KEY, state);
  listeners.forEach((l) => l());
}

export function useQuest() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    current,
  );
}

export const markPrologue = () => commit({ ...state, prologue: true });
export const markIntro = (bay: number) => !state.intro.includes(bay) && commit({ ...state, intro: [...state.intro, bay] });
export const markOutro = (bay: number) => !state.outro.includes(bay) && commit({ ...state, outro: [...state.outro, bay] });

/** Saves a finished level: the best stars, new crystals and a found diary page. Returns how many crystals are new. */
export function finishLevel(levelId: string, stars: number, picked: string[], diaryFound: boolean) {
  if (isTeacher()) return 0;
  const fresh = picked.map((p) => `${levelId}:${p}`).filter((c) => !state.crystals.includes(c));
  const best = Math.max(stars, state.stars[levelId] ?? 0);
  commit({
    ...state,
    stars: { ...state.stars, [levelId]: best },
    crystals: [...state.crystals, ...fresh],
    diary: diaryFound && !state.diary.includes(levelId) ? [...state.diary, levelId] : state.diary,
  });
  reportPoints(`quest:${levelId}`, best * POINTS_PER_STAR);
  return fresh.length;
}

/** Bays that are not built yet are never done. */
export const bayDone = (s: QuestSave, bayId: number) => BAYS.find((b) => b.id === bayId)?.levels.every((l) => (s.stars[l.id] ?? 0) > 0) ?? false;

/** A bay opens when the one before it is repaired. */
export const bayOpen = (s: QuestSave, bayId: number) => bayId === 1 || bayDone(s, bayId - 1);

/** A level opens when the one before it in the bay is passed. */
export function levelOpen(s: QuestSave, bayId: number, index: number) {
  if (!bayOpen(s, bayId)) return false;
  if (index === 0) return true;
  const prev = BAYS.find((b) => b.id === bayId)!.levels[index - 1];
  return (s.stars[prev.id] ?? 0) > 0;
}
