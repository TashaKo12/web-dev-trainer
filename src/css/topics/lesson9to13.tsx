import { centered, Code, near, type CssTopicData } from "../CssTopic";

const C = Code;

// ── Урок 9. Личная визитка: max-width и max-height ──
export const MAX_SIZE: CssTopicData = {
  id: "max-size",
  theory: {
    title: "Ограничения размера: max-width и max-height",
    description: "Визитка не должна растягиваться на весь огромный монитор. Для этого есть «потолок» размера — max-width.",
    parts: [
      {
        title: "max-width — не шире, чем…",
        text: (
          <>
            <C>max-width: 600px</C> значит: блок может быть уже, но не шире 600 пикселей. На телефоне он займёт всю ширину, а на
            большом мониторе остановится на 600px. Это удобнее, чем <C>width</C>, который на узком экране вылезет за край.
          </>
        ),
        demo: { html: '<div class="card">Визитка: не шире 260 пикселей</div>', css: ".card { max-width: 260px; margin: 0 auto; padding: 12px; background: #e0f2fe; }", height: 90 },
      },
      {
        title: "width против max-width",
        text: (
          <>
            <C>width: 600px</C> — всегда ровно 600, даже если экран 360: появится прокрутка вбок. <C>max-width: 600px</C> —
            «до 600»: на узком экране блок просто сожмётся. Для страниц и карточек почти всегда лучше max-width.
          </>
        ),
      },
      {
        title: "max-height — не выше, чем…",
        text: (
          <>
            <C>max-height</C> ограничивает высоту. Если содержимого больше, оно вылезет за край — тогда добавляют{" "}
            <C>overflow: auto</C>, и внутри появится прокрутка.
          </>
        ),
        demo: { html: '<div class="list">Строка 1<br>Строка 2<br>Строка 3<br>Строка 4<br>Строка 5</div>', css: ".list { max-height: 60px; overflow: auto; background: #fef3c7; padding: 6px; }", height: 100 },
      },
    ],
  },
  levels: [
    { kind: "choice", prompt: "Что значит max-width: 600px?", options: ["Не шире 600 пикселей", "Ровно 600 пикселей", "Не уже 600 пикселей", "600 процентов"], correct: 0, explain: "max — «максимум»: блок может быть уже, но не шире." },
    {
      kind: "write",
      prompt: "Пусть визитка .card будет не шире 300 пикселей.",
      html: '<div class="card">Пиксель, начинающий веб-разработчик</div>',
      css: ".card { background: #e0f2fe; padding: 10px; }",
      start: ".card {\n  \n}",
      target: ".card",
      expect: { "max-width": (v) => near(v, 300) },
      explain: ".card { max-width: 300px; }",
    },
    { kind: "choice", prompt: "Экран телефона шириной 360px. Что будет с блоком width: 600px?", options: ["Вылезет за край, появится прокрутка вбок", "Сожмётся до 360", "Исчезнет", "Станет 600 процентов"], correct: 0, explain: "width — ровно 600. Поэтому для страниц лучше max-width." },
    {
      kind: "write",
      prompt: "Сделай визитку не шире 200px и поставь по центру.",
      html: '<div class="card">Визитка</div>',
      css: ".card { background: #ede9fe; padding: 10px; }",
      start: ".card {\n  \n}",
      target: ".card",
      expect: {
        "max-width": (v) => near(v, 200),
        "margin-left": (_v, el) => centered(el, 5),
      },
      explain: ".card { max-width: 200px; margin: 0 auto; }",
    },
    {
      kind: "write",
      prompt: "Ограничь высоту списка .list 80 пикселями и добавь прокрутку внутри.",
      html: '<div class="list">Навык 1<br>Навык 2<br>Навык 3<br>Навык 4<br>Навык 5<br>Навык 6</div>',
      css: ".list { background: #fef3c7; padding: 6px; }",
      start: ".list {\n  \n}",
      target: ".list",
      height: 140,
      expect: { "max-height": (v) => near(v, 80), "overflow-y": (v) => v === "auto" || v === "scroll" },
      explain: ".list { max-height: 80px; overflow: auto; }",
    },
    { kind: "choice", prompt: "Что делает overflow: auto у блока с max-height?", options: ["Добавляет прокрутку, если не помещается", "Растягивает блок", "Прячет весь текст", "Делает блок прозрачным"], correct: 0, explain: "Лишнее не вылезает за край, а прокручивается внутри." },
  ],
  cards: [
    { text: "max-width задаёт максимальную ширину.", answer: true, explain: "Да, блок может быть уже, но не шире." },
    { text: "max-width: 600px — то же самое, что width: 600px.", answer: false, explain: "Нет, max-width позволяет сжаться на узком экране." },
    { text: "Блок с max-width на телефоне может занять всю ширину.", answer: true, explain: "Да, если экран уже ограничения." },
    { text: "max-height ограничивает высоту блока.", answer: true, explain: "Да, а лишнее можно прокрутить с overflow: auto." },
    { text: "width: 800px удобно для страниц на телефоне.", answer: false, explain: "Нет, на узком экране появится прокрутка вбок." },
    { text: "max-width и margin: 0 auto можно использовать вместе.", answer: true, explain: "Да, получится колонка по центру." },
    { text: "overflow: auto добавляет прокрутку, если содержимое не помещается.", answer: true, explain: "Да, прокрутка появится внутри блока." },
    { text: "max-width работает только у картинок.", answer: false, explain: "Нет, у любых блоков." },
    { text: "В визитке max-width не даёт карточке растянуться на большом мониторе.", answer: true, explain: "Да, в этом его смысл." },
    { text: "max-height: 100px делает блок ровно 100 пикселей.", answer: false, explain: "Нет, не выше 100 — меньше можно." },
  ],
};

