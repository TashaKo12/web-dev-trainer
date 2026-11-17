import { Code, type CssTopicData } from "../CssTopic";

const C = Code;

// ── Урок 10. Интерактивные картины: фоновая картинка, которая появляется при наведении ──
// The pictures live in public/pictures: a preview is an iframe with srcdoc, so «pictures/…» resolves against the site itself.

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Is there a rule `selector { … prop: value … }` in the code? Spaces in the selector may be any. */
const ruleHas = (selector: string, prop: string, value: RegExp) => (code: string) => {
  const sel = esc(selector).replace(/\s+/g, "\\s+").replace(/:/g, "\\s*:\\s*");
  const blocks = new RegExp(`(?:^|[}\\s,])${sel}\\s*\\{([^}]*)\\}`, "gi");
  for (const m of code.matchAll(blocks)) {
    const decl = new RegExp(`(?:^|[;{\\s])${esc(prop)}\\s*:\\s*([^;}]+)`, "i").exec(m[1]);
    if (decl && value.test(decl[1].trim())) return true;
  }
  return false;
};
const url = (file: string) => new RegExp(`^url\\(\\s*["']?pictures/${esc(file)}["']?\\s*\\)`, "i");

const CARD = "width: 220px; height: 150px; border: 2px solid #5f2f1182; display: flex; align-items: center; justify-content: center; text-align: center; color: #2b0d0d; font: 15px sans-serif;";

