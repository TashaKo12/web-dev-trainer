import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "images")!;

function Theory() {
  const [broken, setBroken] = useState(false);
  const [alt, setAlt] = useState("Фото рыжего кота");
  const [width, setWidth] = useState(140);
  const [height, setHeight] = useState(100);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-5 text-slate-600">
        У тега <code className="rounded bg-slate-100 px-1">img</code> нет закрывающего тега. src — откуда взять
        картинку, alt — текст на случай, если она не загрузится, width/height — размер в пикселях.
      </p>

      <div className="grid gap-5 sm:grid-cols-[1fr_1.1fr]">
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold text-pink-700">
            <input type="checkbox" checked={broken} onChange={(e) => setBroken(e.target.checked)} />
            картинка не загрузилась (как будто 404)
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-bold text-pink-700">alt</span>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="w-full rounded-lg border-2 border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-pink-300"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 flex justify-between font-bold text-pink-700">
              <span>width</span>
              <span>{width}px</span>
            </span>
            <input type="range" min={60} max={220} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full accent-pink-600" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 flex justify-between font-bold text-pink-700">
              <span>height</span>
              <span>{height}px</span>
            </span>
            <input type="range" min={60} max={220} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full accent-pink-600" />
          </label>
        </div>

        <div className="flex items-center justify-center rounded-2xl bg-slate-100 p-6">
          {broken ? (
            <div
              style={{ width, height }}
              className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-rose-300 bg-rose-50 px-3 text-center"
            >
              <span className="text-2xl">🖼️🚫</span>
              <span className="text-xs italic text-rose-500">{alt || "(alt пустой)"}</span>
            </div>
          ) : (
            <div style={{ width, height }} className="flex items-center justify-center rounded-xl bg-amber-200 text-3xl">
              🐱
            </div>
          )}
        </div>
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
            className="rounded-full bg-gradient-to-r from-pink-500 to-rose-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function BrokenAltTask({ onResult }: { onResult: (correct: boolean) => void }) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(text.trim().toLowerCase() === "мой рыжий кот");
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        Код: <code className="rounded bg-slate-100 px-1">&lt;img src="cat.png" alt="Мой рыжий кот"&gt;</code>.
        Файл cat.png не нашёлся. Напиши, какой текст появится на странице ВМЕСТО картинки.
      </p>
      <div className="mb-4 flex h-24 w-40 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-rose-300 bg-rose-50">
        <span className="text-2xl">🖼️🚫</span>
        {checked && <span className="text-xs italic text-rose-500">Мой рыжий кот</span>}
      </div>
      <input
        type="text"
        value={text}
        onChange={(e) => !checked && setText(e.target.value)}
        disabled={checked}
        placeholder="текст из alt"
        className="w-64 rounded-full border-2 border-slate-300 px-4 py-2 text-center text-sm outline-none focus:border-pink-400 disabled:opacity-60"
      />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!text.trim()}
            className="rounded-full bg-gradient-to-r from-pink-500 to-rose-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function TypeTagTask({
  prompt = "Собери тег картинки сам: файл cat.jpg, альтернативный текст — «Кот».",
  expected = '<img src="cat.jpg" alt="Кот">',
  onResult,
}: {
  prompt?: string;
  expected?: string;
  onResult: (correct: boolean) => void;
}) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);

  function normalize(s: string) {
    return s.trim().toLowerCase().replace(/\s+/g, " ").replace(/"/g, "'").replace(/\s*\/>$/, ">");
  }

  function check() {
    setChecked(true);
    onResult(normalize(text) === normalize(expected));
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">{prompt}</p>
      <input
        type="text"
        value={text}
        onChange={(e) => !checked && setText(e.target.value)}
        disabled={checked}
        placeholder="<img ...>"
        className="w-full rounded-xl border-2 border-pink-200 px-3 py-2 font-mono text-sm outline-none focus:border-pink-400 disabled:opacity-60"
      />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!text.trim()}
            className="rounded-full bg-gradient-to-r from-pink-500 to-rose-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function AspectRatioLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [onlyHeight, setOnlyHeight] = useState(false);
  const [picked, setPicked] = useState<"both" | "onlyHeight" | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(picked === "both");
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        Картинка квадратная (100×100). Переключай варианты и смотри, когда она искажается — потом ответь, какой
        способ безопаснее.
      </p>
      <label className="mb-3 flex items-center gap-2 text-sm font-bold text-pink-700">
        <input type="checkbox" checked={onlyHeight} onChange={(e) => setOnlyHeight(e.target.checked)} />
        задать только height (width не указан)
      </label>
      <div className="mb-4 flex h-32 items-center justify-center rounded-2xl bg-slate-100">
        <div style={onlyHeight ? { height: 60, width: 180 } : { width: 100, height: 100 }} className="flex items-center justify-center rounded-lg bg-amber-200 text-2xl">
          🐱
        </div>
      </div>
      <div className="flex justify-center gap-2">
        <button
          type="button"
          disabled={checked}
          onClick={() => setPicked("both")}
          className={`rounded-lg px-4 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed ${picked === "both" ? "bg-pink-500 text-white" : "bg-slate-100 text-slate-600"}`}
        >
          указать и width, и height
        </button>
        <button
          type="button"
          disabled={checked}
          onClick={() => setPicked("onlyHeight")}
          className={`rounded-lg px-4 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed ${picked === "onlyHeight" ? "bg-pink-500 text-white" : "bg-slate-100 text-slate-600"}`}
        >
          указать только одно из них
        </button>
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!picked}
            className="rounded-full bg-gradient-to-r from-pink-500 to-rose-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function SizeMatchLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const target = 160;
  const [width, setWidth] = useState(60);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(Math.abs(width - target) <= 10);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Подвинь ползунок width так, чтобы картинка стала примерно такого же размера, как образец.</p>
      <div className="mb-3 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Образец</p>
          <div style={{ width: target, height: target * 0.7 }} className="flex items-center justify-center rounded-lg bg-amber-200 text-2xl">
            🐱
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Твоя картинка</p>
          <div style={{ width, height: width * 0.7 }} className="flex items-center justify-center rounded-lg bg-amber-200 text-2xl">
            🐱
          </div>
        </div>
      </div>
      <input type="range" min={40} max={220} value={width} onChange={(e) => !checked && setWidth(Number(e.target.value))} disabled={checked} className="w-full accent-pink-600" />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            className="rounded-full bg-gradient-to-r from-pink-500 to-rose-600 px-5 py-2 text-sm font-bold text-white shadow"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const TASK_META = [
  { badge: "выбери из списка", prompt: "Какой атрибут img указывает, ОТКУДА браузер возьмёт файл картинки?", explain: "src (source) — путь к файлу изображения." },
  { badge: "выбери из списка", prompt: "Какой атрибут img задаёт текст на случай, если картинка не загрузится (или читается программой для незрячих)?", explain: "alt — альтернативный текст, обязателен для каждой картинки." },
  { badge: "выбери из списка", prompt: "Какой атрибут img задаёт ширину картинки в пикселях?", explain: "width — ширина. У height — такая же роль, но для высоты." },
  { badge: "напиши сам", prompt: "", explain: "Когда картинка не находится, браузер показывает её alt вместо изображения." },
  { badge: "напиши сам", prompt: "", explain: '<img src="cat.jpg" alt="Кот"> — у img нет закрывающего тега, атрибуты идут через пробел.' },
  { badge: "подбери размер", prompt: "", explain: "Главное — приблизительно совпасть с образцом по width." },
  { badge: "сравни вживую", prompt: "", explain: "Если указать только ОДНО из width/height, второе браузер подстроит само, сохранив пропорции — картинка не исказится. А если задать оба значения, не подумав о пропорциях, легко получить растянутую или сплющенную картинку." },
  { badge: "выбери из списка", prompt: "Можно ли оставить картинку совсем без атрибута alt?", explain: "Технически можно, но правильная практика — писать alt всегда: он помогает незрячим пользователям и подстраховывает на случай, если картинка не загрузится." },
  { badge: "напиши сам", prompt: "", explain: '<img src="dog.png" alt="Собака"> — та же конструкция, что и раньше, с другим файлом и текстом.' },
];

