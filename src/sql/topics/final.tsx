import { Q, has } from "../SqlUi";
import type { SqlTopicData } from "../SqlTopic";

// Module 1 · final work: a whole small database «Кинотеатр» from design to CRUD, plus a mixed test.

const FILMS = "CREATE TABLE films (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  title VARCHAR(100) NOT NULL,\n  year INT,\n  age_limit INT DEFAULT 0\n);";
const SHOWS =
  "CREATE TABLE shows (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  film_id INT NOT NULL,\n  day DATE NOT NULL,\n  price DECIMAL(6,2),\n  FOREIGN KEY (film_id) REFERENCES films(id)\n);";
const FILL =
  "INSERT INTO films (title, year, age_limit) VALUES\n  ('Чебурашка', 2023, 6),\n  ('Движение вверх', 2017, 6),\n  ('Время первых', 2017, 6);\nINSERT INTO shows (film_id, day, price) VALUES\n  (1, '2026-12-01', 350),\n  (2, '2026-12-01', 400),\n  (1, '2026-12-02', 300);";

export const SQL_FINAL: SqlTopicData = {
  id: "sql-final",
  theory: {
    title: "Итоговая работа модуля 1",
    description: "Повторим главное и соберём целую базу «Кинотеатр»: от проекта до запросов.",
    parts: [
      {
        title: "Повторим: от идеи до таблиц",
        text: (
          <>
            <p>
              <b>Анализ</b>: кинотеатр показывает фильмы на сеансах. <b>Концептуальная модель</b>: сущности Фильм и Сеанс, связь «у
              фильма много сеансов» (1:N). <b>Логическая</b>: таблицы <Q>films</Q> и <Q>shows</Q>, в сеансе — внешний ключ{" "}
              <Q>film_id</Q>. <b>Физическая</b>: типы INT, VARCHAR, DATE, DECIMAL, СУБД MySQL.
            </p>
          </>
        ),
        examples: [{ code: `${FILMS}\n${SHOWS}\nDESCRIBE shows;`, db: "empty" }],
      },
      {
        title: "Повторим: CRUD",
        text: (
          <>
            <p>
              <Q>INSERT</Q> — добавить, <Q>SELECT … WHERE</Q> — найти, <Q>UPDATE … SET … WHERE</Q> — изменить, <Q>DELETE … WHERE</Q> —
              удалить. Не забывай WHERE в UPDATE и DELETE, проверяй результат через SELECT.
            </p>
          </>
        ),
        examples: [{ code: `${FILMS}\n${SHOWS}\n${FILL}\nSELECT * FROM shows WHERE day = '2026-12-01';`, db: "empty" }],
      },
    ],
  },
  game: {
    title: "Проект: база «Кинотеатр»",
    description: "Пять шагов — и у кинотеатра готовая база. Каждый следующий шаг продолжает предыдущий.",
    finish: "База кинотеатра готова и работает! Осталось итоговое задание.",
    missions: [
      {
        title: "Шаг 1. Фильмы",
        body: <p>Начнём с таблицы фильмов.</p>,
        goal: (
          <>
            Создай <Q>films</Q>: <Q>id INT AUTO_INCREMENT PRIMARY KEY</Q>, <Q>title VARCHAR(100) NOT NULL</Q>, <Q>year INT</Q>,{" "}
            <Q>age_limit INT DEFAULT 0</Q>.
          </>
        ),
        db: "empty",
        start: "",
        solution: FILMS,
        verify: "SELECT name, REPLACE(UPPER(REPLACE(type, ' ', '')), 'INTEGER', 'INT'), \"notnull\", dflt_value, pk FROM pragma_table_info('films') ORDER BY cid",
        hint: "Четыре столбца через запятую, у age_limit — DEFAULT 0.",
      },
      {
        title: "Шаг 2. Сеансы",
        body: <p>У фильма много сеансов — связь 1:N. Внешний ключ — в сеансах.</p>,
        goal: (
          <>
            Создай <Q>shows</Q>: <Q>id INT AUTO_INCREMENT PRIMARY KEY</Q>, <Q>film_id INT NOT NULL</Q>, <Q>day DATE NOT NULL</Q>,{" "}
            <Q>price DECIMAL(6,2)</Q> и внешний ключ <Q>film_id</Q> → <Q>films(id)</Q>.
          </>
        ),
        db: "empty",
        start: `${FILMS}\n\n`,
        solution: `${FILMS}\n${SHOWS}`,
        verify: "SELECT \"table\", \"from\", \"to\" FROM pragma_foreign_key_list('shows')",
        hint: "В конце: FOREIGN KEY (film_id) REFERENCES films(id)",
      },
      {
        title: "Шаг 3. Заполняем",
        body: <p>Афиша на две декабрьские даты.</p>,
        goal: (
          <>
            Добавь фильмы «Чебурашка» (2023, 6+), «Движение вверх» (2017, 6+), «Время первых» (2017, 6+) и сеансы: фильм 1 — 2026-12-01
            за 350, фильм 2 — 2026-12-01 за 400, фильм 1 — 2026-12-02 за 300.
          </>
        ),
        db: "empty",
        start: `${FILMS}\n${SHOWS}\n\n`,
        solution: `${FILMS}\n${SHOWS}\n${FILL}`,
        verify: "SELECT f.title, f.year, f.age_limit, s.day, s.price FROM shows s JOIN films f ON f.id = s.film_id ORDER BY s.id",
        hint: "Два INSERT: сначала films (title, year, age_limit), потом shows (film_id, day, price).",
      },
      {
        title: "Шаг 4. Изменения",
        body: <p>На «Время первых» поставили ограничение 12+, а все сеансы 1 декабря подешевели на 50 рублей.</p>,
        goal: (
          <>
            Поставь фильму 3 <Q>age_limit = 12</Q> и уменьши на 50 цену сеансов <Q>'2026-12-01'</Q>.
          </>
        ),
        db: "empty",
        start: `${FILMS}\n${SHOWS}\n${FILL}\n\n`,
        solution: `${FILMS}\n${SHOWS}\n${FILL}\nUPDATE films SET age_limit = 12 WHERE id = 3;\nUPDATE shows SET price = price - 50 WHERE day = '2026-12-01';`,
        verify: "SELECT (SELECT group_concat(age_limit) FROM films), (SELECT group_concat(price) FROM shows)",
        hint: "Два UPDATE, у каждого свой WHERE.",
      },
      {
        title: "Шаг 5. Отмена и отчёт",
        body: <p>Сеанс 3 отменили. А директору нужен список оставшихся сеансов, от дешёвых к дорогим.</p>,
        goal: (
          <>
            Удали сеанс с id = 3 и покажи <Q>day</Q> и <Q>price</Q> всех сеансов, отсортировав по цене.
          </>
        ),
        db: "empty",
        start: `${FILMS}\n${SHOWS}\n${FILL}\n\n`,
        solution: `${FILMS}\n${SHOWS}\n${FILL}\nDELETE FROM shows WHERE id = 3;\nSELECT day, price FROM shows ORDER BY price;`,
        hint: "DELETE FROM shows WHERE id = 3; потом SELECT day, price FROM shows ORDER BY price;",
      },
    ],
  },
  levels: [
    {
      kind: "choice",
      badge: "модели",
      prompt: "SQL работает с базами какой модели данных?",
      options: ["Иерархической", "Сетевой", "Реляционной", "Любой"],
      answer: 2,
      explain: "SQL — язык реляционных баз: данные в таблицах.",
    },
    {
      kind: "choice",
      badge: "жизненный цикл",
      prompt: "Что делают раньше всего?",
      options: ["CREATE TABLE", "Выбирают типы данных", "Анализ предметной области", "Создают индексы"],
      answer: 2,
      explain: "Сначала анализ, потом три уровня проектирования, потом CREATE TABLE.",
    },
    {
      kind: "choice",
      badge: "алгебра",
      prompt: "Какая операция реляционной алгебры соответствует INTERSECT?",
      options: ["Объединение", "Пересечение", "Разность", "Проекция"],
      answer: 1,
      explain: "INTERSECT — пересечение: строки, которые есть в обоих запросах.",
    },
    {
      kind: "choice",
      badge: "нормализация",
      prompt: "В таблице заказов хранится и имя покупателя, и его телефон. Что лучше сделать?",
      options: ["Ничего, так удобно", "Вынести покупателей в отдельную таблицу, а в заказ записывать customer_id", "Удалить телефон", "Сделать телефон первичным ключом"],
      answer: 1,
      explain: "Данные покупателя зависят от покупателя, а не от заказа — по 3НФ их выносят в отдельную таблицу.",
    },
    {
      badge: "проектирование",
      prompt: (
        <>
          Создай <Q>authors</Q> (<Q>id INT</Q> ключ, <Q>name VARCHAR(60) NOT NULL</Q>) и <Q>poems</Q> (<Q>id INT</Q> ключ,{" "}
          <Q>title VARCHAR(100)</Q>, <Q>author_id INT</Q> — внешний ключ на <Q>authors(id)</Q>).
        </>
      ),
      db: "empty",
      start: "",
      solution: "CREATE TABLE authors (id INT PRIMARY KEY, name VARCHAR(60) NOT NULL);\nCREATE TABLE poems (id INT PRIMARY KEY, title VARCHAR(100), author_id INT, FOREIGN KEY (author_id) REFERENCES authors(id));",
      verify: "SELECT \"table\", \"from\", \"to\" FROM pragma_foreign_key_list('poems')",
      hideExpected: true,
      explain: "Внешний ключ — на стороне «многих»: в стихах. FOREIGN KEY (author_id) REFERENCES authors(id).",
    },
    {
      badge: "UNION",
      prompt: "Покажи имена всех учеников 8 и 9 классов одним списком.",
      db: "school",
      start: "",
      solution: "SELECT name FROM class8 UNION SELECT name FROM class9;",
      rule: (code) => has(code, /union/i),
      ruleHint: "используй UNION.",
      explain: "SELECT name FROM class8 UNION SELECT name FROM class9;",
    },
    {
      badge: "CRUD",
      prompt: "В библиотеке: книге «Таинственный остров» (id = 6) исправь число страниц на 640, затем покажи название и страницы всех книг Жюля Верна (author_id = 4).",
      db: "library",
      start: "",
      solution: "UPDATE books SET pages = 640 WHERE id = 6;\nSELECT title, pages FROM books WHERE author_id = 4;",
      explain: "UPDATE books SET pages = 640 WHERE id = 6; SELECT title, pages FROM books WHERE author_id = 4;",
    },
    {
      badge: "всё вместе",
      prompt: (
        <>
          Создай <Q>visitors</Q> (<Q>id INT AUTO_INCREMENT PRIMARY KEY</Q>, <Q>name VARCHAR(40)</Q>, <Q>age INT</Q>), добавь Аню (14),
          Бориса (9) и Веру (16), удали тех, кому меньше 12, и покажи имена оставшихся.
        </>
      ),
      db: "empty",
      start: "",
      solution:
        "CREATE TABLE visitors (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(40), age INT);\nINSERT INTO visitors (name, age) VALUES ('Аня', 14), ('Борис', 9), ('Вера', 16);\nDELETE FROM visitors WHERE age < 12;\nSELECT name FROM visitors;",
      explain: "CREATE TABLE → INSERT → DELETE … WHERE age < 12 → SELECT name FROM visitors;",
    },
  ],
  cards: [
    { text: "СУБД — это язык запросов.", answer: false, explain: "Нет, СУБД — программа. Язык — SQL." },
    { text: "Первичный ключ уникален и не бывает пустым.", answer: true, explain: "Да." },
    { text: "Связь N:M хранят в таблице-связке.", answer: true, explain: "Да, с двумя внешними ключами." },
    { text: "DECIMAL подходит для денег лучше, чем FLOAT.", answer: true, explain: "Да, он точный." },
    { text: "ALTER TABLE … ADD COLUMN удаляет данные таблицы.", answer: false, explain: "Нет, данные остаются." },
    { text: "Индекс ускоряет поиск.", answer: true, explain: "Да, но замедляет вставку и занимает место." },
    { text: "DELETE без WHERE удалит все строки.", answer: true, explain: "Да, будь осторожен." },
    { text: "Проекция — это выбор строк по условию.", answer: false, explain: "Нет, проекция — выбор столбцов. Строки выбирает выборка (WHERE)." },
    { text: "USE выбирает базу данных для работы.", answer: true, explain: "Да." },
    { text: "Мощность отношения — число его столбцов.", answer: false, explain: "Нет, число строк. Столбцов — степень." },
  ],
};
