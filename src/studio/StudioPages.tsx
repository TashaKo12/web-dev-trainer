import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Clapperboard, Gamepad2, Play, Plus, Trash2, Zap } from "lucide-react";
import { CatalogBanner } from "../components/CatalogBanner";
import { coinsTemplate, emptyProject, platformerTemplate, uid, type ObjectKind, type Project, type Scene } from "./model";
import { EventsEditor, ObjectsHint, VariablesPanel } from "./EventsEditor";
import { newObject, ObjectLibrary, ObjectProperties } from "./ObjectPanel";
import { LookView, Player } from "./Player";
import { SceneEditor, SIZES } from "./SceneEditor";
import { deleteProject, lastSaveError, saveProject, savingInBrowser, useProjects } from "./store";

// «Конструктор игр»: the list of the child's games and the editor of one game.

const card = "rounded-xl border border-[#e6e7ee] bg-white shadow-sm dark:border-slate-800";

export function StudioHome() {
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
        <button type="button" onClick={() => create(emptyProject())} className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#4f1fd1] px-4 text-sm font-semibold text-white shadow hover:bg-[#4318b8]">
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
                  <span className="block truncate font-bold text-slate-800 group-hover:text-[#4f1fd1]">{p.name}</span>
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
  const { id } = useParams();
  const projects = useProjects();
  const found = projects.find((p) => p.id === id);
  if (!found)
    return (
      <p className="text-center text-slate-500">
        Такой игры нет. <Link to="/studio" className="font-bold text-[#4f1fd1]">К моим играм</Link>
      </p>
    );
  return <StudioEditor key={found.id} initial={found} />;
}

