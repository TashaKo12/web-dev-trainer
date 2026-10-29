# 🧩 Тренажёр веб-разработки

Интерактивный тренажёр для первых шагов в вёрстке и JavaScript. Каждая тема
устроена одинаково: сначала короткая **интерактивная теория** с живыми,
подвижными элементами, потом **4–5 заданий** на закрепление.

## Темы

- 🏗️ **HTML-теги и структура страницы** — собери скелет страницы из тегов `header`, `nav`, `main`, `footer`.
- 📦 **CSS Box Model** — подвигай слои `margin`, `border`, `padding` и посмотри, как считается итоговый размер блока.
- 🧲 **Flexbox** — живые свойства `flex-direction`, `justify-content`, `align-items`, `flex-wrap`.
- 🎯 **CSS-селекторы** — пиши селекторы и смотри, какие элементы страницы они выбирают (по-настоящему, через `querySelectorAll`).
- 🧰 **Доступ к элементам HTML в JS** — `getElementById`, `querySelector(All)`, `children`, `closest`, `parentElement`, `nextElementSibling`...
- 📝 **HTML-теги: заголовки, списки, ссылки** — `h1–h3`, `p`, `a`, `img`, `ul`/`ol`.
- 🔤 **Шрифты и оформление текста** — `font-family`, `text-align`, `letter-spacing`, `line-height`, `@font-face` vs `@import`.
- 🖱️ **Псевдоклассы `:hover` и `:active`** — живая карточка, реагирующая на курсор и клик.
- 📋 **Формы и поля ввода** — `type`, `placeholder`, `required` на примере формы регистрации.
- 📊 **HTML-таблицы** — `table`, `tr`, `td`, `th`, `rowspan`, `colspan`.
- 🧱 **Макет страницы: header, main, footer** — прижимаем footer к низу экрана через flexbox.
- 🧭 **Пути к картинкам** — собери `src` сам и увидь вживую, когда фото появляется, а когда нет (относительные пути, `../`, регистр букв).

Прогресс по каждой теме сохраняется в `localStorage` браузера.

## Стек

Vite + React + TypeScript + Tailwind CSS, без бэкенда — чистый статический
сайт.

## Разработка

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
npm run preview
```

## Деплой

При пуше в `main` GitHub Actions (`.github/workflows/deploy.yml`) собирает
проект и публикует его на GitHub Pages. Один раз нужно включить Pages в
настройках репозитория: **Settings → Pages → Source → GitHub Actions**.
