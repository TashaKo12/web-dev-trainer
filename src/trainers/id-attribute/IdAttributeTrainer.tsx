import { useState } from "react";
import { WebMissions } from "../../missions/WebMissions";
import { Image } from "lucide-react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { TrueFalseDeck, type TrueFalseStatement } from "../../components/TrueFalseDeck";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "id-attribute")!;

function Theory() {
  const [idSet, setIdSet] = useState(false);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
      <p className="mb-5 text-slate-600">
        <code className="rounded bg-slate-100 px-1">id</code> тоже даёт элементу «имя», как и{" "}
        <code className="rounded bg-slate-100 px-1">class</code> — но, в отличие от class, оно должно быть
        УНИКАЛЬНЫМ: одно и то же имя id нельзя использовать дважды на одной странице. Обычно id ставят на
        единственный, особенный элемент — например, сам логотип сайта или шапку.
      </p>

      <label className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-700">
        <input type="checkbox" checked={idSet} onChange={(e) => setIdSet(e.target.checked)} />
        поставить id="logo" на логотип
      </label>

      <div className="grid grid-cols-3 gap-2">
        <div
          className={`rounded-lg border-2 p-3 text-center font-mono text-[11px] transition ${
            idSet ? "border-amber-400 bg-amber-50 font-bold text-amber-700" : "border-slate-200 text-slate-400"
          }`}
        >
          {idSet ? 'id="logo"' : "div"}
        </div>
        <div className="rounded-lg border-2 border-slate-200 p-3 text-center font-mono text-[11px] text-slate-500">
          class="item"
        </div>
        <div className="rounded-lg border-2 border-slate-200 p-3 text-center font-mono text-[11px] text-slate-500">
          class="item"
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
        class здесь стоит на ДВУХ блоках сразу — это нормально. А вот id="logo" можно поставить только на ОДИН
        блок. И class, и id можно повесить на один и тот же элемент одновременно:{" "}
        <code className="rounded bg-white px-1">&lt;div id="logo" class="brand"&gt;</code> — id для уникальной
        пометки, class для оформления.
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        <b>Зачем нужна уникальность:</b> по id в CSS и JavaScript можно однозначно обратиться ровно к одному,
        нужному элементу — например, найти его через{" "}
        <code className="rounded bg-white px-1">document.getElementById("logo")</code>. В CSS к элементу с id
        обращаются через решётку: <code className="rounded bg-white px-1">#logo</code>, а к классу — через точку:{" "}
        <code className="rounded bg-white px-1">.item</code>.
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
            className="rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function TypeLevel({ expected, placeholder, prompt, onResult }: { expected: string; placeholder: string; prompt: string; onResult: (correct: boolean) => void }) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);

  function normalize(s: string) {
    return s.trim().toLowerCase().replace(/\s+/g, " ").replace(/"/g, "'");
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
        placeholder={placeholder}
        className="w-full rounded-xl border-2 border-amber-200 px-3 py-2 font-mono text-sm outline-none focus:border-amber-400 disabled:opacity-60"
      />
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!text.trim()}
            className="rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

type SpotKey = "logo" | "card1" | "card2" | "card3";

function PickUniqueLevel({ onResult }: { onResult: (correct: boolean) => void }) {
  const [picked, setPicked] = useState<SpotKey | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(picked === "logo");
  }

  function cls(key: SpotKey) {
    const isSel = picked === key;
    const isCorrect = checked && key === "logo";
    const isWrong = checked && isSel && key !== "logo";
    return `cursor-pointer rounded-xl border-2 p-3 text-center text-xs font-bold transition ${
      isCorrect ? "border-emerald-400 bg-emerald-50 text-emerald-700" : isWrong ? "border-rose-300 bg-rose-50 text-rose-600" : isSel ? "border-amber-400 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-500 hover:border-amber-200"
    }`;
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        На странице — шапка с логотипом и три одинаковые карточки товара. Какому элементу подойдёт уникальный{" "}
        <code className="rounded bg-slate-100 px-1">id</code>, а не <code className="rounded bg-slate-100 px-1">class</code>?
      </p>
      <div className="space-y-2">
        <div className={`flex items-center justify-center gap-1.5 ${cls("logo")}`} onClick={() => !checked && setPicked("logo")}>
          <Image className="h-3.5 w-3.5" strokeWidth={2} />
          Логотип сайта (один на всю страницу)
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className={cls("card1")} onClick={() => !checked && setPicked("card1")}>
            Карточка 1
          </div>
          <div className={cls("card2")} onClick={() => !checked && setPicked("card2")}>
            Карточка 2
          </div>
          <div className={cls("card3")} onClick={() => !checked && setPicked("card3")}>
            Карточка 3
          </div>
        </div>
      </div>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!picked}
            className="rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

const TASK_META = [
  { badge: "кликни на странице", prompt: "", explain: "Логотип — единственный на странице, поэтому ему подходит уникальный id. Карточки одинаковые и повторяются, поэтому им нужен общий class." },
  { badge: "выбери из списка", prompt: "Сколько раз один и тот же id может встретиться на одной странице?", explain: "Ровно один раз — id должен быть уникальным, иначе браузер и JavaScript не смогут однозначно понять, какой элемент имелся в виду." },
  { badge: "напиши сам", prompt: 'Напиши атрибут id со значением "logo" так, как он пишется внутри тега.', explain: 'id="logo" — имя атрибута, знак =, значение в кавычках, так же как и у class.' },
  { badge: "выбери из списка", prompt: "Можно ли одному и тому же элементу дать одновременно и class, и id?", explain: 'Да — например: <div id="logo" class="brand">. id помечает элемент как уникальный, а class отвечает за оформление.' },
  { badge: "выбери из списка", prompt: "Чем id в первую очередь отличается от class?", explain: "id должен быть уникальным (только один раз на странице), а один и тот же class можно вешать на сколько угодно элементов." },
  { badge: "выбери из списка", prompt: 'Как в CSS обратиться к элементу с id="logo"?', explain: "#logo — в CSS к id обращаются через решётку (#) перед именем." },
  { badge: "выбери из списка", prompt: 'А как в CSS обратиться ко ВСЕМ элементам с class="card"?', explain: ".card — в CSS к классу обращаются через точку перед именем, в отличие от решётки у id." },
  { badge: "напиши сам", prompt: 'Напиши CSS-селектор для элемента с id="header" (без фигурных скобок и стилей — только сам селектор).', explain: "#header — решётка плюс имя id, без кавычек в CSS-селекторе (в отличие от HTML-атрибута)." },
  { badge: "напиши сам", prompt: 'Напиши тег div, у которого одновременно id="logo" и class="brand".', explain: 'Тег: <div id="logo" class="brand"> — оба атрибута через пробел, в любом порядке, каждый в своих кавычках.' },
];

function Tasks() {
  const stepper = useTaskStepper(9, "id-attribute");
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
      nextClassName="bg-gradient-to-r from-yellow-500 to-amber-600"
    >
      {meta.prompt && <p className="mb-4 text-sm font-semibold text-slate-700">{meta.prompt}</p>}
      {task === 0 && <PickUniqueLevel key={task} onResult={(c) => stepper.markResult(c)} />}
      {task === 1 && (
        <McqLevel
          key={task}
          mono={false}
          options={["Сколько угодно раз", "Ровно один раз", "Ровно два раза", "Зависит от браузера"]}
          correctIndex={1}
          onResult={(c) => stepper.markResult(c)}
        />
      )}
      {task === 2 && <TypeLevel key={task} expected='id="logo"' placeholder='id="..."' prompt="" onResult={(c) => stepper.markResult(c)} />}
      {task === 3 && (
        <McqLevel
          key={task}
          mono={false}
          options={["Да, оба сразу", "Нет, нужно выбрать что-то одно", "Только если id идёт первым", "Только у div"]}
          correctIndex={0}
          onResult={(c) => stepper.markResult(c)}
        />
      )}
      {task === 4 && (
        <McqLevel
          key={task}
          mono={false}
          options={["id уникален, class можно повторять", "id красит текст, class — фон", "id работает только внутри head", "Ничем, это одно и то же"]}
          correctIndex={0}
          onResult={(c) => stepper.markResult(c)}
        />
      )}
      {task === 5 && <McqLevel key={task} options={["#logo", ".logo", "id-logo", "*logo"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 6 && <McqLevel key={task} options={[".card", "#card", "*card", "card{}"]} correctIndex={0} onResult={(c) => stepper.markResult(c)} />}
      {task === 7 && <TypeLevel key={task} expected="#header" placeholder="#..." prompt="" onResult={(c) => stepper.markResult(c)} />}
      {task === 8 && <TypeLevel key={task} expected='<div id="logo" class="brand">' placeholder='<div ...>' prompt="" onResult={(c) => stepper.markResult(c)} />}
    </LevelShell>
  );
}

const TRUE_FALSE: TrueFalseStatement[] = [
  {
    text: "id, в отличие от class, должен быть уникальным на странице.",
    answer: true,
    explain: "Верно, id — идентификатор ровно одного, конкретного элемента, повторяться он не должен.",
  },
  {
    text: "Одно и то же имя id можно использовать для двух разных элементов на одной странице.",
    answer: false,
    explain: "Нет, id обязан быть уникальным — его используют, чтобы однозначно сослаться ровно на один элемент.",
  },
  {
    text: "У одного элемента не может быть одновременно и class, и id.",
    answer: false,
    explain: 'Может — например: <div id="logo" class="brand">. Это два разных атрибута, они не конфликтуют.',
  },
  {
    text: "В CSS к элементу с id обращаются через точку перед именем.",
    answer: false,
    explain: "Нет, через точку обращаются к классу (.card), а к id — через решётку (#logo).",
  },
  {
    text: "document.getElementById — способ найти в JavaScript элемент по его id.",
    answer: true,
    explain: "Да, именно так: getElementById ищет ровно один элемент с нужным id.",
  },
  {
    text: "id можно повторно использовать на другой странице сайта — это не считается нарушением уникальности.",
    answer: true,
    explain: "Да, уникальность id действует в пределах ОДНОЙ страницы, а не всего сайта.",
  },
  {
    text: "class подходит для логотипа сайта лучше, чем id, потому что логотип один.",
    answer: false,
    explain: "Наоборот — раз логотип единственный, для него как раз лучше подходит уникальный id.",
  },
  {
    text: "Атрибут id пишется так же, как class: имя, знак =, значение в кавычках.",
    answer: true,
    explain: 'Да, синтаксис одинаковый — id="logo" устроено точно так же, как class="card".',
  },
  {
    text: "Если на странице случайно встретится два одинаковых id, браузер обязательно покажет ошибку и откажется грузить страницу.",
    answer: false,
    explain: "Нет, страница всё равно загрузится, но поведение CSS и JavaScript, которые ищут этот id, станет непредсказуемым — так делать не стоит.",
  },
  {
    text: "class предназначен для повторяющегося оформления, а id — для единичной, точной адресации.",
    answer: true,
    explain: "Верно, это и есть главное разделение ролей между этими двумя атрибутами.",
  },
];

export function IdAttributeTrainer() {
  return (
    <div>
      <TrainerHero icon={meta.icon} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="id — уникальное имя для одного элемента"
        description="В отличие от class, значение id может встретиться на странице только один раз."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <WebMissions trainerId="id-attribute" />
      <SectionHeading kicker="Практика" title="Закрепим" description="9 уровней — кликай, выбирай и пиши сам." />
      <div className="mb-10">
        <Tasks />
      </div>
      <SectionHeading
        kicker="Проверь себя"
        title="Верно или неверно?"
        description="Пролистай 10 карточек — угадай, где правда, а где нет."
      />
      <TrueFalseDeck statements={TRUE_FALSE} accent={meta.gradient} />
    </div>
  );
}
