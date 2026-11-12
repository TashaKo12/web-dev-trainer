import { Code, near, type CssTopicData } from "../CssTopic";

const C = Code;
const has = (code: string, re: RegExp) => re.test(code.replace(/\/\*[\s\S]*?\*\//g, ""));

// ── Урок 5. Урон оружия CS:GO: закреплённый блок ──
export const POSITION_FIXED: CssTopicData = {
  id: "position-fixed",
  theory: {
    title: "Закреплённый блок: position: fixed",
    description: "В таблице урона оружия подвал всегда оставался внизу экрана, даже при прокрутке. Это делает position: fixed.",
    parts: [
      {
        title: "Приклеить к экрану",
        text: (
          <>
            <C>position: fixed</C> приклеивает элемент к окну браузера: страница прокручивается, а он стоит на месте. Где
            именно стоять, говорят <C>top</C>, <C>bottom</C>, <C>left</C>, <C>right</C> — расстояние от краёв окна.
          </>
        ),
        demo: {
          html: '<div class="bar">Я внизу всегда</div><p>Прокрути меня…</p><p style="height:400px">Длинный текст</p>',
          css: ".bar { position: fixed; bottom: 0; left: 0; width: 100%; background: #6366f1; color: white; padding: 8px; }",
          height: 160,
        },
      },
      {
        title: "Шапка сверху",
        text: (
          <>
            Так же делают шапку, которая не уезжает: <C>position: fixed; top: 0;</C>. Ширину обычно ставят <C>100%</C>, иначе
            закреплённый блок будет шириной по тексту.
          </>
        ),
        demo: { html: '<header class="top">Шапка</header><p style="margin-top:50px;height:400px">Текст страницы</p>', css: ".top { position: fixed; top: 0; left: 0; width: 100%; background: #10b981; color: white; padding: 8px; }", height: 140 },
      },
      {
        title: "Закреплённый блок может закрыть текст",
        text: (
          <>
            Закреплённый элемент «висит» поверх страницы и может закрыть последние строки. Поэтому внизу страницы оставляют
            место: например, <C>margin-bottom</C> у основного блока, равный высоте подвала.
          </>
        ),
      },
    ],
  },
  levels: [
    { kind: "choice", prompt: "Какое значение position приклеивает элемент к окну браузера?", options: ["fixed", "static", "sticky-top", "glue"], correct: 0, explain: "position: fixed — элемент не уезжает при прокрутке." },
    { kind: "choice", prompt: "Что задаёт bottom: 0 у закреплённого блока?", options: ["Прижать к нижнему краю окна", "Убрать нижний отступ", "Сделать блок нижним слоем", "Высоту 0"], correct: 0, explain: "bottom — расстояние от нижнего края окна." },
    {
      kind: "write",
      prompt: "Закрепи подвал .footer внизу окна, у левого края.",
      html: '<p>Таблица урона</p><div class="footer">Данные из игры CS:GO</div>',
      css: ".footer { background: #f59e0b; padding: 6px; }",
      start: ".footer {\n  \n}",
      target: ".footer",
      expect: { position: (v) => v === "fixed", bottom: (v) => near(v, 0), left: (v) => near(v, 0) },
      explain: ".footer { position: fixed; bottom: 0; left: 0; }",
    },
    {
      kind: "write",
      prompt: "Закрепи шапку .top наверху окна и растяни её на всю ширину.",
      html: '<div class="top">Урон оружия</div><p style="margin-top:40px">Текст</p>',
      css: ".top { background: #10b981; color: white; padding: 6px; }",
      start: ".top {\n  \n}",
      target: ".top",
      expect: { position: (v) => v === "fixed", top: (v) => near(v, 0), width: (v, el) => near(v, el.ownerDocument.documentElement.clientWidth, 2) },
      rule: (code) => has(code, /left\s*:\s*0/),
      ruleHint: "добавь left: 0, чтобы шапка начиналась от левого края.",
      explain: ".top { position: fixed; top: 0; left: 0; width: 100%; }",
    },
    { kind: "choice", prompt: "Почему у закреплённого блока часто пишут width: 100%?", options: ["Иначе он будет шириной по тексту", "Иначе он не закрепится", "Это нужно для цвета", "Без этого исчезнет при прокрутке"], correct: 0, explain: "Закреплённый блок сжимается по содержимому, поэтому ширину задают явно." },
    { kind: "choice", prompt: "Подвал закреплён внизу и закрыл последний абзац. Что поможет?", options: ["Добавить внизу страницы отступ на высоту подвала", "Убрать position", "Сделать подвал жирным", "Добавить top: 0"], correct: 0, explain: "Отступ снизу оставляет место, и текст не прячется под подвалом." },
  ],
  cards: [
    { text: "position: fixed оставляет элемент на месте при прокрутке.", answer: true, explain: "Да, он приклеен к окну." },
    { text: "bottom: 0 прижимает элемент к верху окна.", answer: false, explain: "Нет, к низу. К верху — top: 0." },
    { text: "Закреплённый блок может закрыть часть текста.", answer: true, explain: "Да, он висит поверх страницы." },
    { text: "left: 0 прижимает блок к левому краю окна.", answer: true, explain: "Да, это расстояние от левого края." },
    { text: "position: fixed работает только у картинок.", answer: false, explain: "Нет, у любого элемента." },
    { text: "Шапку, которая не уезжает, делают через position: fixed и top: 0.", answer: true, explain: "Да, так её прижимают к верху." },
    { text: "Без width: 100% закреплённый блок всегда во всю ширину.", answer: false, explain: "Нет, он сжимается по содержимому." },
    { text: "top, bottom, left, right — расстояния от краёв окна.", answer: true, explain: "Да, у закреплённого блока — от краёв окна браузера." },
    { text: "position пишут в HTML.", answer: false, explain: "Нет, это CSS-свойство." },
    { text: "Закреплённый подвал виден на любом месте прокрутки.", answer: true, explain: "Да, в этом его смысл." },
  ],
};

// ── Урок 6. Форма регистрации: единицы em, rem, vh ──
export const CSS_UNITS: CssTopicData = {
  id: "css-units",
  theory: {
    title: "Единицы: em, rem и vh",
    description: "Кроме px и % есть единицы, которые подстраиваются под шрифт и экран. В форме регистрации ими задавали размеры.",
    parts: [
      {
        title: "rem — от шрифта всей страницы",
        text: (
          <>
            <C>1rem</C> — размер шрифта страницы, обычно 16 пикселей. <C>2rem</C> — 32px, <C>0.5rem</C> — 8px. Удобно: если
            человек увеличит шрифт в браузере, всё на сайте увеличится вместе с ним.
          </>
        ),
        demo: { html: '<p class="a">1rem</p><p class="b">2rem</p>', css: ".a { font-size: 1rem; }\n.b { font-size: 2rem; }", height: 100 },
      },
      {
        title: "em — от шрифта родителя",
        text: (
          <>
            <C>1em</C> — размер шрифта самого элемента (он берётся от родителя). Если у блока 20px, то <C>2em</C> внутри — 40px.
            Удобно, когда всё внутри блока должно расти вместе с ним.
          </>
        ),
        demo: { html: '<div class="card">Карточка <b class="big">2em</b></div>', css: ".card { font-size: 20px; }\n.big { font-size: 2em; }", height: 80 },
      },
      {
        title: "vh и vw — от размера окна",
        text: (
          <>
            <C>1vh</C> — 1% высоты окна браузера, <C>1vw</C> — 1% ширины. <C>height: 100vh</C> — блок ровно на всю высоту
            экрана: так делают заставку или форму по центру экрана.
          </>
        ),
        demo: { html: '<div class="screen">100vh — во весь экран</div>', css: "body { margin: 0; }\n.screen { height: 100vh; background: #c7d2fe; }", height: 120 },
      },
    ],
  },
  levels: [
    { kind: "choice", prompt: "Чему обычно равен 1rem?", options: ["16 пикселям", "1 пикселю", "100 пикселям", "1% экрана"], correct: 0, explain: "1rem — размер шрифта страницы, по умолчанию 16px." },
    {
      kind: "write",
      prompt: "Сделай заголовок h1 размером 2rem.",
      html: "<h1>Регистрация</h1>",
      start: "h1 {\n  \n}",
      target: "h1",
      expect: { "font-size": (v) => near(v, 32) },
      rule: (code) => has(code, /\d\s*rem/),
      ruleHint: "задай размер в rem.",
      explain: "h1 { font-size: 2rem; } — 2 × 16 = 32 пикселя.",
    },
    { kind: "choice", prompt: "У блока font-size: 20px. Какой размер будет у текста внутри с font-size: 1.5em?", options: ["30px", "20px", "24px", "15px"], correct: 0, explain: "em считается от шрифта родителя: 1.5 × 20 = 30." },
    {
      kind: "write",
      prompt: "В карточке шрифт 20px. Сделай кнопку .btn вдвое крупнее — в em.",
      html: '<div class="card">Форма <span class="btn">Отправить</span></div>',
      css: ".card { font-size: 20px; }",
      start: ".btn {\n  \n}",
      target: ".btn",
      expect: { "font-size": (v) => near(v, 40) },
      rule: (code) => has(code, /\d\s*em\b/),
      ruleHint: "задай размер в em.",
      explain: ".btn { font-size: 2em; } — 2 × 20 = 40 пикселей.",
    },
    { kind: "choice", prompt: "Что значит height: 100vh?", options: ["Высота на весь экран", "Высота 100 пикселей", "Высота как у родителя", "Высота 100 строк"], correct: 0, explain: "vh — проценты высоты окна. 100vh — вся высота." },
    {
      kind: "write",
      prompt: "Растяни блок .screen на всю высоту окна.",
      html: '<div class="screen">Форма регистрации</div>',
      css: "body { margin: 0; } .screen { background: #c7d2fe; }",
      start: ".screen {\n  \n}",
      target: ".screen",
      height: 160,
      expect: { height: (v, el) => near(v, el.ownerDocument.defaultView!.innerHeight, 2) },
      rule: (code) => has(code, /100\s*vh/),
      ruleHint: "задай высоту в vh.",
      explain: ".screen { height: 100vh; }",
    },
    { kind: "choice", prompt: "Чем rem удобнее px для размера шрифта?", options: ["Растёт, если человек увеличит шрифт в браузере", "Всегда меньше", "Работает только в формах", "Ничем"], correct: 0, explain: "rem привязан к настройке шрифта, px — нет." },
    {
      kind: "write",
      prompt: "Сделай отступ внутри поля .field равным 1rem.",
      html: '<div class="field">Электронная почта</div>',
      css: ".field { border: 2px solid #94a3b8; }",
      start: ".field {\n  \n}",
      target: ".field",
      expect: { "padding-top": (v) => near(v, 16), "padding-left": (v) => near(v, 16) },
      rule: (code) => has(code, /padding[^;]*rem/),
      ruleHint: "задай padding в rem.",
      explain: ".field { padding: 1rem; } — 16 пикселей со всех сторон.",
    },
  ],
  cards: [
    { text: "1rem обычно равен 16 пикселям.", answer: true, explain: "Да, это размер шрифта страницы по умолчанию." },
    { text: "em считается от шрифта родителя.", answer: true, explain: "Да, поэтому em растёт вместе с блоком." },
    { text: "100vh — это 100 пикселей.", answer: false, explain: "Нет, вся высота окна браузера." },
    { text: "1vw — один процент ширины окна.", answer: true, explain: "Да, vw — от ширины, vh — от высоты." },
    { text: "2rem — это 32 пикселя при обычной настройке.", answer: true, explain: "Да: 2 × 16." },
    { text: "Если у родителя 10px, то 3em внутри — 30px.", answer: true, explain: "Да: 3 × 10." },
    { text: "rem и em — одно и то же.", answer: false, explain: "Нет: rem — от шрифта страницы, em — от родителя." },
    { text: "Размер в rem растёт, если человек увеличит шрифт в браузере.", answer: true, explain: "Да, поэтому rem удобен для текста." },
    { text: "vh можно использовать только для шрифтов.", answer: false, explain: "Нет, для любых размеров — чаще всего для высоты." },
    { text: "padding можно задать в rem.", answer: true, explain: "Да, в любых единицах." },
  ],
};

// ── Урок 7. Лучший дизайн: палитра и шрифты ──
export const DESIGN_PALETTE: CssTopicData = {
  id: "design-palette",
  theory: {
    title: "Палитра и шрифты: как сделать красиво",
    description: "В проекте «Лучший дизайн» мы подбирали цвета и шрифты. Разберём, как выбрать палитру, чтобы сайт читался и выглядел цельно.",
    parts: [
      {
        title: "Палитра: 3–4 цвета",
        text: (
          <>
            Красивый сайт обходится немногими цветами: <b>фон</b>, <b>основной текст</b> и <b>акцент</b> для заголовков и
            кнопок. Цвета записывают кодом <C>#EAE7DC</C>. Готовые палитры удобно брать на сайтах вроде colorhunt.co и
            копировать коды.
          </>
        ),
        demo: { html: "<h1>Даша-путешественница</h1><p>Спокойный фон, тёмный текст и один яркий акцент.</p>", css: "body { background-color: #EAE7DC; color: #222222; }\nh1 { color: #E85A4F; }", height: 120 },
      },
      {
        title: "Контраст — чтобы было видно",
        text: (
          <>
            Текст должен заметно отличаться от фона: тёмный на светлом или светлый на тёмном. Серый на сером или жёлтый на белом
            читать трудно — особенно с телефона на солнце.
          </>
        ),
        demo: { html: '<p class="bad">Плохо: светло-серый на белом</p><p class="good">Хорошо: тёмный на светлом</p>', css: ".bad { color: #d4d4d4; background: #fff; }\n.good { color: #1f2937; background: #f8fafc; }", height: 90 },
      },
      {
        title: "Два шрифта: для заголовков и для текста",
        text: (
          <>
            Берут не больше двух шрифтов: выразительный — для заголовков, простой и спокойный — для длинного текста. Подключают их
            с Google Fonts через <C>@import</C> в начале style.css, а потом пишут в <C>font-family</C>.
          </>
        ),
        demo: { html: "<h2>Заголовок</h2><p>Обычный текст, который легко читать.</p>", css: "h2 { font-family: Georgia, serif; color: #E85A4F; }\np { font-family: Arial, sans-serif; }", height: 100 },
      },
    ],
  },
  levels: [
    { kind: "choice", prompt: "Сколько цветов обычно хватает для аккуратного сайта?", options: ["3–4: фон, текст, акцент", "Чем больше, тем лучше — 10+", "Только один", "Ровно 7, как в радуге"], correct: 0, explain: "Немного цветов делают сайт цельным." },
    {
      kind: "choice",
      prompt: "Какой вариант читается лучше всего?",
      demo: { html: '<p class="a">Вариант 1</p><p class="b">Вариант 2</p><p class="c">Вариант 3</p>', css: ".a{color:#fde047;background:#fff}.b{color:#1e293b;background:#f1f5f9}.c{color:#94a3b8;background:#cbd5e1}", height: 120 },
      options: ["Вариант 1", "Вариант 2", "Вариант 3", "Все одинаково"],
      correct: 1,
      explain: "Тёмный текст на светлом фоне — высокий контраст.",
    },
    {
      kind: "write",
      prompt: "Покрась фон страницы в #EAE7DC, а заголовки h1 — в акцентный #E85A4F.",
      html: "<h1>Даша-путешественница</h1><p>Мультсериал о путешествиях.</p>",
      start: "body {\n  \n}\n\nh1 {\n  \n}",
      target: "h1",
      height: 120,
      expect: {
        color: (v) => v.replace(/\s/g, "") === "rgb(232,90,79)",
        "background-color": (_v, el) => el.ownerDocument.defaultView!.getComputedStyle(el.ownerDocument.body).backgroundColor.replace(/\s/g, "") === "rgb(234,231,220)",
      },
      explain: "body { background-color: #EAE7DC; } и h1 { color: #E85A4F; }",
    },
    { kind: "choice", prompt: "Сколько шрифтов лучше использовать на одном сайте?", options: ["Не больше двух", "Каждому абзацу свой", "Пять разных", "Шрифт менять нельзя"], correct: 0, explain: "Один для заголовков и один для текста — достаточно." },
    { kind: "choice", prompt: "Где пишут @import для шрифта Google Fonts?", options: ["В самом начале style.css", "В конце HTML", "Внутри тега p", "В названии файла"], correct: 0, explain: "@import — первая строка style.css." },
    {
      kind: "write",
      prompt: "Сделай текст абзацев тёмным (#222222), чтобы он хорошо читался на светлом фоне.",
      html: "<p>Награды сериала и интересные факты.</p>",
      css: "body { background-color: #EAE7DC; }",
      start: "p {\n  \n}",
      target: "p",
      expect: { color: (v) => v.replace(/\s/g, "") === "rgb(34,34,34)" },
      explain: "p { color: #222222; }",
    },
    { kind: "choice", prompt: "Для чего обычно нужен акцентный цвет?", options: ["Выделить заголовки и кнопки", "Для фона всей страницы", "Для обычного текста", "Он не нужен"], correct: 0, explain: "Акцент привлекает внимание к главному." },
  ],
  cards: [
    { text: "Хорошая палитра — это 3–4 цвета.", answer: true, explain: "Да: фон, текст и акцент, иногда ещё один." },
    { text: "Светло-серый текст на белом фоне легко читать.", answer: false, explain: "Нет, мало контраста — текст сливается с фоном." },
    { text: "Цвет можно записать кодом вида #E85A4F.", answer: true, explain: "Да, это шестнадцатеричный код цвета." },
    { text: "На сайте должно быть как можно больше разных шрифтов.", answer: false, explain: "Нет, хватит двух: для заголовков и для текста." },
    { text: "Акцентным цветом выделяют главное — заголовки и кнопки.", answer: true, explain: "Да, он притягивает взгляд." },
    { text: "Готовые палитры можно взять на специальных сайтах.", answer: true, explain: "Да, например colorhunt.co." },
    { text: "@import шрифта пишут в конце style.css.", answer: false, explain: "Нет, в самом начале файла." },
    { text: "Для длинного текста лучше простой спокойный шрифт.", answer: true, explain: "Да, его легче читать." },
    { text: "Контраст — это насколько текст отличается от фона.", answer: true, explain: "Да, чем больше контраст, тем легче читать." },
    { text: "Яркий акцентный цвет лучше всего подходит для фона всей страницы.", answer: false, explain: "Нет, яркий фон утомляет — акцент используют для деталей." },
  ],
};
