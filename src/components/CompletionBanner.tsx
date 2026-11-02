import { Trophy, Sparkles, Target } from "lucide-react";

export function CompletionBanner({
  score,
  total,
  onRestart,
}: {
  score: number;
  total: number;
  onRestart: () => void;
}) {
  const ratio = score / total;
  const { Icon, title } =
    ratio === 1
      ? { Icon: Trophy, title: "Идеально! Все задания решены верно." }
      : ratio >= 0.6
        ? { Icon: Sparkles, title: "Отличный результат!" }
        : { Icon: Target, title: "Неплохое начало — есть что повторить." };

  return (
    <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 text-center shadow-sm dark:border-indigo-800/40 dark:from-indigo-950/40 dark:to-violet-950/40 sm:p-8">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
        <Icon className="h-7 w-7" strokeWidth={1.75} />
      </div>
      <h3 className="mb-1 text-xl font-extrabold text-slate-800">{title}</h3>
      <p className="mb-5 text-slate-500">
        Правильных ответов: <span className="font-bold text-slate-700">{score}</span> из{" "}
        {total}
      </p>
      <button
        type="button"
        onClick={onRestart}
        className="rounded-full border-2 border-indigo-200 bg-white px-6 py-2.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950/40"
      >
        Пройти задания ещё раз
      </button>
    </div>
  );
}
