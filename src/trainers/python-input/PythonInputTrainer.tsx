import { RichText } from "../../components/RichText";
import { describeFailure, ExpectedList } from "../../python/PythonTopic";
import { ResetDraft, useDraft } from "../../lib/drafts";
import { useState, type ReactNode } from "react";
import { TopicSlider } from "../../components/TopicSlider";
import { inputTheorySlides } from "../../python/PythonTheory";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { useTaskStepper } from "../../components/useTaskStepper";
import { TrueFalseDeck, type TrueFalseStatement } from "../../components/TrueFalseDeck";
import { CodeEditor, RunButton, TerminalView, useProgramRunner } from "../../python/CodeTerminal";
import { runPython, sameOutput, type RunResult } from "../../python/interpreter";
import { MissionBoard, MissionFeedback, MissionGoal, RobotSays } from "../../python/MissionBoard";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "python-input")!;

function Code({ children }: { children: ReactNode }) {
  return <code className="rounded bg-slate-100 px-1 font-mono text-[0.92em] text-slate-800">{children}</code>;
}

const lastLine = (r: RunResult) => r.printed.replace(/\n$/, "").split("\n").pop() ?? "";
/** Runs the program with the check's own answers: is this word or number in what it printed? The names of variables do not matter. */
const says = (code: string, inputs: string[], text: string) => {
  const r = runPython(code, [...inputs, "8", "8"]);
  return !r.error && !r.waiting && new RegExp(`(^|[^\\wА-Яа-яЁё.])${text}(?![\\wА-Яа-яЁё]|\\.\\d)`).test(r.printed);
};
const isInt = (s: string) => /^\s*-?\d+\s*$/.test(s);

type IOMission = {
  title: string;
  body: ReactNode;
  goal: ReactNode;
  start: string;
  /** Runs once the program has finished without errors: true = mission complete, string = hint. */
  check: (r: RunResult, answers: string[], code: string) => true | string;
};

