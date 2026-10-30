import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { CompletionBanner } from "../../components/CompletionBanner";
import { LevelShell } from "../../components/LevelShell";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "links")!;

function parseTag(code: string): { href: string; target: boolean; text: string } {
  const hrefMatch = code.match(/href\s*=\s*"([^"]*)"/i);
  const targetMatch = code.match(/target\s*=\s*"_blank"/i);
  const textMatch = code.match(/>([^<]*)<\/a/i);
  return { href: hrefMatch?.[1] ?? "", target: !!targetMatch, text: textMatch?.[1] ?? "" };
}

function LinkPreview({ code }: { code: string | null }) {
  if (!code) {
    return (
      <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
        Выбери или напиши ссылку, чтобы увидеть результат
      </div>
    );
  }

  const { href, target, text } = parseTag(code);

  return (
    <div className="rounded-xl border-2 border-blue-200 bg-blue-50/50 p-4">
      <p className="mb-1 text-xs font-bold uppercase text-slate-400">Живая ссылка</p>
      <a
        href={href || "#"}
        target={target ? "_blank" : undefined}
        onClick={(e) => e.preventDefault()}
        className="mb-3 block text-base font-semibold text-blue-600 underline"
      >
        {text || "(без текста)"}
      </a>
      <div className="rounded-lg bg-white p-2.5 text-sm text-blue-800">{classifyHref(href, target)}</div>
    </div>
  );
}

function classifyHref(href: string, target: boolean) {
  const h = href.trim();
  if (!h) return "Пустая ссылка — никуда не поведёт.";
  if (h.startsWith("#")) return `Страница прокрутится к элементу с id="${h.slice(1)}" — без перезагрузки и без новой вкладки.`;
  if (h.toLowerCase().startsWith("mailto:")) return `Откроется почтовая программа с письмом на ${h.slice(7)}.`;
  if (h.toLowerCase().startsWith("tel:")) return `Телефон наберёт номер ${h.slice(4)}.`;
  if (/^https?:\/\//i.test(h)) return `Браузер перейдёт на внешний сайт: ${h}${target ? " — в НОВОЙ вкладке." : " — в этой же вкладке."}`;
  return `Браузер перейдёт на страницу «${h}» этого же сайта${target ? " — в НОВОЙ вкладке." : "."}`;
}

function Theory() {
  const [href, setHref] = useState("about.html");
  const [text, setText] = useState("Обо мне");
  const [target, setTarget] = useState(false);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-5 text-slate-600">
        Тег <code className="rounded bg-slate-100 px-1">a</code> превращает текст в ссылку. Атрибут{" "}
        <code className="rounded bg-slate-100 px-1">href</code> говорит, КУДА она ведёт — и от его значения
        зависит, что произойдёт при клике.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block font-bold text-blue-700">Текст ссылки</span>
            <input value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-lg border-2 border-slate-200 px-2 py-1.5 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-bold text-blue-700">href</span>
            <input value={href} onChange={(e) => setHref(e.target.value)} className="w-full rounded-lg border-2 border-slate-200 px-2 py-1.5 font-mono text-xs" />
          </label>
          <div className="flex flex-wrap gap-2">
            {["about.html", "https://example.com", "#contacts", "mailto:info@site.ru", "tel:+70000000000"].map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setHref(ex)}
                className="rounded-full bg-blue-50 px-3 py-1 font-mono text-xs font-semibold text-blue-600 hover:bg-blue-100"
              >
                {ex}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm font-bold text-blue-700">
            <input type="checkbox" checked={target} onChange={(e) => setTarget(e.target.checked)} />
            target="_blank" (открыть в новой вкладке)
          </label>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="mb-2 text-xs font-bold uppercase text-slate-400">Твоя ссылка</p>
          <a
            href={href || "#"}
            target={target ? "_blank" : undefined}
            onClick={(e) => e.preventDefault()}
            className="mb-4 block text-lg font-semibold text-blue-600 underline"
          >
            {text || "(пусто)"}
          </a>
          <code className="mb-4 block rounded-lg bg-slate-800 px-3 py-2 text-xs text-sky-200">
            {`<a href="${href}"${target ? ' target="_blank"' : ""}>${text}</a>`}
          </code>
          <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">{classifyHref(href, target)}</div>
        </div>
      </div>
    </div>
  );
}

type Level =
  | { mode: "choose"; question: string; options: string[]; target: string; explain: string }
  | { mode: "type"; question: string; expected: string; explain: string };

