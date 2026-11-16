import type { Line } from "../quest/data";
import type { CodeExample } from "../components/GameTheory";

// «Клавиатура Пикселя»: find keys on the real keyboard and learn what they do (children 7–9).
// Keys are matched by their place on the keyboard (event.code), so the tasks work in any keyboard layout.

export type KeyDef = { code: string; label: string; latin?: string; w?: number };

const k = (code: string, label: string, latin?: string, w?: number): KeyDef => ({ code, label, latin, w });

/** The Russian keyboard (ЙЦУКЕН) as it is drawn on the screen. */
export const ROWS: KeyDef[][] = [
  [k("Escape", "Esc", undefined, 1.3), k("Delete", "Delete", undefined, 1.6)],
  [
    k("Backquote", "Ё", "`"),
    ...["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((d) => k(`Digit${d}`, d)),
    k("Minus", "-"),
    k("Equal", "="),
    k("Backspace", "⟵ Backspace", undefined, 2.2),
  ],
  [
    k("Tab", "Tab ⇥", undefined, 1.6),
    ...[..."ЙЦУКЕНГШЩЗХЪ"].map((ch, i) => k(["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight"][i], ch, "QWERTYUIOP[]"[i])),
    k("Backslash", "\\", undefined, 1.6),
  ],
  [
    k("CapsLock", "Caps Lock", undefined, 1.9),
    ...[..."ФЫВАПРОЛДЖЭ"].map((ch, i) => k(["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote"][i], ch, "ASDFGHJKL;'"[i])),
    k("Enter", "Enter ⏎", undefined, 2.3),
  ],
  [
    k("ShiftLeft", "⇧ Shift", undefined, 2.4),
    ...[..."ЯЧСМИТЬБЮ"].map((ch, i) => k(["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period"][i], ch, "ZXCVBNM,."[i])),
    k("Slash", "."),
    k("ShiftRight", "⇧ Shift", undefined, 2.8),
  ],
  [
    k("ControlLeft", "Ctrl", undefined, 1.6),
    k("AltLeft", "Alt", undefined, 1.3),
    k("Space", "Пробел", undefined, 6.5),
    k("AltRight", "Alt", undefined, 1.3),
    k("ControlRight", "Ctrl", undefined, 1.4),
    k("ArrowLeft", "←"),
    k("ArrowUp", "↑"),
    k("ArrowDown", "↓"),
    k("ArrowRight", "→"),
  ],
];

export const KEY_BY_CODE = new Map(ROWS.flat().map((key) => [key.code, key]));
/** The physical key of a Russian letter or a digit. */
export const CODE_OF = new Map(ROWS.flat().map((key) => [key.label, key.code]));

export type Task = (
  /** Press one key (any of the codes: both Shifts count). `about` explains what it does — shown after or instead of the name. */
  | { kind: "key"; codes: string[]; say: string; name: string; about?: string }
  /** Hold Ctrl or Shift and press a key. */
  | { kind: "combo"; mod: "ctrl" | "shift"; code: string; say: string; name: string; about: string }
  /** Type a whole word. */
  | { kind: "word"; word: string; say: string }
) & {
  /** Where a programmer needs this key: shown under the task (not in «Вспомни!» — it would give the answer away). */
  dev?: CodeExample;
};

export type KeysLevel = {
  id: string;
  title: string;
  emoji: string;
  about: string;
  /** When the right key starts glowing: after this many mistakes (0 — it glows from the start). */
  hintAfter: number;
  tasks: () => Task[];
};

const shuffle = <T,>(xs: T[]) => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const letter = (ch: string): Task => {
  const code = CODE_OF.get(ch)!;
  const latin = KEY_BY_CODE.get(code)?.latin;
  const dev: CodeExample | undefined = /\d/.test(ch)
    ? { note: "В программах с числами считают — например, очки в игре:", code: `${ch} + 1`, out: String(Number(ch) + 1) }
    : latin
      ? { note: `В английской раскладке на этой клавише «${latin}». Программисты часто пишут английскими буквами — раскладку переключают Alt + Shift или Win + Пробел.` , code: `${ch}  →  ${latin.toLowerCase()}` }
      : undefined;
  return { kind: "key", codes: [code], say: `Найди ${/\d/.test(ch) ? "цифру" : "букву"} «${ch}»`, name: ch, dev };
};
const letters = (set: string, n: number) => () => shuffle([...set, ...set]).slice(0, n).map(letter);

const SPECIAL: Record<string, { codes: string[]; name: string; about: string; dev: CodeExample }> = {
  space: { codes: ["Space"], name: "Пробел", about: "ставит пробел между словами", dev: { note: "Без пробелов слова слипаются — ни человек, ни компьютер их не разберёт:", code: "повтори3раза   ← непонятно\nповтори 3 раза ← понятно" } },
  enter: { codes: ["Enter", "NumpadEnter"], name: "Enter", about: "переносит текст на новую строку или отправляет сообщение", dev: { note: "Обычно каждая команда программы — на своей строке. Новую строку начинает Enter:", code: "вперёд\nналево\nвперёд" } },
  backspace: { codes: ["Backspace"], name: "Backspace", about: "стирает букву слева от курсора", dev: { note: "Одна опечатка — и компьютер не поймёт команду. Backspace её исправит:", code: "впреёд   ← ошибка\nвперёд   ← верно" } },
  delete: { codes: ["Delete"], name: "Delete", about: "стирает букву справа от курсора", dev: { note: "Курсор стоит перед лишней буквой? Delete сотрёт её, не трогая то, что слева:", code: "впперёд  →  вперёд" } },
  shift: { codes: ["ShiftLeft", "ShiftRight"], name: "Shift", about: "пока её держишь, буквы пишутся заглавными", dev: { note: "С Shift цифры превращаются в знаки. В программах они нужны постоянно:", code: "Shift + 9  →  (\nShift + 0  →  )" } },
  caps: { codes: ["CapsLock"], name: "Caps Lock", about: "включает заглавные буквы, пока не нажмёшь её ещё раз", dev: { note: "Для компьютера большие и маленькие буквы — разные. Поэтому с Caps Lock осторожно:", code: "кот ≠ КОТ" } },
  tab: { codes: ["Tab"], name: "Tab", about: "делает большой отступ или переходит к следующему полю", dev: { note: "Отступ показывает, какие команды находятся внутри цикла:", code: "повтори 3 раза:\n    вперёд\n    налево" } },
  esc: { codes: ["Escape"], name: "Esc", about: "отменяет или закрывает окно, а в играх ставит паузу", dev: { note: "Когда ты делаешь свою игру, ты сам решаешь, что делает Esc:", code: "если нажат Esc:\n    пауза" } },
  left: { codes: ["ArrowLeft"], name: "Стрелка влево", about: "двигает курсор влево", dev: { note: "В играх программист решает, что делает стрелка:", code: "если нажата ←:\n    герой шагает влево" } },
  right: { codes: ["ArrowRight"], name: "Стрелка вправо", about: "двигает курсор вправо", dev: { note: "Стрелка вправо — герой шагает вправо:", code: "если нажата →:\n    герой шагает вправо" } },
  up: { codes: ["ArrowUp"], name: "Стрелка вверх", about: "двигает курсор вверх", dev: { note: "В тексте стрелка вверх переводит курсор на строку выше. А в игре:", code: "если нажата ↑:\n    герой прыгает" } },
  down: { codes: ["ArrowDown"], name: "Стрелка вниз", about: "двигает курсор вниз", dev: { note: "Стрелка вниз — на строку ниже. А в игре:", code: "если нажата ↓:\n    герой приседает" } },
};

/** Learn: the task names the key and says what it does. */
const learn = (id: keyof typeof SPECIAL): Task => ({ kind: "key", ...SPECIAL[id], say: `Нажми ${SPECIAL[id].name} — эта клавиша ${SPECIAL[id].about}.` });
/** Recall: the task says only what the key does. */
const recall = (id: keyof typeof SPECIAL): Task => ({ kind: "key", ...SPECIAL[id], dev: undefined, say: `Какая клавиша ${SPECIAL[id].about}? Нажми её!` });

const COMBOS = {
  copy: { mod: "ctrl" as const, code: "KeyC", name: "Ctrl + C", about: "копирует выделенное", dev: { note: "Программисты копируют кусочки программы, чтобы не печатать их заново:", code: "выдели текст  →  Ctrl + C" } },
  paste: { mod: "ctrl" as const, code: "KeyV", name: "Ctrl + V", about: "вставляет то, что скопировали", dev: { note: "Скопировал команды — вставь их ещё раз:", code: "вперёд, налево\nвперёд, налево   ← Ctrl + V" } },
  cut: { mod: "ctrl" as const, code: "KeyX", name: "Ctrl + X", about: "вырезает выделенное", dev: { note: "Ctrl + X и Ctrl + V переносят команду в другое место — порядок команд важен:", code: "налево   ← вырежи\nвперёд\nналево   ← вставь сюда" } },
  undo: { mod: "ctrl" as const, code: "KeyZ", name: "Ctrl + Z", about: "отменяет последнее действие", dev: { note: "Случайно стёр полпрограммы? Ctrl + Z вернёт всё, как было. Главное сочетание программиста!", code: "стёр  →  Ctrl + Z  →  всё вернулось" } },
  all: { mod: "ctrl" as const, code: "KeyA", name: "Ctrl + A", about: "выделяет всё", dev: { note: "Ctrl + A выделяет весь текст сразу — например, чтобы скопировать программу целиком.", code: "Ctrl + A  →  Ctrl + C" } },
  save: { mod: "ctrl" as const, code: "KeyS", name: "Ctrl + S", about: "сохраняет файл", dev: { note: "Программа хранится в файле. Не сохранишь — изменения пропадут!", code: "игра  ●  не сохранено\nигра  ✓  сохранено" } },
  capital: { mod: "shift" as const, code: "KeyN", name: "Shift + Т", about: "пишет заглавную букву «Т»", dev: { note: "Имена пишут с большой буквы. Для компьютера «Таня» и «таня» — разные слова.", code: "Таня ≠ таня" } },
};
const comboLearn = (id: keyof typeof COMBOS): Task => ({
  kind: "combo",
  ...COMBOS[id],
  say:
    COMBOS[id].mod === "ctrl"
      ? `${COMBOS[id].name} ${COMBOS[id].about}. Зажми Ctrl и, не отпуская, нажми ${COMBOS[id].name.split(" + ")[1]} — на русской клавиатуре на ней буква «${KEY_BY_CODE.get(COMBOS[id].code)?.label}».`
      : `${COMBOS[id].name} ${COMBOS[id].about}. Зажми Shift и, не отпуская, нажми «Т».`,
});
const comboRecall = (id: keyof typeof COMBOS): Task => ({ kind: "combo", ...COMBOS[id], dev: undefined, say: `Какое сочетание ${COMBOS[id].about}? Нажми его!` });

const word = (w: string): Task => ({
  kind: "word",
  word: w,
  say: `Напечатай слово «${w}»`,
  dev: { note: "Программисты всё время печатают слова. Так программа показывает слово на экране:", code: `покажи «${w}»`, out: w },
});

export const KEYS_INTRO: Line[] = [
  { who: "pixel", text: "Болтик, а что это за доска с кучей кнопок?" },
  { who: "bolt", text: "Это клавиатура! Через неё люди разговаривают с компьютером. И каждая клавиша что-то умеет." },
  { who: "bolt", text: "Ищи нужную клавишу на своей настоящей клавиатуре и нажимай. А если клавиатуры нет — нажимай прямо на экране." },
];

export const KEYS_LEVELS: KeysLevel[] = [
  { id: "k1", title: "Домашний ряд: левая рука", emoji: "🤚", about: "Ф, Ы, В, А — сюда ложатся пальцы левой руки.", hintAfter: 0, tasks: letters("ФЫВА", 8) },
  { id: "k2", title: "Домашний ряд: правая рука", emoji: "✋", about: "О, Л, Д, Ж — место для пальцев правой руки.", hintAfter: 0, tasks: letters("ОЛДЖПР", 8) },
  { id: "k3", title: "Верхний ряд", emoji: "⬆️", about: "Буквы над домашним рядом: Й, Ц, У, К, Е, Н…", hintAfter: 1, tasks: letters("ЙЦУКЕНГШЩЗХ", 10) },
  { id: "k4", title: "Нижний ряд", emoji: "⬇️", about: "Буквы под домашним рядом: Я, Ч, С, М, И, Т…", hintAfter: 1, tasks: letters("ЯЧСМИТЬБЮ", 10) },
  { id: "k5", title: "Цифры", emoji: "🔢", about: "Цифры живут в самом верхнем ряду.", hintAfter: 1, tasks: letters("1234567890", 10) },
  {
    id: "k6",
    title: "Важные клавиши",
    emoji: "⏎",
    about: "Пробел, Enter, Backspace, Delete, Shift и Caps Lock — что они умеют.",
    hintAfter: 0,
    tasks: () => (["space", "enter", "backspace", "delete", "shift", "caps"] as const).map(learn),
  },
  {
    id: "k7",
    title: "Стрелки, Tab и Esc",
    emoji: "🧭",
    about: "Как двигать курсор и закрывать окна.",
    hintAfter: 0,
    tasks: () => (["tab", "esc", "left", "right", "up", "down"] as const).map(learn),
  },
  {
    id: "k8",
    title: "Волшебные сочетания",
    emoji: "✨",
    about: "Ctrl + C, Ctrl + V, Ctrl + Z и другие: две клавиши вместе.",
    hintAfter: 0,
    tasks: () => (["copy", "paste", "cut", "undo", "all", "save", "capital"] as const).map(comboLearn),
  },
  {
    id: "k9",
    title: "Вспомни!",
    emoji: "🧠",
    about: "Теперь без названий: только что клавиша делает.",
    hintAfter: 2,
    tasks: () =>
      shuffle([
        ...(["space", "enter", "backspace", "delete", "shift", "tab", "esc"] as const).map(recall),
        ...(["copy", "paste", "undo", "all"] as const).map(comboRecall),
      ]),
  },
  {
    id: "k10",
    title: "Пишем слова",
    emoji: "✍️",
    about: "Напечатай слова целиком — буква за буквой.",
    hintAfter: 1,
    tasks: () => shuffle(["КОТ", "ДОМ", "ЛЕС", "МАМА", "РОБОТ", "ПИКСЕЛЬ"]).map(word),
  },
];
