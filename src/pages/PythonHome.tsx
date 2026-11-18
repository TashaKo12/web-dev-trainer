import { Link } from "react-router-dom";
import { Braces, CircleCheck, FileCode, List, type LucideIcon } from "lucide-react";
import { trainers } from "../trainers/registry";
import { getAllProgress } from "../lib/progress";
import { CatalogBanner } from "../components/CatalogBanner";

const UPCOMING: { title: string; summary: string; icon: LucideIcon }[] = [
  { title: "Списки", summary: "Храним много значений в одной переменной и перебираем их циклом.", icon: List },
  { title: "Функции", summary: "Даём кусочку программы имя и вызываем его, когда нужно.", icon: Braces },
];

const CARD =
  "relative overflow-hidden rounded-xl border border-[#e6e7ee] bg-white p-6 shadow-sm dark:border-slate-800";

export function PythonHome() {
  const progress = getAllProgress();
  const topics = trainers.filter((t) => t.section === "python");

  return (
    <div>
      <div className="mb-8">
        <CatalogBanner
          icon={<FileCode className="h-8 w-8" strokeWidth={2} />}
          kicker="main.py — файл с программой на Python"
          title="Тренажёр по Python"
          note="Учимся писать настоящие программы. В каждой теме — игра с живым терминалом, где сразу видно, что напечатает твой код, а потом практика с заданиями."
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {topics.map((t) => {
          const p = progress[t.id];
          const Icon = t.icon;
          return (
            <Link key={t.id} to={t.path} className={`group ${CARD} transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(0,0,0,0.1)]`}>
              <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${t.gradient} opacity-15 blur-xl`} />
              <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${t.gradient}`}>
                <Icon className="h-5 w-5 text-white" strokeWidth={1.75} />
              </div>
              <h3 className="mb-1.5 text-lg font-extrabold text-slate-800">{t.title}</h3>
              <p className="mb-4 text-sm text-slate-500">{t.summary}</p>
              <div className="flex items-center justify-between text-sm font-bold">
                <span className={`bg-gradient-to-r ${t.gradient} bg-clip-text text-transparent`}>Начать →</span>
                {p ? (
                  <span className="flex items-center gap-1 text-slate-400">
                    {p.score}/{p.total}
                    <CircleCheck className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                ) : (
                  <span className="text-slate-300">не пройдено</span>
                )}
              </div>
            </Link>
          );
        })}

        {UPCOMING.map(({ title, summary, icon: Icon }) => (
          <div key={title} className={`${CARD} opacity-60`} aria-disabled="true">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h3 className="mb-1.5 text-lg font-extrabold text-slate-800">{title}</h3>
            <p className="mb-4 text-sm text-slate-500">{summary}</p>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">Скоро</span>
          </div>
        ))}
      </div>
    </div>
  );
}