const LEVELS: Level[] = [
  {
    mode: "choose",
    question: "Выбери ссылку, которая откроется в НОВОЙ вкладке браузера.",
    options: ['<a href="about.html">Обо мне</a>', '<a href="https://example.com" target="_blank">Пример</a>', '<a href="#top">Наверх</a>'],
    target: '<a href="https://example.com" target="_blank">Пример</a>',
    explain: 'target="_blank" — атрибут, который заставляет ссылку открыться в новой вкладке.',
  },
  {
    mode: "choose",
    question: "Выбери ссылку, которая ведёт на ДРУГОЙ сайт в интернете.",
    options: ['<a href="hobbies.html">Увлечения</a>', '<a href="https://vk.com">ВКонтакте</a>', '<a href="#contacts">Контакты</a>'],
    target: '<a href="https://vk.com">ВКонтакте</a>',
    explain: "href, начинающийся с http:// или https://, ведёт на внешний сайт. Остальные варианты ведут на страницы/разделы этого же сайта.",
  },
  {
    mode: "choose",
    question: "Выбери ссылку, которая откроет программу почты с готовым письмом.",
    options: ['<a href="tel:+70000000000">Позвонить</a>', '<a href="mailto:info@site.ru">Написать</a>', '<a href="info@site.ru">Почта</a>'],
    target: '<a href="mailto:info@site.ru">Написать</a>',
    explain: "mailto: — особая схема ссылки, которая открывает почтовую программу. Без mailto: браузер решит, что это обычная (и несуществующая) страница.",
  },
  {
    mode: "choose",
    question: 'Выбери ссылку, которая НИКУДА не переходит, а прокручивает страницу к разделу с id="reviews".',
    options: ['<a href="reviews.html">Отзывы</a>', '<a href="#reviews">Отзывы</a>', '<a href="/reviews">Отзывы</a>'],
    target: '<a href="#reviews">Отзывы</a>',
    explain: 'href="#id" — ссылка-якорь. Она не грузит новую страницу, а прокручивает к элементу с таким id на этой же странице.',
  },
  {
    mode: "type",
    question: "Теперь напиши сам: ссылка на страницу index.html с текстом «Главная».",
    expected: '<a href="index.html">Главная</a>',
    explain: 'Полный тег: <a href="index.html">Главная</a> — href с именем файла, текст ссылки между тегами.',
  },
  {
    mode: "type",
    question: "Напиши ссылку на https://example.com с текстом «Перейти», которая откроется в НОВОЙ вкладке.",
    expected: '<a href="https://example.com" target="_blank">Перейти</a>',
    explain: 'Полный тег: <a href="https://example.com" target="_blank">Перейти</a> — два атрибута: href и target.',
  },
  {
    mode: "type",
    question: 'Напиши ссылку-якорь на раздел с id="contacts", текст — «Контакты».',
    expected: '<a href="#contacts">Контакты</a>',
    explain: 'Полный тег: <a href="#contacts">Контакты</a> — href начинается с «#» и имени id, без расширения файла.',
  },
  {
    mode: "type",
    question: "Напиши ссылку, которая откроет программу почты для письма на info@site.ru, текст — «Написать нам».",
    expected: '<a href="mailto:info@site.ru">Написать нам</a>',
    explain: 'Полный тег: <a href="mailto:info@site.ru">Написать нам</a> — href начинается со схемы mailto:.',
  },
  {
    mode: "type",
    question: "Напиши ссылку для звонка на номер +79990001122, текст — «Позвонить».",
    expected: '<a href="tel:+79990001122">Позвонить</a>',
    explain: 'Полный тег: <a href="tel:+79990001122">Позвонить</a> — href начинается со схемы tel:, номер пишется как есть, с плюсом.',
  },
];

function normalizeTag(s: string) {
  return s.trim().replace(/\s+/g, " ").replace(/"/g, "'").toLowerCase();
}

function ChooseLevel({ level, onResult }: { level: Extract<Level, { mode: "choose" }>; onResult: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(selected === level.target);
  }

  return (
    <div>
      <p className="mb-3 text-xs text-slate-400">Нажимай на варианты — справа сразу видно, что каждый из них сделает.</p>
      <div className="grid gap-4 sm:grid-cols-[1.1fr_1fr]">
        <div className="space-y-2">
          {level.options.map((opt) => (
            <button
              key={opt}
              type="button"
              disabled={checked}
              onClick={() => setSelected(opt)}
              className={`block w-full rounded-xl border-2 px-3 py-2 text-left font-mono text-xs transition disabled:cursor-not-allowed ${
                selected === opt ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-blue-200"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <LinkPreview code={selected} />
      </div>
      {!checked && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!selected}
            className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function TypeLevel({ level, onResult }: { level: Extract<Level, { mode: "type" }>; onResult: (correct: boolean) => void }) {
  const [code, setCode] = useState("");
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    onResult(normalizeTag(code) === normalizeTag(level.expected));
  }

  return (
    <div>
      <input
        type="text"
        value={code}
        onChange={(e) => !checked && setCode(e.target.value)}
        disabled={checked}
        placeholder="напиши тег a целиком"
        className="mb-3 w-full rounded-xl border-2 border-blue-200 px-3 py-2 font-mono text-sm outline-none focus:border-blue-400 disabled:opacity-60"
      />
      <div className="mb-3">
        <LinkPreview code={code.trim() ? code : null} />
      </div>
      {!checked && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!code.trim()}
            className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function Tasks() {
  const stepper = useTaskStepper(LEVELS.length, "links");

  if (stepper.allAnswered) {
    return <CompletionBanner score={stepper.score} total={LEVELS.length} onRestart={() => stepper.restart()} />;
  }

  const level = LEVELS[stepper.index];

  return (
    <LevelShell
      total={LEVELS.length}
      index={stepper.index}
      statuses={stepper.statuses}
      status={stepper.status}
      isLast={stepper.isLast}
      badge={level.mode === "choose" ? "выбери из списка" : "напиши сам"}
      explain={level.explain}
      onJump={stepper.goTo}
      onNext={stepper.goNext}
      nextClassName="bg-gradient-to-r from-blue-500 to-cyan-600"
    >
      <p className="mb-4 text-sm font-semibold text-slate-700">{level.question}</p>
      {level.mode === "choose" ? (
        <ChooseLevel key={stepper.index} level={level} onResult={(correct) => stepper.markResult(correct)} />
      ) : (
        <TypeLevel key={stepper.index} level={level} onResult={(correct) => stepper.markResult(correct)} />
      )}
    </LevelShell>
  );
}

export function LinksTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} section={meta.section} />
      <SectionHeading
        kicker="Теория"
        title="Собери ссылку сам"
        description="href решает, куда ведёт ссылка: на страницу сайта, во внешний сайт, к разделу страницы, в почту или в звонилку."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="9 уровней — сначала выбирай ссылку из списка, потом пиши сам." />
      <Tasks />
    </div>
  );
}
