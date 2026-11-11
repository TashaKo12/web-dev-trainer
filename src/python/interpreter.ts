// A tiny Python subset that runs in the browser: enough for lessons about print().
// Supports literals, arithmetic, string concatenation/repetition, comparisons,
// variables, and the builtins print/str/int/float/len — with real Python error messages.

export type PyValue =
  | { t: "int"; v: bigint }
  | { t: "float"; v: number }
  | { t: "str"; v: string }
  | { t: "bool"; v: boolean }
  | { t: "none" }
  | { t: "builtin"; name: string };

export type PyErrorInfo = {
  type: string;
  message: string;
  line: number;
  source: string;
  hint: string;
};

export type TermEvent = { k: "out" | "prompt" | "answer"; text: string };

export type RunResult = {
  /** Everything the program wrote to the screen: print output and input() prompts. */
  output: string;
  /** Only what print() produced — used to check answers, independent of prompt wording. */
  printed: string;
  events: TermEvent[];
  /** The program stopped at input() and is waiting for the next answer. */
  waiting: boolean;
  prompts: string[];
  error?: PyErrorInfo;
};

class WaitForInput {}

class PyError extends Error {
  pyType: string;
  pyMessage: string;
  line: number;

  constructor(pyType: string, pyMessage: string, line: number) {
    super(`${pyType}: ${pyMessage}`);
    this.pyType = pyType;
    this.pyMessage = pyMessage;
    this.line = line;
  }
}

type Tok =
  | { k: "name"; v: string }
  | { k: "num"; v: string }
  | { k: "str"; v: string }
  | { k: "op"; v: string }
  | { k: "eof" };

type Expr =
  | { k: "lit"; val: PyValue }
  | { k: "name"; id: string }
  | { k: "un"; op: string; e: Expr }
  | { k: "bin"; op: string; l: Expr; r: Expr }
  | { k: "cmp"; op: string; l: Expr; r: Expr }
  | { k: "call"; fn: Expr; args: Expr[]; kw: { name: string; e: Expr }[] };

type Stmt = { k: "expr"; e: Expr } | { k: "assign"; id: string; e: Expr };

const MAX_OUTPUT = 20000;
const MAX_STRING = 100000;
const MAX_INT_DIGITS = 4300;

const NAME_START = /[A-Za-z_Ѐ-ӿ]/;
const NAME_CHAR = /[A-Za-z0-9_Ѐ-ӿ]/;
const ODD_QUOTES = new Set(["“", "”", "‘", "’", "«", "»", "„"]);
const BUILTINS = new Set(["print", "input", "str", "int", "float", "len"]);

function tokenize(line: string, lineNo: number): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch === " " || ch === "\t") {
      i++;
      continue;
    }
    if (ch === "#") break;

    if (ch === '"' || ch === "'") {
      let j = i + 1;
      let value = "";
      let closed = false;
      while (j < line.length) {
        const c = line[j];
        if (c === "\\" && j + 1 < line.length) {
          const n = line[j + 1];
          const escapes: Record<string, string> = { n: "\n", t: "\t", "\\": "\\", "'": "'", '"': '"', r: "\r" };
          value += n in escapes ? escapes[n] : "\\" + n;
          j += 2;
          continue;
        }
        if (c === ch) {
          closed = true;
          break;
        }
        value += c;
        j++;
      }
      if (!closed) throw new PyError("SyntaxError", `unterminated string literal (detected at line ${lineNo})`, lineNo);
      toks.push({ k: "str", v: value });
      i = j + 1;
      continue;
    }

    const num = /^(\d[\d_]*(\.\d*)?|\.\d+)([eE][+-]?\d+)?/.exec(line.slice(i));
    if (num && (/\d/.test(ch) || (ch === "." && /\d/.test(line[i + 1] ?? "")))) {
      const after = line[i + num[0].length];
      if (after && NAME_START.test(after)) throw new PyError("SyntaxError", "invalid decimal literal", lineNo);
      toks.push({ k: "num", v: num[0] });
      i += num[0].length;
      continue;
    }

    if (NAME_START.test(ch)) {
      let j = i;
      while (j < line.length && NAME_CHAR.test(line[j])) j++;
      toks.push({ k: "name", v: line.slice(i, j) });
      i = j;
      continue;
    }

    const two = line.slice(i, i + 2);
    if (["**", "//", "==", "!=", "<=", ">="].includes(two)) {
      toks.push({ k: "op", v: two });
      i += 2;
      continue;
    }
    if ("+-*/%(),=<>".includes(ch)) {
      toks.push({ k: "op", v: ch });
      i++;
      continue;
    }

    if (ODD_QUOTES.has(ch)) {
      const code = ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0");
      throw new PyError("SyntaxError", `invalid character '${ch}' (U+${code})`, lineNo);
    }
    throw new PyError("SyntaxError", "invalid syntax", lineNo);
  }
  toks.push({ k: "eof" });
  return toks;
}

