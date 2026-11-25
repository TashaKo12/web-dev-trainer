import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { loadJSON, onProgressReplaced, saveJSON } from "./storage";
import { capDrafts } from "./merge";
import { isTeacher } from "./teacher";

// The code a student is writing: kept as it is typed, so going to the theory (or to another page, or closing the
// browser) loses nothing. Goes to the account with the rest of the progress.

export const DRAFTS_KEY = "wdt:drafts";
const MAX_ONE = 6000; // characters in one draft

/** null instead of a text — cleared: the copy in the account must not bring the old text back */
type Drafts = Record<string, [text: string | null, at: number]>;

let drafts: Drafts = loadJSON<Drafts>(DRAFTS_KEY) ?? {};
let timer: ReturnType<typeof setTimeout> | undefined;

onProgressReplaced(() => {
  const saved = loadJSON<Drafts>(DRAFTS_KEY) ?? {};
  // keep what is being typed right now and not saved yet
  const next = { ...saved };
  for (const [k, d] of Object.entries(drafts)) if (!next[k] || next[k][1] < d[1]) next[k] = d;
  drafts = next;
});

export function flushDrafts() {
  if (timer === undefined) return;
  clearTimeout(timer);
  timer = undefined;
  drafts = capDrafts(drafts);
  saveJSON(DRAFTS_KEY, drafts);
}

export function readDraft(id: string | null): string | null {
  const d = id ? drafts[id] : undefined;
  return Array.isArray(d) && typeof d[0] === "string" ? d[0] : null;
}

export function writeDraft(id: string | null, text: string) {
  if (!id || isTeacher() || text.length > MAX_ONE || readDraft(id) === text) return;
  drafts = { ...drafts, [id]: [text, Date.now()] };
  clearTimeout(timer);
  timer = setTimeout(flushDrafts, 500);
}

/** Forgets the drafts whose names start with `prefix` (the practice is started over). */
export function clearDrafts(prefix: string) {
  for (const k of Object.keys(drafts)) if (k.startsWith(prefix)) drafts = { ...drafts, [k]: [null, Date.now()] };
  clearTimeout(timer);
  timer = setTimeout(flushDrafts, 500);
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flushDrafts);
  document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && flushDrafts());
}

/** Which task the editors inside belong to. */
const Scope = createContext<string | null>(null);
export function DraftScope({ id, children }: { id: string; children: ReactNode }) {
  return <Scope.Provider value={id}>{children}</Scope.Provider>;
}

/** Like useState for the text of an editor, but the text is remembered. `part` — when a task has several editors. */
export function useDraft(start: string, part = ""): [string, (v: string) => void] {
  const scope = useContext(Scope);
  const id = scope ? scope + part : null;
  const [text, setText] = useState(() => readDraft(id) ?? start);
  useEffect(() => flushDrafts, []);
  return [
    text,
    (v) => {
      setText(v);
      writeDraft(id, v);
    },
  ];
}

/** Puts the task's own starting code back. Shown only when something was written. */
export function ResetDraft({ value, start, onReset }: { value: string; start: string; onReset: (v: string) => void }) {
  if (value === start) return null;
  return (
    <button type="button" onClick={() => onReset(start)} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-slate-400 hover:text-slate-600">
      <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.2} /> Вернуть начальный код
    </button>
  );
}