export const HOVER_PICTURE: CssTopicData = {
  id: "hover-picture",
  theory: {
    title: "Фоновая картинка: background-image",
    description: "В проекте «Интерактивные картины» карточка показывает название картины, а при наведении мыши на её месте появляется сама картина. Это делает фоновая картинка.",
    parts: [
      {
        title: "background-image: url(…)",
        text: (
          <>
            Свойство <C>background-image</C> кладёт картинку на фон блока. Путь к файлу пишут внутри <C>url(…)</C> — так же, как в атрибуте{" "}
            <C>src</C> у тега <C>img</C>: <C>url(images/rye.jpeg)</C>. Текст блока остаётся поверх картинки.
          </>
        ),
        demo: { html: '<div class="card">Текст поверх картинки</div>', css: `.card { ${CARD} background-image: url(pictures/forest.svg); }`, height: 180 },
      },
      {
        title: "img или background-image?",
        text: (
          <>
            Тег <C>img</C> — это картинка как часть содержимого: она стоит в тексте страницы, у неё есть <C>alt</C>. А{" "}
            <C>background-image</C> — украшение блока: картинка лежит под текстом, и её можно менять из CSS, например при наведении. В HTML для неё
            ничего писать не нужно.
          </>
        ),
      },
      {
        title: "background-size: cover",
        text: (
          <>
            Картинка редко совпадает с блоком по размеру. <C>background-size: cover</C> растягивает её так, чтобы закрыть весь блок без
            искажений: лишнее по краям обрежется. А <C>contain</C> покажет картинку целиком, но по краям могут остаться пустые полосы.
          </>
        ),
        demo: {
          html: '<div class="row"><div class="card cover">cover</div><div class="card contain">contain</div></div>',
          css: `.row { display: flex; gap: 10px; } .card { ${CARD} width: 150px; height: 140px; background-image: url(pictures/rye.svg); background-repeat: no-repeat; color: #fff; font-weight: bold; } .cover { background-size: cover; } .contain { background-size: contain; background-color: #e5e7eb; }`,
          height: 170,
        },
      },
      {
        title: "Картина при наведении: :hover",
        text: (
          <>
            Псевдокласс <C>:hover</C> срабатывает, когда мышь над блоком. Если написать <C>background-image</C> только внутри{" "}
            <C>.card:hover</C>, картина появится при наведении и исчезнет, когда мышь уйдёт. А <C>.card:hover p</C> — это абзацы внутри
            карточки под мышью: им ставят <C>opacity: 0</C>, чтобы текст не закрывал картину. Наведи мышь на карточку!
          </>
        ),
        demo: {
          html: '<div class="card"><p>«Утро в лесу»<br>Наведи на меня</p></div>',
          css: `.card { ${CARD} } .card:hover { background-image: url(pictures/forest.svg); background-size: cover; } .card:hover p { opacity: 0; }`,
          height: 180,
        },
      },
      {
        title: "Пока нажата кнопка мыши: :active",
        text: (
          <>
            <C>:active</C> срабатывает, пока кнопка мыши зажата на блоке. В проекте так показывают эскиз картины: наведи — видна картина,
            нажми и держи — виден набросок карандашом. Правило <C>:active</C> пишут ниже, чем <C>:hover</C>: при нажатии верны оба, и
            побеждает то, что ниже.
          </>
        ),
        demo: {
          html: '<div class="card"><p>«Рожь»<br>Наведи, потом нажми и держи</p></div>',
          css: `.card { ${CARD} } .card:hover { background-image: url(pictures/rye.svg); background-size: cover; } .card:hover p { opacity: 0; } .card:active { background-image: url(pictures/rye-sketch.svg); }`,
          height: 180,
        },
        code: ".card:hover {\n  background-image: url(images/Rye.jpeg);\n  background-size: cover;\n}\n\n.card:hover p {\n  opacity: 0;\n}\n\n.card:active {\n  background-image: url(images/Sketch_Rye.jpeg);\n}",
      },
    ],
  },
  levels: [
    {
      kind: "choice",
      prompt: "Как правильно положить картинку rye.jpeg на фон блока?",
      options: ["background-image: url(rye.jpeg);", "background-image: rye.jpeg;", "background: src(rye.jpeg);", "image: url(rye.jpeg);"],
      correct: 0,
      explain: "Свойство — background-image, а путь к файлу — внутри url(…).",
    },
    {
      kind: "write",
      prompt: "Положи на фон карточки .card картинку pictures/forest.svg.",
      html: '<div class="card">Утро в лесу</div>',
      css: `.card { ${CARD} }`,
      start: ".card {\n  \n}",
      target: ".card",
      height: 190,
      expect: { "background-image": (v) => v.includes("pictures/forest.svg") },
      explain: ".card { background-image: url(pictures/forest.svg); }",
    },
    {
      kind: "write",
      prompt: "Картинка pictures/rye.svg уже на фоне, но не закрывает блок. Пусть она закроет его целиком, без пустых мест.",
      html: '<div class="card">Рожь</div>',
      css: `.card { ${CARD} width: 280px; background-image: url(pictures/rye.svg); background-repeat: no-repeat; background-size: 120px; }`,
      start: ".card {\n  \n}",
      target: ".card",
      height: 190,
      expect: { "background-size": (v) => v === "cover" },
      explain: ".card { background-size: cover; }",
    },
    {
      kind: "choice",
      prompt: "Чем background-size: cover отличается от contain?",
      options: [
        "cover закрывает весь блок, обрезая края; contain показывает картинку целиком",
        "cover показывает картинку целиком; contain закрывает весь блок",
        "Ничем, это одно и то же",
        "cover повторяет картинку плиткой",
      ],
      correct: 0,
      explain: "cover — «накрыть» блок полностью; contain — «вместить» картинку целиком.",
    },
    {
      kind: "write",
      badge: "проект",
      prompt: "Как в проекте: пусть картина pictures/forest.svg появляется на фоне .card только при наведении мыши — и закрывает карточку целиком.",
      html: '<div class="card"><p>«Утро в лесу»</p></div>',
      css: `.card { ${CARD} }`,
      start: ".card:hover {\n  \n}",
      target: ".card",
      height: 190,
      expect: {},
      rule: (code) => ruleHas(".card:hover", "background-image", url("forest.svg"))(code) && ruleHas(".card:hover", "background-size", /^cover$/i)(code),
      ruleHint: "Нужно правило .card:hover, а внутри — background-image: url(pictures/forest.svg) и background-size: cover.",
      explain: ".card:hover { background-image: url(pictures/forest.svg); background-size: cover; }",
    },
    {
      kind: "write",
      badge: "проект",
      prompt: "При наведении текст закрывает картину. Сделай абзацы внутри .card невидимыми, пока мышь над карточкой.",
      html: '<div class="card"><p>«Рожь»</p></div>',
      css: `.card { ${CARD} } .card:hover { background-image: url(pictures/rye.svg); background-size: cover; }`,
      start: "",
      target: ".card",
      height: 190,
      expect: {},
      rule: ruleHas(".card:hover p", "opacity", /^0(\.0*)?$/),
      ruleHint: "Нужно правило .card:hover p { opacity: 0; } — «абзацы внутри карточки под мышью».",
      explain: ".card:hover p { opacity: 0; }",
    },
    {
      kind: "write",
      badge: "проект",
      prompt: "Пока кнопка мыши зажата на .card, покажи эскиз pictures/rye-sketch.svg.",
      html: '<div class="card"><p>«Рожь»</p></div>',
      css: `.card { ${CARD} } .card:hover { background-image: url(pictures/rye.svg); background-size: cover; } .card:hover p { opacity: 0; }`,
      start: "",
      target: ".card",
      height: 190,
      expect: {},
      rule: ruleHas(".card:active", "background-image", url("rye-sketch.svg")),
      ruleHint: "Нужно правило .card:active с background-image: url(pictures/rye-sketch.svg).",
      explain: ".card:active { background-image: url(pictures/rye-sketch.svg); }",
    },
    {
      kind: "choice",
      prompt: "Когда срабатывает .card:active?",
      options: ["Пока кнопка мыши зажата на карточке", "Когда мышь просто над карточкой", "Когда страница загрузилась", "Всегда"],
      correct: 0,
      explain: ":hover — мышь над блоком, :active — кнопка мыши нажата и держится.",
    },
  ],
  cards: [
    { text: "background-image кладёт картинку на фон блока.", answer: true, explain: "Да, текст блока остаётся поверх." },
    { text: "Путь к картинке пишут внутри url(…).", answer: true, explain: "Да: background-image: url(images/rye.jpeg)." },
    { text: "Для фоновой картинки в HTML нужен тег img.", answer: false, explain: "Нет, фон задаётся только в CSS." },
    { text: "background-size: cover закрывает блок целиком.", answer: true, explain: "Да, а лишнее по краям обрезается." },
    { text: "background-size: contain всегда закрывает блок без пустых мест.", answer: false, explain: "Нет, contain показывает картинку целиком — могут остаться полосы." },
    { text: ":hover срабатывает, когда мышь над блоком.", answer: true, explain: "Да, и перестаёт, когда мышь уходит." },
    { text: ":active срабатывает, пока кнопка мыши зажата.", answer: true, explain: "Да, отпустил — и стиль пропал." },
    { text: ".card:hover p — это все абзацы на странице.", answer: false, explain: "Нет, только абзацы внутри карточки, над которой мышь." },
    { text: "opacity: 0 удаляет абзац из HTML.", answer: false, explain: "Нет, он остаётся, просто становится полностью прозрачным." },
    { text: "Если :active написан ниже :hover, при нажатии победит :active.", answer: true, explain: "Да, при равной силе селекторов побеждает правило ниже." },
  ],
};
