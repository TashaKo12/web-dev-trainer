export type ImageInfo = { emoji: string; label: string };

export const IMAGE_FILES: Record<string, ImageInfo> = {
  "cat.jpg": { emoji: "🐱", label: "Кот" },
  "images/sunset.jpg": { emoji: "🌅", label: "Закат" },
  "images/gallery/forest.jpg": { emoji: "🌲", label: "Лес" },
};

export const OTHER_FILES = new Set(["style.css", "index.html", "pages/about.html"]);

export function isExternal(src: string) {
  return /^https?:\/\//i.test(src.trim());
}

/** Resolves an <img src> value against the folder of the HTML file that references it. */
export function resolvePath(currentDir: string, srcRaw: string): string {
  let src = srcRaw.trim();
  let base: string[];

  if (src.startsWith("/")) {
    base = [];
    src = src.slice(1);
  } else {
    base = currentDir ? currentDir.split("/") : [];
  }

  const segments = src.split("/").filter((s) => s !== "" && s !== ".");
  for (const seg of segments) {
    if (seg === "..") base.pop();
    else base.push(seg);
  }

  return base.join("/");
}

export type PathResult =
  | { kind: "empty" }
  | { kind: "external"; url: string }
  | { kind: "image"; path: string; info: ImageInfo }
  | { kind: "other-file"; path: string }
  | { kind: "not-found"; path: string };

export function evaluatePath(currentDir: string, srcRaw: string): PathResult {
  const src = srcRaw.trim();
  if (!src) return { kind: "empty" };
  if (isExternal(src)) return { kind: "external", url: src };

  const resolved = resolvePath(currentDir, src);
  if (IMAGE_FILES[resolved]) return { kind: "image", path: resolved, info: IMAGE_FILES[resolved] };
  if (OTHER_FILES.has(resolved)) return { kind: "other-file", path: resolved };
  return { kind: "not-found", path: resolved };
}
