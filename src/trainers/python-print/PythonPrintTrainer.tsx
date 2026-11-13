import { useState, type ReactNode } from "react";
import { TopicSlider } from "../../components/TopicSlider";
import { printTheorySlides } from "../../python/PythonTheory";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { useTaskStepper } from "../../components/useTaskStepper";
import { TrueFalseDeck, type TrueFalseStatement } from "../../components/TrueFalseDeck";
import { CodeEditor, PrintInput, RunButton, TerminalView } from "../../python/CodeTerminal";
import { runPython, sameOutput, type RunResult } from "../../python/interpreter";
import { trainers } from "../registry";
import { MissionBoard, MissionFeedback, MissionGoal, RobotSays } from "../../python/MissionBoard";

const meta = trainers.find((t) => t.id === "python-print")!;


function Code({ children }: { children: ReactNode }) {
  return <code className="rounded bg-slate-100 px-1 font-mono text-[0.92em] text-slate-800">{children}</code>;
}

/** `technique` returns a hint when the output is right but the mission's idea wasn't used. */
type Mission = { title: string; body: ReactNode; goal: string; start: string; technique?: (arg: string) => string | null };

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
    technique: (arg) =>
      /["']/.test(arg) || !/[+\-*/]/.test(arg)
        ? "Ответ верный, но пусть Python посчитает сам: напиши пример со знаком и без кавычек."
        : null,
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
    technique: (arg) =>
      /,\s*10\s*,/.test(arg) ? null : "Ответ совпал, но в этой миссии нужно передать 10 отдельным значением — через запятую и без кавычек.",
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
    technique: (arg) => {
      const values = arg.split(/,\s*sep\s*=/)[0];
      if (!/sep\s*=/.test(arg)) return "Ответ совпал, но в этой миссии нужно использовать sep= — пусть дефисы поставит Python.";
      if ((values.match(/,/g) ?? []).length < 2) return "Передай А, Б и В тремя отдельными значениями через запятую, а дефис задай через sep.";
      return null;
    },
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
    technique: (arg) => (arg.includes("\\n") ? null : "Используй \\n внутри текста, чтобы перенести строку."),
  },
];

function MissionPlay({ mission, isDone, onComplete, onMistake }: { mission: Mission; isDone: boolean; onComplete: () => void; onMistake: () => void }) {
  const [arg, setArg] = useState(mission.start);
  const [result, setResult] = useState<RunResult | null>(null);
  const [solved, setSolved] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  function run() {
    const r = runPython(`print(${arg})`);
    setResult(r);
    setHint(null);
    if (r.error || !sameOutput(r.output, mission.goal)) {
      if (!isDone) onMistake();
      return;
    }
    const techniqueHint = mission.technique?.(arg) ?? null;
    if (techniqueHint) {
      setHint(techniqueHint);
      if (!isDone) onMistake();
      return;
    }
    setSolved(true);
    onComplete();
  }

  const speech = result ? (result.error ? "…ой, я не понял команду" : result.output.replace(/\n$/, "") || " ") : null;

  return (
    <div className="space-y-4">
      <div className="space-y-2 text-slate-600">{mission.body}</div>
      <MissionGoal>
        <p className="mb-2 font-bold">Цель миссии — чтобы робот сказал:</p>
        <pre className="whitespace-pre-wrap rounded-xl bg-slate-950 px-3 py-2 font-mono text-emerald-200">{mission.goal}</pre>
      </MissionGoal>
      <RobotSays text={speech} />
      <PrintInput value={arg} onChange={setArg} onRun={run} />
      <div className="flex flex-wrap items-center gap-3">
        <RunButton onClick={run} />
        <MissionFeedback solved={solved} isDone={isDone} hint={hint} />
      </div>
      <TerminalView result={result} />
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
    rule: (code) => code.includes("*") && !/["']/.test(code),
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
    rule: (code) => (code.match(/print\s*\(/g) ?? []).length >= 3,
    explain: "print() без ничего внутри печатает пустую строку.",
  },
  {
    badge: "разделитель",
    prompt: "Числа уже есть. Добавь sep, чтобы между ними стояли дефисы: 1-2-3.",
    mode: "paren",
    start: "1, 2, 3",
    expected: "1-2-3",
    rule: (code) => /\(\s*1\s*,\s*2\s*,\s*3\s*,\s*sep\s*=/.test(code),
    explain: 'print(1, 2, 3, sep="-") — sep задаёт знак между значениями вместо пробела.',
  },
  {
    badge: "исправь ошибку",
    prompt: "Программа должна вывести «Мне 12 лет», но падает с ошибкой. Исправь её.",
    mode: "code",
    start: 'print("Мне " + 12 + " лет")',
    expected: "Мне 12 лет",
    rule: (code) => /\b12\b/.test(code.replace(/"[^"]*"|'[^']*'/g, "")),
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
    <TopicSlider>
      <TrainerHero icon={meta.icon} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      {printTheorySlides()}
      <SectionHeading
        kicker="Игра"
        title="Научи робота говорить"
        description="Шесть миссий: в каждой — короткое объяснение, а потом ты пишешь код внутри скобок print и смотришь, что появится в терминале."
      />
      <div className="mb-10">
        <MissionBoard
          missions={MISSIONS.map((m) => ({
            title: m.title,
            render: ({ isDone, onComplete, onMistake }) => <MissionPlay mission={m} isDone={isDone} onComplete={onComplete} onMistake={onMistake} />,
          }))}
          storageKey={meta.missions!.storageKey}
          pointsSource="missions:python-print"
          finishText="Все миссии пройдены — Пиксель научился говорить! Теперь закрепим всё на практике ниже."
        />
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
    </TopicSlider>
  );
}