const MISSIONS: IOMission[] = [
  {
    title: "Робот задаёт вопрос",
    body: (
      <>
        <p>
          До сих пор Пиксель только говорил. Команда <Code>input</Code> учит его слушать: текст в скобках робот
          показывает как вопрос, а потом <b>ждёт</b>, пока человек напишет ответ в терминале и нажмёт Enter.
        </p>
        <p>
          <Code>input("Как тебя зовут? ")</Code> — пробел в конце вопроса нужен, чтобы ответ не прилипал к знаку
          вопроса.
        </p>
      </>
    ),
    goal: "Запусти программу и ответь роботу прямо в терминале.",
    start: 'input("Как тебя зовут? ")',
    check: (r, answers) =>
      r.prompts.length === 0 ? "В программе должна быть команда input(...)." : answers.length >= 1 ? true : "Ответь на вопрос робота.",
  },
  {
    title: "Робот запоминает ответ",
    body: (
      <>
        <p>
          Ответ можно сохранить в <b>переменную</b> — коробочку с именем. Пишем имя, знак <Code>=</Code> и{" "}
          <Code>input</Code>: <Code>name = input("Как тебя зовут? ")</Code>. Теперь всё, что ввёл человек, лежит в
          коробочке <Code>name</Code>.
        </p>
        <p>
          Достать ответ можно в любой момент: <Code>print("Привет,", name)</Code>. Имя переменной пишут без кавычек —
          иначе это будет просто текст «name».
        </p>
      </>
    ),
    goal: "Пусть робот поздоровается по имени: «Привет, …» и твоё имя.",
    start: 'name = input("Как тебя зовут? ")\nprint("Привет!")',
    check: (_r, answers, code) => {
      const name = answers[0]?.trim();
      if (!name) return "Когда робот спросит, напиши своё имя.";
      return says(code, ["Зоя"], "Зоя") && says(code, ["Тимур"], "Тимур") ? true : "Робот не называет имя, которое ему сказали. Допиши в print свою переменную — без кавычек, через запятую.";
    },
  },
  {
    title: "Ответ — это текст",
    body: (
      <>
        <p>
          Важная тайна: <Code>input</Code> всегда возвращает <b>текст</b>, даже если ввели цифры. А текст, умноженный
          на 2, просто повторяется: из «5» получится «55».
        </p>
        <p>
          Чтобы превратить ответ в число, его оборачивают в <Code>int</Code>: <Code>number = int(input("Число: "))</Code>.
          Теперь с ним можно считать.
        </p>
      </>
    ),
    goal: "Сделай так, чтобы робот правильно удваивал число: на 5 он должен ответить 10.",
    start: 'number = input("Введи число: ")\nprint(number * 2)',
    check: (_r, answers, code) => {
      if (!answers[0] || !isInt(answers[0])) return "Введи целое число, например 5.";
      return says(code, ["7"], "14") && says(code, ["21"], "42") ? true : `Если ввести 7, должно получиться 14, а программа напечатала «${runPython(code, ["7"]).printed.trim()}». Оберни ответ: int(input(...)).`;
    },
  },
  {
    title: "Два вопроса",
    body: (
      <>
        <p>
          Вопросов может быть сколько угодно — каждый <Code>input</Code> ждёт свой ответ, и каждый ответ можно
          положить в свою переменную.
        </p>
        <p>
          <Code>name = input("Как тебя зовут? ")</Code>
          <br />
          <Code>city = input("Где ты живёшь? ")</Code>
        </p>
      </>
    ),
    goal: "Добавь второй вопрос — про возраст — и пусть робот скажет имя и возраст в одной фразе.",
    start: 'name = input("Как тебя зовут? ")\nprint("Привет,", name)',
    check: (_r, answers, code) => {
      if (answers.length < 2) return "Нужен второй вопрос — ещё одна команда input(...), ответ сохрани в другую переменную.";
      return says(code, ["Зоя", "13"], "Зоя") && says(code, ["Зоя", "13"], "13") ? true : "Если ответить «Зоя» и «13», в print должны быть и Зоя, и 13.";
    },
  },
  {
    title: "Мини-калькулятор",
    body: (
      <>
        <p>Соберём всё вместе: спросим два числа, превратим их в числа и выведем сумму.</p>
        <p>
          <Code>a = int(input("Первое число: "))</Code> — так же сделай второе, а потом <Code>print(a + b)</Code>.
        </p>
      </>
    ),
    goal: "Робот спрашивает два числа и печатает их сумму.",
    start: 'a = int(input("Первое число: "))\n',
    check: (_r, answers, code) => {
      if (answers.length < 2) return "Робот должен задать два вопроса.";
      if (!isInt(answers[0]) || !isInt(answers[1])) return "Введи целые числа.";
      return says(code, ["12", "30"], "42") && says(code, ["5", "6"], "11") ? true : `Если ввести 12 и 30, должно получиться 42, а программа напечатала «${runPython(code, ["12", "30"]).printed.trim()}».`;
    },
  },
];

