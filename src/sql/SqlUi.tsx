import { useEffect, useState, type ReactNode } from "react";
import { Database as DbIcon, Play, RotateCcw, TriangleAlert } from "lucide-react";
import { CodeEditor } from "../python/CodeTerminal";
import { DATABASES, type DbName } from "./databases";
import { lastTable, loadSql, query, runSql, sameTable, sqlReady, type SqlRun, type Table } from "./engine";

// The pieces every SQL page uses: loading the engine, a result table, a live example, the check of a task.

export function useSqlEngine() {
  const [ready, setReady] = useState(sqlReady());
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (ready) return;
    loadSql()
      .then(() => setReady(true))
      .catch(() => setFailed(true));
  }, [ready]);
  return { ready, failed };
}

export function EngineGate({ children }: { children: ReactNode }) {
  const { ready, failed } = useSqlEngine();
  if (failed) return <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">Не получилось загрузить базу данных. Проверь интернет и обнови страницу.</p>;
  if (!ready)
    return (
      <p className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
        <DbIcon className="h-4 w-4 animate-pulse" /> Запускаю базу данных…
      </p>
    );
  return <>{children}</>;
}

export const Q = ({ children }: { children: ReactNode }) => <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-sky-700">{children}</code>;

const cell = (v: unknown) => (v === null ? <span className="italic text-slate-400">NULL</span> : String(v));

