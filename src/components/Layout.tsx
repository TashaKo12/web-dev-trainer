import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Blocks } from "lucide-react";
import { useConsent } from "../lib/storage";
import { AnimatedBackground } from "./AnimatedBackground";
import { ConsentBanner } from "./ConsentBanner";
import { PointsBadge } from "./PointsBadge";
import { ThemeToggle } from "./ThemeToggle";

export function Layout() {
  const { pathname } = useLocation();
  const consent = useConsent();
  const [askAgain, setAskAgain] = useState(false);
  const back =
    pathname === "/" || pathname === "" || pathname === "/python"
      ? null
      : pathname.startsWith("/python/")
        ? { to: "/python", label: "Темы Python" }
        : { to: "/", label: "Все тренажёры" };

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100">
      <AnimatedBackground />
      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-4">
          <a href="https://tashako12.github.io/my-projects/" className="flex items-center gap-2 font-extrabold text-slate-800 dark:text-slate-100">
            <Blocks className="h-6 w-6 text-indigo-500 dark:text-indigo-400" strokeWidth={1.75} />
            <span className="hidden min-[360px]:inline">Тренажеры</span>
          </a>
          <div className="flex items-center gap-2 sm:gap-3">
            {back && (
              <Link
                to={back.to}
                aria-label={back.label}
                className="whitespace-nowrap rounded-full border-2 border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 sm:px-4 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-400"
              >
                ←<span className="hidden sm:inline"> {back.label}</span>
              </Link>
            )}
            <PointsBadge />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="animate-fade-in mx-auto max-w-5xl px-5 py-8 sm:py-12">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-5xl px-5 py-10 text-center text-sm text-slate-400 dark:text-slate-600">
        <p>Сделано для тех, кто делает первые шаги в программировании</p>
        <p className="mt-1 text-xs text-slate-400/80 dark:text-slate-600">Автор проекта — Татьяна Кондратюк</p>
        {consent && (
          <p className="mt-3 text-xs">
            Сохранение прогресса в браузере: {consent === "granted" ? "включено" : "выключено"} ·{" "}
            <button type="button" onClick={() => setAskAgain(true)} className="font-bold underline underline-offset-2 hover:text-indigo-500">
              изменить
            </button>
          </p>
        )}
      </footer>
      {(consent === null || askAgain) && <ConsentBanner onClose={() => setAskAgain(false)} />}
    </div>
  );
}
