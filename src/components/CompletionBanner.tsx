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
  const { emoji, title } =
    ratio === 1
      ? { emoji: "🏆", title: "Идеально! Все задания решены верно." }
      : ratio >= 0.6
        ? { emoji: "🎉", title: "Отличный результат!" }
        : { emoji: "💪", title: "Неплохое начало — есть что повторить." };

  return (
    <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 text-center shadow-sm sm:p-8">
      <div className="mb-2 text-5xl">{emoji}</div>
      <h3 className="mb-1 text-xl font-extrabold text-slate-800">{title}</h3>
      <p className="mb-5 text-slate-500">
        Правильных ответов: <span className="font-bold text-slate-700">{score}</span> из{" "}
        {total}
      </p>
      <button
        type="button"
        onClick={onRestart}
        className="rounded-full border-2 border-indigo-200 bg-white px-6 py-2.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50"
      >
        Пройти задания ещё раз
      </button>
    </div>
  );
}
