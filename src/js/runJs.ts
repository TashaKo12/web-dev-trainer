// Runs a student's JavaScript in a separate worker: it cannot touch the page, and an endless loop
// is stopped after a short time instead of freezing the tab.

export type JsCall = { ok: boolean; value: string; logs: string[] };

export type JsResult = {
  logs: string[];
  error: { name: string; message: string; hint: string } | null;
  /** Results of the extra expressions evaluated after the code (the checks call the student's functions). */
  calls: JsCall[];
};

const WORKER = `
const show = (v) => {
  if (typeof v === "string") return v;
  if (v === undefined) return "undefined";
  if (typeof v === "function") return "функция " + (v.name || "");
  try { return JSON.stringify(v); } catch (e) { return String(v); }
};
self.onmessage = (e) => {
  const { code, exprs } = e.data;
  let logs = [];
  const out = (...a) => logs.push(a.map(show).join(" "));
  const console = { log: out, info: out, warn: out, error: out };
  let error = null;
  const calls = [];
  try {
    const thunks = new Function("console", code + "\\n;return [" + exprs.map((x) => "() => (" + x + ")").join(",") + "];")(console);
    const main = logs;
    for (const t of thunks) {
      logs = [];
      try { const v = t(); calls.push({ ok: true, value: show(v), logs }); }
      catch (err) { calls.push({ ok: false, value: (err && err.name) + ": " + (err && err.message), logs }); }
    }
    logs = main;
  } catch (err) {
    error = { name: (err && err.name) || "Error", message: (err && err.message) || String(err) };
  }
  self.postMessage({ logs, error, calls });
};
`;

let url: string | null = null;

/** A Russian explanation for the most common mistakes. */
export function hintFor(name: string, message: string): string {
  const notDefined = /^(.+) is not defined$/.exec(message);
  if (name === "ReferenceError" && notDefined)
    return `Имя ${notDefined[1]} не найдено. Проверь, что функция или переменная объявлена и имя написано точно так же — большие и маленькие буквы различаются.`;
  const notFunction = /^(.+) is not a function$/.exec(message);
  if (name === "TypeError" && notFunction) return `${notFunction[1]} — это не функция, её нельзя вызвать скобками. Проверь имя.`;
  if (name === "TypeError" && /undefined/.test(message))
    return "Где-то значение оказалось undefined — например, функцию вызвали без нужного аргумента.";
  if (name === "SyntaxError")
    return "Ошибка в записи кода: проверь пары скобок () и {}, кавычки и запятые между параметрами.";
  if (name === "Timeout") return "Программа работает слишком долго — похоже, цикл никогда не заканчивается.";
  return "Прочитай сообщение об ошибке: в нём написано, что пошло не так.";
}

export function runJs(code: string, exprs: string[] = []): Promise<JsResult> {
  url ??= URL.createObjectURL(new Blob([WORKER], { type: "text/javascript" }));
  const worker = new Worker(url);
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      worker.terminate();
      const message = "программа работала дольше 1,5 секунды и была остановлена";
      resolve({ logs: [], error: { name: "Timeout", message, hint: hintFor("Timeout", message) }, calls: [] });
    }, 1500);
    worker.onmessage = (e: MessageEvent<{ logs: string[]; error: { name: string; message: string } | null; calls: JsCall[] }>) => {
      window.clearTimeout(timer);
      worker.terminate();
      const { logs, error, calls } = e.data;
      resolve({ logs, calls, error: error && { ...error, hint: hintFor(error.name, error.message) } });
    };
    worker.postMessage({ code, exprs });
  });
}

/** The code without strings and comments — to look for words like function or return. */
export const jsCodeOnly = (code: string) =>
  code
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(["'`])(?:\\.|(?!\1).)*\1/g, '""');
