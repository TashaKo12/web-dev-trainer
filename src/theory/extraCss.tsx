import { C, type WebPart } from "../components/ExtraTheory";

// Extra theory for the CSS topics: what their levels and cards ask, but the first theory slide did not explain.

const colorWays: WebPart = {
  title: "Три способа записать цвет",
  text: (
    <>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <b>Именем</b>: <C>red</C>, <C>orange</C>, <C>skyblue</C>, <C>tomato</C>, <C>coral</C>… Таких имён в CSS около 140, но придумать своё нельзя —{" "}
          <C>colorful</C> или <C>backgroundish</C> браузер просто проигнорирует.
        </li>
        <li>
          <b>HEX-кодом</b>: решётка и шесть символов — <C>#ffffff</C> белый, <C>#000000</C> чёрный, <C>#f97316</C> оранжевый. Если символы идут
          парами, можно сократить до трёх: <C>#fff</C>, <C>#000</C>.
        </li>
        <li>
          <b>rgb()</b>: три числа от 0 до 255 — сколько красного, зелёного и синего. <C>rgb(220, 38, 38)</C> — красный.
        </li>
      </ul>
      <p>Один и тот же цвет можно записать любым из способов — результат будет одинаковым.</p>
    </>
  ),
};

export const EXTRA_CSS: Record<string, WebPart[]> = {
  selectors: [
    {
      title: "Виды селекторов",
      text: (
        <>
          <p>Селектор — первая часть правила: он говорит, каким элементам достанется оформление.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <tbody className="[&_td]:border-b [&_td]:border-slate-100 [&_td]:py-1.5 [&_td]:pr-3">
                <tr>
                  <td><C>p</C></td>
                  <td>все теги p — имя тега без значков</td>
                </tr>
                <tr>
                  <td><C>.card</C></td>
                  <td>все элементы с классом card — точка перед именем</td>
                </tr>
                <tr>
                  <td><C>#footer</C></td>
                  <td>один элемент с id="footer" — решётка перед именем</td>
                </tr>
                <tr>
                  <td><C>nav a</C></td>
                  <td>ссылки a, лежащие где угодно внутри nav — пробел значит «внутри»</td>
                </tr>
                <tr>
                  <td><C>[data-featured]</C></td>
                  <td>все элементы, у которых есть такой атрибут, с любым значением</td>
                </tr>
                <tr>
                  <td><C>li:first-child</C></td>
                  <td>li, который стоит первым среди своих соседей</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Классы различают большие и маленькие буквы: <C>.Card</C> и <C>.card</C> — разные классы. Класс может стоять на многих элементах, у одного
            элемента может быть несколько классов, а id на странице — только один.
          </p>
        </>
      ),
      examples: [
        {
          file: "style.css",
          code: "nav a { color: purple; }\nmain h2 { color: teal; }\nli:first-child { font-weight: bold; }",
          preview:
            "<style>nav a{color:purple}main h2{color:teal}li:first-child{font-weight:bold}h2{margin:.2em 0}</style><nav><a href='#'>Главная</a> · <a href='#'>О нас</a></nav><main><h2>Статья</h2></main><h2>Заголовок вне main</h2><ul><li>Первый</li><li>Второй</li></ul>",
          note: "Второй h2 лежит вне main — его правило main h2 не трогает.",
        },
      ],
    },
  ],

  "text-color": [
    colorWays,
    {
      title: "Цвет текста и контраст",
      text: (
        <>
          <p>
            <C>color</C> красит только <b>текст</b>. Фон — это <C>background-color</C>, рамка — <C>border-color</C>.
          </p>
          <p>
            Текст должен заметно отличаться от фона: белый текст на белом фоне просто исчезнет. На светлом фоне берут тёмный текст, на тёмном —
            светлый.
          </p>
        </>
      ),
      examples: [
        {
          file: "style.css",
          code: ".a { color: #000; }\n.b { color: rgb(220, 38, 38); }\n.c { color: white; }  /* на белом фоне */",
          preview: "<p class='a' style='color:#000'>Чёрный HEX #000</p><p style='color:rgb(220,38,38)'>Красный rgb(220, 38, 38)</p><p style='color:white'>Белый текст — его не видно</p>",
        },
      ],
    },
  ],

  "background-color": [
    colorWays,
    {
      title: "Прозрачный фон и контраст",
      text: (
        <>
          <p>
            Если <C>background-color</C> не задан, фон блока <b>прозрачный</b> — сквозь него виден фон того, что под ним (а вовсе не чёрный). То же
            самое можно написать явно: <C>background-color: transparent;</C>
          </p>
          <p>
            <C>background-color</C> не меняет цвет текста — для этого есть <C>color</C>. Следи за контрастом: если текст и фон одного цвета, текст
            не прочитать.
          </p>
        </>
      ),
      examples: [
        {
          file: "style.css",
          code: "body { background-color: #e0f2fe; }\n.a { background-color: #f97316; }\n.b { background-color: transparent; }",
          preview:
            "<style>body{background:#e0f2fe}div{padding:8px 12px;margin:6px 0;border:1px dashed #94a3b8}</style><div style='background:#f97316'>Оранжевый фон</div><div style='background:transparent'>transparent — виден голубой фон страницы</div>",
        },
      ],
    },
  ],

  "text-align": [
    {
      title: "Значение по умолчанию и центр",
      text: (
        <>
          <p>
            Если <C>text-align</C> не указать, текст прижимается <b>влево</b> — <C>left</C> стоит по умолчанию. Значений четыре: <C>left</C>,{" "}
            <C>center</C>, <C>right</C> и <C>justify</C>. Цвет или размер текста это свойство не меняет — только положение по горизонтали.
          </p>
          <p>
            <C>center</C> просто ставит каждую строку посередине. <C>justify</C> растягивает строки, чтобы края были ровными с обеих сторон — так
            набирают книги и газеты; последняя строка остаётся как есть.
          </p>
          <p>
            Свойство ставят на <b>родителя</b>: <C>text-align: center</C> на блоке центрирует всё, что внутри строк, — и текст, и кнопку.
          </p>
        </>
      ),
      examples: [
        {
          file: "style.css",
          code: ".box {\n  text-align: center;\n}",
          preview: "<div style='text-align:center;border:1px dashed #94a3b8;padding:10px'><p style='margin:0 0 8px'>Текст по центру</p><button>И кнопка тоже</button></div>",
        },
      ],
    },
  ],

  "font-size": [
    {
      title: "Сколько пикселей выбрать",
      text: (
        <>
          <p>
            Если <C>font-size</C> не задать, браузер покажет текст размером <b>16px</b> — это и есть удобный минимум для обычного текста. Чаще всего
            размер пишут в пикселях <C>px</C>; бывают и другие единицы (<C>em</C>, <C>rem</C>), но не любые слова — «kg» или «sec» не подойдут.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>основной текст — около 16px;</li>
            <li>заголовки — крупнее: 24px, 32px, а очень большие — от 48px;</li>
            <li>подписи под фото — мельче, 14px и меньше.</li>
          </ul>
          <p>
            <C>font-size</C> меняет только размер. Куда прижать текст — это уже <C>text-align</C>.
          </p>
        </>
      ),
      examples: [
        {
          file: "style.css",
          code: "h1 { font-size: 32px; }\np { font-size: 16px; }\n.caption { font-size: 13px; }",
          preview: "<h1 style='font-size:32px;margin:0'>Заголовок 32px</h1><p style='font-size:16px;margin:6px 0'>Обычный текст 16px</p><p style='font-size:13px;margin:0;color:#64748b'>Подпись 13px</p>",
        },
      ],
    },
  ],

  "font-weight": [
    {
      title: "Шкала от 100 до 900",
      text: (
        <>
          <p>
            Числа идут от <C>100</C> (самый тонкий) до <C>900</C> (самый жирный): чем больше число, тем жирнее текст. Вместо чисел можно писать слова:{" "}
            <C>normal</C> — это 400, <C>bold</C> — это 700.
          </p>
          <p>
            Если <C>font-weight</C> не задать, текст будет <C>normal</C> (400). Учти: у шрифта может не оказаться всех толщин — тогда браузер возьмёт
            ближайшую.
          </p>
        </>
      ),
      examples: [
        {
          file: "style.css",
          code: ".thin { font-weight: 300; }\n.normal { font-weight: normal; }  /* 400 */\n.bold { font-weight: bold; }      /* 700 */\n.black { font-weight: 900; }",
          preview:
            "<p style='font-weight:300;margin:2px 0;font-size:20px'>300 — тонкий</p><p style='font-weight:400;margin:2px 0;font-size:20px'>400 — normal</p><p style='font-weight:700;margin:2px 0;font-size:20px'>700 — bold</p><p style='font-weight:900;margin:2px 0;font-size:20px'>900 — самый жирный</p>",
        },
      ],
    },
  ],

  typography: [
    {
      title: "Шрифты: семейства и запасные",
      text: (
        <>
          <p>
            <C>serif</C> — шрифт <b>с засечками</b> (маленькими штрихами на концах букв), как в книгах. <C>sans-serif</C> — без засечек.{" "}
            <C>monospace</C> — все буквы одной ширины, как в коде.
          </p>
          <p>
            В <C>font-family</C> перечисляют несколько шрифтов через запятую: если первого нет на компьютере, браузер возьмёт следующий.
          </p>
          <p>
            <C>line-height: 1.5</C> — число без единиц значит «в 1.5 раза больше размера шрифта». <C>letter-spacing</C> с плюсом раздвигает буквы, с
            минусом (<C>-1px</C>) — сближает. <C>text-shadow</C> — тень у текста, как <C>box-shadow</C> у блока.
          </p>
        </>
      ),
      examples: [
        {
          file: "style.css",
          code: "p {\n  font-family: Georgia, serif;\n  line-height: 1.5;\n  letter-spacing: -0.5px;\n  text-shadow: 1px 1px 2px #94a3b8;\n}",
          preview: "<p style='font-family:Georgia,serif;line-height:1.5;letter-spacing:-0.5px;text-shadow:1px 1px 2px #94a3b8;margin:0'>Этот рецепт оладий я использую много лет. Строки стоят свободно, а буквы — чуть ближе обычного.</p>",
        },
      ],
    },
    {
      title: "Подключаем свой шрифт",
      text: (
        <>
          <p>Есть два способа подключить шрифт, которого нет на компьютере:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <b>Шрифт из Google Fonts</b> — файл не скачиваешь, а копируешь готовую ссылку и пишешь в самом начале style.css{" "}
              <C>@import url(...)</C>.
            </li>
            <li>
              <b>Свой файл шрифта</b> (например, <C>fonts/Melodin.ttf</C>) подключают правилом <C>@font-face</C>: даёшь шрифту имя и путь к файлу в{" "}
              <C>src</C>.
            </li>
          </ul>
          <p>
            После этого шрифт используют как обычно — по имени в <C>font-family</C>.
          </p>
        </>
      ),
      examples: [
        {
          file: "style.css",
          code: "@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');\n\n@font-face {\n  font-family: Melodin;\n  src: url(fonts/Melodin.ttf);\n}\n\nh1 { font-family: Melodin, sans-serif; }\np  { font-family: Roboto, sans-serif; }",
        },
      ],
    },
  ],

  "box-model": [
    {
      title: "Что входит в размер блока",
      text: (
        <>
          <p>
            Слои от центра наружу: <b>content → padding → border → margin</b>. <C>padding</C> и толщина <C>border</C> добавляются к ширине с обеих
            сторон — блок становится больше своего содержимого. <C>margin</C> — внешний отступ до соседей. А вот <C>color</C> к box model не
            относится: он красит текст и на размер не влияет.
          </p>
          <p>
            <b>Схлопывание margin.</b> Если у верхнего блока <C>margin-bottom: 20px</C>, а у нижнего <C>margin-top: 30px</C>, промежуток между ними
            будет не 50px, а <b>30px</b>: соседние вертикальные отступы не складываются, побеждает больший.
          </p>
        </>
      ),
      examples: [
        {
          file: "style.css",
          code: ".a { margin-bottom: 20px; }\n.b { margin-top: 30px; }",
          preview:
            "<div style='margin-bottom:20px;background:#ddd6fe;padding:6px'>Блок А (margin-bottom: 20px)</div><div style='margin-top:30px;background:#bae6fd;padding:6px'>Блок Б (margin-top: 30px)</div><p style='font-size:12px;color:#64748b'>Между ними 30px, а не 50px.</p>",
        },
      ],
    },
  ],

  border: [
    {
      title: "Стиль линии и скругление",
      text: (
        <>
          <p>
            Стиль линии — отдельное свойство <C>border-style</C>, а в короткой записи <C>border</C> он стоит среди трёх значений (их порядок не
            важен, но обычно пишут толщина, стиль, цвет):
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li><C>solid</C> — сплошная, самая обычная;</li>
            <li><C>dashed</C> — из коротких штрихов;</li>
            <li><C>dotted</C> — из точек;</li>
            <li><C>double</C> — две параллельные линии;</li>
            <li>
              <C>none</C> — рамки нет. Это значение по умолчанию: без стиля рамку не видно, даже если задать толщину и цвет.
            </li>
          </ul>
          <p>
            <C>border-radius</C> — другое свойство: оно не рисует линию, а <b>скругляет углы</b> блока. Их часто используют вместе.
          </p>
        </>
      ),
      examples: [
        {
          file: "style.css",
          code: ".a { border: 3px dashed orange; }\n.b { border: 4px double teal; }\n.c { border: 2px solid gray; border-radius: 16px; }\n.d { border-width: 3px; border-color: red; }  /* без стиля */",
          preview:
            "<style>div{padding:6px 10px;margin:6px 0}</style><div style='border:3px dashed orange'>dashed</div><div style='border:4px double teal'>double</div><div style='border:2px solid gray;border-radius:16px'>solid + border-radius</div><div style='border-width:3px;border-color:red'>без border-style — рамки нет</div>",
        },
      ],
    },
  ],

  shadows: [
    {
      title: "Круг, таблетка и числа тени",
      text: (
        <>
          <p>
            <C>border-radius: 50%</C> скругляет углы на половину стороны — квадрат становится идеальным <b>кругом</b> любого размера. Очень большое
            значение, например <C>9999px</C>, делает из кнопки «таблетку». А небольшое (4–20px) просто смягчает уголки.
          </p>
          <p>
            В <C>box-shadow</C> по порядку: смещение по X, смещение по Y, размытие, цвет. Положительный X двигает тень вправо, отрицательный — влево.
            Положительный Y — вниз, отрицательный — вверх. По умолчанию тени нет, а рисуется она снаружи блока (внутрь — со словом <C>inset</C>).
          </p>
        </>
      ),
      examples: [
        {
          file: "style.css",
          code: ".avatar { border-radius: 50%; }\n.pill   { border-radius: 9999px; }\n.card   { box-shadow: 0 10px 20px rgba(0,0,0,0.2); }\n.left   { box-shadow: -8px 0 12px rgba(0,0,0,0.3); }",
          preview:
            "<style>div{display:inline-block;margin:8px 14px 14px 8px;vertical-align:middle;background:#c4b5fd}</style><div style='width:60px;height:60px;border-radius:50%'></div><div style='padding:8px 22px;border-radius:9999px'>Войти</div><div style='width:70px;height:50px;box-shadow:0 10px 20px rgba(0,0,0,.2);border-radius:8px'></div><div style='width:70px;height:50px;box-shadow:-8px 0 12px rgba(0,0,0,.3)'></div>",
          note: "Круг, таблетка, тень снизу и тень слева.",
        },
      ],
    },
  ],

  backgrounds: [
    {
      title: "cover, contain и повтор",
      text: (
        <>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <C>cover</C> — картинка закрывает <b>весь</b> блок, пропорции сохраняются, а лишнее по краям обрезается.
            </li>
            <li>
              <C>contain</C> — картинка видна <b>целиком</b>, без обрезки, но по бокам могут остаться пустые поля.
            </li>
            <li>
              <C>100% 100%</C> — ширина и высота задаются отдельно: картинка заполнит блок, но может исказиться. <C>50% 50%</C> — половина ширины и
              половина высоты.
            </li>
            <li>
              Если <C>background-repeat</C> не указать, картинка <b>повторяется</b> мозаикой (<C>repeat</C>). <C>no-repeat</C> — один раз,{" "}
              <C>repeat-x</C> — только лентой по горизонтали, <C>repeat-y</C> — только по вертикали.
            </li>
            <li>
              <C>background-position</C> принимает слова (<C>top</C>/<C>center</C>/<C>bottom</C> и <C>left</C>/<C>center</C>/<C>right</C>, порядок слов
              не важен) и проценты, например <C>50% 20%</C>.
            </li>
          </ul>
          <p>Все три свойства можно использовать на одном блоке одновременно.</p>
        </>
      ),
      examples: [
        {
          file: "style.css",
          code: ".hero {\n  background-image: url(sunset.jpg);\n  background-size: cover;\n  background-position: bottom right;\n  background-repeat: no-repeat;\n}",
        },
      ],
    },
  ],

  gradient: [
    {
      title: "Направления, цвета и radial",
      text: (
        <>
          <p>
            Градиент — значение свойства <C>background-image</C>. Внутри скобок через запятую: направление, потом цвета. Направление можно не писать —
            тогда градиент пойдёт сверху вниз (<C>to bottom</C>). <C>to top</C> — наоборот, снизу вверх. Можно задать угол: <C>135deg</C> — по
            диагонали.
          </p>
          <p>
            Цветов может быть сколько угодно, в любом формате: имена, HEX, rgb(). Если у блока есть и <C>background-color</C>, градиент рисуется поверх
            него.
          </p>
          <p>
            <C>linear-gradient</C> идёт по прямой, а <C>radial-gradient</C> расходится кругом от центра наружу.
          </p>
        </>
      ),
      examples: [
        {
          file: "style.css",
          code: ".a { background-image: linear-gradient(red, yellow); }\n.b { background-image: linear-gradient(135deg, #f97316, #ec4899, purple); }\n.c { background-image: radial-gradient(white, skyblue); }",
          preview:
            "<style>div{height:44px;margin:6px 0;border-radius:10px;color:#1e293b;padding:4px 10px;font-size:13px}</style><div style='background-image:linear-gradient(red,yellow)'>без направления — сверху вниз</div><div style='background-image:linear-gradient(135deg,#f97316,#ec4899,purple)'>135deg, три цвета</div><div style='background-image:radial-gradient(white,skyblue)'>radial — от центра</div>",
        },
      ],
    },
  ],

  "reset-box-sizing": [
    {
      title: "content-box и border-box",
      text: (
        <>
          <p>
            По умолчанию у всех блоков <C>box-sizing: content-box</C>: <C>width</C> — это только содержимое, а padding и border добавляются{" "}
            <b>сверху</b>. Блок с <C>width: 100px</C>, padding 20px и border 5px займёт 100 + 2×20 + 2×5 = <b>150px</b>.
          </p>
          <p>
            С <C>border-box</C> padding и border помещаются <b>внутрь</b> заданной ширины — блок останется ровно 100px. Поэтому его часто включают
            сразу для всех элементов через <C>*</C> — селектор, который выбирает вообще каждый элемент. Но можно задать <C>box-sizing</C> и одному
            блоку.
          </p>
          <p>
            Сброс <C>margin: 0; padding: 0</C> и <C>border-box</C> решают разные задачи: первое убирает отступы браузера по умолчанию, второе меняет
            формулу ширины.
          </p>
        </>
      ),
      examples: [
        {
          file: "style.css",
          code: ".a { width: 100px; padding: 20px; border: 5px solid; }\n.b { width: 100px; padding: 20px; border: 5px solid; box-sizing: border-box; }",
          preview:
            "<style>div{background:#ddd6fe;border:5px solid #7c3aed;padding:20px;width:100px;margin:6px 0;font-size:12px}</style><div>content-box: 150px</div><div style='box-sizing:border-box'>border-box: 100px</div>",
        },
      ],
    },
  ],

  flexbox: [
    {
      title: "Оси, умолчания и промежутки",
      text: (
        <>
          <p>
            Flexbox включают на <b>контейнере</b>: <C>display: flex</C>. Его дети выстраиваются вдоль главной оси. <C>justify-content</C> управляет
            главной осью, <C>align-items</C> — поперечной.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              По умолчанию ось горизонтальная (<C>row</C>). С <C>flex-direction: column</C> она становится вертикальной — и тогда{" "}
              <C>align-items</C> двигает блоки уже влево-вправо: <C>flex-end</C> прижмёт колонку вправо.
            </li>
            <li>
              По умолчанию <C>align-items: stretch</C> — блоки растянуты на всю высоту. <C>flex-start</C> прижимает их к началу.
            </li>
            <li>
              По умолчанию <C>flex-wrap: nowrap</C> — блоки не переносятся, даже если не помещаются. <C>wrap</C> разрешает новую строку.
            </li>
            <li>
              <C>space-between</C> — крайние блоки прижаты к краям, остальное место — между блоками. <C>space-around</C> — у каждого блока одинаковый
              отступ с обеих сторон, даже у крайних.
            </li>
            <li>
              По центру в обе стороны: <C>justify-content: center</C> вместе с <C>align-items: center</C>.
            </li>
          </ul>
        </>
      ),
      examples: [
        {
          file: "style.css",
          code: ".a { display: flex; justify-content: space-between; }\n.b { display: flex; justify-content: space-around; }",
          preview:
            "<style>.r{display:flex;border:1px dashed #94a3b8;margin:6px 0;padding:4px 0}.r span{background:#a78bfa;color:#fff;padding:4px 12px;border-radius:6px}</style><div class='r' style='justify-content:space-between'><span>1</span><span>2</span><span>3</span></div><div class='r' style='justify-content:space-around'><span>1</span><span>2</span><span>3</span></div>",
          note: "Сверху space-between, снизу space-around.",
        },
      ],
    },
  ],

  grid: [
    {
      title: "Доли fr и repeat()",
      text: (
        <>
          <p>
            Grid — <b>двумерная</b> сетка: он управляет сразу и колонками, и строками. Flexbox же выстраивает блоки в одну линию.
          </p>
          <p>
            <C>fr</C> (от fraction — «доля») — часть свободного места. <C>1fr 1fr</C> — две равные колонки: сколько значений через пробел, столько и
            колонок. Доли могут быть разными: <C>1fr 2fr</C> — вторая колонка вдвое шире.
          </p>
          <p>
            <C>repeat(3, 1fr)</C> — короткая запись для <C>1fr 1fr 1fr</C>. Промежуток между ячейками задаёт <C>gap</C> — margin у карточек для этого
            не нужен.
          </p>
        </>
      ),
      examples: [
        {
          file: "style.css",
          code: ".grid {\n  display: grid;\n  grid-template-columns: 1fr 2fr;\n  gap: 10px;\n}",
          preview:
            "<style>.g{display:grid;grid-template-columns:1fr 2fr;gap:10px}.g div{background:#a78bfa;color:#fff;padding:10px;border-radius:8px;text-align:center}</style><div class='g'><div>1fr</div><div>2fr</div><div>1fr</div><div>2fr</div></div>",
        },
      ],
    },
  ],

  "pseudo-classes": [
    {
      title: "Ещё состояния: :focus, :link, :visited",
      text: (
        <>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <C>:focus</C> — поле, в которое кликнули или перешли клавишей Tab: в нём сейчас мигает курсор.
            </li>
            <li>
              <C>:link</C> — ссылка, по которой ещё не переходили; <C>:visited</C> — ссылка, которую уже открывали.
            </li>
          </ul>
          <p>
            Псевдокласс пишут с <b>одним</b> двоеточием и <b>слитно</b>, без пробела: <C>.card:hover</C>. Два двоеточия (<C>::</C>) — это уже другое,
            псевдоэлементы.
          </p>
          <p>
            Элемент может быть в нескольких состояниях сразу — например, наведён и нажат. Тогда побеждает правило, которое стоит в файле ниже.
            Поэтому для ссылок принят порядок <b>LVHA</b>: <C>:link</C>, <C>:visited</C>, <C>:hover</C>, <C>:active</C> — чтобы <C>:active</C> был
            последним и побеждал.
          </p>
        </>
      ),
      examples: [
        {
          file: "style.css",
          code: "input:focus { border-color: hotpink; }\na:link    { color: blue; }\na:visited { color: purple; }\na:hover   { color: orange; }\na:active  { color: red; }",
          preview: "<style>input{border:2px solid #cbd5e1;padding:6px;border-radius:8px;outline:none}input:focus{border-color:hotpink}</style><input placeholder='Кликни сюда — сработает :focus'>",
        },
      ],
    },
  ],

  opacity: [
    {
      title: "Какие значения бывают",
      text: (
        <>
          <p>
            <C>opacity</C> — число от <C>0</C> до <C>1</C>, можно дробное: <C>0.3</C>, <C>0.5</C>, <C>0.7</C>. По умолчанию — <C>1</C>. Если написать
            больше 1 или меньше 0, браузер сам округлит до ближайшей границы: ярче «полностью видно» и прозрачнее «совсем невидимо» не бывает.
          </p>
          <p>
            Прозрачным становится <b>весь</b> элемент — и фон, и текст, и всё внутри. Для читаемого текста обычно оставляют 0.8 и выше.
          </p>
        </>
      ),
      examples: [
        {
          file: "style.css",
          code: ".a { opacity: 1; }\n.b { opacity: 0.5; }\n.c { opacity: 0.2; }",
          preview:
            "<style>div{display:inline-block;background:#7c3aed;color:#fff;padding:10px 14px;border-radius:10px;margin-right:6px}</style><div>1</div><div style='opacity:.5'>0.5</div><div style='opacity:.2'>0.2</div>",
        },
      ],
    },
  ],

  transitions: [
    {
      title: "Что, сколько и как плавно",
      text: (
        <>
          <p>
            <C>transition</C> сглаживает переход между <b>двумя состояниями</b> — один раз, а не по кругу, как анимация <C>@keyframes</C>. Без него
            свойство меняется мгновенно, скачком. Срабатывает он на любое изменение: и при <C>:hover</C>, и когда класс меняет JavaScript.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <C>transition-property</C> — что анимировать: одно свойство (<C>background-color</C>) или <C>all</C> — все, что меняются.
            </li>
            <li>
              <C>transition-duration</C> — сколько длится: <C>0.5s</C> или то же самое в миллисекундах <C>500ms</C>. 0.1s — почти мгновенно, 0.3s —
              удобно для кнопок, 3s — уже очень медленно.
            </li>
            <li>
              <C>transition-timing-function</C> — как меняется скорость: <C>ease</C> (по умолчанию) — медленно в начале и в конце, быстро в середине;{" "}
              <C>linear</C> — одинаково всё время.
            </li>
          </ul>
          <p>
            Короткая запись: сначала свойство, потом время — <C>transition: all 0.3s;</C>
          </p>
        </>
      ),
      examples: [
        {
          file: "style.css",
          code: ".card {\n  background: lavender;\n  border-radius: 4px;\n  transition: all 0.5s ease;\n}\n.card:hover {\n  background: violet;\n  border-radius: 24px;\n}",
          preview:
            "<style>.card{background:lavender;border-radius:4px;transition:all .5s ease;padding:18px;text-align:center;cursor:pointer}.card:hover{background:violet;border-radius:24px}</style><div class='card'>Наведи курсор</div>",
          note: "Меняются и цвет, и скругление — all анимирует оба.",
        },
      ],
    },
  ],
};
