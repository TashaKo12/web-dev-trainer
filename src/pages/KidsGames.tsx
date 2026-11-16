import { Link } from "react-router-dom";
import { PixelFigure } from "../components/PixelBuddy";

// «1 ступень» on the home page: the three games for children 7–9.

const GAMES = [
  { to: "/quest", title: "Тайна станции", about: "Собирай программу из блоков и веди Пикселя по станции.", grad: "from-indigo-950 via-violet-900 to-fuchsia-900", icon: "🛰️" },
  { to: "/logic", title: "Остров загадок", about: "Узоры, весы, «кто где живёт» — игра на логику.", grad: "from-sky-900 via-cyan-800 to-emerald-800", icon: "💡" },
  { to: "/keys", title: "Клавиатура Пикселя", about: "Найди клавиши и узнай, что они умеют.", grad: "from-amber-800 via-orange-700 to-rose-800", icon: "⌨️" },
];

export function KidsGames() {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-lg font-black text-white shadow">1</span>
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">1 ступень · игры для 7–9 лет</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Алгоритмы, логика и клавиатура вместе с роботом Пикселем.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {GAMES.map((g, i) => (
          <Link
            key={g.to}
            to={g.to}
            className={`group relative flex items-center gap-3 overflow-hidden rounded-3xl border-2 border-white/30 bg-gradient-to-br ${g.grad} p-5 text-white shadow-lg transition hover:-translate-y-1`}
          >
            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgb(255_255_255/0.16),transparent_55%)]" />
            {i === 0 ? (
              <span className="pixel-bot quest-bot relative h-16 shrink-0" data-mood="wink">
                <PixelFigure />
              </span>
            ) : (
              <span className="relative text-5xl">{g.icon}</span>
            )}
            <span className="relative min-w-0">
              <span className="block text-lg font-extrabold">{g.title}</span>
              <span className="mt-0.5 block text-sm text-white/80">{g.about}</span>
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-8 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 text-lg font-black text-white shadow">2</span>
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">2 ступень · веб-разработка</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">HTML, CSS и JavaScript по урокам курса.</p>
        </div>
      </div>
    </section>
  );
}
