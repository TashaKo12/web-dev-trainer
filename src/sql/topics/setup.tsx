import { Q } from "../SqlUi";
import type { SqlRun } from "../engine";
import type { SqlTopicData } from "../SqlTopic";

// Module 1 · topic 5: DBMS overview (2022), domestic DBMS, why MySQL, its editions, installing MySQL 8 on Windows,
// the client (MySQL Workbench, the command line) and the first commands: CREATE DATABASE, USE, SHOW, DESCRIBE.

const said = (r: SqlRun, re: RegExp) => r.outputs.some((o) => re.test(o.sql));

const dbms = (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
      <thead className="bg-slate-100 text-slate-600">
        <tr>
          <th className="px-3 py-1.5">СУБД</th>
          <th className="px-3 py-1.5">Чья</th>
          <th className="px-3 py-1.5">Чем известна</th>
        </tr>
      </thead>
      <tbody className="text-slate-700">
        {[
          ["Oracle Database", "Oracle, США", "банки и крупные компании, платная"],
          ["MySQL", "Oracle, США (открытая)", "сайты и веб-сервисы, бесплатная Community"],
          ["Microsoft SQL Server", "Microsoft, США", "работает с программами Windows"],
          ["PostgreSQL", "открытый проект", "мощная, бесплатная, строго следует стандарту"],
          ["SQLite", "открытый проект", "встраиваемая: в телефонах, браузерах, приложениях"],
          ["Postgres Pro", "Россия", "отечественная, на основе PostgreSQL, в реестре российского ПО"],
          ["Ред База Данных", "Россия", "отечественная, на основе Firebird"],
          ["Tantor, Jatoba", "Россия", "отечественные СУБД на основе PostgreSQL"],
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

const install = (
  <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
    <li>
      Скачай <b>MySQL Installer for Windows</b> с официального сайта dev.mysql.com (раздел Downloads → MySQL Community) — с разрешения
      взрослого.
    </li>
    <li>
      Выбери вариант установки <b>Server only</b> или <b>Custom</b> и отметь <b>MySQL Server 8</b> и <b>MySQL Workbench</b> (клиент
      с окнами).
    </li>
    <li>
      Тип настройки — <b>Development Computer</b>, порт оставь <b>3306</b> (стандартный порт MySQL).
    </li>
    <li>
      Придумай пароль для главного пользователя <b>root</b> и запиши его в надёжное место — без него в базу не войти.
    </li>
    <li>
      Оставь галочку «запускать MySQL как службу Windows» (Windows Service) — сервер будет стартовать вместе с компьютером.
    </li>
    <li>
      Открой <b>MySQL Workbench</b>, нажми на подключение <b>Local instance</b>, введи пароль — откроется окно для запросов.
    </li>
  </ol>
);

export const SQL_SETUP: SqlTopicData = {
  id: "sql-setup",
  theory: {
    title: "СУБД и установка MySQL",
    description: "Какие бывают СУБД, почему мы выбрали MySQL, как установить её на Windows и подключиться к серверу.",
    parts: [
      {
        title: "Какие бывают СУБД",
        text: (
          <>
            <p>
              Реляционных СУБД много. В мировых рейтингах 2022 года первые места занимали Oracle, MySQL, Microsoft SQL Server и
              PostgreSQL. Все они понимают SQL, но у каждой свой «диалект» — небольшие отличия в командах.
            </p>
            <p>
              В России развиваются <b>отечественные СУБД</b> — их используют государственные организации и крупные компании. Многие
              построены на основе открытой PostgreSQL.
            </p>
          </>
        ),
        extra: dbms,
      },
      {
        title: "Почему MySQL",
        text: (
          <>
            <p>
              <b>MySQL</b> появилась в 1995 году в Швеции, а сейчас принадлежит компании Oracle. Её выбирают для учёбы и для сайтов,
              потому что она:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>бесплатная в редакции Community и работает на Windows, macOS и Linux;</li>
              <li>быстрая и надёжная — на ней работали Facebook, YouTube и «ВКонтакте»;</li>
              <li>простая в установке, у неё удобный клиент MySQL Workbench;</li>
              <li>по ней много учебников и ответов в интернете.</li>
            </ul>
            <p>
              <b>Редакции MySQL 8</b>: Community Edition — бесплатная, с открытым кодом; Enterprise Edition — платная, с поддержкой и
              инструментами для больших компаний; Cluster — для систем, которые не должны останавливаться ни на секунду.
            </p>
          </>
        ),
      },
      {
        title: "Установка MySQL на Windows",
        text: (
          <>
            <p>
              MySQL работает как <b>сервер</b>: программа, которая всё время запущена и ждёт запросов. Мы подключаемся к ней через{" "}
              <b>клиент</b> — программу, где пишут запросы и видят результат. Сервер и клиент могут быть на одном компьютере.
            </p>
          </>
        ),
        extra: install,
      },
      {
        title: "Подключение и первые команды",
        text: (
          <>
            <p>
              В командной строке к серверу подключаются так: <Q>mysql -u root -p</Q> — пользователь root, пароль спросят. В Workbench —
              кнопкой подключения. Дальше работа одинаковая:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <Q>SHOW DATABASES;</Q> — какие базы есть на сервере;
              </li>
              <li>
                <Q>CREATE DATABASE school;</Q> — создать базу;
              </li>
              <li>
                <Q>USE school;</Q> — выбрать базу, с которой работаем;
              </li>
              <li>
                <Q>SHOW TABLES;</Q> и <Q>DESCRIBE таблица;</Q> — что внутри.
              </li>
            </ul>
            <p>
              Песочница на этой странице — маленький сервер прямо в браузере: в ней всегда открыта одна база, но команды MySQL она
              понимает. Ничего устанавливать не нужно, чтобы тренироваться.
            </p>
          </>
        ),
        examples: [
          { code: "CREATE DATABASE school;\nUSE school;\nSHOW TABLES;", db: "empty", note: "База новая — таблиц пока нет." },
          { code: "SHOW DATABASES;\nSHOW TABLES;", db: "library" },
        ],
      },
      {
        title: "Как не потерять работу",
        text: (
          <>
            <p>
              Сервер хранит базы в файлах на диске. Чтобы сохранить базу целиком (резервную копию), используют программу{" "}
              <Q>mysqldump</Q> или пункт <b>Data Export</b> в Workbench — получается файл с командами SQL, которые создают таблицы и
              данные заново.
            </p>
            <p>
              Важные правила: не работай под root в настоящих проектах — заведи отдельного пользователя; не удаляй базы, не проверив, что
              это именно та база; перед большими изменениями делай резервную копию.
            </p>
          </>
        ),
        examples: [{ code: "DROP DATABASE test;", db: "empty", note: "В MySQL эта команда удаляет базу навсегда. В песочнице — понарошку." }],
      },
    ],
  },
  game: {
    title: "Пиксель настраивает сервер",
    description: "В школе поставили сервер MySQL. Пиксель создаёт первую базу — четыре миссии.",
    finish: "Сервер настроен, база создана! Закрепим на практике.",
    missions: [
      {
        title: "Что есть на сервере",
        body: <p>Пиксель впервые подключился к серверу. Какие на нём базы?</p>,
        goal: <>Покажи список баз данных на сервере.</>,
        db: "empty",
        start: "",
        solution: "SHOW DATABASES;",
        hint: "SHOW DATABASES;",
      },
      {
        title: "Новая база",
        body: <p>Для кружка робототехники нужна своя база.</p>,
        goal: (
          <>
            Создай базу <Q>robots</Q>.
          </>
        ),
        db: "empty",
        start: "",
        solution: "CREATE DATABASE robots;",
        custom: (r) => said(r, /^CREATE\s+DATABASE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?robots`?$/i),
        hint: "CREATE DATABASE robots;",
      },
      {
        title: "Работаем в ней",
        body: <p>Базу мало создать — нужно выбрать её, чтобы следующие команды выполнялись внутри.</p>,
        goal: (
          <>
            Создай базу <Q>robots</Q>, выбери её командой <Q>USE</Q> и покажи, какие в ней таблицы.
          </>
        ),
        db: "empty",
        start: "CREATE DATABASE robots;\n",
        solution: "CREATE DATABASE robots;\nUSE robots;\nSHOW TABLES;",
        custom: (r) => said(r, /^USE\s+`?robots`?$/i) && said(r, /^SHOW\s+TABLES$/i),
        hint: "После CREATE DATABASE напиши USE robots; и SHOW TABLES;",
      },
      {
        title: "Осмотр чужой базы",
        body: <p>Пиксель заглядывает в базу магазина, чтобы понять, как в ней хранят покупателей.</p>,
        goal: (
          <>
            Покажи описание таблицы <Q>customers</Q>.
          </>
        ),
        db: "shop",
        start: "",
        solution: "DESCRIBE customers;",
        hint: "DESCRIBE customers;",
      },
    ],
  },
  levels: [
    {
      kind: "choice",
      badge: "СУБД",
      prompt: "Какая из этих СУБД — отечественная?",
      options: ["MySQL", "Oracle Database", "Postgres Pro", "Microsoft SQL Server"],
      answer: 2,
      explain: "Postgres Pro — российская СУБД на основе PostgreSQL.",
    },
    {
      kind: "choice",
      badge: "редакции",
      prompt: "Какая редакция MySQL бесплатная и с открытым кодом?",
      options: ["Enterprise", "Community", "Cluster", "Standard"],
      answer: 1,
      explain: "Community Edition. Enterprise — платная, с поддержкой.",
    },
    {
      kind: "choice",
      badge: "порт",
      prompt: "Какой стандартный порт у сервера MySQL?",
      options: ["80", "443", "3306", "8080"],
      answer: 2,
      explain: "3306. Порты 80 и 443 — у веб-сайтов.",
    },
    {
      kind: "choice",
      badge: "клиент",
      prompt: "Что такое MySQL Workbench?",
      options: ["Сервер MySQL", "Клиент с окнами для запросов к серверу", "Язык запросов", "Отечественная СУБД"],
      answer: 1,
      explain: "Workbench — клиент: в нём пишут запросы и видят результат, а выполняет их сервер.",
    },
    {
      badge: "CREATE DATABASE",
      prompt: (
        <>
          Создай базу <Q>cinema</Q>.
        </>
      ),
      db: "empty",
      start: "",
      solution: "CREATE DATABASE cinema;",
      custom: (r) => said(r, /^CREATE\s+DATABASE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?cinema`?$/i),
      explain: "CREATE DATABASE cinema;",
    },
    {
      badge: "USE",
      prompt: (
        <>
          Создай базу <Q>zoo</Q> и выбери её для работы.
        </>
      ),
      db: "empty",
      start: "",
      solution: "CREATE DATABASE zoo;\nUSE zoo;",
      custom: (r) => said(r, /^CREATE\s+DATABASE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?zoo`?$/i) && said(r, /^USE\s+`?zoo`?$/i),
      explain: "CREATE DATABASE zoo; USE zoo; — сначала создать, потом выбрать.",
    },
    {
      badge: "SHOW TABLES",
      prompt: "Какие таблицы есть в базе «Школа»?",
      db: "school",
      start: "",
      solution: "SHOW TABLES;",
      explain: "SHOW TABLES;",
    },
    {
      badge: "DESCRIBE",
      prompt: "Покажи, какие столбцы у таблицы products.",
      db: "shop",
      start: "",
      solution: "DESCRIBE products;",
      explain: "DESCRIBE products; — или короче DESC products;",
    },
  ],
  cards: [
    { text: "MySQL — это клиент, а Workbench — сервер.", answer: false, explain: "Наоборот: MySQL Server — сервер, Workbench — клиент." },
    { text: "MySQL Community Edition — бесплатная.", answer: true, explain: "Да, с открытым кодом." },
    { text: "Стандартный порт MySQL — 3306.", answer: true, explain: "Да, его оставляют при установке." },
    { text: "Команда USE создаёт базу данных.", answer: false, explain: "Нет, USE выбирает базу. Создаёт — CREATE DATABASE." },
    { text: "Postgres Pro — отечественная СУБД.", answer: true, explain: "Да, российская, на основе PostgreSQL." },
    { text: "Пароль пользователя root можно не запоминать.", answer: false, explain: "Нет, без него в сервер не войти. Запиши его в надёжное место." },
    { text: "SHOW DATABASES показывает таблицы текущей базы.", answer: false, explain: "Нет, базы на сервере. Таблицы — SHOW TABLES." },
    { text: "mysql -u root -p — подключение к серверу из командной строки.", answer: true, explain: "Да: -u — пользователь, -p — спросить пароль." },
    { text: "Резервную копию базы делают программой mysqldump.", answer: true, explain: "Да, или через Data Export в Workbench." },
    { text: "Все СУБД понимают SQL абсолютно одинаково.", answer: false, explain: "Нет, у каждой свой диалект с небольшими отличиями." },
  ],
};
