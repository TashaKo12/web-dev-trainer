import { useEffect, useState, type ReactNode } from "react";
import { Bot, Check, ChevronRight, Lock, Sparkles, Trophy } from "lucide-react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { useTaskStepper } from "../../components/useTaskStepper";
import { TrueFalseDeck, type TrueFalseStatement } from "../../components/TrueFalseDeck";
import { CodeEditor, PrintInput, RunButton, TerminalView } from "../../python/CodeTerminal";
import { runPython, sameOutput, type RunResult } from "../../python/interpreter";
import { trainers } from "../registry";
import { loadItem, POINTS, reportPoints, saveItem } from "../../lib/storage";

const meta = trainers.find((t) => t.id === "python-print")!;

const XP_PER_MISSION = POINTS.mission;
const STORAGE_KEY = "python-print-missions";

function Code({ children }: { children: ReactNode }) {
  return <code className="rounded bg-slate-100 px-1 font-mono text-[0.92em] text-slate-800">{children}</code>;
}

type Mission = { title: string; body: ReactNode; goal: string; start: string };

const MISSIONS: Mission[] = [
  {
    title: "Первое слово",
    body: (
      <>
        <p>
          Это робот Пиксель. Он пока не умеет говорить — научить его можно только одной командой:{" "}
          <Code>print</Code>. В переводе с английского это «напечатай». Всё, что ты положишь в круглые скобки,
          появится в <b>терминале</b> — окне, где программа показывает свои сообщения.
        </p>
        <p>
          Текст обязательно берут в кавычки: <Code>print("Привет")</Code>. Попробуй: нажми «Запустить», а потом
          поменяй текст в скобках.
        </p>
      </>
    ),
    goal: "Привет, я робот",
    start: '"Привет"',
  },
  {
    title: "Текст — только в кавычках",
    body: (
      <>
        <p>
          Кавычки говорят Python: «это просто текст, не думай над ним». Подходят двойные <Code>"..."</Code> или
          одинарные <Code>'...'</Code> — главное, одинаковые с обеих сторон.
        </p>
        <p>
          Без кавычек Python решит, что <Code>Пока</Code> — это имя чего-то, что он должен знать, не найдёт его и
          покажет ошибку <Code>NameError</Code>. Запусти, посмотри на ошибку — и исправь.
        </p>
      </>
    ),
    goal: "Пока",
    start: "Пока",
  },
  {
    title: "Числа и математика",
    body: (
      <>
        <p>
          Числа пишут <b>без кавычек</b> — тогда Python посчитает пример сам: <Code>print(10 + 5)</Code> покажет{" "}
          <Code>15</Code>. А <Code>"10 + 5"</Code> в кавычках — это уже просто текст, и Python напечатает его как
          есть.
        </p>
        <p>
          Python умеет складывать <Code>+</Code>, вычитать <Code>-</Code>, умножать <Code>*</Code> и делить{" "}
          <Code>/</Code>.
        </p>
      </>
    ),
    goal: "15",
    start: '"10 + 5"',
  },
  {
    title: "Несколько значений сразу",
    body: (
      <>
        <p>
          В <Code>print</Code> можно передать несколько значений <b>через запятую</b>. Python выведет их в одну
          строку и сам поставит между ними пробел.
        </p>
        <p>
          <Code>print("Мне", 10, "лет")</Code> → <Code>Мне 10 лет</Code>. Текст — в кавычках, число — без.
        </p>
      </>
    ),
    goal: "Мне 10 лет",
    start: '"Мне", 10',
  },
  {
    title: "Свой разделитель: sep",
    body: (
      <>
        <p>
          Пробел между значениями можно заменить на любой знак. Для этого в самом конце пишут <Code>sep=</Code> и
          знак в кавычках. sep — от слова separator, «разделитель».
        </p>
        <p>
          <Code>print("А", "Б", sep="+")</Code> → <Code>А+Б</Code>
        </p>
      </>
    ),
    goal: "А-Б-В",
    start: '"А", "Б", "В"',
  },
  {
    title: "Перенос строки: \\n",
    body: (
      <>
        <p>
          Внутри текста можно написать <Code>\n</Code> — это команда «перейди на новую строку». Сама{" "}
          <Code>\n</Code> в терминале не видна.
        </p>
        <p>
          <Code>print("Раз\nДва")</Code> напечатает «Раз» и «Два» на разных строках.
        </p>
      </>
    ),
    goal: "Первая\nВторая",
    start: '"Первая строка"',
  },
];

const RANKS = ["Новичок", "Ученик робота", "Знаток print", "Мастер терминала"];

function rankFor(done: number) {
  return RANKS[Math.min(RANKS.length - 1, Math.floor((done / MISSIONS.length) * (RANKS.length - 1) + 0.0001))];
}

