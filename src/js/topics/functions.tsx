import { ArgsPlayground } from "../ArgsPlayground";
import { JsCode, type JsTopicData } from "../JsTopic";
import { jsCodeOnly, type JsResult } from "../runJs";

const C = JsCode;

const logs = (r: JsResult) => r.logs.join("\n").trim();
const same = (r: JsResult, lines: string[]) => logs(r) === lines.join("\n");
const declares = (code: string, name: string) =>
  new RegExp(`function\\s+${name}\\s*\\(|(const|let|var)\\s+${name}\\s*=`).test(jsCodeOnly(code));
const calls = (code: string, name: string) => (jsCodeOnly(code).match(new RegExp(`(^|[^\\w.])${name}\\s*\\(`, "gm")) ?? []).length;

export const FUNCTIONS: JsTopicData = {
  id: "js-functions",
  theory: [
    {
      title: "Функция — своя команда",
      description: "Функция — это кусок кода с именем. Один раз объясняем, что делать, а потом запускаем его сколько угодно раз.",
      parts: [
        {
          title: "Объявляем и вызываем",
          text: (
            <>
              Слово <C>function</C>, имя функции, круглые скобки и фигурные скобки — внутри фигурных пишем, что функция делает. Это{" "}
              <b>объявление</b>: код пока не работает, он только запоминается. Чтобы он сработал, функцию <b>вызывают</b> — пишут
              имя и круглые скобки: <C>hello()</C>.
            </>
          ),
          examples: [
            { code: 'function hello() {\n  console.log("Привет!");\n}\n\nhello();\nhello();', out: "Привет!\nПривет!", note: "Объявили один раз — вызвали дважды." },
            { code: 'function hello() {\n  console.log("Привет!");\n}', out: "(ничего)", note: "Функцию объявили, но не вызвали — она молчит." },
          ],
        },
        {
          title: "Без скобок — не вызов",
          text: (
            <>
              Скобки после имени — это команда «запустить». Если их забыть, функция не выполнится. Имя функции, как и имя
              переменной, пишут одним словом, а большие и маленькие буквы различаются: <C>Hello</C> и <C>hello</C> — разные имена.
            </>
          ),
          examples: [
            { code: 'function jump() {\n  console.log("Прыг!");\n}\n\njump;', out: "(ничего)", note: "Без () функция не запустилась." },
            { code: "jump();\nJump();", out: "Прыг!\nUncaught ReferenceError: Jump is not defined", error: true, note: "Jump с большой буквы никто не объявлял." },
          ],
        },
      ],
    },
    {
      title: "Параметры и аргументы",
      description: "Самое важное в функциях: как передать им данные. Параметры — окошки в объявлении, аргументы — то, что кладём в окошки при вызове.",
      widget: <ArgsPlayground />,
      parts: [
        {
          title: "Параметр — окошко для данных",
          text: (
            <>
              В круглых скобках объявления пишут <b>параметры</b> — имена для значений, которые функция получит. При вызове в
              скобках пишут <b>аргументы</b> — сами значения. Внутри функции параметр работает как обычная переменная.
            </>
          ),
          examples: [
            {
              code: 'function greet(name) {\n  console.log("Привет, " + name + "!");\n}\n\ngreet("Оля");\ngreet("Миша");',
              out: "Привет, Оля!\nПривет, Миша!",
              note: "name — параметр. «Оля» и «Миша» — аргументы.",
            },
          ],
        },
        {
          title: "Несколько параметров — через запятую, по порядку",
          text: (
            <>
              Параметров может быть сколько угодно, их перечисляют через запятую. Аргументы раскладываются по порядку: первый
              аргумент — в первый параметр, второй — во второй. Имена не важны, важен порядок.
            </>
          ),
          examples: [
            { code: 'function move(direction, steps) {\n  console.log(direction + " на " + steps);\n}\n\nmove("вправо", 3);', out: "вправо на 3" },
            { code: 'move(3, "вправо");', out: "3 на вправо", note: "Перепутали порядок — и смысл сломался." },
          ],
        },
        {
          title: "Забыли аргумент — получили undefined",
          text: (
            <>
              Если аргумент не передать, параметр всё равно есть, но в нём пусто — <C>undefined</C>. Лишние аргументы, для
              которых нет параметров, функция просто не замечает.
            </>
          ),
          examples: [
            { code: 'move("вверх");', out: "вверх на undefined", note: "Второй аргумент не передали." },
            { code: 'move("вниз", 2, "быстро");', out: "вниз на 2", note: "Третий аргумент лишний — его некуда положить." },
          ],
        },
        {
          title: "Значение по умолчанию",
          text: (
            <>
              Параметру можно дать запасное значение: <C>percent = 100</C>. Оно сработает, только если аргумент не передали.
              Если передали — победит переданный.
            </>
          ),
          examples: [
            {
              code: 'function charge(percent = 100) {\n  console.log("Заряд: " + percent + "%");\n}\n\ncharge();\ncharge(40);',
              out: "Заряд: 100%\nЗаряд: 40%",
            },
          ],
        },
      ],
    },
    {
      title: "return — функция отдаёт ответ",
      description: "Функция может не только что-то печатать, но и вернуть результат — тогда его можно сохранить, сравнить или передать дальше.",
      parts: [
        {
          title: "return возвращает значение",
          text: (
            <>
              <C>return</C> отдаёт значение туда, где функцию вызвали. Вызов функции превращается в её ответ: его можно положить в
              переменную или сразу вывести через <C>console.log</C>.
            </>
          ),
          examples: [
            { code: "function sum(a, b) {\n  return a + b;\n}\n\nconst total = sum(2, 3);\nconsole.log(total);\nconsole.log(sum(10, 20));", out: "5\n30" },
          ],
        },
        {
          title: "console.log или return",
          text: (
            <>
              <C>console.log</C> только показывает текст в консоли — программе он ничего не отдаёт. Если в функции нет{" "}
              <C>return</C>, её ответ — <C>undefined</C>. А после <C>return</C> функция сразу заканчивается: строки ниже не
              выполнятся.
            </>
          ),
          examples: [
            { code: "function double(n) {\n  console.log(n * 2);\n}\n\nconst x = double(4);\nconsole.log(x);", out: "8\nundefined", note: "Напечатала 8, но ничего не вернула." },
            { code: 'function test() {\n  return "готово";\n  console.log("я не выполнюсь");\n}\n\nconsole.log(test());', out: "готово" },
          ],
        },
        {
          title: "Стрелочная функция",
          text: (
            <>
              Короткая запись функции — стрелка <C>{"=>"}</C>. Слева параметры в скобках, справа то, что вернуть. Если справа одно
              выражение, <C>return</C> писать не нужно.
            </>
          ),
          examples: [
            { code: "const double = (n) => n * 2;\n\nconsole.log(double(21));", out: "42" },
            { code: "const area = (w, h) => w * h;\n\nconsole.log(area(3, 4));", out: "12", note: "Два параметра — тоже через запятую." },
          ],
        },
      ],
    },
  ],
  game: {
    title: "Пиксель учит новые команды",
    description: "Пять миссий: научи робота своим командам-функциям, передай им аргументы и получи ответ через return.",
    finish: "Все миссии пройдены — Пиксель знает твои команды! Закрепим на практике.",
    missions: [
      {
        title: "Первая команда",
        body: (
          <p>
            Пиксель хочет команду <C>hello</C>, которая здоровается. Внутри функции напиши <C>console.log</C> с текстом, а под
            функцией вызови её.
          </p>
        ),
        goal: "В консоли должно появиться: Привет, я Пиксель!",
        start: "function hello() {\n  \n}\n",
        check: (r, code) =>
          !declares(code, "hello")
            ? "Объяви функцию: function hello() { … }."
            : !r.logs.length
              ? "Функция объявлена, но не вызвана: допиши внизу hello();"
              : !same(r, ["Привет, я Пиксель!"])
                ? "Робот должен сказать ровно: Привет, я Пиксель!"
                : true,
      },
      {
        title: "Привет каждому",
        body: (
          <p>
            У функции <C>greet</C> есть параметр <C>name</C>. Допиши её тело, чтобы она здоровалась с тем, чьё имя передали:
            «Привет, Оля!». Подставь параметр, а не готовое имя — функция должна работать для всех.
          </p>
        ),
        goal: (
          <>
            В консоли: <b>Привет, Оля!</b> и <b>Привет, Миша!</b>
          </>
        ),
        start: 'function greet(name) {\n  \n}\n\ngreet("Оля");\ngreet("Миша");',
        calls: ['greet("Пиксель")'],
        check: (r) =>
          !same(r, ["Привет, Оля!", "Привет, Миша!"])
            ? "Нужно две строки: Привет, Оля! и Привет, Миша! Склей текст и параметр: \"Привет, \" + name + \"!\"."
            : r.calls[0]?.logs.join("\n") !== "Привет, Пиксель!"
              ? "Похоже, имена вписаны вручную. Используй параметр name внутри функции."
              : true,
      },
      {
        title: "Порядок аргументов",
        body: (
          <p>
            Функция <C>move</C> уже готова, но Пиксель идёт куда-то не туда: аргументы в вызовах перепутаны. Не трогай функцию —
            исправь только вызовы.
          </p>
        ),
        goal: (
          <>
            В консоли: <b>вправо на 3</b>, потом <b>вверх на 2</b>
          </>
        ),
        start: 'function move(direction, steps) {\n  console.log(direction + " на " + steps);\n}\n\nmove(3, "вправо");\nmove(2, "вверх");',
        check: (r, code) =>
          !/console\.log\(\s*direction\s*\+\s*" на "\s*\+\s*steps\s*\)/.test(code)
            ? "Функцию менять не нужно — верни её как было и поменяй местами аргументы в вызовах."
            : !same(r, ["вправо на 3", "вверх на 2"])
              ? "Первый параметр — direction (куда), второй — steps (сколько). Аргументы идут в том же порядке."
              : true,
      },
      {
        title: "Удвоитель",
        body: (
          <p>
            Пикселю нужен удвоитель энергии. Функция <C>double</C> должна <b>вернуть</b> число, умноженное на 2, через{" "}
            <C>return</C> — а напечатает его уже <C>console.log</C> снаружи.
          </p>
        ),
        goal: "В консоли должно появиться: 42",
        start: "function double(n) {\n  \n}\n\nconsole.log(double(21));",
        calls: ["double(5)", "double(0)"],
        check: (r, code) =>
          logs(r).endsWith("undefined") || !/\breturn\b/.test(jsCodeOnly(code))
            ? "Функция ничего не вернула: напиши внутри return n * 2;"
            : logs(r).split("\n").pop() !== "42"
              ? "Должно получиться 42."
              : r.calls[0]?.value !== "10" || r.calls[1]?.value !== "0"
                ? "Удвоитель должен работать для любого числа: верни n * 2."
                : true,
      },
      {
        title: "Заряд по умолчанию",
        body: (
          <p>
            Если вызвать <C>charge()</C> без аргумента, Пиксель пишет «Заряд: undefined%». Дай параметру <C>percent</C> значение
            по умолчанию 100 — прямо в круглых скобках объявления.
          </p>
        ),
        goal: (
          <>
            В консоли: <b>Заряд: 100%</b> и <b>Заряд: 40%</b>
          </>
        ),
        start: 'function charge(percent) {\n  return "Заряд: " + percent + "%";\n}\n\nconsole.log(charge());\nconsole.log(charge(40));',
        calls: ["charge(7)"],
        check: (r) =>
          !same(r, ["Заряд: 100%", "Заряд: 40%"])
            ? "Напиши в скобках объявления: percent = 100."
            : r.calls[0]?.value !== "Заряд: 7%"
              ? "Переданный аргумент должен побеждать значение по умолчанию."
              : true,
      },
    ],
  },
  levels: [
    {
      badge: "Уровень 1 · return",
      prompt: (
        <>
          Напиши функцию <C>square(n)</C>, которая возвращает квадрат числа — число, умноженное само на себя.
        </>
      ),
      start: "function square(n) {\n  \n}\n",
      tests: [
        { call: "square(3)", returns: "9" },
        { call: "square(5)", returns: "25" },
        { call: "square(0)", returns: "0" },
        { call: "square(-2)", returns: "4" },
      ],
      explain: "return n * n; — функция отдаёт результат, и вызов square(3) превращается в 9.",
    },
    {
      badge: "Уровень 2 · два параметра",
      prompt: (
        <>
          Напиши функцию <C>sum(a, b)</C>, которая возвращает сумму двух чисел.
        </>
      ),
      start: "function sum(a, b) {\n  \n}\n",
      tests: [
        { call: "sum(2, 3)", returns: "5" },
        { call: "sum(10, -4)", returns: "6" },
        { call: "sum(0, 0)", returns: "0" },
      ],
      explain: "Два параметра перечисляют через запятую, а внутри пишут return a + b;",
    },
    {
      badge: "Уровень 3 · текст и параметр",
      prompt: (
        <>
          Напиши функцию <C>greet(name)</C>, которая <b>возвращает</b> приветствие: для «Оля» — «Привет, Оля!».
        </>
      ),
      start: "function greet(name) {\n  \n}\n",
      tests: [
        { call: 'greet("Оля")', returns: "Привет, Оля!" },
        { call: 'greet("Миша")', returns: "Привет, Миша!" },
        { call: 'greet("Пиксель")', returns: "Привет, Пиксель!" },
      ],
      explain: 'Текст склеивают знаком +: return "Привет, " + name + "!"; — пробел после запятой стоит внутри кавычек.',
    },
    {
      badge: "Уровень 4 · console.log внутри",
      prompt: (
        <>
          Напиши функцию <C>about(name, age)</C>, которая <b>выводит</b> в консоль строку «Меня зовут Оля, мне 12 лет».
        </>
      ),
      start: "function about(name, age) {\n  \n}\n",
      tests: [
        { call: 'about("Оля", 12)', prints: "Меня зовут Оля, мне 12 лет" },
        { call: 'about("Миша", 11)', prints: "Меня зовут Миша, мне 11 лет" },
        { call: 'about("Пиксель", 10)', prints: "Меня зовут Пиксель, мне 10 лет" },
      ],
      explain: 'console.log("Меня зовут " + name + ", мне " + age + " лет"); — оба параметра стоят на своих местах в тексте.',
    },
    {
      badge: "Уровень 5 · вызови сам",
      prompt: (
        <>
          Функция <C>order(dish, count)</C> уже написана. Вызови её дважды через <C>console.log</C>, чтобы в консоли появились
          две строки заказа. Не меняй функцию и не пиши ответ текстом.
        </>
      ),
      start: 'function order(dish, count) {\n  return count + " × " + dish;\n}\n\n',
      output: "3 × пирог\n1 × чай",
      rule: (code) => calls(code, "order") >= 2 && !/×\s*(пирог|чай)/.test(code.split("\n").slice(3).join("\n")),
      ruleHint: "получи обе строки вызовами order(…), а не готовым текстом.",
      explain: 'console.log(order("пирог", 3)); — сначала блюдо, потом количество, как в параметрах.',
    },
    {
      badge: "Уровень 6 · да или нет",
      prompt: (
        <>
          Напиши функцию <C>canRide(height)</C>: аттракцион пускает с ростом от 120 см. Функция возвращает <C>true</C>, если
          рост 120 или больше, иначе <C>false</C>.
        </>
      ),
      start: "function canRide(height) {\n  \n}\n",
      tests: [
        { call: "canRide(130)", returns: "true" },
        { call: "canRide(120)", returns: "true" },
        { call: "canRide(110)", returns: "false" },
      ],
      explain: "Сравнение само даёт true или false, поэтому достаточно return height >= 120;",
    },
    {
      badge: "Уровень 7 · if внутри функции",
      prompt: (
        <>
          Напиши функцию <C>bigger(a, b)</C>, которая возвращает большее из двух чисел.
        </>
      ),
      start: "function bigger(a, b) {\n  \n}\n",
      tests: [
        { call: "bigger(3, 7)", returns: "7" },
        { call: "bigger(10, 2)", returns: "10" },
        { call: "bigger(-1, -5)", returns: "-1" },
        { call: "bigger(4, 4)", returns: "4" },
      ],
      explain: "if (a > b) { return a; } return b; — return сразу заканчивает функцию, поэтому else не обязателен.",
    },
    {
      badge: "Уровень 8 · значение по умолчанию",
      prompt: (
        <>
          Напиши функцию <C>price(cost, count, discount)</C>: стоимость товара, умноженная на количество, минус скидка. Если
          скидку не передали, она равна 0.
        </>
      ),
      start: "function price(cost, count, discount) {\n  \n}\n",
      tests: [
        { call: "price(100, 3)", returns: "300" },
        { call: "price(100, 3, 50)", returns: "250" },
        { call: "price(20, 5)", returns: "100" },
      ],
      explain: "discount = 0 в скобках объявления: без третьего аргумента скидка станет нулём, а не undefined.",
    },
    {
      badge: "Уровень 9 · функция в функции",
      prompt: (
        <>
          Функция <C>area(w, h)</C> уже есть. Напиши <C>card(w, h)</C>, которая возвращает текст «Площадь: 12, периметр: 14» для
          прямоугольника 3 на 4. Площадь посчитай вызовом <C>area</C>.
        </>
      ),
      start: "function area(w, h) {\n  return w * h;\n}\n\nfunction card(w, h) {\n  \n}\n",
      tests: [
        { call: "card(3, 4)", returns: "Площадь: 12, периметр: 14" },
        { call: "card(1, 1)", returns: "Площадь: 1, периметр: 4" },
        { call: "card(5, 2)", returns: "Площадь: 10, периметр: 14" },
      ],
      rule: (code) => calls(code, "area") >= 1,
      ruleHint: "площадь посчитай вызовом area(w, h).",
      explain: 'return "Площадь: " + area(w, h) + ", периметр: " + 2 * (w + h); — одна функция может вызывать другую.',
    },
    {
      badge: "Уровень 10 · стрелочная функция",
      prompt: (
        <>
          Запиши функцию <C>triple</C> стрелкой: она получает число и возвращает его, умноженное на 3.
        </>
      ),
      start: "const triple = ",
      tests: [
        { call: "triple(2)", returns: "6" },
        { call: "triple(10)", returns: "30" },
        { call: "triple(0)", returns: "0" },
      ],
      rule: (code) => /=>/.test(jsCodeOnly(code)),
      ruleHint: "запиши функцию стрелкой =>.",
      explain: "const triple = (n) => n * 3; — справа от стрелки одно выражение, поэтому return не нужен.",
    },
  ],
  cards: [
    { text: "Объявленная функция выполняется сразу, даже если её не вызвать.", answer: false, explain: "Объявление только запоминает код. Работать он начнёт при вызове: имя и скобки." },
    { text: "Параметры пишут в скобках объявления, а аргументы — в скобках вызова.", answer: true, explain: "function greet(name) — параметр; greet(\"Оля\") — аргумент." },
    { text: "Аргументы попадают в параметры по смыслу имён.", answer: false, explain: "Только по порядку: первый аргумент — в первый параметр, второй — во второй." },
    { text: "Если аргумент не передать, параметр будет равен undefined.", answer: true, explain: "Параметр есть, но значения в нём нет — undefined." },
    { text: "Значение по умолчанию срабатывает, даже если аргумент передали.", answer: false, explain: "Оно запасное: работает, только когда аргумент не передан." },
    { text: "console.log внутри функции возвращает значение из функции.", answer: false, explain: "console.log только печатает. Вернуть значение может только return." },
    { text: "Функция без return возвращает undefined.", answer: true, explain: "Если return нет, вызов функции даёт undefined." },
    { text: "Код после return внутри функции не выполнится.", answer: true, explain: "return сразу заканчивает функцию." },
    { text: "Функцию можно вызвать сколько угодно раз с разными аргументами.", answer: true, explain: "В этом и смысл: написали один раз — используем много раз." },
    { text: "const double = (n) => n * 2; — это тоже функция.", answer: true, explain: "Это стрелочная функция: короткая запись, return подразумевается." },
  ],
};
