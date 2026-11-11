import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Check, ChevronDown, Cloud, Copy, IdCard, KeyRound, Sparkles, Star, Target, X } from "lucide-react";
import { cloudAvailable, createCloudCode, deleteFromCloud, formatCode, getCloudCode, normalizeCode, restoreFromCloud, useSyncState } from "../lib/cloud";
import { trainers, type TrainerMeta } from "../trainers/registry";
import { loadItem, loadJSON, useConsent, useTotalPoints } from "../lib/storage";
import { applyRestoreCode, makeRestoreCode } from "../lib/backup";
import { sessionKey, type SavedSession, type TaskStatus } from "../components/useTaskStepper";
import { missionDatesKey } from "../python/MissionBoard";

const CARD =
  "rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]";

const SECTION_TITLES: Record<TrainerMeta["section"], string> = {
  html: "HTML",
  css: "CSS",
  js: "JavaScript",
  python: "Python",
};

type TopicReport = {
  meta: TrainerMeta;
  statuses: TaskStatus[];
  dates: (string | null)[];
  solved: number;
  missionsDone: number;
  missionDates: (string | null)[];
  lastAt: string | null;
};

type Activity = { at: string; meta: TrainerMeta; label: string; ok: boolean };

function formatDate(iso: string, withTime = true) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  return withTime ? `${date}, ${d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}` : date;
}

function readReports(): TopicReport[] {
  return trainers.map((meta) => {
    const session = loadJSON<Partial<SavedSession>>(sessionKey(meta.id));
    const statuses: TaskStatus[] = Array.isArray(session?.statuses) ? session.statuses : Array(meta.taskCount).fill("idle");
    const dates = Array.isArray(session?.dates) ? session.dates : [];
    const missionsDone = meta.missions ? Math.min(Number(loadItem(meta.missions.storageKey)) || 0, meta.missions.count) : 0;
    const missionDates = meta.missions ? (loadJSON<(string | null)[]>(missionDatesKey(`missions:${meta.id}`)) ?? []) : [];
    const allDates = [...dates, ...missionDates].filter((d): d is string => !!d).sort();
    return {
      meta,
      statuses,
      dates,
      solved: statuses.filter((s) => s === "correct").length,
      missionsDone,
      missionDates,
      lastAt: allDates[allDates.length - 1] ?? null,
    };
  });
}

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
const BTN_SECOND =
  "rounded-full border-2 border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40";

