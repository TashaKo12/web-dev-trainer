// «Конструктор игр»: what a game is made of. A project has object kinds (a picture + behaviors),
// scenes with placed copies of those objects, global variables and, in every scene, events «условия → действия».

/** How an object looks: an emoji, a colour block ("#rrggbb") or an uploaded picture ("data:image/…"). */
export type Look = string;

export type Behavior =
  | { kind: "topdown"; speed: number }
  | { kind: "platformer"; speed: number; jump: number; gravity: number }
  | { kind: "solid" }
  | { kind: "patrol"; axis: "x" | "y"; distance: number; speed: number }
  | { kind: "chase"; target: string; speed: number }
  | { kind: "bounds" };

export type ObjectKind = { id: string; name: string; look: Look; w: number; h: number; behaviors: Behavior[] };
export type Instance = { id: string; kind: string; x: number; y: number };

export type Op = "=" | "≠" | ">" | "<" | "≥" | "≤";
export type KeyName = "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown" | "Space" | "Enter";

export type Condition =
  | { k: "start" }
  | { k: "key"; key: KeyName }
  | { k: "collide"; a: string; b: string }
  | { k: "click"; obj: string }
  | { k: "count"; obj: string; op: Op; value: number }
  | { k: "var"; name: string; op: Op; value: number }
  | { k: "timer"; seconds: number }
  | { k: "outside"; obj: string };

export type Action =
  | { k: "delete"; obj: string }
  | { k: "create"; obj: string; x: number; y: number }
  | { k: "teleport"; obj: string; x: number; y: number }
  | { k: "var"; name: string; mode: "set" | "add" | "sub"; value: number }
  | { k: "text"; text: string }
  | { k: "stop"; text: string }
  | { k: "scene"; scene: string }
  | { k: "restartScene" }
  | { k: "restartGame" };

export type GameEvent = { id: string; conditions: Condition[]; actions: Action[] };
export type Scene = { id: string; name: string; bg: string; w: number; h: number; instances: Instance[]; events: GameEvent[] };
export type Variable = { name: string; value: number };
export type Project = { id: string; name: string; updated: number; objects: ObjectKind[]; scenes: Scene[]; variables: Variable[] };

export const uid = () => Math.random().toString(36).slice(2, 10);

/** Ready pictures for objects; a child can also upload their own. */
export const EMOJI_LOOKS = ["🤖", "🐱", "🐶", "🦊", "🐸", "🚀", "🛸", "🪙", "⭐", "💎", "🍎", "🍓", "🔑", "🚪", "🏁", "❤️", "👾", "👻", "🦇", "🔥", "💣", "🌵", "🌳", "🪨", "☁️", "🌙", "🎁", "⚽"];
export const COLOR_LOOKS = ["#64748b", "#78350f", "#16a34a", "#2563eb", "#dc2626", "#f59e0b", "#7c3aed", "#0f172a"];

export const isImage = (look: Look) => look.startsWith("data:") || look.startsWith("http");
export const isColor = (look: Look) => look.startsWith("#");

export const BEHAVIOR_INFO: Record<Behavior["kind"], { title: string; about: string; make: (objects: ObjectKind[]) => Behavior }> = {
  topdown: { title: "Ходит стрелками (вид сверху)", about: "Стрелки двигают объект во все стороны.", make: () => ({ kind: "topdown", speed: 200 }) },
  platformer: { title: "Платформер", about: "Стрелки влево-вправо, прыжок — стрелка вверх или пробел. Объект падает вниз.", make: () => ({ kind: "platformer", speed: 220, jump: 620, gravity: 1500 }) },
  solid: { title: "Твёрдое препятствие", about: "Сквозь него не пройти: стены, пол, платформы.", make: () => ({ kind: "solid" }) },
  patrol: { title: "Ходит туда-обратно", about: "Сам двигается по линии и разворачивается.", make: () => ({ kind: "patrol", axis: "x", distance: 160, speed: 90 }) },
  chase: { title: "Преследует", about: "Двигается к другому объекту.", make: (objects) => ({ kind: "chase", target: objects[0]?.id ?? "", speed: 70 }) },
  bounds: { title: "Не уходит за край", about: "Объект не может выйти за края сцены.", make: () => ({ kind: "bounds" }) },
};

