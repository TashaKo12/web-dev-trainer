import { useEffect, useLayoutEffect, useRef, useState, type DragEvent, type PointerEvent } from "react";
import { firstLook, instSize, kindType, uid, type Instance, type ObjectKind, type Project, type Scene } from "./model";
import { DRAG_TYPE, tileBackground } from "./ObjectPanel";
import { LookView } from "./Player";

// The scene in the middle of the editor. The world has no edges: drag the empty space (or scroll) to move around.
// The dashed frame is what the game screen shows at the start; the camera can later follow an object.

const GRID = 8;
const snap = (v: number) => Math.round(v / GRID) * GRID;

/** How an object looks on the scene: a sprite's picture, repeated tiles, a text or a button. */
function InstanceView({ kind, w, h, scale }: { kind: ObjectKind; w: number; h: number; scale: number }) {
  const t = kindType(kind);
  if (t === "tiled") return <div className="pointer-events-none h-full w-full" style={{ background: tileBackground(kind.look, kind.w * scale, kind.h * scale) }} />;
  if (t === "text")
    return (
      <div className="pointer-events-none h-full w-full overflow-hidden whitespace-pre-wrap font-bold leading-tight" style={{ fontSize: (kind.fontSize ?? 24) * scale, color: kind.color }}>
        {kind.text}
      </div>
    );
  if (t === "button")
    return (
      <div
        className="pointer-events-none flex h-full w-full items-center justify-center overflow-hidden text-center font-bold leading-tight"
        style={{ background: kind.bg, color: kind.color, fontSize: (kind.fontSize ?? 22) * scale, borderRadius: Math.min(w, h) * 0.25 * scale }}
      >
        {kind.text}
      </div>
    );
  return <LookView look={firstLook(kind)} className="pointer-events-none h-full w-full" />;
}

