import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { TaskShell } from "../../components/TaskShell";
import { CompletionBanner } from "../../components/CompletionBanner";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "box-model")!;

function Theory() {
  const [margin, setMargin] = useState(16);
  const [border, setBorder] = useState(4);
  const [padding, setPadding] = useState(12);
  const contentW = 120;
  const contentH = 60;

  const borderBoxW = contentW + padding * 2 + border * 2;
  const totalFootprintW = borderBoxW + margin * 2;

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-6 text-slate-600">
        Подвигай ползунки — размеры слоёв реально поменяются, как в настоящем
        CSS. Каждый блок состоит из содержимого, отступа внутри (padding),
        рамки (border) и отступа снаружи (margin).
      </p>

      <div className="grid gap-8 sm:grid-cols-[1fr_auto]">
        <div className="space-y-5">
          <Slider label="margin (снаружи)" color="text-amber-600" value={margin} max={40} onChange={setMargin} />
          <Slider label="border (рамка)" color="text-orange-700" value={border} max={16} onChange={setBorder} />
          <Slider label="padding (внутри)" color="text-sky-600" value={padding} max={40} onChange={setPadding} />

          <div className="rounded-2xl bg-slate-50 p-4 font-mono text-sm text-slate-600">
            ширина блока с рамкой = {contentW} + 2×{padding} + 2×{border} ={" "}
            <span className="font-bold text-slate-800">{borderBoxW}px</span>
            <br />
            занимаемое место (с margin) = {borderBoxW} + 2×{margin} ={" "}
            <span className="font-bold text-slate-800">{totalFootprintW}px</span>
          </div>
        </div>

        <div className="flex items-center justify-center overflow-auto rounded-2xl bg-slate-100 p-6">
          <div
            style={{ padding: margin }}
            className="rounded-sm border border-dashed border-amber-400 bg-amber-50"
          >
            <div
              style={{ borderWidth: border }}
              className="border-solid border-orange-400 bg-orange-100"
            >
              <div style={{ padding }} className="bg-sky-100">
                <div
                  style={{ width: contentW, height: contentH }}
                  className="flex items-center justify-center bg-white text-center text-xs font-bold text-slate-500"
                >
                  content
                  <br />
                  {contentW}×{contentH}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  color,
  value,
  max,
  onChange,
}: {
  label: string;
  color: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className={`mb-1 flex justify-between text-sm font-bold ${color}`}>
        <span>{label}</span>
        <span>{value}px</span>
      </span>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-current"
      />
    </label>
  );
}

