import type { ReactNode } from "react";
import { SquareTerminal } from "lucide-react";

// Theory for the Python topics: everything the missions and practice ask is explained here first.

type Example = { code: string; out: string; note?: string; error?: boolean };
type Part = { title: string; text: ReactNode; examples: Example[] };

const C = ({ children }: { children: ReactNode }) => (
  <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-emerald-700">{children}</code>
);

function ExampleCard({ e }: { e: Example }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <pre className="bg-slate-900 px-4 py-3 font-mono text-[13px] leading-relaxed text-slate-100">{e.code}</pre>
      <div className={`flex items-start gap-2 px-4 py-2.5 font-mono text-[13px] ${e.error ? "bg-rose-50 text-rose-700" : "bg-slate-50 text-slate-700"}`}>
        <SquareTerminal className="mt-0.5 h-4 w-4 shrink-0 opacity-60" strokeWidth={2} />
        <span className="whitespace-pre-wrap">{e.out}</span>
      </div>
      {e.note && <p className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500">{e.note}</p>}
    </div>
  );
}

function Theory({ parts }: { parts: Part[] }) {
  return (
    <div className="space-y-5">
      {parts.map((p, i) => (
        <div
          key={p.title}
          className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-7 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]"
        >
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-emerald-500">Шаг {i + 1}</p>
          <h3 className="mb-2 text-lg font-extrabold text-slate-800">{p.title}</h3>
          <p className="mb-4 text-sm leading-relaxed text-slate-600">{p.text}</p>
          <div className="grid gap-3 md:grid-cols-2">
            {p.examples.map((e) => (
              <ExampleCard key={e.code} e={e} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const PRINT: Part[] = [
  {
    title: "print выводит текст в терминал",
    text: (
      <>
        Команда <C>print()</C> показывает в терминале то, что написано в круглых скобках. Текст обязательно берут в кавычки —
        одинарные или двойные, но одинаковые с двух сторон. Каждая команда <C>print</C> печатает с новой строки.
      </>
    ),
    examples: [
      { code: 'print("Привет, мир!")', out: "Привет, мир!" },
      { code: 'print("Python")\nprint("это весело")', out: "Python\nэто весело", note: "Два print — две строки." },
    ],
  },
  {
    title: "Числа и вычисления — без кавычек",
    text: (
      <>
        Числа пишут без кавычек. Тогда Python может с ними считать: <C>+</C> плюс, <C>-</C> минус, <C>*</C> умножить, <C>/</C>{" "}
        разделить. Если взять пример в кавычки, Python напечатает его как текст и считать не будет.
      </>
    ),
    examples: [
      { code: "print(2026)\nprint(7 * 8)", out: "2026\n56" },
      { code: 'print("7 * 8")', out: "7 * 8", note: "В кавычках — это просто текст." },
    ],
  },
  {
    title: "Несколько значений через запятую",
    text: (
      <>
        В одном <C>print</C> можно перечислить несколько значений через запятую: текст и числа вперемешку. Python поставит
        между ними пробел. Склеить текст с числом знаком <C>+</C> нельзя — будет ошибка, поэтому используй запятую.
      </>
    ),
    examples: [
      { code: 'print("Мне", 12, "лет")', out: "Мне 12 лет" },
      { code: 'print("Мне " + 12 + " лет")', out: 'TypeError: can only concatenate str (not "int") to str', error: true, note: "Текст и число через + не складываются." },
    ],
  },
  {
    title: "Свой разделитель: sep",
    text: (
      <>
        Параметр <C>sep</C> меняет то, что стоит между значениями. Его пишут последним, через запятую: <C>sep="-"</C>.
      </>
    ),
    examples: [
      { code: 'print(1, 2, 3, sep="-")', out: "1-2-3" },
      { code: 'print("ко", "ко", sep="")', out: "коко", note: "Пустой sep — значения склеятся без пробела." },
    ],
  },
  {
    title: "Перенос строки и пустая строка",
    text: (
      <>
        Внутри текста <C>\n</C> — это перенос на новую строку: так одной командой можно напечатать несколько строк. Пустой{" "}
        <C>print()</C> печатает пустую строку.
      </>
    ),
    examples: [
      { code: 'print("Раз\\nДва\\nТри")', out: "Раз\nДва\nТри" },
      { code: 'print("Начало")\nprint()\nprint("Конец")', out: "Начало\n\nКонец" },
    ],
  },
  {
    title: "Частые ошибки — и как их читать",
    text: (
      <>
        Если в коде ошибка, Python пишет её название в последней строке. Чаще всего забывают кавычку, скобку или пишут команду
        с большой буквы. Читай подсказку и исправляй по одной ошибке.
      </>
    ),
    examples: [
      { code: 'print("Привет)', out: "SyntaxError: unterminated string literal", error: true, note: "Не хватает закрывающей кавычки." },
      { code: 'Print("Код")', out: "NameError: name 'Print' is not defined", error: true, note: "print пишется только маленькими буквами." },
    ],
  },
];

const INPUT: Part[] = [
  {
    title: "input задаёт вопрос и ждёт ответ",
    text: (
      <>
        <C>input("вопрос")</C> показывает вопрос в терминале и ждёт, пока человек напечатает ответ и нажмёт Enter. Текст в
        скобках — это подсказка, что от него ждут.
      </>
    ),
    examples: [{ code: 'input("Как тебя зовут? ")', out: "Как тебя зовут? Оля", note: "«Оля» напечатал человек." }],
  },
  {
    title: "Ответ кладём в переменную",
    text: (
      <>
        Чтобы ответ не потерялся, его сохраняют в переменную — коробку с именем: <C>name = input(...)</C>. Потом имя переменной
        пишут в <C>print</C> без кавычек. Если взять его в кавычки, напечатается само слово, а не ответ.
      </>
    ),
    examples: [
      { code: 'name = input("Как тебя зовут? ")\nprint("Привет,", name)', out: "Как тебя зовут? Оля\nПривет, Оля" },
      { code: 'name = input("Имя? ")\nprint("Привет,", "name")', out: "Имя? Оля\nПривет, name", note: "В кавычках — просто слово name." },
    ],
  },
  {
    title: "Несколько вопросов",
    text: (
      <>
        Можно задать несколько вопросов подряд и сохранить каждый ответ в свою переменную, а потом вывести их в одном{" "}
        <C>print</C> через запятую.
      </>
    ),
    examples: [
      { code: 'name = input("Имя? ")\ncity = input("Город? ")\nprint(name, "живёт в городе", city)', out: "Имя? Оля\nГород? Казань\nОля живёт в городе Казань" },
    ],
  },
  {
    title: "Ответ — всегда текст. int превращает его в число",
    text: (
      <>
        Всё, что вернул <C>input</C>, — текст, даже если напечатали цифры. Текст с числом складывать нельзя: будет ошибка. Чтобы
        считать, оберни ответ в <C>int(...)</C> — он превратит текст в целое число.
      </>
    ),
    examples: [
      { code: 'age = input("Возраст? ")\nprint(age + 1)', out: 'TypeError: can only concatenate str (not "int") to str', error: true },
      { code: 'age = int(input("Возраст? "))\nprint(age + 1)', out: "Возраст? 12\n13" },
    ],
  },
  {
    title: "Текст тоже умеет «складываться»",
    text: (
      <>
        Два текста знак <C>+</C> склеивает, а <C>*</C> на число повторяет текст несколько раз. Поэтому{" "}
        <C>"2" + "3"</C> даст 23, а не 5 — сначала превращай ответы в числа через <C>int</C>.
      </>
    ),
    examples: [
      { code: 'word = input("Слово? ")\nprint(word * 3)', out: "Слово? ку\nкукуку" },
      { code: 'a = input("Число? ")\nb = input("Число? ")\nprint(a + b)', out: "Число? 2\nЧисло? 3\n23", note: "Это склейка текста. С int(...) было бы 5." },
    ],
  },
];

export function PrintTheory() {
  return <Theory parts={PRINT} />;
}

export function InputTheory() {
  return <Theory parts={INPUT} />;
}