class Parser {
  private toks: Tok[];
  private pos = 0;
  private line: number;

  constructor(toks: Tok[], line: number) {
    this.toks = toks;
    this.line = line;
  }

  private peek(offset = 0): Tok {
    return this.toks[Math.min(this.pos + offset, this.toks.length - 1)];
  }

  private isOp(v: string, offset = 0) {
    const t = this.peek(offset);
    return t.k === "op" && t.v === v;
  }

  private next(): Tok {
    return this.toks[this.pos++];
  }

  private fail(message = "invalid syntax"): never {
    throw new PyError("SyntaxError", message, this.line);
  }

  parseStatement(): Stmt {
    const first = this.peek();
    const second = this.peek(1);

    if (first.k === "name" && first.v === "print" && second.k !== "eof" && !(second.k === "op" && (second.v === "(" || second.v === "="))) {
      this.fail("Missing parentheses in call to 'print'. Did you mean print(...)?");
    }

    if (first.k === "name" && this.isOp("=", 1)) {
      if (["True", "False", "None"].includes(first.v)) this.fail(`cannot assign to ${first.v}`);
      this.pos += 2;
      const e = this.parseExpr();
      this.expectEnd();
      return { k: "assign", id: first.v, e };
    }

    const e = this.parseExpr();
    this.expectEnd();
    return { k: "expr", e };
  }

  private expectEnd() {
    const t = this.peek();
    if (t.k === "eof") return;
    if (t.k === "op" && t.v === ")") this.fail("unmatched ')'");
    this.fail();
  }

  private parseExpr(): Expr {
    let l = this.parseArith();
    while (true) {
      const t = this.peek();
      if (t.k === "op" && ["==", "!=", "<", ">", "<=", ">="].includes(t.v)) {
        this.next();
        l = { k: "cmp", op: t.v, l, r: this.parseArith() };
      } else return l;
    }
  }

  private parseArith(): Expr {
    let l = this.parseTerm();
    while (this.isOp("+") || this.isOp("-")) {
      const op = (this.next() as { v: string }).v;
      l = { k: "bin", op, l, r: this.parseTerm() };
    }
    return l;
  }

  private parseTerm(): Expr {
    let l = this.parseUnary();
    while (this.isOp("*") || this.isOp("/") || this.isOp("//") || this.isOp("%")) {
      const op = (this.next() as { v: string }).v;
      l = { k: "bin", op, l, r: this.parseUnary() };
    }
    return l;
  }

  private parseUnary(): Expr {
    if (this.isOp("-") || this.isOp("+")) {
      const op = (this.next() as { v: string }).v;
      return { k: "un", op, e: this.parseUnary() };
    }
    return this.parsePower();
  }

  private parsePower(): Expr {
    const base = this.parsePrimary();
    if (this.isOp("**")) {
      this.next();
      return { k: "bin", op: "**", l: base, r: this.parseUnary() };
    }
    return base;
  }

