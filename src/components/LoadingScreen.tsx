import { useEffect, useState } from "react";

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const startFade = setTimeout(() => setFading(true), 1300);
    const finish = setTimeout(onDone, 1700);
    return () => {
      clearTimeout(startFade);
      clearTimeout(finish);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#0b0a16] via-[#120f24] to-[#0a0e1a] transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <svg viewBox="0 0 300 300" className="h-56 w-56 sm:h-64 sm:w-64" aria-hidden="true">
        <g transform="translate(150,150)">
          <circle
            cx="0"
            cy="0"
            r="125"
            fill="none"
            stroke="#6366f1"
            strokeOpacity="0.45"
            strokeWidth="1"
            strokeDasharray="2 7"
            className="loading-spin-slow"
            style={{ transformOrigin: "center" }}
          />
          <polygon
            points="80,0 40,69.3 -40,69.3 -80,0 -40,-69.3 40,-69.3"
            fill="none"
            stroke="#818cf8"
            strokeOpacity="0.85"
            strokeWidth="1.25"
            className="loading-spin-medium"
            style={{ transformOrigin: "center" }}
          />
          <polygon
            points="0,-55 47.6,27.5 -47.6,27.5"
            fill="none"
            stroke="#c4b5fd"
            strokeOpacity="0.9"
            strokeWidth="1.25"
            strokeDasharray="3 4"
            className="loading-spin-fast"
            style={{ transformOrigin: "center" }}
          />
          <circle cx="0" cy="0" r="30" fill="none" stroke="#6366f1" strokeOpacity="0.3" strokeWidth="1" />
          <circle cx="0" cy="0" r="4" fill="#a5b4fc" className="loading-pulse-dot" style={{ transformOrigin: "center" }} />
        </g>
      </svg>

      <p className="mt-8 text-lg font-extrabold tracking-wide text-slate-100">Тренажёр веб-разработки</p>
      <p className="mb-6 mt-1 text-sm text-slate-400">Загружаем интерактивные задания…</p>

      <div className="h-px w-48 overflow-hidden bg-slate-700/60">
        <div className="loading-progress-fill h-full w-full bg-indigo-400" />
      </div>
    </div>
  );
}
