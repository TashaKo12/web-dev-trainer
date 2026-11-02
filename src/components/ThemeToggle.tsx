import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { applyTheme, getInitialTheme, type Theme } from "../lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      aria-label={theme === "dark" ? "Включить светлый фон" : "Включить тёмный фон"}
      title={theme === "dark" ? "Светлый фон" : "Тёмный фон"}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-slate-600 hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" strokeWidth={2} /> : <Moon className="h-4 w-4" strokeWidth={2} />}
    </button>
  );
}
