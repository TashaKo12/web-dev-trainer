import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";

// The SQL sandbox: a real database engine (SQLite) running in the browser. Every run starts from a fresh copy
// of a sample database, so a student can do anything — even DROP TABLE — and nothing breaks.
// The course follows MySQL, so the sandbox also understands the MySQL commands of module 1:
// CREATE DATABASE, USE, SHOW TABLES, DESCRIBE, AUTO_INCREMENT, DROP INDEX … ON …

let SQL: SqlJsStatic | null = null;
let loading: Promise<SqlJsStatic> | null = null;

/** Loads the engine once (about 0.7 MB). */
export function loadSql(): Promise<SqlJsStatic> {
  if (SQL) return Promise.resolve(SQL);
  loading ??= initSqlJs({ locateFile: () => wasmUrl, useOldExtensionFunctions: false }).then((s) => (SQL = s));
  return loading;
}
export const sqlReady = () => SQL !== null;
/** For tests in node: give an engine that is already loaded. */
export const useEngine = (s: SqlJsStatic) => void (SQL = s);

export type Cell = string | number | null;
export type Table = { columns: string[]; rows: Cell[][] };
/** What one statement gave: a table (SELECT, SHOW, DESCRIBE) or a short message (CREATE, INSERT…). */
export type Output = { sql: string; table?: Table; message?: string };
export type SqlRun = { outputs: Output[]; error: string | null; errorSql: string | null; db: Database };

