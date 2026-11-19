import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Lock, RotateCcw, Star } from "lucide-react";
import { createStarStore } from "../lib/gameStars";
import { emitPixel } from "../lib/pixelBus";
import { BoltFigure, Dialogue } from "../quest/Dialogue";
import { CODE_OF, KEY_BY_CODE, KEYS_INTRO, KEYS_LEVELS, ROWS, type Task } from "./data";
import { CodeBox, TheoryButton, TheoryCard } from "../components/GameTheory";
import { KEYS_THEORY } from "./theory";
import { CatalogBanner } from "../components/CatalogBanner";

// «Клавиатура Пикселя»: the list of levels and one level — find the keys on the real (or the on-screen) keyboard.

export const keysStars = createStarStore("wdt:keys", "keys", () => KEYS_LEVELS.map((l) => l.id));

const MODIFIERS = new Set(["ShiftLeft", "ShiftRight", "ControlLeft", "ControlRight", "AltLeft", "AltRight", "MetaLeft", "MetaRight", "CapsLock"]);
const levelOpen = (stars: Record<string, number>, i: number) => i === 0 || (stars[KEYS_LEVELS[i - 1].id] ?? 0) > 0;

function StarRow({ n, size = "h-4 w-4" }: { n: number; size?: string }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3].map((k) => (
        <Star key={k} className={`${size} ${k <= n ? "text-amber-400" : "text-slate-300"}`} fill="currentColor" strokeWidth={1.5} />
      ))}
    </span>
  );
}

