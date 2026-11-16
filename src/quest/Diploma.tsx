import { Printer } from "lucide-react";
import { PixelFigure } from "../components/PixelBuddy";
import { formatOwner, useAccount } from "../lib/cloud";
import { BAYS } from "./data";
import { BoltFigure } from "./Dialogue";
import { useQuest } from "./progress";

// The end of «Тайна станции»: a diploma with the student's name. Printing shows only the diploma.

export function Diploma() {
  const account = useAccount();
  const save = useQuest();
  const levels = BAYS.flatMap((b) => b.levels);
  const stars = levels.reduce((s, l) => s + (save.stars[l.id] ?? 0), 0);
  const name = account?.owner ? formatOwner(account.owner) : "Юный программист";
  const date = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="quest-diploma relative overflow-hidden rounded-[2rem] border-[6px] border-double border-amber-400 bg-gradient-to-br from-amber-50 via-white to-violet-50 p-8 text-center text-[#1e293b] shadow-2xl sm:p-10">
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-violet-200/50 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-amber-200/60 blur-2xl" />
        <p className="relative text-sm font-extrabold uppercase tracking-[0.35em] text-[#d97706]">Диплом</p>
        <h2 className="relative mt-2 text-3xl font-black text-[#6d28d9] sm:text-4xl">Главный инженер станции</h2>
        <p className="relative mt-5 text-[#64748b]">Этот диплом получает</p>
        <p className="relative mt-1 font-serif text-3xl italic text-[#0f172a] sm:text-4xl">{name}</p>
        <p className="relative mx-auto mt-5 max-w-md text-[#475569]">
          за спасение станции «Алгоритм»: с твоей помощью робот Пиксель научился думать как программист — шагать, повторять, выбирать, ждать
          выхода и создавать свои команды. Сердце станции открыто!
        </p>
        <div className="relative mt-6 flex items-center justify-center gap-6">
          <div className="pixel-bot quest-bot h-20" data-mood="love">
            <PixelFigure />
          </div>
          <div className="text-left">
            <p className="text-2xl font-black text-amber-500">⭐ {stars} из {levels.length * 3}</p>
            <p className="text-sm font-bold text-[#64748b]">🔑 6 ключей · 📜 дневник Создательницы</p>
          </div>
          <BoltFigure className="h-20 w-auto" />
        </div>
        <div className="relative mt-6 flex items-end justify-between text-sm text-[#64748b]">
          <span>{date}</span>
          <span className="font-serif italic">Создательница станции, Пиксель и Болтик</span>
        </div>
      </div>
      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-extrabold text-white shadow"
        >
          <Printer className="h-5 w-5" strokeWidth={2.2} /> Распечатать диплом
        </button>
      </div>
    </div>
  );
}
