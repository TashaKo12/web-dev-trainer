import { useEffect } from "react";
import { trainers } from "../trainers/registry";
import { setTimeTopic } from "../lib/timeTracker";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Blocks } from "lucide-react";
import { AnimatedBackground } from "./AnimatedBackground";
import { PointsBadge } from "./PointsBadge";
import { AccountButton } from "./AccountButton";
import { SignInGate } from "./SignInGate";
import { PixelBuddy } from "./PixelBuddy";
import { GameToast } from "./GameToast";
import { formatCode, getAdminSession, useAccount } from "../lib/cloud";
import { ThemeToggle } from "./ThemeToggle";

export function Layout() {
  const { pathname } = useLocation();
  const account = useAccount();
  // trainers open only for signed-in students (or the teacher); the teacher dashboard checks its own code
  const locked = !account && !getAdminSession() && pathname !== "/admin";
  useEffect(() => {
    setTimeTopic(locked ? null : (trainers.find((t) => t.path === pathname)?.id ?? null));
  }, [pathname, locked]);
  const quest = pathname.match(/^\/quest\/(\d+)(\/\d+)?$/);
  // a level of the logic or keyboard game: "/logic/2", "/keys/5"
  const game = pathname.match(/^\/(logic|keys|beacon)\/[\w-]+$/);
  const back =
    pathname === "/" || pathname === "" || pathname === "/python"
      ? null
      : pathname.startsWith("/python/")
        ? { to: "/python", label: "Темы Python" }
        : quest
          ? quest[2]
            ? { to: `/quest/${quest[1]}`, label: "Уровни отсека" }
            : { to: "/quest", label: "Карта станции" }
          : game
            ? game[1] === "logic"
              ? { to: "/logic", label: "Карта острова" }
              : game[1] === "beacon"
                ? { to: "/beacon", label: "Карта маяка" }
                : { to: "/keys", label: "Все уровни" }
            : pathname === "/beacon"
              ? { to: "/quest", label: "Первая станция" }
              : { to: "/", label: "Все тренажёры" };

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100">
      <AnimatedBackground />
      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
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
            {/* points are shown only to a signed-in student or the teacher */}
            {(account || getAdminSession()) && <PointsBadge />}
            <AccountButton />
            <ThemeToggle />
          </div>
        </div>
      </header>
      {/* game levels need room for a big map or the keyboard */}
      <main className={`animate-fade-in relative z-[15] mx-auto px-5 py-8 sm:py-12 ${quest?.[2] || game ? "max-w-7xl" : "max-w-6xl"}`}>
        {locked ? <SignInGate /> : <Outlet />}
      </main>
      <footer className="mx-auto max-w-6xl px-5 py-10 text-center text-sm text-slate-400 dark:text-slate-600">
        <p>Сделано для тех, кто делает первые шаги в программировании</p>
        <p className="mt-1 text-xs text-slate-400/80 dark:text-slate-600">Автор проекта — Татьяна Кондратюк</p>
        {account ? (
          <p className="mt-3 text-xs">
            Прогресс сохраняется в аккаунте {account.owner ? `${account.owner.name} ${account.owner.surname3}. ` : ""}
            <span className="font-mono font-bold tracking-widest">{formatCode(account.code)}</span>
          </p>
        ) : null}
      </footer>
      {!locked && trainers.some((t) => t.path === pathname) && <PixelBuddy key={pathname} />}
      {account && <GameToast />}
    </div>
  );
}
