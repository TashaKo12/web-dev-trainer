import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { useTotalPoints } from "../lib/storage";

function pointsWord(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "очко";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "очка";
  return "очков";
}

export function PointsBadge() {
  const total = useTotalPoints();
  const [bump, setBump] = useState(false);
  const previous = useRef(total);

  useEffect(() => {
    if (total > previous.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 600);
      previous.current = total;
      return () => clearTimeout(t);
    }
    previous.current = total;
  }, [total]);

  return (
    <div
      title="Очки за все тренажёры: 10 за уровень практики и миссию, 5 за угаданную карточку"
      className={`flex items-center gap-1.5 rounded-full border-2 border-amber-200 bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700 transition-transform duration-300 dark:border-amber-700/60 dark:bg-amber-900/30 dark:text-amber-300 ${
        bump ? "scale-110" : "scale-100"
      }`}
    >
      <Star className="h-4 w-4" strokeWidth={2} />
      <span>
        {total} <span className="hidden sm:inline">{pointsWord(total)}</span>
      </span>
    </div>
  );
}