// ── Урок 12. Стоимость услуг: маркеры списка ──
export const LIST_STYLE: CssTopicData = {
  id: "list-style",
  theory: {
    title: "Маркеры списка: list-style",
    description: "В карточках тарифов пункты шли без точек. Разберём, как менять и убирать маркеры списка.",
    parts: [
      {
        title: "Вид маркера: list-style-type",
        text: (
          <>
            У <C>ul</C> маркеры — точки, у <C>ol</C> — цифры. Свойство <C>list-style-type</C> меняет их: <C>circle</C> —
            кружок, <C>square</C> — квадрат, <C>decimal</C> — цифры, <C>upper-roman</C> — римские цифры.
          </>
        ),
        demo: { html: '<ul class="s"><li>Квадрат</li><li>Квадрат</li></ul><ol class="r"><li>Римские</li><li>Римские</li></ol>', css: ".s { list-style-type: square; }\n.r { list-style-type: upper-roman; }", height: 130 },
      },
      {
        title: "Убрать маркеры: list-style: none",
        text: (
          <>
            <C>list-style: none</C> убирает маркеры — так делают меню и карточки тарифов. Обычно заодно убирают отступ слева:{" "}
            <C>padding-left: 0</C>, ведь он нужен был для маркеров.
          </>
        ),
        demo: { html: '<ul class="clean"><li>1 Website</li><li>50 GB SSD</li><li>Free SSL</li></ul>', css: ".clean { list-style: none; padding-left: 0; }", height: 100 },
      },
      {
        title: "Маркер внутри или снаружи",
        text: (
          <>
            <C>list-style-position: inside</C> переносит маркер внутрь строки — он двигается вместе с текстом, например при
            выравнивании по центру. По умолчанию маркер снаружи (<C>outside</C>).
          </>
        ),
        demo: { html: '<ul class="in"><li>По центру с маркером</li></ul>', css: ".in { list-style-position: inside; text-align: center; padding: 0; }", height: 60 },
      },
    ],
  },
  levels: [
    { kind: "choice", prompt: "Какое свойство убирает точки у списка?", options: ["list-style: none", "text-decoration: none", "display: none", "marker: off"], correct: 0, explain: "list-style: none убирает маркеры." },
    {
      kind: "write",
      prompt: "Убери маркеры у списка в карточке тарифа.",
      html: '<ul class="plan"><li>1 Website</li><li>50 GB SSD Storage</li></ul>',
      start: ".plan {\n  \n}",
      target: ".plan",
      expect: { "list-style-type": (v) => v === "none" },
      explain: ".plan { list-style: none; }",
    },
    {
      kind: "write",
      prompt: "Сделай маркеры квадратными.",
      html: '<ul class="f"><li>Unlimited Websites</li><li>Unlimited Domains</li></ul>',
      start: ".f {\n  \n}",
      target: ".f",
      expect: { "list-style-type": (v) => v === "square" },
      explain: ".f { list-style-type: square; }",
    },
    { kind: "choice", prompt: "Зачем после list-style: none часто пишут padding-left: 0?", options: ["Убрать отступ, который был для маркеров", "Чтобы вернуть точки", "Чтобы покрасить список", "Без этого не работает"], correct: 0, explain: "Слева у списка есть место под маркеры — без них оно лишнее." },
    {
      kind: "write",
      prompt: "Убери маркеры и отступ слева у меню.",
      html: '<ul class="menu"><li>Basic</li><li>Plus</li><li>Pro</li></ul>',
      start: ".menu {\n  \n}",
      target: ".menu",
      expect: { "list-style-type": (v) => v === "none", "padding-left": (v) => near(v, 0) },
      explain: ".menu { list-style: none; padding-left: 0; }",
    },
    {
      kind: "write",
      prompt: "Пронумеруй шаги римскими цифрами (I, II, III).",
      html: '<ol class="steps"><li>Выбрать тариф</li><li>Оплатить</li><li>Пользоваться</li></ol>',
      start: ".steps {\n  \n}",
      target: ".steps",
      expect: { "list-style-type": (v) => v === "upper-roman" },
      explain: ".steps { list-style-type: upper-roman; }",
    },
    { kind: "choice", prompt: "Что сделает list-style-position: inside?", options: ["Перенесёт маркер внутрь строки", "Спрячет маркер", "Сделает маркер больше", "Поставит маркер справа"], correct: 0, explain: "Маркер станет частью строки и будет двигаться с текстом." },
  ],
  cards: [
    { text: "list-style: none убирает маркеры списка.", answer: true, explain: "Да, так делают меню и карточки." },
    { text: "У ol маркеры по умолчанию — точки.", answer: false, explain: "Нет, у ol — цифры, точки у ul." },
    { text: "square делает маркеры квадратными.", answer: true, explain: "Да, а circle — кружками." },
    { text: "upper-roman даёт римские цифры.", answer: true, explain: "Да: I, II, III." },
    { text: "После list-style: none отступ слева исчезает сам.", answer: false, explain: "Нет, его убирают отдельно: padding-left: 0." },
    { text: "list-style меняет цвет текста.", answer: false, explain: "Нет, только маркеры." },
    { text: "Маркер с inside двигается вместе с текстом.", answer: true, explain: "Да, он внутри строки." },
    { text: "list-style пишут в CSS для ul или ol.", answer: true, explain: "Да, свойство задают списку." },
    { text: "decimal — это маркер-квадрат.", answer: false, explain: "Нет, decimal — обычные цифры." },
    { text: "Меню сайта часто делают списком без маркеров.", answer: true, explain: "Да, ссылки в ul с list-style: none." },
  ],
};

