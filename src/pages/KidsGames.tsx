import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PixelFigure } from "../components/PixelBuddy";

// «1 ступень» on the home page: the three games for children 7–9, as catalog cards.

export const GAMES = [
  { to: "/quest", title: "Тайна станции", about: "Собирай программу из блоков, а на второй станции — пиши код словами.", grad: "from-[#2e1065] via-[#5b21b6] to-[#a21caf]", icon: "🛰️" },
  { to: "/logic", title: "Остров загадок", about: "Узоры, весы, «кто где живёт» — игра на логику.", grad: "from-[#0c4a6e] via-[#0e7490] to-[#047857]", icon: "💡" },
  { to: "/keys", title: "Клавиатура Пикселя", about: "Найди клавиши и узнай, что они умеют.", grad: "from-[#9a3412] via-[#c2410c] to-[#be123c]", icon: "⌨️" },
];

export function SectionTitle({ children, color = "#3b82f6" }: { children: ReactNode; color?: string }) {
  return (
    <h2 className="mb-4 flex items-center gap-3 text-base font-bold text-slate-800 sm:text-lg dark:text-slate-100">
      <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: color }} />
      {children}
    </h2>
  );
}

export function GameCard({ g, pixel = false }: { g: (typeof GAMES)[number]; pixel?: boolean }) {
  return (
    <Link
      to={g.to}
      className="group flex flex-col overflow-hidden rounded-xl border border-[#e6e7ee] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800"
    >
      <span className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${g.grad}`}>
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgb(255_255_255/0.2),transparent_55%)]" />
        {pixel ? (
          <span className="pixel-bot quest-bot relative h-20" data-mood="wink">
            <PixelFigure />
          </span>
        ) : (
          <span className="relative text-6xl drop-shadow">{g.icon}</span>
        )}
      </span>
      <span className="flex flex-1 flex-col p-4">
        <span className="mb-2 w-fit rounded-md bg-[#f1f2f6] px-2 py-0.5 text-[0.6875rem] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">7–9 лет · игра</span>
        <span className="block font-bold text-slate-800 group-hover:text-[#4d16c9]">{g.title}</span>
        <span className="mt-1 block text-sm text-slate-500">{g.about}</span>
      </span>
    </Link>
  );
}

export function KidsGames() {
  return (
    <section className="mb-10">
      <SectionTitle>Программирование (1 ступень)</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g, i) => (
          <GameCard key={g.to} g={g} pixel={i === 0} />
        ))}
      </div>
    </section>
  );
}
