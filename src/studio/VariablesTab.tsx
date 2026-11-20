import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { kindType, makeKind, uid, type Action, type Condition, type GameEvent, type Instance, type ObjectKind, type Project } from "./model";
import { KindPreview, ui } from "./ObjectPanel";

// The «Переменные» tab: the numbers the game remembers (coins, lives, time). Each has a name and a starting value;
// events change it while the game runs, and a text object shows it: «Монеты: {Монеты}».
// Ready-made recipes add a variable together with its text and events in one click.

const braces = (name: string) => new RegExp(`\\{\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\}`, "g");

/** Where a variable is used: events that check or change it, and texts that show it. */
function usage(p: Project, name: string) {
  const shows = (t?: string) => !!t && braces(name).test(t);
  let events = 0;
  let texts = 0;
  for (const s of p.scenes)
    for (const e of s.events) {
      const inCond = e.conditions.some((c) => c.k === "var" && c.name === name);
      const inAct = e.actions.some((a) => (a.k === "var" && a.name === name) || ((a.k === "text" || a.k === "stop" || a.k === "settext") && shows(a.text)));
      if (inCond || inAct) events++;
    }
  for (const o of p.objects) if (shows(o.text)) texts++;
  return { events, texts };
}

/** Renames a variable everywhere: in events and in every {name} shown on the screen. */
function rename(p: Project, from: string, to: string): Project {
  const fix = (t: string) => t.replace(braces(from), `{${to}}`);
  const cond = (c: Condition): Condition => (c.k === "var" && c.name === from ? { ...c, name: to } : c);
  const act = (a: Action): Action =>
    a.k === "var" && a.name === from ? { ...a, name: to } : a.k === "text" || a.k === "stop" || a.k === "settext" ? { ...a, text: fix(a.text) } : a;
  return {
    ...p,
    variables: p.variables.map((v) => (v.name === from ? { ...v, name: to } : v)),
    objects: p.objects.map((o) => (o.text ? { ...o, text: fix(o.text) } : o)),
    scenes: p.scenes.map((s) => ({ ...s, events: s.events.map((e) => ({ ...e, conditions: e.conditions.map(cond), actions: e.actions.map(act) })) })),
  };
}

const freeName = (p: Project, base: string) => {
  let name = base;
  for (let i = 2; p.variables.some((v) => v.name === name); i++) name = `${base}${i}`;
  return name;
};

function NameField({ project, name, onRename }: { project: Project; name: string; onRename: (to: string) => void }) {
  const [draft, setDraft] = useState(name);
  const clean = draft.trim();
  const taken = clean !== name && project.variables.some((v) => v.name === clean);
  const bad = !clean || /[{}]/.test(clean) || taken;
  const commit = () => (bad ? setDraft(name) : clean !== name && onRename(clean));
  return (
    <div className="min-w-0 flex-1">
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
        aria-label="Имя переменной"
        className={`${ui.input} font-bold ${bad ? "border-[#fb7185]" : ""}`}
      />
      {bad && <p className="mt-1 text-xs text-[#fb7185]">{taken ? "Такая переменная уже есть" : "Нужно имя без фигурных скобок"}</p>}
    </div>
  );
}

type Recipe = {
  id: string;
  icon: string;
  title: string;
  about: string;
  /** which objects the recipe asks for: [label, preferred name pattern] */
  needs: [string, RegExp][];
  build: (p: Project, sceneId: string, picks: string[]) => Project;
};

/** Adds a variable, a text that shows it (fixed in the corner of the screen) and events to the current scene. */
function addCounter(p: Project, sceneId: string, base: string, value: number, label: (n: string) => string, events: (name: string) => GameEvent[]): Project {
  const name = freeName(p, base);
  const text: ObjectKind = { ...makeKind("text", p.objects.filter((o) => kindType(o) === "text").length + 1), name: `Текст ${name}`, text: label(name) };
  const scene = p.scenes.find((s) => s.id === sceneId)!;
  const fixedTexts = scene.instances.filter((i) => p.objects.find((o) => o.id === i.kind)?.fixed).length;
  const top = Math.max(0, ...scene.instances.map((i) => i.z ?? 0)) + 1;
  const inst: Instance = { id: uid(), kind: text.id, x: 16, y: 12 + fixedTexts * 40, z: top };
  return {
    ...p,
    variables: [...p.variables, { name, value }],
    objects: [...p.objects, text],
    scenes: p.scenes.map((s) => (s.id === sceneId ? { ...s, instances: [...s.instances, inst], events: [...s.events, ...events(name)] } : s)),
  };
}

