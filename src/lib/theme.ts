import { loadItem, saveItem } from "./storage";

const STORAGE_KEY = "theme";

export type Theme = "light" | "dark";

export function getInitialTheme(): Theme {
  const stored = loadItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "dark";
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  saveItem(STORAGE_KEY, theme);
}
