import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Check, AlertTriangle, ChevronDown, Clock, Copy, Crown, Eye, EyeOff, KeyRound, Pencil, RefreshCw, Trash2, Search, Star, Target, Users, X } from "lucide-react";
import { cloudAvailable, getAdminSession, rpc, setAdminSession } from "../lib/cloud";
import { HUB_URL } from "../lib/cloudConfig";
import { buildActivity, formatDate, formatDuration, readReports, totalPoints, type TopicReport } from "../lib/reports";
import { markKey, withMarks, type Marks } from "../lib/marks";
import { describeTask, MISTAKES_KEY } from "../lib/mistakes";
import { trainers } from "../trainers/registry";

// Author-only page: progress of every participant. The data comes from the server only for the admin code.

const CARD =
  "rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]";
const BTN_MAIN =
  "inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-50";
const BTN_SECOND =
  "inline-flex items-center gap-1.5 rounded-full border-2 border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-40";

const WEEK = 7 * 24 * 3600 * 1000;

type Row = {
  code: string;
  name: string | null;
  surname3: string | null;
  created_at: string;
  updated_at: string;
  data: Record<string, string>;
  marks?: Marks;
};
type Overview = { admin: string; participants: Row[]; resets?: Record<string, string> };

type Participant = {
  marks: Marks;
  row: Row;
  label: string;
  reports: TopicReport[];
  points: number;
  solved: number;
  time: number;
  lastAt: string;
};

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10, m100 = n % 100;
  const w = m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many;
  return `${n} ${w}`;
}

const fmtCode = (c: string) => c.match(/.{1,4}/g)?.join("-") ?? c;
const normalize = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");

function toParticipant(row: Row): Participant {
  // the teacher's marks count right away, even before the student's device picks them up
  const data = withMarks(row.data ?? {}, row.marks);
  const get = (k: string) => (typeof data[k] === "string" ? data[k] : null);
  const reports = readReports(get);
  const lastAt = reports.map((r) => r.lastAt).filter((d): d is string => !!d).sort().pop() ?? row.updated_at;
  return {
    marks: row.marks ?? {},
    row,
    label: row.name ? `${row.name} ${row.surname3 ?? ""}.` : "Без имени",
    reports,
    points: totalPoints(get),
    solved: reports.reduce((a, r) => a + r.solved, 0),
    time: reports.reduce((a, r) => a + r.time, 0),
    lastAt,
  };
}

function Stat({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
        <Icon className="h-4 w-4" strokeWidth={2} />
        {label}
      </div>
      <p className="text-xl font-extrabold text-slate-800">{value}</p>
    </div>
  );
}

