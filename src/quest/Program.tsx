import type { ReactNode } from "react";
import { ArrowUp, Check, Droplets, GitBranch, Minus, Plus, Repeat, RotateCcw, RotateCw, Star, Undo, X, type LucideIcon } from "lucide-react";
import { ownerOf, parentOf, type Cmd, type Frame, type Node, type Program, type Tool } from "./engine";

// Pixel's program: command tiles and boxes with commands inside — "repeat", "repeat until the exit",
// "if there is a wall ahead" — plus Pixel's own command ⭐. The open box (where new commands go) glows.

export const TOOL: Record<Tool, { label: string; icon: LucideIcon; cls: string }> = {
  F: { label: "Вперёд", icon: ArrowUp, cls: "bg-sky-500 border-sky-700" },
  L: { label: "Налево", icon: RotateCcw, cls: "bg-violet-500 border-violet-700" },
  R: { label: "Направо", icon: RotateCw, cls: "bg-fuchsia-500 border-fuchsia-700" },
  W: { label: "Полить", icon: Droplets, cls: "bg-emerald-500 border-emerald-700" },
  A: { label: "Моя команда", icon: Star, cls: "bg-pink-500 border-pink-700" },
  loop: { label: "Повтори", icon: Repeat, cls: "bg-amber-500 border-amber-700" },
  while: { label: "Пока не выход", icon: Undo, cls: "bg-teal-500 border-teal-700" },
  if: { label: "Если стена", icon: GitBranch, cls: "bg-blue-600 border-blue-800" },
};

export const LOOP_MIN = 2;
export const LOOP_MAX = 12;
export const BODY_MAX = 8;

type Props = {
  program: Program;
  /** The container new commands go into. */
  into: string;
  onInto: (cpath: string) => void;
  onChange: (update: (p: Program) => Program) => void;
  frame: Frame | null;
  failed: string | null;
  /** Remove a block by its path. */
  onRemove: (nodePath: string) => void;
  onSetCount: (nodePath: string, n: number) => void;
};

function Tile({ c, label, active, failed, onRemove }: { c: Cmd; label: string; active: boolean; failed: boolean; onRemove: () => void }) {
  const b = TOOL[c];
  const Icon = b.icon;
  return (
    <li className="group relative">
      <span
        className={`flex h-12 w-12 flex-col items-center justify-center rounded-xl border-b-4 text-white transition ${b.cls} ${active ? "scale-110 ring-4 ring-amber-300" : ""} ${
          failed ? "ring-4 ring-rose-500" : ""
        }`}
        title={b.label}
      >
        <Icon className="h-6 w-6" strokeWidth={2.5} fill={c === "A" ? "currentColor" : "none"} />
        <span className="text-[10px] font-bold leading-none opacity-80">{label}</span>
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-white group-hover:flex"
        aria-label={`Убрать блок ${label}`}
      >
        <X className="h-3 w-3" strokeWidth={3} />
      </button>
    </li>
  );
}

/** A list of blocks that can be opened to receive new commands. */
function Container({
  cpath,
  list,
  props,
  empty,
  tone,
}: {
  cpath: string;
  list: Node[];
  props: Props;
  empty: string;
  tone: string;
}) {
  const open = props.into === cpath;
  return (
    <ol
      onClick={(e) => {
        e.stopPropagation();
        props.onInto(cpath);
      }}
      className={`flex min-h-[3.25rem] cursor-pointer flex-wrap items-start gap-1.5 rounded-xl p-1.5 transition ${tone} ${
        open ? "ring-4 ring-amber-300/80" : "ring-1 ring-transparent hover:ring-amber-200"
      }`}
    >
      {list.length === 0 && <li className="self-center px-1 text-sm font-semibold opacity-70">{open ? "Нажимай команды — они попадут сюда" : empty}</li>}
      {list.map((n, i) => (
        <NodeView key={i} node={n} path={`${cpath}/${i}`} label={String(i + 1)} props={props} />
      ))}
    </ol>
  );
}

function Box({ path, props, cls, head, children }: { path: string; props: Props; cls: string; head: ReactNode; children: ReactNode }) {
  const failed = props.failed?.startsWith(path) ?? false;
  return (
    <li className={`w-full rounded-2xl border-2 p-2 ${cls} ${failed ? "ring-4 ring-rose-400" : ""}`} onClick={(e) => e.stopPropagation()}>
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        {head}
        <span className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => props.onRemove(path)}
            className="rounded-full p-1 opacity-70 hover:bg-white/60 hover:opacity-100"
            aria-label="Убрать этот блок со всем, что внутри"
          >
            <X className="h-4 w-4" strokeWidth={3} />
          </button>
        </span>
      </div>
      {children}
    </li>
  );
}

