import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import {
  ACTION_INFO,
  CONDITION_INFO,
  KEY_LABEL,
  OPS,
  uid,
  type Action,
  type Condition,
  type GameEvent,
  type ObjectKind,
  type KeyName,
  type Op,
  type Project,
  type Scene,
  type Variable,
} from "./model";
import { LookView } from "./Player";

// Events of a scene: each row is «Если <все условия> → то <действия>», checked from top to bottom many times a second.

const field = "rounded-md border border-[#383b47] bg-[#2a2c36] px-2 py-1 text-sm text-[#e5e7eb] outline-none focus:border-[#7046ec]";
const panel = "rounded-lg border border-[#2e3039] bg-[#1f2028] p-3 text-[#e5e7eb]";

function Obj({ project, value, onChange, only }: { project: Project; value: string; onChange: (v: string) => void; only?: (o: ObjectKind) => boolean }) {
  const list = only ? project.objects.filter(only) : project.objects;
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`${field} font-semibold`}>
      {!list.some((o) => o.id === value) && <option value={value}>— выбери —</option>}
      {list.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
  );
}

function VarPick({ project, value, onChange }: { project: Project; value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`${field} font-semibold`}>
      {!project.variables.some((v) => v.name === value) && <option value={value}>{value || "— выбери —"}</option>}
      {project.variables.map((v) => (
        <option key={v.name} value={v.name}>
          {v.name}
        </option>
      ))}
    </select>
  );
}

function OpPick({ value, onChange }: { value: Op; onChange: (v: Op) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as Op)} className={field}>
      {OPS.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

const NumIn = ({ value, onChange, w = "w-20" }: { value: number; onChange: (v: number) => void; w?: string }) => (
  <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} className={`${field} ${w}`} />
);

function ConditionRow({ c, project, onChange }: { c: Condition; project: Project; onChange: (c: Condition) => void }) {
  switch (c.k) {
    case "start":
      return <span>в начале сцены</span>;
    case "key":
      return (
        <>
          нажата клавиша
          <select value={c.key} onChange={(e) => onChange({ ...c, key: e.target.value as KeyName })} className={`${field} font-semibold`}>
            {(Object.keys(KEY_LABEL) as KeyName[]).map((k) => (
              <option key={k} value={k}>
                {KEY_LABEL[k]}
              </option>
            ))}
          </select>
        </>
      );
    case "collide":
      return (
        <>
          <Obj project={project} value={c.a} onChange={(a) => onChange({ ...c, a })} /> касается <Obj project={project} value={c.b} onChange={(b) => onChange({ ...c, b })} />
        </>
      );
    case "click":
      return (
        <>
          кликнули по <Obj project={project} value={c.obj} onChange={(obj) => onChange({ ...c, obj })} />
        </>
      );
    case "count":
      return (
        <>
          число объектов <Obj project={project} value={c.obj} onChange={(obj) => onChange({ ...c, obj })} /> <OpPick value={c.op} onChange={(op) => onChange({ ...c, op })} />
          <NumIn value={c.value} onChange={(value) => onChange({ ...c, value })} />
        </>
      );
    case "var":
      return (
        <>
          переменная <VarPick project={project} value={c.name} onChange={(name) => onChange({ ...c, name })} /> <OpPick value={c.op} onChange={(op) => onChange({ ...c, op })} />
          <NumIn value={c.value} onChange={(value) => onChange({ ...c, value })} />
        </>
      );
    case "timer":
      return (
        <>
          каждые <NumIn value={c.seconds} w="w-16" onChange={(seconds) => onChange({ ...c, seconds: Math.max(0.1, seconds) })} /> сек.
        </>
      );
    case "outside":
      return (
        <>
          <Obj project={project} value={c.obj} onChange={(obj) => onChange({ ...c, obj })} /> ушёл за край экрана
        </>
      );
    case "pos":
      return (
        <>
          у <Obj project={project} value={c.obj} onChange={(obj) => onChange({ ...c, obj })} /> координата
          <select value={c.axis} onChange={(e) => onChange({ ...c, axis: e.target.value as "x" | "y" })} className={`${field} font-semibold`}>
            <option value="x">X (вправо)</option>
            <option value="y">Y (вниз)</option>
          </select>
          <OpPick value={c.op} onChange={(op) => onChange({ ...c, op })} />
          <NumIn value={c.value} onChange={(value) => onChange({ ...c, value })} />
        </>
      );
  }
}

