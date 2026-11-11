import { useSyncExternalStore } from "react";
import { CLOUD } from "./cloudConfig";
import { flush as flushTime, TIME_KEY } from "./timeTracker";
import { CLOUD_CODE_KEY, CLOUD_OWNER_KEY, exportData, getConsent, importData, loadItem, onSave, resetDevice, saveItem, setConsent } from "./storage";

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

export async function rpc<T>(fn: string, body: Record<string, unknown>): Promise<T | null> {
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


// ── who is signed in on this device ──
const accountListeners = new Set<() => void>();
let accountVersion = 0;
function accountChanged() {
  accountVersion++;
  accountListeners.forEach((l) => l());
}

export function useAccount() {
  useSyncExternalStore(
    (l) => {
      accountListeners.add(l);
      return () => {
        accountListeners.delete(l);
      };
    },
    () => accountVersion,
  );
  const code = getCloudCode();
  return code ? { code, owner: getOwner() } : null;
}

/** Saves everything to the server, then forgets the participant on this device. Throws if saving failed, unless forced. */
export async function signOut(force = false) {
  flushTime();
  await syncNow();
  if (state.status === "error" && !force) throw new Error("sync");
  resetDevice();
  window.location.hash = "#/";
  window.location.reload();
}

// ── teacher (admin) ──
// Kept in localStorage (not under "wdt:", so it never goes into a student's progress) and shared with
// the course page on the same site: the teacher signs in once and stays signed in on every page and tab.
export const ADMIN_SESSION_KEY = "admin-code";
export const ADMIN_NAME_KEY = "admin-name";

export function getAdminSession() {
  try {
    return localStorage.getItem(ADMIN_SESSION_KEY) ?? sessionStorage.getItem(ADMIN_SESSION_KEY);
  } catch {
    return null;
  }
}

export function getAdminName() {
  try {
    return localStorage.getItem(ADMIN_NAME_KEY);
  } catch {
    return null;
  }
}

export function setAdminSession(code: string | null, name?: string) {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    if (code) {
      localStorage.setItem(ADMIN_SESSION_KEY, code);
      if (name) localStorage.setItem(ADMIN_NAME_KEY, name);
    } else {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      localStorage.removeItem(ADMIN_NAME_KEY);
    }
  } catch {
    // storage blocked: works for this page view only
  }
}

export async function syncNow() {
  const code = getCloudCode();
  if (!cloudAvailable || !code) return;
  setState({ status: "saving", at: state.at });
  try {
    const ok = await rpc<boolean>("save_progress", { p_code: code, p_data: exportData() });
    setState(ok ? { status: "saved", at: new Date().toISOString() } : { status: "error", at: state.at });
  } catch {
    setState({ status: "error", at: state.at });
  }
}

export type Owner = { name: string; surname3: string };

const NAME_RE = /^[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё -]{0,29}$/;
const SURNAME_RE = /^[A-Za-zА-Яа-яЁё]{3}$/;

const capitalize = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/(^|[\s-])([a-zа-яё])/g, (_, sep: string, ch: string) => sep + ch.toUpperCase());

export function checkOwner(name: string, surname3: string): string | null {
  if (!NAME_RE.test(name.trim())) return "Напиши имя буквами, например: Таня.";
  if (!SURNAME_RE.test(surname3.trim())) return "Нужны ровно три первые буквы фамилии, например: Кон.";
  return null;
}

export function getOwner(): Owner | null {
  try {
    const raw = loadItem(CLOUD_OWNER_KEY);
    return raw ? (JSON.parse(raw) as Owner) : null;
  } catch {
    return null;
  }
}

export function formatOwner(o: Owner) {
  return `${o.name} ${o.surname3}.`;
}

/** Registers a participant: the server invents a unique permanent code and stores the current progress under it. */
export async function createCloudCode(name: string, surname3: string) {
  const problem = checkOwner(name, surname3);
  if (problem) throw new Error(problem);
  if (getConsent() !== "granted") setConsent("granted");
  const owner = { name: capitalize(name), surname3: capitalize(surname3) };
  const code = await rpc<string>("create_participant", { p_name: owner.name, p_surname3: owner.surname3, p_data: exportData() });
  if (!code) throw new Error("Сервер не выдал код. Попробуй ещё раз.");
  saveItem(CLOUD_OWNER_KEY, JSON.stringify(owner));
  saveItem(CLOUD_CODE_KEY, code);
  setState({ status: "saved", at: new Date().toISOString() });
  accountChanged();
  return code;
}

export async function restoreFromCloud(input: string) {
  const code = normalizeCode(input);
  if (code.length !== 8 || [...code].some((c) => !ALPHABET.includes(c))) {
    throw new Error("Код участника состоит из 8 букв и цифр, например K7QM-2XWD.");
  }
  let found: { data: Record<string, string>; name: string | null; surname3: string | null } | null;
  try {
    found = await rpc("load_progress", { p_code: code });
  } catch {
    throw new Error("Не получилось связаться с сервером. Проверь интернет и попробуй ещё раз.");
  }
  if (!found) throw new Error("Такой код не найден. Проверь, что он введён без ошибок.");
  importData(found.data);
  if (found.name && found.surname3) saveItem(CLOUD_OWNER_KEY, JSON.stringify({ name: found.name, surname3: found.surname3 }));
  saveItem(CLOUD_CODE_KEY, code);
  accountChanged();
}

let timer: ReturnType<typeof setTimeout> | undefined;
let timerDue = 0;

export function startAutoSync() {
  if (!cloudAvailable) return;
  onSave((key) => {
    if (key === CLOUD_CODE_KEY || !getCloudCode()) return;
    // answers go up within seconds; time-on-task counters only once a minute
    const delay = key === TIME_KEY ? 60_000 : 2000;
    const due = Date.now() + delay;
    if (timer !== undefined && timerDue <= due) return;
    clearTimeout(timer);
    timerDue = due;
    timer = setTimeout(() => {
      timer = undefined;
      syncNow();
    }, delay);
  });
}
