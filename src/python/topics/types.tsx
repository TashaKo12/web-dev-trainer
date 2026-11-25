import { Code, codeOnly, passes, uses, type PythonTopicData } from "../PythonTopic";
import { sameOutput } from "../interpreter";

const C = Code;

export const TYPES: PythonTopicData = {
  id: "python-types",
  theory: {
    title: "Типы данных и как их менять",
    description: "У каждого значения в Python есть тип: целое число, дробное, текст или «да/нет». От типа зависит, что с ним можно делать.",
    parts: [
      {
        title: "Четыре главных типа",
        text: (
          <>
            <C>int</C> — целое число: <C>7</C>, <C>-3</C>. <C>float</C> — дробное, с точкой: <C>3.5</C>, <C>2.0</C>.{" "}
            <C>str</C> — текст в кавычках: <C>"кот"</C>, <C>"7"</C>. <C>bool</C> — «да или нет»: <C>True</C> или <C>False</C>.
            Обрати внимание: <C>7</C> и <C>"7"</C> — разные значения: одно число, другое текст.
          </>
        ),
        examples: [
          { code: 'print(7, 3.5, "кот", True)', out: "7 3.5 кот True" },
          { code: 'print(7 * 2, "7" * 2)', out: "14 77", note: "Число умножается, а текст повторяется." },
        ],
      },
      {
        title: "Узнаём тип: type()",
        text: (
          <>
            Функция <C>type(…)</C> показывает тип значения. Python пишет его так: <C>{"<class 'int'>"}</C>. Тип можно и
            проверить: <C>type(x) == int</C> — это <C>True</C> или <C>False</C>.
          </>
        ),
        examples: [
          { code: 'print(type(5))\nprint(type(2.5))\nprint(type("5"))\nprint(type(False))', out: "<class 'int'>\n<class 'float'>\n<class 'str'>\n<class 'bool'>" },
          { code: "x = 10 / 2\nprint(x, type(x) == float)", out: "5.0 True", note: "Деление / всегда даёт float — даже если делится нацело." },
        ],
      },
      {
        title: "input() всегда даёт текст",
        text: (
          <>
            Что бы ни ввёл человек — даже цифры, — <C>input()</C> вернёт строку <C>str</C>. Поэтому, чтобы считать, текст
            превращают в число: <C>int(input())</C> для целых и <C>float(input())</C> для дробных.
          </>
        ),
        examples: [
          { code: 'a = input("Число: ")\nprint(type(a))', out: "Число: 5\n<class 'str'>", note: "Пользователь ввёл 5, но это текст «5»." },
          { code: 'a = int(input("Число: "))\nprint(a + 1)', out: "Число: 5\n6" },
        ],
      },
      {
        title: "Превращаем: int(), float(), str()",
        text: (
          <>
            <C>int(…)</C> делает целое число: из текста <C>"42"</C> или из дробного <C>3.9</C> — дробная часть просто
            отбрасывается. <C>float(…)</C> делает дробное, <C>str(…)</C> — текст. А <C>round(…)</C> округляет, а не отбрасывает.
          </>
        ),
        examples: [
          { code: 'print(int("42") + 1)\nprint(int(3.9), round(3.9))\nprint(float(5))', out: "43\n3 4\n5.0" },
          { code: 'age = 9\nprint("Мне " + str(age) + " лет")', out: "Мне 9 лет", note: "Склеить через + можно только текст с текстом — число превращаем в str." },
        ],
      },
      {
        title: "bool() и что считается «нет»",
        text: (
          <>
            <C>bool(…)</C> превращает значение в <C>True</C> или <C>False</C>. «Нет» (<C>False</C>) — это <C>0</C>,{" "}
            <C>0.0</C> и пустая строка <C>""</C>. Всё остальное — <C>True</C>, даже строка <C>"False"</C>!
          </>
        ),
        examples: [
          { code: 'print(bool(0), bool(5), bool(""), bool("кот"))', out: "False True False True" },
          { code: 'print(bool("False"))', out: "True", note: "Непустая строка — всегда True, что бы в ней ни было написано." },
        ],
      },
      {
        title: "Когда превратить не получится",
        text: (
          <>
            Из текста <C>"кот"</C> число не сделать — Python скажет <C>ValueError</C>. А если сложить текст и число без
            превращения, будет <C>TypeError</C>: Python не знает, склеивать или считать.
          </>
        ),
        examples: [
          { code: 'print(int("кот"))', out: "ValueError: invalid literal for int() with base 10: 'кот'", error: true, note: "Превращать в число можно только текст из цифр." },
          { code: 'print("5" + 5)', out: 'TypeError: can only concatenate str (not "int") to str', error: true, note: 'Нужно либо int("5") + 5, либо "5" + str(5).' },
        ],
      },
    ],
  },
  game: {
    title: "Пиксель на сортировочной станции",
    description: "Пять миссий: помоги роботу разобрать посылки по типам и правильно превращать одно в другое.",
    finish: "Посылки разобраны — Пиксель теперь не путает числа и текст! Закрепим на практике.",
    missions: [
      {
        title: "Какой это тип?",
        body: (
          <p>
            На ленте посылка <C>3.14</C>. Выведи её тип с помощью <C>type()</C>.
          </p>
        ),
        goal: "В терминале должно появиться: <class 'float'>",
        start: "parcel = 3.14\n",
        check: (r, _a, code) =>
          !sameOutput(r.printed.trim(), "<class 'float'>") ? "Выведи тип посылки: print(type(parcel))." : !uses(code, "type") ? "Используй type()." : true,
      },
      {
        title: "Склейка с числом",
        body: (
          <p>
            Пиксель хочет напечатать <C>Мне 7 лет</C>, склеив текст через <C>+</C>, но программа падает. Исправь её — оставь
            склейку через <C>+</C>.
          </p>
        ),
        goal: "В терминале должно появиться: Мне 7 лет",
        start: 'age = 7\nprint("Мне " + age + " лет")',
        check: (r, _a, code) =>
          !sameOutput(r.printed.trim(), "Мне 7 лет") ? "Должно получиться: Мне 7 лет." : !codeOnly(code).includes("+") ? "Оставь склейку через +." : !uses(code, "str") ? "Преврати число в текст: str(age)." : true,
      },
      {
        title: "Сумма двух посылок",
        body: (
          <p>
            Спроси вес двух посылок через <C>input</C> и выведи их общий вес. Не забудь: <C>input()</C> даёт текст!
          </p>
        ),
        goal: "Запусти и ответь роботу. Например: 3 и 4 → 7",
        start: 'a = input("Вес первой: ")\nb = input("Вес второй: ")\n',
        check: (_r, _a, code) =>
          passes(code, [
            { inputs: ["3", "4"], expected: "7" },
            { inputs: ["10", "25"], expected: "35" },
          ])
            ? true
            : "Должна печататься сумма: 3 и 4 → 7. Сейчас, наверное, получается 34 — превращай текст в число через int().",
      },
      {
        title: "Дробный вес",
        body: (
          <p>
            Посылка весит <C>2.5</C> кг, а коробка — <C>0.5</C> кг. Спроси вес посылки (он может быть дробным) и выведи вес
            вместе с коробкой.
          </p>
        ),
        goal: "Запусти и ответь роботу. Например: 2.5 → 3.0",
        start: 'weight = input("Вес посылки: ")\n',
        check: (_r, _a, code) =>
          passes(code, [
            { inputs: ["2.5"], expected: "3.0" },
            { inputs: ["1.25"], expected: "1.75" },
          ])
            ? true
            : "Дробное число получают через float(): weight = float(input(...)), потом print(weight + 0.5).",
      },
      {
        title: "Пустая коробка",
        body: (
          <p>
            Пиксель проверяет коробки. Пустая строка значит «коробка пустая». Выведи <C>bool</C> для каждой: для{" "}
            <C>"мяч"</C> и для <C>""</C> — через пробел.
          </p>
        ),
        goal: "В терминале должно появиться: True False",
        start: 'box1 = "мяч"\nbox2 = ""\n',
        check: (r, _a, code) => (!sameOutput(r.printed.trim(), "True False") ? "Выведи print(bool(box1), bool(box2))." : !uses(code, "bool") ? "Используй bool()." : true),
      },
    ],
  },
  levels: [
    {
      badge: "type()",
      prompt: 'Выведи тип значения "123" (с кавычками!).',
      start: "",
      tests: [{ inputs: [], expected: "<class 'str'>" }],
      rule: (code) => uses(code, "type"),
      ruleHint: "используй type().",
      explain: 'print(type("123")) — в кавычках это текст, хоть там и цифры.',
    },
    {
      badge: "исправь ошибку",
      prompt: "Программа должна печатать сумму двух чисел, а печатает их склейку. Исправь.",
      start: 'a = input("Первое: ")\nb = input("Второе: ")\nprint(a + b)',
      tests: [
        { inputs: ["2", "3"], expected: "5" },
        { inputs: ["10", "1"], expected: "11" },
      ],
      explain: "input() даёт текст. print(int(a) + int(b)) — или сразу a = int(input(...)).",
    },
    {
      badge: "str()",
      prompt: "Спроси имя и возраст. Выведи одной склейкой через +: Имя: …, возраст: …",
      start: "",
      tests: [
        { inputs: ["Оля", "9"], expected: "Имя: Оля, возраст: 9" },
        { inputs: ["Тимур", "11"], expected: "Имя: Тимур, возраст: 11" },
      ],
      rule: (code) => codeOnly(code).includes("+"),
      ruleHint: "склей строку через +.",
      explain: 'print("Имя: " + name + ", возраст: " + age) — возраст и так текст из input. Если сделал его int — оберни в str().',
    },
    {
      badge: "float()",
      prompt: "Спроси цену товара (может быть дробной) и выведи цену за два товара.",
      start: "",
      tests: [
        { inputs: ["2.5"], expected: "5.0" },
        { inputs: ["10"], expected: "20.0" },
      ],
      rule: (code) => uses(code, "float"),
      ruleHint: "дробное число получают через float().",
      explain: "price = float(input()), print(price * 2). float(\"10\") — это 10.0, поэтому и ответ 20.0.",
    },
    {
      badge: "int()",
      prompt: "Спроси дробное число и выведи только его целую часть (отбрось всё после точки).",
      start: "",
      tests: [
        { inputs: ["3.9"], expected: "3" },
        { inputs: ["12.25"], expected: "12" },
      ],
      rule: (code) => uses(code, "int"),
      ruleHint: "отбрось дробную часть через int().",
      explain: "x = float(input()), print(int(x)). int не округляет, а отбрасывает: int(3.9) == 3.",
    },
    {
      badge: "round()",
      prompt: "Спроси дробное число и выведи его, округлённое до целого.",
      start: "",
      tests: [
        { inputs: ["3.7"], expected: "4" },
        { inputs: ["8.2"], expected: "8" },
      ],
      rule: (code) => uses(code, "round"),
      ruleHint: "округли через round().",
      explain: "print(round(float(input()))) — round, в отличие от int, округляет к ближайшему.",
    },
    {
      badge: "bool()",
      prompt: "Выведи через пробел bool от 0, от 10 и от пустой строки.",
      start: "",
      tests: [{ inputs: [], expected: "False True False" }],
      rule: (code) => uses(code, "bool"),
      ruleHint: "используй bool() три раза.",
      explain: 'print(bool(0), bool(10), bool("")) — ноль и пустая строка считаются «нет».',
    },
    {
      badge: "type() ==",
      prompt: "Спроси что-нибудь у пользователя и выведи True, если это строка (а input всегда даёт строку).",
      start: "",
      tests: [
        { inputs: ["5"], expected: "True" },
        { inputs: ["кот"], expected: "True" },
      ],
      rule: (code) => uses(code, "type") && /==\s*str/.test(codeOnly(code)),
      ruleHint: "сравни тип: type(x) == str.",
      explain: "x = input(), print(type(x) == str) — даже «5» из input — это строка.",
    },
    {
      badge: "исправь ошибку",
      prompt: "Программа падает с ValueError. Пусть она печатает 15 — исправь число в кавычках, не трогая int().",
      start: 'n = int("15 штук")\nprint(n)',
      tests: [{ inputs: [], expected: "15" }],
      rule: (code) => uses(code, "int"),
      ruleHint: "оставь int(), исправь только текст.",
      explain: 'int("15") — в тексте для int должны быть только цифры, без слов.',
    },
    {
      badge: "напиши сам",
      prompt: "Спроси сторону квадрата (дробную) и выведи его площадь, округлённую до целого.",
      start: "",
      tests: [
        { inputs: ["2.5"], expected: "6" },
        { inputs: ["3"], expected: "9" },
      ],
      explain: "a = float(input()), print(round(a * a)). 2.5 × 2.5 = 6.25, округляем — 6.",
    },
  ],
  cards: [
    { text: "7 и \"7\" — одно и то же значение.", answer: false, explain: "Нет: 7 — число int, а \"7\" — текст str." },
    { text: "type(2.0) покажет <class 'float'>.", answer: true, explain: "Да, число с точкой — float, даже если после точки ноль." },
    { text: "input() возвращает число, если ввести цифры.", answer: false, explain: "Нет, input() всегда возвращает текст. Число делают через int() или float()." },
    { text: "int(4.9) даёт 5.", answer: false, explain: "Нет, 4: int отбрасывает дробную часть. Округляет round()." },
    { text: "10 / 2 даёт 5.0, а не 5.", answer: true, explain: "Да, деление / всегда даёт float." },
    { text: "bool(\"\") — это False.", answer: true, explain: "Да, пустая строка считается «нет»." },
    { text: "bool(\"False\") — это False.", answer: false, explain: "Нет, True: строка не пустая, а что в ней написано — неважно." },
    { text: "str(25) превращает число 25 в текст \"25\".", answer: true, explain: "Да, так число можно склеить с текстом через +." },
    { text: "int(\"кот\") даст 0.", answer: false, explain: "Нет, будет ошибка ValueError: в тексте нет числа." },
    { text: "\"5\" + 5 даст 10.", answer: false, explain: "Нет, будет TypeError: текст и число нельзя сложить без превращения." },
  ],
};
