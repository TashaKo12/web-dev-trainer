import type { ReactNode } from "react";

/** A part of a topic: a small purple label, then the title after a coloured dot — like the sections of the catalog. */
export function SectionHeading({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description?: ReactNode;
}) {
  return (
    <div className="mb-6">
      <span className="text-xs font-bold uppercase tracking-wider text-[#4d16c9] dark:text-violet-300">{kicker}</span>
      <h2 className="mt-1 flex items-center gap-3 text-xl font-bold text-slate-800 sm:text-2xl dark:text-slate-100">
        <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-[#3b82f6]" aria-hidden="true" />
        {title}
      </h2>
      {description && <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{description}</p>}
    </div>
  );
}