function readDone() {
  const n = Number(loadItem(STORAGE_KEY));
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), MISSIONS.length) : 0;
}

function MissionPlay({ mission, isDone, onComplete }: { mission: Mission; isDone: boolean; onComplete: () => void }) {
  const [arg, setArg] = useState(mission.start);
  const [result, setResult] = useState<RunResult | null>(null);
  const [solved, setSolved] = useState(false);

  function run() {
    const r = runPython(`print(${arg})`);
    setResult(r);
    if (!r.error && sameOutput(r.output, mission.goal)) {
      setSolved(true);
      onComplete();
    }
  }

  const speech = result ? (result.error ? "…ой, я не понял команду" : result.output.replace(/\n$/, "") || " ") : null;

  return (
    <div className="space-y-4">
      <div className="space-y-2 text-slate-600">{mission.body}</div>

      <div className="rounded-2xl bg-sky-50 p-4 text-sm text-sky-800">
        <p className="mb-2 font-bold">Цель миссии — чтобы робот сказал:</p>
        <pre className="whitespace-pre-wrap rounded-xl bg-slate-950 px-3 py-2 font-mono text-emerald-200">{mission.goal}</pre>
      </div>

      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow">
          <Bot className="h-7 w-7" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {speech === null ? <span className="text-slate-400">Пиксель ждёт команду…</span> : <span className="whitespace-pre-wrap">{speech}</span>}
        </div>
      </div>

      <PrintInput value={arg} onChange={setArg} onRun={run} />
      <div className="flex flex-wrap items-center gap-3">
        <RunButton onClick={run} />
        {(solved || isDone) && (
          <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
            <Check className="h-4 w-4" strokeWidth={2.5} />
            Миссия выполнена{solved ? ` · +${XP_PER_MISSION} XP` : ""}
          </span>
        )}
      </div>
      <TerminalView result={result} />
    </div>
  );
}

