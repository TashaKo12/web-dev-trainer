import type { ReactNode } from "react";

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
      <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-500">
        {kicker}
      </span>
      <h2 className="mt-1 text-2xl font-extrabold text-slate-800 sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-2xl text-slate-500">{description}</p>
      )}
    </div>
  );
}