// ── Урок 13. Сайт обо мне 2.0: несколько страниц ──
const linksTo = (doc: Document, page: string) => Array.from(doc.querySelectorAll("a")).some((a) => (a.getAttribute("href") ?? "").trim() === page);

export const MULTI_PAGE: CssTopicData = {
  id: "multi-page",
  theory: {
    title: "Сайт из нескольких страниц",
    description: "«Сайт обо мне 2.0» — уже настоящий сайт: главная, «Обо мне», «Хобби». Разберём, как связать страницы меню и общим стилем.",
    parts: [
      {
        title: "Каждая страница — свой файл",
        text: (
          <>
            Главная — <C>index.html</C>, страница о себе — <C>about.html</C>, хобби — <C>hobbies.html</C>. Все файлы лежат в
            одной папке, а ссылка на другую страницу — это просто имя файла: <C>&lt;a href="about.html"&gt;</C>.
          </>
        ),
        code: "сайт/\n  index.html     ← главная\n  about.html     ← обо мне\n  hobbies.html   ← хобби\n  style.css      ← один общий стиль",
      },
      {
        title: "Меню повторяется на каждой странице",
        text: (
          <>
            Чтобы с любой страницы можно было перейти на любую другую, одно и то же меню вставляют в шапку каждой страницы.
            Меню — это ссылки внутри <C>&lt;nav&gt;</C>.
          </>
        ),
        demo: {
          html: '<header class="head"><b>Пиксель</b><nav><a href="index.html">Главная</a> <a href="about.html">Обо мне</a> <a href="hobbies.html">Хобби</a></nav></header>',
          css: ".head { display: flex; justify-content: space-between; background: #f4f2e8; padding: 8px; }\nnav a { margin-left: 12px; text-decoration: none; }",
          height: 70,
        },
      },
      {
        title: "Один style.css на все страницы",
        text: (
          <>
            В <C>head</C> каждой страницы подключают один и тот же файл: <C>&lt;link rel="stylesheet" href="style.css"&gt;</C>.
            Поменяешь цвет в style.css — он поменяется на всех страницах сразу.
          </>
        ),
        code: '<head>\n  <meta charset="utf-8">\n  <title>Обо мне</title>\n  <link rel="stylesheet" href="style.css">\n</head>',
      },
    ],
  },
  levels: [
    { kind: "choice", prompt: "Как сослаться на страницу about.html, которая лежит рядом?", options: ['<a href="about.html">', '<a src="about.html">', '<link href="about.html">', '<page>about.html</page>'], correct: 0, explain: "Ссылка на страницу — тег a с href и именем файла." },
    { kind: "choice", prompt: "Как обычно называют главную страницу сайта?", options: ["index.html", "main.html", "home.css", "first.html"], correct: 0, explain: "index.html браузер и хостинг открывают первой." },
    {
      kind: "html",
      prompt: "Сделай меню nav со ссылками на три страницы: index.html, about.html и hobbies.html.",
      start: "<header>\n  <nav>\n\n  </nav>\n</header>",
      check: (doc) => {
        if (!doc.querySelector("nav")) return "Нужен тег nav.";
        const miss = ["index.html", "about.html", "hobbies.html"].filter((p) => !linksTo(doc, p));
        if (miss.length) return `Не хватает ссылки на ${miss.join(", ")}.`;
        return Array.from(doc.querySelectorAll("nav a")).every((a) => a.textContent!.trim()) ? null : "У каждой ссылки нужен текст.";
      },
      explain: '<nav><a href="index.html">Главная</a> <a href="about.html">Обо мне</a> <a href="hobbies.html">Хобби</a></nav>',
    },
    {
      kind: "html",
      prompt: "Подключи общий файл style.css в head этой страницы.",
      start: "<head>\n  <meta charset=\"utf-8\">\n  <title>Хобби</title>\n\n</head>",
      check: (_doc, code) =>
        /<link[^>]*rel\s*=\s*["']stylesheet["'][^>]*href\s*=\s*["']style\.css["']|<link[^>]*href\s*=\s*["']style\.css["'][^>]*rel\s*=\s*["']stylesheet["']/i.test(code)
          ? code.search(/<link/i) < code.search(/<\/head>/i)
            ? null
            : "link должен быть внутри head."
          : 'Нужен <link rel="stylesheet" href="style.css">.',
      explain: '<link rel="stylesheet" href="style.css"> — в head каждой страницы.',
    },
    { kind: "choice", prompt: "Зачем повторять одно и то же меню на каждой странице?", options: ["Чтобы с любой страницы перейти на любую другую", "Так требует браузер", "Чтобы страницы грузились быстрее", "Не нужно, хватит на главной"], correct: 0, explain: "Иначе со страницы «Хобби» нельзя будет вернуться назад." },
    {
      kind: "write",
      prompt: "Убери подчёркивание у ссылок меню и раздели их отступом слева 16px.",
      html: '<nav class="head-menu"><a href="index.html">Главная</a><a href="about.html">Обо мне</a><a href="hobbies.html">Хобби</a></nav>',
      start: ".head-menu a {\n  \n}",
      target: ".head-menu a",
      expect: { "text-decoration-line": (v) => v === "none", "margin-left": (v) => near(v, 16) },
      explain: ".head-menu a { text-decoration: none; margin-left: 16px; }",
    },
    { kind: "choice", prompt: "Цвет фона поменяли в style.css. Где он изменится?", options: ["На всех страницах, где подключён style.css", "Только на главной", "Только на странице, которая открыта", "Нигде, нужно менять в HTML"], correct: 0, explain: "Один общий стиль — изменения сразу на всех страницах." },
  ],
  cards: [
    { text: "Каждая страница сайта — отдельный HTML-файл.", answer: true, explain: "Да: index.html, about.html, hobbies.html." },
    { text: "Ссылку на другую страницу делают тегом a с атрибутом href.", answer: true, explain: "Да: <a href=\"about.html\">Обо мне</a>." },
    { text: "Главную страницу обычно называют index.html.", answer: true, explain: "Да, её открывают первой." },
    { text: "Меню достаточно сделать только на главной странице.", answer: false, explain: "Нет, иначе с других страниц нельзя будет никуда перейти." },
    { text: "Одним style.css можно оформить все страницы сайта.", answer: true, explain: "Да, его подключают в head каждой страницы." },
    { text: "Файл style.css подключают тегом img.", answer: false, explain: "Нет, тегом link: <link rel=\"stylesheet\" href=\"style.css\">." },
    { text: "Меню обычно кладут в тег nav.", answer: true, explain: "Да, nav — блок навигации." },
    { text: "Если about.html лежит в той же папке, в href пишут просто about.html.", answer: true, explain: "Да, путь — имя файла." },
    { text: "Изменение в style.css видно только на одной странице.", answer: false, explain: "Нет, на всех, где он подключён." },
    { text: "Тег link с style.css пишут в body.", answer: false, explain: "Нет, в head." },
  ],
};