  private parsePrimary(): Expr {
    let e = this.parseAtom();
    while (this.isOp("(")) {
      this.next();
      e = this.parseCall(e);
    }
    return e;
  }

  private parseCall(fn: Expr): Expr {
    const args: Expr[] = [];
    const kw: { name: string; e: Expr }[] = [];
    if (this.isOp(")")) {
      this.next();
      return { k: "call", fn, args, kw };
    }
    while (true) {
      const t = this.peek();
      if (t.k === "eof") this.fail("'(' was never closed");
      if (t.k === "name" && this.isOp("=", 1)) {
        this.pos += 2;
        kw.push({ name: t.v, e: this.parseExpr() });
      } else {
        if (kw.length) this.fail("positional argument follows keyword argument");
        args.push(this.parseExpr());
      }
      const after = this.peek();
      if (after.k === "op" && after.v === ",") {
        this.next();
        if (this.isOp(")")) {
          this.next();
          break;
        }
        continue;
      }
      if (after.k === "op" && after.v === ")") {
        this.next();
        break;
      }
      if (after.k === "eof") this.fail("'(' was never closed");
      this.fail("invalid syntax. Perhaps you forgot a comma?");
    }
    return { k: "call", fn, args, kw };
  }

  private parseAtom(): Expr {
    const t = this.peek();
    if (t.k === "num") {
      this.next();
      const clean = t.v.replace(/_/g, "");
      if (/[.eE]/.test(clean)) return { k: "lit", val: { t: "float", v: Number(clean) } };
      return { k: "lit", val: { t: "int", v: BigInt(clean) } };
    }
    if (t.k === "str") {
      let value = "";
      while (this.peek().k === "str") value += (this.next() as { v: string }).v;
      return { k: "lit", val: { t: "str", v: value } };
    }
    if (t.k === "name") {
      this.next();
      if (t.v === "True") return { k: "lit", val: { t: "bool", v: true } };
      if (t.v === "False") return { k: "lit", val: { t: "bool", v: false } };
      if (t.v === "None") return { k: "lit", val: { t: "none" } };
      return { k: "name", id: t.v };
    }
    if (t.k === "op" && t.v === "(") {
      this.next();
      if (this.isOp(")")) this.fail();
      const e = this.parseExpr();
      if (this.peek().k === "eof") this.fail("'(' was never closed");
      if (!this.isOp(")")) this.fail();
      this.next();
      return e;
    }
    this.fail();
  }
}

function typeName(v: PyValue): string {
  switch (v.t) {
    case "int":
      return "int";
    case "float":
      return "float";
    case "str":
      return "str";
    case "bool":
      return "bool";
    case "none":
      return "NoneType";
    case "builtin":
      return "builtin_function_or_method";
  }
}

function floatRepr(x: number): string {
  if (Number.isNaN(x)) return "nan";
  if (!Number.isFinite(x)) return x > 0 ? "inf" : "-inf";
  if (x === 0) return Object.is(x, -0) ? "-0.0" : "0.0";
  const abs = Math.abs(x);
  if (abs >= 1e16 || abs < 1e-4) {
    const [mantissa, exp] = x.toExponential().split("e");
    return `${mantissa}e${exp[0]}${exp.slice(1).padStart(2, "0")}`;
  }
  if (Number.isInteger(x)) return x.toFixed(1);
  return String(x);
}

function toStr(v: PyValue, line: number): string {
  switch (v.t) {
    case "int": {
      const s = v.v.toString();
      if (s.replace("-", "").length > MAX_INT_DIGITS) {
        throw new PyError("ValueError", `Exceeds the limit (${MAX_INT_DIGITS} digits) for integer string conversion`, line);
      }
      return s;
    }
    case "float":
      return floatRepr(v.v);
    case "str":
      return v.v;
    case "bool":
      return v.v ? "True" : "False";
    case "none":
      return "None";
    case "builtin":
      return `<built-in function ${v.name}>`;
  }
}

function repr(v: PyValue, line: number): string {
  return v.t === "str" ? `'${v.v}'` : toStr(v, line);
}

