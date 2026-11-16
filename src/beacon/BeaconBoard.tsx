import { useRef } from "react";
import { PixelFigure } from "../components/PixelBuddy";
import { useCellSize } from "../quest/Board";
import { key, type Grid, type State } from "./engine";

// The deck of the lighthouse: dark panels, lamps (dim until lit), batteries, sockets — and Pixel.
// Fixed colours: the night sky looks the same in the light and the dark theme.

export function BeaconBoard({ grid, state }: { grid: Grid; state: State }) {
  const { w, h } = grid;
  const pct = (n: number, of: number) => `${(n / of) * 100}%`;
  const { box, cell } = useCellSize(w, h);
  const angle = useRef(state.dir * 90);
  const delta = ((((state.dir * 90 - angle.current) % 360) + 540) % 360) - 180;
  angle.current += delta;

  return (
    <div ref={box} className="w-full">
      <div
        className="relative mx-auto overflow-hidden rounded-3xl border-4 border-[#312e81] bg-[#0b1026] p-1.5 shadow-[inset_0_0_40px_rgb(99_102_241/0.25)]"
        style={{ width: cell * w + 20, fontSize: Math.round(cell * 0.45) }}
      >
        <div className="relative" style={{ aspectRatio: `${w} / ${h}` }}>
          {grid.cells.map((row, y) =>
            row.map((c, x) => {
              const k = key(x, y);
              const lit = state.lit.includes(k);
              const filled = state.filled.includes(k);
              const battery = state.bats.includes(k);
              return (
                <div key={k} className="absolute p-[3px]" style={{ left: pct(x, w), top: pct(y, h), width: pct(1, w), height: pct(1, h) }}>
                  <div
                    className={`flex h-full w-full items-center justify-center rounded-xl transition-all duration-300 ${
                      c === "#"
                        ? "bg-[repeating-linear-gradient(45deg,#475569_0_8px,#3f4b5e_8px_16px)]"
                        : c === "o" && lit
                          ? "bg-[#fde047] shadow-[0_0_24px_#facc15]"
                          : c === "x" && filled
                            ? "bg-[#86efac] shadow-[0_0_18px_#22c55e]"
                            : c === "o"
                              ? "border-2 border-dashed border-[#a5b4fc]/60 bg-[#1e1b4b]"
                              : "bg-[#1e293b]"
                    }`}
                  >
                    {c === "o" && <span className={lit ? "animate-[quest-bloom_0.6s_ease-out]" : "opacity-35 grayscale"}>💡</span>}
                    {c === "x" && <span className={filled ? "animate-[quest-bloom_0.6s_ease-out]" : ""}>{filled ? "⚡" : "🔌"}</span>}
                    {battery && c !== "x" && <span className="drop-shadow">🔋</span>}
                  </div>
                </div>
              );
            }),
          )}

          <div className="absolute transition-[left,top] duration-300 ease-in-out" style={{ left: pct(state.x, w), top: pct(state.y, h), width: pct(1, w), height: pct(1, h) }}>
            <div className="absolute inset-0 transition-transform duration-300" style={{ transform: `rotate(${angle.current}deg)` }}>
              <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[35%] text-[0.5em] font-black text-[#fcd34d] drop-shadow">▲</span>
            </div>
            <div
              className={`pixel-bot quest-bot absolute inset-[10%] ${state.event === "bump" || state.event === "oops" ? "act-shake" : state.event === "win" ? "act-jump" : ""}`}
              data-mood={state.event === "bump" || state.event === "oops" ? "sad" : state.event === "win" ? "love" : "happy"}
            >
              <PixelFigure />
            </div>
            {state.carry && <span className="absolute -right-[6%] bottom-[2%] text-[0.7em] drop-shadow">🔋</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
