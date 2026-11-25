import { Code, passes, uses, type PythonTopicData } from "../PythonTopic";

const C = Code;

// The second if topic: joining conditions with and, or, not — and checking with in whether a text has a letter or a word.

export const LOGIC: PythonTopicData = {
  id: "python-logic",
  theory: {
    title: "Сложные условия: and, or, not, in",
    description: "Иногда одного сравнения мало: «от 7 до 12 лет», «суббота или воскресенье», «не пусто», «есть ли буква в слове». Для этого есть and, or, not и in.",
    parts: [
      {
        title: "and — «и»",
        text: (
          <>
            <C>and</C> соединяет два условия. Всё условие верно, только если верны <b>оба</b>: <C>age &gt;= 7 and age &lt;= 12</C> —
            «от 7 до 12». Если хоть одно ложно, всё условие — <C>False</C>.
          </>
        ),
        examples: [
          { code: 'age = 9\nif age >= 7 and age <= 12:\n    print("В клубе")', out: "В клубе" },
          { code: "print(5 > 3 and 2 > 1)\nprint(5 > 3 and 2 > 9)", out: "True\nFalse", note: "Во втором случае 2 > 9 — ложь, значит и всё ложно." },
        ],
      },
      {
        title: "or — «или»",
        text: (
          <>
            <C>or</C> — «или»: условие верно, если верно <b>хотя бы одно</b> из двух. <C>day == "сб" or day == "вс"</C> — выходной.
            Ложно оно, только когда ложны оба.
          </>
        ),
        examples: [
          { code: 'day = "вс"\nif day == "сб" or day == "вс":\n    print("Выходной")\nelse:\n    print("Учёба")', out: "Выходной" },
          { code: "print(1 > 2 or 3 > 2)\nprint(1 > 2 or 3 > 9)", out: "True\nFalse" },
        ],
      },
      {
        title: "not — «не»",
        text: (
          <>
            <C>not</C> переворачивает условие: <C>True</C> становится <C>False</C> и наоборот. <C>not x &gt; 10</C> — «x не больше
            10». Пустая строка считается «нет», поэтому <C>if not name:</C> значит «если имя пустое».
          </>
        ),
        examples: [
          { code: "print(not True)\nprint(not 5 > 3)", out: "False\nFalse" },
          { code: 'name = ""\nif not name:\n    print("Ты не ввёл имя")', out: "Ты не ввёл имя", note: "Пустая строка — это «нет», а not превращает его в «да»." },
        ],
      },
      {
        title: "in — «есть ли внутри»",
        text: (
          <>
            <C>in</C> проверяет, есть ли буква или кусочек текста внутри строки: <C>"о" in "кот"</C> — <C>True</C>.{" "}
            <C>not in</C> — наоборот, «нет внутри». Так удобно проверять ответ: <C>"да" in answer</C> сработает и для «да, конечно».
          </>
        ),
        examples: [
          { code: 'print("о" in "кот")\nprint("а" in "кот")\nprint("ко" in "кот")', out: "True\nFalse\nTrue" },
          { code: 'word = "пиксель"\nif "ь" not in word:\n    print("Без мягкого знака")\nelse:\n    print("С мягким знаком")', out: "С мягким знаком" },
        ],
      },
      {
        title: "Порядок и скобки",
        text: (
          <>
            Сначала Python считает сравнения, потом <C>not</C>, потом <C>and</C>, и только потом <C>or</C>. Чтобы не запутаться,
            ставь скобки: <C>(a or b) and c</C>. Ещё одна частая ошибка — <C>x == 1 or 2</C>: так писать нельзя, справа от{" "}
            <C>or</C> должно стоять полное сравнение: <C>x == 1 or x == 2</C>.
          </>
        ),
        examples: [
          { code: "x = 5\nprint(x == 1 or x == 2)", out: "False" },
          { code: 'x = 5\nif x == 1 or 2:\n    print("Сработало")', out: "Сработало", note: "Ошибка: 2 само по себе считается «да», и условие верно всегда." },
        ],
      },
    ],
  },
  game: {
    title: "Пиксель на входе в клуб",
    description: "Пять миссий: помоги роботу пропускать гостей, проверять дни, пароли и слова.",
    finish: "Пиксель разобрался со сложными условиями! Закрепим на практике.",
    missions: [
      {
        title: "Клуб юных роботов",
        body: (
          <p>
            В клуб берут от 7 до 12 лет включительно. Спроси возраст и выведи <C>Добро пожаловать</C> или <C>Клуб для 7–12 лет</C>.
            Пригодится <C>and</C>.
          </p>
        ),
        goal: "7 и 12 — «Добро пожаловать», 6 и 13 — «Клуб для 7–12 лет».",
        start: 'age = int(input("Сколько тебе лет? "))\n',
        check: (_r, _a, code) =>
          !uses(code, "and")
            ? "Соедини два условия через and."
            : passes(code, [
                  { inputs: ["7"], expected: "Добро пожаловать" },
                  { inputs: ["12"], expected: "Добро пожаловать" },
                  { inputs: ["6"], expected: "Клуб для 7–12 лет" },
                  { inputs: ["13"], expected: "Клуб для 7–12 лет" },
                ])
              ? true
              : "Условие: age >= 7 and age <= 12. Проверь и границы 7 и 12.",
      },
      {
        title: "Выходной!",
        body: (
          <p>
            Клуб открыт только по выходным. Спроси день (пн, вт, … вс). Если <C>сб</C> или <C>вс</C> — <C>Клуб открыт</C>, иначе —{" "}
            <C>Приходи в выходные</C>.
          </p>
        ),
        goal: "сб и вс → Клуб открыт, ср → Приходи в выходные.",
        start: 'day = input("День: ")\n',
        check: (_r, _a, code) =>
          !uses(code, "or")
            ? "Соедини два сравнения через or."
            : passes(code, [
                  { inputs: ["сб"], expected: "Клуб открыт" },
                  { inputs: ["вс"], expected: "Клуб открыт" },
                  { inputs: ["ср"], expected: "Приходи в выходные" },
                ])
              ? true
              : 'Условие: day == "сб" or day == "вс".',
      },
      {
        title: "Пустой ответ",
        body: (
          <p>
            Гость должен назвать имя. Если он просто нажал Enter (имя пустое) — выведи <C>Назови себя</C>, иначе — <C>Привет, …!</C>.
            Используй <C>not</C>.
          </p>
        ),
        goal: "Пустой ответ → Назови себя, Оля → Привет, Оля!",
        start: 'name = input("Имя: ")\n',
        check: (_r, _a, code) =>
          !uses(code, "not")
            ? "Проверь пустое имя через not: if not name:"
            : passes(code, [
                  { inputs: [""], expected: "Назови себя" },
                  { inputs: ["Оля"], expected: "Привет, Оля!" },
                ])
              ? true
              : 'if not name: print("Назови себя"), else: print("Привет, " + name + "!")',
      },
      {
        title: "Волшебная буква",
        body: (
          <p>
            Пароль в клуб — любое слово с буквой <C>ж</C>. Спроси слово. Если в нём есть <C>ж</C> — <C>Проходи</C>, иначе —{" "}
            <C>Не тот пароль</C>.
          </p>
        ),
        goal: "жук → Проходи, кот → Не тот пароль.",
        start: 'word = input("Пароль: ")\n',
        check: (_r, _a, code) =>
          !uses(code, "in")
            ? 'Проверь букву через in: "ж" in word.'
            : passes(code, [
                  { inputs: ["жук"], expected: "Проходи" },
                  { inputs: ["ножик"], expected: "Проходи" },
                  { inputs: ["кот"], expected: "Не тот пароль" },
                ])
              ? true
              : 'if "ж" in word: print("Проходи"), else: print("Не тот пароль").',
      },
      {
        title: "Билет со скидкой",
        body: (
          <p>
            Скидку дают детям до 10 лет <b>или</b> тем, у кого есть карта клуба. Спроси возраст, потом «Есть карта?» (да/нет). Выведи{" "}
            <C>Скидка</C> или <C>Полная цена</C>.
          </p>
        ),
        goal: "8 и нет → Скидка, 15 и да → Скидка, 15 и нет → Полная цена.",
        start: 'age = int(input("Возраст: "))\ncard = input("Есть карта? ")\n',
        check: (_r, _a, code) =>
          passes(code, [
            { inputs: ["8", "нет"], expected: "Скидка" },
            { inputs: ["15", "да"], expected: "Скидка" },
            { inputs: ["15", "нет"], expected: "Полная цена" },
            { inputs: ["10", "нет"], expected: "Полная цена" },
          ])
            ? true
            : 'Условие: age < 10 or card == "да".',
      },
    ],
  },
  levels: [
    {
      badge: "and",
      prompt: "Спроси число. Если оно от 1 до 10 включительно — «В диапазоне», иначе — «Вне диапазона».",
      start: "",
      tests: [
        { inputs: ["1"], expected: "В диапазоне" },
        { inputs: ["10"], expected: "В диапазоне" },
        { inputs: ["0"], expected: "Вне диапазона" },
        { inputs: ["11"], expected: "Вне диапазона" },
      ],
      rule: (code) => uses(code, "and"),
      ruleHint: "соедини два сравнения через and.",
      explain: "if n >= 1 and n <= 10: — and требует, чтобы оба условия были верны.",
    },
    {
      badge: "or",
      prompt: "Спроси день недели (пн, вт, …). Если сб или вс — «Выходной», иначе — «Учёба».",
      start: "",
      tests: [
        { inputs: ["сб"], expected: "Выходной" },
        { inputs: ["вс"], expected: "Выходной" },
        { inputs: ["ср"], expected: "Учёба" },
      ],
      rule: (code) => uses(code, "or"),
      ruleHint: "объедини два условия через or.",
      explain: 'if day == "сб" or day == "вс": — or хватает одного верного условия.',
    },
    {
      badge: "not",
      prompt: "Спроси число. Если оно НЕ больше 100 — «Можно», иначе — «Слишком много». Используй not.",
      start: "",
      tests: [
        { inputs: ["50"], expected: "Можно" },
        { inputs: ["100"], expected: "Можно" },
        { inputs: ["101"], expected: "Слишком много" },
      ],
      rule: (code) => uses(code, "not"),
      ruleHint: "используй not.",
      explain: "if not n > 100: — not переворачивает условие n > 100.",
    },
    {
      badge: "in",
      prompt: "Спроси слово. Если в нём есть буква «а» — «Есть а», иначе — «Нет а».",
      start: "",
      tests: [
        { inputs: ["мама"], expected: "Есть а" },
        { inputs: ["кот"], expected: "Нет а" },
      ],
      rule: (code) => uses(code, "in"),
      ruleHint: "проверь букву через in.",
      explain: 'word = input(), if "а" in word: print("Есть а"), else: print("Нет а").',
    },
    {
      badge: "not in",
      prompt: "Спроси пароль. Если в нём нет цифры 7 — «Добавь семёрку», иначе — «Отличный пароль».",
      start: "",
      tests: [
        { inputs: ["pixel"], expected: "Добавь семёрку" },
        { inputs: ["pixel7"], expected: "Отличный пароль" },
      ],
      rule: (code) => /not\s+in/.test(code),
      ruleHint: "используй not in.",
      explain: 'if "7" not in password: print("Добавь семёрку"), else: print("Отличный пароль").',
    },
    {
      badge: "исправь ошибку",
      prompt: "Программа должна говорить «Один или два» только для 1 и 2, а говорит это всегда. Исправь условие.",
      start: 'x = int(input())\nif x == 1 or 2:\n    print("Один или два")\nelse:\n    print("Другое")',
      tests: [
        { inputs: ["1"], expected: "Один или два" },
        { inputs: ["2"], expected: "Один или два" },
        { inputs: ["5"], expected: "Другое" },
      ],
      explain: "Справа от or нужно полное сравнение: if x == 1 or x == 2:",
    },
    {
      badge: "and + or",
      prompt: "В кино пускают с 12 лет, а младших — только со взрослым. Спроси возраст и «Со взрослым?» (да/нет). Выведи «Проходи» или «Нельзя».",
      start: "",
      tests: [
        { inputs: ["14", "нет"], expected: "Проходи" },
        { inputs: ["9", "да"], expected: "Проходи" },
        { inputs: ["9", "нет"], expected: "Нельзя" },
        { inputs: ["12", "нет"], expected: "Проходи" },
      ],
      explain: 'age = int(input()), adult = input(), if age >= 12 or adult == "да": print("Проходи"), else: print("Нельзя").',
    },
    {
      badge: "in в ответе",
      prompt: "Спроси «Тебе нравится Python?». Если в ответе есть слово «да» (например, «да, очень») — «Ура!», иначе — «Ещё полюбишь».",
      start: "",
      tests: [
        { inputs: ["да, очень"], expected: "Ура!" },
        { inputs: ["да"], expected: "Ура!" },
        { inputs: ["пока нет"], expected: "Ещё полюбишь" },
      ],
      rule: (code) => uses(code, "in"),
      ruleHint: "проверь через in, есть ли «да» в ответе.",
      explain: 'answer = input(), if "да" in answer: print("Ура!"), else: print("Ещё полюбишь").',
    },
    {
      badge: "три условия",
      prompt: "Спроси три оценки. Если все три — пятёрки, выведи «Отличник», иначе — «Старайся!».",
      start: "",
      tests: [
        { inputs: ["5", "5", "5"], expected: "Отличник" },
        { inputs: ["5", "4", "5"], expected: "Старайся!" },
        { inputs: ["3", "5", "5"], expected: "Старайся!" },
      ],
      rule: (code) => uses(code, "and"),
      ruleHint: "соедини три сравнения через and.",
      explain: "if a == 5 and b == 5 and c == 5: — and можно ставить сколько угодно раз.",
    },
    {
      badge: "скобки",
      prompt: "Спроси число. Выведи «Подходит», если оно чётное и при этом больше 10 или меньше -10. Иначе — «Не подходит».",
      start: "",
      tests: [
        { inputs: ["12"], expected: "Подходит" },
        { inputs: ["-12"], expected: "Подходит" },
        { inputs: ["11"], expected: "Не подходит" },
        { inputs: ["4"], expected: "Не подходит" },
      ],
      explain: "if n % 2 == 0 and (n > 10 or n < -10): — скобки нужны, чтобы or посчитался раньше and.",
    },
  ],
  cards: [
    { text: "Условие a > 0 and a < 10 верно для a = 15.", answer: false, explain: "Нет: and требует обоих условий, а 15 < 10 — ложь." },
    { text: 'Условие day == "сб" or day == "вс" верно для воскресенья.', answer: true, explain: "Да, or хватает одного верного условия." },
    { text: "not True — это False.", answer: true, explain: "Да, not переворачивает значение." },
    { text: '"о" in "кот" — это True.', answer: true, explain: "Да, буква «о» есть в слове «кот»." },
    { text: '"а" not in "кот" — это False.', answer: false, explain: "Нет, True: буквы «а» в слове «кот» нет." },
    { text: "x == 1 or 2 проверяет, равен ли x единице или двойке.", answer: false, explain: "Нет, нужно x == 1 or x == 2. Иначе условие верно всегда." },
    { text: "and выполняется раньше, чем or.", answer: true, explain: "Да. Чтобы изменить порядок, ставят скобки." },
    { text: "Условие с or ложно, только если ложны оба сравнения.", answer: true, explain: "Да, одного верного уже хватает, чтобы всё было верно." },
    { text: 'if not name: сработает, если name = "".', answer: true, explain: "Да, пустая строка — это «нет», а not делает её «да»." },
    { text: "and можно использовать только один раз в условии.", answer: false, explain: "Нет, можно соединить сколько угодно условий: a and b and c." },
  ],
};