export function SceneEditor({
  project,
  scene,
  selected,
  zoom,
  grid,
  resetView,
  onSelect,
  onChange,
  onCursor,
  onEdit,
}: {
  project: Project;
  scene: Scene;
  selected: string | null;
  zoom: number;
  grid: boolean;
  /** Changes when the editor asks to show the screen frame again. */
  resetView: number;
  onSelect: (instanceId: string | null, kindId?: string) => void;
  onChange: (s: Scene) => void;
  onCursor: (p: { x: number; y: number } | null) => void;
  /** double click on an object opens its window */
  onEdit?: (kindId: string) => void;
}) {
  const work = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  const [pan, setPan] = useState({ x: 32, y: 32 });
  const panning = useRef<{ sx: number; sy: number; px: number; py: number; moved: boolean } | null>(null);
  const drag = useRef<{ id: string; dx: number; dy: number; resize?: boolean } | null>(null);
  /** The world point in the middle of the workspace: kept when zooming. */
  const center = useRef<{ x: number; y: number } | null>(null);
  const kinds = new Map(project.objects.map((o) => [o.id, o]));
  const scale = fit * zoom;

  // at zoom 100% the screen frame fits the workspace
  useEffect(() => {
    const el = work.current;
    if (!el) return;
    const measure = () => setFit(Math.max(0.2, Math.min((el.clientWidth - 96) / scene.w, (el.clientHeight - 96) / scene.h)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scene.w, scene.h]);

  // show the screen frame in the middle (at the start, for another scene, on «100%»)
  useLayoutEffect(() => {
    center.current = { x: scene.w / 2, y: scene.h / 2 };
  }, [scene.id, resetView, scene.w, scene.h]);

  // keep the same world point in the middle when the scale changes
  useLayoutEffect(() => {
    const el = work.current;
    if (!el || !center.current) return;
    setPan({ x: el.clientWidth / 2 - center.current.x * scale, y: el.clientHeight / 2 - center.current.y * scale });
  }, [scale, scene.id, resetView]);

  const remember = (p: { x: number; y: number }) => {
    const el = work.current;
    if (el) center.current = { x: (el.clientWidth / 2 - p.x) / scale, y: (el.clientHeight / 2 - p.y) / scale };
  };

  // the mouse wheel moves around the world (a native listener: React's wheel cannot stop the page from scrolling)
  useEffect(() => {
    const el = work.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      setPan((p) => {
        const next = { x: p.x - (e.shiftKey ? e.deltaY : e.deltaX), y: p.y - (e.shiftKey ? 0 : e.deltaY) };
        remember(next);
        return next;
      });
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  });

  const toWorld = (clientX: number, clientY: number) => {
    const r = work.current!.getBoundingClientRect();
    return { x: (clientX - r.left - pan.x) / scale, y: (clientY - r.top - pan.y) / scale };
  };

  // Delete / Backspace removes the selected object (not while typing in a field)
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (!selected || /input|textarea|select/i.test(t.tagName) || document.querySelector("[data-object-dialog]")) return;
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
    const kind = kinds.get(e.dataTransfer.getData(DRAG_TYPE));
    if (!kind) return;
    e.preventDefault();
    const p = toWorld(e.clientX, e.clientY);
    const size = instSize(kind, {});
    // a new copy goes above everything already on the scene
    const z = Math.max(0, ...scene.instances.map((i) => i.z ?? 0)) + (scene.instances.length ? 1 : 0);
    const inst: Instance = { id: uid(), kind: kind.id, x: snap(p.x - size.w / 2), y: snap(p.y - size.h / 2), z };
    onChange({ ...scene, instances: [...scene.instances, inst] });
    onSelect(inst.id, inst.kind);
  }

  function downOnObject(e: PointerEvent, inst: Instance) {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const p = toWorld(e.clientX, e.clientY);
    drag.current = { id: inst.id, dx: p.x - inst.x, dy: p.y - inst.y };
    onSelect(inst.id, inst.kind);
  }

  function downOnHandle(e: PointerEvent, inst: Instance) {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { id: inst.id, dx: inst.x, dy: inst.y, resize: true };
  }

  function moveObject(e: PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const p = toWorld(e.clientX, e.clientY);
    if (d.resize) {
      onChange({ ...scene, instances: scene.instances.map((i) => (i.id === d.id ? { ...i, w: Math.max(GRID, snap(p.x - d.dx)), h: Math.max(GRID, snap(p.y - d.dy)) } : i)) });
      return;
    }
    onChange({ ...scene, instances: scene.instances.map((i) => (i.id === d.id ? { ...i, x: snap(p.x - d.dx), y: snap(p.y - d.dy) } : i)) });
  }

  const cell = GRID * 5 * scale;

  return (
    <div
      ref={work}
      onPointerDown={(e) => {
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {
          // some pointers cannot be captured — moving the field still works while the mouse is over it
        }
        panning.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y, moved: false };
      }}
      onPointerMove={(e) => {
        const p = toWorld(e.clientX, e.clientY);
        onCursor({ x: Math.round(p.x), y: Math.round(p.y) });
        const pn = panning.current;
        if (!pn) return;
        const dx = e.clientX - pn.sx;
        const dy = e.clientY - pn.sy;
        if (Math.abs(dx) + Math.abs(dy) > 3) pn.moved = true;
        if (pn.moved) {
          const next = { x: pn.px + dx, y: pn.py + dy };
          setPan(next);
          remember(next);
        }
      }}
      onPointerUp={() => {
        if (panning.current && !panning.current.moved) onSelect(null);
        panning.current = null;
      }}
      onPointerLeave={() => onCursor(null)}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes(DRAG_TYPE)) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }
      }}
      onDrop={drop}
      className={`relative h-full touch-none overflow-hidden ${panning.current?.moved ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        background: scene.bg,
        backgroundImage: grid ? "linear-gradient(rgb(0 0 0 / 0.07) 1px, transparent 1px), linear-gradient(90deg, rgb(0 0 0 / 0.07) 1px, transparent 1px)" : undefined,
        backgroundSize: `${cell}px ${cell}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      <div className="absolute left-0 top-0" style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
        {/* what the screen shows at the start of the game */}
        <div className="pointer-events-none absolute left-0 top-0 rounded-sm border-2 border-dashed border-[#7046ec]/70" style={{ width: scene.w * scale, height: scene.h * scale }}>
          <span className="absolute -top-6 left-0 whitespace-nowrap rounded bg-[#7046ec] px-2 py-0.5 text-[0.6875rem] font-bold text-white">Экран игры в начале · {scene.w} × {scene.h}</span>
        </div>
        {scene.instances.map((inst) => {
          const k = kinds.get(inst.kind);
          if (!k) return null;
          const { w, h } = instSize(k, inst);
          const tiled = kindType(k) === "tiled";
          return (
            <div
              key={inst.id}
              onDoubleClick={() => onEdit?.(k.id)}
              onPointerDown={(e) => downOnObject(e, inst)}
              onPointerMove={moveObject}
              onPointerUp={(e) => {
                e.stopPropagation();
                drag.current = null;
              }}
              title={`${k.name} — двойной клик откроет свойства`}
              className={`absolute cursor-move touch-none select-none ${inst.id === selected ? "outline outline-2 outline-offset-1 outline-[#7046ec]" : "hover:outline hover:outline-1 hover:outline-[#7046ec]/60"}`}
              style={{ left: inst.x * scale, top: inst.y * scale, width: w * scale, height: h * scale, fontSize: Math.min(w, h) * scale * 0.9, zIndex: (inst.z ?? 0) + 1 + (k.fixed ? 100000 : 0) }}
            >
              <InstanceView kind={k} w={w} h={h} scale={scale} />
              {tiled && inst.id === selected && (
                <span
                  onPointerDown={(e) => downOnHandle(e, inst)}
                  onPointerMove={moveObject}
                  onPointerUp={(e) => {
                    e.stopPropagation();
                    drag.current = null;
                  }}
                  title="Потяни, чтобы растянуть"
                  className="absolute -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize rounded-sm border-2 border-white bg-[#7046ec] shadow"
                />
              )}
            </div>
          );
        })}
      </div>
      {!scene.instances.length && (
        <p className="pointer-events-none absolute inset-x-0 bottom-10 text-center text-sm font-semibold text-slate-500">Перетащи сюда объект из списка справа</p>
      )}
      <p className="pointer-events-none absolute bottom-2 left-3 rounded bg-black/45 px-2 py-0.5 text-[0.6875rem] text-white">
        Сцена бесконечная: двигай поле мышкой или колёсиком (Shift — вбок)
      </p>
    </div>
  );
}
