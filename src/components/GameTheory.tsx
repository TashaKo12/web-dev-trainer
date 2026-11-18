import { BookOpen } from "lucide-react";

// Short theory for the children's games (1 ступень): how the idea of a level looks in a real program.

export type CodeExample = { code: string; out?: string; note?: string };
export type GameTheory = { title: string; text: string[]; examples: CodeExample[] };

/** A piece of code (and what the program prints). Fixed colours: it looks the same in the light and the dark theme. */
export function CodeBox({ code, out, note }: CodeExample) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-[#334155] bg-[#0f172a] text-left">
      {note && <p className="border-b border-[#334155] bg-[#1e293b] px-4 py-2 text-sm font-semibold text-[#cbd5e1]">{note}</p>}
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[0.95rem] leading-relaxed text-[#a7f3d0]">{code}</pre>
      {out && (
        <div className="border-t border-[#334155] px-4 py-2">
          <p className="text-xs font-bold uppercase tracking-wide text-[#94a3b8]">Результат</p>
          <pre className="font-mono text-[0.95rem] leading-relaxed text-[#fde68a]">{out}</pre>
        </div>
      )}
    </div>
  );
}

export function TheoryCard({ theory, onDone, doneLabel = "Понятно, к заданиям!" }: { theory: GameTheory; onDone: () => void; doneLabel?: string }) {
  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-[#e6e7ee] bg-white p-5 shadow-sm sm:p-8">
      <p className="mb-1 inline-flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wide text-violet-500">
        <BookOpen className="h-4 w-4" strokeWidth={2.4} /> Теория программиста
      </p>
      <h2 className="mb-4 text-2xl font-extrabold text-slate-800 sm:text-3xl">{theory.title}</h2>
      <div className="space-y-3 text-lg leading-relaxed text-slate-700">
        {theory.text.map((t) => (
          <p key={t}>{t}</p>
        ))}
      </div>
      <div className="mt-5 space-y-4">
        {theory.examples.map((ex) => (
          <CodeBox key={ex.code} {...ex} />
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <button type="button" onClick={onDone} className="rounded-lg bg-[#4f1fd1] hover:bg-[#4318b8] px-8 py-3 text-lg font-extrabold text-white shadow">
          {doneLabel}
        </button>
      </div>
    </div>
  );
}

/** The small «Теория» button next to a level title. */
export function TheoryButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border-2 border-violet-200 bg-white px-4 py-1.5 text-sm font-extrabold text-violet-600 hover:border-violet-400"
    >
      <BookOpen className="h-4 w-4" strokeWidth={2.4} /> Теория
    </button>
  );
}
