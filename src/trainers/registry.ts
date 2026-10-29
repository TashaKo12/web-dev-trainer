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
    id: "flexbox",
    path: "/flexbox",
    emoji: "🧲",
    title: "Flexbox: выравнивание и направление",
    summary:
      "Расставь карточки по контейнеру с помощью flex-свойств — всё меняется вживую.",
    taskCount: 5,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "selectors",
    path: "/selectors",
    emoji: "🎯",
    title: "CSS-селекторы",
    summary:
      "Пиши селекторы и смотри, какие элементы страницы они подсвечивают.",
    taskCount: 5,
    gradient: "from-fuchsia-500 to-pink-600",
  },
  {
    id: "dom-access",
    path: "/dom-access",
    emoji: "🧰",
    title: "Доступ к элементам HTML в JS",
    summary:
      "Разберись, что вернёт getElementById, querySelector и их соседи по DOM.",
    taskCount: 5,
    gradient: "from-violet-500 to-indigo-600",
  },
];
