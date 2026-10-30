import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "form-basics")!;

function Theory() {
  const [wrapped, setWrapped] = useState(true);
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "Enter") return;
    setMsg(wrapped ? "Форма отправлена нажатием Enter! ✅" : "Ничего не произошло — поле не внутри <form>.");
  }

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-5 text-slate-600">
        Тег <code className="rounded bg-slate-100 px-1">form</code> объединяет несколько полей в одну форму,
        которую можно отправить целиком — например, нажатием Enter в любом поле или кликом по кнопке внутри.
      </p>

      <label className="mb-3 flex items-center gap-2 text-sm font-bold text-cyan-700">
        <input type="checkbox" checked={wrapped} onChange={(e) => { setWrapped(e.target.checked); setMsg(null); }} />
        поле обёрнуто в &lt;form&gt;...&lt;/form&gt;
      </label>

      <div className="rounded-2xl bg-slate-50 p-5">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="напечатай что-нибудь и нажми Enter"
          className="w-full rounded-xl border-2 border-cyan-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
        />
        {msg && <p className="mt-2 text-sm font-semibold text-cyan-700">{msg}</p>}
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
            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function EnterTestLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [wrapped, setWrapped] = useState<boolean | null>(null);
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "Enter" || wrapped === null) return;
    setMsg(wrapped ? "Отправилось нажатием Enter! ✅" : "Ничего не произошло.");
  }

  function check(answer: boolean) {
    setWrapped(answer);
    setValue("");
    setMsg(null);
  }

  function submitCheck() {
    setChecked(true);
    onResult(wrapped === true);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        Выбери, как оформить поле — внутри &lt;form&gt; или без него, — а затем впиши текст и нажми Enter в самом поле, чтобы проверить, отправится ли оно.
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={checked}
          onClick={() => check(true)}
          className={`rounded-full border-2 px-4 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed ${wrapped === true ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-slate-200 text-slate-500"}`}
        >
          внутри &lt;form&gt;
        </button>
        <button
          type="button"
          disabled={checked}
          onClick={() => check(false)}
          className={`rounded-full border-2 px-4 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed ${wrapped === false ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-slate-200 text-slate-500"}`}
        >
          без &lt;form&gt;
        </button>
      </div>
      <div className="rounded-2xl bg-slate-50 p-4">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={wrapped === null || checked}
          placeholder="напиши что-нибудь и нажми Enter"
          className="w-full rounded-xl border-2 border-cyan-200 px-3 py-2 text-sm outline-none focus:border-cyan-400 disabled:opacity-50"
        />
        {msg && <p className="mt-2 text-sm font-semibold text-cyan-700">{msg}</p>}
      </div>
      <p className="mt-3 text-sm text-slate-500">Чтобы Enter реально отправлял поле — какой вариант нужно было выбрать?</p>
      {!checked && (
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={submitCheck}
            disabled={wrapped === null}
            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function TypeTagLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);

  function normalize(s: string) {
    return s.trim().toLowerCase().replace(/\s+/g, "");
  }

  function check() {
    setChecked(true);
    onResult(normalize(text) === "<form></form>");
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Напиши пустой тег form — открывающий и закрывающий, без атрибутов.</p>
      <input
        type="text"
        value={text}
        onChange={(e) => !checked && setText(e.target.value)}
        disabled={checked}
        placeholder="<form>...</form>"
        className="w-64 rounded-full border-2 border-slate-300 px-4 py-2 text-center font-mono text-sm outline-none focus:border-cyan-400 disabled:opacity-60"
      />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!text.trim()}
            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const TASK_META = [
  { badge: "выбери из списка", prompt: "Какой тег объединяет несколько полей в форму, которую можно отправить целиком?", explain: "form — контейнер для полей ввода и кнопки отправки." },
  { badge: "попробуй вживую", prompt: "", explain: "Enter отправляет поле только тогда, когда оно находится внутри тега <form> — это одна из причин всегда оборачивать поля в form." },
  { badge: "напиши сам", prompt: "", explain: "<form></form> — простейшая форма без единого атрибута, уже готова принимать поля внутрь." },
  { badge: "выбери из списка", prompt: "Кнопка внутри <form> без атрибута type по умолчанию ведёт себя как кнопка с каким типом?", explain: 'type="submit" — это поведение кнопки внутри формы по умолчанию, даже если type не указан явно.' },
];

function Tasks() {
  const stepper = useTaskStepper(4, "form-basics");
  const task = stepper.index;
  const meta = TASK_META[task];

  if (stepper.allAnswered) {
    return <CompletionBanner score={stepper.score} total={4} onRestart={() => stepper.restart()} />;
  }

  return (
    <LevelShell
      total={4}
      index={task}
      statuses={stepper.statuses}
      status={stepper.status}
      isLast={stepper.isLast}
      badge={meta.badge}
      explain={meta.explain}
      onJump={stepper.goTo}
      onNext={stepper.goNext}
      nextClassName="bg-gradient-to-r from-cyan-500 to-blue-600"
    >
      {(task === 0 || task === 3) && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <McqLevel key={task} options={["form", "div", "section", "fieldset"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <EnterTestLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && <TypeTagLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 3 && <McqLevel key={task} options={["button", "reset", "submit", "text"]} correctIndex={2} onResult={(c) => stepper.markResult(c)} />}
    </LevelShell>
  );
}

export function FormBasicsTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="form объединяет поля в одну отправку"
        description="Попробуй отправить поле нажатием Enter — внутри form это работает, снаружи нет."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="4 уровня — выбирай, пробуй вживую и пиши сам." />
      <Tasks />
    </div>
  );
}
