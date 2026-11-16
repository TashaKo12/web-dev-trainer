import { useSyncExternalStore } from "react";
import { loadJSON, onProgressReplaced, reportPoints, saveJSON } from "./storage";
import { isTeacher } from "./teacher";

// Stars for the levels of a small game (the logic island, the keyboard). Saved like the rest of the progress;
// the teacher sees every level on three stars, and nothing of that is saved.

export const POINTS_PER_STAR = 5;

export type StarSave = { intro: boolean; stars: Record<string, number> };

export function createStarStore(storageKey: string, pointsPrefix: string, allLevelIds: () => string[]) {
  const read = (): StarSave => ({ intro: false, stars: {}, ...(loadJSON<StarSave>(storageKey) ?? {}) });
  let state = read();
  let teacherView: StarSave | null = null;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());

  onProgressReplaced(() => {
    state = read();
    emit();
  });

  const current = () => {
    if (!isTeacher()) return state;
    if (!teacherView) teacherView = { intro: true, stars: Object.fromEntries(allLevelIds().map((id) => [id, 3])) };
    return teacherView;
  };

  function commit(next: StarSave) {
    if (isTeacher()) return;
    state = next;
    saveJSON(storageKey, state);
    emit();
  }

  return {
    use: () =>
      useSyncExternalStore(
        (l) => {
          listeners.add(l);
          return () => listeners.delete(l);
        },
        current,
      ),
    markIntro: () => !state.intro && commit({ ...state, intro: true }),
    /** Keeps the best result and reports the points. */
    finish(levelId: string, stars: number) {
      if (isTeacher()) return;
      const best = Math.max(stars, state.stars[levelId] ?? 0);
      commit({ ...state, stars: { ...state.stars, [levelId]: best } });
      reportPoints(`${pointsPrefix}:${levelId}`, best * POINTS_PER_STAR);
    },
  };
}
