import type { KeyboardEvent } from "react";
import { Lightbulb, Play } from "lucide-react";
import type { RunResult } from "./interpreter";

const SYNTAX_ERRORS = new Set(["SyntaxError", "IndentationError"]);

export function TerminalView({ result }: { result: RunResult | null }) {
  const lines: { text: string; tone: "out" | "err" | "muted" }[] = [];

  if (result) {
    if (result.output) {
      for (const line of result.output.replace(/\n$/, "").split("\n")) lines.push({ text: line, tone: "out" });
    } else if (!result.error) {
      lines.push({ text: "(программа ничего не напечатала)", tone: "muted" });
    }
    if (result.error) {
      const e = result.error;
      if (!SYNTAX_ERRORS.has(e.type)) lines.push({ text: "Traceback (most recent call last):", tone: "err" });
      lines.push({ text: `  File "main.py", line ${e.line}`, tone: "err" });
      lines.push({ text: `    ${e.source.trim()}`, tone: "err" });
      lines.push({ text: e.message ? `${e.type}: ${e.message}` : e.type, tone: "err" });
    }
  }

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-inner">
        <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-2 font-mono text-[11px] text-slate-500">терминал</span>
        </div>
        <div className="min-h-[5.5rem] px-4 py-3 font-mono text-sm leading-relaxed">
          <div className="text-slate-500">$ python main.py</div>
          {!result && <div className="text-slate-500">Нажми «Запустить», чтобы увидеть результат</div>}
          {lines.map((l, i) => (
            <div
              key={i}
              className={`whitespace-pre-wrap break-words ${
                l.tone === "err" ? "text-rose-300" : l.tone === "muted" ? "italic text-slate-500" : "text-emerald-200"
              }`}
            >
              {l.text || " "}
            </div>
          ))}
        </div>
      </div>
      {result?.error?.hint && (
        <div className="mt-3 flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          <span>{result.error.hint}</span>
        </div>
      )}
    </div>
  );
}

export function PrintInput({
  value,
  onChange,
  onRun,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onRun: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex cursor-text items-center overflow-x-auto rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 font-mono text-sm sm:text-base">
      <span className="select-none text-sky-300">print</span>
      <span className="select-none text-slate-400">(</span>
      <input
        style={{ width: `${(value ? value.length : 14) + 1}ch` }}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onRun();
        }}
        disabled={disabled}
        spellCheck={false}
        autoComplete="off"
        aria-label="Что написать внутри скобок print"
        placeholder="напиши здесь…"
        className="min-w-0 shrink-0 bg-transparent px-0.5 text-amber-200 caret-emerald-300 outline-none placeholder:text-slate-600 disabled:opacity-70"
      />
      <span className="select-none text-slate-400">)</span>
      <span className="flex-1" />
    </div>
  );
}

export function CodeEditor({
  value,
  onChange,
  onRun,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onRun: () => void;
  disabled?: boolean;
}) {
  const lineCount = Math.max(value.split("\n").length, 3);

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onRun();
    }
  }

  return (
    <div className="flex overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 font-mono text-sm sm:text-base">
      <div aria-hidden="true" className="select-none border-r border-slate-800 px-3 py-3 text-right leading-relaxed text-slate-600">
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        spellCheck={false}
        rows={lineCount}
        aria-label="Код программы"
        className="min-w-0 flex-1 resize-none bg-transparent px-3 py-3 leading-relaxed text-amber-100 caret-emerald-300 outline-none disabled:opacity-70"
      />
    </div>
  );
}

export function RunButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-full border-2 border-emerald-300 px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Play className="h-4 w-4" strokeWidth={2.25} />
      Запустить
    </button>
  );
}
