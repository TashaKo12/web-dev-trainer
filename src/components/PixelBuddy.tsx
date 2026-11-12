import { useEffect, useRef, useState } from "react";
import { onPixel } from "../lib/pixelBus";
import { getStreak } from "../lib/game";

// Pixel the robot keeps a student company on every part of a topic: on each slide he peeks out from
// behind the task, hangs around, cheers right answers, comforts after mistakes, and when the part is
// done he pulls a funny face and runs back behind it.

type Mood = "happy" | "neutral" | "surprised" | "sad" | "thinking" | "wink" | "silly" | "love";
type Act = "jump" | "spin" | "dance" | "shake" | null;

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

const PRAISE = ["Супер!", "Так держать!", "Ты молодец!", "Отлично!", "Вот это да!", "Верно! Дай пять!", "Мозг на максимум!"];
const COMFORT = [
  "Почти! Попробуй ещё",
  "Ничего, ошибки — тоже учёба",
  "Хм… посмотри ещё раз",
  "Не сдавайся, у тебя получится",
  "Я тоже иногда путаюсь",
];
const JOKES: { mood: Mood; act: Act; text: string }[] = [
  { mood: "wink", act: null, text: "Псс… ты отлично справляешься" },
  { mood: "silly", act: "shake", text: "Бе-бе-бе! Просто так" },
  { mood: "happy", act: "spin", text: "Смотри, как умею!" },
  { mood: "happy", act: "dance", text: "Танцую, пока ты думаешь" },
  { mood: "thinking", act: null, text: "Интересно, а роботы видят сны?" },
  { mood: "love", act: "jump", text: "Люблю, когда учатся!" },
  { mood: "silly", act: null, text: "Я сегодня немножко глючу" },
  { mood: "surprised", act: "jump", text: "Ого, сколько кода!" },
];