export function TableView({ table, caption }: { table: Table; caption?: string }) {
  const rows = table.rows.slice(0, 50);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {caption && <p className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500">{caption}</p>}
      <div className="max-h-80 overflow-auto">
        <table className="w-full border-collapse text-left font-mono text-[0.8125rem]">
          <thead className="sticky top-0 bg-slate-100 text-slate-600">
            <tr>
              {table.columns.map((c, i) => (
                <th key={i} className="whitespace-nowrap border-b border-slate-200 px-3 py-1.5 font-bold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="even:bg-slate-500/[0.06]">
                {r.map((v, j) => (
                  <td key={j} className="whitespace-nowrap border-b border-slate-500/10 px-3 py-1 text-slate-800">
                    {cell(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-slate-200 bg-slate-50 px-3 py-1 text-[0.6875rem] text-slate-400">
        {table.rows.length === 0 ? "Пусто: ни одной строки" : `Строк: ${table.rows.length}${table.rows.length > 50 ? " (показаны первые 50)" : ""}`}
      </p>
    </div>
  );
}

/** Everything a run showed: tables, «✓ Таблица создана» and the error, if any. */
export function ResultView({ run, empty = "Нажми «Выполнить» — здесь появится результат." }: { run: SqlRun | null; empty?: string }) {
  if (!run) return <p className="rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400">{empty}</p>;
  return (
    <div className="space-y-2">
      {run.outputs.map((o, i) =>
        o.table ? (
          <TableView key={i} table={o.table} caption={run.outputs.length > 1 ? o.sql.split("\n")[0].slice(0, 70) : undefined} />
        ) : (
          <p key={i} className="rounded-lg bg-emerald-500/10 px-3 py-1.5 font-mono text-[0.8125rem] text-emerald-700 dark:text-emerald-300">
            {o.message}
          </p>
        ),
      )}
      {run.error && (
        <div className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">
          <p className="flex items-start gap-2 font-bold">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {run.error}
          </p>
          {run.errorSql && <pre className="mt-1 whitespace-pre-wrap font-mono text-xs text-rose-500 dark:text-rose-300/80">{run.errorSql}</pre>}
        </div>
      )}
      {!run.outputs.length && !run.error && <p className="text-sm text-slate-400">Команд нет — напиши запрос.</p>}
    </div>
  );
}

export function RunSqlButton({ onClick, disabled, label = "Выполнить" }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-full border-2 border-sky-300 px-4 py-2 text-sm font-bold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Play className="h-4 w-4" strokeWidth={2.25} />
      {label}
    </button>
  );
}

export function DbBadge({ db }: { db: DbName }) {
  const d = DATABASES[db];
  return (
    <p className="flex items-center gap-1.5 text-xs text-slate-500">
      <DbIcon className="h-3.5 w-3.5" /> База: <b className="text-slate-700">{d.title}</b> — {d.about}
    </p>
  );
}

/** A theory example you can change and run again. */
export function LiveSql({ code: start, db, note }: { code: string; db: DbName; note?: string }) {
  const [code, setCode] = useState(start);
  const [run, setRun] = useState<SqlRun | null>(null);
  const exec = () => {
    run?.db.close();
    setRun(runSql(DATABASES[db].setup, code));
  };
  // the first result is shown right away
  useEffect(() => {
    const r = runSql(DATABASES[db].setup, start);
    setRun(r);
    return () => r.db.close();
  }, [start, db]);
  return (
    <div className="space-y-2 rounded-2xl border border-slate-200 p-3">
      <CodeEditor value={code} onChange={setCode} onRun={exec} lang="js" />
      <div className="flex flex-wrap items-center gap-2">
        <RunSqlButton onClick={exec} />
        {code !== start && (
          <button type="button" onClick={() => setCode(start)} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600">
            <RotateCcw className="h-3.5 w-3.5" /> Вернуть пример
          </button>
        )}
        <span className="text-xs text-slate-400">Поменяй запрос и выполни ещё раз · Ctrl + Enter</span>
      </div>
      <ResultView run={run} />
      {note && <p className="text-xs text-slate-500">{note}</p>}
    </div>
  );
}

/** A task: the student's code must give the same result as the reference solution. */
export type SqlTask = {
  db: DbName;
  start: string;
  /** the reference solution: its result is what the student must get */
  solution: string;
  /** for tasks that change data or tables: this query is compared after both runs (otherwise the last table is) */
  verify?: string;
  /** the order of rows matters (by default — when the solution has ORDER BY) */
  ordered?: boolean;
  /** an extra condition on how it is written, e.g. «use WHERE» */
  rule?: (code: string) => boolean;
  ruleHint?: string;
  /** what to say when the result is wrong */
  hint?: string;
  /** a check of its own instead of comparing results (for commands that give no table: CREATE DATABASE, USE) */
  custom?: (run: SqlRun, code: string) => boolean;
};

export type Verdict = { ok: boolean; run: SqlRun; hint: string | null };

/** The text without strings and comments: to look for words like WHERE in the student's code. */
export const sqlOnly = (code: string) =>
  code
    .replace(/'(?:''|[^'])*'/g, "''")
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
export const has = (code: string, re: RegExp) => re.test(sqlOnly(code));

export function expectedOf(task: SqlTask): Table | undefined {
  if (task.custom) return undefined;
  const ref = runSql(DATABASES[task.db].setup, task.solution);
  const t = task.verify ? (ref.error ? undefined : query(ref.db, task.verify)) : lastTable(ref);
  ref.db.close();
  return t;
}

export function checkSql(task: SqlTask, code: string): Verdict {
  const setup = DATABASES[task.db].setup;
  const run = runSql(setup, code);
  if (run.error) return { ok: false, run, hint: null };
  if (task.custom) {
    const ok = task.custom(run, code);
    return { ok, run, hint: ok ? null : (task.hint ?? "Получилось не то, что нужно.") };
  }
  const ref = runSql(setup, task.solution);
  let ok: boolean;
  if (task.verify) {
    let mine: Table | undefined;
    try {
      mine = query(run.db, task.verify);
    } catch {
      mine = undefined;
    }
    ok = sameTable(mine, query(ref.db, task.verify), task.ordered ?? /order\s+by/i.test(task.verify));
  } else ok = sameTable(lastTable(run), lastTable(ref), task.ordered ?? /order\s+by/i.test(task.solution));
  ref.db.close();
  if (!ok) return { ok: false, run, hint: task.hint ?? (task.verify ? "Данные в таблице получились не такие, как нужно." : "Результат не совпадает с тем, что нужно получить.") };
  if (task.rule && !task.rule(code)) return { ok: false, run, hint: `Результат верный, но решить нужно по условию: ${task.ruleHint ?? "посмотри задание"}` };
  return { ok: true, run, hint: null };
}
