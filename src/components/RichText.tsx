/** Text with code: what stands between ``` is shown as a block, with its lines and indents. */
export function RichText({ text }: { text: string }) {
  return (
    <div className="min-w-0 space-y-2">
      {text.split("```").map((part, i) => {
        const t = part.replace(/^\n+|\s+$/g, "");
        if (!t.trim()) return null;
        return i % 2 ? (
          <pre key={i} className="overflow-x-auto rounded-xl bg-slate-950 px-4 py-3 font-mono text-[0.875rem] font-normal leading-relaxed text-emerald-200">{t}</pre>
        ) : (
          <p key={i} className="whitespace-pre-line">{t}</p>
        );
      })}
    </div>
  );
}
