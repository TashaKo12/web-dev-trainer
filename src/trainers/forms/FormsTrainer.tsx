import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { TaskShell } from "../../components/TaskShell";
import { CompletionBanner } from "../../components/CompletionBanner";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "forms")!;

type FieldKey = "name" | "email" | "phone" | "password";

const FIELDS: Record<FieldKey, { label: string; type: string; placeholder: string }> = {
  name: { label: "Имя и фамилия", type: "text", placeholder: "Имя и фамилия" },
  email: { label: "Электронная почта", type: "email", placeholder: "Электронная почта" },
  phone: { label: "Телефон", type: "tel", placeholder: "+7 000 000-00-00" },
  password: { label: "Пароль", type: "password", placeholder: "Пароль" },
};

function Theory() {
  const [enabled, setEnabled] = useState<Record<FieldKey, boolean>>({
    name: true,
    email: true,
    phone: false,
    password: true,
  });
  const [required, setRequired] = useState(true);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [values, setValues] = useState<Record<FieldKey, string>>({ name: "", email: "", phone: "", password: "" });

  const activeKeys = (Object.keys(FIELDS) as FieldKey[]).filter((k) => enabled[k]);

  function submit() {
    if (required) {
      const empty = activeKeys.find((k) => !values[k].trim());
      if (empty) {
        setSubmitMsg(`Заполните поле «${FIELDS[empty].label}» — оно обязательное (required).`);
        return;
      }
    }
    setSubmitMsg("Форма отправлена! ✅");
  }

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-6 text-slate-600">
        Включай и выключай поля — форма справа перестраивается. Попробуй нажать «Войти», не заполнив поле, когда
        включён <code className="rounded bg-slate-100 px-1">required</code>.
      </p>

      <div className="grid gap-6 sm:grid-cols-[1fr_1.1fr]">
        <div className="space-y-3">
          {(Object.keys(FIELDS) as FieldKey[]).map((k) => (
            <label key={k} className="flex items-center gap-2 text-sm font-semibold text-cyan-700">
              <input type="checkbox" checked={enabled[k]} onChange={(e) => setEnabled((p) => ({ ...p, [k]: e.target.checked }))} />
              {FIELDS[k].label} <code className="ml-1 rounded bg-slate-100 px-1 text-xs">type="{FIELDS[k].type}"</code>
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm font-semibold text-cyan-700">
            <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />
            required (обязательные поля)
          </label>
        </div>

        <div className="rounded-2xl bg-slate-50 p-5">
          <div className="space-y-2.5">
            {activeKeys.map((k) => (
              <input
                key={k}
                type={FIELDS[k].type}
                placeholder={FIELDS[k].placeholder}
                value={values[k]}
                onChange={(e) => setValues((p) => ({ ...p, [k]: e.target.value }))}
                className="w-full rounded-xl border-2 border-cyan-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
              />
            ))}
            <button type="button" onClick={submit} className="w-full rounded-xl bg-cyan-600 px-3 py-2 text-sm font-bold text-white hover:bg-cyan-700">
              Войти
            </button>
            {submitMsg && <p className="text-center text-xs font-semibold text-cyan-700">{submitMsg}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Tasks() {
  const stepper = useTaskStepper(5, "forms");
  const [mcq, setMcq] = useState<number | null>(null);
  const [text, setText] = useState("");

  if (stepper.allAnswered) {
    return (
      <CompletionBanner
        score={stepper.score}
        total={5}
        onRestart={() => {
          stepper.restart();
          setMcq(null);
          setText("");
        }}
      />
    );
  }

  const task = stepper.index;
  const next = () => {
    stepper.goNext();
    setMcq(null);
    setText("");
  };

  if (task === 0) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt="Пользователь вводит email. Какой атрибут type сразу подскажет браузеру проверять формат адреса?"
        status={stepper.status}
        onCheck={() => stepper.markResult(mcq === 1)}
        onNext={next}
        checkDisabled={mcq === null}
        isLast={false}
        feedback='type="email" — браузер сам проверит, что введён похожий на email текст (есть @ и домен).'
      >
        <McqOptions mono options={['type="text"', 'type="email"', 'type="tel"', 'type="password"']} selected={mcq} onSelect={setMcq} disabled={stepper.status !== "idle"} />
      </TaskShell>
    );
  }

  if (task === 1) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt="Какой type скрывает вводимые символы точками, чтобы их никто не подсмотрел?"
        status={stepper.status}
        onCheck={() => stepper.markResult(mcq === 2)}
        onNext={next}
        checkDisabled={mcq === null}
        isLast={false}
        feedback='type="password" — вводимый текст заменяется точками/звёздочками.'
      >
        <McqOptions mono options={['type="text"', 'type="tel"', 'type="password"', 'type="hidden"']} selected={mcq} onSelect={setMcq} disabled={stepper.status !== "idle"} />
      </TaskShell>
    );
  }

  if (task === 2) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt="Какой атрибут не даст форме отправиться, пока поле не заполнено?"
        status={stepper.status}
        onCheck={() => stepper.markResult(text.trim().toLowerCase() === "required")}
        onNext={next}
        checkDisabled={!text.trim()}
        isLast={false}
        feedback="required — делает поле обязательным для заполнения перед отправкой."
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={stepper.status !== "idle"}
          placeholder="название атрибута"
          className="w-48 rounded-full border-2 border-slate-300 px-4 py-2 text-center font-mono font-semibold text-slate-700 outline-none focus:border-cyan-400 disabled:opacity-60"
        />
      </TaskShell>
    );
  }

  if (task === 3) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt="Как называется атрибут, который показывает серую подсказку внутри ПУСТОГО поля (например «Введите имя»)?"
        status={stepper.status}
        onCheck={() => stepper.markResult(mcq === 3)}
        onNext={next}
        checkDisabled={mcq === null}
        isLast={false}
        feedback="placeholder — подсказка, которая пропадает, как только пользователь начинает печатать."
      >
        <McqOptions mono options={["value", "required", "label", "placeholder"]} selected={mcq} onSelect={setMcq} disabled={stepper.status !== "idle"} />
      </TaskShell>
    );
  }

  return (
    <TaskShell
      index={task}
      total={5}
      statuses={stepper.statuses}
      prompt='Нужно поле для номера телефона с подсказкой "+7 000 000-00-00". Выбери правильно оформленный тег.'
      status={stepper.status}
      onCheck={() => stepper.markResult(mcq === 2)}
      onNext={next}
      checkDisabled={mcq === null}
      isLast
      feedback='Верно: type="tel" и placeholder в кавычках, значение полностью в двойных кавычках.'
    >
      <McqOptions
        mono
        options={[
          '<input placeholder=+7 000 000-00-00 type="tel">',
          '<input placeholder="+7 000 000-00-00" type="text">',
          '<input placeholder="+7 000 000-00-00" type="tel">',
          '<input type="tel">+7 000 000-00-00</input>',
        ]}
        selected={mcq}
        onSelect={setMcq}
        disabled={stepper.status !== "idle"}
      />
    </TaskShell>
  );
}

export function FormsTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} />
      <SectionHeading
        kicker="Теория"
        title="Собери форму из полей"
        description="type, placeholder и required определяют, как поле выглядит и ведёт себя."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="5 заданий про формы и типы полей." />
      <Tasks />
    </div>
  );
}
