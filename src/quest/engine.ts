// The game rules: maps, Pixel's commands and the blocks around them ("repeat", "repeat until the exit",
// "if there is a wall ahead", "my own command"), running a program step by step, and the shortest plain program
// (the "best solution" for the second star on levels without loops).

export type Dir = 0 | 1 | 2 | 3; // 0 up, 1 right, 2 down, 3 left
/** F forward, L left, R right, W water, A — call Pixel's own command ⭐. */
export type Cmd = "F" | "L" | "R" | "W" | "A";
/** The only question Pixel can ask for now: is there a wall (or a closed gate) right in front of him? */
export type Cond = "wall";

export type Node =
  | { k: "cmd"; c: Cmd }
  | { k: "loop"; n: number; body: Node[] }
  | { k: "while"; body: Node[] } // repeat until Pixel stands on the exit
  | { k: "if"; cond: Cond; then: Node[]; else: Node[] };

/** A program: the main list of blocks and the body of Pixel's own command ⭐ (empty when not used). */
export type Program = { main: Node[]; fn: Node[] };
/** What the palette offers. */
export type Tool = Cmd | "loop" | "while" | "if";

export const EMPTY_PROGRAM: Program = { main: [], fn: [] };

export type Cell = "." | "#" | "F" | "*" | "P" | "D" | "G" | "B";
/** One map: S — start, # — wall, B — closed laser gate, F — exit, * — crystal, P — sprout, D — diary page, G — gear. */
export type Grid = { cells: Cell[][]; w: number; h: number; start: { x: number; y: number } };

export function parseMap(rows: string[]): Grid {
  let start = { x: 0, y: 0 };
  const cells = rows.map((row, y) =>
    [...row].map((ch, x) => {
      if (ch === "S") {
        start = { x, y };
        return "." as Cell;
      }
      return ch as Cell;
    }),
  );
  return { cells, w: Math.max(...rows.map((r) => r.length)), h: rows.length, start };
}

// ── building programs (for level solutions and tests) ──
export const cmd = (c: Cmd): Node => ({ k: "cmd", c });
const toNodes = (xs: (Cmd | Node)[]) => xs.map((x) => (typeof x === "string" ? cmd(x) : x));
export const rep = (n: number, ...body: (Cmd | Node)[]): Node => ({ k: "loop", n, body: toNodes(body) });
export const until = (...body: (Cmd | Node)[]): Node => ({ k: "while", body: toNodes(body) });
export const ifWall = (then: (Cmd | Node)[], otherwise: (Cmd | Node)[] = []): Node => ({ k: "if", cond: "wall", then: toNodes(then), else: toNodes(otherwise) });
export const prog = (main: (Cmd | Node)[], fn: (Cmd | Node)[] = []): Program => ({ main: toNodes(main), fn: toNodes(fn) });

const countNodes = (ns: Node[]): number =>
  ns.reduce((s, n) => s + 1 + (n.k === "loop" || n.k === "while" ? countNodes(n.body) : n.k === "if" ? countNodes(n.then) + countNodes(n.else) : 0), 0);

/** How many blocks the program has: every block counts, including the ones inside other blocks and in ⭐. */
export const blockCount = (p: Program) => countNodes(p.main) + countNodes(p.fn);

const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

export const key = (x: number, y: number) => `${x},${y}`;

export type Frame = {
  x: number;
  y: number;
  dir: Dir;
  got: string[]; // crystals, diary pages and gears picked up so far
  watered: string[];
  /** The block that made this frame ("" for the start), e.g. "main/2.body/0". */
  path: string;
  /** The round of every loop that is running now, by the loop's path. */
  rounds: Record<string, number>;
  event?: "bump" | "dry" | "pick" | "water" | "win" | "check";
  /** For "check": what the "if" found. */
  answer?: boolean;
};

export type RunResult = {
  frames: Frame[];
  outcome: "win" | "bump" | "dry" | "short" | "unwatered" | "nogears" | "endless";
};

/** A program that walks on and on (a "repeat until" that never reaches the exit) stops after this many steps. */
export const MAX_STEPS = 300;

