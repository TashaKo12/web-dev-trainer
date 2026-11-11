import { FileCode } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const SECTION_TAB: Record<string, { file: string; label: string; cls: string }> = {
  html: { file: "index.html", label: "HTML", cls: "border-sky-200 bg-sky-50 text-sky-700" },
  css: { file: "style.css", label: "CSS", cls: "border-violet-200 bg-violet-50 text-violet-700" },
  js: { file: "script.js", label: "JS", cls: "border-amber-200 bg-amber-50 text-amber-700" },
  python: { file: "main.py", label: "Python", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
};

const FILE_ROLE: Record<string, string> = {
  HTML: "разметкой",
  CSS: "стилями",
  JS: "кодом",
  Python: "программой на Python",
};

export function TrainerHero({
  icon: Icon,
  title,
  summary,
  gradient,
  section,
}: {
  icon: LucideIcon;
  title: string;
  summary: string;
  gradient: string;
  section?: "html" | "css" | "js" | "python";
}) {
  const tab = section ? SECTION_TAB[section] : undefined;

  return (
    <div className="mb-10 text-center">
      <div
        className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}
      >
        <Icon className="h-8 w-8 text-white" strokeWidth={1.75} />
      </div>
      {tab && (
        <div className={`mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-mono text-xs font-bold dark:brightness-125 ${tab.cls}`}>
          <FileCode className="h-3.5 w-3.5" strokeWidth={2} />
          {tab.file}
          <span className="opacity-60">— это файл с {FILE_ROLE[tab.label]}</span>
        </div>
      )}
      <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl dark:text-slate-100">
        {title}
      </h1>
      <p className="mx-auto mt-2 max-w-xl text-slate-500 dark:text-slate-400">{summary}</p>
    </div>
  );
}