function StudioEditor({ initial }: { initial: Project }) {
  const [project, setProject] = useState(initial);
  const [sceneId, setSceneId] = useState(initial.scenes[0].id);
  const [tab, setTab] = useState<"scene" | "events">("scene");
  const [kindId, setKindId] = useState<string | null>(initial.objects[0]?.id ?? null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [placing, setPlacing] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const scene = project.scenes.find((s) => s.id === sceneId) ?? project.scenes[0];
  const kind = project.objects.find((o) => o.id === kindId) ?? null;

  // autosave a moment after the last change
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      saveProject(project);
      setSaveError(lastSaveError);
    }, 400);
    return () => clearTimeout(timer.current);
  }, [project]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const i of scene.instances) c[i.kind] = (c[i.kind] ?? 0) + 1;
    return c;
  }, [scene]);

  const setScene = (s: Scene) => setProject((p) => ({ ...p, scenes: p.scenes.map((x) => (x.id === s.id ? s : x)) }));
  const setKind = (k: ObjectKind) => setProject((p) => ({ ...p, objects: p.objects.map((x) => (x.id === k.id ? k : x)) }));

  function addObject() {
    const o = newObject(project.objects.length + 1);
    setProject((p) => ({ ...p, objects: [...p.objects, o] }));
    setKindId(o.id);
    setInstanceId(null);
  }

  function deleteObject(id: string) {
    const o = project.objects.find((x) => x.id === id);
    if (!o || !window.confirm(`Удалить объект «${o.name}» из игры? Он пропадёт со всех сцен.`)) return;
    setProject((p) => ({ ...p, objects: p.objects.filter((x) => x.id !== id), scenes: p.scenes.map((s) => ({ ...s, instances: s.instances.filter((i) => i.kind !== id) })) }));
    setKindId(null);
    setPlacing(null);
  }

  function addScene() {
    const s: Scene = { id: uid(), name: `Сцена ${project.scenes.length + 1}`, bg: "#dbeafe", w: 800, h: 480, instances: [], events: [] };
    setProject((p) => ({ ...p, scenes: [...p.scenes, s] }));
    setSceneId(s.id);
  }

  function deleteScene() {
    if (project.scenes.length < 2 || !window.confirm(`Удалить сцену «${scene.name}»?`)) return;
    const rest = project.scenes.filter((s) => s.id !== scene.id);
    setProject((p) => ({ ...p, scenes: rest }));
    setSceneId(rest[0].id);
  }

  const tabBtn = (t: "scene" | "events", label: string, Icon: typeof Zap) => (
    <button
      type="button"
      onClick={() => setTab(t)}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-semibold ${tab === t ? "border-transparent bg-[#4f1fd1] text-white" : "border-[#e6e7ee] bg-white text-slate-600 shadow-sm dark:border-slate-800"}`}
    >
      <Icon className="h-4 w-4" strokeWidth={2.2} /> {label}
    </button>
  );

  return (
    <div>
      {/* top bar: name, scenes, play */}
      <div className={`${card} mb-4 flex flex-wrap items-center gap-3 p-3`}>
        <input
          value={project.name}
          onChange={(e) => setProject((p) => ({ ...p, name: e.target.value }))}
          aria-label="Название игры"
          className="min-w-[10rem] flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-lg font-bold text-slate-800 outline-none hover:border-[#e6e7ee] focus:border-[#4f1fd1]"
        />
        <div className="flex flex-wrap items-center gap-1.5">
          {project.scenes.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setSceneId(s.id);
                setInstanceId(null);
              }}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${s.id === scene.id ? "bg-[#ece6fd] text-[#4f1fd1] dark:bg-violet-500/20 dark:text-violet-200" : "text-slate-500 hover:bg-slate-100"}`}
            >
              {s.name}
            </button>
          ))}
          <button type="button" onClick={addScene} className="rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-400 hover:text-[#4f1fd1]" title="Новая сцена">
            + сцена
          </button>
        </div>
        <button type="button" onClick={() => setPlaying(true)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-emerald-700">
          <Play className="h-4 w-4" fill="currentColor" strokeWidth={2} /> Играть
        </button>
      </div>
      {saveError && <p className="mb-3 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{saveError}</p>}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {tabBtn("scene", "Сцена", Clapperboard)}
        {tabBtn("events", `События (${scene.events.length})`, Zap)}
        <span className="ml-auto text-xs text-slate-400">Сохраняется само</span>
      </div>

      {tab === "scene" ? (
        <div className="grid gap-4 lg:grid-cols-[270px_minmax(0,1fr)_290px]">
          <ObjectLibrary
            project={project}
            sceneCounts={counts}
            selected={kindId}
            placing={placing}
            onSelect={(id) => {
              setKindId(id);
              setInstanceId(null);
            }}
            onPlace={(id) => {
              setPlacing(id);
              if (id) setKindId(id);
            }}
            onAdd={addObject}
          />
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
              <input value={scene.name} onChange={(e) => setScene({ ...scene, name: e.target.value })} aria-label="Название сцены" className="w-40 rounded-lg border border-[#e6e7ee] bg-white px-2.5 py-1.5 font-semibold text-slate-800 dark:border-slate-700" />
              <label className="inline-flex items-center gap-1.5 text-slate-500">
                фон
                <input type="color" value={scene.bg} onChange={(e) => setScene({ ...scene, bg: e.target.value })} className="h-8 w-10 cursor-pointer rounded-md border border-[#e6e7ee]" />
              </label>
              <select
                value={`${scene.w}x${scene.h}`}
                onChange={(e) => {
                  const [w, h] = e.target.value.split("x").map(Number);
                  setScene({ ...scene, w, h });
                }}
                className="rounded-lg border border-[#e6e7ee] bg-white px-2 py-1.5 text-slate-700 dark:border-slate-700"
              >
                {SIZES.map((s) => (
                  <option key={s.label} value={`${s.w}x${s.h}`}>
                    {s.label}
                  </option>
                ))}
              </select>
              {project.scenes.length > 1 && (
                <button type="button" onClick={deleteScene} className="text-xs font-semibold text-slate-400 hover:text-rose-600">
                  удалить сцену
                </button>
              )}
            </div>
            <SceneEditor
              project={project}
              scene={scene}
              placing={placing}
              selected={instanceId}
              onSelect={(iid, kid) => {
                setInstanceId(iid);
                if (kid) setKindId(kid);
              }}
              onChange={setScene}
            />
          </div>
          <div>
            {kind ? (
              <ObjectProperties key={kind.id} kind={kind} project={project} onChange={setKind} onDelete={() => deleteObject(kind.id)} />
            ) : (
              <p className={`${card} p-4 text-sm text-slate-500`}>Выбери объект слева или на сцене — здесь появятся его картинка, размер и поведения.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_290px]">
          <div className="min-w-0">
            <p className="mb-3 text-sm text-slate-500">
              События сцены «{scene.name}». Игра проверяет их сверху вниз много раз в секунду: если все условия выполнены — делает действия.
            </p>
            <EventsEditor project={project} scene={scene} onChange={setScene} />
          </div>
          <div className="space-y-4">
            <VariablesPanel project={project} onChange={(variables) => setProject((p) => ({ ...p, variables }))} />
            <ObjectsHint project={project} />
          </div>
        </div>
      )}

      {playing && <Player project={project} sceneId={scene.id} onClose={() => setPlaying(false)} />}
    </div>
  );
}