function MissionPlay({ mission, isDone, onComplete, onMistake }: { mission: IOMission; isDone: boolean; onComplete: () => void; onMistake: () => void }) {
  const [code, setCode] = useDraft(mission.start);
  const runner = useProgramRunner();
  const [solved, setSolved] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  function evaluate({ result, answers }: { result: RunResult; answers: string[] }) {
    setHint(null);
    if (result.waiting) return;
    if (result.error) {
      if (!isDone) onMistake();
      return;
    }
    const verdict = mission.check(result, answers, code);
    if (verdict === true) {
      setSolved(true);
      onComplete();
    } else {
      setHint(verdict);
      if (!isDone) onMistake();
    }
  }

  const r = runner.result;
  const speech = !r
    ? null
    : r.error
      ? "…ой, я не понял команду"
      : r.waiting
        ? r.prompts[r.prompts.length - 1]?.trim() || "…жду ответа"
        : lastLine(r) || "Готово!";

  return (
    <div className="space-y-4">
      <div className="space-y-2 text-slate-600">{mission.body}</div>
      <MissionGoal>
        <p className="font-bold">Цель миссии:</p>
        <p className="mt-1">{mission.goal}</p>
      </MissionGoal>
      <RobotSays text={speech} />
      <CodeEditor value={code} onChange={setCode} onRun={() => evaluate(runner.run(code))} />
      <div className="flex flex-wrap items-center gap-3">
        <RunButton onClick={() => evaluate(runner.run(code))} />
        <MissionFeedback solved={solved} isDone={isDone} hint={hint} />
<ResetDraft value={code} start={mission.start} onReset={setCode} />
      </div>
      <TerminalView result={r} onAnswer={(text) => evaluate(runner.answer(text))} />
    </div>
  );
}

type IOLevel = {
  badge: string;
  prompt: string;
  start: string;
  tests: { inputs: string[]; expected: string }[];
  rule?: (results: RunResult[]) => boolean;
  explain: string;
};

const LEVELS: IOLevel[] = [
  {
    badge: "впиши вопрос",
    prompt: "Допиши в скобки input вопрос «Как тебя зовут?», чтобы человек понял, что от него ждут.",
    start: 'name = input()\nprint("Привет,", name)',
    tests: [{ inputs: ["Аня"], expected: "Привет, Аня" }],
    rule: (results) => results[0].prompts[0]?.includes("?") ?? false,
    explain:
      "```\nname = input(\"Как тебя зовут? \")\nprint(\"Привет,\", name)\n```\nТекст в скобках input показывается как вопрос.",
  },
  {
    badge: "напиши сам",
    prompt: "Спроси любимый цвет и выведи: Твой любимый цвет — … (после тире — ответ).",
    start: "",
    tests: [
      { inputs: ["синий"], expected: "Твой любимый цвет — синий" },
      { inputs: ["зелёный"], expected: "Твой любимый цвет — зелёный" },
    ],
    explain:
      "```\ncolor = input(\"Какой твой любимый цвет? \")\nprint(\"Твой любимый цвет —\", color)\n```\nЗапятая в print сама ставит пробел.",
  },
  {
    badge: "исправь ошибку",
    prompt: "Программа всем говорит «Привет, name» вместо настоящего имени. Исправь.",
    start: 'name = input("Как тебя зовут? ")\nprint("Привет, name")',
    tests: [
      { inputs: ["Петя"], expected: "Привет, Петя" },
      { inputs: ["Оля"], expected: "Привет, Оля" },
    ],
    explain:
      "```\nname = input(\"Как тебя зовут? \")\nprint(\"Привет,\", name)\n```\nИмя переменной пишут без кавычек, иначе это просто текст.",
  },
  {
    badge: "исправь ошибку",
    prompt: "Программа должна прибавлять к возрасту 1, но падает с ошибкой. Исправь.",
    start: 'age = input("Сколько тебе лет? ")\nprint(age + 1)',
    tests: [
      { inputs: ["11"], expected: "12" },
      { inputs: ["7"], expected: "8" },
    ],
    explain:
      "```\nage = int(input(\"Сколько тебе лет? \"))\nprint(age + 1)\n```\ninput даёт текст, int превращает его в число.",
  },
  {
    badge: "напиши сам",
    prompt: "Спроси число и выведи его квадрат (число, умноженное само на себя).",
    start: "",
    tests: [
      { inputs: ["7"], expected: "49" },
      { inputs: ["12"], expected: "144" },
    ],
    explain:
      "```\nn = int(input(\"Число: \"))\nprint(n * n)\n```\nКвадрат — число, умноженное само на себя.",
  },
  {
    badge: "два вопроса",
    prompt: "Спроси имя, потом город и выведи: … живёт в городе … (например: Оля живёт в городе Казань).",
    start: "",
    tests: [
      { inputs: ["Оля", "Казань"], expected: "Оля живёт в городе Казань" },
      { inputs: ["Миша", "Омск"], expected: "Миша живёт в городе Омск" },
    ],
    explain:
      "```\nname = input(\"Имя: \")\ncity = input(\"Город: \")\nprint(name, \"живёт в городе\", city)\n```\nКаждый ответ — в своей переменной.",
  },
  {
    badge: "калькулятор",
    prompt: "Спроси два числа и выведи их сумму.",
    start: "",
    tests: [
      { inputs: ["3", "4"], expected: "7" },
      { inputs: ["10", "25"], expected: "35" },
    ],
    explain:
      "```\na = int(input(\"Первое: \"))\nb = int(input(\"Второе: \"))\nprint(a + b)\n```\nБез int() тексты бы склеились.",
  },
  {
    badge: "напиши сам",
    prompt: "Спроси слово и выведи его три раза подряд без пробелов (ку → кукуку).",
    start: "",
    tests: [
      { inputs: ["ку"], expected: "кукуку" },
      { inputs: ["ла"], expected: "лалала" },
    ],
    explain:
      "```\nword = input(\"Слово: \")\nprint(word * 3)\n```\nТекст можно умножать на число.",
  },
  {
    badge: "исправь ошибку",
    prompt: "Программа должна удваивать число, но что-то пошло не так.",
    start: 'number = int(input("Число: ")\nprint(number * 2)',
    tests: [
      { inputs: ["5"], expected: "10" },
      { inputs: ["21"], expected: "42" },
    ],
    explain:
      "```\nnumber = int(input(\"Число: \"))\nprint(number * 2)\n```\nУ int и у input свои скобки, закрыть нужно обе.",
  },
  {
    badge: "напиши сам",
    prompt: "Спроси возраст и выведи: Через 5 лет тебе будет … (на 5 больше).",
    start: "",
    tests: [
      { inputs: ["11"], expected: "Через 5 лет тебе будет 16" },
      { inputs: ["7"], expected: "Через 5 лет тебе будет 12" },
    ],
    explain:
      "```\nage = int(input(\"Возраст: \"))\nprint(\"Через 5 лет тебе будет\", age + 5)\n```\nСначала число, потом прибавляем 5.",
  },
];

