import { useRef, useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { TaskShell } from "../../components/TaskShell";
import { CompletionBanner } from "../../components/CompletionBanner";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";
import { FakePage, computeMatches } from "./FakePage";

const meta = trainers.find((t) => t.id === "selectors")!;

const EXAMPLES = ["nav a", ".card", "#site-footer", "li:first-child", "[data-featured]"];

function Theory() {
  const [selector, setSelector] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const { keys, error } = computeMatches(containerRef.current, selector);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-5 text-slate-600">
        Это мини-страница. Введи CSS-селектор — все элементы, которые ему
        соответствуют, подсветятся розовым прямо на странице.
      </p>

      <input
        type="text"
        value={selector}
        onChange={(e) => setSelector(e.target.value)}
        placeholder="например: .nav-link"
        className="mb-2 w-full rounded-xl border-2 border-fuchsia-200 px-4 py-2.5 font-mono text-sm outline-none focus:border-fuchsia-400"
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setSelector(ex)}
            className="rounded-full bg-fuchsia-50 px-3 py-1 font-mono text-xs font-semibold text-fuchsia-600 hover:bg-fuchsia-100"
          >
            {ex}
          </button>
        ))}
      </div>
      {error && <p className="mb-3 text-sm font-semibold text-rose-500">{error}</p>}

      <div ref={containerRef}>
        <FakePage matchedKeys={keys} />
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {selector.trim() ? (
          <>
            Совпадений: <strong>{keys.size}</strong>
          </>
        ) : (
          "Начни вводить селектор, чтобы увидеть подсветку."
        )}
      </p>
    </div>
  );
}

type Challenge = {
  prompt: string;
  target: string[];
  explain: string;
};

const CHALLENGES: Challenge[] = [
  {
    prompt: "Напиши селектор, который выберет только активную ссылку в меню (обведена зелёной пунктирной линией).",
    target: ["a1"],
    explain: "Подойдёт, например, .active или a.nav-link.active — у этой ссылки есть класс active, которого нет у других.",
  },
  {
    prompt: "Напиши селектор, который выберет сразу все ссылки в меню.",
    target: ["a1", "a2", "a3"],
    explain: "Подойдёт .nav-link (у всех ссылок есть этот класс) или nav a (любая ссылка внутри nav).",
  },
  {
    prompt: "Напиши селектор, который выберет только избранную (featured) статью.",
    target: ["art1"],
    explain: "Подойдёт .featured или [data-featured] — у первой статьи есть и класс, и атрибут, которых нет у остальных.",
  },
  {
    prompt: "Напиши селектор, который выберет заголовки (h2) всех статей внутри <main>.",
    target: ["h2-1", "h2-2", "h2-3"],
    explain: "Подойдёт main h2 или article h2 — любой h2, вложенный в нужного родителя.",
  },
  {
    prompt: "Напиши селектор, который выберет все пункты меню (li), не затрагивая сами ссылки внутри них.",
    target: ["li1", "li2", "li3"],
    explain: "Подойдёт .nav-item или nav li — тег li сам по себе, без a внутри.",
  },
];

function setsEqual(a: Set<string>, b: string[]) {
  if (a.size !== b.length) return false;
  return b.every((k) => a.has(k));
}

function SelectorChallenge({
  challenge,
  onResult,
}: {
  challenge: Challenge;
  onResult: (correct: boolean) => void;
}) {
  const [selector, setSelector] = useState("");
  const [checked, setChecked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { keys, error } = computeMatches(containerRef.current, selector);
  const targetSet = new Set(challenge.target);

  function check() {
    setChecked(true);
    onResult(setsEqual(keys, challenge.target));
  }

  return (
    <div>
      <p className="mb-3 text-xs text-slate-400">
        Пунктирная зелёная рамка показывает, какие элементы нужно выбрать.
      </p>
      <input
        type="text"
        value={selector}
        onChange={(e) => !checked && setSelector(e.target.value)}
        disabled={checked}
        placeholder="твой селектор"
        className="mb-3 w-full rounded-xl border-2 border-fuchsia-200 px-4 py-2.5 font-mono text-sm outline-none focus:border-fuchsia-400 disabled:opacity-60"
      />
      {error && <p className="mb-2 text-sm font-semibold text-rose-500">{error}</p>}
      <div ref={containerRef}>
        <FakePage targetKeys={targetSet} matchedKeys={keys} />
      </div>
      {!checked && (
        <button
          type="button"
          onClick={check}
          disabled={!selector.trim()}
          className="mt-4 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
        >
          Проверить
        </button>
      )}
    </div>
  );
}

function Tasks() {
  const stepper = useTaskStepper(5, "selectors");
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

  const challenge = CHALLENGES[stepper.index];

  return (
    <TaskShell
      index={stepper.index}
      total={5}
      statuses={stepper.statuses}
      prompt={challenge.prompt}
      status={done ? stepper.status : "idle"}
      onCheck={() => {}}
      checkDisabled
      hideCheck
      onNext={() => {
        stepper.goNext();
        setDone(false);
      }}
      isLast={stepper.isLast}
      feedback={challenge.explain}
    >
      <SelectorChallenge
        key={stepper.index}
        challenge={challenge}
        onResult={(correct) => {
          setDone(true);
          stepper.markResult(correct);
        }}
      />
    </TaskShell>
  );
}

export function SelectorsTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} />
      <SectionHeading
        kicker="Теория"
        title="Подсвети нужные элементы"
        description="Пиши селекторы в поле — страница ниже сама покажет, что они выбирают."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="5 заданий — попади селектором точно в цель." />
      <Tasks />
    </div>
  );
}
