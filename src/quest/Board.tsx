import { useRef } from "react";
import { PixelFigure } from "../components/PixelBuddy";
import { key, type Frame, type Grid } from "./engine";

// The map of a level: floor tiles, walls, crystals, sprouts, a diary page, the exit — and Pixel walking on it.

const ITEM: Record<string, string> = { "*": "💎", D: "📜" };

export function Board({ grid, frame, exit, mood }: { grid: Grid; frame: Frame; exit: string; mood: string }) {
  const { w, h } = grid;
  const pct = (n: number, of: number) => `${(n / of) * 100}%`;
  // the arrow turns the short way: keep a running angle instead of jumping from 270° back to 0°
  const angle = useRef(frame.dir * 90);
  const target = frame.dir * 90;
  const delta = ((((target - angle.current) % 360) + 540) % 360) - 180;
  angle.current += delta;
  return (
    <div
      className="relative mx-auto w-full overflow-hidden rounded-3xl border-4 border-slate-700 bg-slate-800 p-1.5 shadow-inner"
      style={{ maxWidth: Math.min(w * 96, 480) }}
    >
      <div className="relative" style={{ aspectRatio: `${w} / ${h}` }}>
        {grid.cells.map((row, y) =>
          row.map((c, x) => {
            const k = key(x, y);
            const wall = c === "#";
            return (
              <div
                key={k}
                className="absolute p-[3px]"
                style={{ left: pct(x, w), top: pct(y, h), width: pct(1, w), height: pct(1, h) }}
              >
                <div
                  className={`flex h-full w-full items-center justify-center rounded-xl text-[clamp(1.2rem,5vw,2.4rem)] ${
                    wall
                      ? "bg-[repeating-linear-gradient(45deg,#475569_0_8px,#3f4b5e_8px_16px)] shadow-[inset_0_-4px_0_rgb(0_0_0/0.25)]"
                      : c === "F"
                        ? "bg-emerald-200/90"
                        : "bg-slate-200/90"
                  }`}
                >
                  {c === "F" && <span className="drop-shadow">{exit}</span>}
                  {(c === "*" || c === "D") && !frame.got.includes(k) && <span className="animate-bounce drop-shadow [animation-duration:2s]">{ITEM[c]}</span>}
                  {c === "P" && <span className={frame.watered.includes(k) ? "animate-[quest-bloom_0.6s_ease-out]" : "opacity-90"}>{frame.watered.includes(k) ? "🌷" : "🌱"}</span>}
                </div>
              </div>
            );
          }),
        )}

        {/* Pixel: moves with a transition; the arrow around him shows where he is looking */}
        <div
          className="absolute transition-[left,top] duration-300 ease-in-out"
          style={{ left: pct(frame.x, w), top: pct(frame.y, h), width: pct(1, w), height: pct(1, h) }}
        >
          <div className="absolute inset-0 transition-transform duration-300" style={{ transform: `rotate(${angle.current}deg)` }}>
            <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[35%] text-[clamp(0.7rem,2.6vw,1.1rem)] font-black text-amber-300 drop-shadow">
              ▲
            </span>
          </div>
          <div
            className={`pixel-bot quest-bot absolute inset-[8%] ${frame.event === "bump" ? "act-shake" : frame.event === "win" ? "act-jump" : ""}`}
            data-mood={mood}
          >
            <PixelFigure />
          </div>
        </div>
      </div>
    </div>
  );
}
