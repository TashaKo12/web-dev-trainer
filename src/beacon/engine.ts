// Станция «Маяк»: the language of written commands and the robot that runs them.
// A program is text: one command per line; «повтори N … конец» repeats, «команда имя … конец» makes Pixel's own command.
// Letters are forgiven where a child would trip: any case, «е» for «ё», a colon or a dot at the end, «раз/раза» after numbers.

export type Dir = 0 | 1 | 2 | 3; // 0 up, 1 right, 2 down, 3 left
/** A map: . floor, # wall, o lamp to light, b battery, x socket. */
export type Cell = "." | "#" | "o" | "b" | "x";

export type Op =
  | { k: "move"; n: number; line: number }
  | { k: "left" | "right" | "light" | "take" | "put"; line: number }
  | { k: "repeat"; n: number; body: Op[]; line: number }
  | { k: "call"; name: string; line: number };

export type Parsed = { main: Op[]; fns: Record<string, Op[]>; count: number; used: string[] };
/** `prog` is null when the code has a mistake: then `line` and `msg` tell where and what. */
export type ParseResult = { ok: boolean; prog: Parsed | null; line: number; msg: string };

/** The words of the language, as the child writes them. */
export const WORDS = ["вперёд", "налево", "направо", "свети", "возьми", "положи", "повтори", "команда", "конец"] as const;
const KEYWORDS = new Set(WORDS.map((w) => w.replace(/ё/g, "е")));
const MAX_N = 20;

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[:.;]+\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();

function distance(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/** «Может, ты имел в виду …?» — the closest known word, if it is close enough. */
function guess(word: string, names: string[]) {
  const all = [...WORDS, ...names];
  let best = "";
  let bestD = 3;
  for (const w of all) {
    const dd = distance(word, w.replace(/ё/g, "е"));
    if (dd < bestD) {
      best = w;
      bestD = dd;
    }
  }
  return best ? ` Может, ты имел в виду «${best}»?` : "";
}

type Frame = { kind: "main" | "repeat" | "fn"; ops: Op[]; line: number; n?: number; name?: string };

export function parse(src: string): ParseResult {
  const fail = (line: number, msg: string): ParseResult => ({ ok: false, prog: null, line, msg: `Строка ${line}: ${msg}` });
  const lines = src.split("\n");
  const main: Op[] = [];
  const fns: Record<string, Op[]> = {};
  const calls: { name: string; raw: string; line: number }[] = [];
  const stack: Frame[] = [{ kind: "main", ops: main, line: 0 }];
  const used = new Set<string>();
  let count = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = i + 1;
    const t = normalize(lines[i]);
    if (!t || t.startsWith("#") || t.startsWith("//")) continue;
    const top = stack[stack.length - 1];
    let m: RegExpMatchArray | null;

    if (t === "конец") {
      if (stack.length === 1) return fail(line, "лишнее слово «конец» — нечего закрывать.");
      const done = stack.pop()!;
      if (!done.ops.length) return fail(done.line, `внутри «${done.kind === "fn" ? "команда" : "повтори"}» пусто — напиши команды до слова «конец».`);
      if (done.kind === "repeat") stack[stack.length - 1].ops.push({ k: "repeat", n: done.n!, body: done.ops, line: done.line });
      else fns[done.name!] = done.ops;
      continue;
    }

    count++;
    if ((m = t.match(/^вперед(?:\s*(\d+))?(?:\s*(?:раз|раза|шаг|шага|шагов|клетки|клетку|клеток))?$/))) {
      const n = m[1] ? Number(m[1]) : 1;
      if (n < 1 || n > MAX_N) return fail(line, `столько шагов не получится — пиши число от 1 до ${MAX_N}.`);
      top.ops.push({ k: "move", n, line });
    } else if (t === "налево") top.ops.push({ k: "left", line });
    else if (t === "направо") top.ops.push({ k: "right", line });
    else if (t === "свети") top.ops.push({ k: "light", line });
    else if (t === "возьми") top.ops.push({ k: "take", line });
    else if (t === "положи") top.ops.push({ k: "put", line });
    else if ((m = t.match(/^повтори(?:\s*(\d+))?(?:\s*(?:раз|раза))?$/))) {
      if (!m[1]) return fail(line, "сколько раз повторить? Напиши число, например: повтори 4");
      const n = Number(m[1]);
      if (n < 1 || n > MAX_N) return fail(line, `повторять можно от 1 до ${MAX_N} раз.`);
      used.add("повтори");
      stack.push({ kind: "repeat", ops: [], line, n });
    } else if ((m = t.match(/^команда(?:\s+(.+))?$/))) {
      const name = m[1]?.trim();
      if (!name) return fail(line, "придумай команде имя, например: команда шаг");
      if (!/^[а-яa-z_][а-яa-z0-9_]*$/.test(name)) return fail(line, "имя команды — одно слово из букв, без пробелов. Например: команда шаг");
      if (KEYWORDS.has(name)) return fail(line, `«${lines[i].trim().split(/\s+/)[1]}» — уже слово маяка. Придумай другое имя.`);
      if (stack.length > 1) return fail(line, "новую команду можно создать только снаружи, не внутри «повтори» или другой команды.");
      if (fns[name]) return fail(line, `команда «${name}» уже есть.`);
      used.add("команда");
      stack.push({ kind: "fn", ops: [], line, name });
      fns[name] = []; // reserve the name
    } else if (/^[а-яa-z_][а-яa-z0-9_]*$/.test(t)) {
      top.ops.push({ k: "call", name: t, line });
      calls.push({ name: t, raw: lines[i].trim().replace(/[:.;]+$/, ""), line });
    } else {
      const first = t.split(" ")[0];
      if (KEYWORDS.has(first) || first in fns) return fail(line, `«${lines[i].trim()}» — на одной строке пиши только одну команду.`);
      return fail(line, `не понимаю «${lines[i].trim()}».${guess(first, Object.keys(fns))}`);
    }
  }

  if (stack.length > 1) {
    const open = stack[stack.length - 1];
    return fail(open.line, `не хватает слова «конец» для «${open.kind === "fn" ? "команда" : "повтори"}».`);
  }
  for (const c of calls)
    if (!(c.name in fns)) return fail(c.line, `не знаю слово «${c.raw}».${guess(c.name, Object.keys(fns))}`);
  if (!main.length) return { ok: false, prog: null, line: 0, msg: Object.keys(fns).length ? "Команду ты создал, а вызвать забыл: напиши её имя ниже слова «конец»." : "Напиши хотя бы одну команду." };
  return { ok: true, prog: { main, fns, count, used: [...used] }, line: 0, msg: "" };
}

