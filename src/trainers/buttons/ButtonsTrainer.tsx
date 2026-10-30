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

function TypeButtonLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);

  function normalize(s: string) {
    return s.trim().toLowerCase().replace(/\s+/g, " ");
  }

  function check() {
    setChecked(true);
    onResult(normalize(text) === "<button disabled>купить</button>");
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Напиши неактивную кнопку с текстом «Купить» (с атрибутом disabled).</p>
      <input
        type="text"
        value={text}
        onChange={(e) => !checked && setText(e.target.value)}
        disabled={checked}
        placeholder="<button ...>Купить</button>"
        className="w-full rounded-xl border-2 border-orange-200 px-3 py-2 font-mono text-sm outline-none focus:border-orange-400 disabled:opacity-60"
      />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!text.trim()}
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function PreciseClickLevel({ target, onResult }: { target: number; onResult: (correct: boolean) => void }) {
  const [count, setCount] = useState(0);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(count === target);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Нажми на кнопку РОВНО {target} раза — ни больше, ни меньше (если ошибёшься, нажми «Сбросить»).</p>
      <div className="mb-3 flex items-center gap-4 rounded-2xl bg-slate-50 p-5">
        <button
          type="button"
          onClick={() => !checked && setCount((c) => c + 1)}
          className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-orange-600"
        >
          Нажми меня
        </button>
        <span className="text-sm font-bold text-slate-600">
          {count} из {target}
        </span>
        {!checked && count > 0 && (
          <button type="button" onClick={() => setCount(0)} className="text-xs font-semibold text-slate-400 underline">
            Сбросить
          </button>
        )}
      </div>
      {!checked && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={count === 0}
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

type DualKey = "plain" | "disabled";

function DualButtonLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [clicks, setClicks] = useState<Record<DualKey, number>>({ plain: 0, disabled: 0 });
  const [picked, setPicked] = useState<DualKey | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(picked === "plain");
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Нажми на ОБЕ кнопки несколько раз, потом отметь, у какой из них счётчик реально увеличивался.</p>
      <div className="mb-4 flex flex-wrap gap-4 rounded-2xl bg-slate-50 p-5">
        <div className="text-center">
          <button
            type="button"
            onClick={() => setClicks((c) => ({ ...c, plain: c.plain + 1 }))}
            className="mb-1 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-orange-600"
          >
            Кнопка А
          </button>
          <p className="text-xs text-slate-400">нажатий: {clicks.plain}</p>
        </div>
        <div className="text-center">
          <button
            type="button"
            disabled
            onClick={() => setClicks((c) => ({ ...c, disabled: c.disabled + 1 }))}
            className="mb-1 rounded-xl bg-slate-300 px-5 py-2.5 text-sm font-bold text-white shadow disabled:cursor-not-allowed"
          >
            Кнопка Б
          </button>
          <p className="text-xs text-slate-400">нажатий: {clicks.disabled}</p>
        </div>
      </div>
      <div className="flex justify-center gap-2">
        <button
          type="button"
          disabled={checked}
          onClick={() => setPicked("plain")}
          className={`rounded-lg px-4 py-1.5 text-sm font-bold transition disabled:cursor-not-allowed ${picked === "plain" ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600"}`}
        >
          Кнопка А
        </button>
        <button
          type="button"
          disabled={checked}
          onClick={() => setPicked("disabled")}
          className={`rounded-lg px-4 py-1.5 text-sm font-bold transition disabled:cursor-not-allowed ${picked === "disabled" ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600"}`}
        >
          Кнопка Б
        </button>
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!picked}
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
  { badge: "напиши сам", prompt: "", explain: "<button disabled>Купить</button> — атрибут disabled пишется просто именем, без значения." },
  { badge: "нажимай точно", prompt: "", explain: "Каждый клик по обычной кнопке увеличивает счётчик ровно на 1 — в отличие от disabled-кнопки, где клики вообще не засчитываются." },
  { badge: "выбери из списка", prompt: "Какой атрибут делает кнопку неактивной и некликабельной?", explain: "disabled — единственный правильный вариант; readonly к кнопкам не применяется." },
  { badge: "выбери из списка", prompt: 'Кнопка с type="button" (а не submit или reset) внутри формы при клике...', explain: 'type="button" ничего не делает сама по себе — она нужна для своих действий через JavaScript, не связанных с отправкой или сбросом формы.' },
  { badge: "выбери из списка", prompt: "Если сделать «кнопку» из обычного <div> со стилями и onclick вместо настоящего <button>, что она потеряет?", explain: "div без button не получает автоматической поддержки клавиатуры (Tab, Enter/Space) и хуже распознаётся программами экранного доступа — это теряется бесплатно вместе с настоящим <button>." },
  { badge: "сравни вживую", prompt: "", explain: "Кнопка Б помечена disabled, поэтому её счётчик не увеличивается, сколько по ней ни кликай — реагирует только обычная кнопка А." },
];

function Tasks() {
  const stepper = useTaskStepper(9, "buttons");
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
      nextClassName="bg-gradient-to-r from-amber-500 to-orange-600"
    >
      {(task === 0 || task === 2 || task === 5 || task === 6 || task === 7) && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <McqLevel key={task} options={["button", "a", "div", "span"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <ClickCountLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && <McqLevel key={task} options={["отправляет форму на сервер", "сбрасывает поля формы к исходным значениям", "удаляет форму со страницы", "ничего не делает"]} correctIndex={1} onResult={(c) => stepper.markResult(c)} />}
      {task === 3 && <TypeButtonLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 4 && <PreciseClickLevel key={task} target={3} onResult={(c) => stepper.markResult(c)} />}
      {task === 5 && <McqLevel key={task} options={["disabled", "readonly", "inactive", "off"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 6 && (
        <McqLevel key={task} mono={false} options={["Отправляет форму", "Сбрасывает форму", "Ничего не делает сама по себе", "Удаляет форму"]} correctIndex={2} onResult={(c) => stepper.markResult(c)} />
      )}
      {task === 7 && (
        <McqLevel
          key={task}
          mono={false}
          options={["Ничего не потеряет", "Поддержку клавиатуры и программ экранного доступа", "Станет медленнее работать", "Перестанет отображаться"]}
          correctIndex={1}
          onResult={(c) => stepper.markResult(c)}
        />
      )}
      {task === 8 && <DualButtonLevel key={task} onResult={(c) => stepper.markResult(c)} />}
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
      <SectionHeading kicker="Практика" title="Закрепим" description="9 уровней — выбирай, нажимай и пиши сам." />
      <Tasks />
    </div>
  );
}