/** Splits the code into statements by «;» — not inside quotes or comments. */
export function splitStatements(code: string): string[] {
  const out: string[] = [];
  let cur = "";
  let i = 0;
  while (i < code.length) {
    const ch = code[i];
    const two = code.slice(i, i + 2);
    if (two === "--" || ch === "#") {
      const end = code.indexOf("\n", i);
      i = end === -1 ? code.length : end;
      continue;
    }
    if (two === "/*") {
      const end = code.indexOf("*/", i + 2);
      i = end === -1 ? code.length : end + 2;
      cur += " ";
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      let j = i + 1;
      while (j < code.length && !(code[j] === ch && code[j + 1] !== ch)) j += code[j] === ch ? 2 : 1;
      cur += code.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    if (ch === ";") {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
      i++;
      continue;
    }
    cur += ch;
    i++;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

const word = (s: string) => s.trim().split(/\s+/).slice(0, 2).join(" ").toUpperCase();
const unquote = (s: string) => s.replace(/^[`"']|[`"']$/g, "");

/** MySQL words SQLite does not know, turned into what it does know. */
function fromMySql(s: string): string {
  return (
    s
      // id INT AUTO_INCREMENT PRIMARY KEY → id INTEGER PRIMARY KEY (SQLite numbers such a column itself)
      .replace(/(\b\w+\s+)(?:INT|INTEGER|BIGINT|SMALLINT|TINYINT)(\s*\(\s*\d+\s*\))?(\s+UNSIGNED)?([^,()]*?)\bAUTO_INCREMENT\b/gi, "$1INTEGER$4")
      .replace(/\bAUTO_INCREMENT\b/gi, "")
      // table options after «)»: ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      .replace(/\)\s*((ENGINE|DEFAULT\s+CHARSET|CHARSET|COLLATE)\s*=?\s*\w+\s*)+$/i, ")")
      .replace(/\bUNSIGNED\b/gi, "")
  );
}

const message = (sql: string, n: number): string => {
  const w = word(sql);
  if (w.startsWith("CREATE TABLE")) return "✓ Таблица создана";
  if (w.startsWith("CREATE INDEX") || w.startsWith("CREATE UNIQUE")) return "✓ Индекс создан";
  if (w.startsWith("DROP TABLE")) return "✓ Таблица удалена";
  if (w.startsWith("DROP INDEX")) return "✓ Индекс удалён";
  if (w.startsWith("ALTER TABLE")) return "✓ Таблица изменена";
  if (w.startsWith("INSERT")) return `✓ Добавлено строк: ${n}`;
  if (w.startsWith("UPDATE")) return `✓ Изменено строк: ${n}`;
  if (w.startsWith("DELETE")) return `✓ Удалено строк: ${n}`;
  return "✓ Готово";
};

/** SQLite's English errors, said simply in Russian (the original stays in brackets). */
export function explainError(e: string): string {
  const m = (re: RegExp) => e.match(re);
  let r: RegExpMatchArray | null;
  if ((r = m(/no such table: (\S+)/))) return `Нет таблицы «${r[1]}». Проверь название — посмотреть все таблицы можно командой SHOW TABLES.`;
  if ((r = m(/no such column: (\S+)/))) return `Нет столбца «${r[1]}». Проверь название — столбцы таблицы показывает DESCRIBE имя_таблицы.`;
  if ((r = m(/near "([^"]*)": syntax error/))) return `Ошибка в записи рядом с «${r[1]}». Проверь запятые, скобки, кавычки и порядок слов.`;
  if (m(/incomplete input/)) return "Команда не закончена: не хватает закрывающей скобки, кавычки или части команды.";
  if ((r = m(/UNIQUE constraint failed: (\S+)/))) return `Значение в «${r[1]}» уже есть, а повторяться оно не может (это ключ или UNIQUE).`;
  if ((r = m(/NOT NULL constraint failed: (\S+)/))) return `Столбец «${r[1]}» обязательный (NOT NULL) — ему нужно значение.`;
  if (m(/FOREIGN KEY constraint failed/)) return "Нарушен внешний ключ: такой записи нет в связанной таблице (или на эту запись ещё ссылаются).";
  if ((r = m(/table (\S+) already exists/))) return `Таблица «${r[1]}» уже есть. Удали её (DROP TABLE) или придумай другое имя.`;
  if ((r = m(/index (\S+) already exists/))) return `Индекс «${r[1]}» уже есть.`;
  if ((r = m(/duplicate column name: (\S+)/))) return `Столбец «${r[1]}» в таблице уже есть.`;
  if ((r = m(/table (\S+) has (\d+) columns but (\d+) values were supplied/))) return `В таблице «${r[1]}» ${r[2]} столбцов, а значений передано ${r[3]}. Перечисли столбцы или добавь значения.`;
  if (m(/(\d+) values for (\d+) columns/)) return "Значений больше или меньше, чем столбцов в списке.";
  if (m(/no such index/)) return "Такого индекса нет.";
  return "Ошибка в запросе.";
}

/** Runs one statement; MySQL-only commands are answered by the sandbox itself. */
function runOne(db: Database, raw: string): Output {
  const s = raw.trim();
  let r: RegExpMatchArray | null;
  if ((r = s.match(/^CREATE\s+(DATABASE|SCHEMA)\s+(IF\s+NOT\s+EXISTS\s+)?(\S+)/i)))
    return { sql: s, message: `✓ База данных ${unquote(r[3])} создана. В песочнице всегда открыта одна база — продолжаем в ней.` };
  if ((r = s.match(/^DROP\s+(DATABASE|SCHEMA)\s+(IF\s+EXISTS\s+)?(\S+)/i))) return { sql: s, message: `✓ База данных ${unquote(r[3])} удалена (в песочнице — понарошку).` };
  if ((r = s.match(/^USE\s+(\S+)/i))) return { sql: s, message: `✓ Работаем с базой ${unquote(r[1])}` };
  if (/^SHOW\s+DATABASES$/i.test(s)) return { sql: s, table: { columns: ["Database"], rows: [["sandbox"]] } };
  if (/^SHOW\s+TABLES$/i.test(s)) {
    const t = db.exec("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")[0];
    return { sql: s, table: { columns: ["Tables"], rows: t ? (t.values as Cell[][]) : [] } };
  }
  if ((r = s.match(/^(?:DESCRIBE|DESC|SHOW\s+COLUMNS\s+FROM)\s+(\S+)$/i))) {
    const name = unquote(r[1]);
    const t = db.exec(`PRAGMA table_info("${name.replace(/"/g, '""')}")`)[0];
    if (!t) throw new Error(`no such table: ${name}`);
    const fks = db.exec(`PRAGMA foreign_key_list("${name.replace(/"/g, '""')}")`)[0];
    const fkCols = new Set(fks ? fks.values.map((v) => String(v[3])) : []);
    // cid, name, type, notnull, dflt_value, pk
    return {
      sql: s,
      table: {
        columns: ["Field", "Type", "Null", "Key", "Default"],
        rows: t.values.map((v) => [v[1], v[2] || "", v[3] ? "NO" : "YES", v[5] ? "PRI" : fkCols.has(String(v[1])) ? "MUL" : "", v[4] ?? null] as Cell[]),
      },
    };
  }
  if ((r = s.match(/^DROP\s+INDEX\s+(\S+)\s+ON\s+\S+$/i))) {
    db.exec(`DROP INDEX ${r[1]}`);
    return { sql: s, message: "✓ Индекс удалён" };
  }
  if (/^ALTER\s+TABLE\s+\S+\s+(MODIFY|CHANGE)\b/i.test(s))
    throw new Error("sandbox: В MySQL так можно (MODIFY и CHANGE меняют тип столбца), но наша песочница так не умеет. Здесь можно ADD COLUMN, DROP COLUMN, RENAME COLUMN … TO … и RENAME TO.");
  if (/^LOAD\s+DATA\b/i.test(s)) throw new Error("sandbox: LOAD DATA загружает файл с компьютера, где стоит MySQL. В песочнице файлов нет — добавляй строки через INSERT.");
  const res = db.exec(fromMySql(s));
  const last = res[res.length - 1];
  if (last) return { sql: s, table: { columns: last.columns, rows: last.values as Cell[][] } };
  // a SELECT that found nothing still shows its columns
  if (/^(SELECT|WITH|PRAGMA|VALUES)\b/i.test(s)) {
    const st = db.prepare(fromMySql(s));
    const cols = st.getColumnNames();
    st.free();
    return { sql: s, table: { columns: cols, rows: [] } };
  }
  return { sql: s, message: message(s, db.getRowsModified()) };
}

/** Runs the setup of a sample database, then the student's code — statement by statement. */
export function runSql(setup: string, code: string): SqlRun {
  if (!SQL) throw new Error("SQL engine is not loaded");
  const db = new SQL.Database();
  db.exec("PRAGMA foreign_keys = ON;");
  if (setup) db.exec(setup);
  const outputs: Output[] = [];
  for (const st of splitStatements(code)) {
    try {
      outputs.push(runOne(db, st));
    } catch (e) {
      const raw = e instanceof Error ? e.message : String(e);
      const text = raw.startsWith("sandbox: ") ? raw.slice(9) : `${explainError(raw)} (${raw})`;
      return { outputs, error: text, errorSql: st, db };
    }
  }
  return { outputs, error: null, errorSql: null, db };
}

/** Runs a query on a database as it is now (to check what the student's code changed). */
export function query(db: Database, sql: string): Table {
  const res = db.exec(sql);
  const last = res[res.length - 1];
  return last ? { columns: last.columns, rows: last.values as Cell[][] } : { columns: [], rows: [] };
}

const norm = (v: Cell) => (v === null ? "∅" : typeof v === "number" ? String(Math.round(v * 1e6) / 1e6) : /^-?\d+(\.\d+)?$/.test(v) ? String(Math.round(Number(v) * 1e6) / 1e6) : v);
const rowKey = (r: Cell[]) => r.map(norm).join("\u0001");

/** Same values in the same columns (names may differ). ordered: the order of rows matters too. */
export function sameTable(a: Table | undefined, b: Table | undefined, ordered: boolean): boolean {
  if (!a || !b) return false;
  if (a.columns.length !== b.columns.length || a.rows.length !== b.rows.length) return false;
  const ka = a.rows.map(rowKey);
  const kb = b.rows.map(rowKey);
  if (!ordered) {
    ka.sort();
    kb.sort();
  }
  return ka.every((k, i) => k === kb[i]);
}

/** The last table the code showed. */
export const lastTable = (r: SqlRun) => [...r.outputs].reverse().find((o) => o.table)?.table;
