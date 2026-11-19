import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Brush, Copy, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { KIND_TYPES, firstLook, kindType, type Animation, type Look, type ObjectKind, type Project } from "./model";
import { BehaviorsEditor, Field, KindPreview, LookPicker, Num, tileBackground, ui } from "./ObjectPanel";
import { PixelEditor } from "./PixelEditor";
import { LookView } from "./Player";
import { readPicture } from "./store";

// The object window, like in a game engine: «Изменить …» with tabs. Changes are made on a copy
// and reach the game only with «Применить»; «Отмена» (or Esc) leaves the object as it was.

type Tab = "props" | "anim" | "behaviors";

/** Plays an animation in a small box, frame after frame. */
function AnimPreview({ anim, className = "h-20 w-20 text-6xl" }: { anim: Animation; className?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
    if (anim.frames.length < 2) return;
    let n = 0;
    const t = setInterval(() => {
      n++;
      setI(anim.loop ? n % anim.frames.length : Math.min(n, anim.frames.length - 1));
    }, 1000 / Math.max(0.5, anim.fps));
    return () => clearInterval(t);
  }, [anim]);
  const frame = anim.frames[i] ?? anim.frames[0];
  return frame ? <LookView look={frame} className={`${className} [image-rendering:pixelated]`} /> : <span className={`${className} rounded bg-[#2a2c36]`} />;
}

function AnimationCard({
  anim,
  onChange,
  onRemove,
  fallback,
}: {
  anim: Animation;
  onChange: (a: Animation) => void;
  onRemove: () => void;
  /** the picture a first frame starts from */
  fallback: Look;
}) {
  // which frame is being drawn: an index, or "new" for a new frame
  const [drawing, setDrawing] = useState<number | "new" | null>(null);
  const files = useRef<HTMLInputElement>(null);
  const frames = anim.frames;
  const set = (f: Look[]) => onChange({ ...anim, frames: f });

  async function upload(list: FileList | null) {
    if (!list?.length) return;
    const added: Look[] = [];
    for (const f of Array.from(list).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))) {
      try {
        added.push(await readPicture(f));
      } catch {
        // not a picture — skip it
      }
    }
    set([...frames, ...added]);
  }

  return (
    <div className="rounded-lg border border-[#383b47] bg-[#262832] p-3">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input value={anim.name} onChange={(e) => onChange({ ...anim, name: e.target.value })} aria-label="Название анимации" className={`${ui.input} max-w-[14rem] font-bold`} />
        <label className="flex items-center gap-1.5 text-sm">
          <span className={ui.muted}>кадров в секунду</span>
          <input type="number" min={1} max={30} value={anim.fps} onChange={(e) => onChange({ ...anim, fps: Math.max(1, Math.min(30, Number(e.target.value) || 1)) })} className={`${ui.input.replace("w-full ", "")} w-16`} />
        </label>
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" checked={anim.loop} onChange={(e) => onChange({ ...anim, loop: e.target.checked })} className="h-4 w-4 accent-[#7046ec]" />
          по кругу
        </label>
        <button type="button" onClick={onRemove} aria-label="Удалить анимацию" className="ml-auto rounded p-1.5 text-[#9ca3af] hover:bg-[#343744] hover:text-[#fb7185]">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex flex-col items-center gap-1">
          <AnimPreview anim={anim} />
          <span className={`text-[11px] ${ui.muted}`}>просмотр</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          {frames.map((f, i) => (
            <div key={i} className="group relative rounded-md border border-[#383b47] bg-[#1f2028] p-1">
              <button type="button" onClick={() => setDrawing(i)} title="Дорисовать кадр" className="block">
                <LookView look={f} className="h-14 w-14 text-4xl [image-rendering:pixelated]" />
              </button>
              <span className="absolute left-1 top-0.5 text-[10px] font-bold text-[#9ca3af]">{i + 1}</span>
              <div className="mt-1 flex justify-center gap-0.5 text-[#9ca3af]">
                <button type="button" onClick={() => i > 0 && set(frames.map((x, j) => (j === i - 1 ? frames[i] : j === i ? frames[i - 1] : x)))} aria-label="Кадр левее" className="rounded p-0.5 hover:bg-[#343744] hover:text-white">
                  <ArrowLeft className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => set([...frames.slice(0, i + 1), f, ...frames.slice(i + 1)])} aria-label="Копия кадра" className="rounded p-0.5 hover:bg-[#343744] hover:text-white">
                  <Copy className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => set(frames.filter((_, j) => j !== i))} aria-label="Удалить кадр" className="rounded p-0.5 hover:bg-[#343744] hover:text-[#fb7185]">
                  <X className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => i < frames.length - 1 && set(frames.map((x, j) => (j === i + 1 ? frames[i] : j === i ? frames[i + 1] : x)))} aria-label="Кадр правее" className="rounded p-0.5 hover:bg-[#343744] hover:text-white">
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <button type="button" onClick={() => setDrawing("new")} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold ${ui.accent}`}>
              <Brush className="h-3.5 w-3.5" /> {frames.length ? "Нарисовать следующий кадр" : "Нарисовать кадр"}
            </button>
            <button type="button" onClick={() => files.current?.click()} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold ${ui.soft}`}>
              <ImagePlus className="h-3.5 w-3.5" /> Загрузить кадры
            </button>
            <input ref={files} type="file" accept="image/*" multiple className="hidden" onChange={(e) => (upload(e.target.files), (e.target.value = ""))} />
          </div>
        </div>
      </div>
      {frames.length > 0 && <p className={`mt-2 text-xs ${ui.muted}`}>Новый кадр начинается с копии последнего — меняй немножко, и получится движение. Нажми на кадр, чтобы дорисовать его.</p>}
      {drawing !== null && (
        <PixelEditor
          look={drawing === "new" ? (frames[frames.length - 1] ?? fallback) : frames[drawing]}
          onClose={() => setDrawing(null)}
          onSave={(look) => {
            set(drawing === "new" ? [...frames, look] : frames.map((x, j) => (j === drawing ? look : x)));
            setDrawing(null);
          }}
        />
      )}
    </div>
  );
}

