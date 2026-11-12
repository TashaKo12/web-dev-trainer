import { loadJSON, saveJSON } from "./storage";

export type TrainerId =
  | "html-structure"
  | "box-model"
  | "flexbox"
  | "selectors"
  | "dom-access"
  | "typography"
  | "pseudo-classes"
  | "tables"
  | "page-layout"
  | "image-paths"
  | "tags-attributes"
  | "links"
  | "backgrounds"
  | "shadows"
  | "headings"
  | "paragraphs"
  | "lists"
  | "div-classes"
  | "id-attribute"
  | "images"
  | "css-intro"
  | "text-color"
  | "background-color"
  | "text-align"
  | "buttons"
  | "semantic-tags"
  | "form-basics"
  | "form-fields"
  | "input-types"
  | "font-size"
  | "font-weight"
  | "border"
  | "gradient"
  | "reset-box-sizing"
  | "grid"
  | "opacity"
  | "transitions"
  | "python-print"
  | "python-input"
  | "python-variables"
  | "python-if"
  | "python-for"
  | "python-while";

export type TrainerProgress = {
  score: number;
  total: number;
  completedAt: string;
};

const STORAGE_KEY = "web-dev-trainer:progress";

type ProgressMap = Partial<Record<TrainerId, TrainerProgress>>;

function readAll(): ProgressMap {
  return loadJSON<ProgressMap>(STORAGE_KEY) ?? {};
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
  saveJSON(STORAGE_KEY, all);
}