function ParticipantCode() {
  const [code, setCode] = useState(getCloudCode);
  const sync = useSyncState();
  const [step, setStep] = useState<"none" | "agree" | "delete" | "replace">("none");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function act(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error && /[а-я]/i.test(e.message) ? e.message : "Не получилось связаться с сервером. Попробуй ещё раз.");
    } finally {
      setBusy(false);
      setStep("none");
    }
  }

  async function copy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(formatCode(code));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

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

      {code ? (
        <>
          <p className="mb-4 text-sm text-slate-600">
            Запиши этот код. На любом другом компьютере открой эту страницу, введи код — и весь прогресс подтянется.
          </p>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 px-5 py-2 font-mono text-2xl font-extrabold tracking-[0.2em] text-indigo-700">
              {formatCode(code)}
            </span>
            <button type="button" onClick={copy} className={BTN_MAIN}>
              {copied ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <Copy className="h-4 w-4" strokeWidth={2} />}
              {copied ? "Скопировано" : "Скопировать"}
            </button>
          </div>
          <p className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
            <Cloud className="h-4 w-4" strokeWidth={2} />
            {status}
          </p>
          {step === "delete" ? (
            <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
              <p className="mb-3">
                Прогресс удалится с сервера, и код перестанет работать. На этом компьютере всё останется. Удалить?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    act(async () => {
                      await deleteFromCloud();
                      setCode(null);
                    })
                  }
                  className={BTN_MAIN}
                >
                  Да, удалить
                </button>
                <button type="button" onClick={() => setStep("none")} className={BTN_SECOND}>
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setStep("delete")} className={BTN_SECOND}>
              Удалить прогресс с сервера
            </button>
          )}
        </>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-600">
            Короткий код из 8 знаков, например <span className="font-mono font-bold">K7QM-2XWD</span>. Прогресс хранится на
            сервере под этим кодом, поэтому его можно открыть на любом компьютере — достаточно ввести код.
          </p>
          {step === "agree" ? (
            <div className="rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-900">
              <p className="mb-2 font-bold">Перед тем как получить код</p>
              <ul className="mb-3 list-disc space-y-1 pl-5">
                <li>На сервер отправятся только уровни, даты прохождения и очки.</li>
                <li>Имя, почта и другие личные данные не нужны и никуда не отправляются.</li>
                <li>Прогресс будет сохраняться и в этом браузере.</li>
                <li>Всё можно удалить с сервера одной кнопкой на этой странице.</li>
              </ul>
              <p className="mb-3">Согласен?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    act(async () => {
                      setCode(await createCloudCode());
                    })
                  }
                  className={BTN_MAIN}
                >
                  {busy ? "Создаю код…" : "Да, получить код"}
                </button>
                <button type="button" onClick={() => setStep("none")} className={BTN_SECOND}>
                  Нет
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setStep("agree")} className={BTN_MAIN}>
              Получить код участника
            </button>
          )}

          <div className="mt-6 border-t border-slate-200 pt-5">
            <p className="mb-2 font-bold text-slate-700">У меня уже есть код</p>
            <div className="flex flex-wrap gap-2">
              <input
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setStep("none");
                  setError(null);
                }}
                maxLength={12}
                placeholder="XXXX-XXXX"
                aria-label="Код участника"
                className="w-44 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 font-mono text-lg uppercase tracking-widest outline-none focus:border-indigo-300"
              />
              {step !== "replace" && (
                <button
                  type="button"
                  disabled={normalizeCode(input).length !== 8}
                  onClick={() => setStep("replace")}
                  className="rounded-full border-2 border-indigo-200 px-5 py-2 text-sm font-bold text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Загрузить прогресс
                </button>
              )}
            </div>
            {step === "replace" && (
              <div className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
                <p className="mb-3">
                  Прогресс по этому коду заменит то, что сейчас сохранено на этом компьютере, и будет сохраняться в этом
                  браузере. Продолжить?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      act(async () => {
                        await restoreFromCloud(input);
                        window.location.reload();
                      })
                    }
                    className={BTN_MAIN}
                  >
                    {busy ? "Загружаю…" : "Да, загрузить"}
                  </button>
                  <button type="button" onClick={() => setStep("none")} className={BTN_SECOND}>
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      {error && <p className="mt-3 text-sm font-bold text-rose-600">{error}</p>}
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
  const { meta, statuses, dates, solved, missionsDone, missionDates, lastAt } = report;
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
          {lastAt && <p className="mt-1 text-xs text-slate-400">Последнее занятие: {formatDate(lastAt)}</p>}
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
              <span className="ml-auto text-xs text-slate-400">{dates[i] ? formatDate(dates[i]!) : "не пройден"}</span>
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
  const reports = useMemo(readReports, [total]);
  const [showAll, setShowAll] = useState(false);

  const started = reports.filter((r) => r.lastAt || r.missionsDone > 0);
  const solvedLevels = reports.reduce((a, r) => a + r.solved, 0);
  const allLevels = reports.reduce((a, r) => a + r.statuses.length, 0);
  const missionsDone = reports.reduce((a, r) => a + r.missionsDone, 0);

  const activity: Activity[] = reports
    .flatMap((r) => [
      ...r.dates.flatMap((d, i) =>
        d ? [{ at: d, meta: r.meta, label: `Уровень ${i + 1}`, ok: r.statuses[i] === "correct" }] : [],
      ),
      ...r.missionDates.flatMap((d, i) => (d ? [{ at: d, meta: r.meta, label: `Миссия ${i + 1}`, ok: true }] : [])),
    ])
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 10);

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
        <div className="grid gap-3 sm:grid-cols-4">
          <StatCard icon={Star} label="Очки" value={String(total)} />
          <StatCard icon={Target} label="Уровней решено" value={`${solvedLevels} из ${allLevels}`} />
          <StatCard icon={Sparkles} label="Миссий" value={String(missionsDone)} />
          <StatCard icon={CalendarClock} label="Последнее занятие" value={lastAt ? formatDate(lastAt, false) : "—"} />
        </div>
      </div>

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

      {cloudAvailable && <ParticipantCode />}
      <RestoreCode />
    </div>
  );
}
