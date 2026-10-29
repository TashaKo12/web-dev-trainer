const SECTION_TAB: Record<string, { file: string; label: string; cls: string }> = {
  html: { file: "index.html", label: "HTML", cls: "border-sky-200 bg-sky-50 text-sky-700" },
  css: { file: "style.css", label: "CSS", cls: "border-violet-200 bg-violet-50 text-violet-700" },
  js: { file: "script.js", label: "JS", cls: "border-amber-200 bg-amber-50 text-amber-700" },
};

export function TrainerHero({
  emoji,
  title,
  summary,
  gradient,
  section,
}: {
  emoji: string;
  title: string;
  summary: string;
  gradient: string;
  section?: "html" | "css" | "js";
}) {
  const tab = section ? SECTION_TAB[section] : undefined;

  return (
    <div className="mb-10 text-center">
      <div
        className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-3xl shadow-lg`}
      >
        {emoji}
      </div>
      {tab && (
        <div className={`mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-mono text-xs font-bold ${tab.cls}`}>
          📄 {tab.file}
          <span className="opacity-60">— это файл с {tab.label === "CSS" ? "стилями" : tab.label === "JS" ? "кодом" : "разметкой"}</span>
        </div>
      )}
      <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl">
        {title}
      </h1>
      <p className="mx-auto mt-2 max-w-xl text-slate-500">{summary}</p>
    </div>
  );
}
