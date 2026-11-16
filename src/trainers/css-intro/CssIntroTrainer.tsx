import { useState, type ReactNode } from "react";
import { TopicSlider } from "../../components/TopicSlider";
import { FileCode } from "lucide-react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { TrueFalseDeck, type TrueFalseStatement } from "../../components/TrueFalseDeck";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "css-intro")!;

const TRUE_FALSE: TrueFalseStatement[] = [
  { text: "CSS принято хранить прямо внутри файла .html.", answer: false, explain: "Нет, CSS обычно хранят в отдельном файле .css, который подключают к HTML." },
  { text: '<link rel="stylesheet" href="style.css"> подключает файл стилей к странице.', answer: true, explain: "Да, это и есть способ связать HTML-страницу с отдельным CSS-файлом." },
  { text: "Тег link для подключения CSS ставят внутри <head>.", answer: true, explain: "Верно, именно там его обычно размещают." },
  { text: "CSS-правило пишется без фигурных скобок: h1: color red;", answer: false, explain: "Нет, правильный синтаксис: h1 { color: red; } — обязательно с фигурными скобками." },
  { text: "Одно CSS-правило из style.css применяется только к ПЕРВОМУ подходящему элементу на странице.", answer: false, explain: "Нет, правило применяется сразу ко ВСЕМ элементам, подходящим под селектор." },
  { text: "Атрибут style можно написать прямо внутри тега, без отдельного файла CSS.", answer: true, explain: "Да, это способ задать стиль одному конкретному тегу напрямую." },
  { text: "Если изменить цвет в style.css, HTML-код при этом тоже придётся менять.", answer: false, explain: "Нет, в этом и смысл разделения — меняется только CSS, а HTML остаётся прежним." },
  { text: "Если два правила красят один и тот же элемент по-разному, при прочих равных побеждает ПЕРВОЕ правило в файле.", answer: false, explain: "Нет, побеждает последнее по порядку правило — оно перезаписывает более раннее." },
  { text: "rel=\"stylesheet\" — обязательная часть тега link для подключения CSS.", answer: true, explain: "Да, именно это значение атрибута rel говорит браузеру, что подключается файл стилей." },
  { text: "CSS отвечает за содержимое страницы, а HTML — за оформление.", answer: false, explain: "Наоборот: HTML отвечает за содержимое и структуру, а CSS — за оформление." },
];

const COLORS = ["#1e293b", "#ec4899", "#0891b2", "#16a34a"] as const;