const isNumeric = (v: PyValue) => v.t === "int" || v.t === "float" || v.t === "bool";
const toBig = (v: PyValue) => (v.t === "int" ? v.v : v.t === "bool" ? (v.v ? 1n : 0n) : 0n);
const toNum = (v: PyValue) => (v.t === "float" ? v.v : Number(toBig(v)));
const isIntLike = (v: PyValue) => v.t === "int" || v.t === "bool";

function binary(op: string, a: PyValue, b: PyValue, line: number): PyValue {
  const unsupported = () =>
    new PyError("TypeError", `unsupported operand type(s) for ${op}: '${typeName(a)}' and '${typeName(b)}'`, line);

  if (op === "+") {
    if (a.t === "str" && b.t === "str") {
      if (a.v.length + b.v.length > MAX_STRING) throw new PyError("MemoryError", "", line);
      return { t: "str", v: a.v + b.v };
    }
    if (a.t === "str") throw new PyError("TypeError", `can only concatenate str (not "${typeName(b)}") to str`, line);
  }

  if (op === "*" && (a.t === "str" || b.t === "str")) {
    const s = a.t === "str" ? a : b;
    const n = a.t === "str" ? b : a;
    if (s.t !== "str") throw unsupported();
    if (!isIntLike(n)) throw new PyError("TypeError", `can't multiply sequence by non-int of type '${typeName(n)}'`, line);
    const count = toBig(n);
    if (count <= 0n) return { t: "str", v: "" };
    if (BigInt(s.v.length) * count > BigInt(MAX_STRING)) throw new PyError("MemoryError", "", line);
    return { t: "str", v: s.v.repeat(Number(count)) };
  }

  if (!isNumeric(a) || !isNumeric(b)) throw unsupported();

  if (isIntLike(a) && isIntLike(b) && op !== "/") {
    const x = toBig(a);
    const y = toBig(b);
    switch (op) {
      case "+":
        return { t: "int", v: x + y };
      case "-":
        return { t: "int", v: x - y };
      case "*":
        return { t: "int", v: x * y };
      case "//": {
        if (y === 0n) throw new PyError("ZeroDivisionError", "integer division or modulo by zero", line);
        let q = x / y;
        if (x % y !== 0n && x < 0n !== y < 0n) q -= 1n;
        return { t: "int", v: q };
      }
      case "%": {
        if (y === 0n) throw new PyError("ZeroDivisionError", "integer modulo by zero", line);
        let r = x % y;
        if (r !== 0n && r < 0n !== y < 0n) r += y;
        return { t: "int", v: r };
      }
      case "**": {
        if (y < 0n) {
          if (x === 0n) throw new PyError("ZeroDivisionError", "0.0 cannot be raised to a negative power", line);
          return { t: "float", v: Math.pow(Number(x), Number(y)) };
        }
        const absX = x < 0n ? -x : x;
        if (absX > 1n && y > 20000n) throw new PyError("OverflowError", "result too large", line);
        return { t: "int", v: x ** y };
      }
    }
  }

  const x = toNum(a);
  const y = toNum(b);
  switch (op) {
    case "+":
      return { t: "float", v: x + y };
    case "-":
      return { t: "float", v: x - y };
    case "*":
      return { t: "float", v: x * y };
    case "/":
      if (y === 0) throw new PyError("ZeroDivisionError", "division by zero", line);
      return { t: "float", v: x / y };
    case "//":
      if (y === 0) throw new PyError("ZeroDivisionError", "float floor division by zero", line);
      return { t: "float", v: Math.floor(x / y) };
    case "%":
      if (y === 0) throw new PyError("ZeroDivisionError", "float modulo", line);
      return { t: "float", v: x - y * Math.floor(x / y) };
    case "**": {
      const r = Math.pow(x, y);
      if (!Number.isFinite(r)) throw new PyError("OverflowError", "(34, 'Numerical result out of range')", line);
      return { t: "float", v: r };
    }
  }
  throw unsupported();
}

