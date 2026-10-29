export type ElKey = "title" | "list" | "item1" | "item2" | "item3" | "note";

export function MiniPage({
  highlighted = new Set(),
  targets,
  selectable,
  onToggle,
}: {
  highlighted?: Set<ElKey>;
  targets?: Set<ElKey>;
  selectable?: boolean;
  onToggle?: (key: ElKey) => void;
}) {
  function cls(key: ElKey, base: string) {
    const isHighlighted = highlighted.has(key);
    const isTarget = targets?.has(key);
    return [
      base,
      "rounded transition-colors",
      selectable ? "cursor-pointer hover:ring-2 hover:ring-violet-200" : "",
      isHighlighted ? "bg-fuchsia-200 ring-2 ring-fuchsia-500" : "",
      isTarget ? "outline outline-2 outline-dashed outline-lime-500" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  function handle(key: ElKey) {
    if (selectable && onToggle) onToggle(key);
  }

  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white p-4 text-sm" id="app">
      <h1
        id="title"
        onClick={() => handle("title")}
        className={cls("title", "mb-3 text-base font-extrabold text-slate-700")}
      >
        Заголовок
      </h1>
      <ul id="list" className={cls("list", "list mb-3 space-y-1 bg-slate-50 p-2")} onClick={() => handle("list")}>
        <li
          onClick={(e) => {
            e.stopPropagation();
            handle("item1");
          }}
          className={cls("item1", "item rounded bg-white px-2 py-1")}
        >
          🍎 Яблоко
        </li>
        <li
          onClick={(e) => {
            e.stopPropagation();
            handle("item2");
          }}
          className={cls("item2", "item special rounded bg-white px-2 py-1")}
        >
          🍌 Банан
        </li>
        <li
          onClick={(e) => {
            e.stopPropagation();
            handle("item3");
          }}
          className={cls("item3", "item rounded bg-white px-2 py-1")}
        >
          🍒 Вишня
        </li>
      </ul>
      <p onClick={() => handle("note")} className={cls("note", "note text-xs text-slate-400")}>
        Подсказка под списком
      </p>
    </div>
  );
}