function AnimationsEditor({ kind, onChange }: { kind: ObjectKind; onChange: (k: ObjectKind) => void }) {
  const anims = kind.animations ?? [];
  const set = (a: Animation[]) => onChange({ ...kind, animations: a });
  const add = () => set([...anims, { name: anims.length ? `Анимация ${anims.length + 1}` : "Ожидание", frames: [], fps: 6, loop: true }]);
  if (!anims.length)
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-lg font-bold">Добавь свою первую анимацию</p>
        <p className={`max-w-md text-sm ${ui.muted}`}>Анимация — это последовательность картинок. Нарисуй несколько кадров, где персонаж чуть-чуть меняется, — и он оживёт.</p>
        <button type="button" onClick={add} className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold ${ui.accent}`}>
          <Plus className="h-4 w-4" /> Добавить анимацию
        </button>
      </div>
    );
  return (
    <div className="space-y-3">
      <p className={`text-sm ${ui.muted}`}>Первая анимация играет с начала игры. Переключать их можно в событиях: действие «Включить анимацию».</p>
      {anims.map((a, i) => (
        <AnimationCard key={i} anim={a} fallback={kind.look} onChange={(na) => set(anims.map((x, j) => (j === i ? na : x)))} onRemove={() => set(anims.filter((_, j) => j !== i))} />
      ))}
      <button type="button" onClick={add} className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold ${ui.accent}`}>
        <Plus className="h-4 w-4" /> Добавить анимацию
      </button>
    </div>
  );
}

