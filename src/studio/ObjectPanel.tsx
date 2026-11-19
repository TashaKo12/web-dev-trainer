import { useRef, useState } from "react";
import { ImagePlus, Plus, Trash2, X } from "lucide-react";
import { BEHAVIOR_INFO, COLOR_LOOKS, EMOJI_LOOKS, isColor, isImage, uid, type Behavior, type ObjectKind, type Project } from "./model";
import { LookView } from "./Player";
import { readPicture } from "./store";

// Left: the objects of the game. Right: the chosen object — its picture, size and behaviors.

const input = "w-full rounded-lg border border-[#e6e7ee] bg-white px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-[#4f1fd1] dark:border-slate-700";
const panel = "rounded-xl border border-[#e6e7ee] bg-white p-4 shadow-sm dark:border-slate-800";

export function ObjectLibrary({
  project,
  sceneCounts,
  selected,
  placing,
  onSelect,
  onPlace,
  onAdd,
}: {
  project: Project;
  sceneCounts: Record<string, number>;
  selected: string | null;
  placing: string | null;
  onSelect: (id: string) => void;
  onPlace: (id: string | null) => void;
  onAdd: () => void;
}) {
  return (
    <div className={panel}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Объекты</p>
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-1 rounded-lg bg-[#4f1fd1] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#4318b8]">
          <Plus className="h-3.5 w-3.5" strokeWidth={2.6} /> Новый
        </button>
      </div>
      <ul className="space-y-1.5">
        {project.objects.map((o) => (
          <li key={o.id}>
            <div
              className={`flex items-center gap-2 rounded-lg border p-1.5 ${
                selected === o.id ? "border-[#4f1fd1] bg-[#f3efff] dark:bg-violet-500/15" : "border-transparent hover:bg-slate-50"
              }`}
            >
              <button type="button" onClick={() => onSelect(o.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                <LookView look={o.look} className="h-8 w-8 shrink-0 text-2xl" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-800">{o.name}</span>
                  <span className="block text-[11px] text-slate-400">на сцене: {sceneCounts[o.id] ?? 0}</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => onPlace(placing === o.id ? null : o.id)}
                title="Поставить на сцену"
                className={`rounded-md px-2 py-1 text-xs font-bold ${placing === o.id ? "bg-[#4f1fd1] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {placing === o.id ? "ставлю…" : "+ сцена"}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-slate-400">Нажми «+ сцена», потом кликай по сцене — объект появится там. Перетаскивай мышкой.</p>
    </div>
  );
}

function Num({ label, value, onChange, min = 0, max = 5000, step = 1 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <label className="block text-xs font-semibold text-slate-500">
      {label}
      <input type="number" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))} className={`${input} mt-1`} />
    </label>
  );
}

function BehaviorCard({ b, project, onChange, onRemove }: { b: Behavior; project: Project; onChange: (b: Behavior) => void; onRemove: () => void }) {
  const info = BEHAVIOR_INFO[b.kind];
  return (
    <div className="rounded-lg border border-[#e6e7ee] p-3 dark:border-slate-700">
      <div className="mb-1 flex items-start justify-between gap-2">
        <p className="text-sm font-bold text-slate-800">{info.title}</p>
        <button type="button" onClick={onRemove} aria-label="Убрать поведение" className="text-slate-400 hover:text-rose-500">
          <X className="h-4 w-4" strokeWidth={2.4} />
        </button>
      </div>
      <p className="mb-2 text-xs text-slate-500">{info.about}</p>
      <div className="grid grid-cols-2 gap-2">
        {b.kind === "topdown" && <Num label="Скорость" value={b.speed} onChange={(speed) => onChange({ ...b, speed })} />}
        {b.kind === "platformer" && (
          <>
            <Num label="Скорость" value={b.speed} onChange={(speed) => onChange({ ...b, speed })} />
            <Num label="Сила прыжка" value={b.jump} onChange={(jump) => onChange({ ...b, jump })} />
            <Num label="Гравитация" value={b.gravity} onChange={(gravity) => onChange({ ...b, gravity })} />
          </>
        )}
        {b.kind === "patrol" && (
          <>
            <label className="block text-xs font-semibold text-slate-500">
              Направление
              <select value={b.axis} onChange={(e) => onChange({ ...b, axis: e.target.value as "x" | "y" })} className={`${input} mt-1`}>
                <option value="x">влево-вправо</option>
                <option value="y">вверх-вниз</option>
              </select>
            </label>
            <Num label="Расстояние" value={b.distance} onChange={(distance) => onChange({ ...b, distance })} />
            <Num label="Скорость" value={b.speed} onChange={(speed) => onChange({ ...b, speed })} />
          </>
        )}
        {b.kind === "chase" && (
          <>
            <label className="col-span-2 block text-xs font-semibold text-slate-500">
              За кем
              <select value={b.target} onChange={(e) => onChange({ ...b, target: e.target.value })} className={`${input} mt-1`}>
                {project.objects.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </label>
            <Num label="Скорость" value={b.speed} onChange={(speed) => onChange({ ...b, speed })} />
          </>
        )}
      </div>
    </div>
  );
}

export function ObjectProperties({ kind, project, onChange, onDelete }: { kind: ObjectKind; project: Project; onChange: (k: ObjectKind) => void; onDelete: () => void }) {
  const [tab, setTab] = useState<"emoji" | "color" | "image">(isImage(kind.look) ? "image" : isColor(kind.look) ? "color" : "emoji");
  const [error, setError] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const missing = (Object.keys(BEHAVIOR_INFO) as Behavior["kind"][]).filter((k) => !kind.behaviors.some((b) => b.kind === k));

  async function upload(f: File | undefined) {
    if (!f) return;
    setError(null);
    try {
      onChange({ ...kind, look: await readPicture(f) });
    } catch {
      setError("Не получилось открыть картинку. Попробуй файл PNG или JPG.");
    }
  }

  return (
    <div className={`${panel} space-y-4`}>
      <div className="flex items-center gap-3">
        <LookView look={kind.look} className="h-14 w-14 shrink-0 text-5xl" />
        <label className="block flex-1 text-xs font-semibold text-slate-500">
          Имя объекта
          <input value={kind.name} onChange={(e) => onChange({ ...kind, name: e.target.value })} className={`${input} mt-1`} />
        </label>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Как выглядит</p>
        <div className="mb-2 flex gap-1 rounded-lg bg-[#eef0f5] p-1 dark:bg-slate-800">
          {(
            [
              ["emoji", "Картинки"],
              ["color", "Цвет"],
              ["image", "Своя"],
            ] as const
          ).map(([t, label]) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={`flex-1 rounded-md py-1 text-xs font-semibold ${tab === t ? "bg-white text-[#4f1fd1] shadow-sm dark:bg-slate-950" : "text-slate-500"}`}>
              {label}
            </button>
          ))}
        </div>
        {tab === "emoji" && (
          <div className="grid grid-cols-7 gap-1">
            {EMOJI_LOOKS.map((e) => (
              <button key={e} type="button" onClick={() => onChange({ ...kind, look: e })} className={`rounded-md p-1 text-xl hover:bg-slate-100 ${kind.look === e ? "bg-[#ece6fd] ring-2 ring-[#4f1fd1]" : ""}`}>
                {e}
              </button>
            ))}
          </div>
        )}
        {tab === "color" && (
          <div className="flex flex-wrap items-center gap-1.5">
            {COLOR_LOOKS.map((c) => (
              <button key={c} type="button" aria-label={`Цвет ${c}`} onClick={() => onChange({ ...kind, look: c })} className={`h-8 w-8 rounded-md ${kind.look === c ? "ring-2 ring-[#4f1fd1] ring-offset-2" : ""}`} style={{ background: c }} />
            ))}
            <input type="color" value={isColor(kind.look) ? kind.look : "#64748b"} onChange={(e) => onChange({ ...kind, look: e.target.value })} className="h-8 w-10 cursor-pointer rounded-md border border-[#e6e7ee]" aria-label="Свой цвет" />
          </div>
        )}
        {tab === "image" && (
          <div>
            <input ref={file} type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
            <button type="button" onClick={() => file.current?.click()} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#c4b5fd] py-3 text-sm font-semibold text-[#4f1fd1] hover:bg-[#f3efff]">
              <ImagePlus className="h-4 w-4" strokeWidth={2.2} /> Загрузить картинку
            </button>
            <p className="mt-1.5 text-xs text-slate-400">PNG с прозрачным фоном выглядит лучше всего. Картинка уменьшится до 160 точек.</p>
            {error && <p className="mt-1.5 text-xs font-semibold text-rose-600">{error}</p>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Num label="Ширина" value={kind.w} min={8} max={800} onChange={(w) => onChange({ ...kind, w })} />
        <Num label="Высота" value={kind.h} min={8} max={800} onChange={(h) => onChange({ ...kind, h })} />
      </div>

      <div>
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Поведения</p>
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
          {!kind.behaviors.length && <p className="text-xs text-slate-400">Пока никаких — объект просто стоит на месте.</p>}
        </div>
        {missing.length > 0 && (
          <select
            value=""
            onChange={(e) => e.target.value && onChange({ ...kind, behaviors: [...kind.behaviors, BEHAVIOR_INFO[e.target.value as Behavior["kind"]].make(project.objects)] })}
            className={`${input} mt-2 font-semibold text-[#4f1fd1]`}
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

      <button type="button" onClick={onDelete} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600">
        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.2} /> Удалить объект из игры
      </button>
    </div>
  );
}

export const newObject = (n: number): ObjectKind => ({ id: uid(), name: `Объект ${n}`, look: "⭐", w: 40, h: 40, behaviors: [] });