function compare(op: string, a: PyValue, b: PyValue, line: number): PyValue {
  let c: number | null = null;
  if (isNumeric(a) && isNumeric(b)) {
    if (isIntLike(a) && isIntLike(b)) {
      const x = toBig(a);
      const y = toBig(b);
      c = x < y ? -1 : x > y ? 1 : 0;
    } else {
      const x = toNum(a);
      const y = toNum(b);
      c = x < y ? -1 : x > y ? 1 : 0;
    }
  } else if (a.t === "str" && b.t === "str") {
    c = a.v < b.v ? -1 : a.v > b.v ? 1 : 0;
  }

  if (op === "==" || op === "!=") {
    const equal = c !== null ? c === 0 : a.t === "none" && b.t === "none";
    return { t: "bool", v: op === "==" ? equal : !equal };
  }
  if (c === null) {
    throw new PyError("TypeError", `'${op}' not supported between instances of '${typeName(a)}' and '${typeName(b)}'`, line);
  }
  const result = op === "<" ? c < 0 : op === ">" ? c > 0 : op === "<=" ? c <= 0 : c >= 0;
  return { t: "bool", v: result };
}

class Machine {
  output = "";
  printed = "";
  events: TermEvent[] = [];
  prompts: string[] = [];
  private env = new Map<string, PyValue>();
  private inputs: string[];
  private nextInput = 0;

  constructor(inputs: string[]) {
    this.inputs = inputs;
  }

  private write(kind: "out" | "prompt", text: string, line: number) {
    if (this.output.length + text.length > MAX_OUTPUT) {
      throw new PyError("OutputLimit", "слишком много текста в терминале", line);
    }
    this.output += text;
    if (kind === "out") this.printed += text;
    if (text) this.events.push({ k: kind, text });
  }

  run(stmt: Stmt, line: number) {
    if (stmt.k === "assign") this.env.set(stmt.id, this.eval(stmt.e, line));
    else this.eval(stmt.e, line);
  }

  private eval(e: Expr, line: number): PyValue {
    switch (e.k) {
      case "lit":
        return e.val;
      case "name": {
        const v = this.env.get(e.id);
        if (v) return v;
        if (BUILTINS.has(e.id)) return { t: "builtin", name: e.id };
        throw new PyError("NameError", `name '${e.id}' is not defined`, line);
      }
      case "un": {
        const v = this.eval(e.e, line);
        if (!isNumeric(v)) throw new PyError("TypeError", `bad operand type for unary ${e.op}: '${typeName(v)}'`, line);
        if (e.op === "+") return isIntLike(v) ? { t: "int", v: toBig(v) } : v;
        return isIntLike(v) ? { t: "int", v: -toBig(v) } : { t: "float", v: -toNum(v) };
      }
      case "bin":
        return binary(e.op, this.eval(e.l, line), this.eval(e.r, line), line);
      case "cmp":
        return compare(e.op, this.eval(e.l, line), this.eval(e.r, line), line);
      case "call":
        return this.call(e, line);
    }
  }

