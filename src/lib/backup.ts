import { exportData, importData } from "./storage";

// A restore code is the whole saved progress, compressed and written in URL-safe letters.
// It needs no server: paste it on another computer and the progress comes back.

const PREFIX = "PX1.";

async function transform(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const piped = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(piped).arrayBuffer());
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string) {
  const base64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export async function makeRestoreCode(): Promise<string> {
  const json = JSON.stringify({ v: 1, data: exportData() });
  const packed = await transform(new TextEncoder().encode(json), new CompressionStream("deflate-raw"));
  return PREFIX + toBase64Url(packed);
}

export async function applyRestoreCode(raw: string): Promise<void> {
  const code = raw.replace(/\s+/g, "");
  if (!code.startsWith(PREFIX)) throw new Error("Это не похоже на код восстановления — он начинается с PX1.");
  let parsed: unknown;
  try {
    const unpacked = await transform(fromBase64Url(code.slice(PREFIX.length)), new DecompressionStream("deflate-raw"));
    parsed = JSON.parse(new TextDecoder().decode(unpacked));
  } catch {
    throw new Error("Код повреждён: возможно, он скопировался не целиком.");
  }
  const data = (parsed as { v?: number; data?: unknown })?.data;
  if ((parsed as { v?: number })?.v !== 1 || !data || typeof data !== "object") {
    throw new Error("Код повреждён: возможно, он скопировался не целиком.");
  }
  importData(data as Record<string, string>);
}
