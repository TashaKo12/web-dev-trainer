import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "buttons")!;

function Theory() {
  const [disabled, setDisabled] = useState(false);
  const [clicks, setClicks] = useState(0);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-5 text-slate-600">
        <code className="rounded bg-slate-100 px-1">button</code> — кликабельный элемент для ДЕЙСТВИЯ (не для
        перехода на другую страницу — для этого есть ссылка a). Атрибут{" "}
        <code className="rounded bg-slate-100 px-1">disabled</code> делает кнопку неактивной.
      </p>
      <label className="mb-4 flex items-center gap-2 text-sm font-bold text-orange-700">
        <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
        disabled
      </label>
      <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setClicks((c) => c + 1)}
          className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          BUY
        </button>
        <span className="text-sm text-slate-500">Нажатий: {clicks}</span>
      </div>
    </div>
  );
}

function McqLevel({ options, correctIndex, onResult }: { options: string[]; correctIndex: number; onResult: (correct: boolean) => void }) {
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(choice === correctIndex);
  }

  return (
    <div>
      <McqOptions options={options} selected={choice} onSelect={(i) => !checked && setChoice(i)} disabled={checked} />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={choice === null}
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function ClickCountLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [disabled, setDisabled] = useState(true);
  const [clicks, setClicks] = useState(0);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(answer.trim() === "0");
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        Кнопка ниже уже помечена атрибутом disabled. Попробуй нажать на неё несколько раз, потом напиши, сколько
        раз сработал клик.
      </p>
      <div className="mb-4 flex items-center gap-4 rounded-2xl bg-slate-50 p-5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setClicks((c) => c + 1)}
          className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Оформить заказ
        </button>
        <label className="flex items-center gap-1.5 text-xs text-slate-400">
          <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} /> disabled
        </label>
      </div>
      <input
        type="text"
        value={answer}
        onChange={(e) => !checked && setAnswer(e.target.value)}
        disabled={checked}
        placeholder="число нажатий"
        className="w-40 rounded-full border-2 border-slate-300 px-4 py-2 text-center font-mono text-sm outline-none focus:border-orange-400 disabled:opacity-60"
      />
      <p className="mt-1 text-xs text-slate-400">(реальный счётчик кликов: {clicks})</p>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!answer.trim()}
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const TASK_META = [
  { badge: "выбери из списка", prompt: "Нужен элемент для ДЕЙСТВИЯ на странице (например «Купить»), а не для перехода на другую страницу. Какой тег?", explain: "button — для действий. a (ссылка) предназначена для переходов по href." },
  { badge: "попробуй вживую", prompt: "", explain: "Атрибут disabled полностью отключает кнопку — клики по ней не засчитываются, сколько бы раз ты ни нажал." },
  { badge: "выбери из списка", prompt: "Кнопка внутри формы с type=\"reset\" при клике...", explain: 'type="reset" возвращает все поля формы к исходным значениям — в отличие от type="submit", она ничего никуда не отправляет.' },
];

function Tasks() {
  const stepper = useTaskStepper(3, "buttons");
  const task = stepper.index;
  const meta = TASK_META[task];

  if (stepper.allAnswered) {
    return <CompletionBanner score={stepper.score} total={3} onRestart={() => stepper.restart()} />;
  }

  return (
    <LevelShell
      total={3}
      index={task}
      statuses={stepper.statuses}
      status={stepper.status}
      isLast={stepper.isLast}
      badge={meta.badge}
      explain={meta.explain}
      onJump={stepper.goTo}
      onNext={stepper.goNext}
      nextClassName="bg-gradient-to-r from-amber-500 to-orange-600"
    >
      {(task === 0 || task === 2) && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <McqLevel key={task} options={["button", "a", "div", "span"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <ClickCountLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && <McqLevel key={task} options={["отправляет форму на сервер", "сбрасывает поля формы к исходным значениям", "удаляет форму со страницы", "ничего не делает"]} correctIndex={1} onResult={(c) => stepper.markResult(c)} />}
    </LevelShell>
  );
}

export function ButtonsTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="button — для действий, не для переходов"
        description="Включи disabled и попробуй нажать на кнопку — она перестанет реагировать на клики."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="3 уровня — выбирай и пробуй вживую." />
      <Tasks />
    </div>
  );
}
