import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Eye, Play } from "lucide-react";
import { MissionFeedback, MissionGoal, RobotSays } from "../python/MissionBoard";
import { emitPixel } from "../lib/pixelBus";
import { chipsFor, TagPalette, type Chip } from "./TagPalette";

// One HTML mission: Pixel tells the story, the student writes markup and sees the page live.
// The check parses the code as a real page, so the result counts — not the exact spelling.

export type HtmlMissionDef = {
  title: string;
  /** What Pixel says: the story and a short explanation. */
  story: string;
  /** The task in one or two sentences. */
  goal: ReactNode;
  /** Chips to drag into the editor: tag names, "!doctype", "@attr" or "@attr=value" ("+" stands for a space). */
  tags?: string;
  /** Code already in the editor. */
  starter: string;
  /** Returns a hint when something is missing, or null when the mission is done. */
  check: (doc: Document, code: string) => string | null;
};

const PREVIEW_STYLE = `<style>
  body { font-family: system-ui, sans-serif; margin: 12px; color: #1e293b; background: #fff; line-height: 1.45; }
  img { max-width: 120px; }
  table, td, th { border: 1px solid #94a3b8; border-collapse: collapse; padding: 4px 8px; }
  .card, .box { border: 2px dashed #a5b4fc; border-radius: 10px; padding: 8px; margin: 6px 0; }
  header, nav, main, footer, section, article, aside { outline: 1px dashed #c7d2fe; margin: 4px 0; padding: 4px; }
</style>`;

export function parseHtml(code: string) {
  return new DOMParser().parseFromString(code, "text/html");
}

export function HtmlMissionPlay({
  mission,
  isDone,
  onComplete,
  onMistake,
}: {
  mission: HtmlMissionDef;
  isDone: boolean;
  onComplete: () => void;
  onMistake?: () => void;
}) {
  const [code, setCode] = useState(mission.starter);
  const [checked, setChecked] = useState<string | null | undefined>(undefined);
  const preview = useMemo(() => PREVIEW_STYLE + code, [code]);
  const chips = useMemo(() => chipsFor(mission.title, mission.tags), [mission]);
  const editor = useRef<HTMLTextAreaElement>(null);
  // where a clicked chip goes: the last cursor position in the editor (the end of the starter code at first)
  const cursor = useRef<[number, number]>([mission.starter.length, mission.starter.length]);
  const pendingCaret = useRef<number | null>(null);

  useLayoutEffect(() => {
    const t = editor.current;
    const at = pendingCaret.current;
    if (!t || at === null) return;
    pendingCaret.current = null;
    t.focus();
    t.setSelectionRange(at, at);
    cursor.current = [at, at];
  }, [code]);

  function insert(c: Chip) {
    const [a, b] = cursor.current.map((n) => Math.min(n, code.length));
    // nested block tags keep the indent of the line they are put on
    const indent = code.slice(code.lastIndexOf("\n", a - 1) + 1, a).match(/^\s*$/) ? code.slice(code.lastIndexOf("\n", a - 1) + 1, a) : "";
    const text = c.insert.replace(/\n(?!$)/g, "\n" + indent);
    const newlinesBefore = (c.insert.slice(0, c.caret).match(/\n(?!$)/g) ?? []).length;
    pendingCaret.current = a + c.caret + indent.length * newlinesBefore;
    setCode(code.slice(0, a) + text + code.slice(b));
    setChecked(undefined);
  }

  function check() {
    const hint = mission.check(parseHtml(code), code);
    setChecked(hint);
    if (hint === null) onComplete();
    else {
      emitPixel("wrong");
      onMistake?.();
    }
  }

  return (
    <div className="space-y-4">
      <RobotSays text={mission.story} />
      <MissionGoal>{mission.goal}</MissionGoal>

      <TagPalette chips={chips} onInsert={insert} />

      <div className="grid gap-3 lg:grid-cols-2">
        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">index.html</p>
          <textarea
            ref={editor}
            onSelect={(e) => {
              cursor.current = [e.currentTarget.selectionStart, e.currentTarget.selectionEnd];
            }}
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setChecked(undefined);
            }}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                e.preventDefault();
                const t = e.currentTarget;
                const { selectionStart: a, selectionEnd: b } = t;
                const next = code.slice(0, a) + "  " + code.slice(b);
                setCode(next);
                requestAnimationFrame(() => t.setSelectionRange(a + 2, a + 2));
              }
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                check();
              }
            }}
            spellCheck={false}
            rows={Math.max(7, code.split("\n").length + 1)}
            aria-label="Редактор HTML"
            className="w-full resize-y rounded-2xl border-2 border-slate-200 bg-slate-900 p-3 font-mono text-[13px] leading-relaxed text-slate-100 outline-none [font-variant-ligatures:none] focus:border-indigo-400"
          />
        </div>
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
            <Eye className="h-3.5 w-3.5" strokeWidth={2} />
            Так видит браузер
          </p>
          <iframe
            title="Результат"
            sandbox=""
            srcDoc={preview}
            className="h-full min-h-[11rem] w-full rounded-2xl border-2 border-slate-200"
            style={{ background: "#fff" }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={check}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-5 py-2 text-sm font-bold text-white shadow"
        >
          <Play className="h-4 w-4" strokeWidth={2.5} />
          Проверить
        </button>
        <span className="text-xs text-slate-400">или Ctrl + Enter</span>
      </div>

      {checked !== undefined && <MissionFeedback solved={checked === null} isDone={isDone} hint={checked} />}
    </div>
  );
}
