import { useRef, useState, type ReactNode } from "react";
import { Brush, ChevronDown, ChevronRight, ImagePlus, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import {
  BEHAVIOR_INFO,
  COLOR_LOOKS,
  EMOJI_LOOKS,
  KIND_TYPES,
  SIZES,
  firstLook,
  isColor,
  isImage,
  kindType,
  type Behavior,
  type Instance,
  type KindType,
  type Look,
  type ObjectKind,
  type Project,
  type Scene,
  type Variable,
} from "./model";
import { PixelEditor } from "./PixelEditor";
import { LookView } from "./Player";
import { readPicture } from "./store";

// The two side panels of the editor, in its dark workspace style:
// right — «Объекты» (search, add by type, drag onto the scene, open the object window);
// left — «Свойства» of the scene, or where the chosen copy stands (X, Y, Z, size of a tiled sprite).

export const ui = {
  panel: "bg-[#1f2028] text-[#e5e7eb]",
  head: "flex items-center justify-between border-b border-[#2e3039] px-3 py-2.5 text-sm font-bold",
  input: "w-full rounded-md border border-[#383b47] bg-[#2a2c36] px-2 py-1.5 text-sm text-[#e5e7eb] outline-none focus:border-[#7046ec]",
  muted: "text-[#9ca3af]",
  accent: "bg-[#7046ec] text-white hover:bg-[#5e38d6]",
  soft: "bg-[#2a2c36] text-[#d1d5db] hover:bg-[#343744]",
};

/** A part of a panel that folds, like «Свойства», «Поведения», «Переменные». */
export function Section({ title, children, extra, open: start = true }: { title: string; children: ReactNode; extra?: ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(start);
  return (
    <div className="border-b border-[#2e3039]">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex flex-1 items-center gap-2 text-left text-sm font-bold">
          <span className="flex h-5 w-5 items-center justify-center rounded border border-[#4b4f5e]">
            {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </span>
          {title}
        </button>
        {extra}
      </div>
      {open && <div className="space-y-3 px-3 pb-3">{children}</div>}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-2 text-sm">
      <span className={ui.muted}>{label}</span>
      {children}
    </label>
  );
}

export function Num({ value, onChange, min = 0, max = 5000 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return <input type="number" value={value} min={min} max={max} onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))} className={ui.input} />;
}

/** CSS background that repeats one tile (picture, emoji or colour) — for the scene and the previews. */
export function tileBackground(look: Look, tw: number, th: number): string {
  if (isColor(look)) return look;
  if (isImage(look)) return `url("${look}") 0 0 / ${tw}px ${th}px repeat`;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><text x='32' y='36' font-size='54' text-anchor='middle' dominant-baseline='middle'>${look}</text></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") 0 0 / ${tw}px ${th}px repeat`;
}

/** A small picture of an object for lists and headers: a sprite, a strip of tiles, «Aa» for a text, a mini button. */
export function KindPreview({ kind, className = "h-8 w-8 text-2xl" }: { kind: ObjectKind; className?: string }) {
  const t = kindType(kind);
  if (t === "tiled") return <span className={`block rounded ${className}`} style={{ background: tileBackground(kind.look, 12, 12) }} />;
  if (t === "text") return <span className={`flex items-center justify-center rounded bg-[#2a2c36] font-heading text-sm font-extrabold ${className}`} style={{ color: kind.color === "#1e293b" ? "#e5e7eb" : kind.color }}>Aa</span>;
  if (t === "button")
    return (
      <span className={`flex items-center justify-center ${className}`}>
        <span className="block h-[55%] w-full rounded-md" style={{ background: kind.bg ?? "#4d16c9" }} />
      </span>
    );
  return <LookView look={firstLook(kind)} className={className} />;
}

// ── right: objects ──

export const DRAG_TYPE = "application/x-studio-object";

export function ObjectsPanel({
  project,
  selected,
  onSelect,
  onAdd,
  onEdit,
}: {
  project: Project;
  selected: string | null;
  onSelect: (id: string) => void;
  onAdd: (type: KindType) => void;
  onEdit: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState(false);
  const list = project.objects.filter((o) => o.name.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <div className={`${ui.panel} flex h-full flex-col`}>
      <div className={ui.head}>Объекты</div>
      <div className="p-3">
        <label className="flex items-center gap-2 rounded-md bg-[#2a2c36] px-2.5">
          <Search className="h-4 w-4 text-[#9ca3af]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск объектов" className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-[#6b7280]" />
        </label>
      </div>
      <div className="relative flex items-center justify-between px-3 pb-2">
        <span className="text-sm font-bold">Объекты игры</span>
        <button type="button" onClick={() => setMenu((m) => !m)} className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-bold ${ui.accent}`}>
          <Plus className="h-3.5 w-3.5" strokeWidth={2.6} /> Добавить объект
        </button>
        {menu && (
          <div className="absolute right-3 top-9 z-20 w-64 overflow-hidden rounded-lg border border-[#383b47] bg-[#262832] shadow-2xl">
            <p className={`px-3 pt-2.5 text-xs font-bold uppercase tracking-wide ${ui.muted}`}>Какой объект?</p>
            {(Object.keys(KIND_TYPES) as KindType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setMenu(false);
                  onAdd(t);
                }}
                className="flex w-full items-start gap-2.5 px-3 py-2 text-left hover:bg-[#343744]"
              >
                <span className="text-xl leading-none">{KIND_TYPES[t].icon}</span>
                <span>
                  <span className="block text-sm font-bold">{KIND_TYPES[t].title}</span>
                  <span className={`block text-xs ${ui.muted}`}>{KIND_TYPES[t].about}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <ul className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
        {list.map((o) => (
          <li key={o.id} className={`group flex items-center rounded-md ${selected === o.id ? "bg-[#7046ec]/30 ring-1 ring-[#7046ec]" : "hover:bg-[#2a2c36]"}`}>
            <button
              type="button"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(DRAG_TYPE, o.id);
                e.dataTransfer.effectAllowed = "copy";
              }}
              onClick={() => onSelect(o.id)}
              onDoubleClick={() => onEdit(o.id)}
              title="Перетащи на сцену · двойной клик — изменить"
              className="flex min-w-0 flex-1 cursor-grab items-center gap-2.5 px-2 py-1.5 text-left text-sm active:cursor-grabbing"
            >
              <KindPreview kind={o} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{o.name}</span>
                <span className={`block text-[0.6875rem] ${ui.muted}`}>{KIND_TYPES[kindType(o)].title}</span>
              </span>
            </button>
            <button type="button" onClick={() => onEdit(o.id)} aria-label={`Изменить ${o.name}`} title="Изменить объект" className="mr-1 rounded p-1.5 text-[#9ca3af] hover:bg-[#343744] hover:text-white">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
        {!project.objects.length && <li className={`px-2 py-4 text-center text-sm ${ui.muted}`}>Начни с добавления нового объекта.</li>}
      </ul>
      <p className={`border-t border-[#2e3039] p-3 text-xs ${ui.muted}`}>Перетащи объект мышкой на сцену. Двойной клик или ✏️ — открыть его свойства.</p>
    </div>
  );
}

// ── pieces of the object window ──

export function BehaviorCard({ b, project, onChange, onRemove }: { b: Behavior; project: Project; onChange: (b: Behavior) => void; onRemove: () => void }) {
  const info = BEHAVIOR_INFO[b.kind];
  return (
    <div className="rounded-md border border-[#383b47] bg-[#262832] p-3">
      <div className="mb-1 flex items-start justify-between gap-2">
        <p className="text-sm font-bold">{info.title}</p>
        <button type="button" onClick={onRemove} aria-label="Убрать поведение" className="text-[#9ca3af] hover:text-[#fb7185]">
          <X className="h-4 w-4" strokeWidth={2.4} />
        </button>
      </div>
      <p className={`mb-2 text-xs ${ui.muted}`}>{info.about}</p>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {b.kind === "topdown" && (
          <Field label="Скорость">
            <Num value={b.speed} onChange={(speed) => onChange({ ...b, speed })} />
          </Field>
        )}
        {b.kind === "platformer" && (
          <>
            <Field label="Скорость">
              <Num value={b.speed} onChange={(speed) => onChange({ ...b, speed })} />
            </Field>
            <Field label="Прыжок">
              <Num value={b.jump} onChange={(jump) => onChange({ ...b, jump })} />
            </Field>
            <Field label="Гравитация">
              <Num value={b.gravity} onChange={(gravity) => onChange({ ...b, gravity })} />
            </Field>
          </>
        )}
        {b.kind === "patrol" && (
          <>
            <Field label="Направление">
              <select value={b.axis} onChange={(e) => onChange({ ...b, axis: e.target.value as "x" | "y" })} className={ui.input}>
                <option value="x">влево-вправо</option>
                <option value="y">вверх-вниз</option>
              </select>
            </Field>
            <Field label="Расстояние">
              <Num value={b.distance} onChange={(distance) => onChange({ ...b, distance })} />
            </Field>
            <Field label="Скорость">
              <Num value={b.speed} onChange={(speed) => onChange({ ...b, speed })} />
            </Field>
          </>
        )}
        {b.kind === "chase" && (
          <>
            <Field label="За кем">
              <select value={b.target} onChange={(e) => onChange({ ...b, target: e.target.value })} className={ui.input}>
                {project.objects.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Скорость">
              <Num value={b.speed} onChange={(speed) => onChange({ ...b, speed })} />
            </Field>
          </>
        )}
      </div>
    </div>
  );
}

export function BehaviorsEditor({ kind, project, onChange }: { kind: ObjectKind; project: Project; onChange: (k: ObjectKind) => void }) {
  const missing = (Object.keys(BEHAVIOR_INFO) as Behavior["kind"][]).filter((k) => !kind.behaviors.some((b) => b.kind === k));
  return (
    <div className="space-y-2">
      {kind.behaviors.map((b, i) => (
        <BehaviorCard
          key={b.kind}
          b={b}
          project={project}
          onChange={(nb) => onChange({ ...kind, behaviors: kind.behaviors.map((x, j) => (j === i ? nb : x)) })}
          onRemove={() => onChange({ ...kind, behaviors: kind.behaviors.filter((_, j) => j !== i) })}
        />
      ))}
      {!kind.behaviors.length && <p className={`text-sm ${ui.muted}`}>Пока никаких поведений — объект просто стоит на месте.</p>}
      {missing.length > 0 && (
        <select
          value=""
          onChange={(e) => e.target.value && onChange({ ...kind, behaviors: [...kind.behaviors, BEHAVIOR_INFO[e.target.value as Behavior["kind"]].make(project.objects)] })}
          className={`${ui.input} font-semibold text-[#c4b5fd]`}
        >
          <option value="">+ Добавить поведение…</option>
          {missing.map((k) => (
            <option key={k} value={k}>
              {BEHAVIOR_INFO[k].title}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

/** Choose a picture: draw it, upload it, take a ready one or a colour block. */
export function LookPicker({ look, onChange, drawLabel = "Нарисовать" }: { look: Look; onChange: (look: Look) => void; drawLabel?: string }) {
  const [tab, setTab] = useState<"emoji" | "color">(isColor(look) ? "color" : "emoji");
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);

  async function upload(f: File | undefined) {
    if (!f) return;
    setError(null);
    try {
      onChange(await readPicture(f));
    } catch {
      setError("Не получилось открыть картинку. Попробуй файл PNG или JPG.");
    }
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-1.5">
        <button type="button" onClick={() => setDrawing(true)} className={`inline-flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-bold ${ui.accent}`}>
          <Brush className="h-4 w-4" strokeWidth={2.2} /> {drawLabel}
        </button>
        <button type="button" onClick={() => file.current?.click()} className={`inline-flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-bold ${ui.soft}`}>
          <ImagePlus className="h-4 w-4" strokeWidth={2.2} /> Загрузить
        </button>
      </div>
      <input ref={file} type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
      {error && <p className="text-xs font-semibold text-[#fb7185]">{error}</p>}
      <div className="flex gap-1 rounded-md bg-[#2a2c36] p-1">
        {(
          [
            ["emoji", "Готовые"],
            ["color", "Цветной блок"],
          ] as const
        ).map(([t, label]) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`flex-1 rounded py-1 text-xs font-semibold ${tab === t ? "bg-[#7046ec] text-white" : ui.muted}`}>
            {label}
          </button>
        ))}
      </div>
      {tab === "emoji" ? (
        <div className="grid grid-cols-7 gap-0.5 sm:grid-cols-10">
          {EMOJI_LOOKS.map((e) => (
            <button key={e} type="button" onClick={() => onChange(e)} className={`rounded p-1 text-lg hover:bg-[#343744] ${look === e ? "bg-[#7046ec]/40" : ""}`}>
              {e}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5">
          {COLOR_LOOKS.map((c) => (
            <button key={c} type="button" aria-label={`Цвет ${c}`} onClick={() => onChange(c)} className={`h-7 w-7 rounded ${look === c ? "ring-2 ring-white" : ""}`} style={{ background: c }} />
          ))}
          <input type="color" value={isColor(look) ? look : "#64748b"} onChange={(e) => onChange(e.target.value)} className="h-7 w-10 cursor-pointer rounded border border-[#383b47] bg-transparent" aria-label="Свой цвет" />
        </div>
      )}
      {drawing && (
        <PixelEditor
          look={look}
          onClose={() => setDrawing(false)}
          onSave={(l) => {
            onChange(l);
            setDrawing(false);
          }}
        />
      )}
    </div>
  );
}

// ── left: the scene, or where the chosen copy stands ──

export function PropertiesPanel({
  project,
  scene,
  kind,
  instance,
  onEditKind,
  onDeleteKind,
  onScene,
  onInstance,
  onVariables,
}: {
  project: Project;
  scene: Scene;
  kind: ObjectKind | null;
  instance: Instance | null;
  onEditKind: (id: string) => void;
  onDeleteKind: (id: string) => void;
  onScene: (s: Scene) => void;
  onInstance: (i: Instance) => void;
  onVariables: (v: Variable[]) => void;
}) {
  return (
    <div className={`${ui.panel} flex h-full flex-col overflow-y-auto`}>
      <div className={ui.head}>Свойства</div>
      {kind ? (
        <>
          <div className="flex items-center gap-3 border-b border-[#2e3039] px-3 py-3">
            <KindPreview kind={kind} className="h-12 w-12 shrink-0 text-4xl" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{kind.name}</p>
              <p className={`text-xs ${ui.muted}`}>{KIND_TYPES[kindType(kind)].title}</p>
            </div>
          </div>
          <div className="p-3">
            <button type="button" onClick={() => onEditKind(kind.id)} className={`inline-flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-bold ${ui.accent}`}>
              <Pencil className="h-4 w-4" /> Изменить объект…
            </button>
            <p className={`mt-1.5 text-xs ${ui.muted}`}>Картинка, анимации, текст и поведения — в окне объекта.</p>
          </div>
          {instance && (
            <Section title="На сцене">
              <Field label="X">
                <Num value={instance.x} min={-100000} max={100000} onChange={(x) => onInstance({ ...instance, x })} />
              </Field>
              <Field label="Y">
                <Num value={instance.y} min={-100000} max={100000} onChange={(y) => onInstance({ ...instance, y })} />
              </Field>
              <Field label="Z (слой)">
                <Num value={instance.z ?? 0} min={-999} max={999} onChange={(z) => onInstance({ ...instance, z })} />
              </Field>
              <p className={`text-xs ${ui.muted}`}>Чем больше Z, тем выше объект: он рисуется поверх тех, у кого Z меньше.</p>
              {kindType(kind) === "tiled" && (
                <>
                  <Field label="Ширина">
                    <Num value={instance.w ?? kind.w * 5} min={8} max={20000} onChange={(w) => onInstance({ ...instance, w })} />
                  </Field>
                  <Field label="Высота">
                    <Num value={instance.h ?? kind.h} min={8} max={20000} onChange={(h) => onInstance({ ...instance, h })} />
                  </Field>
                  <p className={`text-xs ${ui.muted}`}>Или тяни за уголок на сцене — рисунок повторится плиткой.</p>
                </>
              )}
            </Section>
          )}
          <div className="p-3">
            <button type="button" onClick={() => onDeleteKind(kind.id)} className={`inline-flex items-center gap-1.5 text-xs font-semibold ${ui.muted} hover:text-[#fb7185]`}>
              <Trash2 className="h-3.5 w-3.5" /> Удалить объект из игры
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="border-b border-[#2e3039] px-3 py-3 text-sm font-semibold">🎬 {scene.name}</div>
          <Section title="Свойства сцены">
            <Field label="Название">
              <input value={scene.name} onChange={(e) => onScene({ ...scene, name: e.target.value })} className={ui.input} />
            </Field>
            <Field label="Цвет фона">
              <span className="flex items-center gap-2">
                <input value={scene.bg} onChange={(e) => onScene({ ...scene, bg: e.target.value })} className={ui.input} />
                <input type="color" value={scene.bg} onChange={(e) => onScene({ ...scene, bg: e.target.value })} className="h-8 w-9 shrink-0 cursor-pointer rounded border border-[#383b47] bg-transparent" />
              </span>
            </Field>
            <Field label="Экран">
              <select
                value={`${scene.w}x${scene.h}`}
                onChange={(e) => {
                  const [w, h] = e.target.value.split("x").map(Number);
                  onScene({ ...scene, w, h });
                }}
                className={ui.input}
              >
                {SIZES.map((s) => (
                  <option key={s.label} value={`${s.w}x${s.h}`}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          </Section>
          <Section
            title="Переменные игры"
            extra={
              <button type="button" onClick={() => onVariables([...project.variables, { name: `Переменная${project.variables.length + 1}`, value: 0 }])} aria-label="Добавить переменную" className="rounded p-1 hover:bg-[#2a2c36]">
                <Plus className="h-4 w-4" />
              </button>
            }
          >
            <p className={`text-xs ${ui.muted}`}>Числа, которые игра помнит: очки, жизни, ключи. Их можно показать текстом: Очки: {"{Очки}"}.</p>
            {project.variables.map((v, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <input value={v.name} onChange={(e) => onVariables(project.variables.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} aria-label="Имя переменной" className={`${ui.input} min-w-0 flex-1 font-semibold`} />
                <span className={ui.muted}>=</span>
                <input type="number" value={v.value} onChange={(e) => onVariables(project.variables.map((x, j) => (j === i ? { ...x, value: Number(e.target.value) || 0 } : x)))} className={`${ui.input.replace("w-full ", "")} w-16 shrink-0`} />
                <button type="button" onClick={() => onVariables(project.variables.filter((_, j) => j !== i))} aria-label="Удалить переменную" className={`${ui.muted} hover:text-[#fb7185]`}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </Section>
          <p className={`p-4 text-center text-sm ${ui.muted}`}>Щёлкни по объекту на сцене или в списке справа, чтобы увидеть его свойства.</p>
        </>
      )}
    </div>
  );
}
