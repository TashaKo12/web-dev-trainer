import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Copy, Trash2 } from "lucide-react";
import { uid, type Instance, type Project, type Scene } from "./model";
import { LookView } from "./Player";

// The scene: click to place the chosen object, drag objects with the mouse, Delete removes the selected one.

const GRID = 8;
const snap = (v: number) => Math.round(v / GRID) * GRID;

export const SIZES: { label: string; w: number; h: number }[] = [
  { label: "Широкая 800 × 480", w: 800, h: 480 },
  { label: "Квадрат 600 × 600", w: 600, h: 600 },
  { label: "Высокая 480 × 720", w: 480, h: 720 },
];

export function SceneEditor({
  project,
  scene,
  placing,
  selected,
  onSelect,
  onChange,
}: {
  project: Project;
  scene: Scene;
  placing: string | null;
  selected: string | null;
  onSelect: (instanceId: string | null, kindId?: string) => void;
  onChange: (s: Scene) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const drag = useRef<{ id: string; dx: number; dy: number; moved: boolean } | null>(null);
  const kinds = new Map(project.objects.map((o) => [o.id, o]));

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(el.clientWidth / scene.w);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scene.w]);

  const point = (e: PointerEvent) => {
    const r = box.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale };
  };

  function update(id: string, patch: Partial<Instance>) {
    onChange({ ...scene, instances: scene.instances.map((i) => (i.id === id ? { ...i, ...patch } : i)) });
  }

  function remove(id: string) {
    onChange({ ...scene, instances: scene.instances.filter((i) => i.id !== id) });
    onSelect(null);
  }

  function duplicate(id: string) {
    const i = scene.instances.find((x) => x.id === id);
    if (!i) return;
    const copy = { ...i, id: uid(), x: i.x + 16, y: i.y + 16 };
    onChange({ ...scene, instances: [...scene.instances, copy] });
    onSelect(copy.id, copy.kind);
  }

  // Delete / Backspace removes the selected object (but not while typing in a field)
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (!selected || /input|textarea|select/i.test(t.tagName)) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        remove(selected);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  function downOnScene(e: PointerEvent) {
    if (e.target !== e.currentTarget) return;
    if (!placing) return onSelect(null);
    const kind = kinds.get(placing);
    if (!kind) return;
    const p = point(e);
    const inst: Instance = { id: uid(), kind: kind.id, x: snap(p.x - kind.w / 2), y: snap(p.y - kind.h / 2) };
    onChange({ ...scene, instances: [...scene.instances, inst] });
    onSelect(inst.id, inst.kind);
  }

  function downOnObject(e: PointerEvent, inst: Instance) {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const p = point(e);
    drag.current = { id: inst.id, dx: p.x - inst.x, dy: p.y - inst.y, moved: false };
    onSelect(inst.id, inst.kind);
  }

  function moveObject(e: PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const p = point(e);
    d.moved = true;
    update(d.id, { x: snap(p.x - d.dx), y: snap(p.y - d.dy) });
  }

  const sel = scene.instances.find((i) => i.id === selected);
  const grid = GRID * 5 * scale;

  return (
    <div>
      <div
        ref={box}
        onPointerDown={downOnScene}
        className={`relative w-full touch-none overflow-hidden rounded-xl border-2 border-[#e6e7ee] shadow-sm dark:border-slate-700 ${placing ? "cursor-crosshair" : "cursor-default"}`}
        style={{
          aspectRatio: `${scene.w} / ${scene.h}`,
          background: scene.bg,
          backgroundImage: "linear-gradient(rgb(0 0 0 / 0.06) 1px, transparent 1px), linear-gradient(90deg, rgb(0 0 0 / 0.06) 1px, transparent 1px)",
          backgroundSize: `${grid}px ${grid}px`,
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
              className={`absolute cursor-move select-none ${inst.id === selected ? "outline outline-2 outline-offset-1 outline-[#4f1fd1]" : ""}`}
              style={{ left: inst.x * scale, top: inst.y * scale, width: k.w * scale, height: k.h * scale, fontSize: Math.min(k.w, k.h) * scale * 0.9 }}
            >
              <LookView look={k.look} className="pointer-events-none h-full w-full" />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex min-h-[2rem] flex-wrap items-center gap-2 text-xs text-slate-500">
        {sel ? (
          <>
            <span className="font-semibold text-slate-700">{kinds.get(sel.kind)?.name}</span>
            <span>
              x: {sel.x}, y: {sel.y}
            </span>
            <button type="button" onClick={() => duplicate(sel.id)} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-600 hover:bg-slate-200">
              <Copy className="h-3.5 w-3.5" strokeWidth={2.2} /> Копия
            </button>
            <button type="button" onClick={() => remove(sel.id)} className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 font-semibold text-rose-600 hover:bg-rose-100">
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2.2} /> Убрать со сцены
            </button>
            <span className="text-slate-400">· или клавиша Delete</span>
          </>
        ) : placing ? (
          <span className="font-semibold text-[#4f1fd1]">Кликай по сцене, чтобы ставить «{kinds.get(placing)?.name}». Закончить — ещё раз нажми «ставлю…».</span>
        ) : (
          <span>Выбери объект на сцене, чтобы двигать его, или поставь новый из списка слева.</span>
        )}
      </div>
    </div>
  );
}
