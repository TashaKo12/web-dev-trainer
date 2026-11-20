import { useState } from "react";
import { KEY_LABEL, kindType, uid, type Action, type GameEvent, type KeyName, type ObjectKind, type Project } from "./model";
import { ui } from "./ObjectPanel";

// A ready-made recipe for a weapon: the hero gets the behavior «Оружие» (a key shoots), a shot object is made if needed,
// and an event makes shots beat the enemies: the shot touches an enemy — both disappear (and a variable can grow).

const SHOTS: { look: string; name: string; w: number; h: number }[] = [
  { look: "🔥", name: "Огонёк", w: 22, h: 22 },
  { look: "⚡", name: "Молния", w: 22, h: 22 },
  { look: "#facc15", name: "Шарик", w: 12, h: 12 },
  { look: "#38bdf8", name: "Лазер", w: 26, h: 6 },
];
const NEW = "__new:";
const NONE = "";

export function WeaponRecipe({ project, sceneId, onProject }: { project: Project; sceneId: string; onProject: (p: Project) => void }) {
  const sprites = project.objects.filter((o) => kindType(o) === "sprite");
  const hero0 = sprites.find((o) => o.behaviors.some((b) => b.kind === "platformer" || b.kind === "topdown")) ?? sprites[0];
  const enemy0 = sprites.find((o) => /враг|призрак|монстр/i.test(o.name) || o.behaviors.some((b) => b.kind === "patrol" || b.kind === "chase"));
  const platformer = !!hero0?.behaviors.some((b) => b.kind === "platformer");
  const [open, setOpen] = useState(false);
  const [hero, setHero] = useState(hero0?.id ?? "");
  const [shot, setShot] = useState(NEW + "0");
  // in a platformer Space already jumps, so the shot is on X
  const [key, setKey] = useState<KeyName>(platformer ? "KeyX" : "Space");
  const [enemy, setEnemy] = useState(enemy0?.id ?? NONE);
  const [score, setScore] = useState(project.variables[0]?.name ?? NONE);
  const [done, setDone] = useState(false);
  const ok = !!hero && shot !== hero && enemy !== hero && (enemy === NONE || enemy !== shot);

  function add() {
    if (!ok) return;
    let objects = project.objects;
    let shotId = shot;
    if (shot.startsWith(NEW)) {
      const s = SHOTS[Number(shot.slice(NEW.length))];
      const k: ObjectKind = { id: uid(), name: s.name, look: s.look, w: s.w, h: s.h, behaviors: [] };
      objects = [...objects, k];
      shotId = k.id;
    }
    objects = objects.map((o) =>
      o.id === hero ? { ...o, behaviors: [...o.behaviors.filter((b) => b.kind !== "weapon"), { kind: "weapon", bullet: shotId, key, speed: 520, rate: 4 }] } : o,
    );
    const events: GameEvent[] = [];
    if (enemy !== NONE) {
      const actions: Action[] = [{ k: "delete", obj: enemy }, { k: "delete", obj: shotId }];
      if (score !== NONE) actions.push({ k: "var", name: score, mode: "add", value: 1 });
      events.push({ id: uid(), conditions: [{ k: "collide", a: shotId, b: enemy }], actions });
    }
    onProject({ ...project, objects, scenes: project.scenes.map((s) => (s.id === sceneId ? { ...s, events: [...s.events, ...events] } : s)) });
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  }

  const pick = (value: string, onChange: (v: string) => void, extra: [string, string][], list = sprites) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`${ui.input} mt-1 font-semibold`}>
      {extra.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
      {list.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
  );

  return (
    <div className="mb-4 rounded-lg border border-[#383b47] bg-[#262832] p-3 text-[#e5e7eb]">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2 text-left">
        <span className="text-xl">🔫</span>
        <span className="flex-1">
          <span className="block text-sm font-bold">Заготовка: оружие</span>
          <span className={`block text-xs ${ui.muted}`}>Персонаж стреляет по клавише туда, куда смотрит. Снаряд попал во врага — враг исчезает.</span>
        </span>
        <span className={`text-xs font-bold ${ui.muted}`}>{open ? "Скрыть" : "Открыть"}</span>
      </button>
      {open && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="block text-sm">
            <span className={ui.muted}>Кто стреляет</span>
            {pick(hero, setHero, hero ? [] : [["", "— нет спрайтов —"]])}
          </label>
          <label className="block text-sm">
            <span className={ui.muted}>Чем</span>
            {pick(shot, setShot, SHOTS.map((s, i) => [NEW + i, `+ новый: ${s.name} ${s.look.startsWith("#") ? "●" : s.look}`] as [string, string]))}
          </label>
          <label className="block text-sm">
            <span className={ui.muted}>Клавиша</span>
            <select value={key} onChange={(e) => setKey(e.target.value as KeyName)} className={`${ui.input} mt-1 font-semibold`}>
              {(Object.keys(KEY_LABEL) as KeyName[])
                .filter((k) => !k.startsWith("Arrow"))
                .map((k) => (
                  <option key={k} value={k}>
                    {KEY_LABEL[k]}
                  </option>
                ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className={ui.muted}>По кому</span>
            {pick(enemy, setEnemy, [[NONE, "— пока ни по кому —"]])}
          </label>
          <label className="block text-sm">
            <span className={ui.muted}>За попадание</span>
            <select value={score} onChange={(e) => setScore(e.target.value)} className={`${ui.input} mt-1 font-semibold`}>
              <option value={NONE}>ничего не прибавлять</option>
              {project.variables.map((v) => (
                <option key={v.name} value={v.name}>
                  +1 к «{v.name}»
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2 lg:col-span-5">
            <button type="button" disabled={!ok} onClick={add} className={`rounded-md px-4 py-2 text-sm font-bold disabled:opacity-40 ${ui.accent}`}>
              {done ? `✓ Оружие добавлено: клавиша ${KEY_LABEL[key]}` : "Дать оружие"}
            </button>
            {!ok && <span className="ml-3 text-xs text-[#fbbf24]">Стрелок, снаряд и враг должны быть разными объектами</span>}
            <p className={`mt-2 text-xs ${ui.muted}`}>
              У персонажа появится поведение «Оружие» — в окне объекта можно поменять снаряд, клавишу, скорость и сколько выстрелов в секунду. Чтобы стрелял враг, есть
              действие «Выстрелить», например в событии «каждые 2 сек.».
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
