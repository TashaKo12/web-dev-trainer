import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";
import { FileTree } from "./FileTree";
import { ImagePreview } from "./ImagePreview";
import { resolvePath } from "./resolvePath";

const meta = trainers.find((t) => t.id === "image-paths")!;

const EXAMPLES = ["cat.jpg", "images/sunset.jpg", "images/forest.jpg", "../cat.jpg", "/images/sunset.jpg", "Logo.png"];

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

type Level = {
  mode: "choose" | "type";
  openFile: "index.html" | "pages/about.html";
  target: string;
  external?: boolean;
  options?: string[];
  prefill?: string;
  prompt: string;
  badge: string;
  explain: string;
};

const LEVELS: Level[] = [
  {
    mode: "choose",
    openFile: "index.html",
    target: "cat.jpg",
    options: ["cat.jpg", "images/cat.jpg", "/root/cat.jpg"],
    prompt: "cat.jpg и index.html лежат в одной папке — в корне проекта. Выбери верный src и проверь на картинке ниже.",
    badge: "выбери из списка",
    explain: "Если файлы лежат рядом, достаточно просто имени файла — cat.jpg.",
  },
  {
    mode: "choose",
    openFile: "index.html",
    target: "images/sunset.jpg",
    options: ["sunset.jpg", "images/sunset.jpg", "image/sunset.jpg"],
    prompt: "Теперь sunset.jpg лежит в папке images. Выбери верный src.",
    badge: "выбери из списка",
    explain: 'images/sunset.jpg — сначала точное имя папки (с «s» на конце!), потом «/», потом имя файла.',
  },
  {
    mode: "choose",
    openFile: "index.html",
    target: "images/gallery/forest.jpg",
    options: ["images/forest.jpg", "gallery/forest.jpg", "images/gallery/forest.jpg"],
    prompt: "forest.jpg лежит ещё глубже — в папке gallery внутри папки images. Выбери верный src.",
    badge: "выбери из списка",
    explain: "images/gallery/forest.jpg — папка внутри папки, поэтому два «/» подряд: сначала images, потом gallery.",
  },
  {
    mode: "choose",
    openFile: "pages/about.html",
    target: "cat.jpg",
    options: ["cat.jpg", "../cat.jpg", "/pages/cat.jpg"],
    prompt: "Открыт pages/about.html — он лежит во вложенной папке pages. Нужно показать cat.jpg из корня проекта. Выбери верный src.",
    badge: "выбери из списка",
    explain: "../cat.jpg — about.html лежит в папке pages, поэтому сначала поднимаемся на уровень выше (..), а потом ищем cat.jpg.",
  },
  {
    mode: "type",
    openFile: "pages/about.html",
    target: "images/sunset.jpg",
    prompt: "Снова открыт pages/about.html. Напиши сам путь к sunset.jpg, который лежит в images/ в корне проекта.",
    badge: "напиши сам",
    explain: "../images/sunset.jpg (или /images/sunset.jpg) — сначала выходим из pages, потом заходим в images.",
  },
  {
    mode: "type",
    openFile: "pages/about.html",
    target: "images/gallery/forest.jpg",
    prompt: "Та же логика, но папка вложена ещё глубже. Напиши путь к forest.jpg.",
    badge: "напиши сам",
    explain: "../images/gallery/forest.jpg — та же идея: сначала «../», потом обычный путь от корня.",
  },
  {
    mode: "type",
    openFile: "index.html",
    target: "https://example.com/photos/sky.jpg",
    external: true,
    prompt: "Нужно вставить фотографию с другого сайта по ссылке https://example.com/photos/sky.jpg. Какой src написать?",
    badge: "напиши сам",
    explain: "Для картинок из интернета путь не вычисляется — ссылку просто вставляют как есть, целиком, вместе с https://.",
  },
  {
    mode: "type",
    openFile: "index.html",
    target: "cat.jpg",
    prefill: "images/cat.jpg",
    prompt: 'Кто-то написал src="images/cat.jpg", но кот не появляется — он лежит не в images! Почини путь.',
    badge: "почини баг",
    explain: "cat.jpg лежит в самом корне проекта, а не в папке images — лишнюю папку нужно убрать из пути.",
  },
  {
    mode: "type",
    openFile: "index.html",
    target: "Logo.png",
    prompt: "В проекте лежит файл Logo.png — с большой буквы Л. Напиши src так, чтобы логотип появился, точно повторив регистр букв.",
    badge: "напиши сам",
    explain: "Logo.png — большие и маленькие буквы должны совпадать ТОЧНО. На Windows это прощается, а на сайте в интернете (например на GitHub Pages) — нет, и картинка пропадёт.",
  },
];

function dirFor(openFile: Level["openFile"]) {
  return openFile === "index.html" ? "" : "pages";
}

function LevelPlayer({ level, onResult }: { level: Level; onResult: (correct: boolean) => void }) {
  const [value, setValue] = useState(level.prefill ?? "");
  const [checked, setChecked] = useState(false);
  const dir = dirFor(level.openFile);

  function check() {
    setChecked(true);
    const correct = level.external ? value.trim() === level.target : resolvePath(dir, value) === level.target;
    onResult(correct);
  }

  return (
    <div>
      <p className="mb-4 text-sm font-semibold text-slate-700">{level.prompt}</p>

      <div className="grid gap-5 sm:grid-cols-[1fr_1.1fr]">
        <FileTree openFile={level.openFile} highlight={level.external ? undefined : [level.target]} />

        <div>
          {level.mode === "choose" ? (
            <div className="mb-3 space-y-2">
              {level.options!.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={checked}
                  onClick={() => setValue(opt)}
                  className={`block w-full rounded-xl border-2 px-3 py-2 text-left font-mono text-xs transition disabled:cursor-not-allowed ${
                    value === opt ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-600 hover:border-teal-200"
                  }`}
                >
                  src="{opt}"
                </button>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => !checked && setValue(e.target.value)}
              disabled={checked}
              placeholder="впиши путь для src"
              className="mb-3 w-full rounded-xl border-2 border-teal-200 px-3 py-2 font-mono text-sm outline-none focus:border-teal-400 disabled:opacity-60"
            />
          )}

          <ImagePreview currentDir={dir} src={value} alt="фото" />
        </div>
      </div>

      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!value.trim()}
            className="rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function Tasks() {
  const stepper = useTaskStepper(LEVELS.length, "image-paths");

  if (stepper.allAnswered) {
    return (
      <CompletionBanner
        score={stepper.score}
        total={LEVELS.length}
        onRestart={() => stepper.restart()}
      />
    );
  }

  const level = LEVELS[stepper.index];

  return (
    <LevelShell
      total={LEVELS.length}
      index={stepper.index}
      statuses={stepper.statuses}
      status={stepper.status}
      isLast={stepper.isLast}
      badge={level.badge}
      explain={level.explain}
      onJump={stepper.goTo}
      onNext={stepper.goNext}
      nextClassName="bg-gradient-to-r from-teal-500 to-emerald-600"
    >
      <LevelPlayer key={stepper.index} level={level} onResult={(correct) => stepper.markResult(correct)} />
    </LevelShell>
  );
}

export function ImagePathsTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="Собери путь к картинке сам"
        description="Впиши src, переключай открытый файл — и смотри вживую, появляется фото или нет."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading
        kicker="Практика"
        title="9 уровней"
        description="Сначала выбираешь путь из списка, потом пишешь сам — и сразу видишь результат на картинке."
      />
      <Tasks />
    </div>
  );
}