export function ObjectDialog({ kind: initial, project, onApply, onClose }: { kind: ObjectKind; project: Project; onApply: (k: ObjectKind) => void; onClose: () => void }) {
  const [kind, setKind] = useState(initial);
  const t = kindType(kind);
  const tabs: [Tab, string][] = [["props", "Свойства"], ...(t === "sprite" ? ([["anim", `Анимации${kind.animations?.length ? ` (${kind.animations.length})` : ""}`]] as [Tab, string][]) : []), ...(t === "sprite" || t === "tiled" ? ([["behaviors", "Поведения"]] as [Tab, string][]) : [])];
  const [tab, setTab] = useState<Tab>("props");

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && !document.querySelector("[data-pixel-editor]") && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <div data-object-dialog className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-3 sm:p-6">
      <div className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-[#2e3039] bg-[#1f2028] text-[#e5e7eb] shadow-2xl">
        <div className="flex items-center gap-3 px-5 pb-3 pt-5">
          <KindPreview kind={kind} className="h-10 w-10 shrink-0 text-3xl" />
          <h2 className="min-w-0 flex-1 truncate text-2xl font-bold">Изменить {kind.name}</h2>
          <span className={`hidden rounded-md bg-[#2a2c36] px-2 py-1 text-xs sm:block ${ui.muted}`}>{KIND_TYPES[t].title}</span>
          <button type="button" onClick={onClose} aria-label="Закрыть" className="rounded p-1.5 text-[#9ca3af] hover:bg-[#2a2c36] hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex border-b border-[#2e3039] px-5">
          {tabs.map(([id, label]) => (
            <button key={id} type="button" onClick={() => setTab(id)} className={`flex-1 border-b-2 py-2.5 text-sm font-bold ${tab === id ? "border-[#c4b5fd] text-white" : `border-transparent ${ui.muted} hover:text-white`}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-[340px] flex-1 overflow-y-auto p-5">
          {tab === "props" && (
            <div className="space-y-5">
              <label className="block">
                <span className={`text-xs ${ui.muted}`}>Имя объекта</span>
                <input value={kind.name} onChange={(e) => setKind({ ...kind, name: e.target.value })} className={`${ui.input} mt-1 text-base font-semibold`} />
              </label>

              {t === "sprite" && (
                <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
                  <div>
                    <p className="mb-2 text-sm font-bold">Картинка</p>
                    {kind.animations?.some((a) => a.frames.length) && <p className={`mb-2 text-xs ${ui.muted}`}>У объекта есть анимации — в игре показываются их кадры. Эта картинка — запасная.</p>}
                    <LookPicker look={kind.look} onChange={(look) => setKind({ ...kind, look })} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex h-28 items-center justify-center rounded-lg bg-[#2a2c36]">
                      <LookView look={firstLook(kind)} className="h-20 w-20 text-6xl" />
                    </div>
                    <Field label="Ширина">
                      <Num value={kind.w} min={8} max={800} onChange={(w) => setKind({ ...kind, w })} />
                    </Field>
                    <Field label="Высота">
                      <Num value={kind.h} min={8} max={800} onChange={(h) => setKind({ ...kind, h })} />
                    </Field>
                    <button type="button" onClick={() => setTab("anim")} className={`w-full rounded-md py-2 text-sm font-bold ${ui.soft}`}>
                      🎞️ Анимации…
                    </button>
                  </div>
                </div>
              )}

              {t === "tiled" && (
                <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_240px]">
                  <div>
                    <p className="mb-2 text-sm font-bold">Рисунок одной плитки</p>
                    <LookPicker look={kind.look} onChange={(look) => setKind({ ...kind, look })} drawLabel="Нарисовать плитку" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-28 rounded-lg" style={{ background: tileBackground(kind.look, kind.w, kind.h) }} />
                    <Field label="Плитка: ширина">
                      <Num value={kind.w} min={4} max={400} onChange={(w) => setKind({ ...kind, w })} />
                    </Field>
                    <Field label="Плитка: высота">
                      <Num value={kind.h} min={4} max={400} onChange={(h) => setKind({ ...kind, h })} />
                    </Field>
                    <p className={`text-xs ${ui.muted}`}>Сам объект на сцене можно растянуть за уголок — плитки повторятся.</p>
                  </div>
                </div>
              )}

              {(t === "text" || t === "button") && (
                <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_260px]">
                  <div className="space-y-3">
                    <label className="block">
                      <span className="text-sm font-bold">{t === "text" ? "Текст" : "Надпись на кнопке"}</span>
                      <textarea
                        value={kind.text ?? ""}
                        onChange={(e) => setKind({ ...kind, text: e.target.value })}
                        rows={t === "text" ? 3 : 1}
                        className={`${ui.input} mt-1 resize-y text-base`}
                      />
                    </label>
                    <p className={`text-xs ${ui.muted}`}>
                      Чтобы показать переменную, напиши её имя в фигурных скобках: <code className="text-[#c4b5fd]">Очки: {"{Очки}"}</code>.
                      {t === "button" && " Что делает кнопка — задай в событиях: условие «Кликнули по объекту»."}
                    </p>
                    <Field label="Размер шрифта">
                      <Num value={kind.fontSize ?? 24} min={8} max={120} onChange={(fontSize) => setKind({ ...kind, fontSize })} />
                    </Field>
                    <Field label={t === "text" ? "Цвет текста" : "Цвет надписи"}>
                      <input type="color" value={kind.color ?? "#1e293b"} onChange={(e) => setKind({ ...kind, color: e.target.value })} className="h-8 w-14 cursor-pointer rounded border border-[#383b47] bg-transparent" />
                    </Field>
                    {t === "button" && (
                      <Field label="Цвет кнопки">
                        <input type="color" value={kind.bg ?? "#4d16c9"} onChange={(e) => setKind({ ...kind, bg: e.target.value })} className="h-8 w-14 cursor-pointer rounded border border-[#383b47] bg-transparent" />
                      </Field>
                    )}
                    <Field label="Ширина">
                      <Num value={kind.w} min={20} max={1200} onChange={(w) => setKind({ ...kind, w })} />
                    </Field>
                    <Field label="Высота">
                      <Num value={kind.h} min={16} max={600} onChange={(h) => setKind({ ...kind, h })} />
                    </Field>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={!!kind.fixed} onChange={(e) => setKind({ ...kind, fixed: e.target.checked })} className="h-4 w-4 accent-[#7046ec]" />
                      Закрепить на экране — не уезжает вместе с камерой
                    </label>
                  </div>
                  <div className="flex items-center justify-center rounded-lg bg-[#eef0f5] p-4">
                    {t === "text" ? (
                      <span className="whitespace-pre-wrap font-bold" style={{ fontSize: Math.min(40, kind.fontSize ?? 24), color: kind.color }}>
                        {kind.text || "Текст"}
                      </span>
                    ) : (
                      <span
                        className="flex items-center justify-center rounded-xl px-3 text-center font-bold"
                        style={{ width: Math.min(220, kind.w), height: Math.min(90, kind.h), background: kind.bg, color: kind.color, fontSize: Math.min(32, kind.fontSize ?? 22) }}
                      >
                        {kind.text || "Кнопка"}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "anim" && <AnimationsEditor kind={kind} onChange={setKind} />}
          {tab === "behaviors" && <BehaviorsEditor kind={kind} project={project} onChange={setKind} />}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#2e3039] px-5 py-3">
          <button type="button" onClick={onClose} className="rounded-md border border-[#4b4f5e] px-4 py-2 text-sm font-bold text-white hover:bg-[#2a2c36]">
            Отмена
          </button>
          <button
            type="button"
            onClick={() => onApply({ ...kind, animations: kind.animations?.map((a) => ({ ...a, name: a.name.trim() || "Анимация" })) })}
            className={`rounded-md px-5 py-2 text-sm font-bold ${ui.accent}`}
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
}