  private call(e: Extract<Expr, { k: "call" }>, line: number): PyValue {
    const fn = this.eval(e.fn, line);
    if (fn.t !== "builtin") throw new PyError("TypeError", `'${typeName(fn)}' object is not callable`, line);
    const args = e.args.map((a) => this.eval(a, line));

    if (fn.name === "print") {
      let sep = " ";
      let end = "\n";
      for (const { name, e: valueExpr } of e.kw) {
        if (name !== "sep" && name !== "end") {
          throw new PyError("TypeError", `'${name}' is an invalid keyword argument for print()`, line);
        }
        const value = this.eval(valueExpr, line);
        if (value.t !== "str" && value.t !== "none") {
          throw new PyError("TypeError", `${name} must be None or a string, not ${typeName(value)}`, line);
        }
        const text = value.t === "str" ? value.v : name === "sep" ? " " : "\n";
        if (name === "sep") sep = text;
        else end = text;
      }
      this.write("out", args.map((a) => toStr(a, line)).join(sep) + end, line);
      return { t: "none" };
    }

    if (fn.name === "input") {
      if (e.kw.length) throw new PyError("TypeError", "input() takes no keyword arguments", line);
      if (args.length > 1) throw new PyError("TypeError", `input expected at most 1 argument, got ${args.length}`, line);
      const prompt = args[0] ? toStr(args[0], line) : "";
      this.prompts.push(prompt);
      this.write("prompt", prompt, line);
      if (this.nextInput >= this.inputs.length) throw new WaitForInput();
      const answer = this.inputs[this.nextInput++];
      this.events.push({ k: "answer", text: answer });
      return { t: "str", v: answer };
    }

    if (e.kw.length) {
      throw new PyError("TypeError", `${fn.name}() takes no keyword arguments`, line);
    }

    if (fn.name === "len") {
      if (args.length !== 1) throw new PyError("TypeError", `len() takes exactly one argument (${args.length} given)`, line);
      const [v] = args;
      if (v.t !== "str") throw new PyError("TypeError", `object of type '${typeName(v)}' has no len()`, line);
      return { t: "int", v: BigInt([...v.v].length) };
    }

    if (args.length > 1) throw new PyError("TypeError", `${fn.name}() takes at most 1 argument (${args.length} given)`, line);
    const v = args[0];

    if (fn.name === "str") return { t: "str", v: v ? toStr(v, line) : "" };

    if (fn.name === "int") {
      if (!v) return { t: "int", v: 0n };
      if (isIntLike(v)) return { t: "int", v: toBig(v) };
      if (v.t === "float") {
        if (!Number.isFinite(v.v)) throw new PyError("OverflowError", "cannot convert float infinity to integer", line);
        return { t: "int", v: BigInt(Math.trunc(v.v)) };
      }
      if (v.t === "str" && /^\s*[+-]?\d[\d_]*\s*$/.test(v.v)) return { t: "int", v: BigInt(v.v.trim().replace(/_/g, "")) };
      if (v.t === "str") throw new PyError("ValueError", `invalid literal for int() with base 10: ${repr(v, line)}`, line);
      throw new PyError("TypeError", `int() argument must be a string or a number, not '${typeName(v)}'`, line);
    }

    // float()
    if (!v) return { t: "float", v: 0 };
    if (isNumeric(v)) return { t: "float", v: toNum(v) };
    if (v.t === "str" && v.v.trim() !== "" && !Number.isNaN(Number(v.v.trim()))) return { t: "float", v: Number(v.v.trim()) };
    if (v.t === "str") throw new PyError("ValueError", `could not convert string to float: ${repr(v, line)}`, line);
    throw new PyError("TypeError", `float() argument must be a string or a real number, not '${typeName(v)}'`, line);
  }
}

