import { ArrowUp, Check, Droplets, Minus, Plus, Repeat, RotateCcw, RotateCw, X, type LucideIcon } from "lucide-react";
import { isLoop, type Block, type Cmd, type Origin } from "./engine";

// Pixel's program: command tiles and "repeat" boxes with commands inside.

export const BLOCK: Record<Cmd, { label: string; icon: LucideIcon; cls: string }> = {
  F: { label: "Вперёд", icon: ArrowUp, cls: "bg-sky-500 border-sky-700" },
  L: { label: "Налево", icon: RotateCcw, cls: "bg-violet-500 border-violet-700" },
  R: { label: "Направо", icon: RotateCw, cls: "bg-fuchsia-500 border-fuchsia-700" },
  W: { label: "Полить", icon: Droplets, cls: "bg-emerald-500 border-emerald-700" },
};
export const LOOP_STYLE = { label: "Повтори", icon: Repeat, cls: "bg-amber-500 border-amber-700" };

export const LOOP_MIN = 2;
export const LOOP_MAX = 9;
export const BODY_MAX = 6;

type Props = {
  program: Block[];
  /** The repeat block that new commands go into (null — the main program). */
  into: number | null;
  onInto: (i: number | null) => void;
  onChange: (update: (p: Block[]) => Block[]) => void;
  active: Origin | null;
  failed: Origin | null;
};

function Tile({ c, n, active, failed, onRemove }: { c: Cmd; n: string; active: boolean; failed: boolean; onRemove: () => void }) {
  const b = BLOCK[c];
  const Icon = b.icon;
  return (
    <li className="group relative">
      <span
        className={`flex h-12 w-12 flex-col items-center justify-center rounded-xl border-b-4 text-white transition ${b.cls} ${active ? "scale-110 ring-4 ring-amber-300" : ""} ${
          failed ? "ring-4 ring-rose-500" : ""
        }`}
        title={b.label}
      >
        <Icon className="h-6 w-6" strokeWidth={2.5} />
        <span className="text-[10px] font-bold leading-none opacity-80">{n}</span>
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-white group-hover:flex"
        aria-label={`Убрать блок ${n}`}
      >
        <X className="h-3 w-3" strokeWidth={3} />
      </button>
    </li>
  );
}

export function ProgramView({ program, into, onInto, onChange, active, failed }: Props) {
  const at = (o: Origin | null, top: number, inner: number) => !!o && o.top === top && o.inner === inner;
  return (
    <ol className="flex min-h-[4.5rem] flex-wrap items-start gap-1.5 rounded-2xl bg-slate-100 p-2" onClick={() => onInto(null)}>
      {program.length === 0 && <li className="self-center px-2 text-sm text-slate-400">Тут пока пусто…</li>}
      {program.map((b, i) => {
        if (!isLoop(b))
          return <Tile key={i} c={b} n={String(i + 1)} active={at(active, i, -1)} failed={at(failed, i, -1)} onRemove={() => {
                // the blocks after this one shift: close the open repeat so commands do not land in the wrong box
                onInto(null);
                onChange((p) => p.filter((_, k) => k !== i));
              }}
            />;
        const open = into === i;
        const running = !!active && active.top === i;
        const setN = (n: number) => onChange((p) => p.map((x, k) => (k === i && isLoop(x) ? { ...x, n } : x)));
        return (
          <li
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              onInto(i);
            }}
            className={`relative w-full cursor-pointer rounded-2xl border-2 bg-amber-50 p-2 transition ${
              open ? "border-amber-500 shadow-[0_0_0_4px_rgb(251_191_36/0.35)]" : running ? "border-amber-400" : "border-amber-300 border-dashed"
            } ${failed && failed.top === i ? "ring-4 ring-rose-400" : ""}`}
          >
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2 py-1 text-sm font-extrabold text-white">
                <Repeat className="h-4 w-4" strokeWidth={2.5} /> {i + 1}. Повтори
              </span>
              <span className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={() => setN(Math.max(LOOP_MIN, b.n - 1))} className="rounded-full bg-white p-1 text-amber-700 shadow-sm disabled:opacity-30" disabled={b.n <= LOOP_MIN} aria-label="Меньше раз">
                  <Minus className="h-4 w-4" strokeWidth={3} />
                </button>
                <span className="w-7 text-center text-xl font-black text-amber-700">{b.n}</span>
                <button type="button" onClick={() => setN(Math.min(LOOP_MAX, b.n + 1))} className="rounded-full bg-white p-1 text-amber-700 shadow-sm disabled:opacity-30" disabled={b.n >= LOOP_MAX} aria-label="Больше раз">
                  <Plus className="h-4 w-4" strokeWidth={3} />
                </button>
                <span className="text-sm font-extrabold text-amber-700">раз</span>
              </span>
              {running && active && <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-extrabold text-amber-800">круг {active.round + 1} из {b.n}</span>}
              <span className="ml-auto flex items-center gap-1">
                {open && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onInto(null);
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-extrabold text-white"
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={3} /> Готово
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInto(null);
                    onChange((p) => p.filter((_, k) => k !== i));
                  }}
                  className="rounded-full p-1 text-amber-700 hover:bg-amber-100"
                  aria-label={`Убрать повтор ${i + 1}`}
                >
                  <X className="h-4 w-4" strokeWidth={3} />
                </button>
              </span>
            </div>
            <ol className="flex min-h-[3.25rem] flex-wrap gap-1.5 rounded-xl bg-white/70 p-1.5">
              {b.body.length === 0 && (
                <li className="self-center px-1 text-sm font-semibold text-amber-700/70">{open ? "Нажимай команды — они попадут сюда" : "Нажми сюда, чтобы добавить команды"}</li>
              )}
              {b.body.map((c, j) => (
                <Tile
                  key={j}
                  c={c}
                  n={`${i + 1}.${j + 1}`}
                  active={at(active, i, j)}
                  failed={at(failed, i, j)}
                  onRemove={() => onChange((p) => p.map((x, k) => (k === i && isLoop(x) ? { ...x, body: x.body.filter((_, m) => m !== j) } : x)))}
                />
              ))}
            </ol>
          </li>
        );
      })}
    </ol>
  );
}
