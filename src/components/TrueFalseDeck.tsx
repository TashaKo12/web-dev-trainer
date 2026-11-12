import { useEffect, useState } from "react";
import { emitPixel } from "../lib/pixelBus";
import { useLocation } from "react-router-dom";
import { loadJSON, POINTS, reportPoints, saveJSON } from "../lib/storage";
import { Trophy, Sparkles, Target, Check, X } from "lucide-react";

export type TrueFalseStatement = {
  text: string;
  answer: boolean;
  explain: string;
};

export function TrueFalseDeck({
  statements,
  accent = "from-indigo-500 to-violet-600",
}: {
  statements: TrueFalseStatement[];
  accent?: string;
}) {
  const { pathname } = useLocation();
  const sessionKey = `wdt:cards:${pathname}`;
  const saved = useState(() => {
    const s = loadJSON<{ index: number; picks: (boolean | null)[] }>(sessionKey);
    return s && Array.isArray(s.picks) && s.picks.length === statements.length ? s : null;
  })[0];

  const [index, setIndex] = useState(() => Math.min(Math.max(saved?.index ?? 0, 0), statements.length - 1));
  const [picks, setPicks] = useState<(boolean | null)[]>(() => saved?.picks ?? statements.map(() => null));
  const [showResult, setShowResult] = useState(false);

  const total = statements.length;
  const current = statements[index];
  const picked = picks[index];
  const score = picks.filter((p, i) => p === statements[i].answer).length;

  useEffect(() => {
    saveJSON(sessionKey, { index, picks });
  }, [sessionKey, index, picks]);

  useEffect(() => {
    reportPoints(`cards:${pathname}`, score * POINTS.card);
  }, [pathname, score]);

  function pick(value: boolean) {
    if (picked !== null) return;
    emitPixel(value === statements[index].answer ? "correct" : "wrong");
    setPicks((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function goNext() {
    if (index < total - 1) setIndex(index + 1);
    else setShowResult(true);
  }

  function goPrev() {
    if (index > 0) setIndex(index - 1);
  }

  function restart() {
    setPicks(statements.map(() => null));
    setIndex(0);
    setShowResult(false);
  }

  if (showResult) {
    const ratio = score / total;
    const { Icon, title } =
      ratio === 1
        ? { Icon: Trophy, title: "Идеально! Угадал все карточки." }
        : ratio >= 0.6
          ? { Icon: Sparkles, title: "Отличный результат!" }
          : { Icon: Target, title: "Неплохо — можно пролистать ещё раз." };

    return (
      <div data-deck className="rounded-3xl border border-white/70 bg-white/90 p-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
          <Icon className="h-7 w-7" strokeWidth={1.75} />
        </div>
        <h3 className="mb-1 text-xl font-extrabold text-slate-800">{title}</h3>
        <p className="mb-5 text-slate-500">
          Угадано: <span className="font-bold text-slate-700">{score}</span> из {total}
        </p>
        <button
          type="button"
          onClick={restart}
          className={`rounded-full bg-gradient-to-r ${accent} px-6 py-2.5 text-sm font-bold text-white shadow`}
        >
          Пролистать ещё раз
        </button>
      </div>
    );
  }

  return (
    <div data-deck className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="whitespace-nowrap text-xs font-bold uppercase tracking-wide text-slate-400">
          Карточка {index + 1} из {total}
        </span>
        <div className="flex flex-wrap justify-end gap-1">
          {statements.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-4 rounded-full ${
                i === index ? `bg-gradient-to-r ${accent}` : picks[i] !== null ? "bg-slate-300" : "bg-slate-100"
              }`}
            />
          ))}
        </div>
      </div>

      <p className="mb-6 min-h-[3.5rem] text-lg font-semibold text-slate-800">{current.text}</p>

      {picked === null ? (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => pick(true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border-2 border-emerald-200 bg-emerald-50 py-3 text-sm font-bold text-emerald-700 transition hover:border-emerald-400"
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
            Верно
          </button>
          <button
            type="button"
            onClick={() => pick(false)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border-2 border-rose-200 bg-rose-50 py-3 text-sm font-bold text-rose-700 transition hover:border-rose-400"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
            Неверно
          </button>
        </div>
      ) : (
        <div className={`rounded-2xl p-4 text-sm ${picked === current.answer ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
          <p className="font-bold">
            {picked === current.answer ? "Угадал! " : "Не угадал. "}
            Это {current.answer ? "верное" : "неверное"} утверждение.
          </p>
          <p className="mt-1">{current.explain}</p>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrev}
          disabled={index === 0}
          className="rounded-full border-2 border-slate-200 px-4 py-1.5 text-sm font-bold text-slate-500 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ← Назад
        </button>
        {picked !== null && (
          <button
            type="button"
            onClick={goNext}
            className={`rounded-full bg-gradient-to-r ${accent} px-5 py-2 text-sm font-bold text-white shadow`}
          >
            {index === total - 1 ? "Результат →" : "Следующая →"}
          </button>
        )}
      </div>
    </div>
  );
}