const isWall = (g: Grid, x: number, y: number) => {
  if (x < 0 || y < 0 || y >= g.h || x >= g.w) return true;
  const c = g.cells[y][x] ?? "#";
  return c === "#" || c === "B";
};

function cellsOf(g: Grid, c: Cell) {
  const out: string[] = [];
  g.cells.forEach((row, y) => row.forEach((v, x) => v === c && out.push(key(x, y))));
  return out;
}

class Stop {
  outcome: RunResult["outcome"];
  constructor(outcome: RunResult["outcome"]) {
    this.outcome = outcome;
  }
}

/** Runs the program on one map and returns every intermediate position for the animation. */
export function run(g: Grid, dir0: Dir, program: Program): RunResult {
  let s: Frame = { x: g.start.x, y: g.start.y, dir: dir0, got: [], watered: [], path: "", rounds: {} };
  const frames: Frame[] = [s];
  const plants = cellsOf(g, "P").length;
  const gears = cellsOf(g, "G");
  const gearsDone = (f: Frame) => gears.every((k) => f.got.includes(k));
  const atExit = (f: Frame) => g.cells[f.y][f.x] === "F";
  const won = (f: Frame) => atExit(f) && f.watered.length === plants && gearsDone(f);
  let steps = 0;
  const rounds: Record<string, number> = {};

  const push = (f: Frame) => {
    frames.push(f);
    s = f;
    if (++steps > MAX_STEPS) throw new Stop("endless");
  };

  function doCmd(c: Exclude<Cmd, "A">, path: string) {
    const next: Frame = { ...s, path, rounds: { ...rounds }, event: undefined, answer: undefined };
    if (c === "L") next.dir = ((s.dir + 3) % 4) as Dir;
    else if (c === "R") next.dir = ((s.dir + 1) % 4) as Dir;
    else if (c === "F") {
      const nx = s.x + DX[s.dir];
      const ny = s.y + DY[s.dir];
      if (isWall(g, nx, ny)) {
        push({ ...next, event: "bump" });
        throw new Stop("bump");
      }
      next.x = nx;
      next.y = ny;
      const here = g.cells[ny][nx];
      if ((here === "*" || here === "D" || here === "G") && !s.got.includes(key(nx, ny))) {
        next.got = [...s.got, key(nx, ny)];
        next.event = "pick";
      }
    } else if (c === "W") {
      if (g.cells[s.y][s.x] !== "P" || s.watered.includes(key(s.x, s.y))) {
        push({ ...next, event: "dry" });
        throw new Stop("dry");
      }
      next.watered = [...s.watered, key(s.x, s.y)];
      next.event = "water";
    }
    if (won(next)) {
      push({ ...next, event: "win" });
      throw new Stop("win");
    }
    push(next);
  }

  function exec(list: Node[], base: string, inFn: boolean) {
    list.forEach((n, i) => {
      const path = `${base}/${i}`;
      if (n.k === "cmd") {
        if (n.c === "A") {
          if (!inFn) exec(program.fn, "fn", true);
        } else doCmd(n.c, path);
      } else if (n.k === "loop") {
        for (let r = 0; r < n.n; r++) {
          rounds[path] = r;
          exec(n.body, `${path}.body`, inFn);
        }
        delete rounds[path];
      } else if (n.k === "while") {
        let r = 0;
        while (!atExit(s)) {
          rounds[path] = r++;
          const before = steps;
          exec(n.body, `${path}.body`, inFn);
          // a body that does nothing would spin forever without moving
          if (steps === before) throw new Stop("endless");
        }
        delete rounds[path];
      } else {
        const answer = isWall(g, s.x + DX[s.dir], s.y + DY[s.dir]);
        push({ ...s, path, rounds: { ...rounds }, event: "check", answer });
        exec(answer ? n.then : n.else, `${path}.${answer ? "then" : "else"}`, inFn);
      }
    });
  }

  try {
    exec(program.main, "main", false);
  } catch (e) {
    if (e instanceof Stop) return { frames, outcome: e.outcome };
    throw e;
  }
  if (!atExit(s)) return { frames, outcome: "short" };
  return { frames, outcome: gearsDone(s) ? "unwatered" : "nogears" };
}

