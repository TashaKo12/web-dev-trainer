import { Link } from "react-router-dom";
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
          задания на закрепление. Прогресс сохраняется в этом браузере.
        </p>
      </div>

      {SECTIONS.map((section) => {
        const items = trainers.filter((t) => t.section === section.key);
        if (items.length === 0) return null;
        return (
          <div key={section.key} className="mb-12">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-mono text-xs font-bold ${section.cls}`}>
                📄 {section.file}
              </span>
              <h2 className="text-xl font-extrabold text-slate-800">{section.title}</h2>
            </div>
            <p className="mb-5 max-w-2xl text-sm text-slate-500">{section.description}</p>

            <div className="grid gap-5 sm:grid-cols-2">
              {items.map((t) => {
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
      })}
    </div>
  );
}
