import { useState, type ReactNode } from "react";
import { SectionHeading } from "./SectionHeading";

// Extra theory steps for an HTML/CSS topic: everything its levels and cards ask is explained here first.
// Each step is its own slide (with its own read timer); examples show the code and how a browser draws it.

export type WebExample = {
  /** The code shown to the student. */
  code: string;
  /** File name over the code. */
  file?: string;
  /** What the browser draws: an HTML fragment (with a <style> block if needed). Without it, only the code is shown. */
  preview?: string;
  note?: string;
  bad?: boolean;
};
export type WebPart = { title: string; text: ReactNode; examples?: WebExample[] };

export const C = ({ children }: { children: ReactNode }) => (
  <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-violet-700">{children}</code>
);

const BASE = "<style>html,body{margin:0}body{padding:14px;font:15px/1.5 system-ui,sans-serif;color:#1e293b;background:#fff}</style>";

function Preview({ html }: { html: string }) {
  const [height, setHeight] = useState(80);
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <p className="border-b border-slate-200 bg-slate-100 px-4 py-1.5 text-[0.6875rem] font-bold text-slate-500">В браузере</p>
      <iframe
        title="Как это выглядит в браузере"
        sandbox="allow-same-origin"
        srcDoc={BASE + html}
        style={{ height }}
        className="block w-full"
        onLoad={(e) => {
          const doc = e.currentTarget.contentDocument;
          if (doc) setHeight(Math.min(Math.max(doc.documentElement.scrollHeight, 48), 420));
        }}
      />
    </div>
  );
}

function Example({ e }: { e: WebExample }) {
  return (
    <div className={`grid gap-3 ${e.preview ? "md:grid-cols-2" : ""}`}>
      <div className={`overflow-hidden rounded-2xl border ${e.bad ? "border-rose-200" : "border-slate-200"}`}>
        <p className={`px-4 py-1.5 font-mono text-[0.6875rem] font-bold ${e.bad ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-500"}`}>
          {e.bad ? "✗ " : ""}
          {e.file ?? "код"}
        </p>
        <pre className="whitespace-pre-wrap break-words bg-slate-900 px-4 py-3 font-mono text-[0.8125rem] leading-relaxed text-slate-100">{e.code}</pre>
        {e.note && <p className="border-t border-slate-200 bg-white px-4 py-2 text-xs text-slate-500">{e.note}</p>}
      </div>
      {e.preview && <Preview html={e.preview} />}
    </div>
  );
}

function PartCard({ p }: { p: WebPart }) {
  return (
    <div className="rounded-xl border border-[#e6e7ee] bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800">
      <div className="mb-4 space-y-3 leading-relaxed text-slate-600">{p.text}</div>
      {p.examples && (
        <div className="space-y-4">
          {p.examples.map((e) => (
            <Example key={e.code} e={e} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * The steps as slides, to put right after a topic's first theory slide. A flat keyed array:
 * TopicSlider starts a new slide at every SectionHeading among its direct children.
 */
export function extraTheorySlides(parts: WebPart[], before = 1): ReactNode[] {
  const total = parts.length + before;
  return parts.flatMap((p, i) => [
    <SectionHeading key={`h:${p.title}`} kicker="Теория" title={p.title} description={`Шаг ${before + i + 1} из ${total}`} />,
    <div key={`b:${p.title}`} className="mb-10">
      <PartCard p={p} />
    </div>,
  ]);
}
