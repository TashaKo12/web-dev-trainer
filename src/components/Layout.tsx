import { useEffect } from "react";
import { trainers } from "../trainers/registry";
import { setTimeTopic } from "../lib/timeTracker";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Blocks, Layers, UserRound, type LucideIcon } from "lucide-react";
import { AnimatedBackground } from "./AnimatedBackground";
import { PointsBadge } from "./PointsBadge";
import { AccountButton } from "./AccountButton";
import { SignInGate } from "./SignInGate";
import { PixelBuddy } from "./PixelBuddy";
import { GameToast } from "./GameToast";
import { formatCode, getAdminSession, useAccount } from "../lib/cloud";
import { ThemeToggle } from "./ThemeToggle";

/** The narrow menu on the left (from tablets up): all courses and the student's progress. */
const RAIL: { to: string; label: string; icon: LucideIcon; match: (p: string) => boolean }[] = [
  { to: "/", label: "Курсы", icon: Layers, match: (p) => p === "/" || p === "" },
  { to: "/profile", label: "Мой прогресс", icon: UserRound, match: (p) => p.startsWith("/profile") },
];

function SideRail({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Разделы" className="fixed inset-y-0 left-0 z-30 hidden w-[4.25rem] flex-col items-center justify-center gap-3 border-r border-[#e6e7ee] bg-white md:flex dark:border-slate-800 dark:bg-slate-950">
      {RAIL.map(({ to, label, icon: Icon, match }) => {
        const on = match(pathname);
        return (
          <Link
            key={to}
            to={to}
            title={label}
            aria-label={label}
            aria-current={on ? "page" : undefined}
            className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${
              on ? "bg-[#ece6fd] text-[#4d16c9] dark:bg-violet-500/20 dark:text-violet-300" : "text-slate-400 hover:bg-slate-100 hover:text-[#4d16c9] dark:hover:bg-slate-800"
            }`}
          >
            <Icon className="h-6 w-6" strokeWidth={2} />
          </Link>
        );
      })}
    </nav>
  );
}

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
  const game = pathname.match(/^\/(logic|keys|beacon|studio)\/[\w-]+$/);
  // a level is played on one screen: no footer under it, so the page does not scroll
  const level = !!quest?.[2] || (!!game && game[1] !== "studio");
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
                : game[1] === "studio"
                  ? { to: "/studio", label: "Мои игры" }
                : { to: "/keys", label: "Все уровни" }
            : pathname === "/beacon"
              ? { to: "/quest", label: "Первая станция" }
              : { to: "/", label: "Все тренажёры" };

  return (
    <div className="min-h-screen text-slate-800 md:pl-[4.25rem] dark:text-slate-100">
      {/* the soft colour blobs stay only in the dark theme: the light one is flat grey, like a school catalog */}
      <div className="hidden dark:block">
        <AnimatedBackground />
      </div>
      <SideRail pathname={pathname} />
      <header className="sticky top-0 z-20 border-b border-[#e6e7ee] bg-white dark:border-slate-800/80 dark:bg-slate-950/90 dark:backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 px-5 py-3 sm:px-7">
          <a href="https://tashako12.github.io/my-projects/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#5b2ee0] text-[#5b2ee0] dark:border-violet-400 dark:text-violet-300">
              <Blocks className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <span className="hidden leading-none min-[360px]:block">
              <span className="block text-lg font-extrabold uppercase tracking-wide text-[#4d16c9] dark:text-violet-300">Тренажёры</span>
              <span className="block text-[0.625rem] font-semibold text-[#7c5cf0] dark:text-violet-400">программирование для детей</span>
            </span>
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
      <main className={`animate-fade-in relative z-[15] mx-auto px-5 ${level ? "py-4" : "py-6 sm:py-7"} ${pathname.startsWith("/studio/") ? "max-w-none sm:px-4" : quest?.[2] || game ? "max-w-7xl" : "max-w-6xl"}`}>
        {locked ? <SignInGate /> : <Outlet />}
      </main>
      <footer hidden={level} className="mx-auto max-w-6xl px-5 py-10 text-center text-sm text-slate-400 dark:text-slate-600">
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
