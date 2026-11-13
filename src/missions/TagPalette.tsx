import { GripVertical } from "lucide-react";

// Tag chips for HTML missions: the tags and attributes the mission needs plus two decoys.
// A chip can be dragged into the editor or clicked to insert at the cursor.

export type Chip = { label: string; insert: string; caret: number };

const VOID = new Set(["hr", "br", "img", "input", "meta", "link"]);
const BLOCK = new Set(["html", "head", "body", "ul", "ol", "table", "tr", "form", "header", "nav", "main", "footer", "section", "article", "div", "select"]);
const BOOLEAN = new Set(["disabled", "required"]);
const DECOYS = ["p", "div", "span", "h1", "h2", "b", "a", "li", "img", "br", "section", "button", "em", "td"];

function tagChip(name: string): Chip {
  if (VOID.has(name)) return { label: `<${name}>`, insert: `<${name}>`, caret: name.length + 2 };
  const open = `<${name}>`;
  const inner = BLOCK.has(name) ? "\n  \n" : "";
  return { label: `<${name}></${name}>`, insert: `${open}${inner}</${name}>`, caret: open.length + (inner ? 3 : 0) };
}

function attrChip(name: string, value: string | null): Chip {
  if (BOOLEAN.has(name) && value === null) return { label: name, insert: ` ${name}`, caret: name.length + 1 };
  const v = value ?? "";
  return { label: `${name}="${v}"`, insert: ` ${name}="${v}"`, caret: name.length + 3 + (v ? v.length + 1 : 0) };
}

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function chipsFor(title: string, spec?: string): Chip[] {
  if (!spec) return [];
  const chips = new Map<string, Chip>();
  const add = (c: Chip) => chips.set(c.label, c);
  for (const token of spec.split(/\s+/).filter(Boolean)) {
    if (token === "!doctype") add({ label: "<!DOCTYPE html>", insert: "<!DOCTYPE html>\n", caret: 16 });
    else if (token.startsWith("@")) {
      const [name, value] = token.slice(1).split("=");
      add(attrChip(name, value === undefined ? null : value.replace(/\+/g, " ")));
    } else add(tagChip(token));
  }

  const used = new Set([...chips.values()].map((c) => c.label));
  const h = hash(title);
  const decoys = DECOYS.map(tagChip).filter((c) => !used.has(c.label));
  for (let k = 0; k < 2 && decoys.length; k++) add(decoys.splice((h + k * 7) % decoys.length, 1)[0]);

  // stable shuffle, so the right chips are not always first
  return [...chips.values()].sort((x, y) => hash(x.label + h) - hash(y.label + h));
}

export function TagPalette({ chips, onInsert }: { chips: Chip[]; onInsert: (c: Chip) => void }) {
  if (!chips.length) return null;
  return (
    <div>
      <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Перетащи нужные теги в код или нажми на них</p>
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c.label}
            type="button"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", c.insert);
              e.dataTransfer.effectAllowed = "copy";
            }}
            onClick={() => onInsert(c)}
            title="Перетащи в редактор или нажми, чтобы вставить там, где курсор"
            className="inline-flex cursor-grab items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50 py-1.5 pl-1.5 pr-3 font-mono text-[13px] font-bold text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow active:cursor-grabbing"
          >
            <GripVertical className="h-3.5 w-3.5 text-indigo-300" strokeWidth={2} />
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
