// Sample databases for the SQL course. Every run of a query starts from a fresh copy, so they never get spoiled.

export type DbName = "library" | "shop" | "school" | "empty";

/** «Школьная библиотека»: books, readers and who took what. */
const LIBRARY = `
CREATE TABLE authors (
  id INT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  country VARCHAR(40)
);
CREATE TABLE books (
  id INT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  author_id INT REFERENCES authors(id),
  year INT,
  pages INT,
  genre VARCHAR(30)
);
CREATE TABLE readers (
  id INT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  class VARCHAR(5)
);
CREATE TABLE loans (
  id INT PRIMARY KEY,
  book_id INT NOT NULL REFERENCES books(id),
  reader_id INT NOT NULL REFERENCES readers(id),
  taken DATE NOT NULL,
  returned DATE
);
INSERT INTO authors VALUES
  (1, 'Александр Пушкин', 'Россия'),
  (2, 'Лев Толстой', 'Россия'),
  (3, 'Джоан Роулинг', 'Великобритания'),
  (4, 'Жюль Верн', 'Франция'),
  (5, 'Кир Булычёв', 'Россия'),
  (6, 'Астрид Линдгрен', 'Швеция');
INSERT INTO books VALUES
  (1, 'Капитанская дочка', 1, 1836, 190, 'роман'),
  (2, 'Сказка о рыбаке и рыбке', 1, 1835, 24, 'сказка'),
  (3, 'Война и мир', 2, 1869, 1300, 'роман'),
  (4, 'Гарри Поттер и философский камень', 3, 1997, 400, 'фэнтези'),
  (5, 'Двадцать тысяч льё под водой', 4, 1870, 450, 'приключения'),
  (6, 'Таинственный остров', 4, 1875, 600, 'приключения'),
  (7, 'Сто лет тому вперёд', 5, 1978, 280, 'фантастика'),
  (8, 'Пеппи Длинныйчулок', 6, 1945, 200, 'сказка'),
  (9, 'Малыш и Карлсон', 6, 1955, 180, 'сказка'),
  (10, 'Гарри Поттер и Тайная комната', 3, 1998, 420, 'фэнтези');
INSERT INTO readers VALUES
  (1, 'Аня Смирнова', '8А'),
  (2, 'Борис Иванов', '9Б'),
  (3, 'Вика Петрова', '8А'),
  (4, 'Гоша Ким', '10В'),
  (5, 'Даша Орлова', '9Б');
INSERT INTO loans VALUES
  (1, 4, 1, '2026-09-02', '2026-09-20'),
  (2, 3, 4, '2026-09-05', NULL),
  (3, 7, 2, '2026-09-10', '2026-09-25'),
  (4, 10, 1, '2026-09-21', NULL),
  (5, 8, 3, '2026-10-01', '2026-10-08'),
  (6, 5, 5, '2026-10-03', NULL),
  (7, 1, 2, '2026-10-12', NULL);
`;

/** «Магазин настольных игр»: products, customers and orders. */
const SHOP = `
CREATE TABLE products (
  id INT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  category VARCHAR(30),
  price DECIMAL(8,2) NOT NULL,
  stock INT DEFAULT 0
);
CREATE TABLE customers (
  id INT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  city VARCHAR(40),
  email VARCHAR(80)
);
CREATE TABLE orders (
  id INT PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(id),
  product_id INT NOT NULL REFERENCES products(id),
  qty INT NOT NULL DEFAULT 1,
  ordered DATE NOT NULL
);
INSERT INTO products VALUES
  (1, 'Каркассон', 'стратегия', 2490, 7),
  (2, 'Уно', 'карточная', 590, 25),
  (3, 'Монополия', 'экономическая', 2990, 4),
  (4, 'Дженга', 'ловкость', 1290, 12),
  (5, 'Имаджинариум', 'ассоциации', 2790, 0),
  (6, 'Шахматы', 'стратегия', 1590, 9),
  (7, 'Свинтус', 'карточная', 490, 30),
  (8, 'Колонизаторы', 'стратегия', 3490, 3);
INSERT INTO customers VALUES
  (1, 'Ирина', 'Москва', 'irina@mail.ru'),
  (2, 'Олег', 'Казань', 'oleg@yandex.ru'),
  (3, 'Мария', 'Москва', NULL),
  (4, 'Тимур', 'Самара', 'timur@mail.ru');
INSERT INTO orders VALUES
  (1, 1, 2, 2, '2026-10-01'),
  (2, 2, 1, 1, '2026-10-02'),
  (3, 1, 6, 1, '2026-10-05'),
  (4, 3, 4, 1, '2026-10-07'),
  (5, 4, 8, 1, '2026-10-09'),
  (6, 2, 7, 3, '2026-10-11');
`;

/** «Школа»: two classes of pupils and the clubs they go to — for the relational algebra topic. */
const SCHOOL = `
CREATE TABLE class8 (
  id INT PRIMARY KEY,
  name VARCHAR(40) NOT NULL,
  city VARCHAR(30)
);
CREATE TABLE class9 (
  id INT PRIMARY KEY,
  name VARCHAR(40) NOT NULL,
  city VARCHAR(30)
);
CREATE TABLE chess_club (name VARCHAR(40) PRIMARY KEY);
CREATE TABLE robot_club (name VARCHAR(40) PRIMARY KEY);
CREATE TABLE rooms (room VARCHAR(10) PRIMARY KEY);
INSERT INTO class8 VALUES (1, 'Аня', 'Тверь'), (2, 'Глеб', 'Москва'), (3, 'Зоя', 'Тверь'), (4, 'Лёва', 'Клин');
INSERT INTO class9 VALUES (1, 'Марк', 'Москва'), (2, 'Нина', 'Тверь'), (3, 'Олег', 'Москва');
INSERT INTO chess_club VALUES ('Аня'), ('Глеб'), ('Марк'), ('Нина');
INSERT INTO robot_club VALUES ('Глеб'), ('Зоя'), ('Нина'), ('Олег');
INSERT INTO rooms VALUES ('101'), ('202');
`;

export const DATABASES: Record<DbName, { title: string; about: string; setup: string }> = {
  library: { title: "Школьная библиотека", about: "Таблицы authors, books, readers и loans (кто какую книгу взял).", setup: LIBRARY },
  shop: { title: "Магазин настольных игр", about: "Таблицы products, customers и orders.", setup: SHOP },
  school: { title: "Школа", about: "Таблицы class8, class9, chess_club, robot_club и rooms.", setup: SCHOOL },
  empty: { title: "Пустая база", about: "В ней ещё нет ни одной таблицы — создавай свои.", setup: "" },
};
