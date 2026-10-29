import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { TaskShell } from "../../components/TaskShell";
import { CompletionBanner } from "../../components/CompletionBanner";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";
import { MiniPage, type ElKey } from "./MiniPage";

const meta = trainers.find((t) => t.id === "dom-access")!;

type Scenario = { code: string; result: ElKey[]; note: string };

const SCENARIOS: Scenario[] = [
  {
    code: "document.getElementById('title')",
    result: ["title"],
    note: "Находит ровно один элемент с нужным id. Самый быстрый и однозначный способ.",
  },
  {
    code: "document.querySelector('.item')",
    result: ["item1"],
    note: "Возвращает только первый элемент, который подходит под CSS-селектор.",
  },
  {
    code: "document.querySelectorAll('.item')",
    result: ["item1", "item2", "item3"],
    note: "Возвращает ВСЕ подходящие элементы — список (NodeList), а не один элемент.",
  },
  {
    code: "document.getElementById('list').children",
    result: ["item1", "item2", "item3"],
    note: "children — это прямые потомки элемента. У <ul> это три <li>.",
  },
  {
    code: "document.querySelector('.special').parentElement",
    result: ["list"],
    note: "parentElement поднимается на один уровень вверх — к родителю элемента.",
  },
  {
    code: "document.querySelector('.special').closest('ul')",
    result: ["list"],
    note: "closest ищет ближайшего ПОДХОДЯЩЕГО предка — может быть выше, чем просто родитель.",
  },
  {
    code: "document.querySelector('.special').nextElementSibling",
    result: ["item3"],
    note: "nextElementSibling — следующий элемент того же уровня (сосед справа/ниже).",
  },
  {
    code: "document.querySelector('.special').previousElementSibling",
    result: ["item1"],
    note: "previousElementSibling — предыдущий сосед того же уровня.",
  },
];

function Theory() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scenario = SCENARIOS[activeIndex];

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-5 text-slate-600">
        Нажимай на строки кода — страница ниже подсветит, какие элементы на
        самом деле вернёт этот вызов в браузере.
      </p>

      <div className="mb-5 grid gap-5 sm:grid-cols-[1fr_1fr]">
        <div className="space-y-1.5">
          {SCENARIOS.map((s, i) => (
            <button
              key={s.code}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`block w-full rounded-lg px-3 py-2 text-left font-mono text-xs transition ${
                i === activeIndex
                  ? "bg-violet-600 text-white shadow"
                  : "bg-slate-50 text-slate-600 hover:bg-violet-50"
              }`}
            >
              {s.code}
            </button>
          ))}
        </div>
        <div>
          <MiniPage highlighted={new Set(scenario.result)} />
        </div>
      </div>

      <div className="rounded-2xl bg-violet-50 p-4 text-sm text-violet-800">{scenario.note}</div>
    </div>
  );
}

type Task = { code: string; prompt: string; result: ElKey[]; explain: string };

const TASKS: Task[] = [
  {
    code: "document.getElementById('note')",
    prompt: "Какой элемент вернёт этот код? Нажми на него на мини-странице.",
    result: ["note"],
    explain: "getElementById находит ровно один элемент с id=\"note\".",
  },
  {
    code: "document.getElementsByClassName('item')[1]",
    prompt: "getElementsByClassName возвращает коллекцию. Какой элемент окажется под индексом [1]?",
    result: ["item2"],
    explain: "Индексы начинаются с 0: [0] — Яблоко, [1] — Банан, [2] — Вишня.",
  },
  {
    code: "document.querySelectorAll('.item')",
    prompt: "Отметь все элементы, которые вернёт этот вызов.",
    result: ["item1", "item2", "item3"],
    explain: "querySelectorAll с классом .item находит все три пункта списка.",
  },
  {
    code: "document.getElementById('list').children[2]",
    prompt: "children — это прямые потомки списка. Что окажется под индексом [2]?",
    result: ["item3"],
    explain: "children[0] — Яблоко, children[1] — Банан, children[2] — Вишня.",
  },
  {
    code: "document.querySelector('.special').previousElementSibling",
    prompt: "Отметь элемент, который вернёт этот код.",
    result: ["item1"],
    explain: "У «Банана» (класс special) соседом слева/выше является «Яблоко».",
  },
];

function ClickTask({ task, onResult }: { task: Task; onResult: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<Set<ElKey>>(new Set());
  const [checked, setChecked] = useState(false);

  function toggle(key: ElKey) {
    if (checked) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function check() {
    setChecked(true);
    const target = new Set(task.result);
    const correct = target.size === selected.size && [...target].every((k) => selected.has(k));
    onResult(correct);
  }

  return (
    <div>
      <code className="mb-3 block rounded-lg bg-slate-800 px-3 py-2 text-xs text-violet-200">{task.code}</code>
      <MiniPage
        highlighted={selected}
        targets={checked ? new Set(task.result) : undefined}
        selectable={!checked}
        onToggle={toggle}
      />
      {!checked && (
        <button
          type="button"
          onClick={check}
          disabled={selected.size === 0}
          className="mt-4 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
        >
          Проверить
        </button>
      )}
    </div>
  );
}

function Tasks() {
  const stepper = useTaskStepper(5, "dom-access");
  const [done, setDone] = useState(false);

  if (stepper.allAnswered) {
    return (
      <CompletionBanner
        score={stepper.score}
        total={5}
        onRestart={() => {
          stepper.restart();
          setDone(false);
        }}
      />
    );
  }

  const task = TASKS[stepper.index];

  return (
    <TaskShell
      index={stepper.index}
      total={5}
      statuses={stepper.statuses}
      prompt={task.prompt}
      status={done ? stepper.status : "idle"}
      onCheck={() => {}}
      checkDisabled
      hideCheck
      onNext={() => {
        stepper.goNext();
        setDone(false);
      }}
      isLast={stepper.isLast}
      feedback={task.explain}
    >
      <ClickTask
        key={stepper.index}
        task={task}
        onResult={(correct) => {
          setDone(true);
          stepper.markResult(correct);
        }}
      />
    </TaskShell>
  );
}

export function DomAccessTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} />
      <SectionHeading
        kicker="Теория"
        title="Что на самом деле возвращает JS"
        description="Один и тот же HTML можно получить разными способами — у каждого свой результат."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="5 заданий — угадай результат вызова, кликая по странице." />
      <Tasks />
    </div>
  );
}
