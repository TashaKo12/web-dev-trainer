// The game rules: a map of cells, Pixel's commands, running a program step by step,
// and the shortest program that collects everything (the "best solution" for the second star).

export type Dir = 0 | 1 | 2 | 3; // 0 up, 1 right, 2 down, 3 left
export type Cmd = "F" | "L" | "R" | "W";

export type Cell = "." | "#" | "F" | "*" | "P" | "D";
/** One map: rows of cells. S — start, # — wall, F — exit, * — crystal, P — sprout, D — diary page. */
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

const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

export const key = (x: number, y: number) => `${x},${y}`;

export type Frame = {
  x: number;
  y: number;
  dir: Dir;
  /** Index of the command that produced this frame (-1 for the start). */
  step: number;
  got: string[]; // crystals and diary pages picked up so far
  watered: string[];
  event?: "bump" | "dry" | "pick" | "water" | "win";
};

export type RunResult = {
  frames: Frame[];
  outcome: "win" | "bump" | "dry" | "short" | "unwatered";
};

const isWall = (g: Grid, x: number, y: number) => x < 0 || y < 0 || y >= g.h || x >= g.w || (g.cells[y][x] ?? "#") === "#";

function count(g: Grid, c: Cell) {
  return g.cells.flat().filter((v) => v === c).length;
}

/** Runs the program and returns every intermediate position for the animation. */
export function run(g: Grid, dir0: Dir, program: Cmd[]): RunResult {
  let s: Frame = { x: g.start.x, y: g.start.y, dir: dir0, step: -1, got: [], watered: [] };
  const frames: Frame[] = [s];
  const plants = count(g, "P");
  const won = (f: Frame) => g.cells[f.y][f.x] === "F" && f.watered.length === plants;
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
      if ((here === "*" || here === "D") && !s.got.includes(key(nx, ny))) {
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
  const atExit = g.cells[s.y][s.x] === "F";
  return { frames, outcome: atExit ? "unwatered" : "short" };
}

/** The fewest commands that water every sprout, pick up every crystal and diary page, and reach the exit. */
export function bestLength(g: Grid, dir0: Dir, allowed: Cmd[]): number | null {
  const items: string[] = [];
  g.cells.forEach((row, y) => row.forEach((c, x) => (c === "*" || c === "D" || c === "P") && items.push(key(x, y))));
  const idx = new Map(items.map((k, i) => [k, i]));
  const full = (1 << items.length) - 1;
  const plantMask = items.reduce((m, k, i) => (g.cells[+k.split(",")[1]][+k.split(",")[0]] === "P" ? m | (1 << i) : m), 0);
  const seen = new Set<string>();
  type St = { x: number; y: number; d: number; m: number; n: number };
  let queue: St[] = [{ x: g.start.x, y: g.start.y, d: dir0, m: 0, n: 0 }];
  seen.add(`${g.start.x},${g.start.y},${dir0},0`);
  while (queue.length) {
    const nextQ: St[] = [];
    for (const s of queue) {
      if (s.m === full && g.cells[s.y][s.x] === "F") return s.n;
      for (const c of allowed) {
        let { x, y, d, m } = s;
        if (c === "L") d = (d + 3) % 4;
        else if (c === "R") d = (d + 1) % 4;
        else if (c === "F") {
          x += DX[d];
          y += DY[d];
          if (isWall(g, x, y)) continue;
          const cell = g.cells[y][x];
          if (cell === "*" || cell === "D") m |= 1 << idx.get(key(x, y))!;
          // with every sprout watered, the exit ends the level at once — so it cannot be crossed early
          if (cell === "F" && (m & plantMask) === plantMask && m !== full) continue;
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
