import { Q } from "../SqlUi";
import type { SqlTopicData } from "../SqlTopic";

// Module 1 · topic 4: designing a database — relationships 1:1, 1:N, N:M, primary and foreign keys, 1NF–3NF, design steps.

const bad = (
  <div className="space-y-2 text-sm">
    <p className="font-bold text-rose-700">Плохо: всё в одной таблице</p>
    <pre className="overflow-x-auto rounded-xl bg-rose-50 p-3 font-mono text-[0.8125rem] text-rose-900">
      {`ученик | класс | классный руководитель | кружки
Аня    | 8А    | Мария Ивановна        | шахматы, роботы
Глеб   | 8А    | Мария Ивановна        | шахматы`}
    </pre>
    <p className="text-slate-600">
      В ячейке «кружки» — список (нарушение 1НФ), а руководитель повторяется у каждого ученика 8А: если он сменится, править придётся
      много строк, и легко ошибиться.
    </p>
  </div>
);

export const SQL_DESIGN: SqlTopicData = {
  id: "sql-design",
  theory: {
    title: "Проектирование: связи, ключи, нормализация",
    description: "Как разложить данные по таблицам: виды связей, первичные и внешние ключи, нормальные формы и шаги проектирования.",
    parts: [
      {
        title: "Первичный ключ",
        text: (
          <>
            <p>
              <b>Первичный ключ</b> (PRIMARY KEY) — столбец (или несколько), значение которого у каждой строки своё и не бывает пустым.
              По нему строку находят однозначно. Чаще всего это номер <Q>id</Q>: имена повторяются, а номера — нет.
            </p>
            <p>СУБД сама следит за ключом: добавить вторую строку с тем же id не получится.</p>
          </>
        ),
        examples: [
          { code: "DESCRIBE readers;", db: "library", note: "Key = PRI у столбца id — это первичный ключ." },
          { code: "INSERT INTO readers VALUES (1, 'Ещё одна Аня', '7Б');", db: "library", note: "Ошибка: читатель с id = 1 уже есть." },
        ],
      },
      {
        title: "Внешний ключ",
        text: (
          <>
            <p>
              <b>Внешний ключ</b> (FOREIGN KEY) — столбец, который хранит первичный ключ строки <i>другой</i> таблицы. Так таблицы
              связываются: <Q>books.author_id</Q> ссылается на <Q>authors.id</Q>.
            </p>
            <p>
              СУБД следит за ссылками: нельзя записать книгу с автором, которого нет, и нельзя удалить автора, у которого есть книги.
              Это называют <b>ссылочной целостностью</b>.
            </p>
          </>
        ),
        examples: [
          { code: "INSERT INTO books VALUES (11, 'Новая книга', 99, 2026, 100, 'роман');", db: "library", note: "Ошибка: автора с id = 99 нет." },
          {
            code: "CREATE TABLE classes (\n  id INT PRIMARY KEY,\n  title VARCHAR(5)\n);\nCREATE TABLE pupils (\n  id INT PRIMARY KEY,\n  name VARCHAR(40),\n  class_id INT,\n  FOREIGN KEY (class_id) REFERENCES classes(id)\n);\nDESCRIBE pupils;",
            db: "empty",
            note: "FOREIGN KEY (столбец) REFERENCES таблица(столбец) — так объявляют связь.",
          },
        ],
      },
      {
        title: "Виды связей: 1:1, 1:N, N:M",
        text: (
          <>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <b>Один к одному (1:1)</b> — одной строке соответствует одна: ученик и его пропуск. Внешний ключ ставят с пометкой
                UNIQUE.
              </li>
              <li>
                <b>Один ко многим (1:N)</b> — самая частая: у автора много книг, у книги один автор. Внешний ключ ставят на стороне
                «многих» — в книгах.
              </li>
              <li>
                <b>Многие ко многим (N:M)</b> — читатель берёт много книг, книгу берут многие читатели. Такую связь хранят в отдельной
                <b> таблице-связке</b> с двумя внешними ключами — это наша <Q>loans</Q>.
              </li>
            </ul>
          </>
        ),
        examples: [
          { code: "SELECT author_id, title FROM books;", db: "library", note: "1:N — у автора 3 (Роулинг) две книги." },
          { code: "SELECT reader_id, book_id FROM loans;", db: "library", note: "N:M через таблицу-связку loans: читатель 1 брал книги 4 и 10, а книгу… может взять кто угодно." },
        ],
      },
      {
        title: "Нормализация: 1НФ, 2НФ, 3НФ",
        text: (
          <>
            <p>
              <b>Нормализация</b> — разбиение данных на таблицы так, чтобы ничего не повторялось и не противоречило. Есть ступени —
              нормальные формы:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <b>1НФ</b>: в каждой ячейке одно значение (не список «шахматы, роботы»), строки не повторяются.
              </li>
              <li>
                <b>2НФ</b>: 1НФ + каждый столбец зависит от <i>всего</i> ключа, а не от его части (важно, когда ключ из двух столбцов).
              </li>
              <li>
                <b>3НФ</b>: 2НФ + столбцы не зависят друг от друга через третий: имя классного руководителя зависит от класса, а не от
                ученика — его выносят в таблицу классов.
              </li>
            </ul>
          </>
        ),
        extra: bad,
      },
      {
        title: "Шаги проектирования",
        text: (
          <>
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                <b>Анализ предметной области</b>: что за данные, кто с ними работает, какие вопросы к ним зададут.
              </li>
              <li>
                <b>Инфологическое проектирование</b>: сущности, атрибуты, связи — ER-диаграмма.
              </li>
              <li>
                <b>Выбор СУБД</b>: MySQL, PostgreSQL, SQLite… — по задаче, нагрузке и бюджету.
              </li>
              <li>
                <b>Логическое проектирование</b>: таблицы, ключи, нормализация до 3НФ.
              </li>
              <li>
                <b>Физическое проектирование</b>: типы данных, индексы — и CREATE TABLE.
              </li>
            </ol>
            <p>Вот как спроектированная таблица-связка для кружков выглядит в SQL:</p>
          </>
        ),
        examples: [
          {
            code: "CREATE TABLE pupils (id INT PRIMARY KEY, name VARCHAR(40));\nCREATE TABLE clubs (id INT PRIMARY KEY, title VARCHAR(40));\nCREATE TABLE memberships (\n  pupil_id INT REFERENCES pupils(id),\n  club_id INT REFERENCES clubs(id),\n  PRIMARY KEY (pupil_id, club_id)\n);\nDESCRIBE memberships;",
            db: "empty",
            note: "Ключ из двух столбцов: один ученик не может записаться в один кружок дважды.",
          },
        ],
      },
    ],
  },
  game: {
    title: "Пиксель наводит порядок",
    description: "Школа хранила всё в одной большой таблице. Пиксель раскладывает данные правильно — четыре миссии.",
    finish: "Теперь у школы аккуратная база в 3НФ. Закрепим на практике!",
    missions: [
      {
        title: "Ключ не повторяется",
        body: <p>Пиксель проверяет, правда ли база не даст добавить двух читателей с одинаковым номером.</p>,
        goal: (
          <>
            Добавь читателя <Q>(6, 'Ева Лис', '8Б')</Q> в <Q>readers</Q> — с новым номером, чтобы ключ не повторился.
          </>
        ),
        db: "library",
        start: "INSERT INTO readers VALUES (1, 'Ева Лис', '8Б');",
        solution: "INSERT INTO readers VALUES (6, 'Ева Лис', '8Б');",
        verify: "SELECT * FROM readers ORDER BY id",
        hint: "Номер 1 уже занят — возьми 6.",
      },
      {
        title: "Таблица классов",
        body: <p>Классный руководитель зависит от класса, а не от ученика. Значит, нужна отдельная таблица классов (3НФ).</p>,
        goal: (
          <>
            Создай таблицу <Q>classes</Q>: <Q>id INT</Q> — первичный ключ, <Q>title VARCHAR(5)</Q>, <Q>teacher VARCHAR(60)</Q>.
          </>
        ),
        db: "empty",
        start: "",
        solution: "CREATE TABLE classes (id INT PRIMARY KEY, title VARCHAR(5), teacher VARCHAR(60));",
        verify: "SELECT name, REPLACE(UPPER(REPLACE(type, ' ', '')), 'INTEGER', 'INT'), pk FROM pragma_table_info('classes') ORDER BY cid",
        hint: "CREATE TABLE classes (id INT PRIMARY KEY, title VARCHAR(5), teacher VARCHAR(60));",
      },
      {
        title: "Ученики ссылаются на класс",
        body: <p>Таблица классов уже есть. Теперь ученики: каждый ссылается на свой класс внешним ключом (связь 1:N).</p>,
        goal: (
          <>
            Создай <Q>pupils</Q>: <Q>id INT</Q> (первичный ключ), <Q>name VARCHAR(40)</Q>, <Q>class_id INT</Q> — внешний ключ на{" "}
            <Q>classes(id)</Q>.
          </>
        ),
        db: "empty",
        start: "CREATE TABLE classes (id INT PRIMARY KEY, title VARCHAR(5), teacher VARCHAR(60));\n\n",
        solution:
          "CREATE TABLE classes (id INT PRIMARY KEY, title VARCHAR(5), teacher VARCHAR(60));\nCREATE TABLE pupils (id INT PRIMARY KEY, name VARCHAR(40), class_id INT, FOREIGN KEY (class_id) REFERENCES classes(id));",
        verify: "SELECT \"table\", \"from\", \"to\" FROM pragma_foreign_key_list('pupils')",
        hint: "В конце списка столбцов: FOREIGN KEY (class_id) REFERENCES classes(id)",
      },
      {
        title: "Многие ко многим",
        body: <p>Ученик ходит в несколько кружков, в кружке много учеников. Нужна таблица-связка.</p>,
        goal: (
          <>
            Создай <Q>memberships</Q> с двумя столбцами <Q>pupil_id INT</Q> и <Q>club_id INT</Q> и составным первичным ключом из обоих.
          </>
        ),
        db: "empty",
        start: "",
        solution: "CREATE TABLE memberships (pupil_id INT, club_id INT, PRIMARY KEY (pupil_id, club_id));",
        verify: "SELECT name, pk FROM pragma_table_info('memberships') ORDER BY cid",
        hint: "Составной ключ пишут в конце: PRIMARY KEY (pupil_id, club_id)",
      },
    ],
  },
  levels: [
    {
      kind: "choice",
      badge: "первичный ключ",
      prompt: "Какой столбец лучше всего подходит для первичного ключа таблицы учеников?",
      options: ["Имя", "Класс", "Номер ученика id", "Город"],
      answer: 2,
      explain: "Имена, классы и города повторяются, а номер у каждого свой.",
    },
    {
      kind: "choice",
      badge: "виды связей",
      prompt: "Читатель берёт много книг, и каждую книгу берут многие читатели. Какая это связь?",
      options: ["1:1", "1:N", "N:M", "Связи нет"],
      answer: 2,
      explain: "Многие ко многим (N:M). Её хранят в таблице-связке — loans.",
    },
    {
      kind: "choice",
      badge: "внешний ключ",
      prompt: "У автора много книг, у книги один автор. В какой таблице должен быть внешний ключ?",
      options: ["В authors", "В books", "В обеих", "Нужна третья таблица"],
      answer: 1,
      explain: "Внешний ключ ставят на стороне «многих»: books.author_id.",
    },
    {
      kind: "choice",
      badge: "1НФ",
      prompt: "Ячейка «телефоны» содержит «+7 900…, +7 911…». Какая нормальная форма нарушена?",
      options: ["1НФ", "2НФ", "3НФ", "Ничего не нарушено"],
      answer: 0,
      explain: "В 1НФ в ячейке одно значение. Телефоны выносят в отдельную таблицу.",
    },
    {
      kind: "choice",
      badge: "3НФ",
      prompt: "В таблице заказов хранится город покупателя. Почему это нарушает 3НФ?",
      options: ["Город — это текст", "Город зависит от покупателя, а не от заказа", "У заказа нет ключа", "Город может быть пустым"],
      answer: 1,
      explain: "Город — свойство покупателя. Его хранят в таблице покупателей, а в заказе — только customer_id.",
    },
    {
      badge: "ключ в деле",
      prompt: "Добавь в products новый товар: (9, 'Codenames', 'ассоциации', 1990, 5). Номер должен быть свободным.",
      db: "shop",
      start: "",
      solution: "INSERT INTO products VALUES (9, 'Codenames', 'ассоциации', 1990, 5);",
      verify: "SELECT * FROM products ORDER BY id",
      explain: "INSERT INTO products VALUES (9, 'Codenames', 'ассоциации', 1990, 5); — номера 1–8 заняты.",
    },
    {
      badge: "внешний ключ",
      prompt: (
        <>
          Создай таблицы <Q>teams</Q> (<Q>id INT</Q> ключ, <Q>name VARCHAR(40)</Q>) и <Q>players</Q> (<Q>id INT</Q> ключ,{" "}
          <Q>name VARCHAR(40)</Q>, <Q>team_id INT</Q> — внешний ключ на <Q>teams(id)</Q>).
        </>
      ),
      db: "empty",
      start: "",
      solution: "CREATE TABLE teams (id INT PRIMARY KEY, name VARCHAR(40));\nCREATE TABLE players (id INT PRIMARY KEY, name VARCHAR(40), team_id INT, FOREIGN KEY (team_id) REFERENCES teams(id));",
      verify: "SELECT \"table\", \"from\", \"to\" FROM pragma_foreign_key_list('players')",
      hideExpected: true,
      explain: "Сначала teams, потом players с FOREIGN KEY (team_id) REFERENCES teams(id).",
    },
    {
      badge: "таблица-связка",
      prompt: (
        <>
          Связь N:M «ученик — предмет»: создай <Q>pupil_subjects</Q> со столбцами <Q>pupil_id INT</Q>, <Q>subject_id INT</Q> и
          составным первичным ключом из них.
        </>
      ),
      db: "empty",
      start: "",
      solution: "CREATE TABLE pupil_subjects (pupil_id INT, subject_id INT, PRIMARY KEY (pupil_id, subject_id));",
      verify: "SELECT name, pk FROM pragma_table_info('pupil_subjects') ORDER BY cid",
      explain: "CREATE TABLE pupil_subjects (pupil_id INT, subject_id INT, PRIMARY KEY (pupil_id, subject_id));",
    },
    {
      badge: "целостность",
      prompt: "Добавь выдачу (8, 2, 3, '2026-11-01', NULL) — читатель 3 берёт книгу 2. Убедись, что такие книга и читатель существуют.",
      db: "library",
      start: "",
      solution: "INSERT INTO loans VALUES (8, 2, 3, '2026-11-01', NULL);",
      verify: "SELECT * FROM loans ORDER BY id",
      explain: "INSERT INTO loans VALUES (8, 2, 3, '2026-11-01', NULL); — внешние ключи указывают на существующие строки.",
    },
  ],
  cards: [
    { text: "Первичный ключ может быть пустым (NULL).", answer: false, explain: "Нет, у ключа всегда есть значение, и оно уникально." },
    { text: "Внешний ключ хранит первичный ключ строки другой таблицы.", answer: true, explain: "Да, так таблицы связываются." },
    { text: "Связь «многие ко многим» хранят в отдельной таблице-связке.", answer: true, explain: "Да, с двумя внешними ключами." },
    { text: "При связи 1:N внешний ключ ставят на стороне «одного».", answer: false, explain: "Нет, на стороне «многих»: в книгах, а не в авторах." },
    { text: "В 1НФ в ячейке может храниться список значений.", answer: false, explain: "Нет, 1НФ требует одно значение в ячейке." },
    { text: "Нормализация убирает повторы данных.", answer: true, explain: "Да, чтобы данные не противоречили друг другу." },
    { text: "Первичный ключ может состоять из нескольких столбцов.", answer: true, explain: "Да, это составной ключ, как в таблице-связке." },
    { text: "Нельзя записать книгу с автором, которого нет в таблице авторов, если есть внешний ключ.", answer: true, explain: "Да, это ссылочная целостность." },
    { text: "3НФ требует, чтобы столбцы зависели только от ключа, а не друг от друга.", answer: true, explain: "Да, транзитивные зависимости выносят в отдельные таблицы." },
    { text: "СУБД выбирают в самом конце, после CREATE TABLE.", answer: false, explain: "Нет, СУБД выбирают до логического и физического проектирования." },
  ],
};
