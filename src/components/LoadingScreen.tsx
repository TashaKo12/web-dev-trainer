import { useEffect, useState } from "react";

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const startFade = setTimeout(() => setFading(true), 1100);
    const finish = setTimeout(onDone, 1500);
    return () => {
      clearTimeout(startFade);
      clearTimeout(finish);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 transition-opacity duration-400 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-blob bg-blob-a -left-20 -top-20 h-80 w-80 bg-white/10" />
        <div className="bg-blob bg-blob-c -bottom-24 -right-16 h-96 w-96 bg-white/10" />
      </div>

      <div className="animate-logo-pulse mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 text-5xl shadow-xl backdrop-blur-sm">
        🧩
      </div>
      <p className="mb-1 text-xl font-extrabold tracking-wide text-white">Тренажёр веб-разработки</p>
      <p className="mb-7 text-sm text-indigo-100">Загружаем интерактивные задания…</p>
      <div className="h-1.5 w-56 overflow-hidden rounded-full bg-white/20">
        <div className="animate-loading-bar h-full rounded-full bg-white" />
      </div>
    </div>
  );
}
