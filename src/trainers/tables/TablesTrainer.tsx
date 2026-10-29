import { useState } from "react";
import { TrainerHero } from "../../components/TrainerHero";
import { SectionHeading } from "../../components/SectionHeading";
import { TaskShell } from "../../components/TaskShell";
import { CompletionBanner } from "../../components/CompletionBanner";
import { McqOptions } from "../../components/McqOptions";
import { useTaskStepper } from "../../components/useTaskStepper";
import { trainers } from "../registry";

const meta = trainers.find((t) => t.id === "tables")!;

function Theory() {
  const [merged, setMerged] = useState(true);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <p className="mb-5 text-slate-600">
        Как в таблице урона оружия: заголовок «Название» высокий — он занимает место ДВУХ строк сразу. Переключи
        галочку, чтобы увидеть разницу между rowspan/colspan и обычными ячейками.
      </p>

      <label className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-600">
        <input type="checkbox" checked={merged} onChange={(e) => setMerged(e.target.checked)} />
        использовать rowspan и colspan
      </label>

      <table className="w-full border-collapse text-sm">
        <tbody>
          {merged ? (
            <>
              <tr>
                <th rowSpan={2} className="border-2 border-slate-400 bg-slate-100 p-2">
                  Название
                </th>
                <th colSpan={2} className="border-2 border-slate-400 bg-slate-100 p-2">
                  Урон в голову
                </th>
              </tr>
              <tr>
                <th className="border-2 border-slate-300 bg-slate-50 p-2">С броней</th>
                <th className="border-2 border-slate-300 bg-slate-50 p-2">Без брони</th>
              </tr>
              <tr>
                <td className="border-2 border-slate-200 p-2">AK-47</td>
                <td className="border-2 border-slate-200 p-2">103</td>
                <td className="border-2 border-slate-200 p-2">71</td>
              </tr>
            </>
          ) : (
            <>
              <tr>
                <th className="border-2 border-slate-400 bg-slate-100 p-2">Название</th>
                <th className="border-2 border-slate-400 bg-slate-100 p-2">—</th>
                <th className="border-2 border-slate-400 bg-slate-100 p-2">Урон в голову</th>
                <th className="border-2 border-slate-400 bg-slate-100 p-2">—</th>
              </tr>
              <tr>
                <th className="border-2 border-slate-300 bg-slate-50 p-2">—</th>
                <th className="border-2 border-slate-300 bg-slate-50 p-2">—</th>
                <th className="border-2 border-slate-300 bg-slate-50 p-2">С броней</th>
                <th className="border-2 border-slate-300 bg-slate-50 p-2">Без брони</th>
              </tr>
              <tr>
                <td className="border-2 border-slate-200 p-2">AK-47</td>
                <td className="border-2 border-slate-200 p-2">—</td>
                <td className="border-2 border-slate-200 p-2">103</td>
                <td className="border-2 border-slate-200 p-2">71</td>
              </tr>
            </>
          )}
        </tbody>
      </table>
      <p className="mt-4 text-sm text-slate-500">
        {merged
          ? 'rowspan="2" на «Название» объединяет две строки в одну ячейку, colspan="2" на «Урон в голову» объединяет два столбца.'
          : "Без rowspan/colspan приходится ставить пустые ячейки-заглушки — таблица усложняется."}
      </p>
    </div>
  );
}

type CellKey = "th-name" | "th-dmg" | "td-weapon" | "td-value";

