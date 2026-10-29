import { Link, Outlet, useLocation } from "react-router-dom";

export function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/" || location.pathname === "";

  return (
    <div className="min-h-screen text-slate-800">
      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-slate-800">
            <span className="text-2xl">🧩</span>
            <span>Тренажёр веб-разработки</span>
          </Link>
          {!isHome && (
            <Link
              to="/"
              className="rounded-full border-2 border-slate-200 bg-white px-4 py-1.5 text-sm font-bold text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
            >
              ← Все тренажёры
            </Link>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8 sm:py-12">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-5xl px-5 py-10 text-center text-sm text-slate-400">
        Сделано для тех, кто делает первые шаги в вёрстке и JavaScript ✨
      </footer>
    </div>
  );
}
