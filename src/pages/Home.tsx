import { Link } from "react-router-dom";
import { FileCode, CircleCheck, GraduationCap, LogIn } from "lucide-react";
import { cloudAvailable, formatCode, useAccount } from "../lib/cloud";
import { trainers, type TrainerMeta } from "../trainers/registry";
import { getAllProgress } from "../lib/progress";

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

function AccountPanel() {
  const account = useAccount();
  if (!cloudAvailable) return null;
  if (account) {
    return (
      <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
        {account.owner ? `Привет, ${account.owner.name}! ` : ""}Твой код участника{" "}
        <Link to="/profile" className="font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-300">
          {formatCode(account.code)}
        </Link>
      </p>
    );
  }
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <Link
        to="/login"
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-2.5 text-sm font-bold text-white shadow hover:opacity-90"
      >
        <LogIn className="h-4 w-4" strokeWidth={2} />
        Войти или создать аккаунт
      </Link>
      <Link
        to="/login?as=teacher"
        className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white/80 px-5 py-2 text-sm font-bold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
      >
        <GraduationCap className="h-4 w-4" strokeWidth={2} />
        Вход педагога
      </Link>
    </div>
  );
}

export function Home() {
  const progress = getAllProgress();

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
        <AccountPanel />
      </div>

      {SECTIONS.map((section) => {
        const items = trainers.filter((t) => t.section === section.key);
        if (items.length === 0) return null;
        return (
          <div key={section.key} className="mb-12">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-mono text-xs font-bold dark:brightness-125 ${section.cls}`}>
                <FileCode className="h-3.5 w-3.5" strokeWidth={2} />
                {section.file}
              </span>
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{section.title}</h2>
            </div>
            <p className="mb-5 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{section.description}</p>

            <div className="grid gap-5 sm:grid-cols-2">
              {items.map((t) => {
                const p = progress[t.id];
                const Icon = t.icon;
                return (
                  <Link
                    key={t.id}
                    to={t.path}
                    className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(0,0,0,0.1)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]"
                  >
                    <div
                      className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${t.gradient} opacity-15 blur-xl`}
                    />
                    <div
                      className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${t.gradient}`}
                    >
                      <Icon className="h-5 w-5 text-white" strokeWidth={1.75} />
                    </div>
                    <h3 className="mb-1.5 text-lg font-extrabold text-slate-800">
                      {t.title}
                    </h3>
                    <p className="mb-4 text-sm text-slate-500">{t.summary}</p>
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span
                        className={`rounded-full bg-gradient-to-r ${t.gradient} bg-clip-text text-transparent`}
                      >
                        Начать →
                      </span>
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
          </div>
        );
      })}
    </div>
  );
}
