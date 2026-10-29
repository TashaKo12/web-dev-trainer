import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "page-layout")!;

function Theory() {
  const [sticky, setSticky] = useState(false);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-5 text-slate-600">
        На странице мало текста — без исправления footer «прилипает» прямо под текстом, а не к низу экрана.
        Включи галочку, чтобы применить приём с flexbox.
      </p>

      <label className="mb-4 flex items-center gap-2 text-sm font-bold text-indigo-700">
        <input type="checkbox" checked={sticky} onChange={(e) => setSticky(e.target.checked)} />
        body {"{"} display: flex; flex-direction: column; {"}"} + main {"{"} flex: 1; {"}"}
      </label>

      <div
        style={{ height: 260, display: sticky ? "flex" : "block", flexDirection: "column" }}
        className="overflow-hidden rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40"
      >
        <div className="bg-indigo-600 px-4 py-2 text-center text-xs font-bold text-white">header</div>
        <div style={sticky ? { flex: 1 } : undefined} className="bg-white px-4 py-3 text-center text-xs text-slate-500">
          main (мало текста)
        </div>
        <div className="bg-indigo-800 px-4 py-2 text-center text-xs font-bold text-white">footer</div>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {sticky
          ? "main получил flex: 1 и растянулся, забрав всё свободное место — footer сам уехал к самому низу."
          : "Без flex: 1 на main footer остаётся сразу под текстом — внизу экрана пустое пространство."}
      </p>
    </div>
  );
}

type ZoneKey = "header" | "main" | "footer";

function LayoutClickTask({ onResult }: { onResult: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<ZoneKey | null>(null);
  const [checked, setChecked] = useState(false);

  function cls(key: ZoneKey, base: string) {
    const isSel = selected === key;
    return `${base} cursor-pointer transition ${isSel ? "ring-2 ring-indigo-600" : ""}`;
  }

  function check() {
    setChecked(true);
    onResult(selected === "main");
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        Чтобы footer прижался к низу, свойство <code className="rounded bg-slate-100 px-1">flex: 1</code> нужно
        поставить на один конкретный элемент разметки. Кликни на него.
      </p>
      <div className="flex flex-col overflow-hidden rounded-2xl border-2 border-slate-200">
        <div className={cls("header", "bg-indigo-600 px-4 py-3 text-center text-xs font-bold text-white")} onClick={() => !checked && setSelected("header")}>
          header
        </div>
        <div className={cls("main", "bg-white px-4 py-8 text-center text-xs text-slate-500")} onClick={() => !checked && setSelected("main")}>
          main
        </div>
        <div className={cls("footer", "bg-indigo-800 px-4 py-3 text-center text-xs font-bold text-white")} onClick={() => !checked && setSelected("footer")}>
          footer
        </div>
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!selected}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-blue-700 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
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
            className="rounded-full bg-gradient-to-r from-indigo-500 to-blue-700 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const TASK_META = [
  { badge: "выбери из списка", prompt: "Чтобы footer всегда был внизу экрана, даже если текста мало, body обычно оформляют так:", explain: "display: flex + flex-direction: column на body, а на main — flex: 1." },
  { badge: "выбери из списка", prompt: "Какое значение flex у <main> заставляет его растянуться и 'оттолкнуть' footer к низу?", explain: "flex: 1 — main забирает всё оставшееся свободное место в колонке." },
  { badge: "выбери из списка", prompt: "Блок шириной 800px нужно центрировать по горизонтали на странице. Как это обычно делают?", explain: "margin: 0 auto; — при заданной ширине блок сам встанет по центру." },
  {
    badge: "выбери из списка",
    prompt: (
      <>
        footer не прижимается к низу, хотя body уже{" "}
        <code className="rounded bg-slate-100 px-1">display: flex; flex-direction: column;</code>. Чего не хватает
        body?
      </>
    ),
    explain: "min-height: 100vh — без неё body высотой ровно по контенту, и flex-колонке просто некуда растягиваться.",
  },
  { badge: "кликни по макету", prompt: "Кликни по элементу разметки, которому нужно свойство flex: 1.", explain: "main растягивается (flex: 1) между header и footer, прижимая footer к низу." },
];

function Tasks() {
  const stepper = useTaskStepper(5, "page-layout");
  const task = stepper.index;
  const meta = TASK_META[task];

  if (stepper.allAnswered) {
    return <CompletionBanner score={stepper.score} total={5} onRestart={() => stepper.restart()} />;
  }

  return (
    <LevelShell
      total={5}
      index={task}
      statuses={stepper.statuses}
      status={stepper.status}
      isLast={stepper.isLast}
      badge={meta.badge}
      explain={meta.explain}
      onJump={stepper.goTo}
      onNext={stepper.goNext}
      nextClassName="bg-gradient-to-r from-indigo-500 to-blue-700"
    >
      <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>
      {task === 0 && <McqLevel key={task} mono={false} options={["display: flex; flex-direction: column;", "position: absolute;", "text-align: center;", "float: left;"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <McqLevel key={task} options={["flex: 0;", "flex: 1;", "flex: none;", "flex: auto 0;"]} correctIndex={1} onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && <McqLevel key={task} options={["text-align: center;", "margin: 0 auto;", "padding: auto;", "display: center;"]} correctIndex={1} onResult={(c) => stepper.markResult(c)} />}
      {task === 3 && <McqLevel key={task} options={["color: red;", "overflow: hidden;", "min-height: 100vh;", "font-size: 16px;"]} correctIndex={2} onResult={(c) => stepper.markResult(c)} />}
      {task === 4 && <LayoutClickTask key={task} onResult={(c) => stepper.markResult(c)} />}
    </LevelShell>
  );
}

export function PageLayoutTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} />
      <SectionHeading
        kicker="Теория"
        title="Прижми footer к низу страницы"
        description="header, main и footer — классический скелет страницы. flexbox помогает footer не 'зависать' посреди экрана."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="5 уровней — выбирай из списка и кликай по макету." />
      <Tasks />
    </div>
  );
}