function Theory() {
  const [tab, setTab] = useState<"html" | "css">("html");
  const [color, setColor] = useState<(typeof COLORS)[number]>("#ec4899");

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
      <p className="mb-5 text-slate-600">
        HTML и CSS — это ДВА РАЗНЫХ файла. index.html описывает содержимое страницы, а style.css — её оформление.
        Чтобы браузер применил стили, в &lt;head&gt; страницы ставят{" "}
        <code className="rounded bg-slate-100 px-1">&lt;link rel="stylesheet" href="style.css"&gt;</code>.
      </p>
      <div className="mb-5 grid gap-2 text-sm sm:grid-cols-2">
        <p className="rounded-2xl bg-slate-50 p-3 text-slate-600">
          <code className="rounded bg-violet-100 px-1 font-mono font-bold text-violet-700">rel="stylesheet"</code> — говорит браузеру, что подключается
          именно файл стилей. Без него стили не применятся.
        </p>
        <p className="rounded-2xl bg-slate-50 p-3 text-slate-600">
          <code className="rounded bg-sky-100 px-1 font-mono font-bold text-sky-700">href="style.css"</code> — где лежит этот файл: путь к нему, как у
          картинки или ссылки.
        </p>
      </div>

      <div className="mb-3 flex gap-1 border-b-2 border-slate-100">
        {(["html", "css"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 rounded-t-lg px-4 py-2 font-mono text-xs font-bold transition ${
              tab === t ? (t === "html" ? "bg-sky-100 text-sky-700" : "bg-violet-100 text-violet-700") : "text-slate-400 hover:bg-slate-50"
            }`}
          >
            <FileCode className="h-3.5 w-3.5" strokeWidth={2} />
            {t === "html" ? "index.html" : "style.css"}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-600">
          {tab === "html" ? (
            <>
              &lt;head&gt;
              <br />
              &nbsp;&nbsp;&lt;title&gt;Мой сайт&lt;/title&gt;
              <br />
              &nbsp;&nbsp;<span className="rounded bg-violet-100 px-1 text-violet-700">&lt;link rel="stylesheet" href="style.css"&gt;</span>
              <br />
              &lt;/head&gt;
              <br />
              &lt;body&gt;
              <br />
              &nbsp;&nbsp;&lt;h1&gt;Привет!&lt;/h1&gt;
              <br />
              &lt;/body&gt;
            </>
          ) : (
            <>
              h1 {"{"}
              <br />
              &nbsp;&nbsp;color:
              <div className="my-2 flex gap-1.5">
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setColor(c)} className="h-6 w-6 rounded-full border-2 border-white shadow" style={{ background: c, outline: color === c ? "2px solid #7c3aed" : "none" }} />
                ))}
              </div>
              ;<br />
              {"}"}
            </>
          )}
        </div>

        <div className="flex items-center justify-center rounded-2xl bg-white p-6 shadow-inner">
          <h1 style={{ color }} className="text-3xl font-extrabold">
            Привет!
          </h1>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-violet-50 p-4 text-sm text-violet-800">
        Переключи цвет в style.css — текст в index.html изменится, хотя сам HTML-код ты не трогал. Вот что значит
        «CSS в отдельном файле»: один файл style.css управляет оформлением сразу ВСЕХ страниц сайта.
      </div>
    </div>
  );
}

// The next theory slides: everything the levels and the cards ask about is explained here first.

const CARD = "rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]";
const C = ({ children }: { children: ReactNode }) => <code className="rounded bg-slate-100 px-1 font-mono text-[0.92em] text-violet-700">{children}</code>;

function CodeBox({ file, children, bad }: { file: string; children: string; bad?: boolean }) {
  return (
    <div className={`overflow-hidden rounded-2xl border ${bad ? "border-rose-200" : "border-slate-200"}`}>
      <p className={`px-4 py-1.5 font-mono text-[11px] font-bold ${bad ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-500"}`}>{file}</p>
      <pre className="whitespace-pre-wrap bg-slate-900 px-4 py-3 font-mono text-[13px] leading-relaxed text-slate-100">{children}</pre>
    </div>
  );
}

function Preview({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <p className="bg-slate-100 px-4 py-1.5 text-[11px] font-bold text-slate-500">В браузере</p>
      <div className="space-y-1 bg-white px-4 py-3">{children}</div>
    </div>
  );
}

function RuleTheory() {
  const parts = [
    { t: "p", label: "селектор", note: "кого красим — все абзацы p", cls: "bg-sky-100 text-sky-700" },
    { t: "{ }", label: "фигурные скобки", note: "внутри — всё оформление", cls: "bg-slate-200 text-slate-700" },
    { t: "color", label: "свойство", note: "что меняем — цвет текста", cls: "bg-violet-100 text-violet-700" },
    { t: "blue", label: "значение", note: "каким делаем — синим", cls: "bg-amber-100 text-amber-700" },
  ];
  return (
    <div className={CARD}>
      <p className="mb-4 text-slate-600">
        В style.css пишут <b>правила</b>. Каждое правило отвечает на два вопроса: <b>кого</b> оформляем и <b>как</b>. Между свойством и
        значением — двоеточие, в конце — точка с запятой.
      </p>
      <div className="mb-5 rounded-2xl bg-slate-900 px-5 py-4 text-center font-mono text-xl text-slate-100">
        <span className="rounded px-1 text-sky-300">p</span> {"{"} <span className="text-violet-300">color</span>: <span className="text-amber-200">blue</span>; {"}"}
      </div>
      <div className="mb-6 grid gap-2 sm:grid-cols-4">
        {parts.map((p) => (
          <div key={p.label} className="rounded-2xl bg-slate-50 p-3 text-sm">
            <span className={`rounded-md px-1.5 font-mono font-bold ${p.cls}`}>{p.t}</span>
            <p className="mt-1.5 font-bold text-slate-700">{p.label}</p>
            <p className="text-xs text-slate-500">{p.note}</p>
          </div>
        ))}
      </div>
      <p className="mb-3 text-slate-600">
        Другие свойства пишутся точно так же — меняются только свойство и значение. Например, <C>background-color</C> — цвет фона:
      </p>
      <div className="mb-6 grid gap-3 md:grid-cols-2">
        <CodeBox file="style.css">{"h1 {\n  background-color: black;\n  color: white;\n}"}</CodeBox>
        <Preview>
          <p className="rounded bg-black px-2 py-1 text-xl font-extrabold text-white">Привет!</p>
          <p className="text-xs text-slate-500">В одном правиле может быть несколько свойств — каждое на своей строке.</p>
        </Preview>
      </div>
      <p className="mb-3 text-slate-600">
        <b>Одно правило красит сразу ВСЕ подходящие теги.</b> Если на странице три абзаца, правило <C>p {"{ color: blue; }"}</C> сделает синими все
        три — не только первый.
      </p>
      <div className="mb-6 grid gap-3 md:grid-cols-2">
        <CodeBox file="style.css">{"p {\n  color: blue;\n}"}</CodeBox>
        <Preview>
          <p className="text-sm font-semibold text-blue-600">Первый абзац</p>
          <p className="text-sm font-semibold text-blue-600">Второй абзац</p>
          <p className="text-sm font-semibold text-blue-600">Третий абзац</p>
        </Preview>
      </div>
      <p className="mb-3 text-slate-600">Частая ошибка — забыть фигурные скобки или двоеточие. Такое правило браузер просто не поймёт:</p>
      <div className="grid gap-3 md:grid-cols-2">
        <CodeBox file="✗ так не работает" bad>
          {"h1: color red;"}
        </CodeBox>
        <CodeBox file="✓ правильно">{"h1 { color: red; }"}</CodeBox>
      </div>
    </div>
  );
}

function InlineTheory() {
  return (
    <div className={CARD}>
      <p className="mb-4 text-slate-600">
        Стиль можно написать и <b>прямо в теге</b> — в атрибуте <C>style</C>. Тогда не нужен ни отдельный файл, ни селектор: внутри кавычек сразу
        пишут <C>свойство: значение;</C>.
      </p>
      <div className="mb-5 grid gap-3 md:grid-cols-2">
        <CodeBox file="index.html">{'<h1 style="color: red;">Привет!</h1>\n<h1>Пока!</h1>'}</CodeBox>
        <Preview>
          <p className="text-xl font-extrabold text-red-600">Привет!</p>
          <p className="text-xl font-extrabold text-slate-800">Пока!</p>
        </Preview>
      </div>
      <p className="mb-5 text-slate-600">
        Но такой стиль действует <b>только на этот один тег</b> — второй заголовок остался чёрным. Если заголовков на сайте двадцать, пришлось бы
        двадцать раз писать одно и то же. Поэтому оформление всего сайта хранят в style.css, а <C>style="..."</C> оставляют для редких мелочей.
      </p>
      <div className="grid gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-2xl bg-violet-50 p-3">
          <p className="font-mono font-bold text-violet-700">&lt;link&gt; в head</p>
          <p className="mt-1 text-slate-600">подключает отдельный файл style.css к странице</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-3">
          <p className="font-mono font-bold text-amber-700">style="..."</p>
          <p className="mt-1 text-slate-600">стиль прямо в теге, без отдельного файла — только для этого тега</p>
        </div>
        <div className="rounded-2xl bg-sky-50 p-3">
          <p className="font-mono font-bold text-sky-700">@import</p>
          <p className="mt-1 text-slate-600">пишется в начале файла .css и подтягивает ещё один файл стилей — например, шрифт из интернета</p>
        </div>
      </div>
    </div>
  );
}

function OrderTheory() {
  return (
    <div className={CARD}>
      <p className="mb-4 text-slate-600">
        Бывает, что два правила красят один и тот же тег по-разному. Браузер читает style.css сверху вниз, и <b>побеждает последнее правило</b> —
        оно перезаписывает то, что было выше.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <CodeBox file="style.css">{"h1 {\n  color: green;\n}\n\nh1 {\n  color: purple;\n}"}</CodeBox>
        <Preview>
          <p className="text-2xl font-extrabold text-purple-600">Привет!</p>
          <p className="text-xs text-slate-500">Заголовок фиолетовый: правило с purple стоит ниже.</p>
        </Preview>
      </div>
      <p className="mt-5 rounded-2xl bg-violet-50 p-4 text-sm text-violet-800">
        Если цвет «не меняется», проверь, нет ли ниже в файле ещё одного правила для того же тега.
      </p>
    </div>
  );
}

function McqLevel({ options, correctIndex, mono = true, onResult }: { options: string[]; correctIndex: number; mono?: boolean; onResult: (correct: boolean) => void }) {
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(choice === correctIndex);
  }

  return (
    <div>
      <McqOptions options={options} selected={choice} onSelect={(i) => !checked && setChoice(i)} disabled={checked} mono={mono} />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={choice === null}
            className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-700 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const SYNTAX_OPTIONS = ["h1: color = red;", "h1 { color: red }", "h1 { color: red; }", "h1 = { color: red; }"];

function SyntaxLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const valid = selected === "h1 { color: red; }" || selected === "h1 { color: red }";

  function check() {
    setChecked(true);
    onResult(valid);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Какая запись CSS-правила верная? Выбери и посмотри на результат.</p>
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
        <div className="space-y-2">
          {SYNTAX_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              disabled={checked}
              onClick={() => setSelected(opt)}
              className={`block w-full rounded-lg border-2 px-3 py-2 text-left font-mono text-xs transition disabled:cursor-not-allowed ${
                selected === opt ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-600 hover:border-violet-200"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-center rounded-2xl bg-slate-50 p-5">
          <p style={{ color: selected && valid ? "red" : "#1e293b" }} className="font-extrabold">
            Заголовок h1
          </p>
        </div>
      </div>
      {selected && !valid && <p className="mt-2 text-xs font-semibold text-rose-500">В этой записи ошибка — браузер проигнорирует правило целиком.</p>}
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!selected}
            className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-700 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function TypeRuleLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);

  function normalize(s: string) {
    return s.trim().toLowerCase().replace(/\s+/g, "");
  }

  function check() {
    setChecked(true);
    const n = normalize(text);
    onResult(n === "p{color:blue;}" || n === "p{color:blue}");
  }

  const applied = /^p\s*\{\s*color\s*:\s*blue\s*;?\s*\}$/i.test(text.trim());

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Напиши CSS-правило, которое красит весь текст внутри тега p в синий цвет (blue).</p>
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
        <input
          type="text"
          value={text}
          onChange={(e) => !checked && setText(e.target.value)}
          disabled={checked}
          placeholder="селектор { свойство: значение; }"
          className="w-full rounded-xl border-2 border-violet-200 px-3 py-2 font-mono text-sm outline-none focus:border-violet-400 disabled:opacity-60"
        />
        <div className="flex items-center justify-center rounded-2xl bg-slate-50 p-4">
          <p style={{ color: applied ? "blue" : "#1e293b" }} className="text-sm">
            Пример абзаца текста
          </p>
        </div>
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!text.trim()}
            className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-700 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function ScopeLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [useRule, setUseRule] = useState(false);
  const [picked, setPicked] = useState<"one" | "all" | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(picked === "all");
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        Внизу три абзаца p. Включи правило <code className="rounded bg-slate-100 px-1">p {"{"} color: teal; {"}"}</code>{" "}
        из style.css и посмотри, сколько абзацев покрасится.
      </p>
      <label className="mb-3 flex items-center gap-2 text-sm font-bold text-violet-700">
        <input type="checkbox" checked={useRule} onChange={(e) => setUseRule(e.target.checked)} />
        p {"{"} color: teal; {"}"}
      </label>
      <div style={useRule ? { color: "teal" } : undefined} className="mb-4 space-y-1 rounded-2xl bg-slate-50 p-4 text-sm">
        <p>Первый абзац</p>
        <p>Второй абзац</p>
        <p>Третий абзац</p>
      </div>
      <p className="mb-3 text-sm text-slate-500">Сколько абзацев покрасилось?</p>
      <div className="flex justify-center gap-2">
        <button
          type="button"
          disabled={checked}
          onClick={() => setPicked("one")}
          className={`rounded-lg px-4 py-1.5 text-sm font-bold transition disabled:cursor-not-allowed ${picked === "one" ? "bg-violet-500 text-white" : "bg-slate-100 text-slate-600"}`}
        >
          Только один
        </button>
        <button
          type="button"
          disabled={checked}
          onClick={() => setPicked("all")}
          className={`rounded-lg px-4 py-1.5 text-sm font-bold transition disabled:cursor-not-allowed ${picked === "all" ? "bg-violet-500 text-white" : "bg-slate-100 text-slate-600"}`}
        >
          Все три сразу
        </button>
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!picked}
            className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-700 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function TypeRuleLevel2({ onResult }: { onResult: (correct: boolean) => void }) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);

  function normalize(s: string) {
    return s.trim().toLowerCase().replace(/\s+/g, "");
  }

  function check() {
    setChecked(true);
    const n = normalize(text);
    onResult(n === "h1{background-color:black;}" || n === "h1{background-color:black}");
  }

  const applied = /^h1\s*\{\s*background-color\s*:\s*black\s*;?\s*\}$/i.test(text.trim());

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Напиши CSS-правило, которое красит фон тега h1 в чёрный (black).</p>
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
        <input
          type="text"
          value={text}
          onChange={(e) => !checked && setText(e.target.value)}
          disabled={checked}
          placeholder="селектор { свойство: значение; }"
          className="w-full rounded-xl border-2 border-violet-200 px-3 py-2 font-mono text-sm outline-none focus:border-violet-400 disabled:opacity-60"
        />
        <div style={{ background: applied ? "black" : "#f8fafc" }} className="flex items-center justify-center rounded-2xl p-4">
          <h1 className="text-sm font-extrabold text-white">Заголовок</h1>
        </div>
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!text.trim()}
            className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-700 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const TASK_META = [
  { badge: "выбери из списка", prompt: "Где по правилам хранят CSS всего сайта?", explain: "В отдельном файле .css (например style.css), который подключают к каждой HTML-странице." },
  { badge: "выбери из списка", prompt: 'Какой тег в <head> подключает внешний файл стилей к странице?', explain: '<link rel="stylesheet" href="style.css"> — именно так HTML-файл «узнаёт» про свой CSS.' },
  { badge: "напиши сам", prompt: "", explain: 'rel="stylesheet" — атрибут rel у link говорит браузеру, что это именно файл стилей.' },
  { badge: "выбери из списка", prompt: "", explain: "h1 { color: red; } — селектор, фигурные скобки, свойство: значение; (точка с запятой на конце — хорошая привычка, хотя для последнего правила в блоке не обязательна)." },
  { badge: "напиши сам", prompt: "", explain: "p { color: blue; } — селектор p выбирает все абзацы, color — свойство цвета текста." },
  { badge: "выбери из списка", prompt: "Какой способ задания стиля НЕ требует отдельного файла CSS, а пишется прямо внутри тега?", explain: 'style="..." — атрибут style задаёт стили прямо на самом теге, без отдельного файла и без селектора.' },
  { badge: "проверь вживую", prompt: "", explain: "CSS-правило из style.css применяется СРАЗУ КО ВСЕМ элементам, подходящим под селектор — именно поэтому один файл управляет оформлением всей страницы." },
  { badge: "напиши сам", prompt: "", explain: "h1 { background-color: black; } — тот же синтаксис, другое свойство и значение." },
  { badge: "выбери из списка", prompt: "Если два правила в style.css красят ОДИН И ТОТ ЖЕ элемент в разные цвета, какое из них победит (при прочих равных)?", explain: "Последнее по порядку в файле — более поздние правила перезаписывают более ранние, если их «сила» (специфичность) одинакова." },
];

function Tasks() {
  const stepper = useTaskStepper(9, "css-intro");
  const task = stepper.index;
  const meta = TASK_META[task];

  if (stepper.allAnswered) {
    return <CompletionBanner score={stepper.score} total={9} onRestart={() => stepper.restart()} />;
  }

  return (
    <LevelShell
      total={9}
      index={task}
      statuses={stepper.statuses}
      status={stepper.status}
      isLast={stepper.isLast}
      badge={meta.badge}
      explain={meta.explain}
      onJump={stepper.goTo}
      onNext={stepper.goNext}
      nextClassName="bg-gradient-to-r from-violet-600 to-fuchsia-700"
    >
      {(task === 0 || task === 1 || task === 5 || task === 8) && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && (
        <McqLevel
          key={task}
          mono={false}
          options={["Внутри каждого тега, в атрибуте style", "В отдельном файле .css, подключённом через link", "В файле .js", "Во второй половине файла .html"]}
          correctIndex={1}
          onResult={(c) => stepper.markResult(c)}
        />
      )}
      {task === 1 && <McqLevel key={task} options={["link", "script", "style", "meta"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && (
        <div>
          <p className="mb-3 text-sm text-slate-500">
            В теге <code className="rounded bg-slate-100 px-1">&lt;link href="style.css" rel="..."&gt;</code> не хватает значения атрибута rel. Напиши его.
          </p>
          <TypeRelLevel onResult={(c) => stepper.markResult(c)} />
        </div>
      )}
      {task === 3 && <SyntaxLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 4 && <TypeRuleLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 5 && (
        <McqLevel key={task} mono={false} options={['style="..." прямо в теге', "<link> в head", "отдельный файл .css", "@import в начале файла"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />
      )}
      {task === 6 && <ScopeLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 7 && <TypeRuleLevel2 key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 8 && (
        <McqLevel
          key={task}
          mono={false}
          options={["Последнее по порядку в файле", "Первое по порядку в файле", "Оба применятся одновременно", "Браузер выберет случайно"]}
          correctIndex={0}
          onResult={(c) => stepper.markResult(c)}
        />
      )}
    </LevelShell>
  );
}

function TypeRelLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(text.trim().toLowerCase().replace(/"/g, "") === "stylesheet");
  }

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={(e) => !checked && setText(e.target.value)}
        disabled={checked}
        placeholder="значение атрибута rel"
        className="w-56 rounded-full border-2 border-slate-300 px-4 py-2 text-center font-mono text-sm outline-none focus:border-violet-400 disabled:opacity-60"
      />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!text.trim()}
            className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-700 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

export function CssIntroTrainer() {
  return (
    <TopicSlider>
      <TrainerHero icon={meta.icon} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="style.css — другой файл, про оформление"
        description="Переключайся между index.html и style.css — меняется только оформление, а не содержимое страницы."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Теория" title="Как устроено CSS-правило" description="Селектор, фигурные скобки, свойство и значение — и почему одно правило красит сразу все подходящие теги." />
      <div className="mb-10">
        <RuleTheory />
      </div>
      <SectionHeading kicker="Теория" title="Стиль прямо в теге: атрибут style" description="Как задать стиль без отдельного файла и почему так оформляют только мелочи." />
      <div className="mb-10">
        <InlineTheory />
      </div>
      <SectionHeading kicker="Теория" title="Какое правило победит" description="Что будет, если два правила красят один тег в разные цвета." />
      <div className="mb-10">
        <OrderTheory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="9 уровней — выбирай, проверяй вживую и пиши сам." />
      <div className="mb-10">
        <Tasks />
      </div>
      <SectionHeading
        kicker="Проверь себя"
        title="Верно или неверно?"
        description="Пролистай 10 карточек — угадай, где правда, а где нет."
      />
      <TrueFalseDeck statements={TRUE_FALSE} accent={meta.gradient} />
    </TopicSlider>
  );
}
