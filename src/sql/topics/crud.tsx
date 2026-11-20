import { Q, has } from "../SqlUi";
import type { SqlTopicData } from "../SqlTopic";

// Module 1 · topic 8: CRUD — Create, Read, Update, Delete: INSERT, SELECT, UPDATE and DELETE.

const crud = (
  <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
    {[
      ["C — Create", "создать", "INSERT"],
      ["R — Read", "прочитать", "SELECT"],
      ["U — Update", "изменить", "UPDATE"],
      ["D — Delete", "удалить", "DELETE"],
    ].map(([a, b, c]) => (
      <div key={a} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="font-bold text-slate-700">{a}</p>
        <p className="text-slate-500">{b}</p>
        <p className="mt-1 font-mono font-bold text-sky-700">{c}</p>
      </div>
    ))}
  </div>
);

export const SQL_CRUD: SqlTopicData = {
  id: "sql-crud",
  theory: {
    title: "CRUD: создать, прочитать, изменить, удалить",
    description: "Четыре действия, из которых состоит работа почти любого приложения с базой: INSERT, SELECT, UPDATE и DELETE.",
    parts: [
      {
        title: "Что такое CRUD",
        text: (
          <>
            <p>
              <b>CRUD</b> — четыре главных действия с данными. Что бы ни делало приложение — магазин, дневник, соцсеть, — под капотом
              оно добавляет, читает, меняет и удаляет строки. Опубликовал пост — INSERT, открыл ленту — SELECT, поправил подпись —
              UPDATE, удалил — DELETE.
            </p>
          </>
        ),
        extra: crud,
      },
      {
        title: "Create — INSERT",
        text: (
          <>
            <p>
              <Q>INSERT INTO таблица (столбцы) VALUES (значения);</Q> Лучше всегда перечислять столбцы: тогда команда не сломается,
              если в таблицу добавят новый столбец, а пропущенные столбцы получат значение по умолчанию.
            </p>
          </>
        ),
        examples: [{ code: "INSERT INTO products (id, name, category, price)\nVALUES (9, 'Мафия', 'карточная', 790);\nSELECT * FROM products;", db: "shop" }],
      },
      {
        title: "Read — SELECT",
        text: (
          <>
            <p>
              <Q>SELECT столбцы FROM таблица WHERE условие ORDER BY столбец;</Q> Условия можно соединять словами <Q>AND</Q> (и) и{" "}
              <Q>OR</Q> (или). Пустое значение проверяют не через =, а через <Q>IS NULL</Q> / <Q>IS NOT NULL</Q>.
            </p>
          </>
        ),
        examples: [
          { code: "SELECT name, price FROM products\nWHERE category = 'стратегия' AND price < 3000;", db: "shop" },
          { code: "SELECT * FROM loans\nWHERE returned IS NULL;", db: "library", note: "Книги, которые ещё не вернули." },
        ],
      },
      {
        title: "Update — UPDATE",
        text: (
          <>
            <p>
              <Q>UPDATE таблица SET столбец = значение WHERE условие;</Q> меняет значения в строках, которые подходят под условие.
              Можно менять несколько столбцов: <Q>SET price = 500, stock = 10</Q>. Новое значение можно вычислить из старого:{" "}
              <Q>SET price = price * 0.9</Q> — скидка 10%.
            </p>
            <p className="font-bold text-rose-600">Без WHERE UPDATE изменит ВСЕ строки таблицы!</p>
          </>
        ),
        examples: [
          { code: "UPDATE products SET stock = 10\nWHERE id = 5;\nSELECT * FROM products;", db: "shop", note: "Имаджинариум завезли — 10 штук." },
          { code: "UPDATE products SET price = price * 0.9\nWHERE category = 'карточная';\nSELECT name, price FROM products;", db: "shop", note: "Скидка 10% на карточные игры." },
        ],
      },
      {
        title: "Delete — DELETE",
        text: (
          <>
            <p>
              <Q>DELETE FROM таблица WHERE условие;</Q> удаляет подходящие строки. Сама таблица остаётся (в отличие от DROP TABLE).
              Строку, на которую ссылаются другие таблицы, удалить не получится — сработает внешний ключ.
            </p>
            <p className="font-bold text-rose-600">Без WHERE DELETE удалит ВСЕ строки! Сначала проверь условие через SELECT с тем же WHERE.</p>
          </>
        ),
        examples: [
          { code: "DELETE FROM products WHERE stock = 0;\nSELECT name, stock FROM products;", db: "shop", note: "Убрали товары, которых нет на складе." },
          { code: "DELETE FROM readers WHERE id = 1;", db: "library", note: "Ошибка: у читателя 1 есть выдачи — на него ссылаются." },
        ],
      },
    ],
  },
  game: {
    title: "Пиксель за кассой",
    description: "Пиксель работает в магазине настольных игр: принимает товар, ищет, меняет цены и убирает лишнее. Пять миссий.",
    finish: "Касса закрыта, база в порядке — Пиксель освоил CRUD! Закрепим на практике.",
    missions: [
      {
        title: "Create: новый товар",
        body: <p>Привезли новую игру — «Эрудит», настольная, 1890 рублей, 6 штук.</p>,
        goal: (
          <>
            Добавь товар (9, 'Эрудит', 'слова', 1890, 6) в <Q>products</Q>.
          </>
        ),
        db: "shop",
        start: "INSERT INTO products (id, name, category, price, stock)\nVALUES ",
        solution: "INSERT INTO products (id, name, category, price, stock) VALUES (9, 'Эрудит', 'слова', 1890, 6);",
        verify: "SELECT * FROM products ORDER BY id",
        hint: "VALUES (9, 'Эрудит', 'слова', 1890, 6);",
      },
      {
        title: "Read: что подешевле",
        body: <p>Покупатель спрашивает игры дешевле 1000 рублей.</p>,
        goal: <>Покажи названия и цены товаров с ценой меньше 1000.</>,
        db: "shop",
        start: "",
        solution: "SELECT name, price FROM products WHERE price < 1000;",
        hint: "SELECT name, price FROM products WHERE price < 1000;",
      },
      {
        title: "Update: завезли товар",
        body: <p>«Имаджинариум» (id = 5) закончился, но сегодня привезли 8 коробок.</p>,
        goal: <>Поставь товару с id = 5 остаток 8.</>,
        db: "shop",
        start: "UPDATE products\n",
        solution: "UPDATE products SET stock = 8 WHERE id = 5;",
        verify: "SELECT id, stock FROM products ORDER BY id",
        hint: "UPDATE products SET stock = 8 WHERE id = 5; — не забудь WHERE, иначе изменятся все товары!",
      },
      {
        title: "Update: распродажа",
        body: <p>Распродажа стратегий: цена всех стратегий снижается на 500 рублей.</p>,
        goal: <>Уменьши на 500 цену товаров категории 'стратегия'.</>,
        db: "shop",
        start: "",
        solution: "UPDATE products SET price = price - 500 WHERE category = 'стратегия';",
        verify: "SELECT id, price FROM products ORDER BY id",
        hint: "SET price = price - 500 WHERE category = 'стратегия'",
      },
      {
        title: "Delete: снят с продажи",
        body: <p>«Свинтус» (id = 7) больше не продаётся. Заказов на него нет? Есть! Сначала убери заказ, потом товар.</p>,
        goal: <>Удали заказ на товар 7 из <Q>orders</Q>, затем сам товар 7 из <Q>products</Q>.</>,
        db: "shop",
        start: "",
        solution: "DELETE FROM orders WHERE product_id = 7;\nDELETE FROM products WHERE id = 7;",
        verify: "SELECT (SELECT COUNT(*) FROM products), (SELECT COUNT(*) FROM orders), (SELECT COUNT(*) FROM products WHERE id = 7)",
        hint: "DELETE FROM orders WHERE product_id = 7; потом DELETE FROM products WHERE id = 7;",
      },
    ],
  },
  levels: [
    {
      badge: "INSERT",
      prompt: "Добавь автора (7, 'Николай Носов', 'Россия').",
      db: "library",
      start: "",
      solution: "INSERT INTO authors (id, name, country) VALUES (7, 'Николай Носов', 'Россия');",
      verify: "SELECT * FROM authors ORDER BY id",
      explain: "INSERT INTO authors (id, name, country) VALUES (7, 'Николай Носов', 'Россия');",
    },
    {
      badge: "SELECT + WHERE",
      prompt: "Покажи названия сказок (genre = 'сказка').",
      db: "library",
      start: "",
      solution: "SELECT title FROM books WHERE genre = 'сказка';",
      explain: "SELECT title FROM books WHERE genre = 'сказка';",
    },
    {
      badge: "AND",
      prompt: "Покажи названия и цены карточных игр, которых на складе больше 20 штук.",
      db: "shop",
      start: "",
      solution: "SELECT name, price FROM products WHERE category = 'карточная' AND stock > 20;",
      explain: "Два условия через AND: category = 'карточная' AND stock > 20.",
    },
    {
      badge: "IS NULL",
      prompt: "Покажи номера книг (book_id), которые ещё не вернули (returned пустой).",
      db: "library",
      start: "",
      solution: "SELECT book_id FROM loans WHERE returned IS NULL;",
      rule: (code) => has(code, /is\s+null/i),
      ruleHint: "пустое значение проверяют через IS NULL.",
      explain: "SELECT book_id FROM loans WHERE returned IS NULL; — «= NULL» не работает: NULL ничему не равен.",
    },
    {
      badge: "UPDATE",
      prompt: "Читательница Даша Орлова (id = 5) перешла в 10В. Исправь её класс.",
      db: "library",
      start: "",
      solution: "UPDATE readers SET class = '10В' WHERE id = 5;",
      verify: "SELECT * FROM readers ORDER BY id",
      explain: "UPDATE readers SET class = '10В' WHERE id = 5;",
    },
    {
      badge: "UPDATE двух столбцов",
      prompt: "Товар id = 3 («Монополия»): новая цена 2590 и остаток 10 — одной командой.",
      db: "shop",
      start: "",
      solution: "UPDATE products SET price = 2590, stock = 10 WHERE id = 3;",
      verify: "SELECT * FROM products ORDER BY id",
      rule: (code) => (code.match(/update/gi) ?? []).length === 1,
      ruleHint: "одной командой UPDATE: SET price = 2590, stock = 10.",
      explain: "UPDATE products SET price = 2590, stock = 10 WHERE id = 3;",
    },
    {
      badge: "UPDATE с расчётом",
      prompt: "Подорожание: увеличь на 10% цену всех товаров дороже 2500.",
      db: "shop",
      start: "",
      solution: "UPDATE products SET price = price * 1.1 WHERE price > 2500;",
      verify: "SELECT id, price FROM products ORDER BY id",
      explain: "UPDATE products SET price = price * 1.1 WHERE price > 2500;",
    },
    {
      badge: "DELETE",
      prompt: "Удали выдачи, по которым книгу уже вернули (returned не пустой).",
      db: "library",
      start: "",
      solution: "DELETE FROM loans WHERE returned IS NOT NULL;",
      verify: "SELECT * FROM loans ORDER BY id",
      explain: "DELETE FROM loans WHERE returned IS NOT NULL;",
    },
    {
      badge: "найди ошибку",
      prompt: "Команда должна удалить только выдачи читательницы Ани (reader_id = 1), а удаляет все выдачи библиотеки. Исправь её.",
      db: "library",
      start: "DELETE FROM loans;",
      solution: "DELETE FROM loans WHERE reader_id = 1;",
      verify: "SELECT * FROM loans ORDER BY id",
      hint: "Без WHERE DELETE удаляет все строки. Добавь WHERE reader_id = 1.",
      explain: "DELETE FROM loans WHERE reader_id = 1; — без WHERE пропала бы вся история выдач.",
      hideExpected: true,
    },
    {
      kind: "choice",
      badge: "CRUD",
      prompt: "Пользователь поменял фотографию профиля. Какая команда SQL при этом сработала?",
      options: ["INSERT", "SELECT", "UPDATE", "DELETE"],
      answer: 2,
      explain: "Поменять существующую строку — UPDATE.",
    },
  ],
  cards: [
    { text: "CRUD — это Create, Read, Update, Delete.", answer: true, explain: "Да: создать, прочитать, изменить, удалить." },
    { text: "Read в SQL — это команда READ.", answer: false, explain: "Нет, чтение — SELECT." },
    { text: "UPDATE без WHERE изменит все строки таблицы.", answer: true, explain: "Да, поэтому WHERE так важен." },
    { text: "DELETE удаляет таблицу целиком.", answer: false, explain: "Нет, DELETE удаляет строки, таблица остаётся. Таблицу удаляет DROP TABLE." },
    { text: "Пустое значение проверяют так: WHERE returned = NULL.", answer: false, explain: "Нет, нужно IS NULL. NULL ничему не равен, даже другому NULL." },
    { text: "SET price = price * 0.9 снижает цену на 10%.", answer: true, explain: "Да, новое значение вычисляется из старого." },
    { text: "Перед DELETE полезно выполнить SELECT с тем же условием.", answer: true, explain: "Да, чтобы увидеть, что именно удалится." },
    { text: "Одной командой UPDATE можно изменить несколько столбцов.", answer: true, explain: "Да, через запятую после SET." },
    { text: "Строку, на которую ссылается внешний ключ, удалить нельзя.", answer: true, explain: "Да, сначала удаляют ссылающиеся строки." },
    { text: "AND означает «или».", answer: false, explain: "Нет, AND — «и» (оба условия), OR — «или»." },
  ],
};
