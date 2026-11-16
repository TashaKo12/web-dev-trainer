import { useState } from "react";
import { ChevronRight, RadioTower } from "lucide-react";
import { PixelFigure } from "../components/PixelBuddy";
import type { Line, Speaker } from "./data";

// The story scenes: one line at a time, with the speaker's picture.

export function BoltFigure({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 140" className={className} aria-hidden="true">
      <ellipse cx="60" cy="136" rx="34" ry="4" fill="rgb(15 23 42 / 0.25)" />
      {/* mop */}
      <rect x="96" y="30" width="5" height="96" rx="2.5" fill="#a16207" transform="rotate(12 98 78)" />
      <path d="M100 122 q8 10 -2 14 q-14 2 -16 -6 q4 -8 18 -8z" fill="#7dd3fc" />
      {/* wheels */}
      <circle cx="40" cy="124" r="10" fill="#334155" />
      <circle cx="80" cy="124" r="10" fill="#334155" />
      <circle cx="40" cy="124" r="4" fill="#94a3b8" />
      <circle cx="80" cy="124" r="4" fill="#94a3b8" />
      {/* body */}
      <rect x="22" y="62" width="76" height="58" rx="12" fill="#f97316" />
      <rect x="32" y="74" width="56" height="10" rx="5" fill="#fed7aa" />
      <circle cx="40" cy="100" r="5" fill="#fde047" />
      <circle cx="56" cy="100" r="5" fill="#fde047" opacity="0.6" />
      {/* head */}
      <rect x="30" y="18" width="60" height="44" rx="10" fill="#fb923c" />
      <rect x="38" y="26" width="44" height="26" rx="8" fill="#1e293b" />
      <circle cx="51" cy="38" r="5" fill="#fde047" />
      <circle cx="69" cy="38" r="5" fill="#fde047" />
      <path d="M46 31 l9 3 M74 31 l-9 3" stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M52 47 h16" stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="56" y="6" width="8" height="12" rx="2" fill="#94a3b8" />
      <circle cx="60" cy="5" r="4" fill="#ef4444" />
      {/* arms */}
      <rect x="10" y="70" width="12" height="30" rx="6" fill="#fb923c" />
      <rect x="98" y="70" width="12" height="26" rx="6" fill="#fb923c" />
    </svg>
  );
}

const WHO: Record<Speaker, { name: string; cls: string }> = {
  pixel: { name: "Пиксель", cls: "text-violet-600" },
  bolt: { name: "Болтик", cls: "text-orange-600" },
  station: { name: "Голос станции", cls: "text-sky-600" },
  note: { name: "Записка Создательницы", cls: "text-amber-700" },
};

export function Portrait({ who, mood = "happy" }: { who: Speaker; mood?: string }) {
  if (who === "pixel")
    return (
      <div className="pixel-bot w-20 sm:w-24" data-mood={mood}>
        <PixelFigure />
      </div>
    );
  if (who === "bolt") return <BoltFigure className="w-20 sm:w-24" />;
  if (who === "station")
    return (
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-100 text-sky-600 sm:h-24 sm:w-24">
        <RadioTower className="h-10 w-10 animate-pulse" strokeWidth={1.75} />
      </div>
    );
  return <div className="flex h-20 w-20 items-center justify-center text-6xl sm:h-24 sm:w-24">📜</div>;
}

export function Dialogue({ lines, onDone, doneLabel = "Поехали!" }: { lines: Line[]; onDone: () => void; doneLabel?: string }) {
  const [i, setI] = useState(0);
  const line = lines[i];
  const last = i === lines.length - 1;
  const note = line.who === "note";
  return (
    <div className="mx-auto max-w-2xl">
      <div
        key={i}
        className={`animate-fade-in flex items-start gap-4 rounded-3xl border p-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] sm:gap-6 sm:p-7 ${
          note ? "border-amber-200 bg-amber-50" : "border-white/70 bg-white/95"
        }`}
      >
        <div className="shrink-0">
          <Portrait who={line.who} mood={line.who === "pixel" && /\?|Ой|темно/.test(line.text) ? "surprised" : "happy"} />
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <p className={`mb-1.5 text-sm font-extrabold uppercase tracking-wide ${WHO[line.who].cls}`}>{WHO[line.who].name}</p>
          <p className={`text-lg leading-relaxed text-slate-700 sm:text-xl ${note ? "font-serif italic" : ""}`}>{line.text}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex gap-1.5" aria-hidden="true">
          {lines.map((_, k) => (
            <span key={k} className={`h-2 w-2 rounded-full ${k <= i ? "bg-violet-500" : "bg-slate-300"}`} />
          ))}
        </div>
        <div className="flex gap-2">
          {!last && (
            <button type="button" onClick={onDone} className="rounded-full px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-600">
              Пропустить
            </button>
          )}
          <button
            type="button"
            onClick={() => (last ? onDone() : setI(i + 1))}
            className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-2.5 text-base font-extrabold text-white shadow"
          >
            {last ? doneLabel : "Дальше"}
            <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