function IOLevelTask({ level, onResult }: { level: IOLevel; onResult: (correct: boolean) => void }) {
  const [code, setCode] = useDraft(level.start);
  const runner = useProgramRunner();
  const [checked, setChecked] = useState<{ result: RunResult; inputs: string[]; failed: string | null } | null>(null);

  function check() {
    const results = level.tests.map((t) => runPython(code, t.inputs));
    const passed = results.map((r, i) => !r.error && !r.waiting && sameOutput(r.printed, level.tests[i].expected));
    const failing = passed.indexOf(false);
    const shown = failing === -1 ? 0 : failing;
    setChecked({ result: results[shown], inputs: level.tests[shown].inputs, failed: failing === -1 ? null : describeFailure(results[shown], level.tests[shown]) });
    onResult(failing === -1 && (level.rule ? level.rule(results) : true));
  }


  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-slate-700">{level.prompt}</p>
      <div className="rounded-2xl bg-slate-50 p-3 text-sm">
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Что должно получиться</p>
        <ExpectedList tests={level.tests} />
      </div>
      <CodeEditor value={code} onChange={setCode} onRun={() => runner.run(code)} disabled={!!checked} />
      {!checked && (
        <div className="flex flex-wrap items-center gap-3">
          <RunButton onClick={() => runner.run(code)} />
          <button
            type="button"
            onClick={check}
            disabled={!code.trim()}
            className="rounded-full bg-gradient-to-r from-violet-500 to-sky-500 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
          <span className="text-xs text-slate-400">Проверка запустит программу с разными ответами. Имена переменных — любые.</span>
        </div>
      )}
      {checked ? (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Проверка с ответами: {checked.inputs.join(", ")}</p>
          {checked.failed && <div className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800"><RichText text={checked.failed} /></div>}
          <TerminalView result={checked.result} />
        </div>
      ) : (
        <TerminalView result={runner.result} onAnswer={(t) => runner.answer(t)} />
      )}
    </div>
  );
}

