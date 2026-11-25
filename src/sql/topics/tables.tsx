import { Q, has } from "../SqlUi";
import type { SqlTopicData } from "../SqlTopic";
import { cols } from "./types";

// Module 1 · topic 7: creating databases and tables, ALTER TABLE (ADD, DROP, RENAME; MODIFY and CHANGE in MySQL),
// DROP TABLE, adding data (INSERT, LOAD DATA), indexes, and a basic SELECT.

const indexes = "SELECT name FROM sqlite_master WHERE type = 'index' AND sql IS NOT NULL ORDER BY name";

export const SQL_TABLES: SqlTopicData = {
  id: "sql-tables",
  theory: {
    title: "Создаём и меняем таблицы",
    description: "CREATE DATABASE и CREATE TABLE, изменение таблиц ALTER TABLE, удаление DROP TABLE, добавление данных и индексы.",
    parts: [
      {
        title: "CREATE TABLE",
        text: (
          <>
            <p>
              Сначала создают базу (<Q>CREATE DATABASE shop;</Q>) и выбирают её (<Q>USE shop;</Q>). Потом — таблицы. В скобках через
              запятую перечисляют столбцы: <b>имя тип ограничения</b>. Ограничения: <Q>PRIMARY KEY</Q> — первичный ключ,{" "}
              <Q>NOT NULL</Q> — обязательно, <Q>UNIQUE</Q> — без повторов, <Q>DEFAULT</Q> — значение по умолчанию.
            </p>
            <p>
              Чтобы номера ставились сами, в MySQL пишут <Q>id INT AUTO_INCREMENT PRIMARY KEY</Q>. <Q>IF NOT EXISTS</Q> не даст ошибки,
              если таблица уже есть.
            </p>
          </>
        ),
        examples: [
          {
            code: "CREATE DATABASE cafe;\nUSE cafe;\nCREATE TABLE dishes (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(60) NOT NULL UNIQUE,\n  price DECIMAL(7,2) NOT NULL,\n  vegan BOOLEAN DEFAULT FALSE\n);\nDESCRIBE dishes;",
            db: "empty",
          },
        ],
      },
      {
        title: "Добавляем данные: INSERT",
        text: (
          <>
            <p>
              <Q>INSERT INTO таблица (столбцы) VALUES (значения);</Q> — добавляет строку. Столбцы можно не перечислять, тогда значения
              нужно дать для всех столбцов по порядку. Несколько строк — через запятую. Если у <Q>id</Q> стоит{" "}
              <Q>AUTO_INCREMENT</Q>, его можно не указывать — номер поставится сам.
            </p>
            <p>
              Большие файлы (CSV) в MySQL загружают командой <Q>LOAD DATA INFILE 'файл.csv' INTO TABLE …</Q> — она читает файл с
              сервера. В песочнице файлов нет, поэтому тренируемся на INSERT.
            </p>
          </>
        ),
        examples: [
          {
            code: "CREATE TABLE dishes (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(60),\n  price DECIMAL(7,2)\n);\nINSERT INTO dishes (name, price) VALUES\n  ('Блины', 250),\n  ('Борщ', 320);\nSELECT * FROM dishes;",
            db: "empty",
            note: "Номера 1 и 2 поставились сами.",
          },
        ],
      },
      {
        title: "Меняем таблицу: ALTER TABLE",
        text: (
          <>
            <p>
              <Q>ALTER TABLE</Q> меняет уже готовую таблицу, не теряя данных:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <Q>ADD COLUMN phone VARCHAR(20)</Q> — добавить столбец;
              </li>
              <li>
                <Q>DROP COLUMN phone</Q> — удалить столбец;
              </li>
              <li>
                <Q>RENAME COLUMN class TO grade</Q> — переименовать столбец;
              </li>
              <li>
                <Q>RENAME TO students</Q> — переименовать саму таблицу;
              </li>
              <li>
                в MySQL ещё <Q>MODIFY</Q> (сменить тип: <Q>MODIFY name VARCHAR(100)</Q>), <Q>CHANGE</Q> (сменить имя и тип сразу) и{" "}
                <Q>ALTER … SET DEFAULT</Q>. Песочница их не выполняет — только объясняет.
              </li>
            </ul>
          </>
        ),
        examples: [
          { code: "ALTER TABLE readers ADD COLUMN email VARCHAR(80);\nALTER TABLE readers RENAME COLUMN class TO grade;\nSELECT * FROM readers;", db: "library" },
          { code: "ALTER TABLE customers DROP COLUMN email;\nDESCRIBE customers;", db: "shop" },
        ],
      },
      {
        title: "Удаляем: DROP TABLE",
        text: (
          <>
            <p>
              <Q>DROP TABLE имя;</Q> удаляет таблицу целиком — вместе со всеми данными, без вопросов и без корзины.{" "}
              <Q>DROP TABLE IF EXISTS имя;</Q> не выдаст ошибку, если таблицы нет. Таблицу, на которую ссылаются внешние ключи, удалить
              не получится — сначала удаляют ту, что ссылается.
            </p>
          </>
        ),
        examples: [
          { code: "DROP TABLE loans;\nSHOW TABLES;", db: "library", note: "loans удалена. В песочнице база вернётся при следующем запуске." },
          { code: "DROP TABLE authors;", db: "library", note: "Ошибка: на авторов ссылаются книги." },
        ],
      },
      {
        title: "Индексы",
        text: (
          <>
            <p>
              <b>Индекс</b> — это как алфавитный указатель в конце книги: чтобы найти слово, не читают всю книгу. Без индекса СУБД ищет,
              просматривая все строки подряд; с индексом — находит сразу.
            </p>
            <p>
              <b>Плюсы</b>: быстрый поиск и сортировка. <b>Минусы</b>: индекс занимает место и замедляет добавление и изменение данных —
              его тоже нужно обновлять. Поэтому индексы делают по столбцам, по которым часто ищут.
            </p>
            <p>
              Виды: обычный (<Q>INDEX</Q>), уникальный (<Q>UNIQUE</Q> — заодно запрещает повторы), первичный ключ (создаётся сам),
              полнотекстовый (<Q>FULLTEXT</Q> — поиск слов в тексте). Создают: <Q>CREATE INDEX idx_title ON books (title);</Q>, удаляют в
              MySQL: <Q>DROP INDEX idx_title ON books;</Q>.
            </p>
          </>
        ),
        examples: [
          {
            code: "CREATE INDEX idx_genre ON books (genre);\nCREATE UNIQUE INDEX idx_name ON readers (name);\nSELECT name, tbl_name FROM sqlite_master WHERE type = 'index' AND sql IS NOT NULL;",
            db: "library",
            note: "Последний запрос показывает, какие индексы появились (так их видно в SQLite; в MySQL — SHOW INDEX FROM books).",
          },
        ],
      },
      {
        title: "Простой SELECT",
        text: (
          <>
            <p>
              Чтобы проверить, что получилось, используют <Q>SELECT</Q>: <Q>SELECT * FROM таблица;</Q> — всё, а с <Q>WHERE</Q> —
              только подходящие строки. Условие сравнивает: <Q>=</Q>, <Q>&lt;&gt;</Q> (не равно), <Q>&gt;</Q>, <Q>&lt;</Q>, <Q>&gt;=</Q>,{" "}
              <Q>&lt;=</Q>. <Q>ORDER BY</Q> сортирует результат (<Q>DESC</Q> — по убыванию). Подробно запросы — в модуле 2.
            </p>
          </>
        ),
        examples: [
          { code: "SELECT title, pages FROM books\nWHERE pages > 400;", db: "library" },
          { code: "SELECT name, price FROM products\nORDER BY price DESC;", db: "shop", note: "Сначала самые дорогие." },
        ],
      },
    ],
  },
  game: {
    title: "Пиксель строит базу кафе",
    description: "Школьное кафе переходит на базу данных. Пиксель создаёт таблицу, заполняет её и улучшает — пять миссий.",
    finish: "У кафе своя база! Закрепим на практике.",
    missions: [
      {
        title: "Меню",
        body: <p>Нужна таблица блюд: номер (ставится сам), название (обязательно) и цена.</p>,
        goal: (
          <>
            Создай <Q>dishes</Q>: <Q>id INT AUTO_INCREMENT PRIMARY KEY</Q>, <Q>name VARCHAR(60) NOT NULL</Q>, <Q>price DECIMAL(7,2)</Q>.
          </>
        ),
        db: "empty",
        start: "",
        solution: "CREATE TABLE dishes (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(60) NOT NULL, price DECIMAL(7,2));",
        verify: "SELECT name, pk, \"notnull\" FROM pragma_table_info('dishes') ORDER BY cid",
        hint: "CREATE TABLE dishes (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(60) NOT NULL, price DECIMAL(7,2));",
      },
      {
        title: "Первые блюда",
        body: <p>Таблица уже создана. Повар просит внести три блюда.</p>,
        goal: (
          <>
            Добавь блюда: «Блины» — 250, «Борщ» — 320, «Компот» — 90. Номер не указывай — он поставится сам.
          </>
        ),
        db: "empty",
        start: "CREATE TABLE dishes (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(60) NOT NULL, price DECIMAL(7,2));\n\n",
        solution:
          "CREATE TABLE dishes (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(60) NOT NULL, price DECIMAL(7,2));\nINSERT INTO dishes (name, price) VALUES ('Блины', 250), ('Борщ', 320), ('Компот', 90);",
        verify: "SELECT id, name, price FROM dishes ORDER BY id",
        hint: "INSERT INTO dishes (name, price) VALUES ('Блины', 250), ('Борщ', 320), ('Компот', 90);",
      },
      {
        title: "Новый столбец",
        body: <p>Кафе хочет отмечать постные блюда. В библиотеке тоже кое-что поменяли: читателям нужен e-mail.</p>,
        goal: (
          <>
            Добавь в <Q>readers</Q> столбец <Q>email VARCHAR(80)</Q>.
          </>
        ),
        db: "library",
        start: "",
        solution: "ALTER TABLE readers ADD COLUMN email VARCHAR(80);",
        verify: cols("readers"),
        hint: "ALTER TABLE readers ADD COLUMN email VARCHAR(80);",
      },
      {
        title: "Быстрый поиск",
        body: <p>Читатели часто ищут книги по жанру. Пиксель ускоряет поиск.</p>,
        goal: (
          <>
            Создай индекс <Q>idx_genre</Q> по столбцу <Q>genre</Q> таблицы <Q>books</Q>.
          </>
        ),
        db: "library",
        start: "",
        solution: "CREATE INDEX idx_genre ON books (genre);",
        verify: indexes,
        hint: "CREATE INDEX idx_genre ON books (genre);",
      },
      {
        title: "Лишняя таблица",
        body: <p>Таблица выдач устарела — её перенесут в другую систему. Пиксель её удаляет.</p>,
        goal: (
          <>
            Удали таблицу <Q>loans</Q> и покажи оставшиеся таблицы.
          </>
        ),
        db: "library",
        start: "",
        solution: "DROP TABLE loans;\nSHOW TABLES;",
        hint: "DROP TABLE loans; SHOW TABLES;",
      },
    ],
  },
  levels: [
    {
      badge: "CREATE TABLE",
      prompt: (
        <>
          Создай <Q>teachers</Q>: <Q>id INT</Q> (первичный ключ), <Q>name VARCHAR(60) NOT NULL</Q>, <Q>subject VARCHAR(40)</Q>.
        </>
      ),
      db: "empty",
      start: "",
      solution: "CREATE TABLE teachers (id INT PRIMARY KEY, name VARCHAR(60) NOT NULL, subject VARCHAR(40));",
      verify: "SELECT name, REPLACE(UPPER(REPLACE(type, ' ', '')), 'INTEGER', 'INT'), \"notnull\", pk FROM pragma_table_info('teachers') ORDER BY cid",
      explain: "CREATE TABLE teachers (id INT PRIMARY KEY, name VARCHAR(60) NOT NULL, subject VARCHAR(40));",
    },
    {
      badge: "INSERT",
      prompt: "Добавь читателя (6, 'Женя Белова', '7А') в таблицу readers.",
      db: "library",
      start: "",
      solution: "INSERT INTO readers VALUES (6, 'Женя Белова', '7А');",
      verify: "SELECT * FROM readers ORDER BY id",
      explain: "INSERT INTO readers VALUES (6, 'Женя Белова', '7А');",
    },
    {
      badge: "INSERT нескольких",
      prompt: "Добавь двух покупателей одной командой: (5, 'Света', 'Тула', NULL) и (6, 'Рома', 'Омск', 'roma@mail.ru').",
      db: "shop",
      start: "",
      solution: "INSERT INTO customers VALUES (5, 'Света', 'Тула', NULL), (6, 'Рома', 'Омск', 'roma@mail.ru');",
      verify: "SELECT * FROM customers ORDER BY id",
      rule: (code) => (code.match(/insert/gi) ?? []).length === 1,
      ruleHint: "добавь обе строки одной командой INSERT — через запятую после VALUES.",
      explain: "INSERT INTO customers VALUES (5, 'Света', 'Тула', NULL), (6, 'Рома', 'Омск', 'roma@mail.ru');",
    },
    {
      badge: "ADD COLUMN",
      prompt: (
        <>
          Добавь в <Q>books</Q> столбец <Q>rating INT</Q>.
        </>
      ),
      db: "library",
      start: "",
      solution: "ALTER TABLE books ADD COLUMN rating INT;",
      verify: cols("books"),
      explain: "ALTER TABLE books ADD COLUMN rating INT;",
    },
    {
      badge: "DROP COLUMN",
      prompt: (
        <>
          Удали из <Q>products</Q> столбец <Q>category</Q>.
        </>
      ),
      db: "shop",
      start: "",
      solution: "ALTER TABLE products DROP COLUMN category;",
      verify: cols("products"),
      explain: "ALTER TABLE products DROP COLUMN category;",
    },
    {
      badge: "RENAME",
      prompt: (
        <>
          Переименуй столбец <Q>class</Q> таблицы <Q>readers</Q> в <Q>grade</Q>.
        </>
      ),
      db: "library",
      start: "",
      solution: "ALTER TABLE readers RENAME COLUMN class TO grade;",
      verify: cols("readers"),
      explain: "ALTER TABLE readers RENAME COLUMN class TO grade;",
    },
    {
      badge: "индекс",
      prompt: (
        <>
          Покупателей часто ищут по городу. Создай индекс <Q>idx_city</Q> по столбцу <Q>city</Q> таблицы <Q>customers</Q>.
        </>
      ),
      db: "shop",
      start: "",
      solution: "CREATE INDEX idx_city ON customers (city);",
      verify: indexes,
      explain: "CREATE INDEX idx_city ON customers (city);",
    },
    {
      badge: "DROP TABLE",
      prompt: "Удали таблицу orders из магазина и покажи оставшиеся таблицы.",
      db: "shop",
      start: "",
      solution: "DROP TABLE orders;\nSHOW TABLES;",
      rule: (code) => has(code, /drop\s+table/i),
      ruleHint: "удали таблицу командой DROP TABLE.",
      explain: "DROP TABLE orders; SHOW TABLES;",
    },
    {
      badge: "SELECT + WHERE",
      prompt: "Покажи названия и годы книг, вышедших после 1900 года.",
      db: "library",
      start: "",
      solution: "SELECT title, year FROM books WHERE year > 1900;",
      explain: "SELECT title, year FROM books WHERE year > 1900;",
    },
    {
      badge: "ORDER BY",
      prompt: "Покажи названия товаров и их цены — от самой дешёвой к самой дорогой.",
      db: "shop",
      start: "",
      solution: "SELECT name, price FROM products ORDER BY price;",
      explain: "SELECT name, price FROM products ORDER BY price; — по возрастанию; DESC — по убыванию.",
    },
  ],
  cards: [
    { text: "DROP TABLE удаляет таблицу вместе со всеми данными.", answer: true, explain: "Да, навсегда, без корзины." },
    { text: "ALTER TABLE удаляет все данные таблицы.", answer: false, explain: "Нет, ALTER меняет структуру, данные остаются." },
    { text: "AUTO_INCREMENT сам ставит номер новой строке.", answer: true, explain: "Да, 1, 2, 3…" },
    { text: "В INSERT можно добавить несколько строк одной командой.", answer: true, explain: "Да, через запятую после VALUES." },
    { text: "Индекс ускоряет и поиск, и добавление данных.", answer: false, explain: "Нет, поиск ускоряет, а добавление — замедляет: индекс тоже надо обновлять." },
    { text: "UNIQUE запрещает повторяющиеся значения в столбце.", answer: true, explain: "Да, и при этом создаёт индекс." },
    { text: "LOAD DATA загружает данные из файла.", answer: true, explain: "Да, например из CSV." },
    { text: "Таблицу, на которую ссылаются внешние ключи, можно удалить в любой момент.", answer: false, explain: "Нет, сначала удаляют ту таблицу, что ссылается." },
    { text: "MODIFY в MySQL меняет тип столбца.", answer: true, explain: "Да: ALTER TABLE … MODIFY name VARCHAR(100)." },
    { text: "IF NOT EXISTS не даёт ошибку, если таблица уже есть.", answer: true, explain: "Да, команда просто ничего не сделает." },
  ],
};
