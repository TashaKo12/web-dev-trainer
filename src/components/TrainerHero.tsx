import type { LucideIcon } from "lucide-react";
import { PageHeader } from "./CatalogBanner";

// The top of a topic page: a wide header picture only (no icon or text on it).
// The topic's title and summary stay in the page for screen readers.

export function TrainerHero({
  title,
  summary,
}: {
  icon: LucideIcon;
  title: string;
  summary: string;
  gradient: string;
  section?: "html" | "css" | "js" | "python";
}) {
  return <PageHeader title={title} note={summary} className="mb-8" />;
}
