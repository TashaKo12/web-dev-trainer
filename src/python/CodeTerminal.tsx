import { useState, type KeyboardEvent } from "react";
import { CornerDownLeft, Lightbulb, Play } from "lucide-react";
import { runPython, type RunResult } from "./interpreter";

const SYNTAX_ERRORS = new Set(["SyntaxError", "IndentationError"]);

/** Runs a program and lets the user answer its input() questions one at a time. */
export function useProgramRunner() {
  const [result, setResult] = useState<RunResult | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [code, setCode] = useState("");

  function run(source: string) {
    const r = runPython(source, []);
    setCode(source);
    setAnswers([]);
    setResult(r);
    return { result: r, answers: [] as string[] };
  }

  function answer(text: string) {
    const next = [...answers, text];
    const r = runPython(code, next);
    setAnswers(next);
    setResult(r);
    return { result: r, answers: next };
  }

  return { result, answers, run, answer };
}

function AnswerInput({ onAnswer }: { onAnswer: (text: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <span className="inline-flex items-center gap-1 align-baseline">
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onAnswer(value);
        }}
        aria-label="Ответ программе"
        spellCheck={false}
        autoComplete="off"
        style={{ width: `${Math.max(value.length, 6) + 1}ch` }}
        className="border-b border-dashed border-sky-400 bg-transparent font-mono text-sky-300 caret-sky-300 outline-none"
      />
      <button
        type="button"
        onClick={() => onAnswer(value)}
        aria-label="Отправить ответ"
        className="rounded border border-slate-700 p-0.5 text-slate-400 hover:text-sky-300"
      >
        <CornerDownLeft className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </span>
  );
}

export function TerminalView({ result, onAnswer }: { result: RunResult | null; onAnswer?: (text: string) => void }) {
  const lines: { text: string; tone: "err" | "muted" }[] = [];

  if (result) {
    if (!result.events.length && !result.error && !result.waiting) {
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
          {result && (result.events.length > 0 || result.waiting) && (
            <div className="whitespace-pre-wrap break-words">
              {result.events.map((ev, i) =>
                ev.k === "answer" ? (
                  <span key={i} className="text-sky-300">
                    {ev.text + "\n"}
                  </span>
                ) : (
                  <span key={i} className="text-emerald-200">
                    {ev.text}
                  </span>
                ),
              )}
              {result.waiting &&
                (onAnswer ? (
                  <AnswerInput key={result.events.length} onAnswer={onAnswer} />
                ) : (
                  <span className="italic text-slate-500">(программа ждёт ответа)</span>
                ))}
            </div>
          )}
          {result?.waiting && onAnswer && (
            <div className="mt-2 text-xs text-slate-500">Программа ждёт ответа — напиши его и нажми Enter</div>
          )}
          {lines.map((l, i) => (
            <div
              key={i}
              className={`whitespace-pre-wrap break-words ${l.tone === "err" ? "text-rose-300" : "italic text-slate-500"}`}
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
  lang = "py",
}: {
  value: string;
  onChange: (v: string) => void;
  onRun: () => void;
  disabled?: boolean;
  /** py: 4-space indent after ":"; js: 2-space indent after "{". */
  lang?: "py" | "js";
}) {
  const unit = lang === "js" ? "  " : "    ";
  const opens = lang === "js" ? /[{(]\s*(\/\/.*)?$/ : /:\s*(#.*)?$/;
  const lineCount = Math.max(value.split("\n").length, 3);

  function insert(t: HTMLTextAreaElement, text: string, removeBefore = 0) {
    const a = t.selectionStart - removeBefore;
    const b = t.selectionEnd;
    onChange(value.slice(0, a) + text + value.slice(b));
    requestAnimationFrame(() => t.setSelectionRange(a + text.length, a + text.length));
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    const t = e.currentTarget;
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onRun();
      return;
    }
    // Tab puts 4 spaces — the indent Python expects inside if, for and while
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      insert(t, unit);
      return;
    }
    // Enter keeps the indent of the line; after a line ending with ":" it adds one more level
    if (e.key === "Enter" && !e.shiftKey) {
      const lineStart = value.lastIndexOf("\n", t.selectionStart - 1) + 1;
      const current = value.slice(lineStart, t.selectionStart);
      const indent = /^ */.exec(current)![0];
      const extra = opens.test(current) ? unit : "";
      if (indent || extra) {
        e.preventDefault();
        insert(t, "\n" + indent + extra);
      }
      return;
    }
    // Backspace right after an indent removes a whole level
    if (e.key === "Backspace" && t.selectionStart === t.selectionEnd) {
      const lineStart = value.lastIndexOf("\n", t.selectionStart - 1) + 1;
      const before = value.slice(lineStart, t.selectionStart);
      if (before.length >= unit.length && /^ +$/.test(before) && before.length % unit.length === 0) {
        e.preventDefault();
        insert(t, "", unit.length);
      }
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
