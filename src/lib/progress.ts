export type TrainerId =
  | "html-structure"
  | "box-model"
  | "flexbox"
  | "selectors"
  | "dom-access";

export type TrainerProgress = {
  score: number;
  total: number;
  completedAt: string;
};

const STORAGE_KEY = "web-dev-trainer:progress";

type ProgressMap = Partial<Record<TrainerId, TrainerProgress>>;

function readAll(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

export function getProgress(id: TrainerId): TrainerProgress | undefined {
  return readAll()[id];
}

export function getAllProgress(): ProgressMap {
  return readAll();
}

export function saveProgress(id: TrainerId, score: number, total: number) {
  const all = readAll();
  all[id] = { score, total, completedAt: new Date().toISOString() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* localStorage can be unavailable (private mode) — progress just won't persist */
  }
}
