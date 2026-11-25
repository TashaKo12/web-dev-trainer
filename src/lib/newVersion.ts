import { syncNow } from "./cloud";
import { flushDrafts } from "./drafts";
import { flush as flushTime } from "./timeTracker";

// A tab can stay open for days. When the site is updated, the tab finds out, waits until the student goes to another
// page, saves everything (progress, code, time) and opens the new version of that page.

const CHECK_EVERY = 5 * 60_000;
const scriptOf = (html: string) => /assets\/index-[\w-]+\.js/.exec(html)?.[0] ?? null;

let isOld = false;
let reloading = false;

async function check() {
  const mine = scriptOf(document.documentElement.outerHTML);
  if (!mine || isOld || document.visibilityState !== "visible") return;
  try {
    const res = await fetch(`${window.location.pathname}?v=${Date.now()}`, { cache: "no-store" });
    const live = res.ok ? scriptOf(await res.text()) : null;
    isOld = live !== null && live !== mine;
  } catch {
    // offline — next time
  }
}

/** Saves everything, then opens the page again (not more than once in 30 seconds). */
export function saveAndReload() {
  if (reloading) return true;
  try {
    if (Date.now() - Number(sessionStorage.getItem("reloaded-at")) < 30_000) return false;
    sessionStorage.setItem("reloaded-at", String(Date.now()));
  } catch {
    return false;
  }
  reloading = true;
  flushTime();
  flushDrafts();
  Promise.race([syncNow(), new Promise((r) => setTimeout(r, 4000))]).finally(() => window.location.reload());
  return true;
}

export function watchNewVersion() {
  setInterval(check, CHECK_EVERY);
  document.addEventListener("visibilitychange", check);
  window.addEventListener("hashchange", () => isOld && saveAndReload());
}