export const KEY_LABEL: Record<KeyName, string> = { ArrowLeft: "←", ArrowRight: "→", ArrowUp: "↑", ArrowDown: "↓", Space: "Пробел", Enter: "Enter" };
export const OPS: Op[] = ["=", "≠", ">", "<", "≥", "≤"];

export const CONDITION_INFO: Record<Condition["k"], { title: string; make: (p: Project) => Condition }> = {
  start: { title: "В начале сцены", make: () => ({ k: "start" }) },
  collide: { title: "Объект касается объекта", make: (p) => ({ k: "collide", a: p.objects[0]?.id ?? "", b: p.objects[1]?.id ?? p.objects[0]?.id ?? "" }) },
  key: { title: "Нажата клавиша", make: () => ({ k: "key", key: "Space" }) },
  click: { title: "Кликнули по объекту", make: (p) => ({ k: "click", obj: p.objects[0]?.id ?? "" }) },
  count: { title: "Сколько объектов на сцене", make: (p) => ({ k: "count", obj: p.objects[0]?.id ?? "", op: "=", value: 0 }) },
  var: { title: "Значение переменной", make: (p) => ({ k: "var", name: p.variables[0]?.name ?? "", op: "≥", value: 10 }) },
  timer: { title: "Каждые N секунд", make: () => ({ k: "timer", seconds: 2 }) },
  outside: { title: "Объект ушёл за край сцены", make: (p) => ({ k: "outside", obj: p.objects[0]?.id ?? "" }) },
};

export const ACTION_INFO: Record<Action["k"], { title: string; make: (p: Project) => Action }> = {
  delete: { title: "Удалить объект", make: (p) => ({ k: "delete", obj: p.objects[0]?.id ?? "" }) },
  var: { title: "Изменить переменную", make: (p) => ({ k: "var", name: p.variables[0]?.name ?? "", mode: "add", value: 1 }) },
  text: { title: "Показать надпись", make: () => ({ k: "text", text: "Привет!" }) },
  stop: { title: "Конец игры с надписью", make: () => ({ k: "stop", text: "Победа!" }) },
  create: { title: "Создать объект", make: (p) => ({ k: "create", obj: p.objects[0]?.id ?? "", x: 100, y: 100 }) },
  teleport: { title: "Переместить объект", make: (p) => ({ k: "teleport", obj: p.objects[0]?.id ?? "", x: 40, y: 40 }) },
  scene: { title: "Перейти на сцену", make: (p) => ({ k: "scene", scene: p.scenes[0]?.id ?? "" }) },
  restartScene: { title: "Начать сцену заново", make: () => ({ k: "restartScene" }) },
  restartGame: { title: "Начать игру заново", make: () => ({ k: "restartGame" }) },
};

export function emptyProject(name = "Моя игра"): Project {
  const scene: Scene = { id: uid(), name: "Сцена 1", bg: "#dbeafe", w: 800, h: 480, instances: [], events: [] };
  return {
    id: uid(),
    name,
    updated: Date.now(),
    objects: [{ id: uid(), name: "Игрок", look: "🤖", w: 48, h: 48, behaviors: [{ kind: "topdown", speed: 200 }, { kind: "bounds" }] }],
    scenes: [scene],
    variables: [{ name: "Очки", value: 0 }],
  };
}