function StatusDot({ s, i }: { s: string; i: number }) {
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
        s === "correct" ? "bg-emerald-100 text-emerald-700" : s === "wrong" ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-400"
      }`}
    >
      {s === "correct" ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : s === "wrong" ? <X className="h-3.5 w-3.5" strokeWidth={2.5} /> : i + 1}
    </span>
  );
}

type Actions = {
  rename: (code: string, name: string, surname3: string) => Promise<void>;
  remove: (code: string) => Promise<void>;
  /** Counts tasks as done: keys like headings:L2 (level) or python-print:M0 (mission). */
  mark: (code: string, keys: string[]) => Promise<void>;
  /** Starts counting mistakes on a task (or "*" — all tasks) from zero. */
  resetMistakes: (key: string) => Promise<void>;
};

const FIELD =
  "rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-indigo-300";

function Manage({ p, actions }: { p: Participant; actions: Actions }) {
  const [mode, setMode] = useState<"none" | "rename" | "delete">("none");
  const [name, setName] = useState(p.row.name ?? "");
  const [surname, setSurname] = useState(p.row.surname3 ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      setMode("none");
    } catch (e) {
      setError(e instanceof Error && /[а-я]/i.test(e.message) ? e.message : "Не получилось. Проверь интернет и попробуй ещё раз.");
    } finally {
      setBusy(false);
    }
  }

  if (mode === "rename") {
    return (
      <form
        className="rounded-2xl bg-slate-50 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!/^[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё -]{0,29}$/.test(name.trim())) return setError("Имя — только буквы, например: Таня.");
          if (!/^[A-Za-zА-Яа-яЁё]{3}$/.test(surname.trim())) return setError("Нужны ровно три первые буквы фамилии.");
          run(() => actions.rename(p.row.code, name.trim(), surname.trim()));
        }}
      >
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500">Имя</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} className={`${FIELD} w-40`} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500">3 буквы фамилии</span>
            <input value={surname} onChange={(e) => setSurname(e.target.value)} maxLength={3} className={`${FIELD} w-24`} />
          </label>
          <button type="submit" disabled={busy} className={BTN_MAIN}>
            {busy ? "Сохраняю…" : "Сохранить"}
          </button>
          <button type="button" onClick={() => setMode("none")} className={BTN_SECOND}>
            Отмена
          </button>
        </div>
        {error && <p className="mt-2 text-sm font-bold text-rose-600">{error}</p>}
      </form>
    );
  }

  if (mode === "delete") {
    return (
      <div className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">
        <p className="mb-2">
          Аккаунт <b>{p.label}</b> ({fmtCode(p.row.code)}) и весь его прогресс будут удалены с сервера навсегда, код перестанет
          работать. Удалить?
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => run(() => actions.remove(p.row.code))} className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow disabled:opacity-50">
            <Trash2 className="h-4 w-4" strokeWidth={2} />
            {busy ? "Удаляю…" : "Да, удалить навсегда"}
          </button>
          <button type="button" onClick={() => setMode("none")} className={BTN_SECOND}>
            Отмена
          </button>
        </div>
        {error && <p className="mt-2 font-bold">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => setMode("rename")} className={BTN_SECOND}>
        <Pencil className="h-4 w-4" strokeWidth={2} />
        Изменить имя
      </button>
      <button type="button" onClick={() => setMode("delete")} className={`${BTN_SECOND} hover:border-rose-300 hover:text-rose-600`}>
        <Trash2 className="h-4 w-4" strokeWidth={2} />
        Удалить аккаунт
      </button>
    </div>
  );
}

const topicDone = (r: TopicReport) => r.solved === r.statuses.length && (!r.meta.missions || r.missionsDone >= r.meta.missions.count);

function topicKeys(r: TopicReport) {
  const keys = r.statuses.flatMap((s, i) => (s === "correct" ? [] : [markKey(r.meta.id, "L", i)]));
  if (r.meta.missions) for (let i = r.missionsDone; i < r.meta.missions.count; i++) keys.push(markKey(r.meta.id, "M", i));
  return keys;
}

/** A small action that asks once more before doing it. */
function ConfirmButton({ label, confirm, onConfirm, small }: { label: string; confirm: string; onConfirm: () => Promise<void>; small?: boolean }) {
  const [step, setStep] = useState<"idle" | "ask" | "busy" | "error">("idle");
  const base = small ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs";
  if (step === "ask" || step === "busy") {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="text-xs font-bold text-slate-600">{confirm}</span>
        <button
          type="button"
          disabled={step === "busy"}
          onClick={async () => {
            setStep("busy");
            try {
              await onConfirm();
              setStep("idle");
            } catch {
              setStep("error");
            }
          }}
          className={`rounded-full bg-emerald-500 font-bold text-white disabled:opacity-50 ${base}`}
        >
          {step === "busy" ? "…" : "Да"}
        </button>
        <button type="button" onClick={() => setStep("idle")} className={`rounded-full border border-slate-200 font-bold text-slate-500 ${base}`}>
          Нет
        </button>
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setStep("ask")}
      title={step === "error" ? "Не получилось — проверь интернет" : undefined}
      className={`inline-flex items-center gap-1 rounded-full border font-bold ${base} ${
        step === "error" ? "border-rose-200 text-rose-600" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
      }`}
    >
      <Check className={small ? "h-3 w-3" : "h-3.5 w-3.5"} strokeWidth={2.5} />
      {step === "error" ? "Ошибка, ещё раз" : label}
    </button>
  );
}

/** Count any topic, even one the student has not opened yet. */
function MarkAnyTopic({ p, actions }: { p: Participant; actions: Actions }) {
  const open = p.reports.filter((r) => !topicDone(r));
  const [id, setId] = useState("");
  const chosen = open.find((r) => r.meta.id === id);
  return (
    <span className="flex flex-wrap items-center gap-2">
      <select
        value={id}
        onChange={(e) => setId(e.target.value)}
        aria-label="Тема, которую засчитать"
        className="max-w-[16rem] rounded-xl border-2 border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600 outline-none focus:border-indigo-300"
      >
        <option value="">Засчитать тему…</option>
        {open.map((r) => (
          <option key={r.meta.id} value={r.meta.id}>
            {r.meta.title}
          </option>
        ))}
      </select>
      {chosen && (
        <ConfirmButton
          key={chosen.meta.id}
          label="Засчитать"
          confirm={`Засчитать «${chosen.meta.title}» целиком?`}
          onConfirm={async () => {
            await actions.mark(p.row.code, topicKeys(chosen));
            setId("");
          }}
        />
      )}
    </span>
  );
}

function ParticipantDetail({ p, actions }: { p: Participant; actions: Actions }) {
  const started = p.reports.filter((r) => r.lastAt || r.time > 0 || r.missionsDone > 0);
  const activity = buildActivity(p.reports, 15);

  return (
    <div className="space-y-5 border-t border-slate-200 p-4 text-sm">
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
        <span>Код: <span className="font-mono font-bold text-slate-700">{fmtCode(p.row.code)}</span></span>
        <span>Зарегистрирован: {formatDate(p.row.created_at)}</span>
        <span>Последнее сохранение: {formatDate(p.row.updated_at)}</span>
      </div>

      <Manage key={`${p.row.name}-${p.row.surname3}`} p={p} actions={actions} />

      <div>
        <p className="mb-2 font-extrabold text-slate-800">Последние задания</p>
        {activity.length === 0 ? (
          <p className="text-slate-500">Пока ни одного решённого задания.</p>
        ) : (
          <ul className="space-y-1.5">
            {activity.map((a, i) => (
              <li key={i} className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                <StatusDot s={a.ok ? "correct" : "wrong"} i={0} />
                <span className="font-bold text-slate-700">{a.meta.title}</span>
                <span className="text-slate-500">{a.label}</span>
                <span className="ml-auto text-xs text-slate-400">
                  {formatDate(a.at)}
                  {a.seconds > 0 && ` · ${formatDuration(a.seconds)}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="font-extrabold text-slate-800">По темам</p>
          <MarkAnyTopic p={p} actions={actions} />
        </div>
        {started.length === 0 ? (
          <p className="text-slate-500">Ни одна тема не начата.</p>
        ) : (
          <div className="space-y-3">
            {started.map((r) => (
              <div key={r.meta.id} className="rounded-2xl border-2 border-slate-200 p-3">
                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-bold text-slate-800">{r.meta.title}</span>
                  <span className="text-xs text-slate-500">
                    решено {r.solved} из {r.statuses.length} · время на теме {formatDuration(r.time)}
                  </span>
                  {!topicDone(r) && (
                    <ConfirmButton label="Засчитать всю тему" confirm="Засчитать все уровни и миссии?" onConfirm={() => actions.mark(p.row.code, topicKeys(r))} />
                  )}
                </div>
                {r.meta.missions && (
                  <p className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    Миссии: {r.missionsDone} из {r.meta.missions.count} · время {formatDuration(r.missionsTime)}
                    {r.missionsDone < r.meta.missions.count && (
                      <ConfirmButton
                        label="Засчитать миссии"
                        confirm="Засчитать все миссии?"
                        onConfirm={() => actions.mark(p.row.code, Array.from({ length: r.meta.missions!.count }, (_, i) => markKey(r.meta.id, "M", i)))}
                      />
                    )}
                  </p>
                )}
                <div className="grid gap-1 sm:grid-cols-2">
                  {r.statuses.map((s, i) => (
                    <div key={i} className="flex min-h-[2rem] items-center gap-2">
                      <StatusDot s={s} i={i} />
                      <span className="text-slate-700">Уровень {i + 1}</span>
                      {p.marks[markKey(r.meta.id, "L", i)] && (
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-600">засчитал педагог</span>
                      )}
                      <span className="ml-auto flex items-center gap-2 text-right text-xs text-slate-400">
                        {s !== "correct" ? (
                          <ConfirmButton small label="Засчитать" confirm="Точно?" onConfirm={() => actions.mark(p.row.code, [markKey(r.meta.id, "L", i)])} />
                        ) : (
                          <>
                            {r.dates[i] ? formatDate(r.dates[i]!) : "—"}
                            {r.levelTimes[i] > 0 && ` · ${formatDuration(r.levelTimes[i])}`}
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** The teacher's own sign-in key, hidden by default, with a copy button. */
function TeacherKey() {
  const code = getAdminSession() ?? "";
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);
  const pretty = fmtCode(code);
  if (!code) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-amber-200/60 bg-amber-50/60 px-4 py-2.5 text-sm dark:border-amber-400/20 dark:bg-amber-500/10">
      <KeyRound className="h-4 w-4 text-amber-500" strokeWidth={2} />
      <span className="font-bold text-slate-600 dark:text-slate-300">Ключ для входа:</span>
      <span className="font-mono font-bold tracking-widest text-slate-800 dark:text-slate-100">
        {shown ? pretty : pretty.replace(/[A-Z0-9]/g, "•")}
      </span>
      <button type="button" onClick={() => setShown((v) => !v)} className="rounded-full p-1.5 text-slate-500 hover:bg-white/70 hover:text-indigo-600" aria-label={shown ? "Скрыть ключ" : "Показать ключ"}>
        {shown ? <EyeOff className="h-4 w-4" strokeWidth={2} /> : <Eye className="h-4 w-4" strokeWidth={2} />}
      </button>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(pretty);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {
            setCopied(false);
          }
        }}
        className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-slate-600 shadow-sm hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-200"
      >
        {copied ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <Copy className="h-3.5 w-3.5" strokeWidth={2} />}
        {copied ? "Скопировано" : "Скопировать"}
      </button>
    </div>
  );
}

/** Where students go wrong most often: every wrong attempt counts, even if fixed later. Metrics for future edits. */
function Mistakes({ people, resets, actions }: { people: Participant[]; resets: Record<string, string>; actions: Actions }) {
  const [showAll, setShowAll] = useState(false);
  const since = (key: string) => {
    const a = resets[key] ?? "";
    const b = resets["*"] ?? "";
    return a > b ? a : b;
  };

  const byTask = new Map<string, { total: number; who: Set<string> }>();
  const add = (key: string, dates: string[], who: string) => {
    const from = since(key);
    const n = dates.filter((d) => typeof d === "string" && d > from).length;
    if (!n) return;
    const t = byTask.get(key) ?? { total: 0, who: new Set<string>() };
    t.total += n;
    t.who.add(who);
    byTask.set(key, t);
  };

  for (const p of people) {
    let log: Record<string, string[]> = {};
    try {
      log = JSON.parse(p.row.data?.[MISTAKES_KEY] ?? "{}") ?? {};
    } catch {
      log = {};
    }
    for (const [key, dates] of Object.entries(log)) if (Array.isArray(dates)) add(key, dates, p.label);
    // answers saved before mistakes were logged: a level still marked wrong counts once
    p.reports.forEach((r) =>
      r.statuses.forEach((s, i) => {
        const key = `${r.meta.id}:L${i}`;
        if (s === "wrong" && !log[key]) add(key, [r.dates[i] ?? p.row.updated_at], p.label);
      }),
    );
  }

  const rows = [...byTask.entries()]
    .map(([key, v]) => ({ key, ...v, task: describeTask(key), meta: trainers.find((t) => t.id === describeTask(key)?.topicId) }))
    .filter((r) => r.task && r.meta)
    .sort((a, b) => b.total - a.total || b.who.size - a.who.size);
  const max = rows[0]?.total ?? 1;
  const shown = showAll ? rows : rows.slice(0, 10);

  return (
    <div className={CARD}>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-800">
          <AlertTriangle className="h-5 w-5 text-amber-500" strokeWidth={2} />
          Где чаще ошибаются
        </h2>
        {rows.length > 0 && <ConfirmButton label="Обнулить всё" confirm="Обнулить все счётчики ошибок?" onConfirm={() => actions.resetMistakes("*")} />}
      </div>
      <p className="mb-4 text-sm text-slate-500">
        Все неверные попытки всех учеников — даже если потом ответ исправлен. Это подсказка, какие задания стоит переделать.
        «Обнулить» начинает счёт заново, данные учеников не меняются.
      </p>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">Ошибок пока нет — или счётчики только что обнулены.</p>
      ) : (
        <>
          <div className="space-y-2">
            {shown.map((r) => (
              <div key={r.key} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-slate-50 p-3 text-sm">
                <div className="min-w-[12rem] flex-1">
                  <p className="font-bold text-slate-800">
                    {r.meta!.title} · <span className="text-slate-500">{r.task!.label}</span>
                  </p>
                  <p className="truncate text-xs text-slate-500" title={[...r.who].join(", ")}>
                    {r.who.size} {r.who.size === 1 ? "ученик" : r.who.size < 5 ? "ученика" : "учеников"}: {[...r.who].join(", ")}
                  </p>
                </div>
                <div className="w-40">
                  <div className="mb-1 text-xs font-bold text-rose-600">
                    {r.total} {r.total % 10 === 1 && r.total % 100 !== 11 ? "ошибка" : r.total % 10 >= 2 && r.total % 10 <= 4 && (r.total % 100 < 12 || r.total % 100 > 14) ? "ошибки" : "ошибок"}
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-rose-500" style={{ width: `${(r.total / max) * 100}%` }} />
                  </div>
                </div>
                <Link to={r.task!.kind === "L" ? `${r.meta!.path}?level=${Number(r.key.split(":L")[1]) + 1}` : r.meta!.path} className={BTN_SECOND}>
                  Открыть
                </Link>
                <ConfirmButton small label="Обнулить" confirm="Обнулить?" onConfirm={() => actions.resetMistakes(r.key)} />
              </div>
            ))}
          </div>
          {rows.length > 10 && (
            <button type="button" onClick={() => setShowAll((v) => !v)} className="mt-3 text-sm font-bold text-indigo-600">
              {showAll ? "Свернуть" : `Показать все (${rows.length})`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function Dashboard({ data, onRefresh, busy, actions }: { data: Overview; onRefresh: () => void; busy: boolean; actions: Actions }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const people = useMemo(() => data.participants.map(toParticipant), [data]);

  const now = Date.now();
  const active = people.filter((p) => now - new Date(p.lastAt).getTime() < WEEK).length;
  const solved = people.reduce((a, p) => a + p.solved, 0);
  const time = people.reduce((a, p) => a + p.time, 0);

  const topics = trainers
    .map((meta, idx) => {
      const rs = people.map((p) => p.reports[idx]).filter((r) => r.lastAt || r.time > 0 || r.missionsDone > 0);
      return {
        meta,
        count: rs.length,
        finished: rs.filter((r) => r.statuses.every((s) => s !== "idle")).length,
        avgSolved: rs.length ? rs.reduce((a, r) => a + r.solved / r.statuses.length, 0) / rs.length : 0,
        avgTime: rs.length ? rs.reduce((a, r) => a + r.time, 0) / rs.length : 0,
      };
    })
    .filter((t) => t.count > 0);

  const q = query.trim().toLowerCase();
  const shown = q
    ? people.filter((p) => p.label.toLowerCase().includes(q) || p.row.code.toLowerCase().includes(normalize(q).toLowerCase()))
    : people;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 sm:text-4xl dark:text-slate-100">Кабинет педагога</h1>
          <p className="mt-2 flex flex-wrap items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Crown className="h-4 w-4 text-amber-400" strokeWidth={2} aria-label="Админ" />
            <span className="font-bold text-slate-700 dark:text-slate-200">{data.admin}</span> · прогресс всех участников
          </p>
          <div className="mt-3">
            <TeacherKey />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onRefresh} disabled={busy} className={BTN_SECOND}>
            <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} strokeWidth={2} />
            Обновить
          </button>
        </div>
      </div>

      <div className={CARD}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={Users} label="Участников" value={String(people.length)} />
          <Stat icon={CalendarClock} label="Активны за 7 дней" value={String(active)} />
          <Stat icon={Target} label="Уровней решено" value={String(solved)} />
          <Stat icon={Clock} label="Общее время" value={formatDuration(time)} />
        </div>
      </div>

      <div className={CARD}>
        <h2 className="mb-4 text-xl font-extrabold text-slate-800">Сводка по темам</h2>
        {topics.length === 0 ? (
          <p className="text-sm text-slate-500">Участники ещё не начали ни одной темы.</p>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="hidden grid-cols-[1fr_7rem_7rem_8rem_8rem] gap-3 px-3 text-xs font-bold uppercase tracking-wide text-slate-400 md:grid">
              <span>Тема</span>
              <span>Начали</span>
              <span>Закончили</span>
              <span>Средний результат</span>
              <span>Среднее время</span>
            </div>
            {topics.map((t) => (
              <div key={t.meta.id} className="grid grid-cols-2 gap-x-3 gap-y-1 rounded-2xl bg-slate-50 p-3 md:grid-cols-[1fr_7rem_7rem_8rem_8rem]">
                <span className="col-span-2 font-bold text-slate-800 md:col-span-1">{t.meta.title}</span>
                <span className="text-slate-600"><span className="md:hidden">Начали: </span>{t.count}</span>
                <span className="text-slate-600"><span className="md:hidden">Закончили: </span>{t.finished}</span>
                <span className="text-slate-600"><span className="md:hidden">Результат: </span>{Math.round(t.avgSolved * 100)}%</span>
                <span className="text-slate-600"><span className="md:hidden">Время: </span>{formatDuration(Math.round(t.avgTime))}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Mistakes people={people} resets={data.resets ?? {}} actions={actions} />

      <div className={CARD}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-slate-800">Участники</h2>
          <label className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5">
            <Search className="h-4 w-4 text-slate-400" strokeWidth={2} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Имя или код"
              aria-label="Поиск участника"
              className="w-40 bg-transparent text-sm outline-none"
            />
          </label>
        </div>
        {shown.length === 0 ? (
          <p className="text-sm text-slate-500">{people.length ? "Никого не нашлось." : "Пока никто не получил код участника."}</p>
        ) : (
          <div className="space-y-2">
            {shown.map((p) => (
              <div key={p.row.code} className="rounded-2xl border-2 border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => setOpen((o) => (o === p.row.code ? null : p.row.code))}
                  className="flex w-full flex-wrap items-center gap-x-5 gap-y-1 p-4 text-left text-sm"
                >
                  <span className="min-w-[9rem] font-extrabold text-slate-800">{p.label}</span>
                  <span className="font-mono text-xs text-slate-400">{fmtCode(p.row.code)}</span>
                  <span className="text-slate-600">{plural(p.points, "очко", "очка", "очков")}</span>
                  <span className="text-slate-600">{plural(p.solved, "уровень", "уровня", "уровней")}</span>
                  <span className="text-slate-600">{formatDuration(p.time)}</span>
                  <span className="ml-auto text-xs text-slate-400">{formatDate(p.lastAt)}</span>
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition ${open === p.row.code ? "rotate-180" : ""}`} strokeWidth={2} />
                </button>
                {open === p.row.code && <ParticipantDetail p={p} actions={actions} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Admin() {
  const [code, setCode] = useState<string | null>(getAdminSession);
  const [data, setData] = useState<Overview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(c: string) {
    setBusy(true);
    try {
      const res = await rpc<Overview>("admin_overview", { p_code: c });
      if (!res) throw new Error("empty");
      setData(res);
      setError(null);
      setCode(c);
      setAdminSession(c, res.admin);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (code && !data)
      load(code).catch((e) => {
        // only a code the server rejects is forgotten; a network hiccup keeps the teacher signed in
        if (e instanceof Error && / 400$/.test(e.message)) {
          setAdminSession(null);
          setCode(null);
        } else setError("Не получилось загрузить данные. Проверь интернет и обнови страницу.");
      });
  }, []);

  if (!cloudAvailable) return <p className="text-center text-slate-500">Сервер не подключён.</p>;
  if (!code) {
    window.location.replace(`${HUB_URL}#teacher`);
    return null;
  }
  if (!data) return <p className="text-center text-slate-500">{error ?? "Загружаю…"}</p>;

  return (
    <>
      <Dashboard
        data={data}
        busy={busy}
        actions={{
          rename: async (target, name, surname3) => {
            const ok = await rpc<boolean>("admin_rename_participant", { p_admin: code, p_code: target, p_name: name, p_surname3: surname3 });
            if (!ok) throw new Error("Такого аккаунта уже нет.");
            await load(code);
          },
          resetMistakes: async (key) => {
            await rpc("admin_reset_mistakes", { p_admin: code, p_key: key });
            await load(code);
          },
          mark: async (target, keys) => {
            const ok = await rpc<boolean>("admin_mark", { p_admin: code, p_code: target, p_keys: keys });
            if (!ok) throw new Error("Такого аккаунта уже нет.");
            await load(code);
          },
          remove: async (target) => {
            await rpc<boolean>("admin_delete_participant", { p_admin: code, p_code: target });
            await load(code);
          },
        }}
        onRefresh={() => load(data && code ? code : "").catch(() => setError("Не получилось обновить. Проверь интернет."))}
      />
      {error && <p className="mt-4 text-center text-sm font-bold text-rose-600">{error}</p>}
    </>
  );
}
