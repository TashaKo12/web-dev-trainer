import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Layers, Search, Star } from "lucide-react";
import { Stars } from "../components/GamePanel";
import { SectionTitle } from "./KidsGames";
import { CatalogBanner } from "../components/CatalogBanner";
import { starsFor, useGame } from "../lib/game";
import { loadJSON, saveJSON } from "../lib/storage";
import { LESSONS, trainers, type TrainerMeta } from "../trainers/registry";

// The web courses. Course 1 is grouped by its 13 lessons; course 2 by language: HTML, CSS and JavaScript.

const FILE: Record<TrainerMeta["section"], { label: string; cls: string }> = {
  html: { label: "HTML", cls: "border-sky-200 bg-sky-50 text-sky-700" },
  css: { label: "CSS", cls: "border-violet-200 bg-violet-50 text-violet-700" },
  js: { label: "JS", cls: "border-amber-200 bg-amber-50 text-amber-700" },
  python: { label: "PY", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  sql: { label: "SQL", cls: "border-cyan-200 bg-cyan-50 text-cyan-700" },
};

const OPEN_KEY = "home-open-lessons"; // view preferences only: not part of the progress
const COURSE_KEY = "home-course";

const COURSE_2: { key: TrainerMeta["section"]; title: string; note: string }[] = [
  { key: "html", title: "HTML", note: "Разметка посложнее." },
  { key: "css", title: "CSS", note: "Стили и анимации посложнее." },
  { key: "js", title: "JavaScript", note: "Программы на странице: функции, аргументы и работа с элементами." },
];

const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10;
  const m100 = n % 100;
  return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many;
};

type Group = { key: string; badge: string | null; kicker?: string; title: string; note?: string; items: TrainerMeta[] };

type TopicStars = { count: number; solved: number; total: number } | undefined;

