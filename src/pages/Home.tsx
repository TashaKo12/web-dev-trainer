import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Star } from "lucide-react";
import { GamePanel, Stars } from "../components/GamePanel";
import { starsFor, useGame } from "../lib/game";
import { loadJSON, saveJSON } from "../lib/storage";
import { LESSONS, trainers, type TrainerMeta } from "../trainers/registry";

// The web course grouped by lessons: each topic sits in the lesson where it is first used.

const FILE: Record<TrainerMeta["section"], { label: string; cls: string }> = {
  html: { label: "HTML", cls: "border-sky-200 bg-sky-50 text-sky-700" },
  css: { label: "CSS", cls: "border-violet-200 bg-violet-50 text-violet-700" },
  js: { label: "JS", cls: "border-amber-200 bg-amber-50 text-amber-700" },
  python: { label: "PY", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
};

const OPEN_KEY = "home-open-lessons"; // a view preference only: not part of the progress

const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10;
  const m100 = n % 100;
  return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many;
};

type Group = { key: string; number: number | null; title: string; items: TrainerMeta[] };

export function Home() {
  const { reports } = useGame();
  const stars = Object.fromEntries(reports.map((r) => [r.meta.id, { count: starsFor(r), solved: r.solved, total: r.statuses.length }]));
  const [open, setOpen] = useState<string[]>(() => loadJSON<string[]>(OPEN_KEY) ?? ["lesson-1"]);

  function toggle(key: string) {
    setOpen((o) => {
      const next = o.includes(key) ? o.filter((k) => k !== key) : [...o, key];
      saveJSON(OPEN_KEY, next);
      return next;
    });
  }

  const web = trainers.filter((t) => t.section !== "python");
  const groups: Group[] = [
    ...LESSONS.map((title, i) => ({ key: `lesson-${i + 1}`, number: i + 1, title, items: web.filter((t) => t.lesson === i + 1) })),
    { key: "extra", number: null, title: "Дополнительно", items: web.filter((t) => !t.lesson) },
  ].filter((g) => g.items.length);

  return (
    <div>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 sm:text-4xl dark:text-slate-100">Выбери урок и прокачай веб-разработку</h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-500 dark:text-slate-400">
          Темы разложены по урокам курса: в каждом уроке — то, что впервые понадобится в его проекте. Внутри темы сначала
          теория с живыми примерами, потом задания.
        </p>
      </div>

      <GamePanel />

      <div className="space-y-4">
        {groups.map((g) => {
          const isOpen = open.includes(g.key);
          const done = g.items.filter((t) => (stars[t.id]?.count ?? 0) > 0).length;
          const starSum = g.items.reduce((a, t) => a + (stars[t.id]?.count ?? 0), 0);
          return (
            <section key={g.key} className="overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
              <button type="button" onClick={() => toggle(g.key)} aria-expanded={isOpen} className="flex w-full flex-wrap items-center gap-x-4 gap-y-3 p-5 text-left sm:p-6">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold ${
                    g.number ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {g.number ?? "+"}
                </span>
                <span className="min-w-[12rem] flex-1">
                  {g.number && <span className="block text-xs font-bold uppercase tracking-wide text-slate-400">Урок {g.number}</span>}
                  <span className="block text-xl font-extrabold text-slate-800">{g.title}</span>
                  {!g.number && <span className="mt-1 block text-sm text-slate-500">Темы, которые не встречаются в проектах уроков, — для тех, кто хочет больше.</span>}
                </span>
                <span className="flex items-center gap-4">
                  <span className="text-right">
                    <span className="block text-sm font-extrabold text-slate-700">
                      {done} из {g.items.length} {plural(g.items.length, "темы", "тем", "тем")}
                    </span>
                    <span className="mt-0.5 flex items-center justify-end gap-1 text-xs font-bold text-amber-500">
                      <Star className="h-3.5 w-3.5" strokeWidth={2.2} fill="currentColor" />
                      {starSum} / {g.items.length * 3}
                    </span>
                  </span>
                  <ChevronDown className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} strokeWidth={2} />
                </span>
              </button>

              {isOpen && (
                <div className="grid animate-fade-in gap-3 border-t border-slate-200 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
                  {g.items.map((t) => {
                    const p = stars[t.id];
                    const Icon = t.icon;
                    const file = FILE[t.section];
                    return (
                      <Link
                        key={t.id}
                        to={t.path}
                        className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                      >
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${t.gradient}`}>
                          <Icon className="h-5 w-5 text-white" strokeWidth={1.75} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-2 block text-sm font-extrabold leading-snug text-slate-800" title={t.title}>
                            {t.title}
                          </span>
                          <span className="mt-1 flex items-center gap-2 text-xs">
                            <span className={`rounded-md border px-1.5 font-mono text-[10px] font-bold ${file.cls}`}>{file.label}</span>
                            {p && p.count > 0 ? (
                              <Stars count={p.count} />
                            ) : p && p.solved > 0 ? (
                              <span className="font-bold text-slate-400">решено {p.solved}/{p.total}</span>
                            ) : (
                              <span className="text-slate-400">не начато</span>
                            )}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
