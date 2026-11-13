import type { HtmlMissionDef } from "./HtmlMission";

// Missions for the HTML topics. A running story: Pixel the robot builds his own website,
// one topic at a time. Checks look at the parsed page, so any correct spelling passes.

const q = (d: Document, s: string) => d.querySelector(s);
const all = (d: Document, s: string) => Array.from(d.querySelectorAll(s));
const text = (el: Element | null | undefined) => (el?.textContent ?? "").trim();
const hasText = (el: Element | null | undefined) => text(el).length > 0;

export const HTML_MISSIONS: Record<string, { intro: string; missions: HtmlMissionDef[] }> = {
  "tags-attributes": {
    intro: "Пиксель решил сделать свой сайт, но пока не знает ни одного тега. Научи его!",
    missions: [
      {
        title: "Первое слово",
        tags: "p",
        story: "Привет! Я хочу, чтобы на моём сайте появилась первая фраза. Тег p — это абзац: открывающий <p>, текст и закрывающий </p>.",
        goal: <>Напиши абзац <code>p</code> с текстом «Привет, я Пиксель!».</>,
        starter: "<!-- напиши абзац ниже -->\n",
        check: (d, code) =>
          !q(d, "p") ? "Нужен тег p: <p>текст</p>." : !/<\/p>/i.test(code) ? "Не забудь закрывающий тег </p>." : !hasText(q(d, "p")) ? "Внутри абзаца должен быть текст." : null,
      },
      {
        title: "Подсказка при наведении",
        tags: "@title",
        story: "Атрибут — это дополнительная настройка тега. Он пишется внутри открывающего тега: имя=\"значение\". Атрибут title показывает подсказку, если навести мышку.",
        goal: <>Добавь абзацу атрибут <code>title</code> с любой подсказкой, например «это я».</>,
        starter: "<p>Привет, я Пиксель!</p>\n",
        check: (d) => (!q(d, "p") ? "Абзац p куда-то пропал." : !q(d, "p[title]") ? "Добавь атрибут в открывающий тег: <p title=\"...\">." : !q(d, "p")!.getAttribute("title")!.trim() ? "Значение title не должно быть пустым." : null),
      },
      {
        title: "Линия-разделитель",
        tags: "p hr",
        story: "Бывают самозакрывающиеся теги — у них нет пары. Например <hr> рисует линию. Его не нужно закрывать.",
        goal: <>Сделай два абзаца, а между ними поставь линию <code>&lt;hr&gt;</code>.</>,
        starter: "<p>Привет, я Пиксель!</p>\n",
        check: (d) => {
          const hr = q(d, "hr");
          if (all(d, "p").length < 2) return "Нужно два абзаца p.";
          if (!hr) return "Добавь тег <hr> — без закрывающей пары.";
          return hr.previousElementSibling?.tagName === "P" && hr.nextElementSibling?.tagName === "P" ? null : "Линия hr должна стоять между двумя абзацами.";
        },
      },
    ],
  },

  "html-structure": {
    intro: "У сайта Пикселя пока нет скелета. Соберём настоящую HTML-страницу.",
    missions: [
      {
        title: "Скелет страницы",
        tags: "!doctype html head body",
        story: "Каждая страница начинается с <!DOCTYPE html>, потом идёт <html>, внутри — <head> (служебное) и <body> (то, что видно).",
        goal: <>Собери скелет: <code>&lt;!DOCTYPE html&gt;</code>, <code>html</code>, внутри <code>head</code> и <code>body</code>.</>,
        starter: "",
        check: (_d, code) =>
          !/<!doctype html>/i.test(code)
            ? "Первой строкой напиши <!DOCTYPE html>."
            : !/<html[\s>]/i.test(code) || !/<\/html>/i.test(code)
              ? "Нужны теги <html> и </html>."
              : !/<head[\s>]/i.test(code) || !/<\/head>/i.test(code)
                ? "Внутри html нужен <head>…</head>."
                : !/<body[\s>]/i.test(code) || !/<\/body>/i.test(code)
                  ? "После head добавь <body>…</body>."
                  : code.search(/<head/i) > code.search(/<body/i)
                    ? "head должен идти раньше body."
                    : null,
      },
      {
        title: "Название вкладки",
        tags: "title",
        story: "Текст на вкладке браузера задаёт тег title. Он живёт в head, а не в body.",
        goal: <>Добавь в <code>head</code> тег <code>title</code> с текстом «Сайт Пикселя».</>,
        starter: "<!DOCTYPE html>\n<html>\n  <head>\n  </head>\n  <body>\n  </body>\n</html>\n",
        check: (d, code) => {
          if (!/<title>/i.test(code)) return "Нужен тег <title>…</title>.";
          if (code.search(/<title/i) > code.search(/<body/i)) return "title должен быть внутри head, а не в body.";
          return d.title.trim() ? null : "Напиши текст внутри title.";
        },
      },
      {
        title: "Важное слово",
        tags: "p b span",
        story: "Тег b делает слово жирным, а span — просто «обёртка» для кусочка текста, чтобы потом его оформить.",
        goal: <>В <code>body</code> напиши абзац, где одно слово обёрнуто в <code>b</code>, а другое — в <code>span</code>.</>,
        starter: "<!DOCTYPE html>\n<html>\n  <head>\n    <title>Сайт Пикселя</title>\n  </head>\n  <body>\n  </body>\n</html>\n",
        check: (d) => {
          const p = q(d, "body p");
          if (!p) return "Добавь в body абзац p.";
          if (!p.querySelector("b") || !hasText(p.querySelector("b"))) return "Оберни одно слово в <b>…</b> внутри абзаца.";
          if (!p.querySelector("span") || !hasText(p.querySelector("span"))) return "Оберни другое слово в <span>…</span>.";
          return null;
        },
      },
    ],
  },

  headings: {
    intro: "Пиксель хочет, чтобы на сайте было понятно, где главное, а где разделы.",
    missions: [
      {
        title: "Главный заголовок",
        tags: "h1",
        story: "h1 — самый главный заголовок страницы. Он бывает только один.",
        goal: <>Напиши заголовок <code>h1</code> «Сайт Пикселя».</>,
        starter: "",
        check: (d) => (!q(d, "h1") ? "Нужен тег h1." : !hasText(q(d, "h1")) ? "Добавь текст в h1." : all(d, "h1").length > 1 ? "h1 должен быть один." : null),
      },
      {
        title: "Разделы сайта",
        tags: "h2",
        story: "Разделы помечают заголовками h2 — они чуть меньше h1.",
        goal: <>Под h1 добавь два раздела <code>h2</code>: «Обо мне» и «Мои хобби».</>,
        starter: "<h1>Сайт Пикселя</h1>\n",
        check: (d) => (all(d, "h2").filter(hasText).length < 2 ? "Нужно два заголовка h2 с текстом." : all(d, "h1").length !== 1 ? "Оставь ровно один h1." : null),
      },
      {
        title: "Подраздел",
        tags: "h3",
        story: "Внутри раздела бывают подразделы — это h3. Важно не перепрыгивать уровни: после h2 идёт h3, а не h5.",
        goal: <>После «Мои хобби» добавь подраздел <code>h3</code> «Сборка моделей».</>,
        starter: "<h1>Сайт Пикселя</h1>\n<h2>Обо мне</h2>\n<h2>Мои хобби</h2>\n",
        check: (d) => {
          const h3 = q(d, "h3");
          if (!h3 || !hasText(h3)) return "Нужен h3 с текстом.";
          if (q(d, "h4, h5, h6")) return "Не перепрыгивай уровни — здесь нужен именно h3.";
          const heads = all(d, "h1, h2, h3");
          const i = heads.indexOf(h3);
          return i > 0 && heads[i - 1].tagName === "H2" ? null : "h3 должен идти после h2 — внутри раздела.";
        },
      },
    ],
  },

  paragraphs: {
    intro: "Пора рассказать о Пикселе побольше. Для этого нужны абзацы.",
    missions: [
      {
        title: "Рассказ о себе",
        tags: "p",
        story: "Каждая мысль — в своём абзаце p. Браузер сам добавит между ними отступ.",
        goal: <>Напиши два абзаца <code>p</code> о Пикселе.</>,
        starter: "<h2>Обо мне</h2>\n",
        check: (d) => (all(d, "p").filter(hasText).length < 2 ? "Нужно два абзаца p, и в каждом — текст." : null),
      },
      {
        title: "Перенос строки",
        tags: "br",
        story: "Внутри одного абзаца строку можно перенести тегом <br>. Обычный Enter в коде браузер не заметит!",
        goal: <>Сделай абзац-стишок из двух строк: перенеси строку с помощью <code>&lt;br&gt;</code>.</>,
        starter: "<p>Я робот Пиксель, я люблю код\n</p>\n",
        check: (d) => {
          const p = all(d, "p").find((x) => x.querySelector("br"));
          if (!p) return "Добавь <br> внутрь абзаца, там где нужен перенос.";
          return p.textContent!.split("\n").join("").trim().length > 3 ? null : "В абзаце должен быть текст до и после <br>.";
        },
      },
      {
        title: "Заголовок и текст",
        tags: "h2 p",
        story: "Красивая страница: сначала заголовок раздела, сразу под ним — абзац.",
        goal: <>Сделай заголовок <code>h2</code> «Мои мечты» и сразу после него абзац <code>p</code>.</>,
        starter: "",
        check: (d) => {
          const h2 = all(d, "h2").find((h) => /мечт/i.test(text(h)));
          if (!h2) return "Нужен h2 с текстом «Мои мечты».";
          return h2.nextElementSibling?.tagName === "P" && hasText(h2.nextElementSibling) ? null : "Сразу после h2 поставь абзац p с текстом.";
        },
      },
    ],
  },

  lists: {
    intro: "У Пикселя много увлечений и планов. Разложим их по спискам.",
    missions: [
      {
        title: "Список хобби",
        tags: "ul li",
        story: "ul — список с точками. Каждый пункт — тег li внутри ul.",
        goal: <>Сделай список <code>ul</code> из трёх хобби Пикселя.</>,
        starter: "<h2>Мои хобби</h2>\n",
        check: (d) => (!q(d, "ul") ? "Нужен тег ul." : all(d, "ul > li").filter(hasText).length < 3 ? "Внутри ul нужно три пункта li с текстом." : null),
      },
      {
        title: "Инструкция",
        tags: "ol li",
        story: "Если важен порядок шагов, берём ol — пункты пронумеруются сами.",
        goal: <>Напиши инструкцию «Как собрать робота» — нумерованный список <code>ol</code> из трёх шагов.</>,
        starter: "<h2>Как собрать робота</h2>\n",
        check: (d) => (!q(d, "ol") ? "Нужен тег ol." : all(d, "ol > li").filter(hasText).length < 3 ? "В ol нужно три шага li." : null),
      },
      {
        title: "Список в списке",
        tags: "ul li",
        story: "Внутри пункта li можно положить ещё один список — получится вложенный.",
        goal: <>В пункт «Игры» вложи список <code>ul</code> из двух любимых игр.</>,
        starter: "<ul>\n  <li>Книги</li>\n  <li>Игры\n  </li>\n</ul>\n",
        check: (d) => {
          const inner = q(d, "li > ul");
          if (!inner) return "Положи новый ul внутрь пункта li «Игры» — до его закрывающего </li>.";
          return all(d, "li > ul > li").filter(hasText).length >= 2 ? null : "Во вложенном списке нужно два пункта li.";
        },
      },
    ],
  },

  "div-classes": {
    intro: "Пиксель хочет карточки на сайте. Для этого нужны блоки div и классы.",
    missions: [
      {
        title: "Карточка",
        tags: "div @class=card h2 p",
        story: "div — коробка, в которую складывают другие теги. Класс — имя коробки, по нему CSS потом её раскрасит.",
        goal: <>Сделай <code>div</code> с классом <code>card</code>, а внутри — <code>h2</code> и <code>p</code>.</>,
        starter: "",
        check: (d) => {
          const c = q(d, "div.card");
          if (!c) return "Нужен <div class=\"card\">.";
          return c.querySelector("h2") && c.querySelector("p") ? null : "Внутри карточки нужны h2 и p.";
        },
      },
      {
        title: "Два класса",
        tags: "@class=card+highlight",
        story: "У одного блока может быть несколько классов — через пробел: class=\"card highlight\".",
        goal: <>Дай карточке два класса: <code>card</code> и <code>highlight</code>.</>,
        starter: "<div class=\"card\">\n  <h2>Моя суперсила</h2>\n  <p>Быстро считаю</p>\n</div>\n",
        check: (d) => (q(d, "div.card.highlight") ? null : "Пропиши оба класса в одном атрибуте через пробел: class=\"card highlight\"."),
      },
      {
        title: "Три карточки",
        tags: "div @class=card p",
        story: "Один и тот же класс можно давать многим блокам — так все карточки будут одинаково оформлены.",
        goal: <>Сделай три блока <code>div</code> с классом <code>card</code>, в каждом — текст.</>,
        starter: "",
        check: (d) => (all(d, "div.card").filter(hasText).length >= 3 ? null : "Нужно три div с классом card, и в каждом — текст."),
      },
    ],
  },

  "id-attribute": {
    intro: "Пиксель хочет быстро прыгать по своему сайту. Поможет атрибут id.",
    missions: [
      {
        title: "Имя для заголовка",
        tags: "@id=top",
        story: "id — уникальное имя элемента. В отличие от класса, такой id может быть только у одного тега на странице.",
        goal: <>Дай заголовку <code>h1</code> атрибут <code>id="top"</code>.</>,
        starter: "<h1>Сайт Пикселя</h1>\n",
        check: (d) => (q(d, "h1#top") ? null : "Добавь в открывающий тег h1 атрибут id=\"top\"."),
      },
      {
        title: "Без повторов",
        tags: "section @id=about @id=hobbies h2",
        story: "Два одинаковых id — ошибка! Браузер запутается, к какому элементу прыгать.",
        goal: <>Сделай два раздела <code>section</code> с разными id: <code>about</code> и <code>hobbies</code>.</>,
        starter: "",
        check: (d) => {
          const ids = all(d, "[id]").map((e) => e.id);
          if (new Set(ids).size !== ids.length) return "Один и тот же id встречается дважды — так нельзя.";
          return q(d, "section#about") && q(d, "section#hobbies") ? null : "Нужны <section id=\"about\"> и <section id=\"hobbies\">.";
        },
      },
      {
        title: "Прыжок по странице",
        tags: "a @href=#hobbies",
        story: "Ссылка с href=\"#hobbies\" прыгает к элементу с id=\"hobbies\". Решётка значит «на этой же странице».",
        goal: <>Добавь ссылку <code>a</code>, которая ведёт к разделу <code>#hobbies</code>.</>,
        starter: "<section id=\"hobbies\">\n  <h2>Мои хобби</h2>\n</section>\n",
        check: (d) => (!q(d, "#hobbies") ? "Раздел с id=\"hobbies\" должен остаться." : q(d, 'a[href="#hobbies"]') ? null : "Нужна ссылка <a href=\"#hobbies\">…</a>."),
      },
    ],
  },

  buttons: {
    intro: "На сайте Пикселя пора появиться кнопкам.",
    missions: [
      {
        title: "Первая кнопка",
        tags: "button",
        story: "Кнопка — тег button. Текст между тегами — это надпись на кнопке.",
        goal: <>Сделай кнопку «Поздороваться».</>,
        starter: "",
        check: (d) => (!q(d, "button") ? "Нужен тег button." : hasText(q(d, "button")) ? null : "Напиши надпись внутри кнопки."),
      },
      {
        title: "Пока нельзя",
        tags: "button @disabled",
        story: "Атрибут disabled выключает кнопку — нажать её нельзя. У него даже нет значения.",
        goal: <>Добавь вторую кнопку «Скоро» и выключи её атрибутом <code>disabled</code>.</>,
        starter: "<button>Поздороваться</button>\n",
        check: (d) => (all(d, "button").length < 2 ? "Нужна вторая кнопка." : q(d, "button[disabled]") ? null : "Добавь атрибут disabled второй кнопке."),
      },
      {
        title: "Панель кнопок",
        tags: "div @class=actions button @disabled",
        story: "Кнопки удобно собрать в один блок — так их проще расставить рядом.",
        goal: <>Положи в <code>div</code> с классом <code>actions</code> три кнопки с надписями, одна из них выключена.</>,
        starter: "",
        check: (d) => {
          const box = q(d, "div.actions");
          if (!box) return "Нужен <div class=\"actions\">.";
          const btns = Array.from(box.querySelectorAll("button"));
          if (btns.length < 3 || !btns.every(hasText)) return "Внутри нужно три кнопки с надписями.";
          return box.querySelector("button[disabled]") ? null : "Одна из кнопок должна быть с disabled.";
        },
      },
    ],
  },

  images: {
    intro: "Пиксель хочет повесить на сайт свой портрет.",
    missions: [
      {
        title: "Портрет",
        tags: "img @src=pixel.png @alt",
        story: "Картинка — тег img. Он самозакрывающийся. src — откуда взять картинку, alt — описание, если она не загрузится.",
        goal: <>Добавь <code>img</code> с <code>src="pixel.png"</code> и описанием <code>alt</code>.</>,
        starter: "",
        check: (d) => {
          const img = q(d, "img");
          if (!img) return "Нужен тег img.";
          if (img.getAttribute("src") !== "pixel.png") return "Укажи src=\"pixel.png\".";
          return (img.getAttribute("alt") ?? "").trim() ? null : "Добавь alt с описанием картинки.";
        },
      },
      {
        title: "По размеру",
        tags: "@width=120",
        story: "Атрибут width задаёт ширину картинки в пикселях.",
        goal: <>Сделай ширину портрета 120: <code>width="120"</code>.</>,
        starter: "<img src=\"pixel.png\" alt=\"Робот Пиксель\">\n",
        check: (d) => (q(d, 'img[width="120"]') ? null : "Добавь атрибут width=\"120\" в тег img."),
      },
      {
        title: "Галерея",
        tags: "img @src @alt",
        story: "Хорошее описание alt помогает тем, кто не видит картинку. Опиши, что на ней!",
        goal: <>Сделай две картинки с разными <code>src</code> и понятным <code>alt</code> (хотя бы 5 букв) у каждой.</>,
        starter: "",
        check: (d) => {
          const imgs = all(d, "img");
          if (imgs.length < 2) return "Нужно две картинки img.";
          if (new Set(imgs.map((i) => i.getAttribute("src"))).size < imgs.length) return "У картинок должны быть разные src.";
          return imgs.every((i) => (i.getAttribute("alt") ?? "").trim().length >= 5) ? null : "У каждой картинки нужен alt-описание хотя бы из 5 букв.";
        },
      },
    ],
  },

  "image-paths": {
    intro: "Картинки Пикселя лежат в разных папках. Научимся указывать к ним путь.",
    missions: [
      {
        title: "Из папки images",
        tags: "@src=images/pixel.png",
        story: "Путь images/pixel.png значит: «зайди в папку images рядом со страницей и возьми pixel.png».",
        goal: <>Укажи картинке путь <code>images/pixel.png</code>.</>,
        starter: "<img src=\"\" alt=\"Пиксель\">\n",
        check: (d) => (q(d, "img")?.getAttribute("src") === "images/pixel.png" ? null : "В src должно быть images/pixel.png — без лишних пробелов."),
      },
      {
        title: "На папку выше",
        tags: "@src=../logo.png",
        story: "Две точки ../ значат «выйти из текущей папки на уровень выше».",
        goal: <>Картинка <code>logo.png</code> лежит на папку выше. Укажи путь с <code>../</code>.</>,
        starter: "<img src=\"\" alt=\"Логотип\">\n",
        check: (d) => (q(d, "img")?.getAttribute("src") === "../logo.png" ? null : "Путь должен быть ../logo.png."),
      },
      {
        title: "С другого сайта",
        tags: "img @src=https:// @alt",
        story: "Абсолютный путь — полный адрес в интернете, он начинается с https://.",
        goal: <>Добавь картинку с абсолютным адресом, который начинается с <code>https://</code>.</>,
        starter: "",
        check: (d) => (/^https:\/\/\S+\.\S+/.test(q(d, "img")?.getAttribute("src") ?? "") ? null : "src должен начинаться с https:// и содержать адрес сайта."),
      },
    ],
  },

  links: {
    intro: "Пиксель хочет поделиться любимыми сайтами.",
    missions: [
      {
        title: "Любимый сайт",
        tags: "a @href=https://",
        story: "Ссылка — тег a. В href пишем адрес, а между тегами — текст, на который нажимают.",
        goal: <>Сделай ссылку на любой сайт с адресом <code>https://…</code> и текстом.</>,
        starter: "",
        check: (d) => {
          const a = q(d, "a");
          if (!a) return "Нужен тег a.";
          if (!/^https?:\/\/\S+\.\S+/.test(a.getAttribute("href") ?? "")) return "В href укажи полный адрес, например https://example.com.";
          return hasText(a) ? null : "Добавь текст ссылки между <a> и </a>.";
        },
      },
      {
        title: "В новой вкладке",
        tags: "@target=_blank",
        story: "target=\"_blank\" открывает ссылку в новой вкладке — твой сайт останется открытым.",
        goal: <>Сделай так, чтобы ссылка открывалась в новой вкладке.</>,
        starter: "<a href=\"https://example.com\">Мой любимый сайт</a>\n",
        check: (d) => (q(d, 'a[target="_blank"]') ? null : "Добавь атрибут target=\"_blank\" в тег a."),
      },
      {
        title: "Меню сайта",
        tags: "a @href=#about @href=#hobbies @href=#contacts",
        story: "Меню — это несколько ссылок рядом. Ссылки на разделы своей страницы начинаются с #.",
        goal: <>Сделай три ссылки на разделы: <code>#about</code>, <code>#hobbies</code>, <code>#contacts</code>.</>,
        starter: "",
        check: (d) => {
          const need = ["#about", "#hobbies", "#contacts"];
          const miss = need.filter((h) => !q(d, `a[href="${h}"]`));
          if (miss.length) return `Не хватает ссылки на ${miss.join(", ")}.`;
          return all(d, "a").every(hasText) ? null : "У каждой ссылки должен быть текст.";
        },
      },
    ],
  },

  "semantic-tags": {
    intro: "Сайт Пикселя растёт. Разложим его по смысловым частям.",
    missions: [
      {
        title: "Шапка и подвал",
        tags: "header h1 footer p",
        story: "header — шапка сайта сверху, footer — подвал снизу. Так браузер и поисковики понимают, где что.",
        goal: <>Сделай <code>header</code> с заголовком <code>h1</code> и <code>footer</code> с абзацем.</>,
        starter: "",
        check: (d) => (!q(d, "header h1") ? "Внутри header нужен h1." : !q(d, "footer p") ? "Внутри footer нужен абзац p." : null),
      },
      {
        title: "Навигация",
        tags: "nav a @href",
        story: "nav — блок с главными ссылками сайта, то есть меню.",
        goal: <>Добавь в шапку <code>nav</code> с двумя ссылками.</>,
        starter: "<header>\n  <h1>Сайт Пикселя</h1>\n</header>\n",
        check: (d) => (!q(d, "header nav") ? "Положи nav внутрь header." : d.querySelectorAll("header nav a").length < 2 ? "В nav нужно две ссылки a." : null),
      },
      {
        title: "Главное — в main",
        tags: "main article",
        story: "main — основное содержимое. Оно стоит между шапкой и подвалом, а статья в нём — article.",
        goal: <>Поставь <code>main</code> со статьёй <code>article</code> между <code>header</code> и <code>footer</code>.</>,
        starter: "<header>\n  <h1>Сайт Пикселя</h1>\n</header>\n\n<footer>\n  <p>Сделано Пикселем</p>\n</footer>\n",
        check: (d) => {
          const main = q(d, "main");
          if (!main) return "Нужен тег main.";
          if (!main.querySelector("article") || !hasText(main.querySelector("article"))) return "Внутри main нужна article с текстом.";
          const order = all(d, "header, main, footer").map((e) => e.tagName);
          return order.join(",") === "HEADER,MAIN,FOOTER" ? null : "Порядок: header, потом main, потом footer.";
        },
      },
    ],
  },

  tables: {
    intro: "Пиксель ведёт расписание тренировок. Нужна таблица!",
    missions: [
      {
        title: "Первая таблица",
        tags: "table tr td",
        story: "table — таблица, tr — строка, td — ячейка. Ячейки живут внутри строк.",
        goal: <>Сделай таблицу из двух строк по две ячейки.</>,
        starter: "",
        check: (d) => {
          const rows = all(d, "table tr");
          if (!q(d, "table")) return "Нужен тег table.";
          if (rows.length < 2) return "Нужно две строки tr.";
          return rows.slice(0, 2).every((r) => r.querySelectorAll("td").length >= 2) ? null : "В каждой строке — по две ячейки td.";
        },
      },
      {
        title: "Заголовки столбцов",
        tags: "tr th",
        story: "Ячейки-заголовки пишут тегом th — браузер сделает их жирными.",
        goal: <>Сделай первую строку из заголовков <code>th</code>: «День» и «Тренировка».</>,
        starter: "<table>\n  <tr>\n    <td>Понедельник</td>\n    <td>Бег</td>\n  </tr>\n</table>\n",
        check: (d) => {
          const first = q(d, "table tr");
          return first && first.querySelectorAll("th").length >= 2 && first.querySelectorAll("td").length === 0 ? null : "Добавь первой строкой tr с двумя th.";
        },
      },
      {
        title: "Широкая ячейка",
        tags: "tr td @colspan=2",
        story: "colspan=\"2\" растягивает ячейку на два столбца — например, для итога.",
        goal: <>Добавь строку с одной ячейкой на два столбца: <code>colspan="2"</code>.</>,
        starter: "<table>\n  <tr><th>День</th><th>Тренировка</th></tr>\n  <tr><td>Понедельник</td><td>Бег</td></tr>\n</table>\n",
        check: (d) => (q(d, 'table td[colspan="2"], table th[colspan="2"]') ? null : "Нужна ячейка с атрибутом colspan=\"2\"."),
      },
    ],
  },

  "form-basics": {
    intro: "Пиксель хочет получать письма от друзей. Сделаем форму.",
    missions: [
      {
        title: "Форма",
        tags: "form input button",
        story: "form — рамка формы. Внутри поле ввода input и кнопка.",
        goal: <>Сделай <code>form</code>, внутри <code>input</code> и <code>button</code>.</>,
        starter: "",
        check: (d) => (!q(d, "form") ? "Нужен тег form." : !q(d, "form input") ? "Положи input внутрь form." : !q(d, "form button") ? "Положи button внутрь form." : null),
      },
      {
        title: "Куда отправить",
        tags: "@action=/send @method=post",
        story: "action — адрес, куда уйдут данные, method — способ отправки (get или post).",
        goal: <>Добавь форме <code>action="/send"</code> и <code>method="post"</code>.</>,
        starter: "<form>\n  <input>\n  <button>Отправить</button>\n</form>\n",
        check: (d) => (q(d, 'form[action="/send"]') ? (q(d, "form")!.getAttribute("method")?.toLowerCase() === "post" ? null : "Добавь method=\"post\".") : "Добавь action=\"/send\" в тег form."),
      },
      {
        title: "Кнопка отправки",
        tags: "@name=message @type=submit",
        story: "Кнопка с type=\"submit\" отправляет форму. Поле с name — подписывает, что именно отправляем.",
        goal: <>Дай полю <code>name="message"</code>, а кнопке — <code>type="submit"</code> и надпись «Отправить».</>,
        starter: "<form action=\"/send\" method=\"post\">\n  <input>\n  <button>Отправить</button>\n</form>\n",
        check: (d) => (!q(d, 'form input[name="message"]') ? "У input нужен name=\"message\"." : !q(d, 'form button[type="submit"]') ? "У кнопки нужен type=\"submit\"." : hasText(q(d, "form button")) ? null : "Напиши надпись на кнопке."),
      },
    ],
  },

  "form-fields": {
    intro: "Форма Пикселя пока непонятная: что куда писать? Добавим подписи.",
    missions: [
      {
        title: "Подпись поля",
        tags: "label @for=name input @id=name",
        story: "label — подпись к полю. Её for должен совпадать с id поля — тогда клик по подписи ставит курсор в поле.",
        goal: <>Сделай <code>label for="name"</code> «Имя» и поле <code>input id="name"</code>.</>,
        starter: "",
        check: (d) => (!q(d, 'label[for="name"]') ? "Нужна подпись <label for=\"name\">." : !q(d, "input#name") ? "Нужно поле с id=\"name\"." : hasText(q(d, "label")) ? null : "Напиши текст подписи."),
      },
      {
        title: "Подсказка внутри",
        tags: "@placeholder",
        story: "placeholder — бледная подсказка прямо в поле. Она исчезает, когда начинаешь печатать.",
        goal: <>Добавь полю подсказку <code>placeholder</code>, например «Как тебя зовут?».</>,
        starter: "<label for=\"name\">Имя</label>\n<input id=\"name\">\n",
        check: (d) => ((q(d, "input")?.getAttribute("placeholder") ?? "").trim() ? null : "Добавь атрибут placeholder с текстом."),
      },
      {
        title: "Анкета",
        tags: "label @for input @id",
        story: "Каждому полю — своя подпись. Проверь, что for и id совпадают у каждой пары.",
        goal: <>Сделай два поля («Имя» и «Город»), у каждого — своя подпись <code>label</code> с правильным <code>for</code>.</>,
        starter: "",
        check: (d) => {
          const inputs = all(d, "input");
          if (inputs.length < 2) return "Нужно два поля input.";
          const bad = inputs.find((i) => !i.id || !q(d, `label[for="${CSS.escape(i.id)}"]`));
          return bad ? "У каждого поля нужен id и label с таким же for." : null;
        },
      },
    ],
  },

  "input-types": {
    intro: "Пиксель хочет, чтобы форма сама проверяла, что ввели. Помогут типы полей.",
    missions: [
      {
        title: "Почта",
        tags: "input @type=email",
        story: "type=\"email\" — поле для почты. Браузер не даст отправить текст без @.",
        goal: <>Сделай поле с <code>type="email"</code>.</>,
        starter: "",
        check: (d) => (q(d, 'input[type="email"]') ? null : "Нужен input с type=\"email\"."),
      },
      {
        title: "Пароль",
        tags: "input @type=password @required",
        story: "type=\"password\" прячет символы точками, а required делает поле обязательным.",
        goal: <>Добавь поле пароля, обязательное для заполнения.</>,
        starter: "<input type=\"email\">\n",
        check: (d) => (!q(d, 'input[type="password"]') ? "Нужно поле type=\"password\"." : q(d, 'input[type="password"][required]') ? null : "Добавь полю пароля атрибут required."),
      },
      {
        title: "Галочка",
        tags: "input @type=checkbox label @for @id",
        story: "type=\"checkbox\" — галочка. Рядом с ней обязательно подпись label, чтобы было понятно, на что соглашаемся.",
        goal: <>Сделай галочку «Хочу получать новости» с подписью <code>label</code>.</>,
        starter: "",
        check: (d) => {
          const cb = q(d, 'input[type="checkbox"]');
          if (!cb) return "Нужен input с type=\"checkbox\".";
          const label = cb.id ? q(d, `label[for="${CSS.escape(cb.id)}"]`) : cb.closest("label");
          return label && hasText(label) ? null : "Добавь label: либо с for, равным id галочки, либо обёрнутый вокруг неё.";
        },
      },
    ],
  },
};