function Chip({ tool, text }: { tool: Tool; text: string }) {
  const b = TOOL[tool];
  const Icon = b.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-extrabold text-white ${b.cls.split(" ")[0]}`}>
      <Icon className="h-4 w-4" strokeWidth={2.5} /> {text}
    </span>
  );
}

function NodeView({ node, path, label, props }: { node: Node; path: string; label: string; props: Props }) {
  const f = props.frame;
  if (node.k === "cmd")
    return <Tile c={node.c} label={label} active={f?.path === path || f?.caller === path} failed={props.failed === path} onRemove={() => props.onRemove(path)} />;

  const round = f?.rounds[path];
  if (node.k === "loop")
    return (
      <Box
        path={path}
        props={props}
        cls="border-amber-300 bg-amber-50 text-amber-800"
        head={
          <>
            <Chip tool="loop" text={`${label}. Повтори`} />
            <span className="inline-flex items-center gap-1">
              <button type="button" onClick={() => props.onSetCount(path, Math.max(LOOP_MIN, node.n - 1))} disabled={node.n <= LOOP_MIN} className="rounded-full bg-white p-1 text-amber-700 shadow-sm disabled:opacity-30" aria-label="Меньше раз">
                <Minus className="h-4 w-4" strokeWidth={3} />
              </button>
              <span className="w-7 text-center text-xl font-black text-amber-700">{node.n}</span>
              <button type="button" onClick={() => props.onSetCount(path, Math.min(LOOP_MAX, node.n + 1))} disabled={node.n >= LOOP_MAX} className="rounded-full bg-white p-1 text-amber-700 shadow-sm disabled:opacity-30" aria-label="Больше раз">
                <Plus className="h-4 w-4" strokeWidth={3} />
              </button>
              <span className="text-sm font-extrabold">раз</span>
            </span>
            {round !== undefined && <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-extrabold text-amber-800">круг {round + 1} из {node.n}</span>}
          </>
        }
      >
        <Container cpath={`${path}.body`} list={node.body} props={props} empty="Нажми сюда, чтобы добавить команды" tone="bg-white/70 text-amber-800" />
      </Box>
    );

  if (node.k === "while")
    return (
      <Box
        path={path}
        props={props}
        cls="border-teal-300 bg-teal-50 text-teal-800"
        head={
          <>
            <Chip tool="while" text={`${label}. Повторяй, пока не дойдёшь до выхода`} />
            {round !== undefined && <span className="rounded-full bg-teal-200 px-2 py-0.5 text-xs font-extrabold text-teal-800">круг {round + 1}</span>}
          </>
        }
      >
        <Container cpath={`${path}.body`} list={node.body} props={props} empty="Нажми сюда, чтобы добавить команды" tone="bg-white/70 text-teal-800" />
      </Box>
    );

  const checking = f?.event === "check" && f.path === path;
  return (
    <Box
      path={path}
      props={props}
      cls="border-blue-300 bg-blue-50 text-blue-800"
      head={
        <>
          <Chip tool="if" text={`${label}. Если впереди стена`} />
          {checking && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${f.answer ? "bg-rose-200 text-rose-800" : "bg-emerald-200 text-emerald-800"}`}>
              {f.answer ? "да, стена!" : "нет, свободно"}
            </span>
          )}
        </>
      }
    >
      <div className="grid gap-1.5 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-extrabold uppercase tracking-wide">то (стена):</p>
          <Container cpath={`${path}.then`} list={node.then} props={props} empty="Нажми сюда" tone="bg-white/70 text-blue-800" />
        </div>
        <div>
          <p className="mb-1 text-xs font-extrabold uppercase tracking-wide">иначе (свободно):</p>
          <Container cpath={`${path}.else`} list={node.else} props={props} empty="Нажми сюда" tone="bg-white/70 text-blue-800" />
        </div>
      </div>
    </Box>
  );
}

export function ProgramView(props: Props & { withFn: boolean }) {
  return (
    <div className="space-y-3">
      {props.withFn && (
        <div className="rounded-2xl border-2 border-pink-300 bg-pink-50 p-2 text-pink-800" onClick={() => props.onInto("fn")}>
          <p className="mb-1.5 flex items-center gap-1.5 text-sm font-extrabold">
            <Star className="h-4 w-4" fill="currentColor" strokeWidth={2} /> Моя команда — научи Пикселя:
          </p>
          <Container cpath="fn" list={props.program.fn} props={props} empty="Нажми сюда и собери новую команду" tone="bg-white/70 text-pink-800" />
        </div>
      )}
      <div>
        {props.withFn && <p className="mb-1 text-sm font-extrabold text-slate-500">Программа:</p>}
        <Container cpath="main" list={props.program.main} props={props} empty="Тут пока пусто…" tone="bg-slate-100 text-slate-400" />
      </div>
      {props.into !== "main" && props.into !== "fn" && (
        <button
          type="button"
          onClick={() => props.onInto(parentOf(ownerOf(props.into)))}
          className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1.5 text-sm font-extrabold text-white shadow"
        >
          <Check className="h-4 w-4" strokeWidth={3} /> Готово — выйти на уровень выше
        </button>
      )}
    </div>
  );
}
