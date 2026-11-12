import { useEffect, useState } from "react";

function polygonPoints(sides: number, r: number, rotateDeg = -90) {
  const rotate = (rotateDeg * Math.PI) / 180;
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = rotate + (i * 2 * Math.PI) / sides;
    pts.push(`${(r * Math.cos(angle)).toFixed(1)},${(r * Math.sin(angle)).toFixed(1)}`);
  }
  return pts.join(" ");
}

type Shape = {
  cx: number;
  cy: number;
  r: number;
  sides?: number; // omit for a circle
  color: string;
  opacity: number;
  strokeWidth?: number;
  dashed?: boolean;
  spin?: "cw" | "ccw";
  duration?: string;
};

const SHAPES: Shape[] = [
  // the central cluster
  { cx: 600, cy: 420, r: 340, color: "#6366f1", opacity: 0.22, dashed: true, spin: "cw", duration: "40s" },
  { cx: 600, cy: 420, r: 255, sides: 6, color: "#818cf8", opacity: 0.4, spin: "ccw", duration: "32s" },
  { cx: 600, cy: 420, r: 140, sides: 3, color: "#c4b5fd", opacity: 0.55, dashed: true, spin: "cw", duration: "17s" },
  { cx: 600, cy: 420, r: 60, color: "#6366f1", opacity: 0.3 },

  // scattered around the canvas
  { cx: 150, cy: 150, r: 95, color: "#818cf8", opacity: 0.16, dashed: true, spin: "ccw", duration: "26s" },
  { cx: 1080, cy: 170, r: 75, sides: 6, color: "#a5b4fc", opacity: 0.2, spin: "cw", duration: "22s" },
  { cx: 190, cy: 660, r: 65, sides: 3, color: "#c4b5fd", opacity: 0.22, dashed: true, spin: "ccw", duration: "15s" },
  { cx: 1120, cy: 640, r: 130, color: "#6366f1", opacity: 0.14, spin: "cw", duration: "36s" },
  { cx: 950, cy: 520, r: 55, sides: 4, color: "#818cf8", opacity: 0.2, dashed: true, spin: "ccw", duration: "20s" },
  { cx: 290, cy: 730, r: 45, color: "#a5b4fc", opacity: 0.3, spin: "cw", duration: "13s" },
  { cx: 70, cy: 470, r: 42, sides: 6, color: "#c4b5fd", opacity: 0.2, dashed: true, spin: "ccw", duration: "24s" },
  { cx: 920, cy: 90, r: 30, color: "#6366f1", opacity: 0.38, spin: "cw", duration: "11s" },
  { cx: 1170, cy: 420, r: 38, sides: 3, color: "#818cf8", opacity: 0.24, dashed: true, spin: "ccw", duration: "16s" },
  { cx: 520, cy: 70, r: 22, color: "#a5b4fc", opacity: 0.42 },
  { cx: 730, cy: 740, r: 18, color: "#c4b5fd", opacity: 0.3 },
  { cx: 1030, cy: 740, r: 55, sides: 6, color: "#6366f1", opacity: 0.15, dashed: true, spin: "cw", duration: "28s" },
  { cx: 60, cy: 740, r: 60, color: "#818cf8", opacity: 0.12, spin: "ccw", duration: "33s" },
];

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
      className={`fixed inset-0 z-50 overflow-hidden bg-gradient-to-b from-[#0b0a16] via-[#120f24] to-[#0a0e1a] transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <svg
        viewBox="0 0 1200 840"
        preserveAspectRatio="xMidYMid slice"
        className="loading-scene absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {SHAPES.map((s, i) => (
          <g key={i} transform={`translate(${s.cx},${s.cy})`}>
            {s.sides ? (
              <polygon
                points={polygonPoints(s.sides, s.r)}
                fill="none"
                stroke={s.color}
                strokeOpacity={s.opacity}
                strokeWidth={s.strokeWidth ?? 1.25}
                strokeDasharray={s.dashed ? "3 6" : undefined}
                style={
                  s.spin
                    ? { transformOrigin: "center", animation: `spin-${s.spin} ${s.duration ?? "24s"} linear infinite` }
                    : undefined
                }
              />
            ) : (
              <circle
                cx={0}
                cy={0}
                r={s.r}
                fill="none"
                stroke={s.color}
                strokeOpacity={s.opacity}
                strokeWidth={s.strokeWidth ?? 1}
                strokeDasharray={s.dashed ? "2 7" : undefined}
                style={
                  s.spin
                    ? { transformOrigin: "center", animation: `spin-${s.spin} ${s.duration ?? "24s"} linear infinite` }
                    : undefined
                }
              />
            )}
          </g>
        ))}
      </svg>

      <div className="relative flex h-full flex-col items-center justify-center">
        <p className="text-lg font-extrabold tracking-wide text-slate-100">Тренажёр веб-разработки</p>
        <p className="mb-6 mt-1 text-sm text-slate-400">Загружаем интерактивные задания…</p>

        <div className="h-px w-48 overflow-hidden bg-slate-700/60">
          <div className="loading-progress-fill h-full w-full bg-indigo-400" />
        </div>
      </div>
    </div>
  );
}
