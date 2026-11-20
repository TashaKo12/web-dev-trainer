import { useState } from "react";
import { kindType, uid, type GameEvent, type ObjectKind, type Project } from "./model";
import { ui } from "./ObjectPanel";

// A ready-made recipe for checkpoints: the hero touches a checkpoint — the place is saved;
// then something dangerous (an enemy or falling down) sends the hero back to the last checkpoint, not to the very start.

const NEW = "__new";
const FALL = "__fall";

export function CheckpointRecipe({ project, sceneId, onProject }: { project: Project; sceneId: string; onProject: (p: Project) => void }) {
  const sprites = project.objects.filter((o) => kindType(o) === "sprite");
  const hero0 = sprites.find((o) => o.behaviors.some((b) => b.kind === "platformer" || b.kind === "topdown")) ?? sprites[0];
  const flag0 = sprites.find((o) => /чекпоинт|флажок|🚩/i.test(o.name + o.look));
  const enemy0 = sprites.find((o) => /враг|призрак|монстр/i.test(o.name) || o.behaviors.some((b) => b.kind === "patrol" || b.kind === "chase"));
  const platformer = !!hero0?.behaviors.some((b) => b.kind === "platformer");
  const [hero, setHero] = useState(hero0?.id ?? "");
  const [flag, setFlag] = useState(flag0?.id ?? NEW);
  const [danger, setDanger] = useState(platformer || !enemy0 ? FALL : enemy0.id);
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const ok = !!hero && flag !== hero && danger !== hero;

  function add() {
    const scene = project.scenes.find((s) => s.id === sceneId);
    if (!scene || !ok) return;
    let objects = project.objects;
    let instances = scene.instances;
    let flagId = flag;
    if (flag === NEW) {
      // a new red flag, put in the middle of the screen frame — drag it where the checkpoint should be
      const k: ObjectKind = { id: uid(), name: "Чекпоинт", look: "🚩", w: 36, h: 40, behaviors: [] };
      objects = [...objects, k];
      instances = [...instances, { id: uid(), kind: k.id, x: Math.round(scene.w / 2 - 18), y: Math.round(scene.h / 2 - 20) }];
      flagId = k.id;
    }
    // «falls down»: lower than everything on the scene plus a margin
    const bottom = Math.max(scene.h, ...scene.instances.map((i) => i.y + 60)) + 200;
    const events: GameEvent[] = [
      { id: uid(), conditions: [{ k: "collide", a: hero, b: flagId }], actions: [{ k: "checkpoint", obj: hero, at: flagId, say: "🚩 Чекпоинт!" }] },
      danger === FALL
        ? { id: uid(), conditions: [{ k: "pos", obj: hero, axis: "y", op: ">", value: Math.round(bottom) }], actions: [{ k: "respawn", obj: hero }] }
        : { id: uid(), conditions: [{ k: "collide", a: hero, b: danger }], actions: [{ k: "respawn", obj: hero }] },
    ];
    onProject({ ...project, objects, scenes: project.scenes.map((s) => (s.id === sceneId ? { ...s, instances, events: [...s.events, ...events] } : s)) });
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  }

  const select = (value: string, onChange: (v: string) => void, extra: [string, string][]) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`${ui.input} mt-1 font-semibold`}>
      {extra.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
      {sprites.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
  );

  return (
    <div className="mb-4 rounded-lg border border-[#383b47] bg-[#262832] p-3 text-[#e5e7eb]">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2 text-left">
        <span className="text-xl">🚩</span>
        <span className="flex-1">
          <span className="block text-sm font-bold">Заготовка: чекпоинты</span>
          <span className={`block text-xs ${ui.muted}`}>Коснулся флажка — место запомнилось. Упал или задел врага — вернулся к флажку, а не в самое начало.</span>
        </span>
        <span className={`text-xs font-bold ${ui.muted}`}>{open ? "Скрыть" : "Открыть"}</span>
      </button>
      {open && (
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className="block text-sm">
            <span className={ui.muted}>Кто возвращается</span>
            {select(hero, setHero, hero ? [] : [["", "— нет спрайтов —"]])}
          </label>
          <label className="block text-sm">
            <span className={ui.muted}>Чекпоинт</span>
            {select(flag, setFlag, [[NEW, "+ новый флажок 🚩"]])}
          </label>
          <label className="block text-sm">
            <span className={ui.muted}>Когда вернуть</span>
            {select(danger, setDanger, [[FALL, "упал вниз за уровень"]])}
          </label>
          <div className="sm:col-span-3">
            <button type="button" disabled={!ok} onClick={add} className={`rounded-md px-4 py-2 text-sm font-bold disabled:opacity-40 ${ui.accent}`}>
              {done ? "✓ Добавлены 2 события" + (flag === NEW ? " и флажок на сцене" : "") : "Добавить чекпоинты"}
            </button>
            {!ok && <span className="ml-3 text-xs text-[#fbbf24]">Герой, чекпоинт и опасность должны быть разными объектами</span>}
            <p className={`mt-2 text-xs ${ui.muted}`}>
              Флажков-чекпоинтов можно поставить на сцену сколько угодно: герой возвращается к последнему, которого коснулся. Действия «Сохранить чекпоинт» и «Вернуть на
              чекпоинт» есть и в обычном списке действий.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
