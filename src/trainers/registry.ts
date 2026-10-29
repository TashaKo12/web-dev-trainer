import type { TrainerId } from "../lib/progress";

export type TrainerMeta = {
  id: TrainerId;
  path: string;
  emoji: string;
  title: string;
  summary: string;
  taskCount: number;
  gradient: string;
};

export const trainers: TrainerMeta[] = [
  {
    id: "tags-attributes",
    path: "/tags-attributes",
    emoji: "🧩",
    title: "Что такое теги и атрибуты",
    summary:
      "Разбери HTML-тег на части: имя тега, атрибут, значение атрибута — и собери свой.",
    taskCount: 8,
    gradient: "from-orange-500 to-amber-600",
  },
  {
    id: "html-structure",
    path: "/html-structure",
    emoji: "🏗️",
    title: "HTML-теги и структура страницы",
    summary:
      "Собери скелет веб-страницы из блоков и разберись, какой тег за что отвечает.",
    taskCount: 5,
    gradient: "from-sky-500 to-blue-600",
  },
  {
    id: "basic-tags",
    path: "/basic-tags",
    emoji: "📝",
    title: "HTML-теги: заголовки, списки, ссылки",
    summary:
      "h1–h3, p, a, img, ul/ol — базовые теги, из которых собрана почти любая страница.",
    taskCount: 5,
    gradient: "from-rose-500 to-red-600",
  },
  {
    id: "links",
    path: "/links",
    emoji: "🔗",
    title: "Тег a и атрибут href",
    summary:
      "Собери ссылку сам — куда она ведёт, когда открывается в новой вкладке, и чем якорь отличается от обычной ссылки.",
    taskCount: 8,
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    id: "box-model",
    path: "/box-model",
    emoji: "📦",
    title: "CSS Box Model",
    summary:
      "Подвигай слои margin, border и padding и увидь, как из них складывается размер блока.",
    taskCount: 5,
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: "typography",
    path: "/typography",
    emoji: "🔤",
    title: "Шрифты и оформление текста",
    summary:
      "font-family, text-align, letter-spacing, line-height — и как подключить свой или Google-шрифт.",
    taskCount: 5,
    gradient: "from-purple-500 to-fuchsia-600",
  },
  {
    id: "flexbox",
    path: "/flexbox",
    emoji: "🧲",
    title: "Flexbox: выравнивание и направление",
    summary:
      "Расставь карточки по контейнеру с помощью flex-свойств — всё меняется вживую.",
    taskCount: 8,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "selectors",
    path: "/selectors",
    emoji: "🎯",
    title: "CSS-селекторы",
    summary:
      "Пиши селекторы и смотри, какие элементы страницы они подсвечивают.",
    taskCount: 9,
    gradient: "from-fuchsia-500 to-pink-600",
  },
  {
    id: "pseudo-classes",
    path: "/pseudo-classes",
    emoji: "🖱️",
    title: "Псевдоклассы :hover и :active",
    summary:
      "Наведи курсор или нажми кнопку мыши — посмотри, как меняется элемент.",
    taskCount: 5,
    gradient: "from-pink-500 to-rose-600",
  },
  {
    id: "forms",
    path: "/forms",
    emoji: "📋",
    title: "Формы и поля ввода",
    summary:
      "type, placeholder и required — собери форму регистрации из подходящих полей.",
    taskCount: 5,
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    id: "tables",
    path: "/tables",
    emoji: "📊",
    title: "HTML-таблицы",
    summary:
      "table, tr, td, th и объединение ячеек через rowspan и colspan.",
    taskCount: 5,
    gradient: "from-slate-500 to-slate-700",
  },
  {
    id: "page-layout",
    path: "/page-layout",
    emoji: "🧱",
    title: "Макет страницы: header, main, footer",
    summary:
      "Собери скелет страницы и прижми footer к низу экрана с помощью flexbox.",
    taskCount: 5,
    gradient: "from-indigo-500 to-blue-700",
  },
  {
    id: "image-paths",
    path: "/image-paths",
    emoji: "🧭",
    title: "Пути к картинкам",
    summary:
      "Впиши src сам и смотри вживую, когда фото появляется, а когда — нет.",
    taskCount: 9,
    gradient: "from-teal-500 to-emerald-600",
  },
  {
    id: "dom-access",
    path: "/dom-access",
    emoji: "🧰",
    title: "Доступ к элементам HTML в JS",
    summary:
      "Разберись, что вернёт getElementById, querySelector и их соседи по DOM.",
    taskCount: 7,
    gradient: "from-violet-500 to-indigo-600",
  },
];
