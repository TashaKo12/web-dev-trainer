import { Code, type CssTopicData } from "../CssTopic";

const C = Code;

// ── Урок 11. Подвал страницы: семантические теги header, main, footer и подвал, прижатый к низу ──

/** The direct children of body, in order: the three parts must go one after another. */
const bodyOrder = (doc: Document) => Array.from(doc.body.children).map((el) => el.tagName.toLowerCase());

/** The reset every example shares: applied, but not shown in the editor. */
const RESET = "* { margin: 0; box-sizing: border-box; font-family: Arial, sans-serif; }";

const PAGE_CSS =
  "* { margin: 0; box-sizing: border-box; font-family: Arial, sans-serif; } header { background: #2c3e50; color: #fff; padding: 12px; text-align: center; } main { padding: 14px; } footer { background: #34495e; color: #fff; padding: 12px; text-align: center; }";

export const PAGE_PARTS: CssTopicData = {
  id: "page-parts",
  theory: {
    title: "Семантические теги: header, main, footer",
    description: "У почти каждого сайта три части: шапка сверху, главное содержимое и подвал внизу. Для каждой есть свой тег — его и используем в проекте «Подвал страницы».",
    parts: [
      {
        title: "Что такое семантические теги",
        text: (
          <>
            Тег <C>div</C> — просто коробка: по нему не понять, что внутри. Семантические теги называют часть страницы по смыслу:{" "}
            <C>header</C> — шапка, <C>main</C> — главное, <C>footer</C> — подвал. Выглядят они как обычный <C>div</C>, но их понимают
            поисковики, программы для незрячих людей и другие программисты, которые читают твой код.
          </>
        ),
        code: "<!-- непонятно -->\n<div>…</div>\n<div>…</div>\n<div>…</div>\n\n<!-- понятно с первого взгляда -->\n<header>…</header>\n<main>…</main>\n<footer>…</footer>",
      },
      {
        title: "header — шапка",
        text: (
          <>
            <C>header</C> стоит в самом верху. В нём название сайта или логотип, а часто и меню. Он повторяется на каждой странице сайта.
          </>
        ),
        demo: { html: "<header><h1>Мой простой сайт</h1></header>", base: RESET, css: "header { background: #2c3e50; color: white; padding: 12px; text-align: center; }", height: 80 },
      },
      {
        title: "main — главное содержимое",
        text: (
          <>
            В <C>main</C> — то, ради чего пришли на страницу: статья, картинки, задания. <C>main</C> на странице только один, и шапку с
            подвалом в него не кладут.
          </>
        ),
        demo: { html: "<main><h2>Добро пожаловать</h2><p>Это сайт про котёнка Мусю.</p></main>", base: RESET, css: "main { padding: 14px; }", height: 100 },
      },
      {
        title: "footer — подвал",
        text: (
          <>
            <C>footer</C> — самый низ страницы: полезные ссылки, контакты и знак авторского права. Знак © пишут так: <C>&amp;copy;</C> —
            браузер сам превратит это в значок.
          </>
        ),
        demo: {
          html: '<footer><p><a href="#">Главная</a> · <a href="#">О нас</a> · <a href="#">Контакты</a></p><p>&copy; 2026 Онлайн-школа «Лидер»</p></footer>',
          base: RESET,
          css: "footer { background: #34495e; color: white; padding: 12px; text-align: center; } footer a { color: #f39c12; text-decoration: none; } footer p + p { margin-top: 8px; color: #bdc3c7; font-size: 0.8em; }",
          height: 100,
        },
      },
      {
        title: "Порядок: header, main, footer",
        text: (
          <>
            Все три тега стоят прямо внутри <C>body</C>, друг за другом: сначала <C>header</C>, потом <C>main</C>, в конце{" "}
            <C>footer</C>. Не вкладывай их друг в друга — например, <C>main</C> внутрь <C>footer</C>.
          </>
        ),
        demo: {
          html: "<header>header — шапка</header><main>main — главное содержимое</main><footer>footer — подвал</footer>",
          base: PAGE_CSS,
          css: "",
          height: 130,
        },
        code: "<body>\n  <header>\n    <h1>Мой простой сайт</h1>\n  </header>\n\n  <main>\n    <h2>Добро пожаловать</h2>\n    <p>…</p>\n  </main>\n\n  <footer>\n    <p>&copy; 2026 Онлайн-школа «Лидер»</p>\n  </footer>\n</body>",
      },
      {
        title: "Подвал всегда внизу",
        text: (
          <>
            Если на странице мало текста, подвал «подпрыгивает» к середине экрана. В проекте это чинят так: <C>body</C> делают
            флекс-колонкой не ниже экрана — <C>display: flex</C>, <C>flex-direction: column</C>, <C>min-height: 100vh</C>, — а{" "}
            <C>main</C> получает <C>flex: 1</C> и занимает всё свободное место. Подвал уезжает вниз.
          </>
        ),
        demo: {
          html: "<header>Шапка</header><main>Текста мало…</main><footer>Подвал — внизу экрана</footer>",
          base: PAGE_CSS,
          css: "body { display: flex; flex-direction: column; min-height: 100vh; } main { flex: 1; }",
          height: 200,
        },
        code: "body {\n  display: flex;\n  flex-direction: column;\n  min-height: 100vh;\n}\n\nmain {\n  flex: 1;\n}",
      },
    ],
  },
  levels: [
    {
      kind: "choice",
      prompt: "Какой тег нужен для подвала страницы — ссылок и © внизу?",
      options: ["footer", "header", "main", "bottom"],
      correct: 0,
      explain: "footer — подвал. Тега bottom в HTML нет.",
    },
    {
      kind: "html",
      badge: "проект",
      prompt: "Собери каркас страницы: шапка header с заголовком h1, главная часть main с h2 и абзацем, подвал footer с абзацем. Именно в таком порядке.",
      start: "",
      check: (doc) => {
        for (const t of ["header", "main", "footer"]) if (!doc.querySelector(t)) return `Не хватает тега ${t}.`;
        const order = bodyOrder(doc).filter((t) => ["header", "main", "footer"].includes(t));
        if (order.join(",") !== "header,main,footer") return "Теги должны стоять прямо в body и по порядку: header, main, footer — не внутри друг друга.";
        if (!doc.querySelector("header h1")) return "В шапке нужен заголовок h1.";
        if (!doc.querySelector("main h2") || !doc.querySelector("main p")) return "В main нужны h2 и абзац p.";
        if (!doc.querySelector("footer p")) return "В подвале нужен абзац p.";
        return null;
      },
      explain: "<header><h1>…</h1></header>\n<main><h2>…</h2><p>…</p></main>\n<footer><p>…</p></footer>",
    },
    {
      kind: "choice",
      prompt: "Сколько тегов main может быть на одной странице?",
      options: ["Один", "Сколько угодно", "Два: сверху и снизу", "Ни одного"],
      correct: 0,
      explain: "main — главное содержимое страницы, оно одно.",
    },
    {
      kind: "html",
      badge: "проект",
      prompt: "Сделай подвал footer: три ссылки (Главная, О нас, Контакты) и строка со знаком © — напиши его через &copy;.",
      start: "<footer>\n\n</footer>",
      check: (doc, code) => {
        const f = doc.querySelector("footer");
        if (!f) return "Нужен тег footer.";
        if (f.querySelectorAll("a").length < 3) return "Внутри footer нужны три ссылки a.";
        if (!f.textContent!.includes("©")) return "Добавь знак ©.";
        if (!/&copy;/i.test(code)) return "Знак © напиши через &copy; — так он точно отобразится.";
        return null;
      },
      explain: '<footer><a href="">Главная</a> <a href="">О нас</a> <a href="">Контакты</a><p>&copy; 2026 Мой сайт</p></footer>',
    },
    {
      kind: "choice",
      prompt: "Что не так, если написать <footer><main>…</main></footer>?",
      options: ["main не должен быть внутри footer", "footer нужно писать заглавными буквами", "Всё правильно", "main должен быть внутри header"],
      correct: 0,
      explain: "header, main и footer стоят друг за другом прямо в body.",
    },
    {
      kind: "write",
      badge: "проект",
      prompt: "Покрась подвал как в проекте: фон #34495e, белый текст, текст по центру.",
      html: "<header><h1>Мой сайт</h1></header><main><p>Текст страницы</p></main><footer><p>&copy; 2026 Мой сайт</p></footer>",
      css: "* { margin: 0; font-family: Arial, sans-serif; } header { background: #2c3e50; color: #fff; padding: 10px; } main { padding: 10px; } footer { padding: 14px; }",
      start: "footer {\n  \n}",
      target: "footer",
      height: 170,
      expect: {
        "background-color": (v) => v === "rgb(52, 73, 94)",
        color: (v) => v === "rgb(255, 255, 255)",
        "text-align": (v) => v === "center",
      },
      explain: "footer { background-color: #34495e; color: white; text-align: center; }",
    },
    {
      kind: "write",
      badge: "проект",
      prompt: "Текста мало, и подвал висит посередине. Прижми его к низу: body — флекс-колонка не ниже экрана, а main занимает всё свободное место.",
      html: "<header>Шапка</header><main>Текста мало…</main><footer>Подвал</footer>",
      css: "* { margin: 0; box-sizing: border-box; font-family: Arial, sans-serif; } header { background: #2c3e50; color: #fff; padding: 10px; } main { padding: 10px; } footer { background: #34495e; color: #fff; padding: 10px; text-align: center; }",
      start: "body {\n  \n}\n\nmain {\n  \n}",
      target: "main",
      height: 220,
      expect: {
        "flex-grow": (v, el) => {
          const doc = el.ownerDocument;
          const b = doc.defaultView!.getComputedStyle(doc.body);
          return v === "1" && b.display === "flex" && b.flexDirection === "column" && parseFloat(b.minHeight) >= doc.defaultView!.innerHeight - 1;
        },
      },
      explain: "body { display: flex; flex-direction: column; min-height: 100vh; }\nmain { flex: 1; }",
    },
    {
      kind: "choice",
      prompt: "Во что браузер превратит &copy;?",
      options: ["В знак ©", "В слово copy", "В ссылку", "Ни во что, это ошибка"],
      correct: 0,
      explain: "&copy; — особая запись знака авторского права ©.",
    },
  ],
  cards: [
    { text: "header, main и footer — семантические теги.", answer: true, explain: "Да, они называют часть страницы по смыслу." },
    { text: "Семантические теги выглядят иначе, чем div.", answer: false, explain: "Нет, по виду это такие же блоки — разница в смысле." },
    { text: "footer — это шапка страницы.", answer: false, explain: "Нет, footer — подвал, шапка — header." },
    { text: "На странице может быть только один main.", answer: true, explain: "Да, главное содержимое одно." },
    { text: "main можно положить внутрь footer.", answer: false, explain: "Нет, все три тега стоят друг за другом в body." },
    { text: "В подвале обычно ссылки, контакты и ©.", answer: true, explain: "Да, как в проекте «Подвал страницы»." },
    { text: "&copy; показывает знак ©.", answer: true, explain: "Да, браузер превращает эту запись в значок." },
    { text: "Семантические теги помогают поисковикам и программам для незрячих.", answer: true, explain: "Да, по ним понятно, где главное на странице." },
    { text: "min-height: 100vh — это высота не меньше экрана.", answer: true, explain: "Да, vh — доля высоты экрана, 100vh — весь экран." },
    { text: "main { flex: 1 } прижимает подвал к низу, даже если body не флекс.", answer: false, explain: "Нет, flex: 1 работает, только когда у body display: flex." },
  ],
};