const RECIPES: Recipe[] = [
  {
    id: "coins",
    icon: "🪙",
    title: "Счётчик монет",
    about: "Герой касается монеты — монета исчезает, а счётчик растёт на 1.",
    needs: [["Кто собирает", /кот|лис|герой|игрок|персонаж/i], ["Что собирает", /монет|звезд|звёзд|кристал|coin/i]],
    build: (p, sid, [hero, coin]) =>
      addCounter(p, sid, "Монеты", 0, (n) => `🪙 ${n}: {${n}}`, (n) => [
        { id: uid(), conditions: [{ k: "collide", a: hero, b: coin }], actions: [{ k: "delete", obj: coin }, { k: "var", name: n, mode: "add", value: 1 }] },
      ]),
  },
  {
    id: "lives",
    icon: "❤️",
    title: "Жизни",
    about: "Враг задел героя — минус одна жизнь, герой возвращается на старт. Жизни кончились — конец игры.",
    needs: [["Герой", /кот|лис|герой|игрок|персонаж/i], ["Враг", /враг|призрак|монстр|enemy/i]],
    build: (p, sid, [hero, enemy]) => {
      const start = p.scenes.find((s) => s.id === sid)?.instances.find((i) => i.kind === hero) ?? { x: 40, y: 40 };
      return addCounter(p, sid, "Жизни", 3, (n) => `❤️ ${n}: {${n}}`, (n) => [
        {
          id: uid(),
          conditions: [{ k: "collide", a: hero, b: enemy }],
          actions: [{ k: "var", name: n, mode: "sub", value: 1 }, { k: "teleport", obj: hero, x: start.x, y: start.y }],
        },
        { id: uid(), conditions: [{ k: "var", name: n, op: "≤", value: 0 }], actions: [{ k: "stop", text: "Жизни закончились! Попробуй ещё раз" }] },
      ]);
    },
  },
  {
    id: "time",
    icon: "⏱️",
    title: "Секундомер",
    about: "Каждую секунду переменная растёт на 1 — видно, сколько длится игра.",
    needs: [],
    build: (p, sid) =>
      addCounter(p, sid, "Время", 0, (n) => `⏱️ ${n}: {${n}}`, (n) => [{ id: uid(), conditions: [{ k: "timer", seconds: 1 }], actions: [{ k: "var", name: n, mode: "add", value: 1 }] }]),
  },
];

