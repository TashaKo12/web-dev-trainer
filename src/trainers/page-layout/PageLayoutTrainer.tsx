import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { TaskShell } from "../../components/TaskShell";
import { CompletionBanner } from "../../components/CompletionBanner";
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

function Tasks() {
  const stepper = useTaskStepper(5, "page-layout");
  const [mcq, setMcq] = useState<number | null>(null);
  const [clickDone, setClickDone] = useState(false);

  if (stepper.allAnswered) {
    return (
      <CompletionBanner
        score={stepper.score}
        total={5}
        onRestart={() => {
          stepper.restart();
          setMcq(null);
          setClickDone(false);
        }}
      />
    );
  }

  const task = stepper.index;
  const next = () => {
    stepper.goNext();
    setMcq(null);
    setClickDone(false);
  };

  if (task === 0) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt="Чтобы footer всегда был внизу экрана, даже если текста мало, body обычно оформляют так:"
        status={stepper.status}
        onCheck={() => stepper.markResult(mcq === 0)}
        onNext={next}
        checkDisabled={mcq === null}
        isLast={false}
        feedback="display: flex + flex-direction: column на body, а на main — flex: 1."
      >
        <McqOptions
          mono={false}
          options={["display: flex; flex-direction: column;", "position: absolute;", "text-align: center;", "float: left;"]}
          selected={mcq}
          onSelect={setMcq}
          disabled={stepper.status !== "idle"}
        />
      </TaskShell>
    );
  }

  if (task === 1) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt="Какое значение flex у <main> заставляет его растянуться и 'оттолкнуть' footer к низу?"
        status={stepper.status}
        onCheck={() => stepper.markResult(mcq === 1)}
        onNext={next}
        checkDisabled={mcq === null}
        isLast={false}
        feedback="flex: 1 — main забирает всё оставшееся свободное место в колонке."
      >
        <McqOptions mono options={["flex: 0;", "flex: 1;", "flex: none;", "flex: auto 0;"]} selected={mcq} onSelect={setMcq} disabled={stepper.status !== "idle"} />
      </TaskShell>
    );
  }

  if (task === 2) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt="Блок шириной 800px нужно центрировать по горизонтали на странице. Как это обычно делают?"
        status={stepper.status}
        onCheck={() => stepper.markResult(mcq === 1)}
        onNext={next}
        checkDisabled={mcq === null}
        isLast={false}
        feedback="margin: 0 auto; — при заданной ширине блок сам встанет по центру."
      >
        <McqOptions mono options={["text-align: center;", "margin: 0 auto;", "padding: auto;", "display: center;"]} selected={mcq} onSelect={setMcq} disabled={stepper.status !== "idle"} />
      </TaskShell>
    );
  }

  if (task === 3) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt={
          <>
            footer не прижимается к низу, хотя body уже{" "}
            <code className="rounded bg-slate-100 px-1">display: flex; flex-direction: column;</code>. Чего не
            хватает body?
          </>
        }
        status={stepper.status}
        onCheck={() => stepper.markResult(mcq === 2)}
        onNext={next}
        checkDisabled={mcq === null}
        isLast={false}
        feedback="min-height: 100vh — без неё body высотой ровно по контенту, и flex-колонке просто некуда растягиваться."
      >
        <McqOptions mono options={["color: red;", "overflow: hidden;", "min-height: 100vh;", "font-size: 16px;"]} selected={mcq} onSelect={setMcq} disabled={stepper.status !== "idle"} />
      </TaskShell>
    );
  }

  return (
    <TaskShell
      index={task}
      total={5}
      statuses={stepper.statuses}
      prompt="Кликни по элементу разметки, которому нужно свойство flex: 1."
      status={clickDone ? stepper.status : "idle"}
      onCheck={() => {}}
      checkDisabled
      hideCheck
      onNext={next}
      isLast
      feedback="main растягивается (flex: 1) между header и footer, прижимая footer к низу."
    >
      <LayoutClickTask
        onResult={(correct) => {
          setClickDone(true);
          stepper.markResult(correct);
        }}
      />
    </TaskShell>
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
      <SectionHeading kicker="Практика" title="Закрепим" description="5 заданий про макет страницы." />
      <Tasks />
    </div>
  );
}
