// The game rules: a map of cells, Pixel's commands (and the "repeat" block), running a program
// step by step, and the shortest program that collects everything (the "best solution" for the second star).

export type Dir = 0 | 1 | 2 | 3; // 0 up, 1 right, 2 down, 3 left
export type Cmd = "F" | "L" | "R" | "W";
/** A block in the program: a command, or "repeat n times" with commands inside (no loops inside loops). */
export type Loop = { n: number; body: Cmd[] };
export type Block = Cmd | Loop;
/** What the palette offers: commands and the repeat block. */
export type Tool = Cmd | "loop";

export type Cell = "." | "#" | "F" | "*" | "P" | "D" | "G";
/** One map: rows of cells. S — start, # — wall, F — exit, * — crystal, P — sprout, D — diary page, G — gear part. */
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

export const isLoop = (b: Block): b is Loop => typeof b !== "string";

/** How many blocks the program has: a repeat block counts as one plus what is inside it. */
export const blockCount = (p: Block[]) => p.reduce((s, b) => s + (isLoop(b) ? 1 + b.body.length : 1), 0);

/** Where each executed command comes from: the block in the program, the command inside it, the round of the loop. */
export type Origin = { top: number; inner: number; round: number };

/** Unrolls the repeat blocks into a plain list of commands. */
export function flatten(p: Block[]) {
  const cmds: Cmd[] = [];
  const at: Origin[] = [];
  p.forEach((b, top) => {
    if (!isLoop(b)) {
      cmds.push(b);
      at.push({ top, inner: -1, round: 0 });
      return;
    }
    for (let round = 0; round < b.n; round++)
      b.body.forEach((c, inner) => {
        cmds.push(c);
        at.push({ top, inner, round });
      });
  });
  return { cmds, at };
}

const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

export const key = (x: number, y: number) => `${x},${y}`;

export type Frame = {
  x: number;
  y: number;
  dir: Dir;
  /** Index of the command that produced this frame (-1 for the start). */
  step: number;
  got: string[]; // crystals, diary pages and gears picked up so far
  watered: string[];
  event?: "bump" | "dry" | "pick" | "water" | "win";
};

export type RunResult = {
  frames: Frame[];
  outcome: "win" | "bump" | "dry" | "short" | "unwatered" | "nogears";
};

const isWall = (g: Grid, x: number, y: number) => x < 0 || y < 0 || y >= g.h || x >= g.w || (g.cells[y][x] ?? "#") === "#";

function cellsOf(g: Grid, c: Cell) {
  const out: string[] = [];
  g.cells.forEach((row, y) => row.forEach((v, x) => v === c && out.push(key(x, y))));
  return out;
}

/** Runs the commands and returns every intermediate position for the animation. */
export function run(g: Grid, dir0: Dir, program: Cmd[]): RunResult {
  let s: Frame = { x: g.start.x, y: g.start.y, dir: dir0, step: -1, got: [], watered: [] };
  const frames: Frame[] = [s];
  const plants = cellsOf(g, "P").length;
  const gears = cellsOf(g, "G");
  const gearsDone = (f: Frame) => gears.every((k) => f.got.includes(k));
  const won = (f: Frame) => g.cells[f.y][f.x] === "F" && f.watered.length === plants && gearsDone(f);
  for (let i = 0; i < program.length; i++) {
    const c = program[i];
    const next: Frame = { ...s, step: i, event: undefined };
    if (c === "L") next.dir = ((s.dir + 3) % 4) as Dir;
    else if (c === "R") next.dir = ((s.dir + 1) % 4) as Dir;
    else if (c === "F") {
      const nx = s.x + DX[s.dir];
      const ny = s.y + DY[s.dir];
      if (isWall(g, nx, ny)) {
        frames.push({ ...next, event: "bump" });
        return { frames, outcome: "bump" };
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
        frames.push({ ...next, event: "dry" });
        return { frames, outcome: "dry" };
      }
      next.watered = [...s.watered, key(s.x, s.y)];
      next.event = "water";
    }
    if (won(next)) {
      frames.push({ ...next, event: "win" });
      return { frames, outcome: "win" };
    }
    frames.push(next);
    s = next;
  }
  if (g.cells[s.y][s.x] !== "F") return { frames, outcome: "short" };
  return { frames, outcome: gearsDone(s) ? "unwatered" : "nogears" };
}

/** The fewest commands (without loops) that finish the level and pick up everything on the map. */
export function bestLength(g: Grid, dir0: Dir, allowed: Tool[]): number | null {
  const items: string[] = [];
  g.cells.forEach((row, y) => row.forEach((c, x) => "*DPG".includes(c) && items.push(key(x, y))));
  const idx = new Map(items.map((k, i) => [k, i]));
  const full = (1 << items.length) - 1;
  const at = (k: string) => g.cells[+k.split(",")[1]][+k.split(",")[0]];
  // sprouts and gears are needed to finish: with them done, the exit ends the level at once
  const needMask = items.reduce((m, k, i) => (at(k) === "P" || at(k) === "G" ? m | (1 << i) : m), 0);
  const cmds = allowed.filter((t): t is Cmd => t !== "loop");
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
        } else if (c === "W") {
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
