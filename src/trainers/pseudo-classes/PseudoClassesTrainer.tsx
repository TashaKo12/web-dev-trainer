import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "pseudo-classes")!;

function Theory() {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  const state = active ? "active" : hovered ? "hover" : "обычное";

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-6 text-slate-600">
        Наведи курсор на карточку — сработает <code className="rounded bg-slate-100 px-1">:hover</code>. Нажми и
        удерживай кнопку мыши — сработает <code className="rounded bg-slate-100 px-1">:active</code>.
      </p>

      <div className="grid gap-6 sm:grid-cols-[1fr_1fr]">
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => {
            setHovered(false);
            setActive(false);
          }}
          onMouseDown={() => setActive(true)}
          onMouseUp={() => setActive(false)}
          className={`flex h-56 cursor-pointer select-none items-center justify-center rounded-2xl border-2 text-center transition-all ${
            active
              ? "scale-95 border-pink-600 bg-pink-200"
              : hovered
                ? "border-pink-400 bg-pink-100"
                : "border-dashed border-pink-200 bg-pink-50"
          }`}
        >
          <div>
            <p className="text-sm text-pink-700">Текущее состояние:</p>
            <p className="text-xl font-extrabold text-pink-800">{state}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 font-mono text-xs text-slate-600">
          <p className="mb-2 text-slate-400">// обычное состояние</p>
          <p className="mb-3">.card {"{"} background: #fdf2f8; {"}"}</p>
          <p className="mb-2 text-slate-400">// курсор наведён, кнопка не нажата</p>
          <p className="mb-3">.card:hover {"{"} background: #fbcfe8; {"}"}</p>
          <p className="mb-2 text-slate-400">// кнопка мыши зажата прямо сейчас</p>
          <p>.card:active {"{"} background: #f9a8d4; {"}"}</p>
        </div>
      </div>
    </div>
  );
}

function HoverCard({
  label,
  onHover,
}: {
  label: string;
  onHover: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => {
        setHovered(true);
        onHover();
      }}
      onMouseLeave={() => setHovered(false)}
      className={`flex h-24 w-full cursor-pointer items-center justify-center rounded-xl border-2 text-sm font-bold transition ${
        hovered ? "border-pink-500 bg-pink-200 text-pink-800" : "border-slate-200 bg-white text-slate-500"
      }`}
    >
      {label}
    </div>
  );
}

function HoverPickTask({ onResult }: { onResult: (correct: boolean) => void }) {
  const [lastHovered, setLastHovered] = useState<"a" | "b" | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(lastHovered === "a");
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        Карточка А меняется от <code className="rounded bg-slate-100 px-1">:hover</code> (просто наведение).
        Карточка Б меняется только от <code className="rounded bg-slate-100 px-1">:active</code> (клик и
        удержание). Наведи курсор (без клика) на обе и выбери ту, что сработала.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <HoverCard label="Карточка А" onHover={() => !checked && setLastHovered("a")} />
        <HoverCard label="Карточка Б" onHover={() => !checked && setLastHovered("b")} />
      </div>
      {lastHovered && (
        <p className="mt-3 text-center text-sm font-bold text-pink-600">
          Последняя наведённая: карточка {lastHovered === "a" ? "А" : "Б"}
        </p>
      )}
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!lastHovered}
            className="rounded-full bg-gradient-to-r from-pink-500 to-rose-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
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
            className="rounded-full bg-gradient-to-r from-pink-500 to-rose-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function OpacityPredictTask({ onResult }: { onResult: (correct: boolean) => void }) {
  const [choice, setChoice] = useState<"visible" | "hidden" | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(choice === "visible");
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        У этой карточки есть правило <code className="rounded bg-slate-100 px-1">.card:hover {"{"} opacity: 0; {"}"}</code>.
        Не наводи на неё курсор — просто посмотри и ответь, видна ли она сейчас.
      </p>
      <div className="group mb-4 flex h-20 items-center justify-center rounded-xl border-2 border-pink-200 bg-pink-50 text-sm font-bold text-pink-700 transition hover:opacity-0">
        Карточка
      </div>
      <div className="flex justify-center gap-3">
        <button
          type="button"
          disabled={checked}
          onClick={() => setChoice("visible")}
          className={`rounded-xl border-2 px-5 py-2 text-sm font-bold transition disabled:cursor-not-allowed ${
            choice === "visible" ? "border-pink-500 bg-pink-50 text-pink-700" : "border-slate-200 text-slate-500 hover:border-pink-200"
          }`}
        >
          Видна
        </button>
        <button
          type="button"
          disabled={checked}
          onClick={() => setChoice("hidden")}
          className={`rounded-xl border-2 px-5 py-2 text-sm font-bold transition disabled:cursor-not-allowed ${
            choice === "hidden" ? "border-pink-500 bg-pink-50 text-pink-700" : "border-slate-200 text-slate-500 hover:border-pink-200"
          }`}
        >
          Прозрачна
        </button>
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!choice}
            className="rounded-full bg-gradient-to-r from-pink-500 to-rose-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const TASK_META = [
  { badge: "выбери из списка", prompt: "Какой псевдокласс срабатывает, когда курсор мыши просто НАВЕДЁН на элемент (без клика)?", explain: ":hover — состояние наведения курсора." },
  { badge: "выбери из списка", prompt: "Какой псевдокласс срабатывает, пока кнопка мыши ЗАЖАТА на элементе (ещё не отпущена)?", explain: ":active — состояние нажатия, действует только в момент удержания кнопки мыши." },
  {
    badge: "посмотри и ответь",
    prompt: "",
    explain: "Без наведения правило :hover не действует — карточка видна как обычно (opacity: 1 по умолчанию). Если ты случайно навёл на неё курсор, читая задание, — она и правда стала прозрачной, вот и весь смысл :hover!",
  },
  { badge: "выбери из списка", prompt: "Как правильно написать селектор для состояния наведения на элемент с классом .card?", explain: ".card:hover — класс и псевдокласс пишутся слитно, без пробела." },
  { badge: "наведи на карточки", prompt: "Проверь на практике разницу между :hover и :active.", explain: ":hover реагирует на простое наведение курсора, а :active — только на нажатие кнопки мыши." },
];

function Tasks() {
  const stepper = useTaskStepper(5, "pseudo-classes");
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
      nextClassName="bg-gradient-to-r from-pink-500 to-rose-600"
    >
      {meta.prompt && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <McqLevel key={task} options={[":hover", ":active", ":focus", ":visited"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <McqLevel key={task} options={[":hover", ":link", ":active", ":checked"]} correctIndex={2} onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && <OpacityPredictTask key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 3 && <McqLevel key={task} options={[".card:hover", ".card-hover", ":hover.card", ".card::hover"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 4 && <HoverPickTask key={task} onResult={(c) => stepper.markResult(c)} />}
    </LevelShell>
  );
}

export function PseudoClassesTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} />
      <SectionHeading
        kicker="Теория"
        title="Наведи, нажми, посмотри"
        description=":hover срабатывает от наведения курсора, :active — от нажатия кнопки мыши."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="5 уровней — выбирай, наблюдай и наводи курсор." />
      <Tasks />
    </div>
  );
}
