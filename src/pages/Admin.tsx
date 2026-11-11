import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Check, ChevronDown, Clock, Crown, RefreshCw, Search, Star, Target, Users, X } from "lucide-react";
import { cloudAvailable, getAdminSession, rpc, setAdminSession } from "../lib/cloud";
import { HUB_URL } from "../lib/cloudConfig";
import { buildActivity, formatDate, formatDuration, readReports, totalPoints, type TopicReport } from "../lib/reports";
import { trainers } from "../trainers/registry";

// Author-only page: progress of every participant. The data comes from the server only for the admin code.

const CARD =
  "rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]";
const BTN_SECOND =
  "inline-flex items-center gap-1.5 rounded-full border-2 border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-40";

const WEEK = 7 * 24 * 3600 * 1000;

type Row = { code: string; name: string | null; surname3: string | null; created_at: string; updated_at: string; data: Record<string, string> };
type Overview = { admin: string; participants: Row[] };

type Participant = {
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
  const get = (k: string) => (typeof row.data?.[k] === "string" ? row.data[k] : null);
  const reports = readReports(get);
  const lastAt = reports.map((r) => r.lastAt).filter((d): d is string => !!d).sort().pop() ?? row.updated_at;
  return {
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

function ParticipantDetail({ p }: { p: Participant }) {
  const started = p.reports.filter((r) => r.lastAt || r.time > 0 || r.missionsDone > 0);
  const activity = buildActivity(p.reports, 15);

  return (
    <div className="space-y-5 border-t border-slate-200 p-4 text-sm">
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
        <span>Код: <span className="font-mono font-bold text-slate-700">{fmtCode(p.row.code)}</span></span>
        <span>Зарегистрирован: {formatDate(p.row.created_at)}</span>
        <span>Последнее сохранение: {formatDate(p.row.updated_at)}</span>
      </div>

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
        <p className="mb-2 font-extrabold text-slate-800">По темам</p>
        {started.length === 0 ? (
          <p className="text-slate-500">Ни одна тема не начата.</p>
        ) : (
          <div className="space-y-3">
            {started.map((r) => (
              <div key={r.meta.id} className="rounded-2xl border-2 border-slate-200 p-3">
                <div className="mb-2 flex flex-wrap items-baseline gap-x-3">
                  <span className="font-bold text-slate-800">{r.meta.title}</span>
                  <span className="text-xs text-slate-500">
                    решено {r.solved} из {r.statuses.length} · время на теме {formatDuration(r.time)}
                  </span>
                </div>
                {r.meta.missions && (
                  <p className="mb-2 text-xs text-slate-500">
                    Миссии: {r.missionsDone} из {r.meta.missions.count} · время {formatDuration(r.missionsTime)}
                  </p>
                )}
                <div className="grid gap-1 sm:grid-cols-2">
                  {r.statuses.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <StatusDot s={s} i={i} />
                      <span className="text-slate-700">Уровень {i + 1}</span>
                      <span className="ml-auto text-right text-xs text-slate-400">
                        {r.dates[i] ? formatDate(r.dates[i]!) : "—"}
                        {r.levelTimes[i] > 0 && ` · ${formatDuration(r.levelTimes[i])}`}
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

function Dashboard({ data, onRefresh, busy }: { data: Overview; onRefresh: () => void; busy: boolean }) {
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
                {open === p.row.code && <ParticipantDetail p={p} />}
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
        onRefresh={() => load(data && code ? code : "").catch(() => setError("Не получилось обновить. Проверь интернет."))}
      />
      {error && <p className="mt-4 text-center text-sm font-bold text-rose-600">{error}</p>}
    </>
  );
}
