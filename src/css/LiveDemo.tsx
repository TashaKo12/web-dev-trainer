import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Eye, RotateCcw } from "lucide-react";

// An example in the theory that the student can change: the code is laid out neatly (one property per line,
// one tag per line), both files are editable and the preview follows every change.

const CONTAINER = "html|head|body|header|main|footer|nav|section|article|aside|div|ul|ol|table|thead|tbody|tr|form|figure|fieldset|select";
const LEAF = "p|h[1-6]|li|td|th|button|label|figcaption|option|textarea|legend|caption";

/** `a { x: 1; y: 2; }` → one property per line. Code already laid out by hand is kept as it is. */
export function formatCss(src: string) {
  const s = src.trim();
  // already laid out by hand (a closing brace on its own line), or too tricky for this simple layout — keep it
  if (!s || /^\s*}\s*$/m.test(s) || s.includes("/*") || s.includes("@")) return s;
  const rules: string[] = [];
  for (const m of s.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    const decls = m[2]
      .split(";")
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => `  ${d.replace(/\s*:\s*/, ": ")};`);
    rules.push(`${m[1].trim()} {\n${decls.join("\n")}\n}`);
  }
  return rules.length ? rules.join("\n\n") : s;
}

/** Block tags on their own lines with indents; a paragraph, a heading or a short block stays on one line. */
export function formatHtml(src: string) {
  const s = src.trim();
  if (!s || s.includes("\n")) return s;
  const re = new RegExp(`(<(${LEAF})\\b[^>]*>[\\s\\S]*?<\\/\\2>)|(<\\/?(?:${CONTAINER})\\b[^>]*>)`, "gi");
  const out: string[] = [];
  let depth = 0;
  let last = 0;
  const pad = () => "  ".repeat(depth);
  const text = (t: string) => {
    const v = t.trim();
    if (v) out.push(pad() + v);
  };
  for (const m of s.matchAll(re)) {
    text(s.slice(last, m.index));
    const tok = m[0];
    if (m[1]) out.push(pad() + tok);
    else if (tok.startsWith("</")) {
      depth = Math.max(0, depth - 1);
      out.push(pad() + tok);
    } else {
      out.push(pad() + tok);
      if (!tok.endsWith("/>")) depth++;
    }
    last = (m.index ?? 0) + tok.length;
  }
  text(s.slice(last));
  // «<div>\n  short text\n</div>» reads better on one line
  for (let i = 0; i + 2 < out.length; i++) {
    const [a, b, c] = [out[i], out[i + 1], out[i + 2]];
    const open = a.trim();
    if (/^<(?!\/)[^>]+>$/.test(open) && /^<\//.test(c.trim()) && !b.trim().startsWith("<") && (open + b.trim() + c.trim()).length < 70) {
      out.splice(i, 3, a + b.trim() + c.trim());
    }
  }
  return out.join("\n");
}

function Editor({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const el = e.currentTarget;
    const a = el.selectionStart;
    onChange(value.slice(0, a) + "  " + value.slice(el.selectionEnd));
    requestAnimationFrame(() => (el.selectionStart = el.selectionEnd = a + 2));
  }
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-[#334155] bg-[#0f172a]">
      <p className="border-b border-[#334155] bg-[#1e293b] px-3 py-1.5 font-mono text-xs font-bold text-[#94a3b8]">{label}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        autoCapitalize="off"
        wrap="off"
        rows={Math.max(3, value.split("\n").length)}
        aria-label={`Редактор ${label}`}
        className="block w-full resize-y overflow-x-auto bg-transparent px-3 py-2.5 font-mono text-[0.8125rem] leading-relaxed text-[#e2e8f0] caret-[#fde047] outline-none"
      />
    </div>
  );
}

export function LiveDemo({ html, css, height = 180, render }: { html: string; css: string; height?: number; render: (html: string, css: string, height: number) => ReactNode }) {
  const startCss = formatCss(css);
  const startHtml = formatHtml(html);
  const [cssCode, setCss] = useState(startCss);
  const [htmlCode, setHtml] = useState(startHtml);
  // the preview follows the typing, a moment later — so it does not blink on every key
  const [shown, setShown] = useState({ html: startHtml, css: startCss });
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShown({ html: htmlCode, css: cssCode }), 250);
    return () => clearTimeout(timer.current);
  }, [htmlCode, cssCode]);
  const changed = cssCode !== startCss || htmlCode !== startHtml;

  return (
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      <div className="space-y-3">
        {startCss && <Editor label="style.css" value={cssCode} onChange={setCss} />}
        <Editor label="index.html" value={htmlCode} onChange={setHtml} />
      </div>
      <div>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
            <Eye className="h-3.5 w-3.5" strokeWidth={2} />
            Так видит браузер
          </p>
          {changed && (
            <button
              type="button"
              onClick={() => {
                setCss(startCss);
                setHtml(startHtml);
              }}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-500 hover:text-indigo-600"
            >
              <RotateCcw className="h-3 w-3" strokeWidth={2.4} /> Вернуть как было
            </button>
          )}
        </div>
        <div className="md:sticky md:top-24">{render(shown.html, shown.css, height)}</div>
        <p className="mt-2 text-xs text-slate-400">✏️ Код можно менять — результат обновится сразу. Попробуй поменять цвет или текст!</p>
      </div>
    </div>
  );
}
