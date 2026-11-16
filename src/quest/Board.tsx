import { useEffect, useRef, useState } from "react";
import { PixelFigure } from "../components/PixelBuddy";
import { key, type Frame, type Grid } from "./engine";

// The map of a level: floor tiles, walls, crystals, sprouts, gear parts, a diary page, the exit — and Pixel walking on it.
// The map fits the window: as wide as its column allows, but never taller than about 70% of the screen.

const ITEM: Record<string, string> = { "*": "💎", D: "📜" };
const MAX_CELL = 150;
const FRAME = 20; // the board's border and padding, in px

/** The size of one cell that fits the column width and the window height. */
function useCellSize(w: number, h: number) {
  const box = useRef<HTMLDivElement>(null);
  const [cell, setCell] = useState(64);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const byWidth = (el.clientWidth - FRAME) / w;
      const byHeight = (window.innerHeight * 0.7 - FRAME) / h;
      setCell(Math.max(36, Math.floor(Math.min(byWidth, byHeight, MAX_CELL))));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [w, h]);
  return { box, cell };
}

export function Board({
  grid,
  frame,
  exit,
  mood,
  item = "⚙️",
  visible = null,
}: {
  grid: Grid;
  frame: Frame;
  exit: string;
  mood: string;
  /** What the "G" items look like. */
  item?: string;
  /** In a dark mine: the cells that can be seen (null — everything is lit). */
  visible?: Set<string> | null;
}) {
  const { w, h } = grid;
  const pct = (n: number, of: number) => `${(n / of) * 100}%`;
  const { box, cell } = useCellSize(w, h);
  // the arrow turns the short way: keep a running angle instead of jumping from 270° back to 0°
  const angle = useRef(frame.dir * 90);
  const target = frame.dir * 90;
  const delta = ((((target - angle.current) % 360) + 540) % 360) - 180;
  angle.current += delta;
  return (
    <div ref={box} className="w-full">
    <div
      className="relative mx-auto overflow-hidden rounded-3xl border-4 border-slate-700 bg-slate-800 p-1.5 shadow-inner"
      style={{ width: cell * w + FRAME, fontSize: Math.round(cell * 0.5) }}
    >
      <div className="relative" style={{ aspectRatio: `${w} / ${h}` }}>
        {grid.cells.map((row, y) =>
          row.map((c, x) => {
            const k = key(x, y);
            const wall = c === "#";
            if (visible && !visible.has(k))
              return (
                <div key={k} className="absolute p-[3px]" style={{ left: pct(x, w), top: pct(y, h), width: pct(1, w), height: pct(1, h) }}>
                  <div className="h-full w-full rounded-xl bg-slate-950/90" />
                </div>
              );
            return (
              <div
                key={k}
                className="absolute p-[3px]"
                style={{ left: pct(x, w), top: pct(y, h), width: pct(1, w), height: pct(1, h) }}
              >
                <div
                  className={`flex h-full w-full items-center justify-center rounded-xl ${
                    wall
                      ? "bg-[repeating-linear-gradient(45deg,#475569_0_8px,#3f4b5e_8px_16px)] shadow-[inset_0_-4px_0_rgb(0_0_0/0.25)]"
                      : c === "B"
                        ? "bg-[repeating-linear-gradient(90deg,#fecaca_0_6px,#ef4444_6px_9px)] shadow-[0_0_14px_#ef4444]"
                        : c === "F"
                          ? "bg-emerald-200/90"
                          : "bg-slate-200/90"
                  }`}
                  title={c === "B" ? "Лазерные ворота закрыты" : undefined}
                >
                  {c === "F" && <span className="drop-shadow">{exit}</span>}
                  {(c === "*" || c === "D") && !frame.got.includes(k) && <span className="animate-bounce drop-shadow [animation-duration:2s]">{ITEM[c]}</span>}
                  {c === "G" && !frame.got.includes(k) && (
                    <span className={`inline-block drop-shadow ${item === "⚙️" ? "animate-[spin_6s_linear_infinite]" : "animate-bounce [animation-duration:2s]"}`}>{item}</span>
                  )}
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
            <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[35%] text-[0.45em] font-black text-amber-300 drop-shadow">
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
    </div>
  );
}
