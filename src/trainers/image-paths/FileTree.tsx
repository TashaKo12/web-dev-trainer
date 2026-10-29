export function FileTree({ openFile, highlight }: { openFile: string; highlight?: string[] }) {
  function row(path: string, label: string, depth: number, isFolder = false) {
    const active = path === openFile;
    const target = !isFolder && highlight?.includes(path);
    return (
      <div
        style={{ paddingLeft: depth * 16 }}
        className={`flex items-center gap-1.5 rounded px-1.5 py-0.5 font-mono text-xs ${
          active ? "bg-teal-100 font-bold text-teal-800" : target ? "bg-amber-100 font-bold text-amber-800" : "text-slate-600"
        }`}
      >
        <span>{isFolder ? "📁" : active ? "📝" : "🗎"}</span>
        <span>{label}</span>
        {active && <span className="ml-1 rounded-full bg-teal-600 px-1.5 text-[10px] font-bold text-white">открыт</span>}
        {target && <span className="ml-1 rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">🎯 цель</span>}
      </div>
    );
  }

  return (
    <div className="space-y-0.5 rounded-2xl bg-slate-50 p-4">
      {row("", "проект/", 0, true)}
      {row("index.html", "index.html", 1)}
      {row("style.css", "style.css", 1)}
      {row("cat.jpg", "cat.jpg", 1)}
      {row("Logo.png", "Logo.png", 1)}
      {row("images", "images/", 1, true)}
      {row("images/sunset.jpg", "sunset.jpg", 2)}
      {row("images/gallery", "gallery/", 2, true)}
      {row("images/gallery/forest.jpg", "forest.jpg", 3)}
      {row("pages", "pages/", 1, true)}
      {row("pages/about.html", "about.html", 2)}
    </div>
  );
}
