import { centered, Code, near, shareOfParent, type CssTopicData } from "../CssTopic";

const C = Code;
const has = (code: string, re: RegExp) => re.test(code.replace(/\/\*[\s\S]*?\*\//g, ""));

// ── Урок 1. Сайт про себя: ширина, высота и центрирование ──
export const CSS_SIZES: CssTopicData = {
  id: "css-sizes",
  theory: {
    title: "Ширина, высота и центр страницы",
    description: "Как задать размер блока в пикселях и процентах и поставить страницу по центру — как в проекте «Сайт про себя».",
    parts: [
      {
        title: "width и height в пикселях",
        text: (
          <>
            <C>width</C> — ширина, <C>height</C> — высота. <C>px</C> — пиксели, точки экрана: <C>width: 300px</C> всегда будет
            одинаковой ширины, на любом экране.
          </>
        ),
        demo: { html: '<div class="box">300 × 80 пикселей</div>', css: ".box { width: 300px; height: 80px; background: #c7d2fe; }", height: 120 },
      },
      {
        title: "Проценты: часть от родителя",
        text: (
          <>
            <C>%</C> считается от ширины родителя — блока, внутри которого лежит элемент. <C>width: 50%</C> — половина. Если
            окно станет уже, блок тоже сузится. Так удобно делать картинки и текст, которые подстраиваются под экран.
          </>
        ),
        demo: { html: '<div class="half">50% ширины</div><div class="full">100% ширины</div>', css: ".half { width: 50%; background: #fde68a; }\n.full { width: 100%; background: #a7f3d0; }", height: 110 },
      },
      {
        title: "Страница по центру: margin: 0 auto",
        text: (
          <>
            Чтобы колонка текста стояла посередине, ей задают ширину и <C>margin: 0 auto</C>: 0 — отступ сверху и снизу,{" "}
            <C>auto</C> — браузер сам поровну делит свободное место слева и справа. Без ширины центрировать нечего — блок и так
            во всю ширину.
          </>
        ),
        demo: { html: '<div class="page">Я по центру</div>', css: ".page { width: 60%; margin: 0 auto; background: #fbcfe8; text-align: center; }", height: 90 },
      },
    ],
  },
  levels: [
    { kind: "choice", prompt: "Какое свойство задаёт ширину блока?", options: ["width", "height", "size", "length"], correct: 0, explain: "width — ширина, height — высота." },
    {
      kind: "write",
      prompt: "Сделай блок .box шириной 200 пикселей.",
      html: '<div class="box">Блок</div>',
      css: ".box { background: #c7d2fe; }",
      start: ".box {\n  \n}",
      target: ".box",
      expect: { width: (v) => near(v, 200) },
      explain: ".box { width: 200px; }",
    },
    {
      kind: "write",
      prompt: "Сделай блок .box высотой 120 пикселей.",
      html: '<div class="box">Блок</div>',
      css: ".box { background: #fde68a; }",
      start: ".box {\n  \n}",
      target: ".box",
      expect: { height: (v) => near(v, 120) },
      explain: ".box { height: 120px; }",
    },
    { kind: "choice", prompt: "От чего считается width: 50%?", options: ["От ширины родителя", "От ширины экрана компьютера", "От 100 пикселей", "От высоты блока"], correct: 0, explain: "Проценты — это часть ширины блока-родителя." },
    {
      kind: "write",
      prompt: "Пусть картинка-блок .photo занимает половину ширины страницы — в процентах.",
      html: '<div class="photo">Фото</div>',
      css: ".photo { background: #a7f3d0; height: 60px; }",
      start: ".photo {\n  \n}",
      target: ".photo",
      expect: { width: (_v, el) => Math.abs(shareOfParent(el) - 0.5) < 0.02 },
      rule: (code) => has(code, /width\s*:\s*50%/),
      ruleHint: "задай ширину в процентах: 50%.",
      explain: ".photo { width: 50%; } — половина ширины родителя.",
    },
    {
      kind: "write",
      prompt: "Поставь колонку .page шириной 70% по центру страницы.",
      html: '<div class="page">Текст сайта про себя</div>',
      css: ".page { background: #fbcfe8; }",
      start: ".page {\n  width: 70%;\n  \n}",
      target: ".page",
      expect: {
        "margin-left": (_v, el) => centered(el, 5),
      },
      explain: ".page { width: 70%; margin: 0 auto; } — auto делит свободное место поровну.",
    },
    { kind: "choice", prompt: "Почему margin: 0 auto не центрирует блок без ширины?", options: ["Блок и так во всю ширину — свободного места нет", "auto работает только с картинками", "Нужно писать center", "Нужно два раза auto"], correct: 0, explain: "Без width блок растягивается на всю строку, и делить нечего." },
    {
      kind: "write",
      prompt: "Сделай страницу как в проекте: body фиксированной ширины и по центру. В проекте было 800px, а окошко здесь маленькое — возьми 250px.",
      html: "<h1>Сайт обо мне</h1><p>Привет! Меня зовут Пиксель.</p>",
      start: "body {\n  \n}",
      target: "body",
      height: 140,
      expect: {
        width: (v) => near(v, 250),
        "margin-left": (_v, el) => centered(el),
      },
      explain: "body { width: 250px; margin: 0 auto; } — в проекте так же, только 800px.",
    },
  ],
  cards: [
    { text: "width задаёт высоту блока.", answer: false, explain: "Нет, width — ширина, высоту задаёт height." },
    { text: "px — это пиксели, точки экрана.", answer: true, explain: "Да, 300px — всегда 300 точек." },
    { text: "width: 50% — это половина ширины родителя.", answer: true, explain: "Да, проценты считаются от родителя." },
    { text: "Блок с width в процентах подстраивается под ширину окна.", answer: true, explain: "Да, окно уже — блок тоже уже." },
    { text: "margin: 0 auto ставит блок по центру по вертикали.", answer: false, explain: "Нет, по горизонтали: auto делит место слева и справа." },
    { text: "Чтобы margin: 0 auto сработал, блоку нужна ширина.", answer: true, explain: "Да, иначе он во всю строку и центрировать нечего." },
    { text: "height: 100px и width: 100px дают квадрат.", answer: true, explain: "Да, ширина и высота одинаковые." },
    { text: "Ширину можно задать только в пикселях.", answer: false, explain: "Нет, ещё в процентах и других единицах." },
    { text: "В margin: 0 auto ноль — отступ сверху и снизу.", answer: true, explain: "Да, первое значение — верх и низ, второе — лево и право." },
    { text: "width: 120% сделает блок шире родителя.", answer: true, explain: "Да, больше 100% — шире родителя, блок вылезет за край." },
  ],
};

// ── Урок 3. Музеи мира: подчёркивание ссылок ──
export const TEXT_DECORATION: CssTopicData = {
  id: "text-decoration",
  theory: {
    title: "Подчёркивание: text-decoration",
    description: "Ссылки в браузере подчёркнуты. В проекте «Музеи мира» мы перекрашивали эту линию — разберём, как управлять ею.",
    parts: [
      {
        title: "Цвет линии: text-decoration-color",
        text: (
          <>
            Ссылки подчёркнуты сами. Цвет текста меняет <C>color</C>, а цвет линии — <C>text-decoration-color</C>. Так ссылку
            делают аккуратной: текст тёмный, а линия яркая.
          </>
        ),
        demo: { html: '<a href="#">Музей современного искусства</a>', css: "a { color: #231900; text-decoration-color: #FFCC00; }", height: 70 },
      },
      {
        title: "Вид линии: text-decoration-style",
        text: (
          <>
            Линия бывает разной: <C>solid</C> — сплошная, <C>double</C> — двойная, <C>dotted</C> — точками, <C>dashed</C> —
            чёрточками, <C>wavy</C> — волной.
          </>
        ),
        demo: { html: '<a href="#">double</a> · <a class="w" href="#">wavy</a> · <a class="d" href="#">dotted</a>', css: "a { text-decoration-style: double; }\n.w { text-decoration-style: wavy; }\n.d { text-decoration-style: dotted; }", height: 70 },
      },
      {
        title: "Убрать линию: text-decoration: none",
        text: (
          <>
            <C>text-decoration: none</C> убирает подчёркивание — так делают меню. А <C>underline</C> наоборот подчёркивает
            любой текст. Короткая запись сразу задаёт всё: <C>text-decoration: underline wavy red</C>.
          </>
        ),
        demo: { html: '<a href="#">Меню без линии</a><p class="u">Обычный текст с линией</p>', css: "a { text-decoration: none; }\n.u { text-decoration: underline wavy red; }", height: 90 },
      },
    ],
  },
  levels: [
    { kind: "choice", prompt: "Какое свойство меняет цвет линии под ссылкой, не меняя цвет текста?", options: ["text-decoration-color", "color", "border-color", "line-color"], correct: 0, explain: "text-decoration-color — цвет именно линии." },
    {
      kind: "write",
      prompt: "Сделай линию под ссылкой жёлтой: #FFCC00.",
      html: '<a href="#">Музей Соумая</a>',
      start: "a {\n  \n}",
      target: "a",
      expect: { "text-decoration-color": (v) => v.replace(/\s/g, "") === "rgb(255,204,0)" },
      explain: "a { text-decoration-color: #FFCC00; }",
    },
    { kind: "choice", prompt: "Какое значение делает линию волнистой?", options: ["wavy", "wave", "curly", "zigzag"], correct: 0, explain: "wavy — волна. Ещё есть solid, double, dotted, dashed." },
    {
      kind: "write",
      prompt: "Сделай подчёркивание у ссылки двойным — как в проекте «Список рецептов».",
      html: '<a href="#">Блинчики</a>',
      start: "a {\n  \n}",
      target: "a",
      expect: { "text-decoration-style": (v) => v === "double" },
      explain: "a { text-decoration-style: double; }",
    },
    {
      kind: "write",
      prompt: "Убери подчёркивание у ссылок меню.",
      html: '<nav><a href="#">Главная</a> <a href="#">Обо мне</a></nav>',
      start: "a {\n  \n}",
      target: "a",
      expect: { "text-decoration-line": (v) => v === "none" },
      explain: "a { text-decoration: none; }",
    },
    { kind: "choice", prompt: "Что сделает text-decoration: underline с обычным абзацем?", options: ["Подчеркнёт его", "Ничего — работает только у ссылок", "Сделает жирным", "Уберёт абзац"], correct: 0, explain: "Подчеркнуть можно любой текст, не только ссылки." },
    {
      kind: "write",
      prompt: "Подчеркни заголовок h2 волнистой красной линией.",
      html: "<h2>Музей Ордос</h2>",
      start: "h2 {\n  \n}",
      target: "h2",
      expect: {
        "text-decoration-line": (v) => v.includes("underline"),
        "text-decoration-style": (v) => v === "wavy",
        "text-decoration-color": (v) => v.replace(/\s/g, "") === "rgb(255,0,0)",
      },
      explain: "h2 { text-decoration: underline wavy red; } — или три отдельных свойства.",
    },
    { kind: "choice", prompt: "Чем color отличается от text-decoration-color у ссылки?", options: ["color красит буквы, text-decoration-color — линию", "Ничем", "color красит фон", "text-decoration-color красит рамку"], correct: 0, explain: "Буквы и линия красятся отдельно." },
  ],
  cards: [
    { text: "Ссылки в браузере подчёркнуты по умолчанию.", answer: true, explain: "Да, так их легко заметить." },
    { text: "text-decoration-color меняет цвет букв.", answer: false, explain: "Нет, только цвет линии. Буквы красит color." },
    { text: "text-decoration: none убирает подчёркивание.", answer: true, explain: "Да, так обычно оформляют меню." },
    { text: "wavy рисует линию волной.", answer: true, explain: "Да. Ещё бывают double, dotted, dashed." },
    { text: "Подчеркнуть можно только ссылку.", answer: false, explain: "Нет, любой текст: text-decoration: underline." },
    { text: "double — линия точками.", answer: false, explain: "Нет, двойная. Точками — dotted." },
    { text: "Короткая запись text-decoration может задать линию, вид и цвет сразу.", answer: true, explain: "Да: text-decoration: underline wavy red." },
    { text: "Чтобы сменить цвет линии, нужно убрать подчёркивание.", answer: false, explain: "Нет, линию можно просто перекрасить." },
    { text: "dashed рисует линию чёрточками.", answer: true, explain: "Да, а dotted — точками." },
    { text: "text-decoration пишут в HTML-теге.", answer: false, explain: "Нет, это CSS-свойство, его пишут в style.css." },
  ],
};

// ── Урок 5. Урон оружия CS:GO: курсив ──
export const FONT_STYLE: CssTopicData = {
  id: "font-style",
  theory: {
    title: "Курсив: font-style",
    description: "Наклонный текст выделяет подписи и описания. В таблице урона оружия так оформляли пояснения.",
    parts: [
      {
        title: "font-style: italic",
        text: (
          <>
            <C>font-style: italic</C> делает текст наклонным — курсивом. Им выделяют цитаты, подписи, пояснения.{" "}
            <C>font-style: normal</C> возвращает прямой текст.
          </>
        ),
        demo: { html: '<p>Обычный текст</p><p class="i">Курсив для пояснения</p>', css: ".i { font-style: italic; }", height: 90 },
      },
      {
        title: "Курсив и жирность — разные свойства",
        text: (
          <>
            Наклон задаёт <C>font-style</C>, а толщину — <C>font-weight</C>. Их можно сочетать: жирный курсив. В HTML курсив
            иногда даёт тег <C>&lt;i&gt;</C> или <C>&lt;em&gt;</C> — но внешний вид лучше задавать в CSS.
          </>
        ),
        demo: { html: '<p class="b">Жирный курсив</p><p><em>em — тоже курсив</em></p>', css: ".b { font-style: italic; font-weight: bold; }", height: 90 },
      },
      {
        title: "Снять курсив",
        text: (
          <>
            Некоторые теги наклонные сами, например <C>&lt;em&gt;</C>. Если наклон не нужен, его убирают: <C>font-style:
            normal</C>.
          </>
        ),
        demo: { html: "<p><em>Без наклона</em></p>", css: "em { font-style: normal; }", height: 60 },
      },
    ],
  },
  levels: [
    { kind: "choice", prompt: "Какое значение делает текст курсивом?", options: ["font-style: italic", "font-weight: italic", "text-style: italic", "font: slant"], correct: 0, explain: "Наклон — font-style: italic." },
    {
      kind: "write",
      prompt: "Сделай пояснение .note курсивом.",
      html: '<p class="note">Урон указан для выстрела в голову</p>',
      start: ".note {\n  \n}",
      target: ".note",
      expect: { "font-style": (v) => v === "italic" },
      explain: ".note { font-style: italic; }",
    },
    { kind: "choice", prompt: "Какое свойство отвечает за жирность?", options: ["font-weight", "font-style", "font-size", "text-weight"], correct: 0, explain: "Толщина — font-weight, наклон — font-style." },
    {
      kind: "write",
      prompt: "Сделай подпись .caption жирным курсивом.",
      html: '<p class="caption">AK-47</p>',
      start: ".caption {\n  \n}",
      target: ".caption",
      expect: { "font-style": (v) => v === "italic", "font-weight": (v) => Number(v) >= 600 },
      explain: ".caption { font-style: italic; font-weight: bold; }",
    },
    {
      kind: "write",
      prompt: "Тег em наклоняет текст сам. Сделай его прямым.",
      html: "<p>Важно: <em>не наклоняй меня</em></p>",
      start: "em {\n  \n}",
      target: "em",
      expect: { "font-style": (v) => v === "normal" },
      explain: "em { font-style: normal; }",
    },
    { kind: "choice", prompt: "Где чаще всего уместен курсив?", options: ["В подписях и пояснениях", "Во всём тексте сайта", "В кнопках меню", "Только в заголовках h1"], correct: 0, explain: "Курсив выделяет небольшие кусочки — подписи, цитаты." },
  ],
  cards: [
    { text: "font-style: italic делает текст наклонным.", answer: true, explain: "Да, это курсив." },
    { text: "font-weight: italic — правильная запись курсива.", answer: false, explain: "Нет, курсив задаёт font-style." },
    { text: "Курсив и жирность можно сочетать.", answer: true, explain: "Да: font-style: italic и font-weight: bold." },
    { text: "Тег em обычно показывается курсивом.", answer: true, explain: "Да, браузер наклоняет его сам." },
    { text: "font-style: normal убирает наклон.", answer: true, explain: "Да, текст становится прямым." },
    { text: "Курсивом удобно выделять весь текст страницы.", answer: false, explain: "Нет, длинный курсив трудно читать — им выделяют кусочки." },
    { text: "Курсив меняет размер букв.", answer: false, explain: "Нет, только наклон. Размер — font-size." },
    { text: "font-style пишут в CSS.", answer: true, explain: "Да, как и другие свойства оформления." },
    { text: "italic — это толщина шрифта.", answer: false, explain: "Нет, наклон. Толщина — font-weight." },
    { text: "Подписи в таблице можно сделать курсивом.", answer: true, explain: "Да, так их отличают от основного текста." },
  ],
};
