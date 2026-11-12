import { useMemo, useState } from "react";
import { GamePanel } from "../components/GamePanel";
import { Link } from "react-router-dom";
import { CalendarClock, Check, ChevronDown, Clock, Cloud, Copy, IdCard, KeyRound, LogIn, Sparkles, Star, Target, X } from "lucide-react";
import { cloudAvailable, formatCode, formatOwner, getAdminSession, useAccount, useSyncState } from "../lib/cloud";
import { HUB_URL } from "../lib/cloudConfig";
import { type TrainerMeta } from "../trainers/registry";
import { loadItem, useConsent, useTotalPoints } from "../lib/storage";
import { buildActivity, formatDate, formatDuration, readReports, type Activity, type TopicReport } from "../lib/reports";
import { applyRestoreCode, makeRestoreCode } from "../lib/backup";

const CARD =
  "rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]";

const SECTION_TITLES: Record<TrainerMeta["section"], string> = {
  html: "HTML",
  css: "CSS",
  js: "JavaScript",
  python: "Python",
};

function StatCard({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: string }) {
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

const BTN_MAIN =
  "inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-50";

function ParticipantCode() {
  const account = useAccount();
  const sync = useSyncState();
  const [copied, setCopied] = useState(false);

  if (!account) {
    return (
      <div className={CARD}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <IdCard className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">Код участника</h2>
        </div>
        <p className="mb-4 text-sm text-slate-600">
          Сейчас прогресс хранится только на этом компьютере. Войди или создай аккаунт — получишь постоянный код, и прогресс
          будет с тобой на любом компьютере.
        </p>
        <a href={`${HUB_URL}#login`} className={BTN_MAIN}>
          <LogIn className="h-4 w-4" strokeWidth={2} />
          Войти или создать аккаунт
        </a>
      </div>
    );
  }

  const { code, owner } = account;
  const status =
    sync.status === "saving"
      ? "Сохраняю…"
      : sync.status === "error"
        ? "Не получилось сохранить — попробую при следующем задании"
        : sync.at
          ? `Сохранено ${formatDate(sync.at)}`
          : "Прогресс сохраняется автоматически после каждого задания";


  return (
    <div className={CARD}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <IdCard className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800">Код участника</h2>
      </div>
      {owner && (
        <p className="mb-2 text-sm font-bold text-slate-700">
          Участник: <span className="text-indigo-600">{formatOwner(owner)}</span>
        </p>
      )}
      <p className="mb-4 text-sm text-slate-600">
        Это твой постоянный код — он не меняется. По нему ты входишь на любом компьютере: кнопка «Войти» на странице курсов.
      </p>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 px-5 py-2 font-mono text-2xl font-extrabold tracking-[0.2em] text-indigo-700">
          {formatCode(code)}
        </span>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(formatCode(code));
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
          className={BTN_MAIN}
        >
          {copied ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <Copy className="h-4 w-4" strokeWidth={2} />}
          {copied ? "Скопировано" : "Скопировать"}
        </button>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-slate-500">
        <Cloud className="h-4 w-4" strokeWidth={2} />
        {status}
      </p>

    </div>
  );
}

function RestoreCode() {
  const consent = useConsent();
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [input, setInput] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function show() {
    setCode(await makeRestoreCode());
    setCopied(false);
  }

  async function copy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function restore() {
    setError(null);
    try {
      await applyRestoreCode(input);
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не получилось восстановить прогресс.");
      setConfirming(false);
    }
  }

  return (
    <div className={CARD}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <KeyRound className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800">{cloudAvailable ? "Запасной код без интернета" : "Код восстановления"}</h2>
      </div>
      <p className="mb-4 text-sm text-slate-600">
        Это твой личный код: в нём записан весь прогресс. Скопируй его и вставь на другом компьютере — уровни, даты и
        очки вернутся. Код меняется вместе с прогрессом, поэтому перед переходом на другой компьютер бери свежий.
      </p>

      {code ? (
        <div className="space-y-2">
          <textarea
            readOnly
            value={code}
            rows={3}
            onFocus={(e) => e.target.select()}
            aria-label="Твой код восстановления"
            className="w-full resize-none break-all rounded-xl border-2 border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700 outline-none"
          />
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 text-sm font-bold text-white shadow"
          >
            {copied ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <Copy className="h-4 w-4" strokeWidth={2} />}
            {copied ? "Скопировано" : "Скопировать код"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={show}
          className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 text-sm font-bold text-white shadow"
        >
          Показать мой код
        </button>
      )}

      <div className="mt-6 border-t border-slate-200 pt-5">
        <p className="mb-2 font-bold text-slate-700">Восстановить прогресс с другого компьютера</p>
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setConfirming(false);
            setError(null);
          }}
          rows={3}
          placeholder="Вставь сюда код, который начинается с PX1."
          aria-label="Код восстановления с другого компьютера"
          className="mb-3 w-full resize-none rounded-xl border-2 border-slate-200 bg-white p-3 font-mono text-xs outline-none focus:border-indigo-300"
        />
        {confirming ? (
          <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
            <p className="mb-3">
              Прогресс из кода заменит то, что сейчас сохранено на этом компьютере.
              {consent !== "granted" && " Чтобы он не пропал после перезагрузки, мы включим сохранение прогресса в этом браузере."}{" "}
              Продолжить?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={restore}
                className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 text-sm font-bold text-white shadow"
              >
                Да, восстановить
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-full border-2 border-slate-200 px-4 py-2 text-sm font-bold text-slate-600"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={!input.trim()}
            className="rounded-full border-2 border-indigo-200 px-5 py-2 text-sm font-bold text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Восстановить
          </button>
        )}
        {error && <p className="mt-3 text-sm font-bold text-rose-600">{error}</p>}
      </div>
    </div>
  );
}

