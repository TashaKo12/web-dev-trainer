import { useSyncExternalStore } from "react";
import { loadItem, saveItem } from "../lib/storage";
import type { CodeExample, GameTheory } from "../components/GameTheory";
import { ROWS, type KeyDef, type Task } from "./data";

// Two keyboards to train on: a usual computer (Windows) and a Mac. The letters stand in the same places;
// the Mac has other names on the big keys (return, delete), ⌘ command instead of Ctrl in shortcuts, and fn.

export type Layout = "pc" | "mac";

export const LAYOUTS: { id: Layout; title: string; icon: string }[] = [
  { id: "pc", title: "Windows", icon: "🪟" },
  { id: "mac", title: "Mac", icon: "🍎" },
];

const k = (code: string, label: string, latin?: string, w?: number): KeyDef => ({ code, label, latin, w });

/** The Mac keyboard: the letter rows are the same, the big keys and the bottom row are different. */
const MAC_ROWS: KeyDef[][] = ROWS.map((row, r) => {
  if (r === 0) return [k("Escape", "esc", undefined, 1.3), k("Delete", "⌦ fn + delete", undefined, 2.6)];
  if (r === 5)
    return [
      k("Fn", "fn", undefined, 1),
      k("ControlLeft", "⌃ control", undefined, 1.4),
      k("AltLeft", "⌥ option", undefined, 1.4),
      k("MetaLeft", "⌘ command", undefined, 1.7),
      k("Space", "Пробел", undefined, 5.2),
      k("MetaRight", "⌘ command", undefined, 1.7),
      k("AltRight", "⌥ option", undefined, 1.4),
      k("ArrowLeft", "←"),
      k("ArrowUp", "↑"),
      k("ArrowDown", "↓"),
      k("ArrowRight", "→"),
    ];
  const rename: Record<string, string> = {
    Backspace: "delete ⌫",
    Tab: "tab ⇥",
    CapsLock: "⇪ caps lock",
    Enter: "return ⏎",
    ShiftLeft: "⇧ shift",
    ShiftRight: "⇧ shift",
  };
  return row.map((key) => (rename[key.code] ? { ...key, label: rename[key.code] } : key));
});

export const rowsFor = (l: Layout) => (l === "mac" ? MAC_ROWS : ROWS);

const BY_CODE: Record<Layout, Map<string, KeyDef>> = {
  pc: new Map(ROWS.flat().map((key) => [key.code, key])),
  mac: new Map(MAC_ROWS.flat().map((key) => [key.code, key])),
};
export const keyOf = (l: Layout, code: string) => BY_CODE[l].get(code);

/** The key held for shortcuts: Ctrl on Windows, ⌘ command on a Mac. */
export const shortcutKey = (l: Layout) => (l === "mac" ? "Meta" : "Control");

/** Windows words → Mac words in the tasks and the theory. */
const MAC_WORDS: [RegExp, string][] = [
  [/Alt \+ Shift или Win \+ Пробел/g, "Ctrl + Пробел или ⌘ Cmd + Пробел"],
  [/\bCtrl\b/g, "⌘ Cmd"],
  [/\bDelete\b/g, "fn + delete"],
  [/\bBackspace\b/g, "delete"],
  [/\bEnter\b/g, "return"],
];
export const forLayout = (l: Layout, text: string) => (l === "mac" ? MAC_WORDS.reduce((t, [a, b]) => t.replace(a, b), text) : text);

const exampleFor = (l: Layout, e: CodeExample): CodeExample => ({ ...e, note: forLayout(l, e.note), code: forLayout(l, e.code) });

export function taskFor(l: Layout, t: Task): Task {
  if (l === "pc") return t;
  const dev = t.dev && exampleFor(l, t.dev);
  if (t.kind === "word") return { ...t, dev };
  return { ...t, dev, say: forLayout(l, t.say), name: forLayout(l, t.name), about: t.about && forLayout(l, t.about) } as Task;
}

export function theoryFor(l: Layout, th: GameTheory): GameTheory {
  if (l === "pc") return th;
  return { ...th, title: forLayout(l, th.title), text: th.text.map((x) => forLayout(l, x)), examples: th.examples?.map((e) => exampleFor(l, e)) };
}

// the choice is remembered on this device; the first time it is guessed from the computer
const KEY = "wdt:keys-layout";
const listeners = new Set<() => void>();
function guess(): Layout {
  try {
    return /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent) ? "mac" : "pc";
  } catch {
    return "pc";
  }
}
let current: Layout = (() => {
  const saved = loadItem(KEY);
  return saved === "mac" || saved === "pc" ? saved : guess();
})();

export function setLayout(l: Layout) {
  current = l;
  saveItem(KEY, l);
  listeners.forEach((f) => f());
}

export function useLayout(): Layout {
  return useSyncExternalStore(
    (f) => {
      listeners.add(f);
      return () => listeners.delete(f);
    },
    () => current,
  );
}