function RecipeCard({ recipe, project, sceneId, onProject }: { recipe: Recipe; project: Project; sceneId: string; onProject: (p: Project) => void }) {
  const sprites = project.objects.filter((o) => kindType(o) === "sprite");
  const guess = (re: RegExp, skip: string[]) => (sprites.find((o) => re.test(o.name) && !skip.includes(o.id)) ?? sprites.find((o) => !skip.includes(o.id)))?.id ?? "";
  const [picks, setPicks] = useState<string[]>(() => recipe.needs.reduce<string[]>((acc, [, re]) => [...acc, guess(re, acc)], []));
  const [done, setDone] = useState(false);
  const ready = picks.every(Boolean) && new Set(picks).size === picks.length;
  return (
    <div className="flex flex-col rounded-lg border border-[#383b47] bg-[#262832] p-4">
      <p className="text-base font-bold">
        {recipe.icon} {recipe.title}
      </p>
      <p className={`mt-1 text-sm ${ui.muted}`}>{recipe.about}</p>
      {recipe.needs.map(([label], i) => (
        <label key={label} className="mt-3 block text-sm">
          <span className={ui.muted}>{label}</span>
          <select value={picks[i]} onChange={(e) => setPicks(picks.map((x, j) => (j === i ? e.target.value : x)))} className={`${ui.input} mt-1 font-semibold`}>
            {!picks[i] && <option value="">— нет спрайтов —</option>}
            {sprites.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
      ))}
      <div className="mt-auto pt-4">
        <button
          type="button"
          disabled={!ready}
          onClick={() => {
            onProject(recipe.build(project, sceneId, picks));
            setDone(true);
            setTimeout(() => setDone(false), 2500);
          }}
          className={`w-full rounded-md py-2 text-sm font-bold disabled:opacity-40 ${ui.accent}`}
        >
          {done ? "✓ Добавлено: переменная, надпись и события" : "Добавить в игру"}
        </button>
        {!ready && recipe.needs.length > 0 && <p className="mt-1 text-xs text-[#fbbf24]">Выбери два разных объекта</p>}
      </div>
    </div>
  );
}

export function VariablesTab({ project, sceneId, onProject }: { project: Project; sceneId: string; onProject: (p: Project) => void }) {
  const vars = project.variables;
  const set = (i: number, value: number) => onProject({ ...project, variables: vars.map((x, j) => (j === i ? { ...x, value } : x)) });
  const remove = (name: string) => {
    const u = usage(project, name);
    if ((u.events || u.texts) && !window.confirm(`Переменная «${name}» используется (событий: ${u.events}, надписей: ${u.texts}). Всё равно удалить?`)) return;
    onProject({ ...project, variables: vars.filter((v) => v.name !== name) });
  };
  const texts = project.objects.filter((o) => o.text && /\{[^}]+\}/.test(o.text));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-lg border border-[#2e3039] bg-[#1f2028] p-4">
        <p className="text-lg font-bold">Переменные — память игры</p>
        <p className={`mt-1 text-sm ${ui.muted}`}>
          Переменная — это коробочка с именем, в которой лежит число: сколько собрано монет, сколько осталось жизней, сколько прошло секунд. В начале игры в ней лежит
          начальное значение, а события меняют его: «прибавить 1», «отнять 1», «сделать равной». Показать число на экране можно в надписи:{" "}
          <code className="rounded bg-[#2a2c36] px-1.5 py-0.5 text-[#c4b5fd]">Монеты: {"{Монеты}"}</code>.
        </p>
      </div>

      <div className="rounded-lg border border-[#2e3039] bg-[#1f2028]">
        <div className={ui.head}>
          <span>Переменные игры ({vars.length})</span>
          <button
            type="button"
            onClick={() => onProject({ ...project, variables: [...vars, { name: freeName(project, "Переменная"), value: 0 }] })}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-bold ${ui.accent}`}
          >
            <Plus className="h-4 w-4" /> Новая переменная
          </button>
        </div>
        {vars.length ? (
          <div className="divide-y divide-[#2e3039]">
            <div className={`hidden grid-cols-[minmax(0,1fr)_9rem_minmax(0,1fr)_2.5rem] gap-3 px-4 py-2 text-xs font-bold uppercase tracking-wide sm:grid ${ui.muted}`}>
              <span>Имя</span>
              <span>В начале игры</span>
              <span>Где используется</span>
              <span />
            </div>
            {vars.map((v, i) => {
              const u = usage(project, v.name);
              return (
                <div key={`${i}:${v.name}`} className="grid grid-cols-[minmax(0,1fr)_7rem_2.5rem] items-start gap-3 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_9rem_minmax(0,1fr)_2.5rem]">
                  <NameField project={project} name={v.name} onRename={(to) => onProject(rename(project, v.name, to))} />
                  <input type="number" value={v.value} onChange={(e) => set(i, Number(e.target.value) || 0)} aria-label={`Начальное значение ${v.name}`} className={ui.input} />
                  <p className={`col-span-3 self-center text-sm sm:col-span-1 ${u.events || u.texts ? "" : ui.muted}`}>
                    {u.events || u.texts ? `событий: ${u.events} · надписей: ${u.texts}` : "пока нигде — добавь событие «Изменить переменную»"}
                  </p>
                  <button type="button" onClick={() => remove(v.name)} aria-label={`Удалить ${v.name}`} className="row-start-1 col-start-3 justify-self-end rounded p-2 text-[#9ca3af] hover:bg-[#2a2c36] hover:text-[#fb7185] sm:col-start-4">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className={`px-4 py-6 text-center text-sm ${ui.muted}`}>Переменных пока нет. Создай свою или возьми готовую заготовку ниже.</p>
        )}
        <p className={`border-t border-[#2e3039] px-4 py-2.5 text-xs ${ui.muted}`}>
          Если переименовать переменную, новое имя само появится во всех событиях и надписях. Во время предпросмотра значения видны в углу экрана.
        </p>
      </div>

      <div>
        <p className="mb-1 text-lg font-bold">Готовые заготовки</p>
        <p className={`mb-3 text-sm ${ui.muted}`}>Один клик — и в игре появится переменная, надпись с ней в углу экрана и события, которые её меняют. Потом всё можно поправить во вкладке событий.</p>
        <div className="grid gap-3 md:grid-cols-3">
          {RECIPES.map((r) => (
            <RecipeCard key={r.id} recipe={r} project={project} sceneId={sceneId} onProject={onProject} />
          ))}
        </div>
      </div>

      {texts.length > 0 && (
        <div className="rounded-lg border border-[#2e3039] bg-[#1f2028] p-4">
          <p className="mb-2 text-sm font-bold">Надписи, которые показывают переменные</p>
          <div className="flex flex-wrap gap-2">
            {texts.map((o) => (
              <span key={o.id} className="inline-flex items-center gap-2 rounded-md bg-[#2a2c36] px-2 py-1 text-sm">
                <KindPreview kind={o} className="h-6 w-6 text-base" />
                <span className="font-semibold">{o.name}:</span>
                <code className="text-[#c4b5fd]">{o.text}</code>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
