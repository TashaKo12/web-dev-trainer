import { useState } from "react";
import { ArrowDown, ArrowLeftRight, CircleSlash, RotateCcw } from "lucide-react";

// Interactive theory: type the arguments of a call and watch them land in the parameters by their order.

type Val = { kind: "num" | "str"; v: string } | null;

const parse = (s: string): Val => (/^-?\d+(\.\d+)?$/.test(s.trim()) ? { kind: "num", v: s.trim() } : { kind: "str", v: s });
const lit = (x: Val) => (x === null ? "undefined" : x.kind === "str" ? `"${x.v}"` : x.v);
const plain = (x: Val) => (x === null ? "undefined" : x.v);

const SKY = { background: "#e0f2fe", color: "#0369a1", borderColor: "#7dd3fc" };
const AMBER = { background: "#fef3c7", color: "#b45309", borderColor: "#fcd34d" };

function Slot({ value, onChange, style, label }: { value: string; onChange: (v: string) => void; style: React.CSSProperties; label: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      spellCheck={false}
      style={{ ...style, width: `${Math.max(value.length, 2) + 3}ch` }}
      className="rounded-lg border-2 px-1.5 py-0.5 text-center font-mono font-bold outline-none"
    />
  );
}

export function ArgsPlayground() {
  const [first, setFirst] = useState("пицца");
  const [second, setSecond] = useState("2");
  const [dropSecond, setDropSecond] = useState(false);

  const a = parse(first);
  const b = dropSecond ? null : parse(second);
  const swapped = a?.kind === "num" && b?.kind === "str";
  const output = `${plain(b)} × ${plain(a)}`;

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-7 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-amber-500">Попробуй сам</p>
      <h3 className="mb-2 text-lg font-extrabold text-slate-800">Куда попадают аргументы</h3>
      <p className="mb-4 text-sm leading-relaxed text-slate-600">
        Поменяй значения в цветных окошках внизу — это аргументы вызова. Первый аргумент попадает в первый параметр, второй — во
        второй.
      </p>

      <pre className="overflow-x-auto rounded-2xl bg-slate-900 px-4 py-3 font-mono text-[13px] leading-relaxed text-slate-100">
        <span className="text-violet-300">function</span> <span className="text-amber-200">order</span>(
        <span className="rounded px-1 font-bold" style={SKY}>dish</span>,{" "}
        <span className="rounded px-1 font-bold" style={AMBER}>count</span>) {"{\n"}
        {"  "}
        <span className="text-violet-300">return</span> <span style={{ color: "#fcd34d" }}>count</span> +{" "}
        <span className="text-emerald-300">" × "</span> + <span style={{ color: "#7dd3fc" }}>dish</span>;{"\n}"}
      </pre>

      <div className="my-3 grid gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-2xl border-2 px-3 py-2 font-mono text-sm" style={{ borderColor: SKY.borderColor }}>
          <ArrowDown className="h-4 w-4 shrink-0" style={{ color: SKY.color }} strokeWidth={2.5} />
          <b style={{ color: SKY.color }}>dish</b> <span className="text-slate-400">=</span> <b className="text-slate-800">{lit(a)}</b>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border-2 px-3 py-2 font-mono text-sm" style={{ borderColor: AMBER.borderColor }}>
          <ArrowDown className="h-4 w-4 shrink-0" style={{ color: AMBER.color }} strokeWidth={2.5} />
          <b style={{ color: AMBER.color }}>count</b> <span className="text-slate-400">=</span> <b className="text-slate-800">{lit(b)}</b>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900 px-4 py-3 font-mono text-[13px] leading-loose text-slate-100">
        <span className="text-sky-300">console</span>.log(<span className="text-amber-200">order</span>(
        <Slot value={first} onChange={setFirst} style={SKY} label="Первый аргумент" />
        {!dropSecond && (
          <>
            , <Slot value={second} onChange={setSecond} style={AMBER} label="Второй аргумент" />
          </>
        )}
        ));
      </div>
      <div className="mt-2 rounded-2xl bg-slate-950 px-4 py-2.5 font-mono text-sm text-emerald-200">{output}</div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setFirst(second);
            setSecond(first);
          }}
          disabled={dropSecond}
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-40"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          Поменять местами
        </button>
        <button
          type="button"
          onClick={() => setDropSecond((d) => !d)}
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-50"
        >
          <CircleSlash className="h-3.5 w-3.5" strokeWidth={2.5} />
          {dropSecond ? "Вернуть второй аргумент" : "Не передавать второй"}
        </button>
        <button
          type="button"
          onClick={() => {
            setFirst("пицца");
            setSecond("2");
            setDropSecond(false);
          }}
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-slate-50"
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.5} />
          Сначала
        </button>
      </div>

      <p className="mt-3 rounded-2xl bg-indigo-50 p-3 text-sm text-indigo-700">
        {dropSecond
          ? "Второй аргумент не передали — параметр count есть, но в нём ничего нет: undefined. Поэтому и вывод странный."
          : swapped
            ? "Аргументы поменялись местами — и заказ сломался. JavaScript раскладывает аргументы строго по порядку, а не по смыслу."
            : "Всё по порядку: первый аргумент стал значением dish, второй — значением count. Функция работает с любыми значениями."}
      </p>
    </div>
  );
}
