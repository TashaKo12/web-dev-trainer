import { useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, Copy, GraduationCap, KeyRound, UserPlus, UserRound } from "lucide-react";
import {
  cloudAvailable,
  createCloudCode,
  formatCode,
  formatOwner,
  normalizeCode,
  restoreFromCloud,
  rpc,
  setAdminSession,
  useAccount,
} from "../lib/cloud";
import { hasLocalProgress } from "../lib/storage";

const CARD =
  "rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]";
const BTN_MAIN =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-50";
const BTN_SECOND =
  "inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-40";
const FIELD =
  "rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-base text-slate-800 outline-none focus:border-indigo-300";

const errorText = (e: unknown, fallback: string) => (e instanceof Error && /[а-я]/i.test(e.message) ? e.message : fallback);

function Heading({ icon: Icon, children }: { icon: typeof KeyRound; children: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <h2 className="text-xl font-extrabold text-slate-800">{children}</h2>
    </div>
  );
}

function CodeLogin() {
  const [input, setInput] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = normalizeCode(input).length === 8;

  async function login() {
    setBusy(true);
    setError(null);
    try {
      await restoreFromCloud(input);
      window.location.hash = "#/";
      window.location.reload();
    } catch (e) {
      setError(errorText(e, "Не получилось войти. Попробуй ещё раз."));
      setConfirming(false);
      setBusy(false);
    }
  }

  return (
    <div className={CARD}>
      <Heading icon={KeyRound}>У меня есть код</Heading>
      <p className="mb-4 text-sm text-slate-600">Введи свой код участника — весь прогресс подтянется на этот компьютер.</p>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!ready) return;
          if (hasLocalProgress()) setConfirming(true);
          else login();
        }}
      >
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setConfirming(false);
            setError(null);
          }}
          maxLength={12}
          autoComplete="off"
          placeholder="XXXX-XXXX"
          aria-label="Код участника"
          className={`${FIELD} w-44 font-mono text-lg uppercase tracking-widest`}
        />
        {!confirming && (
          <button type="submit" disabled={!ready || busy} className={BTN_MAIN}>
            {busy ? "Вхожу…" : "Войти"}
          </button>
        )}
      </form>
      {confirming && (
        <div className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
          <p className="mb-3">На этом компьютере уже есть прогресс. После входа его заменит прогресс из твоего кода. Продолжить?</p>
          <div className="flex gap-2">
            <button type="button" onClick={login} disabled={busy} className={BTN_MAIN}>
              {busy ? "Вхожу…" : "Да, войти"}
            </button>
            <button type="button" onClick={() => setConfirming(false)} className={BTN_SECOND}>
              Отмена
            </button>
          </div>
        </div>
      )}
      {error && <p className="mt-3 text-sm font-bold text-rose-600">{error}</p>}
    </div>
  );
}

function CreatedCard({ created }: { created: string }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  return (
    <div className={CARD}>
      <Heading icon={Check}>Аккаунт создан</Heading>
      <p className="mb-4 text-sm text-slate-600">
        Это твой постоянный код участника. <b>Запиши его</b> — по нему ты войдёшь на любом компьютере, и весь прогресс будет
        на месте.
      </p>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 px-5 py-2 font-mono text-3xl font-extrabold tracking-[0.2em] text-indigo-700">
          {formatCode(created)}
        </span>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(formatCode(created));
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
          className={BTN_SECOND}
        >
          {copied ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <Copy className="h-4 w-4" strokeWidth={2} />}
          {copied ? "Скопировано" : "Скопировать"}
        </button>
      </div>
      <button type="button" onClick={() => navigate("/")} className={BTN_MAIN}>
        Я записал код, к тренажёрам
        <ArrowRight className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}

function CreateAccount({ onCreated }: { onCreated: (code: string) => void }) {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className={CARD}>
      <Heading icon={UserPlus}>Я здесь впервые</Heading>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            onCreated(await createCloudCode(name, surname));
          } catch (err) {
            setError(errorText(err, "Не получилось создать аккаунт. Проверь интернет и попробуй ещё раз."));
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="mb-4 flex flex-wrap gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500">Имя</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} autoComplete="off" placeholder="Таня" className={`${FIELD} w-44`} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500">Первые 3 буквы фамилии</span>
            <input
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              maxLength={3}
              autoComplete="off"
              placeholder="Кон"
              className={`${FIELD} w-24`}
            />
          </label>
        </div>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>Мы сразу выдадим тебе постоянный код участника из 8 знаков.</li>
          <li>Имя и три буквы фамилии нужны педагогу, чтобы видеть твои успехи и найти код, если ты его потеряешь. Полную фамилию и почту не пиши.</li>
          <li>На сервере хранятся имя, три буквы фамилии, пройденные уровни, даты, очки и время занятий.</li>
          <li>Прогресс, который уже есть на этом компьютере, перейдёт в твой аккаунт.</li>
        </ul>
        <button type="submit" disabled={busy || !name.trim() || surname.trim().length !== 3} className={BTN_MAIN}>
          {busy ? "Создаю…" : "Согласен, создать аккаунт"}
        </button>
      </form>
      {error && <p className="mt-3 text-sm font-bold text-rose-600">{error}</p>}
    </div>
  );
}