function LayerClickTask({ onResult }: { onResult: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  function pick(layer: string) {
    if (checked) return;
    setSelected(layer);
  }

  function check() {
    setChecked(true);
    onResult(selected === "padding");
  }

  const layers = [
    { id: "margin", label: "margin", cls: "bg-amber-50 border-2 border-dashed border-amber-400" },
    { id: "border", label: "border", cls: "bg-orange-100 border-2 border-orange-400" },
    { id: "padding", label: "padding", cls: "bg-sky-100" },
    { id: "content", label: "content", cls: "bg-white" },
  ];

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        Нажми на тот слой диаграммы, который называется <strong>padding</strong>.
      </p>
      <div className="flex justify-center">
        <div className={`${layers[0].cls} p-5`} onClick={() => pick("margin")}>
          <div className={`${layers[1].cls} p-3`} onClick={(e) => { e.stopPropagation(); pick("border"); }}>
            <div className={`${layers[2].cls} p-4`} onClick={(e) => { e.stopPropagation(); pick("padding"); }}>
              <div
                className={`${layers[3].cls} flex h-14 w-28 items-center justify-center text-xs font-bold text-slate-400`}
                onClick={(e) => {
                  e.stopPropagation();
                  pick("content");
                }}
              >
                content
              </div>
            </div>
          </div>
        </div>
      </div>
      {selected && (
        <p className="mt-3 text-center text-sm font-bold text-indigo-600">
          Выбрано: {selected} {checked && (selected === "padding" ? "✅" : "❌")}
        </p>
      )}
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!selected}
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function Tasks() {
  const stepper = useTaskStepper(5, "box-model");
  const [mcq, setMcq] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [layerDone, setLayerDone] = useState(false);

  if (stepper.allAnswered) {
    return (
      <CompletionBanner
        score={stepper.score}
        total={5}
        onRestart={() => {
          stepper.restart();
          setMcq(null);
          setText("");
          setLayerDone(false);
        }}
      />
    );
  }

  const task = stepper.index;
  const next = () => {
    stepper.goNext();
    setMcq(null);
    setText("");
    setLayerDone(false);
  };

  if (task === 0) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt="Какое свойство создаёт пространство МЕЖДУ рамкой (border) и содержимым внутри блока?"
        status={stepper.status}
        onCheck={() => stepper.markResult(mcq === 1)}
        onNext={next}
        checkDisabled={mcq === null}
        isLast={false}
        feedback="padding — внутренний отступ, он раздвигает содержимое от рамки блока."
      >
        <McqOptions options={["margin", "padding", "border", "gap"]} selected={mcq} onSelect={setMcq} disabled={stepper.status !== "idle"} />
      </TaskShell>
    );
  }

  if (task === 1) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt="Какое свойство создаёт пространство СНАРУЖИ блока — между ним и соседними элементами?"
        status={stepper.status}
        onCheck={() => stepper.markResult(mcq === 2)}
        onNext={next}
        checkDisabled={mcq === null}
        isLast={false}
        feedback="margin — внешний отступ, он отодвигает блок от других элементов на странице."
      >
        <McqOptions options={["padding", "border", "margin", "outline"]} selected={mcq} onSelect={setMcq} disabled={stepper.status !== "idle"} />
      </TaskShell>
    );
  }

  if (task === 2) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt={
          <>
            Content = 100px, padding = 10px, border = 5px (значения — на
            каждую сторону). Чему равна ширина самого видимого блока — с
            рамкой, но <u>без учёта margin</u>?
          </>
        }
        status={stepper.status}
        onCheck={() => stepper.markResult(text.trim().replace(/px$/i, "") === "130")}
        onNext={next}
        checkDisabled={!text.trim()}
        isLast={false}
        feedback="100 + 2×10 (padding) + 2×5 (border) = 130px."
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={stepper.status !== "idle"}
          placeholder="Ширина в px"
          className="w-40 rounded-full border-2 border-slate-300 px-4 py-2 text-center font-mono font-semibold text-slate-700 outline-none focus:border-indigo-400 disabled:opacity-60"
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
        prompt="Выбери правильный порядок слоёв блока — от центра (содержимого) наружу:"
        status={stepper.status}
        onCheck={() => stepper.markResult(mcq === 0)}
        onNext={next}
        checkDisabled={mcq === null}
        isLast={false}
        feedback="Правильный порядок: content → padding → border → margin."
      >
        <McqOptions
          mono={false}
          options={[
            "content → padding → border → margin",
            "content → border → padding → margin",
            "margin → border → padding → content",
            "padding → content → border → margin",
          ]}
          selected={mcq}
          onSelect={setMcq}
          disabled={stepper.status !== "idle"}
        />
      </TaskShell>
    );
  }

  return (
    <TaskShell
      index={task}
      total={5}
      statuses={stepper.statuses}
      prompt="Кликни по нужному слою на диаграмме."
      status={layerDone ? stepper.status : "idle"}
      onCheck={() => {}}
      checkDisabled
      hideCheck
      onNext={next}
      isLast
      feedback="padding находится сразу вокруг содержимого, внутри рамки (border)."
    >
      <LayerClickTask
        onResult={(correct) => {
          setLayerDone(true);
          stepper.markResult(correct);
        }}
      />
    </TaskShell>
  );
}

export function BoxModelTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} />
      <SectionHeading
        kicker="Теория"
        title="Подвигай слои блока"
        description="margin, border и padding — три слоя вокруг содержимого. Меняй значения и смотри, как складывается итоговый размер."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="5 заданий про box model." />
      <Tasks />
    </div>
  );
}