/** «Собери монеты»: a ready game to look at and change. */
export function coinsTemplate(): Project {
  const player: ObjectKind = { id: uid(), name: "Игрок", look: "🤖", w: 44, h: 44, behaviors: [{ kind: "topdown", speed: 210 }, { kind: "bounds" }] };
  const wall: ObjectKind = { id: uid(), name: "Стена", look: "#64748b", w: 40, h: 40, behaviors: [{ kind: "solid" }] };
  const coin: ObjectKind = { id: uid(), name: "Монета", look: "🪙", w: 32, h: 32, behaviors: [] };
  const enemy: ObjectKind = { id: uid(), name: "Призрак", look: "👻", w: 42, h: 42, behaviors: [{ kind: "patrol", axis: "y", distance: 200, speed: 110 }] };
  const inst = (k: ObjectKind, x: number, y: number): Instance => ({ id: uid(), kind: k.id, x, y });
  const walls = [
    ...[0, 1, 2, 3, 4].map((i) => inst(wall, 200, 80 + i * 40)),
    ...[0, 1, 2, 3, 4].map((i) => inst(wall, 520, 200 + i * 40)),
    ...[0, 1, 2].map((i) => inst(wall, 320 + i * 40, 80)),
  ];
  const coins = [
    [100, 100], [120, 380], [300, 300], [420, 160], [640, 100], [700, 400], [580, 120],
  ].map(([x, y]) => inst(coin, x, y));
  const scene: Scene = {
    id: uid(),
    name: "Уровень",
    bg: "#dcfce7",
    w: 800,
    h: 480,
    instances: [inst(player, 40, 220), ...walls, ...coins, inst(enemy, 400, 220)],
    events: [
      { id: uid(), conditions: [{ k: "start" }], actions: [{ k: "var", name: "Очки", mode: "set", value: 0 }, { k: "text", text: "Собери все монеты! Не попадись призраку." }] },
      { id: uid(), conditions: [{ k: "collide", a: player.id, b: coin.id }], actions: [{ k: "delete", obj: coin.id }, { k: "var", name: "Очки", mode: "add", value: 1 }, { k: "text", text: "Очки: {Очки}" }] },
      { id: uid(), conditions: [{ k: "count", obj: coin.id, op: "=", value: 0 }], actions: [{ k: "stop", text: "Победа! Все монеты собраны 🎉" }] },
      { id: uid(), conditions: [{ k: "collide", a: player.id, b: enemy.id }], actions: [{ k: "restartScene" }] },
    ],
  };
  return { id: uid(), name: "Собери монеты", updated: Date.now(), objects: [player, wall, coin, enemy], scenes: [scene], variables: [{ name: "Очки", value: 0 }] };
}

/** «Прыгун»: a small platformer. */
export function platformerTemplate(): Project {
  const player: ObjectKind = { id: uid(), name: "Кот", look: "🐱", w: 40, h: 40, behaviors: [{ kind: "platformer", speed: 220, jump: 640, gravity: 1500 }, { kind: "bounds" }] };
  const ground: ObjectKind = { id: uid(), name: "Платформа", look: "#16a34a", w: 80, h: 24, behaviors: [{ kind: "solid" }] };
  const star: ObjectKind = { id: uid(), name: "Звезда", look: "⭐", w: 30, h: 30, behaviors: [] };
  const flag: ObjectKind = { id: uid(), name: "Флаг", look: "🏁", w: 40, h: 40, behaviors: [] };
  const inst = (k: ObjectKind, x: number, y: number): Instance => ({ id: uid(), kind: k.id, x, y });
  const floor = [0, 1, 2, 3, 6, 7, 8, 9].map((i) => inst(ground, i * 80, 456));
  const steps = [inst(ground, 240, 360), inst(ground, 400, 290), inst(ground, 560, 220), inst(ground, 680, 150)];
  const stars = [[270, 320], [430, 250], [590, 180], [130, 400]].map(([x, y]) => inst(star, x, y));
  const scene: Scene = {
    id: uid(),
    name: "Уровень",
    bg: "#e0f2fe",
    w: 800,
    h: 480,
    instances: [inst(player, 30, 400), ...floor, ...steps, ...stars, inst(flag, 700, 108)],
    events: [
      { id: uid(), conditions: [{ k: "start" }], actions: [{ k: "var", name: "Звёзды", mode: "set", value: 0 }] },
      { id: uid(), conditions: [{ k: "collide", a: player.id, b: star.id }], actions: [{ k: "delete", obj: star.id }, { k: "var", name: "Звёзды", mode: "add", value: 1 }] },
      { id: uid(), conditions: [{ k: "collide", a: player.id, b: flag.id }, { k: "var", name: "Звёзды", op: "≥", value: 4 }], actions: [{ k: "stop", text: "Уровень пройден! ⭐" }] },
      { id: uid(), conditions: [{ k: "collide", a: player.id, b: flag.id }, { k: "var", name: "Звёзды", op: "<", value: 4 }], actions: [{ k: "text", text: "Сначала собери все звёзды!" }] },
      { id: uid(), conditions: [{ k: "outside", obj: player.id }], actions: [{ k: "restartScene" }] },
    ],
  };
  return { id: uid(), name: "Прыгун", updated: Date.now(), objects: [player, ground, star, flag], scenes: [scene], variables: [{ name: "Звёзды", value: 0 }] };
}

export const SIZES: { label: string; w: number; h: number }[] = [
  { label: "Широкая 800 × 480", w: 800, h: 480 },
  { label: "Квадрат 600 × 600", w: 600, h: 600 },
  { label: "Высокая 480 × 720", w: 480, h: 720 },
];
