import { Q, has } from "../SqlUi";
import type { SqlTopicData } from "../SqlTopic";

// Module 1 · topic 3: relational algebra — the terms (relation, attribute, tuple, domain, cardinality, degree)
// and the operations, each shown as the SQL that does it.

const terms = (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
      <thead className="bg-slate-100 text-slate-600">
        <tr>
          <th className="px-3 py-1.5">Термин теории</th>
          <th className="px-3 py-1.5">В таблице</th>
          <th className="px-3 py-1.5">Пример из class8</th>
        </tr>
      </thead>
      <tbody className="text-slate-700">
        {[
          ["Отношение", "таблица", "class8"],
          ["Атрибут", "столбец", "name"],
          ["Кортеж", "строка", "(1, 'Аня', 'Тверь')"],
          ["Домен", "все допустимые значения столбца", "города; целые числа для id"],
          ["Степень", "число столбцов", "3"],
          ["Мощность (кардинальность)", "число строк", "4"],
        ].map((r) => (
          <tr key={r[0]} className="border-b border-slate-100">
            {r.map((c, i) => (
              <td key={i} className={`px-3 py-1.5 ${i === 0 ? "font-bold" : ""}`}>
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const SQL_ALGEBRA: SqlTopicData = {
  id: "sql-algebra",
  theory: {
    title: "Реляционная алгебра",
    description: "Математика, на которой стоит SQL: отношения, кортежи и операции над таблицами — выборка, проекция, объединение, разность и другие.",
    parts: [
      {
        title: "Термины: отношение, атрибут, кортеж",
        text: (
          <>
            <p>
              Реляционная модель пришла из математики, поэтому у привычных вещей есть строгие названия. Таблица — это{" "}
              <b>отношение</b>, столбец — <b>атрибут</b>, строка — <b>кортеж</b>. <b>Домен</b> — множество значений, которые может
              принимать атрибут. <b>Степень</b> отношения — число атрибутов, <b>мощность</b> — число кортежей.
            </p>
          </>
        ),
        extra: terms,
        examples: [
          { code: "SELECT * FROM class8;", db: "school", note: "Степень 3, мощность 4." },
          { code: "SELECT COUNT(*) FROM class8;", db: "school", note: "COUNT(*) считает строки — это и есть мощность." },
        ],
      },
      {
        title: "Свойства отношений",
        text: (
          <>
            <p>У настоящего отношения есть правила:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>нет двух одинаковых кортежей (строк) — поэтому у таблицы есть ключ;</li>
              <li>порядок кортежей не важен — строки можно хранить в любом порядке;</li>
              <li>порядок атрибутов не важен — столбцы различают по именам;</li>
              <li>в каждой ячейке — одно значение, а не список (это называют «атомарностью»).</li>
            </ul>
            <p>
              Таблица SQL может нарушить первое правило, если выбрать неуникальный столбец: тогда помогает <Q>DISTINCT</Q> — он
              убирает повторы.
            </p>
          </>
        ),
        examples: [
          { code: "SELECT city FROM class8;", db: "school", note: "Тверь повторяется — это уже не «чистое» отношение." },
          { code: "SELECT DISTINCT city FROM class8;", db: "school", note: "DISTINCT убрал повторы." },
        ],
      },
      {
        title: "Выборка и проекция",
        text: (
          <>
            <p>
              <b>Выборка</b> (селекция, σ) оставляет только строки, которые подходят под условие. В SQL это <Q>WHERE</Q>.
            </p>
            <p>
              <b>Проекция</b> (π) оставляет только нужные столбцы и убирает повторы. В SQL это список столбцов после{" "}
              <Q>SELECT</Q> (а повторы убирает <Q>DISTINCT</Q>).
            </p>
            <p>Операции можно сочетать: сначала выборка, потом проекция.</p>
          </>
        ),
        examples: [
          { code: "SELECT * FROM class8\nWHERE city = 'Тверь';", db: "school", note: "Выборка: только ученики из Твери." },
          { code: "SELECT name FROM class8\nWHERE city = 'Тверь';", db: "school", note: "Выборка + проекция: только имена учеников из Твери." },
        ],
      },
      {
        title: "Объединение, пересечение, разность",
        text: (
          <>
            <p>
              Эти операции работают с двумя отношениями одинаковой структуры — как с множествами. <b>Объединение</b> (∪, <Q>UNION</Q>)
              — всё, что есть хотя бы в одном. <b>Пересечение</b> (∩, <Q>INTERSECT</Q>) — то, что есть в обоих. <b>Разность</b> (−,{" "}
              <Q>EXCEPT</Q>) — то, что есть в первом, но нет во втором.
            </p>
            <p>В базе «Школа» есть шахматный кружок и кружок робототехники. Кто куда ходит?</p>
          </>
        ),
        examples: [
          { code: "SELECT name FROM chess_club\nUNION\nSELECT name FROM robot_club;", db: "school", note: "Все, кто ходит хотя бы в один кружок. Повторы UNION убирает сам." },
          { code: "SELECT name FROM chess_club\nINTERSECT\nSELECT name FROM robot_club;", db: "school", note: "Кто ходит в оба кружка." },
          { code: "SELECT name FROM chess_club\nEXCEPT\nSELECT name FROM robot_club;", db: "school", note: "Только шахматисты, без робототехников." },
        ],
      },
      {
        title: "Декартово произведение и соединение",
        text: (
          <>
            <p>
              <b>Декартово произведение</b> (×) соединяет <i>каждую</i> строку первой таблицы с <i>каждой</i> строкой второй. Из 4 и 2
              строк получится 4 × 2 = 8. В SQL — <Q>CROSS JOIN</Q> или просто две таблицы через запятую.
            </p>
            <p>
              <b>Соединение</b> (⋈) — произведение, из которого оставили только строки, где значения совпадают. Так соединяют связанные
              таблицы: выдачу и книгу по номеру книги. В SQL — <Q>JOIN … ON</Q>. Подробно соединения разберём в модуле 2.
            </p>
            <p>
              Есть ещё <b>деление</b> (÷) — «кто связан со <i>всеми</i> из списка», например «кто ходит во все кружки». В SQL для
              него нет одного слова: его собирают из других операций.
            </p>
          </>
        ),
        examples: [
          { code: "SELECT class8.name, rooms.room\nFROM class8 CROSS JOIN rooms;", db: "school", note: "Каждый ученик — с каждым кабинетом: 4 × 2 = 8 строк." },
          { code: "SELECT loans.taken, books.title\nFROM loans JOIN books ON loans.book_id = books.id;", db: "library", note: "Соединение: к каждой выдаче приписано название книги." },
        ],
      },
      {
        title: "Реляционное исчисление",
        text: (
          <>
            <p>
              Алгебра говорит, <i>как</i> получить результат: «сделай выборку, потом проекцию». <b>Реляционное исчисление</b>{" "}
              описывает, <i>что</i> нужно получить: «все имена x, такие что x из класса 8 и x живёт в Твери». Бывает{" "}
              <b>исчисление кортежей</b> (переменные — строки) и <b>исчисление доменов</b> (переменные — значения столбцов).
            </p>
            <p>
              SQL ближе к исчислению: мы описываем результат, а порядок операций выбирает СУБД. Но любой запрос SQL можно разложить на
              операции алгебры — так СУБД и выполняет его внутри.
            </p>
          </>
        ),
        examples: [{ code: "SELECT name FROM class9\nWHERE city = 'Москва';", db: "school", note: "Исчисление: «имена тех, кто из 9 класса и из Москвы». Алгебра: σ(город = Москва), потом π(имя)." }],
      },
    ],
  },
  game: {
    title: "Пиксель собирает кружки",
    description: "Завуч просит Пикселя разобраться, кто в каких кружках. Пять миссий — пять операций алгебры.",
    finish: "Списки кружков готовы — завуч довольна! Закрепим на практике.",
    missions: [
      {
        title: "Выборка",
        body: <p>Нужен список восьмиклассников из Твери со всеми сведениями.</p>,
        goal: <>Выбери из <Q>class8</Q> все строки, где <Q>city = 'Тверь'</Q>.</>,
        db: "school",
        start: "SELECT * FROM class8\n",
        solution: "SELECT * FROM class8 WHERE city = 'Тверь';",
        hint: "Условие пишут после WHERE: WHERE city = 'Тверь'. Текст — в одинарных кавычках.",
      },
      {
        title: "Проекция",
        body: <p>Для афиши нужны только имена девятиклассников.</p>,
        goal: <>Покажи один столбец <Q>name</Q> из <Q>class9</Q>.</>,
        db: "school",
        start: "",
        solution: "SELECT name FROM class9;",
        hint: "SELECT name FROM class9;",
      },
      {
        title: "Объединение",
        body: <p>Пиксель составляет общий список всех учеников обоих классов — только имена.</p>,
        goal: <>Объедини имена из <Q>class8</Q> и <Q>class9</Q>.</>,
        db: "school",
        start: "SELECT name FROM class8\n",
        solution: "SELECT name FROM class8 UNION SELECT name FROM class9;",
        rule: (code) => has(code, /union/i),
        ruleHint: "используй UNION.",
        hint: "Между двумя SELECT поставь UNION.",
      },
      {
        title: "Пересечение",
        body: <p>Кто из ребят занимается и шахматами, и роботами? Их наградят грамотой.</p>,
        goal: <>Найди имена, которые есть и в <Q>chess_club</Q>, и в <Q>robot_club</Q>.</>,
        db: "school",
        start: "",
        solution: "SELECT name FROM chess_club INTERSECT SELECT name FROM robot_club;",
        rule: (code) => has(code, /intersect/i),
        ruleHint: "используй INTERSECT.",
        hint: "SELECT name FROM chess_club INTERSECT SELECT name FROM robot_club;",
      },
      {
        title: "Разность",
        body: <p>Руководитель робототехники зовёт в кружок тех, кто пока ходит только туда и не играет в шахматы.</p>,
        goal: <>Найди тех, кто есть в <Q>robot_club</Q>, но нет в <Q>chess_club</Q>.</>,
        db: "school",
        start: "",
        solution: "SELECT name FROM robot_club EXCEPT SELECT name FROM chess_club;",
        rule: (code) => has(code, /except/i),
        ruleHint: "используй EXCEPT.",
        hint: "Порядок важен: из робототехников вычитаем шахматистов — robot_club EXCEPT chess_club.",
      },
    ],
  },
  levels: [
    {
      kind: "choice",
      badge: "термины",
      prompt: "Как в реляционной теории называется строка таблицы?",
      options: ["Атрибут", "Кортеж", "Домен", "Отношение"],
      answer: 1,
      explain: "Строка — кортеж, столбец — атрибут, таблица — отношение.",
    },
    {
      kind: "choice",
      badge: "мощность",
      prompt: "В таблице 5 столбцов и 12 строк. Чему равна её мощность?",
      options: ["5", "12", "17", "60"],
      answer: 1,
      explain: "Мощность — число строк (кортежей): 12. Степень — число столбцов: 5.",
    },
    {
      badge: "проекция",
      prompt: "Покажи только города учеников 9 класса, без повторов.",
      db: "school",
      start: "",
      solution: "SELECT DISTINCT city FROM class9;",
      explain: "SELECT DISTINCT city FROM class9; — проекция по-настоящему убирает повторы.",
    },
    {
      badge: "выборка + проекция",
      prompt: "Покажи имена москвичей из 8 класса.",
      db: "school",
      start: "",
      solution: "SELECT name FROM class8 WHERE city = 'Москва';",
      explain: "SELECT name FROM class8 WHERE city = 'Москва';",
    },
    {
      badge: "объединение",
      prompt: "Покажи все города, где живут ученики 8 и 9 классов (каждый город один раз).",
      db: "school",
      start: "",
      solution: "SELECT city FROM class8 UNION SELECT city FROM class9;",
      rule: (code) => has(code, /union/i),
      ruleHint: "объедини два запроса через UNION.",
      explain: "SELECT city FROM class8 UNION SELECT city FROM class9; — UNION сам убирает повторы.",
    },
    {
      badge: "разность",
      prompt: "Кто ходит в шахматный кружок, но не ходит в робототехнику?",
      db: "school",
      start: "",
      solution: "SELECT name FROM chess_club EXCEPT SELECT name FROM robot_club;",
      rule: (code) => has(code, /except/i),
      ruleHint: "используй EXCEPT.",
      explain: "SELECT name FROM chess_club EXCEPT SELECT name FROM robot_club;",
    },
    {
      badge: "произведение",
      prompt: "Составь все пары «ученик 9 класса — кабинет»: имя и номер кабинета.",
      db: "school",
      start: "",
      solution: "SELECT class9.name, rooms.room FROM class9 CROSS JOIN rooms;",
      explain: "SELECT class9.name, rooms.room FROM class9 CROSS JOIN rooms; — 3 × 2 = 6 пар.",
    },
    {
      badge: "соединение",
      prompt: "Покажи названия книг и имена их авторов (books.title, authors.name).",
      db: "library",
      start: "SELECT books.title, authors.name\nFROM books JOIN authors ON ",
      solution: "SELECT books.title, authors.name FROM books JOIN authors ON books.author_id = authors.id;",
      explain: "JOIN … ON books.author_id = authors.id — из всех пар оставляем те, где номер автора совпадает.",
    },
    {
      kind: "choice",
      badge: "операции",
      prompt: "Какой операции алгебры соответствует WHERE?",
      options: ["Проекция", "Выборка", "Объединение", "Деление"],
      answer: 1,
      explain: "WHERE оставляет подходящие строки — это выборка (селекция). Список столбцов после SELECT — проекция.",
    },
    {
      kind: "choice",
      badge: "произведение",
      prompt: "В одной таблице 6 строк, в другой — 3. Сколько строк в их декартовом произведении?",
      options: ["9", "3", "18", "6"],
      answer: 2,
      explain: "Каждая строка с каждой: 6 × 3 = 18.",
    },
  ],
  cards: [
    { text: "Отношение — это таблица.", answer: true, explain: "Да, relation и дало имя реляционной модели." },
    { text: "Атрибут — это строка таблицы.", answer: false, explain: "Нет, атрибут — столбец. Строка — кортеж." },
    { text: "Степень отношения — число его столбцов.", answer: true, explain: "Да. Число строк — мощность." },
    { text: "В отношении порядок строк важен.", answer: false, explain: "Нет, кортежи хранятся без порядка. Порядок задают при выводе." },
    { text: "Проекция выбирает нужные столбцы.", answer: true, explain: "Да, а выборка — нужные строки." },
    { text: "UNION оставляет повторяющиеся строки.", answer: false, explain: "Нет, UNION убирает повторы. Оставляет их UNION ALL." },
    { text: "INTERSECT находит строки, которые есть в обоих запросах.", answer: true, explain: "Да, это пересечение." },
    { text: "A EXCEPT B и B EXCEPT A — одно и то же.", answer: false, explain: "Нет, разность зависит от порядка, как и вычитание чисел." },
    { text: "Декартово произведение таблиц из 4 и 5 строк даёт 20 строк.", answer: true, explain: "Да, 4 × 5 = 20." },
    { text: "Соединение — это произведение, в котором оставили совпадающие строки.", answer: true, explain: "Да, JOIN … ON оставляет пары с совпадением." },
  ],
};