export function PixelBuddy() {
  const [mood, setMood] = useState<Mood>("happy");
  const [act, setAct] = useState<Act>(null);
  const [say, setSay] = useState<string | null>("Привет! Я буду рядом");
  const [running, setRunning] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const [out, setOut] = useState(false);
  const [corner, setCorner] = useState(false);
  const outTimer = useRef<ReturnType<typeof setTimeout>>();
  const busyUntil = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function react(nextMood: Mood, nextAct: Act, text: string | null, ms = 2600) {
    timers.current.forEach(clearTimeout);
    setMood(nextMood);
    setAct(null);
    requestAnimationFrame(() => setAct(nextAct));
    setSay(text);
    busyUntil.current = Date.now() + ms;
    timers.current = [
      setTimeout(() => setSay(null), ms),
      setTimeout(() => {
        setMood("happy");
        setAct(null);
      }, ms + 200),
    ];
  }

  // opening a topic: come out from behind the first slide, say hello, then let the greeting fade
  useEffect(() => {
    setRunning(true);
    const a = setTimeout(() => setOut(true), 500);
    const b = setTimeout(() => setRunning(false), 1200);
    const c = setTimeout(() => setSay(null), 3200);
    return () => [a, b, c].forEach(clearTimeout);
  }, []);

  // answers from any task on the page
  useEffect(
    () =>
      onPixel((e) => {
        if (e === "correct") react(pick(["happy", "love", "wink"] as Mood[]), pick(["jump", "spin", "dance"] as Act[]), pick(PRAISE));
        else if (e === "wrong") react(pick(["sad", "thinking"] as Mood[]), "shake", pick(COMFORT), 3200);
        else if (e === "streak") react("love", "dance", `Серия ${getStreak().current} подряд! Огонь!`, 3000);
        else if (e === "achievement") react("love", "jump", "Новая награда! Ура!", 3000);
        else if (e === "enter") {
          // a new part of the topic: come out from behind it
          clearTimeout(outTimer.current);
          setOut(false);
          setRunning(true);
          outTimer.current = setTimeout(() => {
            setOut(true);
            react("happy", null, pick(["А вот и я!", "Ку-ку!", "Поехали дальше!", "Я тут, рядом"]), 2200);
            setTimeout(() => setRunning(false), 700);
          }, 450);
        } else {
          // the part is done: a funny face, then run back behind the task
          react(pick(["silly", "love", "wink"] as Mood[]), pick(["dance", "spin"] as Act[]), pick(["Готово! Бегу прятаться!", "Ура! Я побежал!", "Справились! Пока-пока!"]), 2400);
          clearTimeout(outTimer.current);
          outTimer.current = setTimeout(() => {
            setRunning(true);
            setOut(false);
            setTimeout(() => setRunning(false), 700);
          }, 2400);
        }
      }),
    [],
  );

  // stays to the left of the task block that is on screen (missions, practice, cards) and rides along with it
  useEffect(() => {
    let stop: ReturnType<typeof setTimeout>;
    let frame = 0;
    let last: { left: number; top: number } | null = null;
    const place = () => {
      frame = 0;
      const h = window.innerHeight;
      const slide = document.querySelector<HTMLElement>("[data-slide]");
      const r = slide?.getBoundingClientRect();
      if (!r || r.bottom < 120 || r.top > h - 120) {
        setPos(null);
        return;
      }
      // no room left of the task (phones, small windows): stand in the bottom-left corner instead
      const narrow = r.left < 104;
      setCorner(narrow);
      const left = narrow ? 4 : r.left - 88 - 12;
      const top = narrow ? h - 92 : Math.round(Math.min(Math.max(r.top + 16, 130), Math.min(r.bottom - 150, h - 170)));
      const next = { left: Math.round(left), top };
      if (last && (Math.abs(last.top - next.top) > 4 || Math.abs(last.left - next.left) > 4)) {
        setRunning(true);
        clearTimeout(stop);
        stop = setTimeout(() => setRunning(false), 450);
      }
      last = next;
      setPos(next);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(place);
    };
    place();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const poll = setInterval(schedule, 800); // blocks change size when answers open
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      clearInterval(poll);
      cancelAnimationFrame(frame);
      clearTimeout(stop);
    };
  }, []);

  // now and then fools around so studying is less boring
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const next = () => {
      t = setTimeout(() => {
        if (document.visibilityState === "visible" && Date.now() > busyUntil.current && document.querySelector(".pixel-buddy.is-out")) {
          const j = pick(JOKES);
          react(j.mood, j.act, j.text, 2800);
        }
        next();
      }, 22000 + Math.random() * 20000);
    };
    next();
    return () => clearTimeout(t);
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      clearTimeout(outTimer.current);
    },
    [],
  );

  return (
    <div className={`pixel-buddy ${pos ? "" : "is-away"} ${out ? "is-out" : "is-behind"} ${corner ? "is-corner" : ""}`} style={pos ?? undefined} aria-live="polite">
      {say && <p className="pixel-bubble">{say}</p>}
      <button
        type="button"
        className={`pixel-bot ${running ? "is-running" : ""} ${act ? `act-${act}` : ""}`}
        data-mood={mood}
        onClick={() => react("surprised", "shake", pick(["Ой! Щекотно!", "Эй, я работаю!", "Хи-хи!"]), 1800)}
        aria-label="Робот Пиксель"
      >
        <PixelFigure />
      </button>
    </div>
  );
}