function TopicRow({ report }: { report: TopicReport }) {
  const [open, setOpen] = useState(false);
  const { meta, statuses, dates, solved, missionsDone, missionDates, lastAt, levelTimes, time } = report;
  const Icon = meta.icon;
  const total = statuses.length;

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 p-4 text-left">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${meta.gradient}`}>
          <Icon className="h-5 w-5 text-white" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-extrabold text-slate-800">{meta.title}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full bg-gradient-to-r ${meta.gradient}`} style={{ width: `${(solved / total) * 100}%` }} />
            </div>
            <span className="whitespace-nowrap text-xs font-bold text-slate-500">
              {solved}/{total}
            </span>
          </div>
          {lastAt && (
            <p className="mt-1 text-xs text-slate-400">
              Последнее занятие: {formatDate(lastAt)}
              {time > 0 && ` · всего ${formatDuration(time)}`}
            </p>
          )}
        </div>
        <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} strokeWidth={2} />
      </button>

      {open && (
        <div className="space-y-1.5 border-t border-slate-200 p-4 text-sm">
          {meta.missions && (
            <p className="mb-2 text-slate-600">
              Миссии: {missionsDone} из {meta.missions.count}
              {missionDates.filter(Boolean).length > 0 &&
                ` · последняя пройдена ${formatDate(missionDates.filter((d): d is string => !!d).sort().pop()!)}`}
            </p>
          )}
          {statuses.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  s === "correct" ? "bg-emerald-100 text-emerald-700" : s === "wrong" ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-400"
                }`}
              >
                {s === "correct" ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : s === "wrong" ? <X className="h-3.5 w-3.5" strokeWidth={2.5} /> : i + 1}
              </span>
              <span className="text-slate-700">Уровень {i + 1}</span>
              <span className="ml-auto text-xs text-slate-400">{dates[i] ? formatDate(dates[i]!) : "не пройден"}
                {levelTimes[i] > 0 && ` · ${formatDuration(levelTimes[i])}`}</span>
            </div>
          ))}
          <Link to={meta.path} className="mt-2 inline-block font-bold text-indigo-600">
            Открыть тему →
          </Link>
        </div>
      )}
    </div>
  );
}

export function Profile() {
  const total = useTotalPoints();
  const consent = useConsent();
  const reports = useMemo(() => readReports(loadItem), [total]);
  const [showAll, setShowAll] = useState(false);

  const started = reports.filter((r) => r.lastAt || r.missionsDone > 0 || r.time > 0);
  const solvedLevels = reports.reduce((a, r) => a + r.solved, 0);
  const allLevels = reports.reduce((a, r) => a + r.statuses.length, 0);
  const missionsDone = reports.reduce((a, r) => a + r.missionsDone, 0);

  const activity: Activity[] = buildActivity(reports);
  const timeTotal = reports.reduce((a, r) => a + r.time, 0);

  const lastAt = activity[0]?.at ?? null;
  const visible = showAll ? reports : started;
  const sections = (Object.keys(SECTION_TITLES) as TrainerMeta["section"][])
    .map((key) => ({ key, items: visible.filter((r) => r.meta.section === key) }))
    .filter((s) => s.items.length);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 sm:text-4xl dark:text-slate-100">Мой прогресс</h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-500 dark:text-slate-400">
          Здесь видно, какие темы ты проходишь, сколько уровней решено и когда.
        </p>
        {consent !== "granted" && (
          <p className="mx-auto mt-3 max-w-2xl rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
            Сохранение в браузере выключено: прогресс пропадёт после перезагрузки страницы. Включить его можно внизу
            страницы.
          </p>
        )}
      </div>

      <div className={CARD}>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard icon={Star} label="Очки" value={String(total)} />
          <StatCard icon={Target} label="Уровней решено" value={`${solvedLevels} из ${allLevels}`} />
          <StatCard icon={Sparkles} label="Миссий" value={String(missionsDone)} />
          <StatCard icon={Clock} label="Время занятий" value={formatDuration(timeTotal)} />
          <StatCard icon={CalendarClock} label="Последнее занятие" value={lastAt ? formatDate(lastAt, false) : "—"} />
        </div>
      </div>

      <GamePanel />

      <div className={CARD}>
        <h2 className="mb-4 text-xl font-extrabold text-slate-800">Последние задания</h2>
        {activity.length === 0 ? (
          <p className="text-sm text-slate-500">
            Пока пусто. Реши первое задание — и оно появится здесь с датой.{" "}
            <Link to="/" className="font-bold text-indigo-600">
              К тренажёрам →
            </Link>
          </p>
        ) : (
          <ul className="space-y-2">
            {activity.map((a, i) => (
              <li key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full ${a.ok ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"}`}>
                  {a.ok ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <X className="h-3.5 w-3.5" strokeWidth={2.5} />}
                </span>
                <Link to={a.meta.path} className="font-bold text-slate-700 hover:text-indigo-600">
                  {a.meta.title}
                </Link>
                <span className="text-slate-500">{a.label}</span>
                <span className="ml-auto text-xs text-slate-400">{formatDate(a.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={CARD}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-extrabold text-slate-800">Темы</h2>
          <button type="button" onClick={() => setShowAll((s) => !s)} className="text-sm font-bold text-indigo-600">
            {showAll ? "Только начатые" : `Показать все (${reports.length})`}
          </button>
        </div>
        {sections.length === 0 ? (
          <p className="text-sm text-slate-500">Ни одна тема пока не начата.</p>
        ) : (
          <div className="space-y-6">
            {sections.map((s) => (
              <div key={s.key}>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">{SECTION_TITLES[s.key]}</p>
                <div className="space-y-2">
                  {s.items.map((r) => (
                    <TopicRow key={r.meta.id} report={r} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* the teacher has no participant code: the code cards are for students only */}
      {!getAdminSession() && (
        <>
          {cloudAvailable && <ParticipantCode />}
          <RestoreCode />
        </>
      )}
    </div>
  );
}
