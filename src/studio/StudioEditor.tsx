import { useEffect, useRef, useState, type ReactNode } from "react";
import { Clapperboard, Grid3x3, ListChecks, Play, Redo2, Trash2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { uid, type Instance, type ObjectKind, type Project, type Scene } from "./model";
import { EventsEditor } from "./EventsEditor";
import { newObject, ObjectsPanel, PropertiesPanel } from "./ObjectPanel";
import { Player } from "./Player";
import { SceneEditor } from "./SceneEditor";
import { lastSaveError, saveProject } from "./store";

// The editor of one game, laid out like a real game engine: tabs for the scene and its events, a toolbar with
// preview / undo / grid / zoom, properties on the left, the scene in the middle, the objects on the right.

const ZOOMS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function ToolButton({ title, onClick, disabled, active, children }: { title: string; onClick: () => void; disabled?: boolean; active?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-9 w-9 items-center justify-center rounded-md transition disabled:opacity-30 ${active ? "bg-[#7046ec]/40 text-white" : "text-[#d1d5db] hover:bg-[#2a2c36]"}`}
    >
      {children}
    </button>
  );
}

export function StudioEditor({ initial }: { initial: Project }) {
  const [project, setProjectState] = useState(initial);
  const current = useRef(initial);
  // undo / redo: quick changes in a row (dragging, typing) become one step
  const past = useRef<Project[]>([]);
  const future = useRef<Project[]>([]);
  const lastChange = useRef(0);
  const [sceneId, setSceneId] = useState(initial.scenes[0].id);
  const [tab, setTab] = useState<"scene" | "events">("scene");
  const [kindId, setKindId] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [grid, setGrid] = useState(true);
  const [resetView, setResetView] = useState(0);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [saved, setSaved] = useState<"saved" | "saving" | "error">("saved");

  const scene = project.scenes.find((s) => s.id === sceneId) ?? project.scenes[0];
  const kind = project.objects.find((o) => o.id === kindId) ?? null;
  const instance = scene.instances.find((i) => i.id === instanceId) ?? null;

  function change(fn: (p: Project) => Project) {
    const prev = current.current;
    const next = fn(prev);
    if (next === prev) return;
    const now = Date.now();
    if (now - lastChange.current > 700) {
      past.current = [...past.current.slice(-49), prev];
      future.current = [];
    }
    lastChange.current = now;
    current.current = next;
    setProjectState(next);
  }

  function restore(p: Project) {
    current.current = p;
    lastChange.current = 0;
    setProjectState(p);
    if (!p.scenes.some((s) => s.id === sceneId)) setSceneId(p.scenes[0].id);
    setInstanceId(null);
  }
  const undo = () => {
    const p = past.current.pop();
    if (!p) return;
    future.current.push(current.current);
    restore(p);
  };
  const redo = () => {
    const p = future.current.pop();
    if (!p) return;
    past.current.push(current.current);
    restore(p);
  };

  // Ctrl+Z / Ctrl+Y (not while typing in a field — there the browser undoes the text)
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (playing || /input|textarea|select/i.test((e.target as HTMLElement).tagName) || !(e.ctrlKey || e.metaKey)) return;
      if (e.code === "KeyZ" && !e.shiftKey) (e.preventDefault(), undo());
      else if (e.code === "KeyY" || (e.code === "KeyZ" && e.shiftKey)) (e.preventDefault(), redo());
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  // autosave a moment after the last change
  useEffect(() => {
    setSaved("saving");
    const t = setTimeout(() => {
      saveProject(project);
      setSaved(lastSaveError ? "error" : "saved");
    }, 400);
    return () => clearTimeout(t);
  }, [project]);

  const setScene = (s: Scene) => change((p) => ({ ...p, scenes: p.scenes.map((x) => (x.id === s.id ? s : x)) }));
  const setKind = (k: ObjectKind) => change((p) => ({ ...p, objects: p.objects.map((x) => (x.id === k.id ? k : x)) }));
  const setInstance = (i: Instance) => setScene({ ...scene, instances: scene.instances.map((x) => (x.id === i.id ? i : x)) });

  function addObject() {
    const o = newObject(project.objects.length + 1);
    change((p) => ({ ...p, objects: [...p.objects, o] }));
    setKindId(o.id);
    setInstanceId(null);
  }

  function deleteKind(id: string) {
    const o = project.objects.find((x) => x.id === id);
    if (!o || !window.confirm(`Удалить объект «${o.name}» из игры? Он пропадёт со всех сцен.`)) return;
    change((p) => ({ ...p, objects: p.objects.filter((x) => x.id !== id), scenes: p.scenes.map((s) => ({ ...s, instances: s.instances.filter((i) => i.kind !== id) })) }));
    setKindId(null);
    setInstanceId(null);
  }

  function addScene() {
    const s: Scene = { id: uid(), name: `Сцена ${project.scenes.length + 1}`, bg: "#dbeafe", w: 800, h: 480, instances: [], events: [] };
    change((p) => ({ ...p, scenes: [...p.scenes, s] }));
    setSceneId(s.id);
    setInstanceId(null);
  }

  function deleteScene() {
    if (project.scenes.length < 2 || !window.confirm(`Удалить сцену «${scene.name}»?`)) return;
    const rest = project.scenes.filter((s) => s.id !== scene.id);
    change((p) => ({ ...p, scenes: rest }));
    setSceneId(rest[0].id);
  }

  function deleteSelected() {
    if (!instanceId) return;
    setScene({ ...scene, instances: scene.instances.filter((i) => i.id !== instanceId) });
    setInstanceId(null);
  }

  const zi = ZOOMS.indexOf(zoom);
  const tabCls = (on: boolean) =>
    `inline-flex items-center gap-2 rounded-t-md px-4 py-2 text-sm font-semibold ${on ? "bg-[#1f2028] text-white" : "text-[#9ca3af] hover:text-white"}`;

  return (
    <div className="flex h-[calc(100vh-150px)] min-h-[600px] flex-col overflow-hidden rounded-xl border border-[#2e3039] bg-[#16171d] text-[#e5e7eb] shadow-lg">
      {/* tabs */}
      <div className="flex items-end gap-1 overflow-x-auto px-2 pt-2">
        <button type="button" onClick={() => setTab("scene")} className={tabCls(tab === "scene")}>
          <Clapperboard className="h-4 w-4" /> {scene.name}
        </button>
        <button type="button" onClick={() => setTab("events")} className={tabCls(tab === "events")}>
          <ListChecks className="h-4 w-4" /> {scene.name} (События: {scene.events.length})
        </button>
        <span className="ml-auto self-center pb-1 pr-2 text-xs text-[#9ca3af]">
          {saved === "saving" ? "Сохраняю…" : saved === "error" ? <span className="text-[#fb7185]">Не сохранилось — мало места</span> : "Сохранено"}
        </span>
      </div>

      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-y border-[#2e3039] bg-[#1f2028] px-3 py-2">
        <ToolButton title="Отменить (Ctrl+Z)" onClick={undo} disabled={!past.current.length}>
          <Undo2 className="h-5 w-5" />
        </ToolButton>
        <ToolButton title="Повторить (Ctrl+Y)" onClick={redo} disabled={!future.current.length}>
          <Redo2 className="h-5 w-5" />
        </ToolButton>
        <input
          value={project.name}
          onChange={(e) => change((p) => ({ ...p, name: e.target.value }))}
          aria-label="Название игры"
          className="w-44 rounded-md border border-transparent bg-transparent px-2 py-1.5 font-bold text-white outline-none hover:border-[#383b47] focus:border-[#7046ec]"
        />
        <select
          value={scene.id}
          onChange={(e) => {
            if (e.target.value === "+") return addScene();
            setSceneId(e.target.value);
            setInstanceId(null);
          }}
          aria-label="Сцена"
          className="rounded-md border border-[#383b47] bg-[#2a2c36] px-2 py-1.5 text-sm"
        >
          {project.scenes.map((s) => (
            <option key={s.id} value={s.id}>
              🎬 {s.name}
            </option>
          ))}
          <option value="+">+ Новая сцена</option>
        </select>
        {project.scenes.length > 1 && (
          <ToolButton title="Удалить эту сцену" onClick={deleteScene}>
            <Trash2 className="h-4 w-4" />
          </ToolButton>
        )}

        <div className="mx-auto">
          <button type="button" onClick={() => setPlaying(true)} className="inline-flex items-center gap-2 rounded-md border border-[#4b4f5e] px-4 py-2 text-sm font-bold text-white hover:bg-[#2a2c36]">
            <Play className="h-4 w-4" fill="currentColor" /> Предпросмотр
          </button>
        </div>

        {tab === "scene" && (
          <div className="flex items-center gap-1">
            <ToolButton title="Сетка" onClick={() => setGrid((g) => !g)} active={grid}>
              <Grid3x3 className="h-5 w-5" />
            </ToolButton>
            <ToolButton title="Уменьшить" onClick={() => setZoom(ZOOMS[Math.max(0, zi - 1)])} disabled={zi <= 0}>
              <ZoomOut className="h-5 w-5" />
            </ToolButton>
            <button type="button" onClick={() => (setZoom(1), setResetView((v) => v + 1))} title="Вернуться к экрану игры" className="w-12 rounded-md py-1.5 text-xs font-semibold text-[#d1d5db] hover:bg-[#2a2c36]">
              {Math.round(zoom * 100)}%
            </button>
            <ToolButton title="Увеличить" onClick={() => setZoom(ZOOMS[Math.min(ZOOMS.length - 1, zi + 1)])} disabled={zi >= ZOOMS.length - 1}>
              <ZoomIn className="h-5 w-5" />
            </ToolButton>
            <ToolButton title="Убрать выбранный объект со сцены (Delete)" onClick={deleteSelected} disabled={!instanceId}>
              <Trash2 className="h-5 w-5" />
            </ToolButton>
          </div>
        )}
      </div>

      {/* workspace */}
      {tab === "scene" ? (
        <div className="grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)_280px] max-lg:grid-cols-1 max-lg:overflow-y-auto">
          <div className="min-h-0 border-r border-[#2e3039] max-lg:order-2">
            <PropertiesPanel
              project={project}
              scene={scene}
              kind={kind}
              instance={instance}
              onKind={setKind}
              onDeleteKind={deleteKind}
              onScene={setScene}
              onInstance={setInstance}
              onVariables={(variables) => change((p) => ({ ...p, variables }))}
            />
          </div>
          <div className="relative min-h-[360px] max-lg:order-1">
            <SceneEditor
              project={project}
              scene={scene}
              selected={instanceId}
              zoom={zoom}
              grid={grid}
              resetView={resetView}
              onCursor={setCursor}
              onSelect={(iid, kid) => {
                setInstanceId(iid);
                setKindId(kid ?? null);
              }}
              onChange={setScene}
            />
            {cursor && (
              <span className="pointer-events-none absolute bottom-2 right-3 rounded bg-black/60 px-2 py-0.5 font-mono text-xs text-white">
                X {cursor.x} &nbsp; Y {cursor.y}
              </span>
            )}
          </div>
          <div className="min-h-0 border-l border-[#2e3039] max-lg:order-3">
            <ObjectsPanel
              project={project}
              selected={kindId}
              onSelect={(id) => {
                setKindId(id);
                setInstanceId(null);
              }}
              onAdd={addObject}
            />
          </div>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_280px] max-lg:grid-cols-1 max-lg:overflow-y-auto">
          <div className="min-h-0 overflow-y-auto p-4">
            <p className="mb-3 text-sm text-[#9ca3af]">Игра проверяет события сверху вниз много раз в секунду: если все условия выполнены — делает действия.</p>
            <EventsEditor project={project} scene={scene} onChange={setScene} />
          </div>
          <div className="min-h-0 border-l border-[#2e3039]">
            <PropertiesPanel
              project={project}
              scene={scene}
              kind={null}
              instance={null}
              onKind={setKind}
              onDeleteKind={deleteKind}
              onScene={setScene}
              onInstance={setInstance}
              onVariables={(variables) => change((p) => ({ ...p, variables }))}
            />
          </div>
        </div>
      )}

      {playing && <Player project={project} sceneId={scene.id} onClose={() => setPlaying(false)} />}
    </div>
  );
}

