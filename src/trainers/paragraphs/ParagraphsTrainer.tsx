import { useState, type ReactNode } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "paragraphs")!;

function collapseWhitespace(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

function Theory() {
  const [raw, setRaw] = useState("Привет,    мир!\n\nЭто вторая строка.");
  const [wrapped, setWrapped] = useState(true);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-5 text-slate-600">
        Тег <code className="rounded bg-slate-100 px-1">p</code> — это абзац. У него есть отступ сверху и снизу
        от других элементов. А ещё браузер «склеивает» лишние пробелы и переносы строк в один пробел — HTML не
        сохраняет форматирование исходного текста как есть.
      </p>

      <div className="grid gap-5 sm:grid-cols-[1fr_1fr]">
        <div>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={5}
            className="w-full rounded-xl border-2 border-orange-200 px-3 py-2 font-mono text-xs outline-none focus:border-orange-400"
          />
          <label className="mt-2 flex items-center gap-2 text-sm font-bold text-orange-700">
            <input type="checkbox" checked={wrapped} onChange={(e) => setWrapped(e.target.checked)} />
            обернуть в &lt;p&gt;...&lt;/p&gt;
          </label>
        </div>

        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Как увидит браузер</p>
          {wrapped ? (
            <p className="text-slate-700">{collapseWhitespace(raw)}</p>
          ) : (
            <span className="text-slate-700">{collapseWhitespace(raw)}</span>
          )}
          <p className="mt-3 text-xs text-slate-400">
            {wrapped ? "p добавляет пустое место вокруг абзаца." : "Без p текст идёт сплошным потоком, без отступов."}
          </p>
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
            className="rounded-full bg-gradient-to-r from-orange-400 to-amber-500 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function SpacesLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const options = ["1 пробел", "3 пробела", "0 пробелов", "зависит от браузера"];
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(choice === 0);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">В HTML написали:</p>
      <div className="mb-3 rounded-xl bg-slate-50 p-3 font-mono text-sm text-slate-600">&lt;p&gt;Привет␣␣␣␣мир&lt;/p&gt;</div>
      <p className="mb-3 text-sm text-slate-500">(между словами — 4 пробела). Сколько пробелов увидит пользователь на странице?</p>
      <div className="mb-4 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/40 p-3">
        <p className="text-slate-700">Привет{choice === 1 ? "   " : " "}мир</p>
      </div>
      <McqOptions options={options} selected={choice} onSelect={(i) => !checked && setChoice(i)} disabled={checked} mono={false} />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={choice === null}
            className="rounded-full bg-gradient-to-r from-orange-400 to-amber-500 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function TypeLevel({ word = "Привет!", onResult }: { word?: string; onResult: (correct: boolean) => void }) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    const v = text.trim().toLowerCase().replace(/\s+/g, "");
    onResult(v === `<p>${word.toLowerCase()}</p>`);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Оберни текст «{word}» в тег абзаца (с открывающим и закрывающим тегом).</p>
      <input
        type="text"
        value={text}
        onChange={(e) => !checked && setText(e.target.value)}
        disabled={checked}
        placeholder="<p>...</p>"
        className="w-64 rounded-full border-2 border-slate-300 px-4 py-2 text-center font-mono text-sm outline-none focus:border-orange-400 disabled:opacity-60"
      />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!text.trim()}
            className="rounded-full bg-gradient-to-r from-orange-400 to-amber-500 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function CountLevel({
  count = "3",
  prompt = (
    <>
      На странице «Сайт обо мне» три отдельные мысли: «Привет, меня зовут Влад», «Мои любимые игры», «Мои планы
      на будущее». Чтобы между ними были настоящие отступы абзацев (а не просто переносы строк &lt;br&gt;), сколько
      тегов &lt;p&gt; понадобится?
    </>
  ),
  onResult,
}: {
  count?: string;
  prompt?: ReactNode;
  onResult: (correct: boolean) => void;
}) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(text.trim() === count);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">{prompt}</p>
      <input
        type="text"
        value={text}
        onChange={(e) => !checked && setText(e.target.value)}
        disabled={checked}
        placeholder="число"
        className="w-24 rounded-full border-2 border-slate-300 px-4 py-2 text-center font-mono text-sm outline-none focus:border-orange-400 disabled:opacity-60"
      />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!text.trim()}
            className="rounded-full bg-gradient-to-r from-orange-400 to-amber-500 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const BR_OPTIONS = ["просто нажать Enter в коде", "вставить <br>", "поставить несколько пробелов", "ничего не делать"] as const;

function BreakLineLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [picked, setPicked] = useState<(typeof BR_OPTIONS)[number] | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(picked === "вставить <br>");
  }

  const broken = picked === "вставить <br>";

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        Нужен перенос строки ВНУТРИ одного абзаца (а не новый абзац с отступом) — например, в адресе. Выбери
        способ и проверь на предпросмотре.
      </p>
      <div className="mb-3 rounded-xl bg-slate-50 p-3">
        <p className="text-slate-700">
          Улица Ленина, 10{broken ? <br /> : " "}
          Квартира 5
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {BR_OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            disabled={checked}
            onClick={() => setPicked(opt)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed ${
              picked === opt ? "bg-orange-400 text-white" : "bg-slate-100 text-slate-600 hover:bg-orange-100"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!picked}
            className="rounded-full bg-gradient-to-r from-orange-400 to-amber-500 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function ParaGapLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [count, setCount] = useState<1 | 2 | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(count === 2);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        Нужен заметный отступ МЕЖДУ абзацами «Привет!» и «Как дела?» — как между двумя разными мыслями. Сколько
        тегов &lt;p&gt; нужно использовать?
      </p>
      <div className="mb-3 rounded-xl bg-slate-50 p-3">
        {count === 2 ? (
          <>
            <p className="text-slate-700">Привет!</p>
            <p className="text-slate-700">Как дела?</p>
          </>
        ) : (
          <p className="text-slate-700">
            Привет!{count === 1 ? " " : ""}Как дела?
          </p>
        )}
      </div>
      <div className="flex justify-center gap-2">
        {([1, 2] as const).map((n) => (
          <button
            key={n}
            type="button"
            disabled={checked}
            onClick={() => setCount(n)}
            className={`rounded-lg px-4 py-1.5 text-sm font-bold transition disabled:cursor-not-allowed ${
              count === n ? "bg-orange-400 text-white" : "bg-slate-100 text-slate-600 hover:bg-orange-100"
            }`}
          >
            {n} тег{n === 2 ? "а" : ""} p
          </button>
        ))}
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!count}
            className="rounded-full bg-gradient-to-r from-orange-400 to-amber-500 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const TASK_META = [
  { badge: "выбери из списка", prompt: "Нужно начать новый абзац обычного текста. Какой тег для этого придуман?", explain: "p (paragraph) — тег абзаца. У него есть отступы сверху и снизу." },
  { badge: "выбери из списка", prompt: "", explain: "Браузер всегда «склеивает» несколько пробелов/переносов строк подряд в HTML-коде в один пробел на экране." },
  { badge: "напиши сам", prompt: "", explain: "<p>Привет!</p> — открывающий и закрывающий тег вокруг текста." },
  { badge: "напиши сам", prompt: "", explain: "Три отдельные мысли — три тега <p>. Каждый абзац получает собственные отступы автоматически." },
  { badge: "выбери способ", prompt: "", explain: "<br> — единственный из вариантов, который реально создаёт перенос строки внутри одного абзаца." },
  { badge: "выбери число", prompt: "", explain: "Заметный отступ между мыслями получается только у ДВУХ отдельных тегов p — один абзац просто склеивает весь текст в одну строку без отступа внутри." },
  { badge: "напиши сам", prompt: "", explain: "<p>Пока!</p> — та же конструкция, что и раньше, просто с другим словом внутри." },
  { badge: "выбери из списка", prompt: "Чем <p> отличается от <div> с тем же текстом внутри?", explain: "У <p> по умолчанию есть отступы сверху и снизу (margin), а у <div> их нет — внешне разница именно в этом, хотя оба блочные." },
  { badge: "напиши число", prompt: "", explain: "Четыре отдельные мысли — четыре тега <p>, по одному на каждую." },
];

function Tasks() {
  const stepper = useTaskStepper(9, "paragraphs");
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
      nextClassName="bg-gradient-to-r from-orange-400 to-amber-500"
    >
      {meta.prompt && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <McqLevel key={task} options={["p", "br", "div", "span"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && <SpacesLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 2 && <TypeLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 3 && <CountLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 4 && <BreakLineLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 5 && <ParaGapLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 6 && <TypeLevel key={task} word="Пока!" onResult={(c) => stepper.markResult(c)} />}
      {task === 7 && (
        <McqLevel
          key={task}
          mono={false}
          options={["Ничем — это одно и то же", "У p по умолчанию есть отступы сверху/снизу, у div — нет", "div нельзя использовать для текста", "p работает только внутри head"]}
          correctIndex={1}
          onResult={(c) => stepper.markResult(c)}
        />
      )}
      {task === 8 && (
        <CountLevel
          key={task}
          count="4"
          prompt='На странице четыре отдельные мысли: «Привет», «Обо мне», «Мои увлечения», «Контакты». Сколько тегов p понадобится, чтобы у каждой был свой отступ?'
          onResult={(c) => stepper.markResult(c)}
        />
      )}
    </LevelShell>
  );
}

export function ParagraphsTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="Абзац — это p"
        description="p отделяет кусок текста отступами и склеивает лишние пробелы/переносы строк в один."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="9 уровней — выбирай и пиши сам." />
      <Tasks />
    </div>
  );
}
