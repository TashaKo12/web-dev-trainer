import { Q } from "../SqlUi";
import type { SqlTopicData } from "../SqlTopic";

// Module 1 · topic 6: MySQL data types — numbers, dates and time, strings (character and byte), spatial, JSON;
// DEFAULT values and how much space each type takes.

/** The columns of a table with their declared types (case and spaces do not matter). */
export const cols = (t: string) => `SELECT name, UPPER(REPLACE(type, ' ', '')) AS type FROM pragma_table_info('${t}') ORDER BY cid`;

const sizes = (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
      <thead className="bg-slate-100 text-slate-600">
        <tr>
          <th className="px-3 py-1.5">Тип</th>
          <th className="px-3 py-1.5">Что хранит</th>
          <th className="px-3 py-1.5">Места</th>
        </tr>
      </thead>
      <tbody className="text-slate-700">
        {[
          ["TINYINT", "целое от −128 до 127 (или 0…255 с UNSIGNED)", "1 байт"],
          ["INT", "целое примерно до ±2,1 миллиарда", "4 байта"],
          ["BIGINT", "очень большое целое", "8 байт"],
          ["DECIMAL(8,2)", "точное дробное: 8 цифр, из них 2 после точки — для денег", "≈ 4–5 байт"],
          ["FLOAT, DOUBLE", "приблизительное дробное — для измерений", "4 и 8 байт"],
          ["CHAR(10)", "строка ровно из 10 символов (короче — дополняется пробелами)", "10 символов"],
          ["VARCHAR(100)", "строка до 100 символов", "длина + 1–2 байта"],
          ["TEXT", "длинный текст, до 65 535 байт", "длина + 2 байта"],
          ["DATE, TIME, DATETIME", "дата 2026-11-20, время 14:30:00, дата и время", "3, 3 и 5 байт"],
          ["BOOLEAN", "да/нет — в MySQL это TINYINT(1): 1 или 0", "1 байт"],
          ["BLOB", "двоичные данные: картинки, файлы", "длина + 2 байта"],
          ["JSON", "данные в формате JSON", "как текст"],
        ].map((r) => (
          <tr key={r[0]} className="border-b border-slate-100">
            {r.map((c, i) => (
              <td key={i} className={`px-3 py-1.5 ${i === 0 ? "whitespace-nowrap font-mono font-bold" : ""}`}>
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const SQL_TYPES: SqlTopicData = {
  id: "sql-types",
  theory: {
    title: "Типы данных",
    description: "Какой тип выбрать для столбца: числа, строки, даты, да/нет, JSON — и сколько места они занимают.",
    parts: [
      {
        title: "Зачем столбцу тип",
        text: (
          <>
            <p>
              У каждого столбца таблицы есть <b>тип данных</b>: он говорит, что можно хранить в столбце и сколько места это займёт.
              Тип помогает СУБД проверять данные (в столбец даты не запишешь слово), правильно сортировать (числа — как числа, а не как
              текст) и экономить место.
            </p>
            <p>Тип пишут после имени столбца в <Q>CREATE TABLE</Q>. Все типы MySQL делятся на группы: числа, строки, даты и время, а ещё двоичные, пространственные и JSON.</p>
          </>
        ),
        extra: sizes,
      },
      {
        title: "Числа: целые и дробные",
        text: (
          <>
            <p>
              Целые: <Q>TINYINT</Q>, <Q>SMALLINT</Q>, <Q>INT</Q>, <Q>BIGINT</Q> — чем больше тип, тем больше числа и тем больше места.
              Слово <Q>UNSIGNED</Q> запрещает отрицательные — зато верхняя граница становится вдвое больше.
            </p>
            <p>
              Дробные: <Q>DECIMAL(p,s)</Q> хранит число <b>точно</b> — p цифр всего, s после точки. Им считают деньги.{" "}
              <Q>FLOAT</Q> и <Q>DOUBLE</Q> — приблизительные, в них бывают крошечные ошибки округления; подходят для измерений
              (температура, расстояние).
            </p>
          </>
        ),
        examples: [
          { code: "DESCRIBE products;", db: "shop", note: "price DECIMAL(8,2) — цена с копейками, stock INT — штуки." },
          { code: "SELECT name, price, price * 2 FROM products;", db: "shop", note: "С числами можно считать прямо в запросе." },
        ],
      },
      {
        title: "Строки: CHAR, VARCHAR, TEXT",
        text: (
          <>
            <p>
              <Q>CHAR(n)</Q> — строка <b>фиксированной</b> длины: подходит для кодов одинаковой длины (номер класса «8А», код страны
              «RU»). <Q>VARCHAR(n)</Q> — строка <b>до</b> n символов: имена, названия, e-mail. <Q>TEXT</Q> — длинный текст, например
              описание книги.
            </p>
            <p>
              Это <b>символьные</b> строки. Есть и <b>байтовые</b> — <Q>BINARY</Q>, <Q>VARBINARY</Q>, <Q>BLOB</Q>: в них хранят не
              буквы, а байты (картинки, файлы). Ещё есть <Q>ENUM('да','нет')</Q> — строка из заранее заданного списка.
            </p>
            <p>Строковые значения в SQL пишут в одинарных кавычках: <Q>'Аня'</Q>.</p>
          </>
        ),
        examples: [
          { code: "CREATE TABLE countries (\n  code CHAR(2) PRIMARY KEY,\n  name VARCHAR(60),\n  about TEXT\n);\nINSERT INTO countries VALUES ('RU', 'Россия', 'Самая большая страна мира');\nSELECT * FROM countries;", db: "empty" },
        ],
      },
      {
        title: "Даты и время",
        text: (
          <>
            <p>
              <Q>DATE</Q> — дата в формате <Q>'ГГГГ-ММ-ДД'</Q>: <Q>'2026-11-20'</Q>. <Q>TIME</Q> — время <Q>'14:30:00'</Q>.{" "}
              <Q>DATETIME</Q> — дата и время вместе. <Q>TIMESTAMP</Q> — тоже дата и время, но MySQL умеет ставить его сам в момент
              записи. <Q>YEAR</Q> — только год.
            </p>
            <p>Год идёт первым — поэтому даты в таком формате правильно сортируются даже как текст.</p>
          </>
        ),
        examples: [{ code: "SELECT reader_id, taken, returned FROM loans\nORDER BY taken;", db: "library", note: "returned = NULL — книгу ещё не вернули." }],
      },
      {
        title: "Да/нет, JSON и пространственные типы",
        text: (
          <>
            <p>
              <Q>BOOLEAN</Q> в MySQL — это маленькое число: <Q>TRUE</Q> = 1, <Q>FALSE</Q> = 0. <Q>JSON</Q> хранит данные в формате JSON
              (как в JavaScript) и умеет искать внутри них. Пространственные типы — <Q>POINT</Q>, <Q>LINESTRING</Q>, <Q>POLYGON</Q> —
              хранят точки и фигуры на карте: координаты магазинов, границы районов.
            </p>
          </>
        ),
        examples: [{ code: "CREATE TABLE settings (\n  id INT PRIMARY KEY,\n  dark_theme BOOLEAN,\n  extra JSON\n);\nINSERT INTO settings VALUES (1, TRUE, '{\"lang\": \"ru\"}');\nSELECT * FROM settings;", db: "empty", note: "TRUE сохранился как 1." }],
      },
      {
        title: "Значения по умолчанию: DEFAULT",
        text: (
          <>
            <p>
              <Q>DEFAULT</Q> задаёт значение, которое запишется, если при добавлении строки столбец не указали. Например, новый товар
              пока не завезли — <Q>stock INT DEFAULT 0</Q>. А <Q>NOT NULL</Q> запрещает пустое значение.
            </p>
          </>
        ),
        examples: [
          { code: "INSERT INTO products (id, name, price) VALUES (9, 'Мафия', 790);\nSELECT * FROM products WHERE id = 9;", db: "shop", note: "stock не указали — записался 0 по умолчанию." },
          {
            code: "CREATE TABLE notes (\n  id INT PRIMARY KEY,\n  text VARCHAR(200) NOT NULL,\n  done BOOLEAN DEFAULT FALSE\n);\nINSERT INTO notes (id, text) VALUES (1, 'Выучить типы');\nSELECT * FROM notes;",
            db: "empty",
          },
        ],
      },
    ],
  },
  game: {
    title: "Пиксель открывает кинотеатр",
    description: "Школьный кинотеатр хранит фильмы и сеансы. Пиксель подбирает каждому столбцу правильный тип — четыре миссии.",
    finish: "Таблицы кинотеатра готовы, каждый столбец — своего типа. Закрепим на практике!",
    missions: [
      {
        title: "Фильмы",
        body: <p>У фильма есть номер, название и год выхода.</p>,
        goal: (
          <>
            Создай <Q>films</Q>: <Q>id INT</Q> (первичный ключ), <Q>title VARCHAR(100)</Q>, <Q>year INT</Q>.
          </>
        ),
        db: "empty",
        start: "CREATE TABLE films (\n  \n);",
        solution: "CREATE TABLE films (id INT PRIMARY KEY, title VARCHAR(100), year INT);",
        verify: cols("films"),
        hint: "Столбцы через запятую: id INT PRIMARY KEY, title VARCHAR(100), year INT",
      },
      {
        title: "Билеты и деньги",
        body: <p>Цена билета — с копейками, и считать её нужно точно.</p>,
        goal: (
          <>
            Создай <Q>tickets</Q>: <Q>id INT</Q> (первичный ключ) и <Q>price DECIMAL(6,2)</Q>.
          </>
        ),
        db: "empty",
        start: "",
        solution: "CREATE TABLE tickets (id INT PRIMARY KEY, price DECIMAL(6,2));",
        verify: cols("tickets"),
        hint: "Для денег — DECIMAL(6,2): 6 цифр, из них 2 после точки.",
      },
      {
        title: "Сеансы",
        body: <p>Сеанс — это день и время показа.</p>,
        goal: (
          <>
            Создай <Q>shows</Q>: <Q>id INT</Q> (первичный ключ), <Q>day DATE</Q>, <Q>start TIME</Q>.
          </>
        ),
        db: "empty",
        start: "",
        solution: "CREATE TABLE shows (id INT PRIMARY KEY, day DATE, start TIME);",
        verify: cols("shows"),
        hint: "Дата — DATE, время — TIME.",
      },
      {
        title: "Места по умолчанию",
        body: <p>В зале 30 мест. Если при добавлении сеанса не сказали иначе, мест должно быть 30.</p>,
        goal: (
          <>
            Создай <Q>halls</Q>: <Q>id INT</Q> (первичный ключ) и <Q>seats INT DEFAULT 30</Q>, потом добавь зал только с номером 1.
          </>
        ),
        db: "empty",
        start: "",
        solution: "CREATE TABLE halls (id INT PRIMARY KEY, seats INT DEFAULT 30);\nINSERT INTO halls (id) VALUES (1);",
        verify: "SELECT * FROM halls",
        hint: "seats INT DEFAULT 30, а потом INSERT INTO halls (id) VALUES (1);",
      },
    ],
  },
  levels: [
    {
      kind: "choice",
      badge: "деньги",
      prompt: "Какой тип лучше для цены товара 1290.50?",
      options: ["INT", "FLOAT", "DECIMAL(8,2)", "VARCHAR(10)"],
      answer: 2,
      explain: "DECIMAL хранит дробные числа точно — для денег это важно. FLOAT может ошибиться в последних знаках.",
    },
    {
      kind: "choice",
      badge: "строки",
      prompt: "Какой тип подходит для кода страны, который всегда из двух букв (RU, FR)?",
      options: ["CHAR(2)", "TEXT", "INT", "DATE"],
      answer: 0,
      explain: "CHAR(n) — строка фиксированной длины. Для кода из двух букв — CHAR(2).",
    },
    {
      kind: "choice",
      badge: "даты",
      prompt: "В каком формате пишут дату для столбца DATE?",
      options: ["'20.11.2026'", "'2026-11-20'", "'11/20/2026'", "20112026"],
      answer: 1,
      explain: "'ГГГГ-ММ-ДД' — год, месяц, день через дефис.",
    },
    {
      kind: "choice",
      badge: "BOOLEAN",
      prompt: "Как MySQL хранит значение TRUE в столбце BOOLEAN?",
      options: ["Как слово TRUE", "Как 1", "Как 'да'", "Как NULL"],
      answer: 1,
      explain: "BOOLEAN в MySQL — это TINYINT(1): TRUE = 1, FALSE = 0.",
    },
    {
      badge: "VARCHAR и DATE",
      prompt: (
        <>
          Создай <Q>pets</Q>: <Q>id INT</Q> (первичный ключ), <Q>name VARCHAR(30)</Q>, <Q>born DATE</Q>.
        </>
      ),
      db: "empty",
      start: "",
      solution: "CREATE TABLE pets (id INT PRIMARY KEY, name VARCHAR(30), born DATE);",
      verify: cols("pets"),
      explain: "CREATE TABLE pets (id INT PRIMARY KEY, name VARCHAR(30), born DATE);",
    },
    {
      badge: "DECIMAL",
      prompt: (
        <>
          Создай <Q>salaries</Q>: <Q>id INT</Q> (первичный ключ) и <Q>amount DECIMAL(10,2)</Q>.
        </>
      ),
      db: "empty",
      start: "",
      solution: "CREATE TABLE salaries (id INT PRIMARY KEY, amount DECIMAL(10,2));",
      verify: cols("salaries"),
      explain: "DECIMAL(10,2) — до 10 цифр, из них 2 после точки.",
    },
    {
      badge: "DEFAULT",
      prompt: (
        <>
          Добавь в магазин товар только с id = 9, названием 'Мемо' и ценой 650 — остаток (stock) должен взяться по умолчанию.
        </>
      ),
      db: "shop",
      start: "",
      solution: "INSERT INTO products (id, name, price) VALUES (9, 'Мемо', 650);",
      verify: "SELECT * FROM products WHERE id = 9",
      explain: "INSERT INTO products (id, name, price) VALUES (9, 'Мемо', 650); — stock = 0 по DEFAULT.",
    },
    {
      badge: "NOT NULL",
      prompt: (
        <>
          Создай <Q>students</Q>: <Q>id INT</Q> (первичный ключ), <Q>name VARCHAR(50) NOT NULL</Q>, <Q>active BOOLEAN DEFAULT TRUE</Q>.
        </>
      ),
      db: "empty",
      start: "",
      solution: "CREATE TABLE students (id INT PRIMARY KEY, name VARCHAR(50) NOT NULL, active BOOLEAN DEFAULT TRUE);",
      verify: "SELECT name, UPPER(REPLACE(type, ' ', '')), \"notnull\", UPPER(dflt_value) FROM pragma_table_info('students') ORDER BY cid",
      explain: "CREATE TABLE students (id INT PRIMARY KEY, name VARCHAR(50) NOT NULL, active BOOLEAN DEFAULT TRUE);",
    },
  ],
  cards: [
    { text: "VARCHAR(50) хранит строку ровно из 50 символов.", answer: false, explain: "Нет, до 50. Ровно — CHAR(50)." },
    { text: "DECIMAL хранит дробные числа точно.", answer: true, explain: "Да, поэтому им считают деньги." },
    { text: "FLOAT лучше всего подходит для денег.", answer: false, explain: "Нет, FLOAT приблизительный. Для денег — DECIMAL." },
    { text: "UNSIGNED запрещает отрицательные числа.", answer: true, explain: "Да, зато верхняя граница становится вдвое больше." },
    { text: "Дату в MySQL пишут так: '2026-11-20'.", answer: true, explain: "Да, год-месяц-день." },
    { text: "BLOB хранит двоичные данные — например, картинки.", answer: true, explain: "Да, это байтовый тип." },
    { text: "BOOLEAN в MySQL — отдельный тип, который хранит слова TRUE и FALSE.", answer: false, explain: "Нет, это TINYINT(1): 1 и 0." },
    { text: "DEFAULT задаёт значение, если столбец не указали при вставке.", answer: true, explain: "Да, например stock INT DEFAULT 0." },
    { text: "INT занимает 4 байта.", answer: true, explain: "Да. TINYINT — 1, BIGINT — 8." },
    { text: "POINT и POLYGON — строковые типы.", answer: false, explain: "Нет, пространственные: точки и фигуры на карте." },
  ],
};
