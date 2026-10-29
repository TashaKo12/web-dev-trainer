import { evaluatePath } from "./resolvePath";

export function ImagePreview({ currentDir, src, alt }: { currentDir: string; src: string; alt: string }) {
  const result = evaluatePath(currentDir, src);

  if (result.kind === "empty") {
    return (
      <div className="flex h-36 w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
        Впиши путь в src, чтобы увидеть результат
      </div>
    );
  }

  if (result.kind === "image") {
    return (
      <div className="flex h-36 w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-emerald-300 bg-emerald-50">
        <div className="text-5xl">{result.info.emoji}</div>
        <div className="text-sm font-bold text-emerald-700">Картинка загрузилась ✅</div>
        <div className="font-mono text-xs text-emerald-600">{result.path}</div>
      </div>
    );
  }

  if (result.kind === "external") {
    return (
      <div className="flex h-36 w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-sky-300 bg-sky-50">
        <div className="text-4xl">🌐</div>
        <div className="text-sm font-bold text-sky-700">Внешняя картинка из интернета — браузер попробует её скачать</div>
      </div>
    );
  }

  if (result.kind === "other-file") {
    return (
      <div className="flex h-36 w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-amber-300 bg-amber-50 px-4 text-center">
        <div className="text-4xl">📄</div>
        <div className="text-sm font-bold text-amber-700">
          Путь ведёт к файлу «{result.path}», но это не картинка
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-36 w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-rose-300 bg-rose-50 px-4 text-center">
      <div className="text-4xl">🖼️🚫</div>
      <div className="text-sm font-bold text-rose-600">Картинка не найдена (как будто ошибка 404)</div>
      <div className="font-mono text-xs text-rose-500">браузер искал: {result.path || "(пусто)"}</div>
      {alt && <div className="mt-1 text-xs italic text-slate-400">alt: «{alt}»</div>}
    </div>
  );
}
