import { useEffect, useRef, useState, type DragEvent, type PointerEvent } from "react";
import { uid, type Instance, type Project, type Scene } from "./model";
import { DRAG_TYPE } from "./ObjectPanel";
import { LookView } from "./Player";

// The scene in the middle of the editor: objects are dropped here from the list, dragged with the mouse,
// Delete removes the selected one. A light workspace around the scene, like in a real game editor.

const GRID = 8;
const snap = (v: number) => Math.round(v / GRID) * GRID;

export function SceneEditor({
  project,
  scene,
  selected,
  zoom,
  grid,
  onSelect,
  onChange,
  onCursor,
}: {
  project: Project;
  scene: Scene;
  selected: string | null;
  zoom: number;
  grid: boolean;
  onSelect: (instanceId: string | null, kindId?: string) => void;
  onChange: (s: Scene) => void;
  onCursor: (p: { x: number; y: number } | null) => void;
}) {
  const work = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const kinds = new Map(project.objects.map((o) => [o.id, o]));
  const scale = fit * zoom;

  // at zoom 1 the scene fits the workspace
  useEffect(() => {
    const el = work.current;
    if (!el) return;
    const measure = () => setFit(Math.max(0.2, Math.min((el.clientWidth - 64) / scene.w, (el.clientHeight - 64) / scene.h)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scene.w, scene.h]);

  const toScene = (clientX: number, clientY: number) => {
    const r = stage.current!.getBoundingClientRect();
    return { x: (clientX - r.left) / scale, y: (clientY - r.top) / scale };
  };

  function update(id: string, patch: Partial<Instance>) {
    onChange({ ...scene, instances: scene.instances.map((i) => (i.id === id ? { ...i, ...patch } : i)) });
  }

  // Delete / Backspace removes the selected object (not while typing in a field)
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (!selected || /input|textarea|select/i.test(t.tagName)) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        onChange({ ...scene, instances: scene.instances.filter((i) => i.id !== selected) });
        onSelect(null);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  function drop(e: DragEvent) {
    const id = e.dataTransfer.getData(DRAG_TYPE);
    const kind = kinds.get(id);
    if (!kind) return;
    e.preventDefault();
    const p = toScene(e.clientX, e.clientY);
    const inst: Instance = { id: uid(), kind: kind.id, x: snap(p.x - kind.w / 2), y: snap(p.y - kind.h / 2) };
    onChange({ ...scene, instances: [...scene.instances, inst] });
    onSelect(inst.id, inst.kind);
  }

  function downOnObject(e: PointerEvent, inst: Instance) {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const p = toScene(e.clientX, e.clientY);
    drag.current = { id: inst.id, dx: p.x - inst.x, dy: p.y - inst.y };
    onSelect(inst.id, inst.kind);
  }

  function moveObject(e: PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const p = toScene(e.clientX, e.clientY);
    update(d.id, { x: snap(p.x - d.dx), y: snap(p.y - d.dy) });
  }

  const cell = GRID * 5 * scale;

  return (
    <div
      ref={work}
      onPointerDown={() => onSelect(null)}
      onPointerMove={(e) => {
        if (!stage.current) return;
        const p = toScene(e.clientX, e.clientY);
        onCursor({ x: Math.round(p.x), y: Math.round(p.y) });
      }}
      onPointerLeave={() => onCursor(null)}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes(DRAG_TYPE)) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }
      }}
      onDrop={drop}
      className="relative h-full overflow-auto bg-[#f4f6fb]"
    >
      <div className="flex min-h-full min-w-full items-center justify-center p-8" style={{ width: scene.w * scale + 64, height: scene.h * scale + 64 }}>
        <div
          ref={stage}
          className="relative shrink-0 border border-[#9ca3af] shadow-[0_2px_12px_rgb(0_0_0/0.08)]"
          style={{
            width: scene.w * scale,
            height: scene.h * scale,
            background: scene.bg,
            backgroundImage: grid ? "linear-gradient(rgb(0 0 0 / 0.07) 1px, transparent 1px), linear-gradient(90deg, rgb(0 0 0 / 0.07) 1px, transparent 1px)" : undefined,
            backgroundSize: `${cell}px ${cell}px`,
          }}
        >
          {scene.instances.map((inst) => {
            const k = kinds.get(inst.kind);
            if (!k) return null;
            return (
              <div
                key={inst.id}
                onPointerDown={(e) => downOnObject(e, inst)}
                onPointerMove={moveObject}
                onPointerUp={() => (drag.current = null)}
                title={k.name}
                className={`absolute cursor-move touch-none select-none ${inst.id === selected ? "outline outline-2 outline-offset-1 outline-[#7046ec]" : "hover:outline hover:outline-1 hover:outline-[#7046ec]/60"}`}
                style={{ left: inst.x * scale, top: inst.y * scale, width: k.w * scale, height: k.h * scale, fontSize: Math.min(k.w, k.h) * scale * 0.9 }}
              >
                <LookView look={k.look} className="pointer-events-none h-full w-full" />
              </div>
            );
          })}
          {!scene.instances.length && (
            <p className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 text-center text-sm font-semibold text-slate-400">
              Перетащи сюда объект из списка справа
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