/** The fewest plain commands that finish the level and pick up everything on the map. */
export function bestLength(g: Grid, dir0: Dir, allowed: Tool[]): number | null {
  const items: string[] = [];
  g.cells.forEach((row, y) => row.forEach((c, x) => "*DPG".includes(c) && items.push(key(x, y))));
  const idx = new Map(items.map((k, i) => [k, i]));
  const full = (1 << items.length) - 1;
  const at = (k: string) => g.cells[+k.split(",")[1]][+k.split(",")[0]];
  // sprouts and gears are needed to finish: with them done, the exit ends the level at once
  const needMask = items.reduce((m, k, i) => (at(k) === "P" || at(k) === "G" ? m | (1 << i) : m), 0);
  const cmds = allowed.filter((t): t is "F" | "L" | "R" | "W" => t === "F" || t === "L" || t === "R" || t === "W");
  const seen = new Set<string>();
  type St = { x: number; y: number; d: number; m: number; n: number };
  let queue: St[] = [{ x: g.start.x, y: g.start.y, d: dir0, m: 0, n: 0 }];
  seen.add(`${g.start.x},${g.start.y},${dir0},0`);
  while (queue.length) {
    const nextQ: St[] = [];
    for (const s of queue) {
      if (s.m === full && g.cells[s.y][s.x] === "F") return s.n;
      for (const c of cmds) {
        let { x, y, d, m } = s;
        if (c === "L") d = (d + 3) % 4;
        else if (c === "R") d = (d + 1) % 4;
        else if (c === "F") {
          x += DX[d];
          y += DY[d];
          if (isWall(g, x, y)) continue;
          const cell = g.cells[y][x];
          if (cell === "*" || cell === "D" || cell === "G") m |= 1 << idx.get(key(x, y))!;
          if (cell === "F" && (m & needMask) === needMask && m !== full) continue;
        } else {
          const i = idx.get(key(x, y));
          if (g.cells[y][x] !== "P" || i === undefined || m & (1 << i)) continue;
          m |= 1 << i;
        }
        const k = `${x},${y},${d},${m}`;
        if (seen.has(k)) continue;
        seen.add(k);
        nextQ.push({ x, y, d, m, n: s.n + 1 });
      }
    }
    queue = nextQ;
  }
  return null;
}

// ── editing programs: a container is a list of blocks, addressed by a path ──
// "main", "fn", or a block's path plus a slot: "main/2.body", "main/2.body/0.then".

export type Slot = "body" | "then" | "else";

function walk(cpath: string): { root: "main" | "fn"; steps: [number, Slot][] } {
  const [root, ...rest] = cpath.split("/");
  return {
    root: root as "main" | "fn",
    steps: rest.map((part) => {
      const [i, slot] = part.split(".");
      return [Number(i), slot as Slot];
    }),
  };
}

export function getList(p: Program, cpath: string): Node[] {
  const { root, steps } = walk(cpath);
  let list = p[root];
  for (const [i, slot] of steps) {
    const n = list[i] as unknown as Record<Slot, Node[]> | undefined;
    if (!n || !n[slot]) return [];
    list = n[slot];
  }
  return list;
}

export function updateList(p: Program, cpath: string, f: (list: Node[]) => Node[]): Program {
  const { root, steps } = walk(cpath);
  const go = (list: Node[], k: number): Node[] => {
    if (k === steps.length) return f(list);
    const [i, slot] = steps[k];
    return list.map((n, j) => (j === i ? ({ ...n, [slot]: go((n as unknown as Record<Slot, Node[]>)[slot] ?? [], k + 1) } as Node) : n));
  };
  return { ...p, [root]: go(p[root], 0) };
}

/** The container a block lives in: "main/2.body/0" → "main/2.body". */
export const parentOf = (nodePath: string) => nodePath.slice(0, nodePath.lastIndexOf("/"));
/** How deep a container is: "main" — 0, "main/2.body" — 1. */
export const depthOf = (cpath: string) => cpath.split("/").length - 1;
/** The block whose slot this container is: "main/2.body" → "main/2". */
export const ownerOf = (cpath: string) => cpath.slice(0, cpath.lastIndexOf("."));
