import { Link } from "react-router-dom";
import { trainers } from "../trainers/registry";
import { getAllProgress } from "../lib/progress";

export function Home() {
  const progress = getAllProgress();

  return (
    <div>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 sm:text-4xl">
          Выбери тренажёр и прокачай веб-разработку 🚀
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-500">
          Сначала короткая интерактивная теория с живыми примерами, потом —
          4–5 заданий на закрепление. Прогресс сохраняется в этом браузере.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {trainers.map((t) => {
          const p = progress[t.id];
          return (
            <Link
              key={t.id}
              to={t.path}
              className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(0,0,0,0.1)]"
            >
              <div
                className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${t.gradient} opacity-15 blur-xl`}
              />
              <div className="mb-3 text-4xl">{t.emoji}</div>
              <h2 className="mb-1.5 text-lg font-extrabold text-slate-800">
                {t.title}
              </h2>
              <p className="mb-4 text-sm text-slate-500">{t.summary}</p>
              <div className="flex items-center justify-between text-sm font-bold">
                <span
                  className={`rounded-full bg-gradient-to-r ${t.gradient} bg-clip-text text-transparent`}
                >
                  Начать →
                </span>
                {p ? (
                  <span className="text-slate-400">
                    {p.score}/{p.total} ✅
                  </span>
                ) : (
                  <span className="text-slate-300">не пройдено</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
