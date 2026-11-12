import { useMemo, useRef, useState, type ReactNode } from "react";
import { Eye } from "lucide-react";
import { TopicSlider } from "../components/TopicSlider";
import { TrainerHero } from "../components/TrainerHero";
import { SectionHeading } from "../components/SectionHeading";
import { CompletionBanner } from "../components/CompletionBanner";
import { LevelShell } from "../components/LevelShell";
import { useTaskStepper } from "../components/useTaskStepper";
import { TrueFalseDeck, type TrueFalseStatement } from "../components/TrueFalseDeck";
import { trainers } from "../trainers/registry";
import type { TrainerId } from "../lib/progress";

// One web topic built from data: theory with live examples → practice → true/false cards.
// "write" levels are checked for real: the student's CSS is applied in the preview and the
// browser's own computed style of the target element is read — so any correct spelling passes.

export function Code({ children }: { children: ReactNode }) {
  return <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-indigo-700">{children}</code>;
}

const BASE = `<style>
  body { font-family: system-ui, sans-serif; margin: 12px; color: #1e293b; background: #fff; line-height: 1.45; }
  img { max-width: 100%; }
</style>`;

function page(html: string, css: string) {
  return `${BASE}<style>${css}</style>${html}`;
}

/** A live preview; `onReady` gets the iframe document once it is loaded. */
function Preview({ html, css, height = 180, onReady }: { html: string; css: string; height?: number; onReady?: (doc: Document) => void }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const doc = useMemo(() => page(html, css), [html, css]);
  return (
    <iframe
      ref={ref}
      title="Результат"
      sandbox="allow-same-origin"
      srcDoc={doc}
      onLoad={() => ref.current?.contentDocument && onReady?.(ref.current.contentDocument)}
      style={{ background: "#fff", height }}
      className="w-full rounded-2xl border-2 border-slate-200"
    />
  );
}

export type Demo = { html: string; css: string; height?: number };
export type TheoryPart = { title: string; text: ReactNode; demo?: Demo; code?: string };

export type CssLevel =
  | { kind: "choice"; badge?: string; prompt: string; demo?: Demo; options: string[]; correct: number; explain: string }
  | {
      kind: "write";
      badge?: string;
      prompt: string;
      html: string;
      /** CSS already on the page (not editable). */
      css?: string;
      /** What the student starts with in the editor. */
      start: string;
      /** Selector of the element whose style is checked. */
      target: string;
      /** Each computed property must satisfy its test. */
      expect: Record<string, (value: string, el: Element) => boolean>;
      /** An extra condition on the written code, e.g. which units to use. */
      rule?: (code: string) => boolean;
      ruleHint?: string;
      height?: number;
      explain: string;
    }
  | {
      kind: "html";
      badge?: string;
      prompt: string;
      start: string;
      /** Returns a hint when something is missing, or null when correct. */
      check: (doc: Document, code: string) => string | null;
      explain: string;
    };

function Theory({ parts }: { parts: TheoryPart[] }) {
  return (
    <div className="space-y-5">
      {parts.map((p, i) => (
        <div key={p.title} className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-7 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-indigo-500">Шаг {i + 1}</p>
          <h3 className="mb-2 text-lg font-extrabold text-slate-800">{p.title}</h3>
          <p className="text-sm leading-relaxed text-slate-600">{p.text}</p>
          {p.demo && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <pre className="overflow-x-auto rounded-2xl bg-slate-900 p-4 font-mono text-[13px] leading-relaxed text-slate-100">
                {p.demo.css.trim() ? `/* style.css */\n${p.demo.css.trim()}\n\n` : ""}
                {`<!-- index.html -->\n${p.demo.html.trim()}`}
              </pre>
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                  <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                  Так видит браузер
                </p>
                <Preview html={p.demo.html} css={p.demo.css} height={p.demo.height} />
              </div>
            </div>
          )}
          {p.code && <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-900 p-4 font-mono text-[13px] leading-relaxed text-slate-100">{p.code}</pre>}
        </div>
      ))}
    </div>
  );
}

const btn = "rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40";