/** The robot drawing itself; the face follows the data-mood of the element around it. */
export function PixelFigure() {
  return (
    <svg viewBox="0 0 120 152" aria-hidden="true">
      <defs>
        <linearGradient id="pbBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#818cf8" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <ellipse className="pb-shadow" cx="60" cy="148" rx="30" ry="4" />
      <g className="pb-whole">
        <g className="pb-leg pb-leg-l">
          <rect className="pb-metal" x="42" y="120" width="11" height="20" rx="5" />
          <rect className="pb-fill" x="37" y="136" width="20" height="8" rx="4" />
        </g>
        <g className="pb-leg pb-leg-r">
          <rect className="pb-metal" x="67" y="120" width="11" height="20" rx="5" />
          <rect className="pb-fill" x="63" y="136" width="20" height="8" rx="4" />
        </g>
        <g className="pb-arm pb-arm-l">
          <rect className="pb-metal" x="16" y="84" width="10" height="30" rx="5" />
          <circle className="pb-fill" cx="21" cy="116" r="7" />
        </g>
        <g className="pb-arm pb-arm-r">
          <rect className="pb-metal" x="94" y="84" width="10" height="30" rx="5" />
          <circle className="pb-fill" cx="99" cy="116" r="7" />
        </g>
        <rect className="pb-fill" x="28" y="78" width="64" height="46" rx="14" />
        <circle className="pb-light" cx="48" cy="98" r="3.5" />
        <circle className="pb-light pb-light-2" cx="60" cy="98" r="3.5" />
        <circle className="pb-light pb-light-3" cx="72" cy="98" r="3.5" />
        <rect className="pb-metal" x="52" y="72" width="16" height="8" rx="3" />
        <line x1="60" y1="18" x2="60" y2="7" stroke="#c7d2fe" strokeWidth="3" strokeLinecap="round" />
        <circle className="pb-antenna" cx="60" cy="6" r="5" />
        <rect className="pb-fill" x="22" y="16" width="76" height="58" rx="18" />
        <rect className="pb-metal" x="16" y="36" width="7" height="16" rx="3.5" />
        <rect className="pb-metal" x="97" y="36" width="7" height="16" rx="3.5" />
        <rect className="pb-screen" x="31" y="25" width="58" height="40" rx="12" />

        <g className="pb-eyes">
          <g data-for="neutral sad">
            <circle className="pb-face-fill" cx="48" cy="43" r="4.5" />
            <circle className="pb-face-fill" cx="72" cy="43" r="4.5" />
          </g>
          <path data-for="happy" className="pb-face" d="M42 45 q6 -8 12 0 M66 45 q6 -8 12 0" />
          <g data-for="surprised">
            <circle className="pb-face" cx="48" cy="42" r="6" />
            <circle className="pb-face" cx="72" cy="42" r="6" />
          </g>
          <g data-for="thinking">
            <circle className="pb-face-fill" cx="51" cy="40" r="4.5" />
            <circle className="pb-face-fill" cx="75" cy="40" r="4.5" />
          </g>
          <g data-for="wink">
            <path className="pb-face" d="M42 44 h12" />
            <circle className="pb-face-fill" cx="72" cy="43" r="4.5" />
          </g>
          <g data-for="silly">
            <circle className="pb-face" cx="47" cy="42" r="6.5" />
            <circle className="pb-face-fill" cx="49" cy="44" r="2.5" />
            <circle className="pb-face-fill" cx="73" cy="43" r="3" />
          </g>
          <path
            data-for="love"
            className="pb-heart"
            d="M48 49 l-6 -6 a3.5 3.5 0 0 1 6 -4 a3.5 3.5 0 0 1 6 4 z M72 49 l-6 -6 a3.5 3.5 0 0 1 6 -4 a3.5 3.5 0 0 1 6 4 z"
          />
        </g>
        <path data-for="sad" className="pb-face" d="M41 36 l10 -3 M79 36 l-10 -3" />
        <path data-for="thinking" className="pb-face" d="M66 32 l12 -2" />
        <path data-for="happy wink love" className="pb-face" d="M48 54 q12 9 24 0" />
        <path data-for="neutral" className="pb-face" d="M50 56 h20" />
        <ellipse data-for="surprised" className="pb-face" cx="60" cy="57" rx="4" ry="4.5" />
        <path data-for="sad" className="pb-face" d="M49 59 q11 -7 22 0" />
        <path data-for="thinking" className="pb-face" d="M52 57 q4 -3 8 0 t8 0" />
        <g data-for="silly">
          <path className="pb-face" d="M47 53 q13 8 26 0" />
          <path className="pb-tongue" d="M60 56 q8 1 7 7 q-4 5 -9 0 z" />
        </g>
      </g>
    </svg>
  );
}