function Tasks() {
  const stepper = useTaskStepper(LEVELS.length, "python-input");
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
      explain={
        <>
          <b>Пример решения</b> (свои переменные можно назвать иначе):
          <RichText text={level.explain} />
        </>
      }
      onJump={stepper.goTo}
      onNext={stepper.goNext}
      nextClassName="bg-gradient-to-r from-violet-500 to-sky-500"
    >
      <IOLevelTask key={stepper.index} level={level} onResult={(c) => stepper.markResult(c)} />
    </LevelShell>
  );
}

const TRUE_FALSE: TrueFalseStatement[] = [
  { text: "input показывает вопрос и ждёт, пока человек введёт ответ.", answer: true, explain: "Да, программа останавливается, пока не нажмут Enter." },
  { text: "input всегда возвращает число, если ввести цифры.", answer: false, explain: "Нет, input всегда возвращает текст. Число получают через int(input(...))." },
  { text: 'Если ввести 5, то print(input() * 2) напечатает 10.', answer: false, explain: "Нет, напечатает 55: текст «5» повторится два раза." },
  { text: "int(input()) превращает ответ в целое число.", answer: true, explain: "Да, int переделывает текст из цифр в число, с которым можно считать." },
  { text: "Ответ из input можно сохранить в переменную: name = input().", answer: true, explain: "Да, и потом использовать её сколько угодно раз." },
  { text: 'print("имя") напечатает то, что лежит в переменной имя.', answer: false, explain: "Нет, в кавычках это просто слово «имя». Переменную пишут без кавычек." },
  { text: "Текст в скобках input — это подсказка для человека.", answer: true, explain: "Да, его видит тот, кто запускает программу, и понимает, что ввести." },
  { text: "В одной программе может быть только один input.", answer: false, explain: "Нет, вопросов может быть сколько угодно." },
  { text: "Если программа ждёт число, а ввести слово, int() выдаст ошибку ValueError.", answer: true, explain: "Да, слово нельзя превратить в число." },
  { text: "input можно вызвать и без текста в скобках: input().", answer: true, explain: "Да, тогда программа просто молча ждёт ответа — поэтому вопрос лучше писать." },
];

export function PythonInputTrainer() {
  return (
    <TopicSlider>
      <TrainerHero icon={meta.icon} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      {inputTheorySlides()}
      <SectionHeading
        kicker="Игра"
        title="Научи робота слушать"
        description="Пять миссий: робот задаёт вопросы, а ты отвечаешь ему прямо в терминале."
      />
      <div className="mb-10">
        <MissionBoard
          missions={MISSIONS.map((m) => ({
            title: m.title,
            render: ({ isDone, onComplete, onMistake }) => <MissionPlay mission={m} isDone={isDone} onComplete={onComplete} onMistake={onMistake} />,
          }))}
          storageKey={meta.missions!.storageKey}
          pointsSource="missions:python-input"
          finishText="Все миссии пройдены — Пиксель научился слушать! Закрепим на практике."
        />
      </div>
      <SectionHeading
        kicker="Практика"
        title="Закрепим"
        description={`${LEVELS.length} уровней. Программу можно запустить и ответить ей самому, а проверка прогонит её с разными ответами.`}
      />
      <div className="mb-10">
        <Tasks />
      </div>
      <SectionHeading kicker="Проверь себя" title="Верно или неверно?" description="Пролистай 10 карточек — угадай, где правда, а где нет." />
      <TrueFalseDeck statements={TRUE_FALSE} accent={meta.gradient} />
    </TopicSlider>
  );
}
