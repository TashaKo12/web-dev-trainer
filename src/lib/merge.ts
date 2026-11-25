// Two copies of the same student's progress (this browser and the account, or two computers) become one:
// for every value the better one is kept, so saving never takes anything away.
// Pure functions without imports: the course page carries a copy of this file.

type Data = Record<string, string>;
type Obj = Record<string, unknown>;

const parse = (s: string): unknown => {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};
const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);
const obj = (v: unknown): Obj => (isObj(v) ? v : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const union = (a: unknown, b: unknown) => [...new Set([...arr(a), ...arr(b)])];

/** The same keys from both objects, joined by `pick`. */
function joinObj(a: unknown, b: unknown, pick: (x: unknown, y: unknown) => unknown): Obj {
  const out: Obj = { ...obj(b), ...obj(a) };
  for (const k of Object.keys(obj(a))) if (k in obj(b)) out[k] = pick(obj(a)[k], obj(b)[k]);
  return out;
}
const maxObj = (a: unknown, b: unknown) => joinObj(a, b, (x, y) => Math.max(num(x), num(y)));

const RANK: Record<string, number> = { idle: 0, wrong: 1, correct: 2 };

function session(a: Obj, b: Obj): Obj {
  // the student pressed «ещё раз»: the newer attempt wins as a whole
  const ea = num(a.epoch);
  const eb = num(b.epoch);
  if (ea !== eb) return ea > eb ? a : b;
  const sa = arr(a.statuses);
  const sb = arr(b.statuses);
  const statuses: unknown[] = [];
  const dates: unknown[] = [];
  for (let i = 0; i < Math.max(sa.length, sb.length); i++) {
    const takeB = (RANK[String(sb[i])] ?? -1) > (RANK[String(sa[i])] ?? -1);
    statuses.push((takeB ? sb : sa)[i] ?? "idle");
    dates.push(arr(takeB ? b.dates : a.dates)[i] ?? null);
  }
  return { ...b, ...a, statuses, dates };
}

/** All drafts together stay small (the account's storage is limited): the oldest go first. */
export function capDrafts<T extends Obj>(drafts: T, max = 40000): T {
  let left = max;
  const entries = Object.entries(drafts).sort((p, q) => num(arr(q[1])[1]) - num(arr(p[1])[1]) || (p[0] < q[0] ? -1 : 1));
  return Object.fromEntries(entries.filter(([k, d]) => (left -= k.length + 20 + String(arr(d)[0] ?? "").length) >= 0)) as T;
}

/** a — this device (wins when neither is better), b — the other copy. */
export function mergeValue(key: string, a: string, b: string): string {
  if (a === b) return a;
  if (key.startsWith("wdt:missions:") || key === "python-print-missions") return String(Math.max(num(a), num(b)));
  const x = parse(a);
  const y = parse(b);
  // a broken value never replaces a good one
  if (x === null || typeof x !== "object") return isObj(y) || Array.isArray(y) ? b : a;
  if (y === null || typeof y !== "object") return a;
  const put = (v: unknown) => JSON.stringify(v);
  if (key.startsWith("wdt:mission-dates:")) {
    const p = arr(x);
    const q = arr(y);
    return put(Array.from({ length: Math.max(p.length, q.length) }, (_, i) => p[i] ?? q[i] ?? null));
  }
  if (key.startsWith("wdt:session:")) return put(session(obj(x), obj(y)));
  if (key.startsWith("wdt:cards:")) {
    const p = arr(obj(x).picks);
    const q = arr(obj(y).picks);
    return put({ ...obj(x), picks: Array.from({ length: Math.max(p.length, q.length) }, (_, i) => p[i] ?? q[i] ?? null) });
  }
  switch (key) {
    case "wdt:points":
    case "wdt:points-season":
    case "wdt:time":
      return put(maxObj(x, y));
    case "wdt:mistakes":
      return put(joinObj(x, y, (p, q) => union(p, q).sort().slice(-50)));
    case "web-dev-trainer:progress":
      return put(joinObj(x, y, (p, q) => (num(obj(q).score) > num(obj(p).score) ? q : p)));
    case "wdt:quest":
      return put({
        ...obj(y),
        ...obj(x),
        prologue: !!obj(x).prologue || !!obj(y).prologue,
        intro: union(obj(x).intro, obj(y).intro),
        outro: union(obj(x).outro, obj(y).outro),
        crystals: union(obj(x).crystals, obj(y).crystals),
        diary: union(obj(x).diary, obj(y).diary),
        stars: maxObj(obj(x).stars, obj(y).stars),
      });
    case "wdt:keys":
    case "wdt:logic":
    case "wdt:beacon":
      return put({ ...obj(y), ...obj(x), intro: !!obj(x).intro || !!obj(y).intro, stars: maxObj(obj(x).stars, obj(y).stars) });
    case "wdt:achievements":
      return put({ ids: union(obj(x).ids, obj(y).ids), level: Math.max(num(obj(x).level), num(obj(y).level)) });
    case "wdt:streak":
      return put({ ...obj(x), best: Math.max(num(obj(x).best), num(obj(y).best)) });
    case "wdt:theory":
      return put({ ...obj(y), ...obj(x) });
    case "wdt:drafts":
      // [text, time]: the one written later
      return put(capDrafts(joinObj(x, y, (p, q) => (num(arr(q)[1]) > num(arr(p)[1]) ? q : p))));
  }
  return a;
}

export function mergeData(a: Data, b: Data): Data {
  const out: Data = { ...b, ...a };
  for (const k of Object.keys(a)) if (typeof b[k] === "string") out[k] = mergeValue(k, a[k], b[k]);
  return out;
}

/** Keys whose value differs, whatever the order of fields. */
export function changedKeys(from: Data, to: Data): string[] {
  const canon = (v: unknown): unknown => (Array.isArray(v) ? v.map(canon) : isObj(v) ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v);
  const same = (p: string, q: string) => p === q || (parse(p) !== null && JSON.stringify(canon(parse(p))) === JSON.stringify(canon(parse(q))));
  return Object.keys(to).filter((k) => from[k] === undefined || !same(from[k], to[k]));
}
