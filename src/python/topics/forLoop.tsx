import { Code, codeOnly, passes, uses, type PythonTopicData } from "../PythonTopic";

const C = Code;
const printCount = (code: string) => (codeOnly(code).match(/print\s*\(/g) ?? []).length;

export const FOR_LOOP: PythonTopicData = {
  id: "python-for",
  theory: {
    title: "Как работает цикл for",
    description: "for повторяет одни и те же строки нужное число раз или проходит по буквам слова. Разберём range, переменную цикла и сумму.",
    parts: [
      {
        title: "Повторить несколько раз",
        text: (
          <>
            <C>for i in range(5):</C> значит «повтори 5 раз». Строки с отступом под ним — <b>тело цикла</b>: они выполнятся
            каждый раз. Строка без отступа после цикла выполнится один раз, когда цикл закончится.
          </>
        ),
        examples: [
          { code: 'for i in range(3):\n    print("Привет!")\nprint("Пока!")', out: "Привет!\nПривет!\nПривет!\nПока!" },
          { code: 'for i in range(3):\nprint("Привет!")', out: "IndentationError: expected an indented block …", error: true, note: "Тело цикла пишут с отступом." },
        ],
      },
      {
        title: "Что считает range",
        text: (
          <>
            <C>range(5)</C> — числа 0, 1, 2, 3, 4: от нуля и <b>не включая</b> 5. <C>range(1, 6)</C> — от 1 до 5.{" "}
            <C>range(0, 10, 2)</C> — с шагом 2. Шаг может быть отрицательным: <C>range(5, 0, -1)</C> считает назад.
          </>
        ),
        examples: [
          { code: "for i in range(1, 6):\n    print(i)", out: "1\n2\n3\n4\n5" },
          { code: "for i in range(10, 0, -3):\n    print(i)", out: "10\n7\n4\n1" },
        ],
      },
      {
        title: "Переменная цикла",
        text: (
          <>
            <C>i</C> в <C>for i in …</C> — обычная переменная: на каждом шаге в ней следующее число. С ней можно считать.
            Чтобы печатать в одну строку, используй <C>end=" "</C> в <C>print</C>.
          </>
        ),
        examples: [
          { code: 'for i in range(1, 4):\n    print("7 x", i, "=", 7 * i)', out: "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21" },
          { code: 'for i in range(5):\n    print(i, end=" ")', out: "0 1 2 3 4 " },
        ],
      },
      {
        title: "Перебор букв",
        text: (
          <>
            <C>for</C> умеет проходить не только по числам, но и по буквам слова: <C>for буква in "кот":</C> — на каждом шаге в
            переменной следующая буква.
          </>
        ),
        examples: [
          { code: 'for буква in "кот":\n    print(буква)', out: "к\nо\nт" },
          { code: 'слово = input("Слово: ")\nfor б in слово:\n    print(б * 2, end="")', out: "Слово: да\nддаа" },
        ],
      },
      {
        title: "Копим сумму",
        text: (
          <>
            Чтобы сложить много чисел, заводим переменную до цикла: <C>сумма = 0</C>, внутри прибавляем: <C>сумма += i</C>, а
            печатаем <b>после</b> цикла, без отступа. Если поставить <C>print</C> внутрь, он напечатает промежуточные суммы.
          </>
        ),
        examples: [
          { code: "сумма = 0\nfor i in range(1, 5):\n    сумма += i\nprint(сумма)", out: "10" },
          { code: "сумма = 0\nfor i in range(1, 5):\n    сумма += i\n    print(сумма)", out: "1\n3\n6\n10", note: "print внутри цикла печатает на каждом шаге." },
        ],
      },
    ],
  },
  game: {
    title: "Пиксель на тренировке",
    description: "Пять миссий: робот приседает, считает, ведёт обратный отсчёт и складывает очки — всё одним циклом.",
    finish: "Все миссии пройдены — Пиксель больше не устаёт повторять! Закрепим на практике.",
    missions: [
      {
        title: "Пять приседаний",
        body: (
          <p>
            Пиксель делает зарядку. Напечатай <C>Присед!</C> 5 раз, но команду <C>print</C> напиши только один раз — внутри
            цикла <C>for</C>.
          </p>
        ),
        goal: "Пять строк «Присед!» одним print.",
        start: "for i in range(5):\n    ",
        check: (r, _a, code) =>
          r.printed !== "Присед!\n".repeat(5) ? "Должно быть ровно 5 строк «Присед!»." : printCount(code) !== 1 || !uses(code, "for") ? "Один print внутри цикла for." : true,
      },
      {
        title: "Счёт до десяти",
        body: (
          <p>
            Пусть Пиксель посчитает от 1 до 10, каждое число на новой строке. Помни: <C>range</C> не включает последнее число.
          </p>
        ),
        goal: "Числа от 1 до 10 по одному в строке.",
        start: "",
        check: (r, _a, code) =>
          r.printed !== Array.from({ length: 10 }, (_, i) => `${i + 1}\n`).join("") ? "Нужны числа от 1 до 10 — проверь начало и конец range." : !uses(code, "for") ? "Используй цикл for." : true,
      },
      {
        title: "Обратный отсчёт",
        body: (
          <p>
            Ракета Пикселя стартует! Выведи 5, 4, 3, 2, 1 — по одному в строке, а потом <C>Старт!</C>. Шаг range может быть{" "}
            <C>-1</C>.
          </p>
        ),
        goal: "5 4 3 2 1 по строкам и «Старт!» в конце.",
        start: "",
        check: (r, _a, code) =>
          r.printed !== "5\n4\n3\n2\n1\nСтарт!\n" ? "Сначала 5…1, потом один раз «Старт!» — после цикла, без отступа." : !uses(code, "for") ? "Используй цикл for." : true,
      },
      {
        title: "Буква за буквой",
        body: (
          <p>
            Спроси слово через <C>input</C> и выведи каждую его букву на новой строке с помощью <C>for</C>.
          </p>
        ),
        goal: "Например: кот → к, о, т на отдельных строках.",
        start: 'слово = input("Слово: ")\n',
        check: (_r, _a, code) =>
          !uses(code, "for")
            ? "Используй цикл for."
            : passes(code, [
                  { inputs: ["кот"], expected: "к\nо\nт" },
                  { inputs: ["робот"], expected: "р\nо\nб\nо\nт" },
                ])
              ? true
              : "for буква in слово: и с отступом print(буква).",
      },
      {
        title: "Копилка очков",
        body: (
          <p>
            Спроси число n и выведи сумму всех чисел от 1 до n. Заведи <C>сумма = 0</C> до цикла и печатай после него.
          </p>
        ),
        goal: "Например: 4 → 10 (1 + 2 + 3 + 4).",
        start: 'n = int(input("До какого числа? "))\nсумма = 0\n',
        check: (_r, _a, code) =>
          !uses(code, "for")
            ? "Используй цикл for."
            : passes(code, [
                  { inputs: ["4"], expected: "10" },
                  { inputs: ["10"], expected: "55" },
                  { inputs: ["1"], expected: "1" },
                ])
              ? true
              : "for i in range(1, n + 1): сумма += i, а print(сумма) — после цикла.",
      },
    ],
  },
  levels: [
    {
      badge: "напиши сам",
      prompt: "Выведи слово Python 3 раза — с помощью for и одного print.",
      start: "",
      tests: [{ inputs: [], expected: "Python\nPython\nPython" }],
      rule: (code) => uses(code, "for") && printCount(code) === 1,
      ruleHint: "один print внутри цикла for.",
      explain: 'for i in range(3): и с отступом print("Python").',
    },
    {
      badge: "range",
      prompt: "Выведи числа от 0 до 4, каждое на новой строке.",
      start: "",
      tests: [{ inputs: [], expected: "0\n1\n2\n3\n4" }],
      rule: (code) => uses(code, "for"),
      ruleHint: "используй цикл for.",
      explain: "for i in range(5): print(i) — range(5) даёт 0, 1, 2, 3, 4.",
    },
    {
      badge: "исправь ошибку",
      prompt: "Программа должна печатать числа от 1 до 5, но теряет пятёрку. Исправь.",
      start: "for i in range(1, 5):\n    print(i)",
      tests: [{ inputs: [], expected: "1\n2\n3\n4\n5" }],
      rule: (code) => uses(code, "for"),
      explain: "range не включает последнее число, поэтому нужно range(1, 6).",
    },
    {
      badge: "шаг",
      prompt: "Выведи чётные числа от 2 до 10 — с помощью шага в range.",
      start: "",
      tests: [{ inputs: [], expected: "2\n4\n6\n8\n10" }],
      rule: (code) => /range\([^)]*,[^)]*,[^)]*\)/.test(codeOnly(code)),
      ruleHint: "задай в range шаг: range(начало, конец, шаг).",
      explain: "for i in range(2, 11, 2): print(i).",
    },
    {
      badge: "end",
      prompt: "Спроси число n и выведи n звёздочек в одну строку — циклом for.",
      start: "",
      tests: [
        { inputs: ["5"], expected: "*****" },
        { inputs: ["2"], expected: "**" },
      ],
      rule: (code) => uses(code, "for"),
      ruleHint: "используй цикл for, а не умножение строки.",
      explain: 'for i in range(n): print("*", end="") — end="" не переносит строку.',
    },
    {
      badge: "таблица",
      prompt: "Выведи таблицу умножения на 7 от 1 до 5 в виде: 7 x 1 = 7",
      start: "",
      tests: [{ inputs: [], expected: "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35" }],
      rule: (code) => uses(code, "for") && printCount(code) === 1,
      ruleHint: "один print внутри цикла.",
      explain: 'for i in range(1, 6): print("7 x", i, "=", 7 * i).',
    },
    {
      badge: "исправь отступ",
      prompt: "Python ругается на отступ. Исправь, чтобы вывелись 0, 1, 2.",
      start: "for i in range(3):\nprint(i)",
      tests: [{ inputs: [], expected: "0\n1\n2" }],
      explain: "Тело цикла пишут с отступом в 4 пробела.",
    },
    {
      badge: "сумма",
      prompt: "Спроси n и выведи сумму чисел от 1 до n.",
      start: "",
      tests: [
        { inputs: ["3"], expected: "6" },
        { inputs: ["100"], expected: "5050" },
      ],
      rule: (code) => uses(code, "for"),
      ruleHint: "посчитай сумму в цикле for.",
      explain: "сумма = 0, for i in range(1, n + 1): сумма += i, после цикла print(сумма).",
    },
    {
      badge: "буквы",
      prompt: "Спроси слово и выведи каждую букву дважды в одну строку: кот → ккоотт.",
      start: "",
      tests: [
        { inputs: ["кот"], expected: "ккоотт" },
        { inputs: ["да"], expected: "ддаа" },
      ],
      rule: (code) => uses(code, "for"),
      ruleHint: "перебери буквы циклом for.",
      explain: 'for б in слово: print(б * 2, end="").',
    },
    {
      badge: "счётчик",
      prompt: "Спроси слово и выведи, сколько в нём букв «а».",
      start: "",
      tests: [
        { inputs: ["банан"], expected: "2" },
        { inputs: ["кот"], expected: "0" },
        { inputs: ["абракадабра"], expected: "5" },
      ],
      rule: (code) => uses(code, "for"),
      ruleHint: "посчитай буквы в цикле for.",
      explain: 'счёт = 0, for б in слово: if б == "а": счёт += 1, после цикла print(счёт).',
    },
  ],
  cards: [
    { text: "range(5) даёт числа от 1 до 5.", answer: false, explain: "Нет, от 0 до 4: range начинает с нуля и не включает последнее число." },
    { text: "Строки тела цикла пишут с отступом.", answer: true, explain: "Да, по отступу Python понимает, что нужно повторять." },
    { text: "range(1, 10, 3) даёт 1, 4, 7.", answer: true, explain: "Да: от 1 с шагом 3, пока меньше 10." },
    { text: "for можно использовать, чтобы перебрать буквы слова.", answer: true, explain: "Да: for буква in \"кот\": — по одной букве на шаге." },
    { text: "print после цикла без отступа выполнится столько же раз, сколько цикл.", answer: false, explain: "Нет, один раз — когда цикл закончится." },
    { text: "range(5, 0, -1) считает 5, 4, 3, 2, 1.", answer: true, explain: "Да, отрицательный шаг считает назад, ноль не включается." },
    { text: "В строке с for в конце не нужно двоеточие.", answer: false, explain: "Нужно: for i in range(3): — иначе SyntaxError." },
    { text: "Переменную для суммы лучше создать внутри цикла.", answer: false, explain: "Нет, внутри она будет обнуляться на каждом шаге. Создают до цикла." },
    { text: 'print("*", end="") печатает звёздочку без перехода на новую строку.', answer: true, explain: "Да, end задаёт, что печатать в конце вместо переноса." },
    { text: "Переменная цикла всегда должна называться i.", answer: false, explain: "Нет, имя любое: for буква in слово:, for день in range(7):" },
  ],
};
