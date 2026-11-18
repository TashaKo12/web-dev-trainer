import { FileCode } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BannerFrame } from "./CatalogBanner";

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

  // the same sky banner as the catalog: the topic's own icon in the round badge, its file and title on the right
  return (
    <BannerFrame className="mb-8">
      <div className="flex min-h-[170px] items-end gap-4 p-6 sm:p-7">
        <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} ring-2 ring-white/50 sm:h-[68px] sm:w-[68px]`}>
          <Icon className="h-8 w-8 text-white" strokeWidth={1.9} />
        </span>
        <div className="min-w-0 pb-1">
          {tab && (
            <span className="mb-1.5 inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-white/90 sm:text-xs">
              <FileCode className="h-3.5 w-3.5" strokeWidth={2} />
              {tab.file}
              <span className="font-sans opacity-75">— это файл с {FILE_ROLE[tab.label]}</span>
            </span>
          )}
          <h1 className="text-xl font-bold text-white sm:text-2xl">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/80">{summary}</p>
        </div>
      </div>
    </BannerFrame>
  );
}
