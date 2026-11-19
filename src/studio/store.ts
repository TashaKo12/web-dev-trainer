import { useSyncExternalStore } from "react";
import { getConsent } from "../lib/storage";
import type { Project } from "./model";

// The child's games live in this browser under their own key: pictures can be big, so they are not part of the
// cloud progress (which has a size limit). When saving in the browser is turned off, games live only in memory.

const KEY = "studio:projects";
let projects: Project[] = read();
const listeners = new Set<() => void>();

function read(): Project[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Project[];
  } catch {
    return [];
  }
}

/** Saving failed (the browser storage is full or off): the screen tells the child. */
export let lastSaveError: string | null = null;

function write() {
  lastSaveError = null;
  if (getConsent() === "denied") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(projects));
  } catch {
    lastSaveError = "Не получилось сохранить: в браузере закончилось место. Удали лишние картинки или старые игры.";
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export const savingInBrowser = () => getConsent() !== "denied";

export function useProjects() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => projects,
  );
}

export function saveProject(p: Project) {
  const next = { ...p, updated: Date.now() };
  projects = projects.some((x) => x.id === p.id) ? projects.map((x) => (x.id === p.id ? next : x)) : [next, ...projects];
  write();
  emit();
}

export function deleteProject(id: string) {
  projects = projects.filter((p) => p.id !== id);
  write();
  emit();
}

/** A picture from the child's computer, made small enough to keep in the browser (longest side 160 px). */
export function readPicture(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("image"));
      img.onload = () => {
        const scale = Math.min(1, 160 / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
