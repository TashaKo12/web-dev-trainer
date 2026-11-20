import { useState } from "react";
import { KEY_LABEL, kindType, uid, type Action, type Condition, type GameEvent, type KeyName, type ObjectKind, type Project } from "./model";
import { ui } from "./ObjectPanel";

// A ready-made recipe for shooting, built only from ordinary events — so it can be read and changed:
//   Если нажата кнопка мыши → создать Снаряд у объекта Герой → двигать Снаряд к мышке со скоростью 500
//   Если Снаряд касается Врага → удалить Врага, удалить Снаряд (+1 к переменной)

const SHOTS: { look: string; name: string; w: number; h: number }[] = [
  { look: "🔥", name: "Огонёк", w: 22, h: 22 },
  { look: "⚡", name: "Молния", w: 22, h: 22 },
  { look: "#facc15", name: "Шарик", w: 12, h: 12 },
  { look: "#38bdf8", name: "Лазер", w: 14, h: 14 },
];
const NEW = "__new:";
const NONE = "";
const MOUSE = "mouse";

export function WeaponRecipe({ project, sceneId, onProject }: { project: Project; sceneId: string; onProject: (p: Project) => void }) {
  const sprites = project.objects.filter((o) => kindType(o) === "sprite");
  const hero0 = sprites.find((o) => o.behaviors.some((b) => b.kind === "platformer" || b.kind === "topdown")) ?? sprites[0];
  const enemy0 = sprites.find((o) => /враг|призрак|монстр/i.test(o.name) || o.behaviors.some((b) => b.kind === "patrol" || b.kind === "chase"));
  const [open, setOpen] = useState(false);
  const [hero, setHero] = useState(hero0?.id ?? "");
  const [shot, setShot] = useState(NEW + "0");
  const [trigger, setTrigger] = useState<string>(MOUSE);
  const [speed, setSpeed] = useState(500);
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
    const when: Condition = trigger === MOUSE ? { k: "mouse" } : { k: "key", key: trigger as KeyName };
    const events: GameEvent[] = [
      {
        id: uid(),
        conditions: [when],
        actions: [
          { k: "create", obj: shotId, at: hero, x: 0, y: 0 },
          { k: "launch", obj: shotId, to: MOUSE, speed },
        ],
      },
    ];
    if (enemy !== NONE) {
      const actions: Action[] = [{ k: "delete", obj: enemy }, { k: "delete", obj: shotId }];
      if (score !== NONE) actions.push({ k: "var", name: score, mode: "add", value: 1 });
      events.push({ id: uid(), conditions: [{ k: "collide", a: shotId, b: enemy }], actions });
    }
    onProject({ ...project, objects, scenes: project.scenes.map((s) => (s.id === sceneId ? { ...s, events: [...s.events, ...events] } : s)) });
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  }

  const pick = (value: string, onChange: (v: string) => void, extra: [string, string][]) => (
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
        <span className="text-xl">🎯</span>
        <span className="flex-1">
          <span className="block text-sm font-bold">Заготовка: выстрел к мышке</span>
          <span className={`block text-xs ${ui.muted}`}>Клик мышкой — у героя появляется снаряд и летит туда, где мышка. Снаряд попал во врага — враг исчезает.</span>
        </span>
        <span className={`text-xs font-bold ${ui.muted}`}>{open ? "Скрыть" : "Открыть"}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <label className="block text-sm">
              <span className={ui.muted}>Кто стреляет</span>
              {pick(hero, setHero, hero ? [] : [["", "— нет спрайтов —"]])}
            </label>
            <label className="block text-sm">
              <span className={ui.muted}>Снаряд</span>
              {pick(shot, setShot, SHOTS.map((s, i) => [NEW + i, `+ новый: ${s.name} ${s.look.startsWith("#") ? "●" : s.look}`] as [string, string]))}
            </label>
            <label className="block text-sm">
              <span className={ui.muted}>Когда</span>
              <select value={trigger} onChange={(e) => setTrigger(e.target.value)} className={`${ui.input} mt-1 font-semibold`}>
                <option value={MOUSE}>клик мышкой</option>
                {(Object.keys(KEY_LABEL) as KeyName[])
                  .filter((k) => !k.startsWith("Arrow"))
                  .map((k) => (
                    <option key={k} value={k}>
                      клавиша {KEY_LABEL[k]}
                    </option>
                  ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className={ui.muted}>Скорость</span>
              <input type="number" min={50} max={2000} value={speed} onChange={(e) => setSpeed(Math.max(50, Math.min(2000, Number(e.target.value) || 50)))} className={`${ui.input} mt-1`} />
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
          </div>
          <div className="rounded-md bg-[#1f2028] p-3 font-mono text-xs leading-6 text-[#d1d5db]">
            <p>
              <span className="text-[#7dd3fc]">Если</span> {trigger === MOUSE ? "нажата кнопка мыши" : `нажата клавиша ${KEY_LABEL[trigger as KeyName]}`}{" "}
              <span className="text-[#86efac]">→</span> создать снаряд у объекта «{sprites.find((o) => o.id === hero)?.name ?? "…"}», двигать снаряд к мышке со скоростью {speed}
            </p>
            {enemy !== NONE && (
              <p>
                <span className="text-[#7dd3fc]">Если</span> снаряд касается «{sprites.find((o) => o.id === enemy)?.name}» <span className="text-[#86efac]">→</span> удалить врага, удалить снаряд
                {score !== NONE ? `, +1 к «${score}»` : ""}
              </p>
            )}
          </div>
          <div>
            <button type="button" disabled={!ok} onClick={add} className={`rounded-md px-4 py-2 text-sm font-bold disabled:opacity-40 ${ui.accent}`}>
              {done ? "✓ События добавлены — они внизу списка" : "Добавить эти события"}
            </button>
            {!ok && <span className="ml-3 text-xs text-[#fbbf24]">Стрелок, снаряд и враг должны быть разными объектами</span>}
            <p className={`mt-2 text-xs ${ui.muted}`}>
              Это обычные события: «Создать объект у объекта…» и «Двигать объект к мышке». Их можно собрать и самому — и поменять: стрелять по клавише, лететь к врагу или
              вправо.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