function TableClickTask({ onResult }: { onResult: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<CellKey | null>(null);
  const [checked, setChecked] = useState(false);

  function cls(key: CellKey, base: string) {
    const isSel = selected === key;
    return `${base} cursor-pointer transition ${isSel ? "ring-2 ring-slate-600" : ""}`;
  }

  function check() {
    setChecked(true);
    onResult(selected === "th-dmg");
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        Нажми на ячейку заголовка «Урон» — это тег <code className="rounded bg-slate-100 px-1">th</code>, а не
        обычная ячейка данных <code className="rounded bg-slate-100 px-1">td</code>.
      </p>
      <table className="w-full border-collapse text-sm">
        <tbody>
          <tr>
            <th className={cls("th-name", "border-2 border-slate-400 bg-slate-100 p-2")} onClick={() => !checked && setSelected("th-name")}>
              Название
            </th>
            <th className={cls("th-dmg", "border-2 border-slate-400 bg-slate-100 p-2")} onClick={() => !checked && setSelected("th-dmg")}>
              Урон
            </th>
          </tr>
          <tr>
            <td className={cls("td-weapon", "border-2 border-slate-200 p-2")} onClick={() => !checked && setSelected("td-weapon")}>
              AK-47
            </td>
            <td className={cls("td-value", "border-2 border-slate-200 p-2")} onClick={() => !checked && setSelected("td-value")}>
              103
            </td>
          </tr>
        </tbody>
      </table>
      {!checked && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={check}
            disabled={!selected}
            className="rounded-full bg-gradient-to-r from-slate-600 to-slate-800 px-5 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function Tasks() {
  const stepper = useTaskStepper(5, "tables");
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
        prompt="Какой тег создаёт одну строку таблицы?"
        status={stepper.status}
        onCheck={() => stepper.markResult(mcq === 1)}
        onNext={next}
        checkDisabled={mcq === null}
        isLast={false}
        feedback="tr (table row) — строка таблицы. Внутри неё лежат ячейки td или th."
      >
        <McqOptions options={["table", "tr", "td", "th"]} selected={mcq} onSelect={setMcq} disabled={stepper.status !== "idle"} />
      </TaskShell>
    );
  }

  if (task === 1) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt="Какой тег нужен для ячейки-заголовка (выделяется жирным и по центру по умолчанию)?"
        status={stepper.status}
        onCheck={() => stepper.markResult(mcq === 2)}
        onNext={next}
        checkDisabled={mcq === null}
        isLast={false}
        feedback="th (table header) — ячейка заголовка таблицы."
      >
        <McqOptions options={["tr", "td", "th", "caption"]} selected={mcq} onSelect={setMcq} disabled={stepper.status !== "idle"} />
      </TaskShell>
    );
  }

  if (task === 2) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt='Ячейка "Название" должна визуально занимать место СРАЗУ ДВУХ СТРОК. Какой атрибут нужен?'
        status={stepper.status}
        onCheck={() => stepper.markResult(mcq === 0)}
        onNext={next}
        checkDisabled={mcq === null}
        isLast={false}
        feedback='rowspan="2" растягивает ячейку на две строки по вертикали.'
      >
        <McqOptions mono options={['rowspan="2"', 'colspan="2"', 'width="2"', 'span="2"']} selected={mcq} onSelect={setMcq} disabled={stepper.status !== "idle"} />
      </TaskShell>
    );
  }

  if (task === 3) {
    return (
      <TaskShell
        index={task}
        total={5}
        statuses={stepper.statuses}
        prompt='А если ячейка "Урон в голову" должна занимать место ДВУХ СТОЛБЦОВ (над "с броней" и "без брони")?'
        status={stepper.status}
        onCheck={() => stepper.markResult(mcq === 1)}
        onNext={next}
        checkDisabled={mcq === null}
        isLast={false}
        feedback='colspan="2" растягивает ячейку на два столбца по горизонтали.'
      >
        <McqOptions mono options={['rowspan="2"', 'colspan="2"', 'merge="2"', 'cols="2"']} selected={mcq} onSelect={setMcq} disabled={stepper.status !== "idle"} />
      </TaskShell>
    );
  }

  return (
    <TaskShell
      index={task}
      total={5}
      statuses={stepper.statuses}
      prompt="Кликни по нужной ячейке таблицы."
      status={clickDone ? stepper.status : "idle"}
      onCheck={() => {}}
      checkDisabled
      hideCheck
      onNext={next}
      isLast
      feedback="th — ячейка заголовка. Данные (например AK-47 и 103) лежат в td."
    >
      <TableClickTask
        onResult={(correct) => {
          setClickDone(true);
          stepper.markResult(correct);
        }}
      />
    </TaskShell>
  );
}

export function TablesTrainer() {
  return (
    <div>
      <TrainerHero emoji={meta.emoji} title={meta.title} summary={meta.summary} gradient={meta.gradient} />
      <SectionHeading
        kicker="Теория"
        title="Собери таблицу из строк и ячеек"
        description="table, tr, td, th и объединение ячеек через rowspan/colspan."
      />
      <div className="mb-10">
        <Theory />
      </div>
      <SectionHeading kicker="Практика" title="Закрепим" description="5 заданий про HTML-таблицы." />
      <Tasks />
    </div>
  );
}
