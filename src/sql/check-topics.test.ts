// Run by the scratchpad test script (bundled with esbuild): every reference solution must pass,
// every start code must not, and every theory example must run (unless its note says it shows an error).
import initSqlJs from "sql.js";
import { useEngine, runSql } from "./engine";
import { checkSql } from "./SqlUi";
import { DATABASES } from "./databases";
import type { SqlTopicData } from "./SqlTopic";
import { SQL_INTRO } from "./topics/intro";
import { SQL_LIFECYCLE } from "./topics/lifecycle";
import { SQL_ALGEBRA } from "./topics/algebra";
import { SQL_DESIGN } from "./topics/design";
import { SQL_SETUP } from "./topics/setup";
import { SQL_TYPES } from "./topics/types";
import { SQL_TABLES } from "./topics/tables";
import { SQL_CRUD } from "./topics/crud";
import { SQL_FINAL } from "./topics/final";

const TOPICS: SqlTopicData[] = [SQL_INTRO, SQL_LIFECYCLE, SQL_ALGEBRA, SQL_DESIGN, SQL_SETUP, SQL_TYPES, SQL_TABLES, SQL_CRUD, SQL_FINAL];

export async function main() {
  useEngine(await initSqlJs());
  let fails = 0;
  let checks = 0;
  const bad = (msg: string) => {
    fails++;
    console.log("FAIL " + msg);
  };
  for (const t of TOPICS) {
    for (const p of t.theory.parts)
      for (const e of p.examples ?? []) {
        checks++;
        const r = runSql(DATABASES[e.db].setup, e.code);
        const shouldFail = /Ошибка/.test(e.note ?? "");
        if (!!r.error !== shouldFail) bad(`${t.id} example «${e.code.slice(0, 50)}»: ${r.error ?? "no error, but the note says error"}`);
      }
    const tasks = [
      ...t.game.missions.map((m) => ({ name: `mission «${m.title}»`, task: m })),
      ...t.levels.flatMap((l, i) => (l.kind === "choice" ? [] : [{ name: `level ${i + 1} «${l.badge}»`, task: l }])),
    ];
    for (const { name, task } of tasks) {
      checks++;
      const ok = checkSql(task, task.solution);
      if (!ok.ok) bad(`${t.id} ${name}: solution fails — ${ok.run.error ?? ok.hint}`);
      const start = checkSql(task, task.start);
      if (start.ok) bad(`${t.id} ${name}: the start code already passes`);
    }
    for (const l of t.levels) if (l.kind === "choice" && (l.answer < 0 || l.answer >= l.options.length)) bad(`${t.id} choice «${l.badge}»: bad answer index`);
    console.log(`${t.id}: ${t.theory.parts.length} theory parts, ${t.game.missions.length} missions, ${t.levels.length} levels, ${t.cards.length} cards`);
  }
  console.log(fails ? `${fails} FAILED of ${checks}` : `all ${checks} checks passed`);
}