function TeacherLogin() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const code = input.toUpperCase().replace(/[^A-Z0-9]/g, "");

  return (
    <div className={`${CARD} mx-auto max-w-lg`}>
      <Heading icon={GraduationCap}>Вход педагога</Heading>
      <p className="mb-4 text-sm text-slate-600">Введи код педагога из 16 знаков — откроется кабинет с прогрессом всех учеников.</p>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            await rpc("admin_overview", { p_code: code });
            setAdminSession(code);
            navigate("/admin");
          } catch {
            setError("Код не подошёл.");
            setBusy(false);
          }
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          type="password"
          autoComplete="off"
          placeholder="XXXX-XXXX-XXXX-XXXX"
          aria-label="Код педагога"
          className={`${FIELD} min-w-0 flex-1 font-mono tracking-widest`}
        />
        <button type="submit" disabled={busy || code.length !== 16} className={BTN_MAIN}>
          {busy ? "Проверяю…" : "Войти"}
        </button>
      </form>
      {error && <p className="mt-3 text-sm font-bold text-rose-600">{error}</p>}
    </div>
  );
}

export function Login() {
  const [params, setParams] = useSearchParams();
  const account = useAccount();
  const teacher = params.get("as") === "teacher";
  const [created, setCreated] = useState<string | null>(null);

  if (!cloudAvailable) return <p className="text-center text-slate-500">Вход сейчас недоступен.</p>;

  const tab = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${
      active ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow" : "text-slate-500 hover:text-indigo-600"
    }`;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 sm:text-4xl dark:text-slate-100">Вход</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-500 dark:text-slate-400">
          Войди по коду — и твой прогресс будет с тобой на любом компьютере.
        </p>
        <div className="mt-5 inline-flex gap-1 rounded-full border border-slate-200 bg-white/80 p-1 dark:border-slate-700 dark:bg-slate-900/80">
          <button type="button" onClick={() => setParams({}, { replace: true })} className={tab(!teacher)}>
            <UserRound className="h-4 w-4" strokeWidth={2} />
            Ученик
          </button>
          <button type="button" onClick={() => setParams({ as: "teacher" }, { replace: true })} className={tab(teacher)}>
            <GraduationCap className="h-4 w-4" strokeWidth={2} />
            Педагог
          </button>
        </div>
      </div>

      {teacher ? (
        <TeacherLogin />
      ) : created ? (
        <div className="mx-auto max-w-xl">
          <CreatedCard created={created} />
        </div>
      ) : account ? (
        <div className={`${CARD} mx-auto max-w-lg text-center`}>
          <p className="mb-2 text-slate-600">Ты уже вошёл{account.owner ? ` как ${formatOwner(account.owner)}` : ""}</p>
          <p className="mb-5 font-mono text-2xl font-extrabold tracking-[0.2em] text-indigo-600">{formatCode(account.code)}</p>
          <Link to="/profile" className={BTN_MAIN}>
            Мой прогресс
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <CodeLogin />
          <CreateAccount onCreated={setCreated} />
        </div>
      )}
    </div>
  );
}
