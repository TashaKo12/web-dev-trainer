export function computeMatches(
  container: HTMLElement | null,
  selector: string,
): { keys: Set<string>; error: string | null } {
  if (!container || !selector.trim()) {
    return { keys: new Set(), error: null };
  }
  try {
    const matched = container.querySelectorAll<HTMLElement>(selector);
    const keys = new Set<string>();
    matched.forEach((el) => {
      const key = el.getAttribute("data-trainer-key");
      if (key) keys.add(key);
    });
    return { keys, error: null };
  } catch {
    return { keys: new Set(), error: "Невалидный CSS-селектор" };
  }
}

export function FakePage({
  targetKeys,
  matchedKeys,
}: {
  targetKeys?: Set<string>;
  matchedKeys: Set<string>;
}) {
  function cls(key: string, base: string) {
    const isTarget = targetKeys?.has(key);
    const isMatched = matchedKeys.has(key);
    return [
      base,
      "rounded transition-colors",
      isTarget ? "outline outline-2 outline-dashed outline-lime-500" : "",
      isMatched ? "bg-fuchsia-200" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white p-4 text-sm">
      <header id="site-header" data-trainer-key="header" className={cls("header", "mb-3 bg-slate-50 p-3")}>
        <h1 data-trainer-key="logo" className={cls("logo", "mb-2 text-base font-extrabold text-slate-700")}>
          MySite
        </h1>
        <nav data-trainer-key="nav" className={cls("nav", "bg-white p-2")}>
          <ul className="flex gap-2">
            <li data-trainer-key="li1" className={cls("li1", "nav-item px-1")}>
              <a
                href="#!"
                data-trainer-key="a1"
                className={cls("a1", "nav-link active block px-2 py-1 text-xs font-bold text-indigo-700")}
              >
                Главная
              </a>
            </li>
            <li data-trainer-key="li2" className={cls("li2", "nav-item px-1")}>
              <a
                href="#!"
                data-trainer-key="a2"
                className={cls("a2", "nav-link block px-2 py-1 text-xs font-bold text-slate-600")}
              >
                О нас
              </a>
            </li>
            <li data-trainer-key="li3" className={cls("li3", "nav-item px-1")}>
              <a
                href="#!"
                data-trainer-key="a3"
                className={cls("a3", "nav-link block px-2 py-1 text-xs font-bold text-slate-600")}
              >
                Контакты
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <main data-trainer-key="main" className={cls("main", "mb-3 grid gap-2 bg-slate-50 p-3 sm:grid-cols-3")}>
        <article
          data-featured="true"
          data-trainer-key="art1"
          className={cls("art1", "card featured bg-white p-2")}
        >
          <h2 data-trainer-key="h2-1" className={cls("h2-1", "mb-1 text-sm font-bold text-slate-700")}>
            Первая статья
          </h2>
          <p data-trainer-key="p-1" className={cls("p-1", "text-xs text-slate-500")}>
            Эта статья отмечена как избранная.
          </p>
        </article>
        <article data-trainer-key="art2" className={cls("art2", "card bg-white p-2")}>
          <h2 data-trainer-key="h2-2" className={cls("h2-2", "mb-1 text-sm font-bold text-slate-700")}>
            Вторая статья
          </h2>
          <p data-trainer-key="p-2" className={cls("p-2", "text-xs text-slate-500")}>
            Обычная статья без пометок.
          </p>
        </article>
        <article data-trainer-key="art3" className={cls("art3", "card bg-white p-2")}>
          <h2 data-trainer-key="h2-3" className={cls("h2-3", "mb-1 text-sm font-bold text-slate-700")}>
            Третья статья
          </h2>
          <p data-trainer-key="p-3" className={cls("p-3", "text-xs text-slate-500")}>
            Тоже обычная статья.
          </p>
        </article>
      </main>

      <footer id="site-footer" data-trainer-key="footer" className={cls("footer", "bg-slate-50 p-3")}>
        <p data-trainer-key="footer-p" className={cls("footer-p", "text-xs text-slate-400")}>
          © 2026 MySite
        </p>
      </footer>
    </div>
  );
}
