import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { TaskShell } from "../../components/TaskShell";
import { CompletionBanner } from "../../components/CompletionBanner";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";
import { FileTree } from "./FileTree";
import { ImagePreview } from "./ImagePreview";
import { resolvePath } from "./resolvePath";

const meta = trainers.find((t) => t.id === "image-paths")!;

const EXAMPLES = ["cat.jpg", "images/sunset.jpg", "images/forest.jpg", "../cat.jpg", "/images/sunset.jpg"];

function Theory() {
  const [openFile, setOpenFile] = useState<"index.html" | "pages/about.html">("index.html");
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("Фото кота");
  const currentDir = openFile === "index.html" ? "" : "pages";

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <div className="mb-5 space-y-3 text-sm leading-relaxed text-slate-600">
        <p>
          Путь в <code className="rounded bg-slate-100 px-1">src</code> браузер читает{" "}
          <strong>не от корня компьютера</strong>, а от папки, в которой лежит ТЕКУЩИЙ открытый HTML-файл. Если
          картинка лежит рядом — достаточно просто её имени. Если в папке ниже — нужно дописать имя папки и «/».
          Если нужно подняться на уровень выше — пишут{" "}
          <code className="rounded bg-slate-100 px-1">../</code>.
        </p>
      </div>

      <div className="mb-5">
        <span className="mb-1 block text-sm font-bold text-teal-700">Какой HTML-файл сейчас открыт в браузере?</span>
        <div className="flex gap-2">
          {(["index.html", "pages/about.html"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setOpenFile(f)}
              className={`rounded-full border-2 px-4 py-1.5 font-mono text-xs font-bold transition ${
                openFile === f ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-500 hover:border-teal-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-[1fr_1.2fr]">
        <FileTree openFile={openFile} />

        <div>
          <label className="mb-2 block text-sm">
            <span className="mb-1 block font-bold text-teal-700">
              &lt;img src="<span className="underline decoration-dotted">___</span>" alt="..."&gt;
            </span>
            <input
              type="text"
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              placeholder='например: images/sunset.jpg'
              className="w-full rounded-xl border-2 border-teal-200 px-3 py-2 font-mono text-sm outline-none focus:border-teal-400"
            />
          </label>

          <div className="mb-3 flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setSrc(ex)}
                className="rounded-full bg-teal-50 px-3 py-1 font-mono text-xs font-semibold text-teal-600 hover:bg-teal-100"
              >
                {ex}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="alt (текст на случай, если фото не загрузится)"
            className="mb-3 w-full rounded-xl border-2 border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-teal-300"
          />

          <ImagePreview currentDir={currentDir} src={src} alt={alt} />
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-teal-50 p-4 text-sm text-teal-800">
        Переключи открытый файл на <code className="rounded bg-white px-1">pages/about.html</code> и попробуй тот
        же путь ещё раз — результат изменится! Путь всегда считается от файла, который сейчас открыт, а не от
        самой картинки.
      </div>
    </div>
  );
}

function PathChallenge({
  currentDir,
  target,
  prompt,
  onResult,
}: {
  currentDir: string;
  target: string;
  prompt: string;
  onResult: (correct: boolean) => void;
}) {
  const [src, setSrc] = useState("");
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(resolvePath(currentDir, src) === target);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">{prompt}</p>
      <input
        type="text"
        value={src}
        onChange={(e) => !checked && setSrc(e.target.value)}
        disabled={checked}
        placeholder="впиши путь для src"
        className="mb-3 w-full rounded-xl border-2 border-teal-200 px-3 py-2 font-mono text-sm outline-none focus:border-teal-400 disabled:opacity-60"
      />
      <ImagePreview currentDir={currentDir} src={src} alt="фото" />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!src.trim()}
            className="rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function Tasks() {
  const stepper = useTaskStepper(5, "image-paths");
  const [mcq, setMcq] = useState<number | null>(null);
  const [challengeDone, setChallengeDone] = useState(false);

  if (stepper.allAnswered) {
    return (
      <CompletionBanner
        score={stepper.score}
        total={5}
        onRestart={() => {
          stepper.restart();
          setMcq(null);
          setChallengeDone(false);
        }}
      />
    );
  }

  const task = stepper.index;
  const next = () => {
    stepper.goNext();
    setMcq(null);
    setChallengeDone(false);
  };

  if (task === 0) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt="index.html и cat.jpg лежат в одной и той же папке (в корне проекта). Какой src будет верным?"
        status={stepper.status}
        onCheck={() => stepper.markResult(mcq === 0)}
        onNext={next}
        checkDisabled={mcq === null}
        isLast={false}
        feedback="cat.jpg — если файлы лежат рядом, достаточно просто имени файла."
      >
        <McqOptions mono options={["cat.jpg", "images/cat.jpg", "/root/cat.jpg", "./images/cat.jpg"]} selected={mcq} onSelect={setMcq} disabled={stepper.status !== "idle"} />
      </TaskShell>
    );
  }

  if (task === 1) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt="Открыт index.html (в корне). Картинка sunset.jpg лежит в папке images. Какой src подойдёт?"
        status={stepper.status}
        onCheck={() => stepper.markResult(mcq === 1)}
        onNext={next}
        checkDisabled={mcq === null}
        isLast={false}
        feedback="images/sunset.jpg — сначала имя папки, потом «/», потом имя файла."
      >
        <McqOptions mono options={["sunset.jpg", "images/sunset.jpg", "/sunset.jpg", "images\\sunset.jpg"]} selected={mcq} onSelect={setMcq} disabled={stepper.status !== "idle"} />
      </TaskShell>
    );
  }

  if (task === 2) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt="Почини путь — сейчас картинка не появляется."
        status={challengeDone ? stepper.status : "idle"}
        onCheck={() => {}}
        checkDisabled
        hideCheck
        onNext={next}
        isLast={false}
        feedback='Верно: ../cat.jpg. Файл about.html лежит в папке pages, поэтому сначала нужно подняться на уровень выше (../), а потом искать cat.jpg в корне.'
      >
        <PathChallenge
          currentDir="pages"
          target="cat.jpg"
          prompt="Сейчас открыт pages/about.html. Напиши путь к cat.jpg, который лежит в корне проекта (на уровень выше)."
          onResult={(correct) => {
            setChallengeDone(true);
            stepper.markResult(correct);
          }}
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
        prompt={
          <>
            На твоём компьютере файл называется <code className="rounded bg-slate-100 px-1">Cat.JPG</code> (с
            большими буквами), а в коде написано{" "}
            <code className="rounded bg-slate-100 px-1">src="cat.jpg"</code>. Локально всё работает. Что будет,
            когда сайт выложат на GitHub Pages?
          </>
        }
        status={stepper.status}
        onCheck={() => stepper.markResult(mcq === 1)}
        onNext={next}
        checkDisabled={mcq === null}
        isLast={false}
        feedback="Windows не различает регистр букв в именах файлов, а серверы в интернете (как GitHub Pages) — различают. Поэтому картинка пропадёт, хотя на компьютере всё было в порядке."
      >
        <McqOptions
          mono={false}
          options={["Картинка тоже будет видна", "Картинка может пропасть — большие и маленькие буквы важны", "Сайт вообще не откроется", "Браузер сам исправит имя файла"]}
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
      prompt="Последнее задание — самый длинный путь."
      status={challengeDone ? stepper.status : "idle"}
      onCheck={() => {}}
      checkDisabled
      hideCheck
      onNext={next}
      isLast
      feedback="images/gallery/forest.jpg — папка внутри папки, поэтому два «/» подряд."
    >
      <PathChallenge
        currentDir=""
        target="images/gallery/forest.jpg"
        prompt="Открыт index.html. Напиши путь к forest.jpg, который лежит в images/gallery/."
        onResult={(correct) => {
          setChallengeDone(true);
          stepper.markResult(correct);
        }}
      />
    </TaskShell>
  );
}

export function ImagePathsTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} />
      <SectionHeading
        kicker="Теория"
        title="Собери путь к картинке сам"
        description="Впиши src, переключай открытый файл — и смотри вживую, появляется фото или нет."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="5 заданий про пути к изображениям." />
      <Tasks />
    </div>
  );
}