function Missions() {
  const [done, setDone] = useState(readDone);
  const [active, setActive] = useState(() => Math.min(readDone(), MISSIONS.length - 1));

  const xp = done * XP_PER_MISSION;
  const maxXp = MISSIONS.length * XP_PER_MISSION;

  useEffect(() => {
    saveItem(STORAGE_KEY, String(done));
    reportPoints("missions:python-print", done * POINTS.mission);
  }, [done]);

  function complete(index: number) {
    if (index === done) setDone(done + 1);
  }

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Sparkles className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Звание</p>
            <p className="font-extrabold text-slate-800">{rankFor(done)}</p>
          </div>
        </div>
        <div className="min-w-[12rem] flex-1 sm:max-w-xs">
          <div className="mb-1 flex justify-between text-xs font-bold text-slate-500">
            <span>Опыт</span>
            <span>
              {xp} / {maxXp} XP
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500" style={{ width: `${(xp / maxXp) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {MISSIONS.map((m, i) => {
          const isDone = i < done;
          const isLocked = i > done;
          const isOpen = i === active && !isLocked;
          return (
            <div
              key={m.title}
              className={`rounded-2xl border-2 transition ${
                isOpen ? "border-sky-300 bg-white" : isDone ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
              }`}
            >
              <button
                type="button"
                disabled={isLocked}
                onClick={() => setActive(i)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left disabled:cursor-not-allowed"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    isDone ? "bg-emerald-500 text-white" : isLocked ? "bg-slate-200 text-slate-400" : "bg-sky-500 text-white"
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" strokeWidth={2.5} /> : isLocked ? <Lock className="h-3.5 w-3.5" strokeWidth={2.25} /> : i + 1}
                </span>
                <span className="flex-1">
                  <span className="block text-xs font-bold uppercase tracking-wide text-slate-400">
                    Миссия {i + 1} из {MISSIONS.length}
                  </span>
                  <span className={`font-extrabold ${isLocked ? "text-slate-400" : "text-slate-800"}`}>{m.title}</span>
                </span>
                {!isOpen && !isLocked && <ChevronRight className="h-5 w-5 text-slate-400" strokeWidth={2} />}
              </button>
              {isOpen && (
                <div className="border-t border-slate-200 px-4 pb-5 pt-4">
                  <MissionPlay key={i} mission={m} isDone={isDone} onComplete={() => complete(i)} />
                  {isDone && i < MISSIONS.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setActive(i + 1)}
                      className="mt-4 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-5 py-2 text-sm font-bold text-white shadow"
                    >
                      Следующая миссия
                      <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {done === MISSIONS.length && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800">
          <Trophy className="h-6 w-6 shrink-0" strokeWidth={1.75} />
          <p className="text-sm font-bold">Все миссии пройдены — Пиксель научился говорить! Теперь закрепим всё на практике ниже.</p>
        </div>
      )}
    </div>
  );
}

type PyLevel = {
  badge: string;
  prompt: ReactNode;
  mode: "paren" | "code";
  start: string;
  expected: string;
  rule?: (code: string) => boolean;
  explain: string;
};

const LEVELS: PyLevel[] = [
  {
    badge: "впиши в скобки",
    prompt: "Сделай так, чтобы в терминале появилось: Привет, мир!",
    mode: "paren",
    start: "",
    expected: "Привет, мир!",
    explain: 'print("Привет, мир!") — текст в кавычках внутри скобок, без лишних пробелов.',
  },
  {
    badge: "впиши в скобки",
    prompt: "Выведи число 2026 — именно числом, без кавычек.",
    mode: "paren",
    start: "",
    expected: "2026",
    rule: (code) => !/["']/.test(code),
    explain: "print(2026) — числа пишут без кавычек. С кавычками это был бы уже текст.",
  },
  {
    badge: "посчитай",
    prompt: "Пусть Python сам посчитает, сколько будет 7 умножить на 8. Используй знак *.",
    mode: "paren",
    start: "",
    expected: "56",
    rule: (code) => code.includes("*"),
    explain: "print(7 * 8) — Python вычисляет выражение и печатает результат: 56.",
  },
  {
    badge: "исправь ошибку",
    prompt: "В коде ошибка. Запусти, прочитай подсказку и исправь, чтобы вывелось слово Привет.",
    mode: "code",
    start: "print(Привет)",
    expected: "Привет",
    explain: 'print("Привет") — без кавычек Python ищет переменную Привет и выдаёт NameError.',
  },
  {
    badge: "через запятую",
    prompt: "Выведи «Мне 12 лет»: текст отдельно, а 12 — отдельным значением через запятую, числом без кавычек.",
    mode: "paren",
    start: "",
    expected: "Мне 12 лет",
    rule: (code) => /,\s*12\s*,/.test(code),
    explain: 'print("Мне", 12, "лет") — значения через запятую, Python сам ставит между ними пробелы.',
  },
  {
    badge: "две команды",
    prompt: "Двумя командами print выведи две строки: Python и это весело.",
    mode: "code",
    start: "",
    expected: "Python\nэто весело",
    rule: (code) => (code.match(/print\s*\(/g) ?? []).length >= 2,
    explain: 'print("Python") и print("это весело") — каждая команда print печатает с новой строки.',
  },
  {
    badge: "исправь ошибку",
    prompt: "Программа должна вывести Hello, но что-то пошло не так.",
    mode: "code",
    start: 'print("Hello"',
    expected: "Hello",
    explain: 'print("Hello") — у каждой открывающей скобки должна быть закрывающая.',
  },
  {
    badge: "исправь ошибку",
    prompt: "И здесь ошибка. Сделай так, чтобы вывелось слово Код.",
    mode: "code",
    start: 'Print("Код")',
    expected: "Код",
    explain: 'print("Код") — Python различает большие и маленькие буквы: Print и print — разные слова.',
  },
  {
    badge: "пустая строка",
    prompt: "Между «Начало» и «Конец» должна быть пустая строка. Допиши в середину команду, которая её напечатает.",
    mode: "code",
    start: 'print("Начало")\n\nprint("Конец")',
    expected: "Начало\n\nКонец",
    explain: "print() без ничего внутри печатает пустую строку.",
  },
  {
    badge: "разделитель",
    prompt: "Числа уже есть. Добавь sep, чтобы между ними стояли дефисы: 1-2-3.",
    mode: "paren",
    start: "1, 2, 3",
    expected: "1-2-3",
    rule: (code) => /sep\s*=/.test(code),
    explain: 'print(1, 2, 3, sep="-") — sep задаёт знак между значениями вместо пробела.',
  },
  {
    badge: "исправь ошибку",
    prompt: "Программа должна вывести «Мне 12 лет», но падает с ошибкой. Исправь её.",
    mode: "code",
    start: 'print("Мне " + 12 + " лет")',
    expected: "Мне 12 лет",
    explain: 'print("Мне", 12, "лет") — текст и число нельзя склеить через +, а через запятую можно.',
  },
  {
    badge: "впиши в скобки",
    prompt: "Одной командой print выведи три слова на трёх разных строках: Раз, Два, Три.",
    mode: "paren",
    start: "",
    expected: "Раз\nДва\nТри",
    rule: (code) => code.includes("\\n"),
    explain: 'print("Раз\\nДва\\nТри") — \\n внутри текста переносит на новую строку.',
  },
];

function PyLevelTask({ level, onResult }: { level: PyLevel; onResult: (correct: boolean) => void }) {
  const [text, setText] = useState(level.start);
  const [result, setResult] = useState<RunResult | null>(null);
  const [checked, setChecked] = useState(false);

  const code = level.mode === "paren" ? `print(${text})` : text;

  function run() {
    const r = runPython(code);
    setResult(r);
    return r;
  }

  function check() {
    const r = run();
    setChecked(true);
    onResult(!r.error && sameOutput(r.output, level.expected) && (level.rule ? level.rule(code) : true));
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-slate-700">{level.prompt}</p>
      <div className="rounded-2xl bg-slate-50 p-3">
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Должно получиться в терминале</p>
        <pre className="whitespace-pre-wrap rounded-xl bg-slate-950 px-3 py-2 font-mono text-sm text-emerald-200">{level.expected}</pre>
      </div>
      {level.mode === "paren" ? (
        <PrintInput value={text} onChange={setText} onRun={run} disabled={checked} />
      ) : (
        <CodeEditor value={text} onChange={setText} onRun={run} disabled={checked} />
      )}
      {!checked && (
        <div className="flex flex-wrap items-center gap-3">
          <RunButton onClick={run} />
          <button
            type="button"
            onClick={check}
            disabled={!text.trim()}
            className="rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
          {level.mode === "code" && <span className="text-xs text-slate-400">Ctrl + Enter — запустить</span>}
        </div>
      )}
      <TerminalView result={result} />
    </div>
  );
}

function Tasks() {
  const stepper = useTaskStepper(LEVELS.length, "python-print");
  const level = LEVELS[stepper.index];

  if (stepper.allAnswered) {
    return <CompletionBanner score={stepper.score} total={LEVELS.length} onRestart={() => stepper.restart()} />;
  }

  return (
    <LevelShell
      total={LEVELS.length}
      index={stepper.index}
      statuses={stepper.statuses}
      status={stepper.status}
      isLast={stepper.isLast}
      badge={level.badge}
      explain={level.explain}
      onJump={stepper.goTo}
      onNext={stepper.goNext}
      nextClassName="bg-gradient-to-r from-sky-500 to-emerald-500"
    >
      <PyLevelTask key={stepper.index} level={level} onResult={(c) => stepper.markResult(c)} />
    </LevelShell>
  );
}

const TRUE_FALSE: TrueFalseStatement[] = [
  { text: "print показывает текст и числа в терминале.", answer: true, explain: "Да, это и есть главная работа print — вывести значение на экран." },
  { text: "Текст внутри print можно писать без кавычек.", answer: false, explain: "Нет, без кавычек Python решит, что это имя переменной, и выдаст NameError." },
  { text: 'print("5 + 5") выведет 10.', answer: false, explain: "Нет: в кавычках это просто текст, и выведется именно «5 + 5»." },
  { text: "print(5 + 5) выведет 10.", answer: true, explain: "Да, без кавычек Python сначала посчитает пример, а потом напечатает ответ." },
  { text: "Для текста подходят и двойные, и одинарные кавычки.", answer: true, explain: "Да: \"Привет\" и 'Привет' — одно и то же. Главное — одинаковые с обеих сторон." },
  { text: "Print и print — это одна и та же команда.", answer: false, explain: "Нет, Python различает большие и маленькие буквы. Правильно только print." },
  { text: "Если передать в print несколько значений через запятую, Python поставит между ними пробел.", answer: true, explain: "Да, пробел — разделитель по умолчанию. Его можно поменять через sep." },
  { text: "Каждая новая команда print печатает с новой строки.", answer: true, explain: "Да, после каждого print Python сам переходит на следующую строку." },
  { text: 'print("Мне " + 12) напечатает «Мне 12».', answer: false, explain: "Нет, будет ошибка TypeError: текст и число нельзя склеить через +." },
  { text: "\\n внутри текста видно в терминале как два символа.", answer: false, explain: "Нет, \\n — невидимая команда «перейди на новую строку»." },
];

export function PythonPrintTrainer() {
  return (
    <div>
      <TrainerHero icon={meta.icon} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Игра"
        title="Научи робота говорить"
        description="Шесть миссий: в каждой — короткое объяснение, а потом ты пишешь код внутри скобок print и смотришь, что появится в терминале."
      />
      <div className="mb-10">
        <Missions />
      </div>
      <SectionHeading
        kicker="Практика"
        title="Закрепим"
        description={`${LEVELS.length} уровней — дописываешь код, запускаешь и проверяешь результат в терминале.`}
      />
      <div className="mb-10">
        <Tasks />
      </div>
      <SectionHeading kicker="Проверь себя" title="Верно или неверно?" description="Пролистай 10 карточек — угадай, где правда, а где нет." />
      <TrueFalseDeck statements={TRUE_FALSE} accent={meta.gradient} />
    </div>
  );
}
