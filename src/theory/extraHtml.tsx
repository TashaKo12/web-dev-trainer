import { C, type WebPart } from "../components/ExtraTheory";

// Extra theory for the HTML topics: what their levels and cards ask, but the first theory slide did not explain.

const svg = (w: number, h: number, fill: string, label: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" rx="12" fill="${fill}"/><circle cx="${w / 2}" cy="${h / 2 - 6}" r="${Math.min(w, h) / 5}" fill="#fff" opacity=".8"/><text x="50%" y="${h - 14}" font-family="sans-serif" font-size="14" fill="#fff" text-anchor="middle">${label}</text></svg>`,
  )}`;
const CAT = svg(200, 140, "#f59e0b", "cat.jpg 200×140");

export const EXTRA_HTML: Record<string, WebPart[]> = {
  "tags-attributes": [
    {
      title: "Правила записи атрибутов",
      text: (
        <>
          <p>У атрибутов строгие правила, и браузер ждёт, что ты их соблюдёшь:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>атрибуты пишут только в <b>открывающем</b> теге — в закрывающем их не бывает;</li>
            <li>имя и значение соединяет знак <C>=</C>, а значение берут в <b>кавычки</b>;</li>
            <li>у одного тега может быть <b>несколько</b> атрибутов — их разделяют <b>пробелом</b>, не запятой;</li>
            <li>закрывающий тег — это слэш и имя тега: <C>&lt;/p&gt;</C>.</li>
          </ul>
        </>
      ),
      examples: [
        { file: "правильно", code: '<img src="cat.jpg" alt="Кот">\n<p class="intro">Привет!</p>', preview: `<img src="${CAT}" alt="Кот" width="120"><p class="intro">Привет!</p>` },
        { file: "так нельзя", bad: true, code: '<img src="cat.jpg", alt="Кот">\n<p class=intro>Привет!</p class="intro">', note: "Запятая между атрибутами, значение без кавычек и атрибут в закрывающем теге — три ошибки." },
      ],
    },
  ],

  "html-structure": [
    {
      title: "Сколько раз и в каком порядке",
      text: (
        <>
          <p>
            Сначала в документе идёт <C>&lt;head&gt;</C> со служебными настройками, потом <C>&lt;body&gt;</C> с тем, что видно на странице. Наоборот не
            бывает.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <C>&lt;main&gt;</C> — <b>один</b> на странице: это её главное содержимое.
            </li>
            <li>
              <C>&lt;header&gt;</C> и <C>&lt;footer&gt;</C> могут встречаться <b>несколько раз</b>: шапка и подвал есть у всей страницы, а ещё — у каждой
              отдельной статьи.
            </li>
            <li>
              <C>&lt;nav&gt;</C> — для крупного меню сайта, а не для каждой ссылки в тексте.
            </li>
            <li>
              <C>&lt;div&gt;</C> — просто коробка без смысла; <C>&lt;section&gt;</C>, <C>&lt;article&gt;</C> и <C>&lt;aside&gt;</C> объясняют, что внутри.
            </li>
          </ul>
        </>
      ),
      examples: [
        {
          file: "index.html",
          code: '<html lang="ru">\n<head>\n  <title>Блог Пикселя</title>\n</head>\n<body>\n  <header>Блог Пикселя</header>\n  <nav>Главная · Статьи</nav>\n  <main>\n    <article>\n      <header>Как я учил HTML</header>\n      <p>Текст статьи…</p>\n      <footer>Автор: Пиксель</footer>\n    </article>\n  </main>\n  <footer>© 2026</footer>\n</body>\n</html>',
          note: "Два header и два footer — у страницы и у статьи. А main — один.",
        },
      ],
    },
  ],

  headings: [
    {
      title: "Иерархия заголовков",
      text: (
        <>
          <p>
            Заголовки — это оглавление страницы. <C>h1</C> — её название, поэтому он <b>один</b>. Разделов может быть много — значит, и{" "}
            <C>h2</C> бывает сколько угодно. Подраздел внутри <C>h2</C> — это <C>h3</C>, внутри него — <C>h4</C>, и так до <C>h6</C>.
          </p>
          <p>
            Чем меньше цифра, тем главнее заголовок. Уровни лучше не перепрыгивать (после h1 сразу h4) — браузер это не запретит, но структура станет
            непонятной. По заголовкам ориентируются и люди, и программы для незрячих, которые читают страницу вслух. А размер текста потом можно
            поменять в CSS — выбирают тег по смыслу.
          </p>
        </>
      ),
      examples: [
        {
          file: "index.html",
          code: "<h1>Меню кафе «Тыковка»</h1>\n<h2>Супы</h2>\n<h3>Горячие</h3>\n<h3>Холодные</h3>\n<h2>Десерты</h2>",
          preview: "<h1 style='margin:.2em 0'>Меню кафе «Тыковка»</h1><h2 style='margin:.2em 0'>Супы</h2><h3 style='margin:.2em 0 .2em 16px'>Горячие</h3><h3 style='margin:.2em 0 .2em 16px'>Холодные</h3><h2 style='margin:.2em 0'>Десерты</h2>",
          note: "Один h1, два h2 и подразделы h3 внутри «Супов».",
        },
      ],
    },
  ],

  paragraphs: [
    {
      title: "Перенос строки внутри абзаца: br",
      text: (
        <>
          <p>
            Если просто нажать Enter в коде, браузер этого не заметит — склеит строки в одну. Чтобы перенести строку <b>внутри</b> одного абзаца (как в
            адресе или стихах), ставят тег <C>&lt;br&gt;</C>.
          </p>
          <p>
            <C>br</C> — самозакрывающийся: у него нет содержимого и закрывающего тега. Он не создаёт новый абзац и не добавляет отступов — просто
            переносит текст на следующую строку.
          </p>
        </>
      ),
      examples: [
        { file: "просто Enter", bad: true, code: "<p>Улица Ленина, 10\nКвартира 5</p>", preview: "<p>Улица Ленина, 10\nКвартира 5</p>", note: "Строки склеились в одну." },
        { file: "с br", code: "<p>Улица Ленина, 10<br>Квартира 5</p>", preview: "<p>Улица Ленина, 10<br>Квартира 5</p>" },
      ],
    },
    {
      title: "Одна мысль — один абзац",
      text: (
        <>
          <p>
            <C>p</C> — парный тег: обязательно нужен закрывающий <C>&lt;/p&gt;</C>. Внутри одного абзаца может быть сколько угодно предложений — главное,
            чтобы это была одна мысль.
          </p>
          <p>
            Новая мысль — новый тег <C>p</C>. Три мысли — три абзаца, и между ними сами появятся отступы. Если положить всё в один <C>p</C>, текст
            склеится в сплошную строку.
          </p>
        </>
      ),
      examples: [
        {
          file: "index.html",
          code: "<p>Привет, меня зовут Влад.</p>\n<p>Мои любимые игры — шахматы и Minecraft.</p>\n<p>Хочу стать программистом.</p>",
          preview: "<p>Привет, меня зовут Влад.</p><p>Мои любимые игры — шахматы и Minecraft.</p><p>Хочу стать программистом.</p>",
        },
      ],
    },
  ],

  lists: [
    {
      title: "Как устроены списки",
      text: (
        <>
          <p>
            <C>ul</C> — unordered list, список без порядка. <C>ol</C> — ordered list, список по порядку: номера браузер расставит сам, писать цифры
            не нужно. Пункт <C>li</C> всегда лежит внутри <C>ul</C> или <C>ol</C> — сам по себе он списком не считается. Пункт может быть и один.
          </p>
          <p>
            Вложенный список кладут <b>внутрь пункта li</b>. Типы можно смешивать: нумерованные шаги внутри маркированного списка — это нормально. А
            маркеры на втором уровне браузер сам делает другими: точка превращается в кружок.
          </p>
        </>
      ),
      examples: [
        {
          file: "index.html",
          code: "<ul>\n  <li>Чай</li>\n  <li>Какао:\n    <ol>\n      <li>Нагрей молоко</li>\n      <li>Добавь какао</li>\n    </ol>\n  </li>\n  <li>Соки:\n    <ul>\n      <li>Яблочный</li>\n    </ul>\n  </li>\n</ul>",
          preview:
            "<ul style='margin:0'><li>Чай</li><li>Какао:<ol><li>Нагрей молоко</li><li>Добавь какао</li></ol></li><li>Соки:<ul><li>Яблочный</li></ul></li></ul>",
          note: "ol внутри ul — номера, а вложенный ul — с кружками вместо точек.",
        },
      ],
    },
  ],

  links: [
    {
      title: "Что ещё важно о ссылках",
      text: (
        <>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Без <C>href</C> тег <C>a</C> никуда не ведёт и не выглядит как ссылка.
            </li>
            <li>
              Ссылка на <b>чужой</b> сайт начинается с <C>https://</C> (или <C>http://</C>). Без этого браузер будет искать страницу у тебя на сайте.
            </li>
            <li>
              Слэш в начале — <C>href="/reviews"</C> — значит «страница моего сайта, считая от его начала (корня)».
            </li>
            <li>
              <C>href="#contacts"</C> не перезагружает страницу, а прокручивает к элементу с <C>id="contacts"</C>.
            </li>
            <li>
              У одной ссылки может быть несколько атрибутов сразу — например, <C>href</C> и <C>target</C>.
            </li>
            <li>
              <C>href</C> говорит только, <b>куда</b> ведёт ссылка. Цвет и вид ссылки задают в CSS.
            </li>
          </ul>
        </>
      ),
      examples: [
        {
          file: "index.html",
          code: '<a href="https://example.com" target="_blank">Чужой сайт</a>\n<a href="/reviews">Отзывы</a>\n<a href="#contacts">Контакты</a>\n<a>Без href</a>',
          preview: "<p><a href='#'>Чужой сайт</a></p><p><a href='#'>Отзывы</a></p><p><a href='#'>Контакты</a></p><p><a>Без href</a></p>",
          note: "Последняя «ссылка» — просто текст: без href она не кликается.",
        },
      ],
    },
  ],

  images: [
    {
      title: "Размер без искажений",
      text: (
        <>
          <p>
            <C>width</C> и <C>height</C> не обязательны: без них браузер покажет картинку в её настоящем размере. Если указать только{" "}
            <b>одно</b> из них, второе браузер подберёт сам и сохранит пропорции.
          </p>
          <p>А если задать оба значения не подумав, картинка растянется или сплющится.</p>
        </>
      ),
      examples: [
        { file: "только width", code: '<img src="cat.jpg" alt="Кот" width="120">', preview: `<img src="${CAT}" alt="Кот" width="120">` },
        { file: "width и height не по пропорциям", bad: true, code: '<img src="cat.jpg" alt="Кот" width="200" height="60">', preview: `<img src="${CAT}" alt="Кот" width="200" height="60">` },
      ],
    },
    {
      title: "alt нужен всегда",
      text: (
        <>
          <p>
            Если файл картинки не нашёлся, браузер покажет вместо неё текст из <C>alt</C>. Его же читают вслух программы для незрячих людей. Страница
            откроется и без <C>alt</C>, но правильно писать его <b>всегда</b>.
          </p>
          <p>
            <C>src</C> и <C>alt</C> — два разных атрибута: у каждого свои кавычки, между ними пробел. Закрывающего тега у <C>img</C> нет. Даже если
            картинку вставляют через тег <C>picture</C>, внутри него всё равно стоит <C>img</C> с <C>alt</C>.
          </p>
        </>
      ),
      examples: [
        { file: "файла нет", code: '<img src="nope.jpg" alt="Рыжий кот спит">', preview: '<img src="nope.jpg" alt="Рыжий кот спит" width="160" height="60">', note: "Картинка не загрузилась — видно alt." },
      ],
    },
  ],

  "image-paths": [
    {
      title: "Слэш, регистр и картинки из интернета",
      text: (
        <>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Папки в пути разделяют <b>прямым</b> слэшем <C>/</C> — даже на Windows, где в проводнике видно обратный <C>\</C>.
            </li>
            <li>
              Каждая вложенная папка — ещё один шаг через <C>/</C>: <C>images/gallery/forest.jpg</C>.
            </li>
            <li>
              Большие и маленькие буквы должны совпадать <b>точно</b>. Файл <C>Logo.png</C> и путь <C>logo.png</C> на твоём компьютере могут
              сработать, а на сайте в интернете (например, на GitHub Pages) картинка пропадёт.
            </li>
            <li>
              Путь со слэшем в начале — <C>/images/sunset.jpg</C> — считается от корня сайта, из какой бы папки ни открыли страницу.
            </li>
            <li>
              Картинку с другого сайта вставляют по полной ссылке, как есть, вместе с <C>https://</C> — тут ничего считать не нужно.
            </li>
          </ul>
        </>
      ),
      examples: [
        {
          file: "pages/about.html",
          code: '<img src="../images/sunset.jpg" alt="Закат">\n<img src="/images/sunset.jpg" alt="Закат">\n<img src="https://example.com/photos/sky.jpg" alt="Небо">',
          note: "Первые две строки ведут к одному файлу: через «подняться на уровень выше» и от корня сайта. Третья — картинка из интернета.",
        },
        { file: "так нельзя", bad: true, code: '<img src="images\\sunset.jpg" alt="Закат">\n<img src="logo.png" alt="Логотип">  <!-- а файл называется Logo.png -->' },
      ],
    },
  ],

  tables: [
    {
      title: "Из чего состоит таблица",
      text: (
        <>
          <p>
            <C>table</C> — вся таблица целиком. Внутри неё — строки <C>tr</C> (table row), а уже внутри строк — ячейки. Ячейки не кладут прямо в{" "}
            <C>table</C>, мимо строки.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <C>td</C> (table data) — обычная ячейка с данными.
            </li>
            <li>
              <C>th</C> (table header) — ячейка-заголовок: браузер сам делает её текст жирным и ставит по центру.
            </li>
            <li>
              <C>rowspan</C> растягивает ячейку вниз на несколько <b>строк</b>, <C>colspan</C> — вправо на несколько <b>столбцов</b>. Без них
              пришлось бы вручную расставлять пустые ячейки.
            </li>
          </ul>
          <p>Таблиц на странице может быть сколько угодно.</p>
        </>
      ),
      examples: [
        {
          file: "index.html",
          code: "<table>\n  <tr>\n    <th>Оружие</th>\n    <th>Урон</th>\n  </tr>\n  <tr>\n    <td>AK-47</td>\n    <td>36</td>\n  </tr>\n</table>",
          preview:
            "<style>td,th{border:1px solid #94a3b8;padding:4px 10px}table{border-collapse:collapse}</style><table><tr><th>Оружие</th><th>Урон</th></tr><tr><td>AK-47</td><td>36</td></tr></table>",
          note: "th — жирные и по центру, td — обычные.",
        },
      ],
    },
  ],

  "semantic-tags": [
    {
      title: "Смысл, а не внешний вид",
      text: (
        <>
          <p>
            Без CSS семантические теги выглядят так же, как <C>div</C>: это обычные блоки. Разница — в <b>смысле</b>. Поисковики и программы для
            незрячих понимают, где на странице меню, где главное, а где реклама. Если заменить их все на <C>div</C>, страница продолжит работать, но
            потеряет эту структуру.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <C>article</C> — самостоятельный материал (статья, новость, пост), который имеет смысл и сам по себе. <C>div</C> о смысле ничего не
              говорит.
            </li>
            <li>
              <C>section</C> — смысловой раздел страницы со своим заголовком («Отзывы», «О нас»). Просто сгруппировать блоки — это работа для{" "}
              <C>div</C>.
            </li>
            <li>
              <C>aside</C> — второстепенное: реклама, похожие статьи. Это про смысл, а не про место — он может стоять сбоку, снизу, где угодно.
            </li>
            <li>
              <C>main</C> — один на странице. А <C>header</C> может быть и у страницы, и у каждой <C>article</C>.
            </li>
          </ul>
        </>
      ),
      examples: [
        {
          file: "index.html",
          code: "<main>\n  <article>\n    <header><h2>Собака открыла холодильник</h2></header>\n    <p>Текст новости…</p>\n  </article>\n  <section>\n    <h2>Отзывы</h2>\n  </section>\n</main>\n<aside>Реклама: корм −20%</aside>",
          preview:
            "<main><article><header><h2 style='margin:0'>Собака открыла холодильник</h2></header><p>Текст новости…</p></article><section><h2 style='margin:0'>Отзывы</h2></section></main><aside>Реклама: корм −20%</aside>",
          note: "В браузере это обычные блоки — смысл виден только в коде.",
        },
      ],
    },
  ],

  "form-basics": [
    {
      title: "Кнопка должна быть внутри формы",
      text: (
        <>
          <p>
            Пустой <C>&lt;form&gt;&lt;/form&gt;</C> без атрибутов — уже рабочая форма: поля и атрибуты можно добавить потом.
          </p>
          <p>
            Кнопка отправляет форму, только если лежит <b>внутри</b> <C>&lt;form&gt;</C>. Кнопка снаружи формы ничего не отправит. То же с Enter: он
            отправляет только поля, которые находятся внутри формы.
          </p>
        </>
      ),
      examples: [
        { file: "работает", code: '<form>\n  <input name="q">\n  <button>Найти</button>\n</form>' },
        { file: "не отправит", bad: true, code: '<form>\n  <input name="q">\n</form>\n<button>Найти</button>', note: "Кнопка оказалась за </form>." },
      ],
    },
  ],

  "form-fields": [
    {
      title: "Обязательное поле: required",
      text: (
        <>
          <p>
            Атрибут <C>required</C> делает поле <b>обязательным</b>. Пока оно пустое, браузер не отправит форму и сам покажет подсказку «Заполните
            это поле». Убери <C>required</C> — и форма уйдёт даже с пустым полем.
          </p>
          <p>Значение у него писать не нужно: достаточно одного имени.</p>
        </>
      ),
      examples: [
        {
          file: "index.html",
          code: '<form>\n  <input placeholder="Имя" required>\n  <button>Отправить</button>\n</form>',
          preview: "<form onsubmit='return false'><input placeholder='Имя' required> <button>Отправить</button></form>",
          note: "Нажми «Отправить» с пустым полем — браузер не пустит.",
        },
      ],
    },
    {
      title: "Как связать label с полем",
      text: (
        <>
          <p>
            Подпись связывают с полем через два атрибута: у поля — <C>id</C>, у подписи — <C>for</C> с <b>тем же</b> значением. Без <C>id</C> у
            поля связать не получится.
          </p>
          <p>
            Зачем: клик по подписи ставит курсор в поле, а программы для незрячих читают, к какому полю какая подпись. Ещё раз о разнице:{" "}
            <C>label</C> видна всегда, а <C>placeholder</C> пропадает, как только в поле появился текст.
          </p>
        </>
      ),
      examples: [
        {
          file: "index.html",
          code: '<label for="name">Имя</label>\n<input id="name" placeholder="Например, Аня">',
          preview: "<label for='name'>Имя</label> <input id='name' placeholder='Например, Аня'>",
          note: "Кликни на «Имя» — курсор окажется в поле.",
        },
      ],
    },
  ],

  "input-types": [
    {
      title: "Ещё типы полей",
      text: (
        <>
          <p>
            От значения <C>type</C> зависит, как поле выглядит и что в него можно ввести. <C>email</C> сам проверит, что есть «@», а <C>password</C>{" "}
            прячет символы точками. Вот ещё несколько типов:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <C>number</C> — только числа, со стрелочками вверх-вниз (возраст, количество);
            </li>
            <li>
              <C>date</C> — встроенный календарь для выбора даты;
            </li>
            <li>
              <C>checkbox</C> — галочка да/нет, каждую можно отметить отдельно;
            </li>
            <li>
              <C>radio</C> — кружок: из нескольких вариантов выбрать <b>один</b>. Варианты одной группы получают одинаковый <C>name</C>.
            </li>
          </ul>
        </>
      ),
      examples: [
        {
          file: "index.html",
          code: '<input type="number" placeholder="Возраст">\n<input type="date">\n<label><input type="checkbox"> Согласен</label>\n<label><input type="radio" name="size"> S</label>\n<label><input type="radio" name="size"> M</label>',
          preview:
            "<p style='margin:4px 0'><input type='number' placeholder='Возраст'></p><p style='margin:4px 0'><input type='date'></p><p style='margin:4px 0'><label><input type='checkbox'> Согласен</label></p><p style='margin:4px 0'><label><input type='radio' name='size'> S</label> <label><input type='radio' name='size'> M</label></p>",
          note: "Попробуй: галочку можно поставить и снять, а из S и M выбирается только один.",
        },
      ],
    },
  ],

  buttons: [
    {
      title: "Три типа кнопок в форме",
      text: (
        <>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <C>type="submit"</C> — отправляет форму. Кнопка внутри формы без <C>type</C> ведёт себя именно так.
            </li>
            <li>
              <C>type="reset"</C> — ничего не отправляет, а возвращает все поля формы к начальным значениям.
            </li>
            <li>
              <C>type="button"</C> — сама ничего не делает: что будет по клику, описывают в JavaScript.
            </li>
          </ul>
          <p>
            <C>disabled</C> пишут просто именем, без значения. Такую кнопку не нажать ни мышкой, ни с клавиатуры. Убрал атрибут — кнопка снова
            работает. Кнопок на странице может быть сколько угодно.
          </p>
        </>
      ),
      examples: [
        {
          file: "index.html",
          code: '<form>\n  <input value="Пиксель">\n  <button type="submit">Отправить</button>\n  <button type="reset">Сбросить</button>\n  <button type="button">Просто кнопка</button>\n  <button disabled>Нельзя нажать</button>\n</form>',
          preview:
            "<form onsubmit='return false'><input value='Пиксель'><p style='margin:6px 0 0'><button type='submit'>Отправить</button> <button type='reset'>Сбросить</button> <button type='button'>Просто кнопка</button> <button disabled>Нельзя нажать</button></p></form>",
          note: "Сотри текст в поле и нажми «Сбросить» — вернётся «Пиксель».",
        },
      ],
    },
    {
      title: "Почему не div вместо кнопки",
      text: (
        <>
          <p>
            Кликабельным можно сделать и другой тег, например ссылку <C>a</C> — но у неё другая работа: переходы. А «кнопка» из <C>div</C> со стилями
            и обработчиком клика только выглядит как кнопка.
          </p>
          <p>
            Настоящий <C>button</C> бесплатно умеет то, чего у <C>div</C> нет: до него можно дойти клавишей Tab, нажать Enter или пробелом, а
            программы для незрячих понимают, что это кнопка.
          </p>
        </>
      ),
      examples: [
        { file: "правильно", code: "<button>Купить</button>" },
        { file: "хуже", bad: true, code: '<div class="btn" onclick="buy()">Купить</div>', note: "С клавиатуры такую «кнопку» не нажать." },
      ],
    },
  ],

  "div-classes": [
    {
      title: "Ещё о классах",
      text: (
        <>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <C>div</C> — от слова division, «раздел». Его берут, когда для содержимого нет тега, подходящего по смыслу.
            </li>
            <li>
              <C>class</C> можно поставить на <b>любой</b> тег: <C>div</C>, <C>p</C>, <C>h2</C>, <C>img</C>… Одинаковый класс у разных тегов — нормально.
            </li>
            <li>Классы не зависят друг от друга: если убрать один, остальные останутся.</li>
            <li>
              Несколько классов разделяют <b>пробелом</b> — не запятой и не точкой с запятой.
            </li>
          </ul>
        </>
      ),
      examples: [
        {
          file: "index.html",
          code: '<h2 class="card">Заголовок</h2>\n<p class="card highlight">Абзац</p>\n<div class="card highlight rounded">Блок</div>',
          preview:
            "<style>.card{border:2px solid #a78bfa;padding:6px 10px;margin:6px 0}.highlight{background:#fef08a}.rounded{border-radius:14px}</style><h2 class='card' style='margin-top:0'>Заголовок</h2><p class='card highlight'>Абзац</p><div class='card highlight rounded'>Блок</div>",
        },
        { file: "так нельзя", bad: true, code: '<div class="card, highlight">' },
      ],
    },
  ],

  "dom-access": [
    {
      title: "Один элемент или коллекция",
      text: (
        <>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <C>getElementById('note')</C> и <C>querySelector(...)</C> возвращают <b>один</b> элемент. <C>querySelector</C> принимает любой CSS-селектор:{" "}
              <C>#id</C>, <C>.class</C>, имя тега — и отдаёт <b>первый</b> подходящий.
            </li>
            <li>
              <C>querySelectorAll(...)</C> и <C>getElementsByClassName('item')</C> возвращают <b>коллекцию</b> — все подходящие элементы. Класс ведь
              может стоять на многих.
            </li>
            <li>
              Из коллекции берут элемент по номеру в квадратных скобках, и счёт идёт <b>с нуля</b>: <C>[0]</C> — первый, <C>[1]</C> — второй.
            </li>
            <li>
              <C>children</C> — только <b>прямые</b> дети элемента, без внуков. <C>parentElement</C> — ровно на уровень вверх, а <C>closest('ul')</C>{" "}
              поднимается сколько нужно, пока не найдёт подходящего предка.
            </li>
            <li>
              <C>previousElementSibling</C> — сосед перед элементом, <C>nextElementSibling</C> — сосед после него.
            </li>
          </ul>
        </>
      ),
      examples: [
        {
          file: "script.js",
          code: "// <ul id=\"list\"><li class=\"item\">Яблоко</li><li class=\"item\">Банан</li><li class=\"item\">Вишня</li></ul>\n\ndocument.querySelector('.item')                 // Яблоко — первый\ndocument.getElementsByClassName('item')[1]      // Банан — второй, счёт с 0\ndocument.getElementById('list').children[2]     // Вишня",
        },
      ],
    },
  ],

  "id-attribute": [
    {
      title: "Уникальность id",
      text: (
        <>
          <p>
            id должен быть уникальным в пределах <b>одной страницы</b>. На другой странице сайта тот же <C>id="logo"</C> — уже не повтор.
          </p>
          <p>
            Если случайно поставить два одинаковых id, браузер не покажет ошибку — страница откроется. Но CSS и JavaScript, которые ищут этот id,
            начнут работать непредсказуемо. Поэтому id — для единичного точного адреса, а <C>class</C> — для повторяющегося оформления.
          </p>
        </>
      ),
      examples: [
        {
          file: "style.css",
          code: "#logo {\n  color: purple;\n}\n.card {\n  border: 2px solid gray;\n}",
          note: "В CSS к id обращаются через решётку и без кавычек, к классу — через точку.",
        },
      ],
    },
  ],
};
