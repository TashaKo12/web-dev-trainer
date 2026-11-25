import { splitStatements } from "./engine";

// SQL in explanations: every part of a query on its own line.

const CLAUSE = /\s+(FROM|WHERE|ORDER BY|GROUP BY|HAVING|VALUES|SET|(?:CROSS |INNER |LEFT |RIGHT )?JOIN|UNION(?: ALL)?|INTERSECT|EXCEPT)\b/gi;
const STATEMENT = /\b(?:SELECT|INSERT INTO|UPDATE|DELETE FROM|CREATE (?:UNIQUE )?(?:TABLE|DATABASE|INDEX)|ALTER TABLE|DROP (?:TABLE|DATABASE|INDEX)|SHOW (?:TABLES|DATABASES)|DESCRIBE|USE) ?[^;`]*;/g;

/** Splits by commas that are not inside brackets or quotes. */
function commas(s: string) {
  const out: string[] = [];
  let depth = 0;
  let quote = false;
  let cur = "";
  for (const ch of s) {
    if (ch === "'") quote = !quote;
    if (!quote && ch === "(") depth++;
    if (!quote && ch === ")") depth--;
    if (ch === "," && !depth && !quote) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  return [...out, cur.trim()];
}

function one(sql: string): string {
  const s = sql.trim().replace(/;$/, "");
  if (s.includes("\n")) return s + ";"; // already written in lines
  const table = /^(CREATE TABLE [^(]+)\(([\s\S]*)\)$/i.exec(s);
  if (table) return `${table[1].trim()} (\n${commas(table[2]).map((c) => "  " + c).join(",\n")}\n);`;
  // texts in quotes stay as they are
  const texts: string[] = [];
  const bare = s.replace(/'(?:''|[^'])*'/g, (m) => `\u0001${texts.push(m) - 1}\u0001`);
  let t = bare
    .replace(CLAUSE, (_, w: string) => `\n${w}`)
    .replace(/\n(UNION(?: ALL)?|INTERSECT|EXCEPT)\s+/gi, "\n$1\n");
  t = t.replace(/\nVALUES ([\s\S]*)$/i, (_, v: string) => {
    const rows = commas(v);
    return rows.length > 1 ? `\nVALUES\n${rows.map((r) => "  " + r).join(",\n")}` : `\nVALUES ${v}`;
  });
  return t.replace(/\u0001(\d+)\u0001/g, (_, i) => texts[Number(i)]) + ";";
}

export const prettySql = (sql: string) => splitStatements(sql).map(one).join("\n\n");

/** Queries written inside a sentence become blocks of code. */
export function sqlText(text: string) {
  return text
    .replace(STATEMENT, (m) => `\`\`\`\n${prettySql(m)}\n\`\`\``)
    .replace(/```\s*```/g, "")
    .replace(/```\s*—\s*(.)/g, (_, c: string) => "```\n" + c.toUpperCase());
}

/** An explanation of a task: its solution as code (if the text has none), then why. */
export function sqlExplain(explain: string, solution?: string) {
  const t = sqlText(explain);
  return t.includes("```") || !solution ? t : `\`\`\`\n${prettySql(solution)}\n\`\`\`\n${t}`;
}