// ── the robot ──

export type Grid = { cells: Cell[][]; w: number; h: number };
export const parseGrid = (rows: string[]): Grid => ({ cells: rows.map((r) => [...r] as Cell[]), w: Math.max(...rows.map((r) => r.length)), h: rows.length });
export const key = (x: number, y: number) => `${x},${y}`;

export type State = {
  x: number;
  y: number;
  dir: Dir;
  lit: string[];
  carry: boolean;
  /** Batteries lying on the floor (sockets with a battery are in `filled`). */
  bats: string[];
  filled: string[];
  line: number | null;
  event?: "bump" | "oops" | "light" | "take" | "put" | "win";
};

export type Outcome = "win" | "bump" | "oops" | "short" | "endless";
export type RunResult = { frames: State[]; outcome: Outcome; msg: string; line?: number };

const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];
const MAX_STEPS = 1500;

export function initial(grid: Grid, start: { x: number; y: number; dir: Dir }): State {
  const bats: string[] = [];
  grid.cells.forEach((row, y) => row.forEach((c, x) => c === "b" && bats.push(key(x, y))));
  return { ...start, lit: [], carry: false, bats, filled: [], line: null };
}

export function run(grid: Grid, start: { x: number; y: number; dir: Dir }, prog: Parsed): RunResult {
  let s = initial(grid, start);
  const frames: State[] = [s];
  const at = (x: number, y: number): Cell => (x < 0 || y < 0 || y >= grid.h || x >= grid.w ? "#" : (grid.cells[y][x] ?? "#"));
  class Stop {
    outcome: Outcome;
    msg: string;
    line?: number;
    constructor(outcome: Outcome, msg: string, line?: number) {
      this.outcome = outcome;
      this.msg = msg;
      this.line = line;
    }
  }
  const push = (next: Partial<State>, line: number) => {
    if (frames.length > MAX_STEPS) throw new Stop("endless", "Программа работает слишком долго. Может, команда вызывает сама себя?");
    s = { ...s, event: undefined, ...next, line };
    frames.push(s);
  };

  const exec = (ops: Op[], depth: number) => {
    if (depth > 30) throw new Stop("endless", "Команда вызывает сама себя без конца.");
    for (const op of ops) {
      const k = key(s.x, s.y);
      switch (op.k) {
        case "move":
          for (let i = 0; i < op.n; i++) {
            const nx = s.x + DX[s.dir];
            const ny = s.y + DY[s.dir];
            if (at(nx, ny) === "#") {
              push({ event: "bump" }, op.line);
              throw new Stop("bump", `Строка ${op.line}: впереди стена — Пиксель врезался!`, op.line);
            }
            push({ x: nx, y: ny }, op.line);
          }
          break;
        case "left":
          push({ dir: ((s.dir + 3) % 4) as Dir }, op.line);
          break;
        case "right":
          push({ dir: ((s.dir + 1) % 4) as Dir }, op.line);
          break;
        case "light":
          if (at(s.x, s.y) !== "o") {
            push({ event: "oops" }, op.line);
            throw new Stop("oops", `Строка ${op.line}: тут нет лампы. Свети, только когда стоишь на лампе 💡`, op.line);
          }
          push({ lit: s.lit.includes(k) ? s.lit : [...s.lit, k], event: "light" }, op.line);
          break;
        case "take":
          if (s.carry) {
            push({ event: "oops" }, op.line);
            throw new Stop("oops", `Строка ${op.line}: руки уже заняты — сначала положи батарейку.`, op.line);
          }
          if (!s.bats.includes(k)) {
            push({ event: "oops" }, op.line);
            throw new Stop("oops", `Строка ${op.line}: тут нет батарейки 🔋`, op.line);
          }
          push({ carry: true, bats: s.bats.filter((b) => b !== k), event: "take" }, op.line);
          break;
        case "put":
          if (!s.carry) {
            push({ event: "oops" }, op.line);
            throw new Stop("oops", `Строка ${op.line}: в руках ничего нет — сначала возьми батарейку.`, op.line);
          }
          if (s.bats.includes(k) || s.filled.includes(k)) {
            push({ event: "oops" }, op.line);
            throw new Stop("oops", `Строка ${op.line}: тут уже лежит батарейка.`, op.line);
          }
          push(at(s.x, s.y) === "x" ? { carry: false, filled: [...s.filled, k], event: "put" } : { carry: false, bats: [...s.bats, k], event: "put" }, op.line);
          break;
        case "repeat":
          for (let i = 0; i < op.n; i++) exec(op.body, depth);
          break;
        case "call":
          exec(prog.fns[op.name], depth + 1);
          break;
      }
    }
  };

  try {
    exec(prog.main, 0);
  } catch (e) {
    if (e instanceof Stop) return { frames, outcome: e.outcome, msg: e.msg, line: e.line };
    throw e;
  }

  const lamps: string[] = [];
  const sockets: string[] = [];
  grid.cells.forEach((row, y) =>
    row.forEach((c, x) => {
      if (c === "o") lamps.push(key(x, y));
      if (c === "x") sockets.push(key(x, y));
    }),
  );
  const dark = lamps.filter((l) => !s.lit.includes(l)).length;
  const empty = sockets.filter((l) => !s.filled.includes(l)).length;
  if (dark || empty) {
    const parts = [dark ? `не горят ещё ${dark} ${dark === 1 ? "лампа" : dark < 5 ? "лампы" : "ламп"}` : "", empty ? `${empty === 1 ? "одна розетка" : `${empty} розетки`} без батарейки` : ""].filter(Boolean);
    return { frames, outcome: "short", msg: `Программа закончилась, но ${parts.join(", а ")}. Допиши команды!` };
  }
  frames.push({ ...s, event: "win", line: null });
  return { frames, outcome: "win", msg: "Ура! Всё горит!" };
}