export function KeysHome() {
  const save = keysStars.use();
  const [intro, setIntro] = useState(!save.intro);
  if (intro)
    return (
      <div className="py-4">
        <h1 className="mb-8 text-center text-3xl font-extrabold text-slate-800 sm:text-4xl dark:text-slate-100">Клавиатура Пикселя</h1>
        <Dialogue
          lines={KEYS_INTRO}
          doneLabel="Поехали!"
          onDone={() => {
            keysStars.markIntro();
            setIntro(false);
          }}
        />
      </div>
    );
  const total = KEYS_LEVELS.reduce((s, l) => s + (save.stars[l.id] ?? 0), 0);
  return (
    <div>
      <CatalogBanner image="keys" icon="⌨️" kicker="Программирование (1 ступень) · 7–9 лет" title="Клавиатура Пикселя" note="Находи клавиши на настоящей клавиатуре и узнавай, что они умеют." />
      <div className="mb-6">
        <p className="inline-flex items-center gap-1 rounded-full bg-white/90 px-4 py-2 text-sm font-extrabold text-slate-700 shadow-sm">
          <Star className="h-4 w-4 text-amber-400" fill="currentColor" strokeWidth={1.5} /> {total} из {KEYS_LEVELS.length * 3}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {KEYS_LEVELS.map((l, i) => {
          const open = levelOpen(save.stars, i);
          const stars = save.stars[l.id] ?? 0;
          const inner = (
            <>
              <div className="mb-2 flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-2xl">{l.emoji}</span>
                {open ? <StarRow n={stars} /> : <Lock className="h-5 w-5 text-slate-400" strokeWidth={2.2} />}
              </div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Уровень {i + 1}</p>
              <h3 className="text-lg font-extrabold text-slate-800">{l.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{l.about}</p>
            </>
          );
          return open ? (
            <Link key={l.id} to={`/keys/${l.id}`} className="rounded-xl border border-[#e6e7ee] bg-white p-5 shadow-sm transition hover:-translate-y-1">
              {inner}
            </Link>
          ) : (
            <div key={l.id} className="rounded-3xl border-2 border-slate-200 bg-white/60 p-5 opacity-70" aria-disabled="true">
              {inner}
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex justify-center">
        <button type="button" onClick={() => setIntro(true)} className="rounded-full px-4 py-2 text-sm font-bold text-slate-400 hover:text-violet-600">
          Послушать начало ещё раз
        </button>
      </div>
    </div>
  );
}

function Keyboard({
  glow,
  flash,
  held,
  onKey,
}: {
  glow: Set<string>;
  flash: { code: string; ok: boolean } | null;
  held: { ctrl: boolean; shift: boolean };
  onKey: (code: string) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl select-none rounded-3xl border-4 border-slate-700 bg-slate-800 p-2 shadow-inner sm:p-3">
      {ROWS.map((row, r) => (
        <div key={r} className={`mb-1.5 flex gap-1.5 last:mb-0 ${r === 0 ? "justify-between" : ""}`}>
          {row.map((key) => {
            const isFlash = flash?.code === key.code;
            const isHeld = (held.ctrl && key.code.startsWith("Control")) || (held.shift && key.code.startsWith("Shift"));
            return (
              <button
                key={key.code}
                type="button"
                onClick={() => onKey(key.code)}
                style={{ flexGrow: r === 0 ? 0 : (key.w ?? 1), flexBasis: r === 0 ? `${(key.w ?? 1) * 3.2}rem` : 0 }}
                className={`relative flex h-11 min-w-0 items-center justify-center rounded-lg border-b-4 px-1 text-[clamp(0.6rem,1.6vw,1.05rem)] font-extrabold transition sm:h-14 ${
                  isFlash
                    ? flash!.ok
                      ? "border-emerald-700 bg-emerald-400 text-white"
                      : "border-rose-700 bg-rose-400 text-white"
                    : glow.has(key.code)
                      ? "animate-pulse border-amber-600 bg-amber-300 text-amber-950 shadow-[0_0_18px_#fbbf24]"
                      : isHeld
                        ? "border-violet-700 bg-violet-400 text-white"
                        : "border-slate-400 bg-slate-100 text-slate-800 hover:bg-white"
                }`}
              >
                <span className="truncate">{key.label}</span>
                {key.latin && <span className="absolute right-1 top-0.5 text-[0.55em] font-bold text-slate-400">{key.latin}</span>}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** Every level gets a fresh screen with new random tasks. */
export function KeysLevelPage() {
  const { level } = useParams();
  const [round, setRound] = useState(0);
  return <KeysLevelScreen key={`${level}:${round}`} onRestart={() => setRound((r) => r + 1)} />;
}

function KeysLevelScreen({ onRestart }: { onRestart: () => void }) {
  const { level: param } = useParams();
  const navigate = useNavigate();
  const save = keysStars.use();
  const index = KEYS_LEVELS.findIndex((l) => l.id === param);
  const level = KEYS_LEVELS[index];
  const [tasks] = useState<Task[]>(() => (level ? level.tasks() : []));
  const [at, setAt] = useState(0);
  const [pos, setPos] = useState(0); // the letter of the word being typed
  const [mistakes, setMistakes] = useState(0);
  const [taskMistakes, setTaskMistakes] = useState(0);
  const [flash, setFlash] = useState<{ code: string; ok: boolean } | null>(null);
  const [said, setSaid] = useState<string | null>(null);
  const [held, setHeld] = useState({ ctrl: false, shift: false }); // modifiers clicked on the screen
  const [finished, setFinished] = useState<number | null>(null);
  // the theory comes first on a new level; later it opens with the «Теория» button
  const [theory, setTheory] = useState(() => !!level && !(save.stars[level.id] > 0));
  const busy = useRef(false);

  const task = tasks[at];

  const next = useCallback(
    (text: string) => {
      busy.current = true;
      setSaid(text);
      emitPixel("correct");
      setTimeout(() => {
        busy.current = false;
        setPos(0);
        setTaskMistakes(0);
        setHeld({ ctrl: false, shift: false });
        if (at + 1 >= tasks.length) {
          const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
          keysStars.finish(level.id, stars);
          emitPixel("complete");
          setFinished(stars);
        } else {
          setAt(at + 1);
          setSaid(null);
        }
      }, 1100);
    },
    [at, tasks.length, mistakes, level],
  );

  const press = useCallback(
    (code: string, ctrl: boolean, shift: boolean) => {
      if (!task || busy.current || finished !== null) return;
      const show = (ok: boolean) => {
        setFlash({ code, ok });
        setTimeout(() => setFlash((f) => (f?.code === code ? null : f)), 450);
      };
      const wrong = () => {
        show(false);
        setMistakes((m) => m + 1);
        setTaskMistakes((m) => m + 1);
        emitPixel("wrong");
        const got = KEY_BY_CODE.get(code);
        setSaid(got ? `Это «${got.label}». Попробуй ещё раз!` : "Не та клавиша. Попробуй ещё раз!");
      };
      if (task.kind === "key") {
        if (task.codes.includes(code)) {
          show(true);
          next(task.about ? `Верно! ${task.name} ${task.about}.` : `Верно, это «${task.name}»!`);
        } else if (!MODIFIERS.has(code)) wrong();
        return;
      }
      if (MODIFIERS.has(code)) return; // a modifier alone is not an answer yet
      if (task.kind === "combo") {
        if (code === task.code && (task.mod === "ctrl" ? ctrl : shift)) {
          show(true);
          next(`Верно! ${task.name} ${task.about}.`);
        } else wrong();
        return;
      }
      const need = CODE_OF.get(task.word[pos]);
      if (code === need) {
        show(true);
        if (pos + 1 >= task.word.length) next(`Готово: «${task.word}»!`);
        else setPos(pos + 1);
      } else wrong();
    },
    [task, pos, next, finished],
  );

  // the real keyboard
  useEffect(() => {
    if (theory) return; // keys type nothing while the theory is open
    const onDown = (e: KeyboardEvent) => {
      if (/^F\d+$/.test(e.code)) return; // F5, F12 and the like stay with the browser
      e.preventDefault();
      if (e.repeat) return;
      press(e.code, e.ctrlKey || e.metaKey, e.shiftKey);
    };
    window.addEventListener("keydown", onDown);
    return () => window.removeEventListener("keydown", onDown);
  }, [press, theory]);

  if (!level) return <p className="text-center text-slate-500">Такого уровня нет. <Link to="/keys" className="font-bold text-violet-600">Ко всем уровням</Link></p>;
  if (!levelOpen(save.stars, index))
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-white/90 p-8 text-center">
        <p className="mb-4 text-5xl">🔒</p>
        <p className="mb-4 font-bold text-slate-600">Этот уровень пока закрыт. Пройди предыдущий!</p>
        <Link to="/keys" className="font-bold text-violet-600">
          Ко всем уровням →
        </Link>
      </div>
    );

  /** A click on the on-screen keyboard: Ctrl and Shift stay pressed until the next key. */
  function screenKey(code: string) {
    const isCtrl = code.startsWith("Control");
    const isShift = code.startsWith("Shift");
    const wantsThisModifier = task?.kind === "key" && task.codes.includes(code);
    if ((isCtrl || isShift) && !wantsThisModifier) {
      setHeld((h) => (isCtrl ? { ...h, ctrl: !h.ctrl } : { ...h, shift: !h.shift }));
      return;
    }
    press(code, held.ctrl, held.shift);
    if (!isCtrl && !isShift) setHeld({ ctrl: false, shift: false });
  }

  const glow = new Set<string>();
  if (task && taskMistakes >= level.hintAfter && !said?.startsWith("Верно") && !said?.startsWith("Готово")) {
    if (task.kind === "key") task.codes.slice(0, 2).forEach((c) => glow.add(c));
    if (task.kind === "combo") {
      glow.add(task.mod === "ctrl" ? "ControlLeft" : "ShiftLeft");
      glow.add(task.code);
    }
    if (task.kind === "word") glow.add(CODE_OF.get(task.word[pos]) ?? "");
  }

  const nextLevel = KEYS_LEVELS[index + 1];

  if (theory)
    return (
      <div>
        <p className="mb-4 text-center text-sm font-extrabold uppercase tracking-wide text-orange-500">
          {level.emoji} Уровень {index + 1}: {level.title}
        </p>
        <TheoryCard theory={KEYS_THEORY[level.id]} onDone={() => setTheory(false)} doneLabel="Понятно, к клавишам!" />
      </div>
    );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide text-orange-500">
            {level.emoji} Уровень {index + 1} из {KEYS_LEVELS.length}
          </p>
          <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl dark:text-slate-100">{level.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm font-extrabold text-slate-500">
          <TheoryButton onClick={() => setTheory(true)} />
          <span>
            Задание {Math.min(at + 1, tasks.length)} из {tasks.length}
          </span>
          <span>Ошибок: {mistakes}</span>
        </div>
      </div>

      {finished === null ? (
        <>
          <div className="mb-5 rounded-xl border border-[#e6e7ee] bg-white p-5 text-center shadow-sm sm:p-7">
            <p className="text-2xl font-extrabold text-slate-800 sm:text-3xl">{task?.say}</p>
            {task?.kind === "word" && (
              <p className="mt-4 font-mono text-5xl font-black tracking-[0.3em]">
                {[...task.word].map((ch, i) => (
                  <span key={i} className={i < pos ? "text-emerald-500" : i === pos ? "text-violet-600 underline decoration-4 underline-offset-8" : "text-slate-300"}>
                    {ch}
                  </span>
                ))}
              </p>
            )}
            {task?.kind === "key" && task.name.length === 1 && <p className="mt-3 text-7xl font-black text-violet-600">{task.name}</p>}
          </div>

          <div className="mb-5 flex items-end gap-3">
            <BoltFigure className="w-14 shrink-0 sm:w-16" />
            <div
              className={`flex-1 rounded-3xl rounded-bl-md border px-4 py-3 font-semibold ${
                said?.startsWith("Верно") || said?.startsWith("Готово")
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : said
                    ? "border-rose-200 bg-rose-50 text-rose-800"
                    : "border-orange-200 bg-orange-50 text-slate-700"
              }`}
            >
              {said ?? (level.hintAfter === 0 ? "Светящаяся клавиша подскажет, где искать." : "Найди клавишу сам. Если ошибёшься — я подсвечу нужную.")}
            </div>
          </div>

          <Keyboard glow={glow} flash={flash} held={held} onKey={screenKey} />
          <p className="mt-3 text-center text-sm text-slate-400">Нажимай клавиши на своей клавиатуре — или прямо на экране. Ctrl и Shift на экране «залипают» до следующей клавиши.</p>
          {task?.dev && (
            <div className="mx-auto mt-5 max-w-3xl">
              <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-violet-500">💻 Программисту на заметку</p>
              <CodeBox {...task.dev} />
            </div>
          )}
        </>
      ) : (
        <div className="mx-auto max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
          <p className="text-sm font-extrabold uppercase tracking-wide text-emerald-500">Уровень пройден!</p>
          <div className="my-3 flex justify-center">
            <StarRow n={finished} size="h-14 w-14" />
          </div>
          <p className="mb-4 font-semibold text-slate-600">
            {mistakes === 0 ? "Ни одной ошибки — вот это пальцы!" : `Ошибок: ${mistakes}. ${finished === 2 ? "Почти идеально!" : "Попробуй ещё раз — получится лучше!"}`}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={onRestart} className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-200 px-5 py-2.5 font-bold text-slate-600">
              <RotateCcw className="h-4 w-4" strokeWidth={2.2} /> Ещё раз
            </button>
            <button
              type="button"
              onClick={() => navigate(nextLevel ? `/keys/${nextLevel.id}` : "/keys")}
              className="rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-6 py-2.5 font-extrabold text-white shadow"
            >
              {nextLevel ? "Следующий уровень →" : "Ко всем уровням →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
