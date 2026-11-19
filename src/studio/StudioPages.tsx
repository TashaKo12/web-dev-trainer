import { Link, useNavigate, useParams } from "react-router-dom";
import { Gamepad2, Plus, Trash2 } from "lucide-react";
import { CatalogBanner } from "../components/CatalogBanner";
import { coinsTemplate, emptyProject, platformerTemplate, type Project } from "./model";
import { LookView } from "./Player";
import { StudioEditor } from "./StudioEditor";
import { deleteProject, saveProject, savingInBrowser, useProjects } from "./store";
import { isTeacher } from "../lib/teacher";

// «Конструктор игр»: the list of the child's games and the editor of one game.

const card = "rounded-xl border border-[#e6e7ee] bg-white shadow-sm dark:border-slate-800";

/** While the constructor is being tested, only the teacher can open it; students see this. */
function ComingSoon() {
  return (
    <div>
      <CatalogBanner icon={<Gamepad2 className="h-8 w-8" strokeWidth={2} />} kicker="Конструктор игр" title="Скоро откроется" note="Здесь можно будет создавать свои игры: ставить объекты на сцену, рисовать персонажей и придумывать правила. Педагог скажет, когда всё будет готово!" />
      <p className={`${card} p-6 text-center text-slate-500`}>
        Пока конструктор доступен только педагогу. А сейчас можно поиграть в{" "}
        <Link to="/quest" className="font-bold text-[#4d16c9]">
          «Тайну станции»
        </Link>
        .
      </p>
    </div>
  );
}

export function StudioHome() {
  if (!isTeacher()) return <ComingSoon />;
  return <StudioProjects />;
}

function StudioProjects() {
  const projects = useProjects();
  const navigate = useNavigate();
  const create = (p: Project) => {
    saveProject(p);
    navigate(`/studio/${p.id}`);
  };

  return (
    <div>
      <CatalogBanner icon={<Gamepad2 className="h-8 w-8" strokeWidth={2} />} kicker="Конструктор игр" title="Создай свою игру" note="Ставь объекты на сцену, загружай свои картинки, настраивай поведения и придумывай правила игры — без кода." />
      {!savingInBrowser() && (
        <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Сохранение в браузере выключено: игры пропадут после перезагрузки страницы. Включить его можно внизу страницы «Мой прогресс».</p>
      )}
      <div className="mb-8 flex flex-wrap gap-3">
        <button type="button" onClick={() => create(emptyProject())} className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#4d16c9] px-4 text-sm font-semibold text-white shadow hover:bg-[#4514b5]">
          <Plus className="h-4 w-4" strokeWidth={2.6} /> Новая игра
        </button>
        <button type="button" onClick={() => create(coinsTemplate())} className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#e4e6ec] px-4 text-sm font-semibold text-slate-700 hover:bg-[#d9dce4] dark:bg-slate-800 dark:text-slate-200">
          🪙 Пример: «Собери монеты»
        </button>
        <button type="button" onClick={() => create(platformerTemplate())} className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#e4e6ec] px-4 text-sm font-semibold text-slate-700 hover:bg-[#d9dce4] dark:bg-slate-800 dark:text-slate-200">
          🐱 Пример: платформер «Прыгун»
        </button>
      </div>

      <h2 className="mb-4 flex items-center gap-3 text-lg font-bold text-slate-800 dark:text-slate-100">
        <span className="h-3.5 w-3.5 rounded-full bg-[#3b82f6]" /> Мои игры
      </h2>
      {!projects.length ? (
        <p className={`${card} p-6 text-center text-slate-500`}>Здесь появятся твои игры. Начни с примера — посмотри, как он устроен, и поменяй его по-своему!</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p.id} className={`${card} group flex flex-col overflow-hidden`}>
              <Link to={`/studio/${p.id}`} className="flex h-28 items-center justify-center gap-1 text-4xl" style={{ background: p.scenes[0]?.bg ?? "#e0f2fe" }}>
                {p.objects.slice(0, 5).map((o) => (
                  <LookView key={o.id} look={o.look} className="h-10 w-10 text-4xl" />
                ))}
              </Link>
              <div className="flex items-center gap-2 p-4">
                <Link to={`/studio/${p.id}`} className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-slate-800 group-hover:text-[#4d16c9]">{p.name}</span>
                  <span className="block text-xs text-slate-400">
                    {p.objects.length} объект. · {p.scenes.length} сцен. · изменена {new Date(p.updated).toLocaleDateString("ru-RU")}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => window.confirm(`Удалить игру «${p.name}»? Вернуть её не получится.`) && deleteProject(p.id)}
                  aria-label={`Удалить игру ${p.name}`}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2.2} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Every game gets a fresh editor. */
export function StudioEditorPage() {
  if (!isTeacher()) return <ComingSoon />;
  return <StudioEditorRoute />;
}

function StudioEditorRoute() {
  const { id } = useParams();
  const projects = useProjects();
  const found = projects.find((p) => p.id === id);
  if (!found)
    return (
      <p className="text-center text-slate-500">
        Такой игры нет. <Link to="/studio" className="font-bold text-[#4d16c9]">К моим играм</Link>
      </p>
    );
  return <StudioEditor key={found.id} initial={found} />;
}
