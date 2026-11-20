import type { LucideIcon } from "lucide-react";
import { PageHeader } from "./CatalogBanner";

// The top of a topic page: the course's wide header picture (web topics — «Веб-разработка», Python topics — «Python»),
// no icon or text on it. The topic's title and summary stay in the page for screen readers.

export function TrainerHero({
  title,
  summary,
  section,
}: {
  icon: LucideIcon;
  title: string;
  summary: string;
  gradient: string;
  section?: "html" | "css" | "js" | "python" | "sql";
}) {
  const image = section === "python" ? "python" : section === "sql" ? undefined : section ? "web" : undefined;
  return <PageHeader title={title} note={summary} image={image} className="mb-8" />;
}