function hintFor(type: string, message: string, source: string): string {
  if (type === "NameError") {
    const name = /'(.+)'/.exec(message)?.[1] ?? "";
    if (name.toLowerCase() === "print" || BUILTINS.has(name.toLowerCase())) {
      return `Команды в Python пишутся маленькими буквами: ${name.toLowerCase()}, а не ${name}.`;
    }
    return `Python не знает слова «${name}». Если это текст — возьми его в кавычки: "${name}".`;
  }
  if (type === "IndentationError") return "Строка не должна начинаться с пробела — убери пробелы в начале.";
  if (type === "SyntaxError") {
    if (message.startsWith("unterminated string")) return "Кавычка открыта, но не закрыта. Текст должен быть с кавычками с обеих сторон.";
    if (message.includes("was never closed")) return "Не хватает закрывающей скобки ) в конце.";
    if (message.startsWith("unmatched")) return "Лишняя закрывающая скобка ) — у неё нет пары.";
    if (message.startsWith("Missing parentheses")) return "После print обязательно нужны круглые скобки: print(...).";
    if (message.startsWith("invalid character")) return "В коде «кривые» кавычки или странный символ. Используй обычные кавычки \" или '.";
    if (message.includes("forgot a comma")) return "Между значениями внутри print нужна запятая.";
    if (message.startsWith("invalid decimal literal")) return "Число не может сразу переходить в буквы. Если это текст — возьми его в кавычки.";
    if (message.startsWith("positional argument follows")) return "sep= и end= пишутся в самом конце, после всех значений.";
    if (/print\s*\(.*\)\s*\(/.test(source) || /\)\s*\w/.test(source)) return "Проверь, что после закрывающей скобки ничего не написано.";
    return "Python не понял запись. Проверь кавычки, скобки и запятые.";
  }
  if (type === "TypeError") {
    if (message.startsWith("can only concatenate str")) {
      return "Текст и число нельзя склеить через +. В print можно поставить запятую: print(\"Мне\", 12). А если число пришло из input(), там на самом деле текст — оберни его: int(input(...)).";
    }
    if (message.includes("(not \"str\")") || (message.startsWith("unsupported operand") && message.includes("'int' and 'str'"))) {
      return "Здесь встретились число и текст. Помни: input() всегда возвращает текст — чтобы получить число, пиши int(input(...)).";
    }
    if (message.startsWith("unsupported operand") && message.includes("'str'")) return "Нельзя делать математику с текстом. Убери кавычки у чисел.";
    if (message.includes("can't multiply sequence")) return "Текст можно умножить только на целое число.";
    if (message.includes("invalid keyword argument")) return "У print есть только два особых параметра: sep и end.";
    if (message.includes("must be None or a string")) return "Значения sep и end должны быть текстом в кавычках.";
    return "Значения не подходят друг к другу по типу.";
  }
  if (type === "ZeroDivisionError") return "На ноль делить нельзя — даже Python так не умеет.";
  if (type === "ValueError") return "Программа ждала число, а получила текст, который нельзя превратить в число. Введи цифры.";
  if (type === "OverflowError" || type === "MemoryError") return "Получилось слишком большое значение для тренажёра.";
  if (type === "OutputLimit") return "Программа печатает слишком много — сократи вывод.";
  return "";
}

/**
 * Runs the program from the start, feeding `inputs` to input() in order.
 * If the program asks for more answers than given, it stops with `waiting: true`;
 * the caller collects the answer and runs again with one more input.
 */
export function runPython(code: string, inputs: string[] = []): RunResult {
  const lines = code.replace(/\r\n?/g, "\n").split("\n");
  const program: { stmt: Stmt; line: number }[] = [];
  const empty = { output: "", printed: "", events: [], waiting: false, prompts: [] };

  const toError = (err: unknown): PyErrorInfo => {
    if (!(err instanceof PyError)) throw err;
    const source = lines[err.line - 1] ?? "";
    return { type: err.pyType, message: err.pyMessage, line: err.line, source, hint: hintFor(err.pyType, err.pyMessage, source) };
  };

  try {
    lines.forEach((text, index) => {
      const lineNo = index + 1;
      if (/^\s*(#.*)?$/.test(text)) return;
      if (/^\s/.test(text)) throw new PyError("IndentationError", "unexpected indent", lineNo);
      program.push({ stmt: new Parser(tokenize(text, lineNo), lineNo).parseStatement(), line: lineNo });
    });
  } catch (err) {
    return { ...empty, error: toError(err) };
  }

  const machine = new Machine(inputs);
  const snapshot = () => ({
    output: machine.output,
    printed: machine.printed,
    events: machine.events,
    prompts: machine.prompts,
    waiting: false,
  });
  try {
    for (const { stmt, line } of program) machine.run(stmt, line);
  } catch (err) {
    if (err instanceof WaitForInput) return { ...snapshot(), waiting: true };
    return { ...snapshot(), error: toError(err) };
  }
  return snapshot();
}

export function sameOutput(actual: string, expected: string) {
  return actual.replace(/\n$/, "") === expected.replace(/\n$/, "");
}