function ChoiceLevel({ level, onResult }: { level: Extract<CssLevel, { kind: "choice" }>; onResult: (ok: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-slate-700">{level.prompt}</p>
      {level.demo && <Preview html={level.demo.html} css={level.demo.css} height={level.demo.height ?? 140} />}
      <div className="grid gap-2 sm:grid-cols-2">
        {level.options.map((o, i) => (
          <button
            key={o}
            type="button"
            disabled={done}
            onClick={() => setPicked(i)}
            className={`rounded-2xl border-2 px-4 py-3 text-left font-mono text-sm transition ${
              done && i === level.correct
                ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                : done && i === picked
                  ? "border-rose-300 bg-rose-50 text-rose-700"
                  : picked === i
                    ? "border-indigo-400 bg-indigo-50 text-indigo-800"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
      {!done && (
        <div className="text-center">
          <button
            type="button"
            disabled={picked === null}
            className={btn}
            onClick={() => {
              setDone(true);
              onResult(picked === level.correct);
            }}
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function WriteLevel({ level, onResult }: { level: Extract<CssLevel, { kind: "write" }>; onResult: (ok: boolean) => void }) {
  const [code, setCode] = useState(level.start);
  const [done, setDone] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const doc = useRef<Document | null>(null);

  function check() {
    const d = doc.current;
    const el = d?.querySelector(level.target);
    if (!d || !el) return;
    const style = d.defaultView!.getComputedStyle(el);
    const ok = Object.entries(level.expect).every(([prop, test]) => test(style.getPropertyValue(prop).trim(), el));
    const ruleOk = level.rule ? level.rule(code) : true;
    setNote(ok && !ruleOk ? level.ruleHint ?? null : null);
    setDone(true);
    onResult(ok && ruleOk);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-slate-700">{level.prompt}</p>
      <div className="grid gap-3 lg:grid-cols-2">
        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">style.css</p>
          {level.css && <pre className="rounded-t-2xl bg-slate-800 px-3 py-2 font-mono text-[12px] text-slate-400">{level.css.trim()}</pre>}
          <textarea
            value={code}
            disabled={done}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                if (!done) check();
              }
            }}
            spellCheck={false}
            rows={Math.max(6, code.split("\n").length + 1)}
            aria-label="Редактор CSS"
            className={`w-full resize-y border-2 border-slate-200 bg-slate-900 p-3 font-mono text-[13px] leading-relaxed text-slate-100 outline-none focus:border-indigo-400 ${level.css ? "rounded-b-2xl" : "rounded-2xl"}`}
          />
        </div>
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
            <Eye className="h-3.5 w-3.5" strokeWidth={2} />
            Так видит браузер
          </p>
          <Preview html={level.html} css={`${level.css ?? ""}\n${code}`} height={level.height ?? 200} onReady={(d) => (doc.current = d)} />
        </div>
      </div>
      {note && <p className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800">Вид верный, но по условию: {note}</p>}
      {!done && (
        <div className="text-center">
          <button type="button" className={btn} onClick={check} disabled={!code.trim()}>
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function HtmlLevel({ level, onResult }: { level: Extract<CssLevel, { kind: "html" }>; onResult: (ok: boolean) => void }) {
  const [code, setCode] = useState(level.start);
  const [done, setDone] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  function check() {
    const h = level.check(new DOMParser().parseFromString(code, "text/html"), code);
    setHint(h);
    setDone(true);
    onResult(h === null);
  }
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-slate-700">{level.prompt}</p>
      <div className="grid gap-3 lg:grid-cols-2">
        <textarea
          value={code}
          disabled={done}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          rows={Math.max(8, code.split("\n").length + 1)}
          aria-label="Редактор HTML"
          className="w-full resize-y rounded-2xl border-2 border-slate-200 bg-slate-900 p-3 font-mono text-[13px] leading-relaxed text-slate-100 outline-none focus:border-indigo-400"
        />
        <Preview html={code} css="" height={220} />
      </div>
      {hint && <p className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800">{hint}</p>}
      {!done && (
        <div className="text-center">
          <button type="button" className={btn} onClick={check} disabled={!code.trim()}>
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function Tasks({ id, levels }: { id: TrainerId; levels: CssLevel[] }) {
  const stepper = useTaskStepper(levels.length, id);
  const level = levels[stepper.index];
  const key = stepper.index;
  if (stepper.allAnswered) return <CompletionBanner score={stepper.score} total={levels.length} onRestart={() => stepper.restart()} />;
  const badge = level.badge ?? (level.kind === "choice" ? "выбери из списка" : level.kind === "write" ? "напиши CSS" : "напиши HTML");
  return (
    <LevelShell
      total={levels.length}
      index={stepper.index}
      statuses={stepper.statuses}
      status={stepper.status}
      isLast={stepper.isLast}
      badge={badge}
      explain={level.explain}
      onJump={stepper.goTo}
      onNext={stepper.goNext}
    >
      {level.kind === "choice" && <ChoiceLevel key={key} level={level} onResult={(c) => stepper.markResult(c)} />}
      {level.kind === "write" && <WriteLevel key={key} level={level} onResult={(c) => stepper.markResult(c)} />}
      {level.kind === "html" && <HtmlLevel key={key} level={level} onResult={(c) => stepper.markResult(c)} />}
    </LevelShell>
  );
}

export type CssTopicData = {
  id: TrainerId;
  theory: { title: string; description: string; parts: TheoryPart[] };
  levels: CssLevel[];
  cards: TrueFalseStatement[];
};

export function CssTopicPage({ data }: { data: CssTopicData }) {
  const meta = trainers.find((t) => t.id === data.id)!;
  return (
    <TopicSlider>
      <TrainerHero icon={meta.icon} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading kicker="Теория" title={data.theory.title} description={data.theory.description} />
      <div className="mb-10">
        <Theory parts={data.theory.parts} />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description={`${data.levels.length} уровней — выбирай ответ и пиши код сам, результат сразу видно.`} />
      <div className="mb-10">
        <Tasks id={data.id} levels={data.levels} />
      </div>
      <SectionHeading kicker="Проверь себя" title="Верно или неверно?" description="Пролистай 10 карточек — угадай, где правда, а где нет." />
      <TrueFalseDeck statements={data.cards} accent={meta.gradient} />
    </TopicSlider>
  );
}

/** Helpers for checks on computed styles. */
export const px = (v: string) => parseFloat(v);
export const near = (v: string, target: number, tol = 1) => Math.abs(px(v) - target) <= tol;

/** Width of an element as a share of its parent's content width. */
export const shareOfParent = (el: Element) => {
  const parent = el.parentElement!;
  const cs = parent.ownerDocument.defaultView!.getComputedStyle(parent);
  const inner = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  return el.getBoundingClientRect().width / inner;
};

/** Centred with margin auto: equal side margins, clearly bigger than the page's own 12px margin. */
export const centered = (el: Element, min = 15) => {
  const cs = el.ownerDocument.defaultView!.getComputedStyle(el);
  const l = parseFloat(cs.marginLeft);
  const r = parseFloat(cs.marginRight);
  return l > min && Math.abs(l - r) < 2;
};
