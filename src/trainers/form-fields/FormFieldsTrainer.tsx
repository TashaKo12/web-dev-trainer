import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "form-fields")!;

function Theory() {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-5 text-slate-600">
        <code className="rounded bg-slate-100 px-1">label</code> — подпись поля, которая остаётся видимой ВСЕГДА.{" "}
        <code className="rounded bg-slate-100 px-1">placeholder</code> — подсказка ВНУТРИ поля, которая исчезает,
        как только пользователь начинает печатать.
      </p>
      <div className="rounded-2xl bg-slate-50 p-5">
        <label
          onClick={() => setFocused(true)}
          className="mb-1 block cursor-pointer text-sm font-bold text-cyan-700"
        >
          Электронная почта (это label — кликни на него)
        </label>
        <input
          type="email"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="your@email.com (это placeholder)"
          className={`w-full rounded-xl border-2 px-3 py-2 text-sm outline-none transition ${focused ? "border-cyan-500" : "border-cyan-200"}`}
        />
      </div>
      <div className="mt-4 rounded-2xl bg-cyan-50 p-4 text-sm text-cyan-800">
        В реальном HTML клик по правильно связанному label (атрибут <code className="rounded bg-white px-1">for</code>,
        совпадающий с <code className="rounded bg-white px-1">id</code> поля) сразу ставит курсор в поле — попробуй
        кликнуть на подпись выше.
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
            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

type PairKey = "label-a" | "input-a" | "label-b" | "input-b";

function PairClickLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [picked, setPicked] = useState<PairKey[]>([]);
  const [checked, setChecked] = useState(false);

  function pick(key: PairKey) {
    if (checked) return;
    setPicked((p) => (p.includes(key) ? p : p.length < 2 ? [...p, key] : p));
  }

  function check() {
    setChecked(true);
    onResult(picked.includes("label-b") && picked.includes("input-b"));
  }

  function cls(key: PairKey) {
    return picked.includes(key) ? "ring-2 ring-cyan-400 bg-cyan-50" : "hover:bg-slate-100";
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        Правильно связаны ТОЛЬКО одна пара label+input (у них совпадают for и id, хотя в этой игре код не
        виден — просто попробуй кликнуть на label и посмотреть, какое поле подсветится). Кликни по label, а потом
        по полю, которое, как ты думаешь, с ним связано — у ВЕРНОЙ пары поле подсветится само.
      </p>
      <div className="space-y-4 rounded-2xl bg-white p-4 shadow-inner">
        <div>
          <p className={`cursor-pointer rounded px-1 text-sm font-bold text-slate-700 ${cls("label-a")}`} onClick={() => pick("label-a")}>
            Имя
          </p>
          <input readOnly placeholder="поле А" className={`mt-1 w-full rounded-lg border-2 px-3 py-1.5 text-sm ${picked.includes("label-a") ? "border-rose-300" : "border-slate-200"}`} />
          {picked.includes("label-a") && <p className="mt-1 text-xs font-semibold text-rose-500">for у этого label указывает на ДРУГОЕ поле — не связано.</p>}
        </div>
        <div>
          <p className={`cursor-pointer rounded px-1 text-sm font-bold text-slate-700 ${cls("label-b")}`} onClick={() => pick("label-b")}>
            Телефон
          </p>
          <input readOnly placeholder="поле Б" className={`mt-1 w-full rounded-lg border-2 px-3 py-1.5 text-sm ${picked.includes("label-b") ? "border-emerald-400 bg-emerald-50" : "border-slate-200"}`} />
          {picked.includes("label-b") && <p className="mt-1 text-xs font-semibold text-emerald-600">Связано верно — for совпадает с id этого поля.</p>}
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500">Кликни на label той пары, что связана правильно.</p>
      {!checked && (
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!picked.includes("label-a") && !picked.includes("label-b")}
            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function TypeLabelLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);

  function normalize(s: string) {
    return s.trim().toLowerCase().replace(/\s+/g, " ").replace(/"/g, "'");
  }

  function check() {
    setChecked(true);
    onResult(normalize(text) === normalize('<label for="email">Почта</label>'));
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        Напиши тег label с текстом «Почта», связанный с полем, у которого id="email" (атрибут for должен совпасть с id).
      </p>
      <input
        type="text"
        value={text}
        onChange={(e) => !checked && setText(e.target.value)}
        disabled={checked}
        placeholder='<label for="...">...</label>'
        className="w-full rounded-xl border-2 border-cyan-200 px-3 py-2 font-mono text-sm outline-none focus:border-cyan-400 disabled:opacity-60"
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
  { badge: "выбери из списка", prompt: "Какой текст поля остаётся видимым ДАЖЕ ПОСЛЕ того, как пользователь начал печатать?", explain: "label — не исчезает. placeholder пропадает, как только в поле появляется текст." },
  { badge: "кликни на верную пару", prompt: "", explain: "Правильная связка label↔input держится на совпадении атрибутов for и id." },
  { badge: "напиши сам", prompt: "", explain: '<label for="email">Почта</label> — атрибут for ссылается на id нужного поля.' },
  { badge: "выбери из списка", prompt: "Зачем вообще связывать label с полем через for/id, если можно просто написать текст рядом?", explain: "Клик по label переводит фокус в поле, и это понятнее для людей, использующих программы чтения с экрана." },
];

function Tasks() {
  const stepper = useTaskStepper(4, "form-fields");
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
      {task === 0 && <McqLevel key={task} options={["label", "placeholder", "value", "title"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <PairClickLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && <TypeLabelLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 3 && (
        <McqLevel
          key={task}
          mono={false}
          options={["Просто для красоты", "Чтобы клик по подписи фокусировал поле и это понимали программы экранного доступа", "Это обязательное требование браузера", "Без label форма не отправится"]}
          correctIndex={1}
          onResult={(c) => stepper.markResult(c)}
        />
      )}
    </LevelShell>
  );
}

export function FormFieldsTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="label — подпись, placeholder — подсказка"
        description="Кликни по label в примере — у правильно связанного поля курсор встанет туда сам."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="4 уровня — выбирай, кликай и пиши сам." />
      <Tasks />
    </div>
  );
}
