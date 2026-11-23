import { Code, passes, uses, type PythonTopicData } from "../PythonTopic";

const C = Code;

// The if topic: if, comparisons, else, elif. The operators and, or, not and in come later — in their own topic.

export const CONDITIONS: PythonTopicData = {
  id: "python-if",
  theory: {
    title: "Как программа выбирает: if",
    description: "Программа может поступать по-разному в зависимости от ответа. Разберём if, else, elif, сравнения и частые ошибки.",
    parts: [
      {
        title: "if — «если»",
        text: (
          <>
            После <C>if</C> пишут условие и двоеточие <C>:</C>. Строки, которые выполняются «если да», начинаются с отступа —
            четырёх пробелов (клавиша Tab). Если условие неверно, эти строки пропускаются.
          </>
        ),
        examples: [
          { code: 'x = 15\nif x > 10:\n    print("Много!")\nprint("Готово")', out: "Много!\nГотово" },
          { code: 'x = 3\nif x > 10:\n    print("Много!")\nprint("Готово")', out: "Готово", note: "Условие ложно — строку с отступом пропустили." },
        ],
      },
      {
        title: "Сравнения",
        text: (
          <>
            <C>==</C> равно, <C>!=</C> не равно, <C>&lt;</C> меньше, <C>&gt;</C> больше, <C>&lt;=</C> меньше или равно,{" "}
            <C>&gt;=</C> больше или равно. Важно: в условии пишут два знака <C>==</C>. Один <C>=</C> — это запись в переменную,
            и Python выдаст ошибку. Каждое сравнение — это вопрос, и Python отвечает на него <C>True</C> (да, правда) или{" "}
            <C>False</C> (нет): <C>5 &gt; 3</C> — это <C>True</C>, а <C>7 % 2 == 0</C> — <C>False</C>, ведь остаток от деления 7 на 2 равен 1.
          </>
        ),
        examples: [
          { code: 'password = "pixel"\nif password == "pixel":\n    print("Дверь открыта")', out: "Дверь открыта" },
          { code: "if x = 5:\n    print(x)", out: "SyntaxError: invalid syntax. Maybe you meant '==' …", error: true, note: "Для сравнения нужно ==." },
        ],
      },
      {
        title: "else — «иначе» и elif — «а если»",
        text: (
          <>
            <C>else:</C> выполняется, когда условие не подошло. <C>elif</C> проверяет следующее условие, если предыдущее не
            подошло. Python идёт сверху вниз и выполняет только первую подходящую ветку.
          </>
        ),
        examples: [
          { code: 'age = 10\nif age >= 18:\n    print("Взрослый")\nelse:\n    print("Ребёнок")', out: "Ребёнок" },
          { code: 't = 18\nif t < 10:\n    print("Холодно")\nelif t < 25:\n    print("Тепло")\nelse:\n    print("Жарко")', out: "Тепло" },
        ],
      },
      {
        title: "Сравниваем текст",
        text: (
          <>
            Текст тоже можно сравнивать: <C>==</C> и <C>!=</C> проверяют, совпадает ли он буква в букву. Большие и маленькие буквы
            различаются: <C>"Да" == "да"</C> — это <C>False</C>. Поэтому ответ часто приводят к маленьким буквам:{" "}
            <C>answer.lower() == "да"</C>.
          </>
        ),
        examples: [
          { code: 'answer = "Да"\nif answer == "да":\n    print("Ура!")\nelse:\n    print("Не совпало")', out: "Не совпало", note: "«Да» с большой буквы — другой текст." },
          { code: 'answer = "Да"\nif answer.lower() == "да":\n    print("Ура!")', out: "Ура!" },
        ],
      },
      {
        title: "Частые ошибки",
        text: (
          <>
            Забыли двоеточие в конце строки с <C>if</C>, забыли отступ, или сравнивают ответ из <C>input</C> с числом. Ответ{" "}
            <C>input</C> — текст, поэтому <C>"5" &gt; 3</C> даст ошибку: оберни ответ в <C>int(...)</C>. Чётность проверяют
            остатком: <C>n % 2 == 0</C>.
          </>
        ),
        examples: [
          { code: 'if 5 > 3\n    print("да")', out: "SyntaxError: expected ':'", error: true, note: "Не хватает двоеточия." },
          { code: 'n = int(input("Число: "))\nif n % 2 == 0:\n    print("Чётное")\nelse:\n    print("Нечётное")', out: "Число: 7\nНечётное" },
        ],
      },
    ],
  },
  game: {
    title: "Пиксель охраняет базу",
    description: "Пять миссий: научи робота проверять пароли, погоду и заряд батареи — и решать, что ответить.",
    finish: "Все миссии пройдены — Пиксель научился принимать решения! Закрепим на практике.",
    missions: [
      {
        title: "Секретный пароль",
        body: (
          <p>
            Пиксель охраняет дверь. Спроси пароль через <C>input</C>. Если ввели <C>pixel</C>, выведи <C>Дверь открыта</C>. Не
            забудь двоеточие и отступ.
          </p>
        ),
        goal: "При пароле pixel — «Дверь открыта», при другом пароле — ничего.",
        start: 'password = input("Пароль: ")\n',
        check: (_r, _a, code) =>
          passes(code, [
            { inputs: ["pixel"], expected: "Дверь открыта" },
            { inputs: ["12345"], expected: "" },
          ])
            ? true
            : "При pixel — «Дверь открыта», при любом другом пароле программа ничего не печатает.",
      },
      {
        title: "Иначе — тревога",
        body: (
          <p>
            Теперь при неверном пароле робот должен сказать <C>Доступ запрещён</C>. Добавь <C>else:</C> — на том же уровне, что{" "}
            <C>if</C>.
          </p>
        ),
        goal: "pixel → «Дверь открыта», всё остальное → «Доступ запрещён».",
        start: 'password = input("Пароль: ")\nif password == "pixel":\n    print("Дверь открыта")\n',
        check: (_r, _a, code) =>
          passes(code, [
            { inputs: ["pixel"], expected: "Дверь открыта" },
            { inputs: ["qwerty"], expected: "Доступ запрещён" },
          ])
            ? true
            : "Добавь else: и под ним с отступом print(\"Доступ запрещён\").",
      },
      {
        title: "Прогноз погоды",
        body: (
          <p>
            Спроси температуру числом. Меньше 10 — <C>Холодно</C>, меньше 25 — <C>Тепло</C>, иначе — <C>Жарко</C>. Используй{" "}
            <C>elif</C>.
          </p>
        ),
        goal: "5 → Холодно, 18 → Тепло, 30 → Жарко.",
        start: 't = int(input("Температура: "))\n',
        check: (_r, _a, code) =>
          !uses(code, "elif")
            ? "Используй elif для второго условия."
            : passes(code, [
                  { inputs: ["5"], expected: "Холодно" },
                  { inputs: ["18"], expected: "Тепло" },
                  { inputs: ["30"], expected: "Жарко" },
                  { inputs: ["10"], expected: "Тепло" },
                ])
              ? true
              : "Проверь границы: 10 — уже тепло, 25 — уже жарко.",
      },
      {
        title: "Заряд батареи",
        body: (
          <p>
            Пиксель проверяет свою батарею. Спроси заряд в процентах. Меньше 20 — <C>Нужна зарядка</C>, меньше 80 —{" "}
            <C>Можно работать</C>, иначе — <C>Полный заряд</C>.
          </p>
        ),
        goal: "10 → Нужна зарядка, 50 → Можно работать, 95 → Полный заряд.",
        start: 'battery = int(input("Заряд: "))\n',
        check: (_r, _a, code) =>
          passes(code, [
            { inputs: ["10"], expected: "Нужна зарядка" },
            { inputs: ["20"], expected: "Можно работать" },
            { inputs: ["79"], expected: "Можно работать" },
            { inputs: ["80"], expected: "Полный заряд" },
          ])
            ? true
            : "Три ветки: if battery < 20, elif battery < 80, else. Проверь границы 20 и 80.",
      },
      {
        title: "Чёт или нечет",
        body: (
          <p>
            Спроси число и выведи <C>Чётное</C> или <C>Нечётное</C>. Чётное число делится на 2 без остатка: <C>n % 2 == 0</C>.
          </p>
        ),
        goal: "4 → Чётное, 7 → Нечётное.",
        start: "",
        check: (_r, _a, code) =>
          passes(code, [
            { inputs: ["4"], expected: "Чётное" },
            { inputs: ["7"], expected: "Нечётное" },
            { inputs: ["0"], expected: "Чётное" },
          ])
            ? true
            : "Сравни остаток от деления на 2 с нулём: if n % 2 == 0.",
      },
    ],
  },
  levels: [
    {
      badge: "напиши сам",
      prompt: "Спроси число. Если оно больше 0, выведи «Положительное». Иначе ничего не печатай.",
      start: "",
      tests: [
        { inputs: ["5"], expected: "Положительное" },
        { inputs: ["-3"], expected: "" },
        { inputs: ["0"], expected: "" },
      ],
      explain: 'n = int(input()), затем if n > 0: и с отступом print("Положительное").',
    },
    {
      badge: "исправь ошибку",
      prompt: "Python ругается на строку с if. Исправь.",
      start: 'x = int(input("Число: "))\nif x > 10\n    print("Больше 10")',
      tests: [
        { inputs: ["20"], expected: "Больше 10" },
        { inputs: ["3"], expected: "" },
      ],
      explain: "В конце строки с if нужно двоеточие: if x > 10:",
    },
    {
      badge: "исправь ошибку",
      prompt: "Робот должен радоваться ответу «да», но программа не запускается.",
      start: 'answer = input("Играем? ")\nif answer = "да":\n    print("Ура!")',
      tests: [
        { inputs: ["да"], expected: "Ура!" },
        { inputs: ["нет"], expected: "" },
      ],
      explain: 'Для сравнения пишут два знака: if answer == "да":',
    },
    {
      badge: "else",
      prompt: "Спроси возраст. если возраст больше или равен 18 (age >= 18) — «Взрослый», иначе — «Ребёнок».",
      start: "",
      tests: [
        { inputs: ["18"], expected: "Взрослый" },
        { inputs: ["40"], expected: "Взрослый" },
        { inputs: ["11"], expected: "Ребёнок" },
      ],
      rule: (code) => uses(code, "else"),
      ruleHint: "используй else.",
      explain: 'age = int(input()), if age >= 18: print("Взрослый"), else: print("Ребёнок").',
    },
    {
      badge: "исправь отступ",
      prompt: "Python ждёт отступ. Исправь программу.",
      start: 'n = int(input())\nif n == 7:\nprint("Счастливое число")',
      tests: [
        { inputs: ["7"], expected: "Счастливое число" },
        { inputs: ["8"], expected: "" },
      ],
      explain: "Строку под if начинают с 4 пробелов (Tab): так Python понимает, что она внутри условия.",
    },
    {
      badge: "elif",
      prompt: "Спроси оценку: 5 — «Отлично», 4 — «Хорошо», 3 — «Удовлетворительно», остальное — «Попробуй ещё».",
      start: "",
      tests: [
        { inputs: ["5"], expected: "Отлично" },
        { inputs: ["4"], expected: "Хорошо" },
        { inputs: ["3"], expected: "Удовлетворительно" },
        { inputs: ["2"], expected: "Попробуй ещё" },
      ],
      rule: (code) => uses(code, "elif"),
      ruleHint: "используй elif.",
      explain: "grade = int(input()), потом if grade == 5: …, elif grade == 4: …, elif grade == 3: …, else: …",
    },
    {
      badge: "без max",
      prompt: "Спроси два числа и выведи большее из них. Функцию max не используй.",
      start: "",
      tests: [
        { inputs: ["3", "8"], expected: "8" },
        { inputs: ["10", "2"], expected: "10" },
        { inputs: ["5", "5"], expected: "5" },
      ],
      rule: (code) => !uses(code, "max") && uses(code, "if"),
      ruleHint: "сравни числа через if, без max.",
      explain: "if a > b: print(a), else: print(b).",
    },
    {
      badge: "!=",
      prompt: "Спроси секретное слово. Если это не «пиксель», выведи «Неверно». Если «пиксель» — ничего не печатай.",
      start: "",
      tests: [
        { inputs: ["кот"], expected: "Неверно" },
        { inputs: ["пиксель"], expected: "" },
      ],
      rule: (code) => /!=/.test(code),
      ruleHint: "используй сравнение != («не равно»).",
      explain: 'word = input(), if word != "пиксель": print("Неверно").',
    },
    {
      badge: "текст",
      prompt: "Спроси «Продолжить?». Если ответили «да» любыми буквами (да, Да, ДА) — «Продолжаем», иначе — «Стоп».",
      start: "",
      tests: [
        { inputs: ["Да"], expected: "Продолжаем" },
        { inputs: ["ДА"], expected: "Продолжаем" },
        { inputs: ["нет"], expected: "Стоп" },
      ],
      rule: (code) => uses(code, "lower") || uses(code, "upper"),
      ruleHint: "приведи ответ к одному виду: answer.lower().",
      explain: 'answer = input(), if answer.lower() == "да": print("Продолжаем"), else: print("Стоп").',
    },
    {
      badge: "остаток",
      prompt: "Спроси число. Если оно делится на 3 — «Делится на 3», иначе — «Не делится».",
      start: "",
      tests: [
        { inputs: ["9"], expected: "Делится на 3" },
        { inputs: ["10"], expected: "Не делится" },
        { inputs: ["0"], expected: "Делится на 3" },
      ],
      explain: "if n % 3 == 0: — остаток 0 значит «делится без остатка».",
    },
  ],
  cards: [
    { text: "В конце строки с if ставят двоеточие.", answer: true, explain: "Да: if x > 0: — без двоеточия будет SyntaxError." },
    { text: "Строки внутри if пишут с отступом.", answer: true, explain: "Да, обычно 4 пробела. По отступу Python понимает, что относится к условию." },
    { text: "Для сравнения в условии пишут один знак =.", answer: false, explain: "Нет, два: ==. Один = записывает значение в переменную." },
    { text: "else выполняется, когда условие в if оказалось ложным.", answer: true, explain: "Да, else — это «иначе»." },
    { text: "Если подошли и if, и elif, выполнятся обе ветки.", answer: false, explain: "Нет, Python выполняет только первую подходящую ветку и дальше не смотрит." },
    { text: '"Да" == "да" — это True.', answer: false, explain: "Нет, большие и маленькие буквы различаются. Помогает .lower()." },
    { text: "elif можно написать без if перед ним.", answer: false, explain: "Нет, elif и else продолжают if — сами по себе они не работают." },
    { text: "7 % 2 == 0 — это True.", answer: false, explain: "Нет, остаток от деления 7 на 2 равен 1. Число 7 нечётное." },
    { text: '"5" > 3 сработает, ведь там пятёрка.', answer: false, explain: "Нет, \"5\" — текст, его нельзя сравнить с числом. Нужно int(\"5\")." },
    { text: "!= значит «не равно».", answer: true, explain: "Да: if answer != \"да\": — сработает при любом ответе, кроме «да»." },
  ],
};
