import { useSyncExternalStore } from "react";
import { CLOUD } from "./cloudConfig";
import { CLOUD_CODE_KEY, exportData, getConsent, importData, loadItem, onSave, removeItem, saveItem, setConsent } from "./storage";

// Progress stored on the server under a short participant code (e.g. K7QM-2XWD),
// so the same progress opens on any computer. Turned on only by an explicit opt-in.

export const cloudAvailable = Boolean(CLOUD.url && CLOUD.key);

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type SyncState = { status: "idle" | "saving" | "saved" | "error"; at: string | null };

let state: SyncState = { status: "idle", at: null };
const listeners = new Set<() => void>();
function setState(next: SyncState) {
  state = next;
  listeners.forEach((l) => l());
}

export function useSyncState() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => state,
  );
}

async function rpc<T>(fn: string, body: Record<string, unknown>): Promise<T | null> {
  const res = await fetch(`${CLOUD.url.replace(/\/$/, "")}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: CLOUD.key, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`cloud ${fn} failed: ${res.status}`);
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : null;
}

export function normalizeCode(input: string) {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function formatCode(code: string) {
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

export function getCloudCode() {
  return loadItem(CLOUD_CODE_KEY);
}

function newCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export async function syncNow() {
  const code = getCloudCode();
  if (!cloudAvailable || !code) return;
  setState({ status: "saving", at: state.at });
  try {
    await rpc("save_progress", { p_code: code, p_data: exportData() });
    setState({ status: "saved", at: new Date().toISOString() });
  } catch {
    setState({ status: "error", at: state.at });
  }
}

/** Creates a participant code and uploads the current progress. Turns on browser saving too. */
export async function createCloudCode() {
  if (getConsent() !== "granted") setConsent("granted");
  const code = newCode();
  await rpc("save_progress", { p_code: code, p_data: exportData() });
  saveItem(CLOUD_CODE_KEY, code);
  setState({ status: "saved", at: new Date().toISOString() });
  return code;
}

export async function restoreFromCloud(input: string) {
  const code = normalizeCode(input);
  if (code.length !== 8 || [...code].some((c) => !ALPHABET.includes(c))) {
    throw new Error("Код участника состоит из 8 букв и цифр, например K7QM-2XWD.");
  }
  let data: Record<string, string> | null;
  try {
    data = await rpc<Record<string, string>>("load_progress", { p_code: code });
  } catch {
    throw new Error("Не получилось связаться с сервером. Проверь интернет и попробуй ещё раз.");
  }
  if (!data) throw new Error("Такой код не найден. Проверь, что он введён без ошибок.");
  importData(data);
  saveItem(CLOUD_CODE_KEY, code);
}

/** Removes the progress from the server; it stays on this device. */
export async function deleteFromCloud() {
  const code = getCloudCode();
  if (code) await rpc("delete_progress", { p_code: code });
  removeItem(CLOUD_CODE_KEY);
  setState({ status: "idle", at: null });
}

let timer: ReturnType<typeof setTimeout> | undefined;

export function startAutoSync() {
  if (!cloudAvailable) return;
  onSave((key) => {
    if (key === CLOUD_CODE_KEY || !getCloudCode()) return;
    clearTimeout(timer);
    timer = setTimeout(syncNow, 2000);
  });
}
