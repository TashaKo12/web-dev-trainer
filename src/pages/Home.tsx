import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, FileCode, Star } from "lucide-react";
import { GamePanel, Stars } from "../components/GamePanel";
import { starsFor, useGame } from "../lib/game";
import { loadJSON, saveJSON } from "../lib/storage";
import { trainers, type TrainerMeta } from "../trainers/registry";

const SECTIONS: { key: TrainerMeta["section"]; file: string; title: string; description: string; cls: string }[] = [
  {
    key: "html",
    file: "index.html",
    title: "HTML — разметка страницы",
    description: "Теги, которыми ты описываешь СОДЕРЖИМОЕ страницы: заголовки, текст, картинки, ссылки, формы.",
    cls: "border-sky-200 bg-sky-50 text-sky-700",
  },
  {
    key: "css",
    file: "style.css",
    title: "CSS — оформление",
    description: "Это уже ДРУГОЙ файл — style.css. В нём ничего не рассказывается, а только красится и расставляется то, что уже есть в HTML.",
    cls: "border-violet-200 bg-violet-50 text-violet-700",
  },
  {
    key: "js",
    file: "script.js",
    title: "JavaScript — поведение",
    description: "Третий файл — script.js. Он оживляет страницу: реагирует на клики и меняет содержимое.",
    cls: "border-amber-200 bg-amber-50 text-amber-700",
  },
];

const OPEN_KEY = "home-open"; // a view preference only: not part of the progress

export function Home() {
  const { reports } = useGame();
  const stars = Object.fromEntries(reports.map((r) => [r.meta.id, { count: starsFor(r), solved: r.solved, total: r.statuses.length }]));
  const [open, setOpen] = useState<string[]>(() => loadJSON<string[]>(OPEN_KEY) ?? []);

  function toggle(key: string) {
    setOpen((o) => {
      const next = o.includes(key) ? o.filter((k) => k !== key) : [...o, key];
      saveJSON(OPEN_KEY, next);
      return next;
    });
  }

  return (
    <div>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 sm:text-4xl dark:text-slate-100">
          Выбери тренажёр и прокачай веб-разработку
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-500 dark:text-slate-400">
          Сначала короткая интерактивная теория с живыми примерами, потом —
          задания на закрепление.
        </p>
      </div>

      <GamePanel />

      <div className="space-y-4">
        {SECTIONS.map((section) => {
          const items = trainers.filter((t) => t.section === section.key);
          if (items.length === 0) return null;
          const isOpen = open.includes(section.key);
          const done = items.filter((t) => (stars[t.id]?.count ?? 0) > 0).length;
          const starSum = items.reduce((a, t) => a + (stars[t.id]?.count ?? 0), 0);
          return (
            <section key={section.key} className="overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
              <button
                type="button"
                onClick={() => toggle(section.key)}
                aria-expanded={isOpen}
                className="flex w-full flex-wrap items-center gap-x-4 gap-y-3 p-5 text-left sm:p-6"
              >
                <span className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-mono text-xs font-bold dark:brightness-125 ${section.cls}`}>
                  <FileCode className="h-3.5 w-3.5" strokeWidth={2} />
                  {section.file}
                </span>
                <span className="min-w-[12rem] flex-1">
                  <span className="block text-xl font-extrabold text-slate-800">{section.title}</span>
                  <span className="mt-1 block text-sm text-slate-500">{section.description}</span>
                </span>
                <span className="flex items-center gap-4">
                  <span className="text-right">
                    <span className="block text-sm font-extrabold text-slate-700">
                      {done} из {items.length} {items.length % 10 === 1 && items.length % 100 !== 11 ? "темы" : "тем"}
                    </span>
                    <span className="mt-0.5 flex items-center justify-end gap-1 text-xs font-bold text-amber-500">
                      <Star className="h-3.5 w-3.5" strokeWidth={2.2} fill="currentColor" />
                      {starSum} / {items.length * 3}
                    </span>
                  </span>
                  <ChevronDown className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} strokeWidth={2} />
                </span>
              </button>

              {isOpen && (
                <div className="grid animate-fade-in gap-3 border-t border-slate-200 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
                  {items.map((t) => {
                    const p = stars[t.id];
                    const Icon = t.icon;
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
                          <span className="mt-1 block text-xs">
                            {p && p.count > 0 ? (
                              <Stars count={p.count} />
                            ) : p && p.solved > 0 ? (
                              <span className="font-bold text-slate-400">
                                решено {p.solved}/{p.total}
                              </span>
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
