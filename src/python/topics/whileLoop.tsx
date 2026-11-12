import { runPython } from "../interpreter";
import { Code, passes, uses, type PythonTopicData } from "../PythonTopic";

const C = Code;
const whileNotFor = (code: string) => uses(code, "while") && !uses(code, "for");

export const WHILE_LOOP: PythonTopicData = {
  id: "python-while",
  theory: {
    title: "Как работает цикл while",
    description: "while повторяет, пока условие верно. Разберём счётчик, бесконечный цикл, break и continue — и когда брать for, а когда while.",
    parts: [
      {
        title: "while — «пока»",
        text: (
          <>
            <C>while условие:</C> повторяет тело цикла, <b>пока</b> условие верно. Перед каждым повтором Python заново
            проверяет условие. Поэтому внутри цикла что-то должно меняться — обычно счётчик: <C>i += 1</C>.
          </>
        ),
        examples: [
          { code: "i = 1\nwhile i <= 3:\n    print(i)\n    i += 1", out: "1\n2\n3" },
          { code: 'энергия = 3\nwhile энергия > 0:\n    print("Работаю!")\n    энергия -= 1\nprint("Устал")', out: "Работаю!\nРаботаю!\nРаботаю!\nУстал" },
        ],
      },
      {
        title: "Бесконечный цикл",
        text: (
          <>
            Если забыть изменить переменную из условия, условие останется верным навсегда, и цикл никогда не закончится. В
            тренажёре программа остановится сама и подскажет, что случилось. Проверяй: что внутри цикла приближает конец?
          </>
        ),
        examples: [
          { code: "i = 1\nwhile i <= 3:\n    print(i)", out: "Цикл никогда не заканчивается…", error: true, note: "Не хватает i += 1 — i всегда равно 1." },
          { code: "i = 1\nwhile i <= 3:\n    print(i)\n    i += 1", out: "1\n2\n3", note: "Теперь i растёт и на 4 цикл останавливается." },
        ],
      },
      {
        title: "Пока не ответят правильно",
        text: (
          <>
            while удобен, когда заранее неизвестно, сколько будет повторов: например, спрашивать, пока человек не введёт
            нужный ответ. Переменную для ответа создают до цикла, чтобы условие было что проверить.
          </>
        ),
        examples: [
          { code: 'ответ = ""\nwhile ответ != "да":\n    ответ = input("Готов? ")\nprint("Поехали!")', out: "Готов? нет\nГотов? да\nПоехали!" },
        ],
      },
      {
        title: "break и continue",
        text: (
          <>
            <C>break</C> сразу выходит из цикла. <C>continue</C> пропускает остаток тела и переходит к следующему повтору. С{" "}
            <C>while True:</C> и <C>break</C> пишут цикл «до победы»: условие всегда верно, а выход — по break.
          </>
        ),
        examples: [
          { code: 'while True:\n    n = int(input("Число: "))\n    if n == 7:\n        print("Угадал!")\n        break', out: "Число: 3\nЧисло: 7\nУгадал!" },
          { code: "i = 0\nwhile i < 5:\n    i += 1\n    if i == 3:\n        continue\n    print(i)", out: "1\n2\n4\n5", note: "На тройке continue пропустил print." },
        ],
      },
      {
        title: "for или while?",
        text: (
          <>
            Знаешь, сколько раз повторять, или перебираешь буквы — бери <C>for</C>. Повторяешь, пока что-то не случится
            (правильный ответ, копилка наполнилась) — бери <C>while</C>.
          </>
        ),
        examples: [
          { code: "for i in range(3):\n    print(i)", out: "0\n1\n2", note: "Количество повторов известно — for." },
          { code: "копилка = 0\nwhile копилка < 100:\n    копилка += 30\nprint(копилка)", out: "120", note: "Повторяем, пока не наберётся 100 — while." },
        ],
      },
    ],
  },
  game: {
    title: "Пиксель и бесконечность",
    description: "Пять миссий: робот считает, чинит вечный цикл, ждёт вежливого слова, копит монеты и играет в угадайку.",
    finish: "Все миссии пройдены — Пиксель знает, когда остановиться! Закрепим на практике.",
    missions: [
      {
        title: "Счётчик",
        body: (
          <p>
            Выведи числа от 1 до 5 циклом <C>while</C>. Начни с <C>i = 1</C> и не забудь внутри цикла <C>i += 1</C>.
          </p>
        ),
        goal: "Числа 1, 2, 3, 4, 5 по одному в строке.",
        start: "i = 1\nwhile i <= 5:\n    ",
        check: (r, _a, code) =>
          r.printed !== "1\n2\n3\n4\n5\n" ? "Нужны числа от 1 до 5 по одному в строке." : !whileNotFor(code) ? "Используй while, а не for." : true,
      },
      {
        title: "Почини вечный цикл",
        body: <p>Эта программа никогда не заканчивается: Пиксель застрял! Найди, чего не хватает, и почини.</p>,
        goal: "Программа печатает 0, 1, 2 и останавливается.",
        start: "i = 0\nwhile i < 3:\n    print(i)",
        check: (r) => (r.printed === "0\n1\n2\n" ? true : "Внутри цикла i должна расти: i += 1."),
      },
      {
        title: "Волшебное слово",
        body: (
          <p>
            Пиксель не откроет ворота, пока не услышит «пожалуйста». Спрашивай <C>Скажи волшебное слово: </C>, пока ответ не
            станет <C>пожалуйста</C>, а потом выведи <C>Спасибо!</C>.
          </p>
        ),
        goal: "Запусти и попробуй ответить неправильно, а потом — «пожалуйста».",
        start: 'слово = ""\n',
        check: (_r, _a, code) => {
          const r = runPython(code, ["нет", "открой", "пожалуйста"]);
          if (r.error || r.waiting) return "Цикл должен спрашивать снова, пока не скажут «пожалуйста».";
          return r.prompts.length === 3 && r.printed.trim() === "Спасибо!" ? true : "Спрашивай в цикле while слово != \"пожалуйста\", а «Спасибо!» выведи после цикла.";
        },
      },
      {
        title: "Копилка",
        body: (
          <p>
            Пиксель кладёт в копилку по 30 монет, пока в ней меньше 100. Выведи, сколько монет получилось в итоге. Пусть
            посчитает цикл.
          </p>
        ),
        goal: "В терминале должно появиться: 120",
        start: "копилка = 0\n",
        check: (r, _a, code) =>
          r.printed.trim() !== "120" ? "Должно получиться 120." : !uses(code, "while") || /120/.test(code) ? "Пусть считает цикл while, а не готовое число." : true,
      },
      {
        title: "Угадай число",
        body: (
          <p>
            Пиксель загадал 7. В цикле <C>while True:</C> спрашивай число. Если не угадали — <C>Не то</C>, если угадали —{" "}
            <C>Угадал!</C> и <C>break</C>.
          </p>
        ),
        goal: "3 → Не то, 9 → Не то, 7 → Угадал! и конец.",
        start: "секрет = 7\nwhile True:\n    ",
        check: (_r, _a, code) =>
          !uses(code, "break")
            ? "Выйди из цикла с помощью break."
            : passes(code, [
                  { inputs: ["3", "9", "7"], expected: "Не то\nНе то\nУгадал!" },
                  { inputs: ["7"], expected: "Угадал!" },
                ])
              ? true
              : "Спроси n = int(input()), сравни с секретом: угадал — print и break, иначе — «Не то».",
      },
    ],
  },
  levels: [
    {
      badge: "напиши сам",
      prompt: "Выведи числа от 1 до 5 циклом while (не for).",
      start: "",
      tests: [{ inputs: [], expected: "1\n2\n3\n4\n5" }],
      rule: whileNotFor,
      ruleHint: "используй while, а не for.",
      explain: "i = 1, while i <= 5: print(i) и i += 1.",
    },
    {
      badge: "исправь ошибку",
      prompt: "Цикл никогда не заканчивается. Исправь, чтобы вывелись 0, 1, 2.",
      start: "i = 0\nwhile i < 3:\n    print(i)",
      tests: [{ inputs: [], expected: "0\n1\n2" }],
      explain: "Внутри цикла не хватало i += 1: без него i всегда 0, и условие вечно верно.",
    },
    {
      badge: "отсчёт",
      prompt: "Спроси число n и выведи обратный отсчёт от n до 1 циклом while.",
      start: "",
      tests: [
        { inputs: ["3"], expected: "3\n2\n1" },
        { inputs: ["5"], expected: "5\n4\n3\n2\n1" },
      ],
      rule: whileNotFor,
      ruleHint: "используй while.",
      explain: "while n > 0: print(n) и n -= 1.",
    },
    {
      badge: "копим",
      prompt: "Начни с 0 и прибавляй по 7, пока сумма меньше 50. Выведи итоговую сумму.",
      start: "",
      tests: [{ inputs: [], expected: "56" }],
      rule: (code) => uses(code, "while") && !/56/.test(code),
      ruleHint: "пусть сумму посчитает цикл while.",
      explain: "сумма = 0, while сумма < 50: сумма += 7, потом print(сумма). Последний шаг: 49 → 56.",
    },
    {
      badge: "до стоп-слова",
      prompt: "Спрашивай слово, пока не введут «стоп». После этого выведи «Конец».",
      start: "",
      tests: [
        { inputs: ["кот", "дом", "стоп"], expected: "Конец" },
        { inputs: ["стоп"], expected: "Конец" },
      ],
      rule: (code) => uses(code, "while"),
      ruleHint: "спрашивай в цикле while.",
      explain: 'слово = "", while слово != "стоп": слово = input(), после цикла print("Конец").',
    },
    {
      badge: "сумма до нуля",
      prompt: "Спрашивай числа, пока не введут 0. Выведи сумму введённых чисел.",
      start: "",
      tests: [
        { inputs: ["5", "3", "0"], expected: "8" },
        { inputs: ["0"], expected: "0" },
        { inputs: ["10", "-4", "1", "0"], expected: "7" },
      ],
      rule: (code) => uses(code, "while"),
      ruleHint: "используй цикл while.",
      explain: "сумма = 0, n = int(input()), while n != 0: сумма += n и снова n = int(input()), потом print(сумма).",
    },
    {
      badge: "break",
      prompt: "С помощью while True и break выведи 1, 2, 3.",
      start: "i = 1\nwhile True:\n    ",
      tests: [{ inputs: [], expected: "1\n2\n3" }],
      rule: (code) => uses(code, "break") && uses(code, "while"),
      ruleHint: "выйди из while True с помощью break.",
      explain: "Внутри: print(i), i += 1, а if i > 3: break.",
    },
    {
      badge: "удвоение",
      prompt: "Спроси число и удваивай его, пока оно меньше 100. Выведи результат.",
      start: "",
      tests: [
        { inputs: ["1"], expected: "128" },
        { inputs: ["3"], expected: "192" },
        { inputs: ["150"], expected: "150" },
      ],
      rule: (code) => uses(code, "while"),
      ruleHint: "удваивай в цикле while.",
      explain: "while n < 100: n *= 2, потом print(n). Если число сразу больше 100, цикл не выполнится ни разу.",
    },
    {
      badge: "цифры",
      prompt: "Спроси целое положительное число и выведи, сколько в нём цифр. Используй // в цикле.",
      start: "",
      tests: [
        { inputs: ["12345"], expected: "5" },
        { inputs: ["7"], expected: "1" },
        { inputs: ["1000"], expected: "4" },
      ],
      rule: (code) => uses(code, "while") && !uses(code, "len"),
      ruleHint: "считай цифры в цикле while через //, без len.",
      explain: "счёт = 0, while n > 0: n //= 10 и счёт += 1. Каждое // 10 отбрасывает одну цифру.",
    },
    {
      badge: "continue",
      prompt: "Выведи числа от 1 до 10, кроме тех, что делятся на 3. Используй while и continue.",
      start: "",
      tests: [{ inputs: [], expected: "1\n2\n4\n5\n7\n8\n10" }],
      rule: (code) => uses(code, "continue") && whileNotFor(code),
      ruleHint: "используй while и continue.",
      explain: "i = 0, while i < 10: i += 1, if i % 3 == 0: continue, print(i). Увеличиваем i до continue, иначе цикл станет вечным.",
    },
  ],
  cards: [
    { text: "while повторяет тело, пока условие верно.", answer: true, explain: "Да, перед каждым повтором условие проверяется заново." },
    { text: "Если внутри while ничего не меняется, цикл может стать бесконечным.", answer: true, explain: "Да, условие так и останется верным. Нужен, например, i += 1." },
    { text: "while True: без break закончится сам через 100 повторов.", answer: false, explain: "Нет, он будет крутиться вечно — выход только через break." },
    { text: "break пропускает один повтор и продолжает цикл.", answer: false, explain: "Нет, это continue. break полностью выходит из цикла." },
    { text: "continue переходит к следующему повтору цикла.", answer: true, explain: "Да, остаток тела на этом шаге пропускается." },
    { text: "Если условие while сразу ложно, тело не выполнится ни разу.", answer: true, explain: "Да, например while 5 < 3: — ни одного повтора." },
    { text: "В строке с while в конце ставят двоеточие.", answer: true, explain: "Да: while i < 5: — как у if и for." },
    { text: "Спрашивать, пока не введут правильный ответ, удобнее циклом for.", answer: false, explain: "Нет, тут заранее неизвестно число повторов — это работа для while." },
    { text: "i -= 1 уменьшает i на единицу.", answer: true, explain: "Да, это короткая запись i = i - 1." },
    { text: "Переменную из условия while можно создать уже внутри цикла.", answer: false, explain: "Нет, Python проверяет условие до первого повтора — переменная должна существовать заранее." },
  ],
};