function TopicCard({ t, p }: { t: TrainerMeta; p: TopicStars }) {
  const Icon = t.icon;
  const file = FILE[t.section];
  return (
    <Link
      to={t.path}
      className="group flex items-center gap-3 rounded-xl border border-[#e6e7ee] bg-white p-3.5 transition hover:-translate-y-0.5 hover:border-[#c4b5fd] hover:shadow-md dark:border-slate-800"
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${t.gradient}`}>
        <Icon className="h-5 w-5 text-white" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 block text-sm font-bold leading-snug text-slate-800 group-hover:text-[#4d16c9]" title={t.title}>
          {t.title}
        </span>
        <span className="mt-1 flex items-center gap-2 text-xs">
          <span className={`rounded-md border px-1.5 font-mono text-[0.625rem] font-bold ${file.cls}`}>{file.label}</span>
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
}

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

  const [course, setCourse] = useState<1 | 2>(() => (loadJSON<number>(COURSE_KEY) === 2 ? 2 : 1));
  function pickCourse(c: 1 | 2) {
    setCourse(c);
    saveJSON(COURSE_KEY, c);
  }

  const web = trainers.filter((t) => t.section !== "python" && t.section !== "sql");
  const first = web.filter((t) => (t.course ?? 1) === 1);
  const second = web.filter((t) => t.course === 2);
  const groups: Group[] =
    course === 1
      ? [
          ...LESSONS.map((title, i) => ({ key: `lesson-${i + 1}`, badge: String(i + 1), kicker: `Урок ${i + 1}`, title, items: first.filter((t) => t.lesson === i + 1) })),
          { key: "extra", badge: null, title: "Дополнительно", note: "Темы, которые не встречаются в проектах уроков, — для тех, кто хочет больше.", items: first.filter((t) => !t.lesson) },
        ].filter((g) => g.items.length)
      : COURSE_2.map((c) => ({ key: `c2-${c.key}`, badge: c.key.toUpperCase(), kicker: "2 курс", title: c.title, note: c.note, items: second.filter((t) => t.section === c.key) }));

  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const foundTopics = q ? trainers.filter((t) => t.title.toLowerCase().includes(q)) : [];

  return (
    <div>
      <CatalogBanner image="web" kicker="Онлайн-обучение" title="«Тренажёры» — учимся программировать" />

      <div className="mb-5 flex">
        <span className="inline-flex items-center gap-2 rounded-lg border border-[#e6e7ee] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-800">
          <Layers className="h-4 w-4 text-[#4d16c9] dark:text-violet-300" strokeWidth={2} /> Курсы
        </span>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <label className="flex min-w-[14rem] flex-1 items-center gap-2 rounded-lg bg-[#e4e6ec] px-3.5 dark:bg-slate-800">
          <Search className="h-4 w-4 shrink-0 text-slate-500" strokeWidth={2} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по курсам и темам"
            className="h-11 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-500 dark:text-slate-100"
          />
        </label>
      </div>

      {q ? (
        <section>
          <SectionTitle color="#8b5cf6">Найдено: {foundTopics.length}</SectionTitle>
          {foundTopics.length === 0 && <p className="text-slate-500">Ничего не нашлось. Попробуй другое слово.</p>}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {foundTopics.map((t) => (
              <TopicCard key={t.id} t={t} p={stars[t.id]} />
            ))}
          </div>
        </section>
      ) : (
      <>
      {/* the course page shows only its own lessons: the games of «1 ступень» open from the catalog of all courses */}
      <SectionTitle color="#8b5cf6">Веб-разработка (2 ступень)</SectionTitle>
      <div className="mb-6">
        <p className="max-w-3xl text-sm text-slate-500 dark:text-slate-400">
          {course === 1
            ? "Темы разложены по урокам курса: в каждом уроке — 3–5 тем, которые пригодятся в его проекте."
            : "Второй курс разделён на HTML, CSS и JavaScript."}{" "}
          Внутри темы сначала теория с живыми примерами, потом задания.
        </p>
        <div role="tablist" aria-label="Курс" className="mt-4 inline-flex gap-1 rounded-lg bg-[#e4e6ec] p-1 dark:bg-slate-800">
          {([1, 2] as const).map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={course === c}
              onClick={() => pickCourse(c)}
              className={`rounded-md px-5 py-2 text-sm font-semibold transition ${
                course === c ? "bg-white text-[#4d16c9] shadow-sm dark:bg-slate-950 dark:text-violet-300" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {c} курс
            </button>
          ))}
        </div>
      </div>

      {/* the rank and the achievements live on «Мой прогресс» — the course page shows only the lessons */}
      <div className="space-y-4">
        {groups.map((g) => {
          const isOpen = open.includes(g.key);
          const done = g.items.filter((t) => (stars[t.id]?.count ?? 0) > 0).length;
          const starSum = g.items.reduce((a, t) => a + (stars[t.id]?.count ?? 0), 0);
          return (
            <section key={g.key} className="overflow-hidden rounded-xl border border-[#e6e7ee] bg-white shadow-sm dark:border-slate-800">
              <button type="button" onClick={() => toggle(g.key)} aria-expanded={isOpen} className="flex w-full flex-wrap items-center gap-x-4 gap-y-3 p-5 text-left sm:p-6">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${
                    g.badge ? "bg-[#4d16c9] text-white" : "bg-slate-100 text-slate-400"
                  } ${g.badge && g.badge.length > 2 ? "text-xs" : ""}`}
                >
                  {g.badge ?? "+"}
                </span>
                <span className="min-w-[12rem] flex-1">
                  {g.kicker && <span className="block text-xs font-bold uppercase tracking-wide text-slate-400">{g.kicker}</span>}
                  <span className="block text-lg font-bold text-slate-800">{g.title}</span>
                  {g.note && <span className="mt-1 block text-sm text-slate-500">{g.note}</span>}
                </span>
                <span className="flex items-center gap-4">
                  {g.items.length ? (
                    <span className="text-right">
                      <span className="block text-sm font-extrabold text-slate-700">
                        {done} из {g.items.length} {plural(g.items.length, "темы", "тем", "тем")}
                      </span>
                      <span className="mt-0.5 flex items-center justify-end gap-1 text-xs font-bold text-amber-500">
                        <Star className="h-3.5 w-3.5" strokeWidth={2.2} fill="currentColor" />
                        {starSum} / {g.items.length * 3}
                      </span>
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-slate-400">скоро</span>
                  )}
                  <ChevronDown className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} strokeWidth={2} />
                </span>
              </button>

              {isOpen && !g.items.length && (
                <p className="animate-fade-in border-t border-slate-200 p-5 text-sm text-slate-400">Темы появятся позже.</p>
              )}
              {isOpen && g.items.length > 0 && (
                <div className="grid animate-fade-in gap-3 border-t border-slate-200 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
                  {g.items.map((t) => {
                    return <TopicCard key={t.id} t={t} p={stars[t.id]} />;
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
      </>
      )}
    </div>
  );
}
