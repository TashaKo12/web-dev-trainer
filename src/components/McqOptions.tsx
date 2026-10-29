export function McqOptions({
  options,
  selected,
  onSelect,
  disabled,
  mono = true,
}: {
  options: string[];
  selected: number | null;
  onSelect: (i: number) => void;
  disabled: boolean;
  mono?: boolean;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt, i) => (
        <button
          key={opt}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(i)}
          className={`rounded-xl border-2 px-4 py-2.5 text-left text-sm transition ${
            mono ? "font-mono" : "font-medium"
          } ${
            selected === i
              ? "border-indigo-400 bg-indigo-50"
              : "border-slate-200 hover:border-indigo-200"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