function ActionRow({ a, project, onChange }: { a: Action; project: Project; onChange: (a: Action) => void }) {
  switch (a.k) {
    case "delete":
      return (
        <>
          удалить <Obj project={project} value={a.obj} onChange={(obj) => onChange({ ...a, obj })} />
        </>
      );
    case "create":
      return (
        <>
          создать <Obj project={project} value={a.obj} onChange={(obj) => onChange({ ...a, obj })} /> в точке x <NumIn value={a.x} w="w-16" onChange={(x) => onChange({ ...a, x })} /> y{" "}
          <NumIn value={a.y} w="w-16" onChange={(y) => onChange({ ...a, y })} />
        </>
      );
    case "teleport":
      return (
        <>
          переместить <Obj project={project} value={a.obj} onChange={(obj) => onChange({ ...a, obj })} /> в x <NumIn value={a.x} w="w-16" onChange={(x) => onChange({ ...a, x })} /> y{" "}
          <NumIn value={a.y} w="w-16" onChange={(y) => onChange({ ...a, y })} />
        </>
      );
    case "var":
      return (
        <>
          <select value={a.mode} onChange={(e) => onChange({ ...a, mode: e.target.value as "set" | "add" | "sub" })} className={field}>
            <option value="add">прибавить к</option>
            <option value="sub">отнять от</option>
            <option value="set">сделать равной</option>
          </select>
          <VarPick project={project} value={a.name} onChange={(name) => onChange({ ...a, name })} />
          {a.mode === "set" ? "число" : ""}
          <NumIn value={a.value} onChange={(value) => onChange({ ...a, value })} />
        </>
      );
    case "text":
      return (
        <>
          показать надпись <input value={a.text} onChange={(e) => onChange({ ...a, text: e.target.value })} className={`${field} min-w-[12rem] flex-1`} />
        </>
      );
    case "stop":
      return (
        <>
          конец игры: <input value={a.text} onChange={(e) => onChange({ ...a, text: e.target.value })} className={`${field} min-w-[10rem] flex-1`} />
        </>
      );
    case "scene":
      return (
        <>
          перейти на сцену
          <select value={a.scene} onChange={(e) => onChange({ ...a, scene: e.target.value })} className={`${field} font-semibold`}>
            {project.scenes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </>
      );
    case "restartScene":
      return <span>начать сцену заново</span>;
    case "restartGame":
      return <span>начать всю игру заново</span>;
    case "settext": {
      const isText = (o: ObjectKind) => o.type === "text" || o.type === "button";
      return (
        <>
          написать на <Obj project={project} value={a.obj} only={isText} onChange={(obj) => onChange({ ...a, obj })} />
          <input value={a.text} onChange={(e) => onChange({ ...a, text: e.target.value })} placeholder="Очки: {Очки}" className={`${field} min-w-[10rem] flex-1`} />
        </>
      );
    }
    case "anim": {
      const o = project.objects.find((x) => x.id === a.obj);
      const names = (o?.animations ?? []).map((x) => x.name);
      return (
        <>
          🎞️ у <Obj project={project} value={a.obj} only={(x) => !!x.animations?.length} onChange={(obj) => onChange({ ...a, obj, name: project.objects.find((x) => x.id === obj)?.animations?.[0]?.name ?? "" })} /> включить анимацию
          {names.length ? (
            <select value={a.name} onChange={(e) => onChange({ ...a, name: e.target.value })} className={`${field} font-semibold`}>
              {!names.includes(a.name) && <option value={a.name}>— выбери —</option>}
              {names.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-[#fbbf24]">у объекта пока нет анимаций — добавь их в окне объекта</span>
          )}
        </>
      );
    }
    case "checkpoint":
      return (
        <>
          🚩 запомнить точку возврата для <Obj project={project} value={a.obj} onChange={(obj) => onChange({ ...a, obj })} /> там, где
          <select value={a.at} onChange={(e) => onChange({ ...a, at: e.target.value })} className={`${field} font-semibold`}>
            <option value="">он стоит сейчас</option>
            {project.objects
              .filter((o) => o.id !== a.obj)
              .map((o) => (
                <option key={o.id} value={o.id}>
                  стоит {o.name}
                </option>
              ))}
          </select>
          и сказать <input value={a.say} onChange={(e) => onChange({ ...a, say: e.target.value })} placeholder="можно оставить пустым" className={`${field} min-w-[9rem] flex-1`} />
        </>
      );
    case "respawn":
      return (
        <>
          ↩️ вернуть <Obj project={project} value={a.obj} onChange={(obj) => onChange({ ...a, obj })} /> на последний чекпоинт
          <span className="text-xs text-[#9ca3af]">(если чекпоинта нет — туда, где он стоял в начале)</span>
        </>
      );
    case "camera":
      return (
        <>
          🎥 камера следит за <Obj project={project} value={a.obj} onChange={(obj) => onChange({ ...a, obj })} />
          <label className="inline-flex items-center gap-1.5 text-[#d1d5db]">
            <input type="checkbox" checked={a.smooth} onChange={(e) => onChange({ ...a, smooth: e.target.checked })} className="h-4 w-4 accent-[#7046ec]" />
            плавно
          </label>
        </>
      );
  }
}

function Row({ children, onRemove, tone }: { children: ReactNode; onRemove: () => void; tone: "if" | "then" }) {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-[#e5e7eb] ${tone === "if" ? "bg-[#1b2a3d]" : "bg-[#2a2140]"}`}>
      {children}
      <button type="button" onClick={onRemove} aria-label="Убрать" className="ml-auto text-[#9ca3af] hover:text-[#fb7185]">
        <X className="h-4 w-4" strokeWidth={2.4} />
      </button>
    </div>
  );
}

export function EventsEditor({ project, scene, onChange }: { project: Project; scene: Scene; onChange: (s: Scene) => void }) {
  const setEvent = (id: string, ev: GameEvent) => onChange({ ...scene, events: scene.events.map((e) => (e.id === id ? ev : e)) });
  const move = (i: number, d: -1 | 1) => {
    const ev = [...scene.events];
    const j = i + d;
    if (j < 0 || j >= ev.length) return;
    [ev[i], ev[j]] = [ev[j], ev[i]];
    onChange({ ...scene, events: ev });
  };

  return (
    <div className="space-y-3">
      {scene.events.map((ev, i) => (
        <div key={ev.id} className={panel}>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#7046ec] text-xs font-bold text-white">{i + 1}</span>
            <span className="text-sm font-bold">Событие</span>
            <div className="ml-auto flex gap-1 text-[#9ca3af]">
              <button type="button" onClick={() => move(i, -1)} aria-label="Выше" className="rounded p-1 hover:bg-[#2a2c36] hover:text-white">
                <ArrowUp className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => move(i, 1)} aria-label="Ниже" className="rounded p-1 hover:bg-[#2a2c36] hover:text-white">
                <ArrowDown className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => onChange({ ...scene, events: scene.events.filter((e) => e.id !== ev.id) })} aria-label="Удалить событие" className="rounded p-1 hover:bg-[#2a2c36] hover:text-[#fb7185]">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wide text-[#7dd3fc]">Если {ev.conditions.length > 1 && <span className="normal-case text-[#9ca3af]">(все условия сразу)</span>}</p>
              {ev.conditions.map((c, j) => (
                <Row key={j} tone="if" onRemove={() => setEvent(ev.id, { ...ev, conditions: ev.conditions.filter((_, x) => x !== j) })}>
                  <ConditionRow c={c} project={project} onChange={(nc) => setEvent(ev.id, { ...ev, conditions: ev.conditions.map((x, k) => (k === j ? nc : x)) })} />
                </Row>
              ))}
              {!ev.conditions.length && <p className="text-xs text-[#9ca3af]">Без условий — действия выполняются всё время.</p>}
              <AddSelect
                label="+ условие"
                options={Object.entries(CONDITION_INFO).map(([k, v]) => [k, v.title])}
                onPick={(k) => setEvent(ev.id, { ...ev, conditions: [...ev.conditions, CONDITION_INFO[k as Condition["k"]].make(project)] })}
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wide text-[#c4b5fd]">То</p>
              {ev.actions.map((a, j) => (
                <Row key={j} tone="then" onRemove={() => setEvent(ev.id, { ...ev, actions: ev.actions.filter((_, x) => x !== j) })}>
                  <ActionRow a={a} project={project} onChange={(na) => setEvent(ev.id, { ...ev, actions: ev.actions.map((x, k) => (k === j ? na : x)) })} />
                </Row>
              ))}
              {!ev.actions.length && <p className="text-xs text-[#9ca3af]">Добавь, что должно произойти.</p>}
              <AddSelect
                label="+ действие"
                options={Object.entries(ACTION_INFO).map(([k, v]) => [k, v.title])}
                onPick={(k) => setEvent(ev.id, { ...ev, actions: [...ev.actions, ACTION_INFO[k as Action["k"]].make(project)] })}
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...scene, events: [...scene.events, { id: uid(), conditions: [], actions: [] }] })}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#5b4b9a] py-3 text-sm font-semibold text-[#c4b5fd] hover:bg-[#2a2140]"
      >
        <Plus className="h-4 w-4" strokeWidth={2.6} /> Новое событие
      </button>
    </div>
  );
}

function AddSelect({ label, options, onPick }: { label: string; options: [string, string][]; onPick: (k: string) => void }) {
  return (
    <select value="" onChange={(e) => e.target.value && onPick(e.target.value)} className={`${field} w-full font-semibold text-[#c4b5fd]`}>
      <option value="">{label}</option>
      {options.map(([k, t]) => (
        <option key={k} value={k}>
          {t}
        </option>
      ))}
    </select>
  );
}

export function VariablesPanel({ project, onChange }: { project: Project; onChange: (vars: Variable[]) => void }) {
  const vars = project.variables;
  return (
    <div className={panel}>
      <p className="mb-1 text-sm font-bold text-slate-700">Переменные</p>
      <p className="mb-3 text-xs text-slate-500">Числа, которые игра помнит: очки, жизни, ключи. Видны в углу во время игры.</p>
      <div className="space-y-1.5">
        {vars.map((v, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input value={v.name} onChange={(e) => onChange(vars.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} className={`${field} min-w-0 flex-1 font-semibold`} aria-label="Имя переменной" />
            <span className="text-xs text-slate-400">=</span>
            <NumIn value={v.value} w="w-16" onChange={(value) => onChange(vars.map((x, j) => (j === i ? { ...x, value } : x)))} />
            <button type="button" onClick={() => onChange(vars.filter((_, j) => j !== i))} aria-label="Удалить переменную" className="text-slate-400 hover:text-rose-500">
              <X className="h-4 w-4" strokeWidth={2.4} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...vars, { name: `Переменная${vars.length + 1}`, value: 0 }])}
        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#4d16c9] hover:underline"
      >
        <Plus className="h-4 w-4" strokeWidth={2.6} /> Переменная
      </button>
      <p className="mt-3 rounded-lg bg-[#eef0f5] p-2 text-xs text-slate-500 dark:bg-slate-800">
        В надписи можно показать значение: <code className="font-mono text-[#4d16c9]">Очки: {"{Очки}"}</code>
      </p>
    </div>
  );
}

/** A small list of the objects in this scene, as a reminder while writing events. */
export function ObjectsHint({ project }: { project: Project }) {
  return (
    <div className={panel}>
      <p className="mb-2 text-sm font-bold text-slate-700">Объекты игры</p>
      <div className="flex flex-wrap gap-2">
        {project.objects.map((o) => (
          <span key={o.id} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600">
            <LookView look={o.look} className="h-5 w-5 text-base" />
            {o.name}
          </span>
        ))}
      </div>
    </div>
  );
}
