import { Link } from "react-router-dom";
import { CircleCheck, Database, GitMerge, Layers, Workflow, type LucideIcon } from "lucide-react";
import { trainers } from "../trainers/registry";
import { getAllProgress } from "../lib/progress";
import { CatalogBanner } from "../components/CatalogBanner";

// The SQL course (3rd stage, grades 8–11). Module 1 «Введение в SQL» is ready; modules 2–4 follow the plan.

const LATER: { title: string; summary: string; icon: LucideIcon }[] = [
  { title: "Модуль 2. Запросы в SQL", summary: "WHERE, LIKE, ORDER BY, строковые функции, GROUP BY и HAVING, все виды JOIN и подзапросы.", icon: GitMerge },
  { title: "Модуль 3. Процедуры, функции и циклы", summary: "Поиск по тексту и REGEXP, хранимые процедуры и функции, триггеры, циклы, представления, CASE, импорт данных.", icon: Workflow },
  { title: "Модуль 4. Создание базы данных", summary: "Оконные функции, транзакции и блокировки — и своя база данных по индивидуальному заданию.", icon: Layers },
];

const CARD = "relative overflow-hidden rounded-xl border border-[#e6e7ee] bg-white p-6 shadow-sm dark:border-slate-800";

export function SqlHome() {
  const progress = getAllProgress();
  const topics = trainers.filter((t) => t.section === "sql");
  return (
    <div>
      <div className="mb-8">
        <CatalogBanner
          icon={<Database className="h-8 w-8" strokeWidth={2} />}
          kicker="Программирование (3 ступень) · 8–11 класс"
          title="Программирование на SQL"
          note="Учимся работать с базами данных, как настоящие разработчики. Все запросы выполняются по-настоящему — прямо в браузере, ничего устанавливать не нужно."
        />
      </div>

      <h2 className="mb-1 text-xl font-extrabold text-slate-800">Модуль 1. Введение в SQL</h2>
      <p className="mb-5 text-sm text-slate-500">Базы данных и СУБД, проектирование, типы данных, создание таблиц и CRUD — 8 тем и итоговая работа.</p>
      <div className="grid gap-5 sm:grid-cols-2">
        {topics.map((t, i) => {
          const p = progress[t.id];
          const Icon = t.icon;
          return (
            <Link key={t.id} to={t.path} className={`group ${CARD} transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(0,0,0,0.1)]`}>
              <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${t.gradient} opacity-15 blur-xl`} />
              <div className="mb-3 flex items-center gap-3">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${t.gradient}`}>
                  <Icon className="h-5 w-5 text-white" strokeWidth={1.75} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">{t.id === "sql-final" ? "Итог" : `Тема ${i + 1}`}</span>
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
      </div>

      <h2 className="mb-4 mt-10 text-xl font-extrabold text-slate-800">Дальше по программе</h2>
      <div className="grid gap-5 sm:grid-cols-3">
        {LATER.map(({ title, summary, icon: Icon }) => (
          <div key={title} className={`${CARD} opacity-60`} aria-disabled="true">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h3 className="mb-1.5 text-base font-extrabold text-slate-800">{title}</h3>
            <p className="mb-4 text-sm text-slate-500">{summary}</p>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">Скоро</span>
          </div>
        ))}
      </div>
    </div>
  );
}
