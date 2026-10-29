export function TrainerHero({
  emoji,
  title,
  summary,
  gradient,
}: {
  emoji: string;
  title: string;
  summary: string;
  gradient: string;
}) {
  return (
    <div className="mb-10 text-center">
      <div
        className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-3xl shadow-lg`}
      >
        {emoji}
      </div>
      <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl">
        {title}
      </h1>
      <p className="mx-auto mt-2 max-w-xl text-slate-500">{summary}</p>
    </div>
  );
}