function Tasks() {
  const stepper = useTaskStepper(9, "images");
  const task = stepper.index;
  const meta = TASK_META[task];

  if (stepper.allAnswered) {
    return <CompletionBanner score={stepper.score} total={9} onRestart={() => stepper.restart()} />;
  }

  return (
    <LevelShell
      total={9}
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
      {(task === 0 || task === 1 || task === 2 || task === 7) && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <McqLevel key={task} options={["src", "alt", "width", "href"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <McqLevel key={task} options={["src", "alt", "title", "name"]} correctIndex={1} onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && <McqLevel key={task} options={["size", "scale", "width", "img-width"]} correctIndex={2} onResult={(c) => stepper.markResult(c)} />}
      {task === 3 && <BrokenAltTask key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 4 && <TypeTagTask key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 5 && <SizeMatchLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 6 && <AspectRatioLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 7 && (
        <McqLevel
          key={task}
          mono={false}
          options={["Да, alt необязателен", "Можно, но правильно писать его всегда", "Только для JPG можно без alt", "Без alt картинка не загрузится"]}
          correctIndex={1}
          onResult={(c) => stepper.markResult(c)}
        />
      )}
      {task === 8 && <TypeTagTask key={task} prompt='Собери тег картинки сам: файл dog.png, альтернативный текст — «Собака».' expected='<img src="dog.png" alt="Собака">' onResult={(c) => stepper.markResult(c)} />}
    </LevelShell>
  );
}

export function ImagesTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="src, alt, width и height"
        description="Подвигай ползунки и включи «поломку» — увидишь, когда и зачем нужен alt."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="9 уровней — выбирай, сравнивай вживую и пиши сам." />
      <Tasks />
    </div>
  );
}
