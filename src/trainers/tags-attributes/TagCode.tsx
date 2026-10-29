export type TagExample = {
  tagName: string;
  attrs: { name: string; value: string }[];
  content?: string;
  selfClosing?: boolean;
};

export function TagCode({
  example,
  selected,
  onPick,
}: {
  example: TagExample;
  selected?: string | null;
  onPick?: (part: string) => void;
}) {
  function span(part: string, text: string) {
    const isSel = selected === part;
    const clickable = !!onPick;
    return (
      <span
        onClick={() => onPick?.(part)}
        className={`rounded px-0.5 transition ${clickable ? "cursor-pointer hover:bg-amber-700/60" : ""} ${
          isSel ? "bg-amber-400 text-slate-900 font-bold" : ""
        }`}
      >
        {text}
      </span>
    );
  }

  return (
    <code className="block rounded-lg bg-slate-800 px-3 py-2.5 text-sm text-amber-200">
      {"<"}
      {span("tag", example.tagName)}
      {example.attrs.map((a, i) => (
        <span key={i}>
          {" "}
          {span(`attr-name-${i}`, a.name)}
          {'="'}
          {span(`attr-value-${i}`, a.value)}
          {'"'}
        </span>
      ))}
      {example.selfClosing ? (
        " />"
      ) : (
        <>
          {">"}
          {span("content", example.content ?? "")}
          {"</"}
          {span("tag", example.tagName)}
          {">"}
        </>
      )}
    </code>
  );
}
