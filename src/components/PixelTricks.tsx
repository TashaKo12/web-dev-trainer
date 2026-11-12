import { useEffect, useState } from "react";
import { PixelFigure } from "./PixelBuddy";

// Pixel at the bottom of the page showing off tricks one after another.

type Trick = { id: string; say: string; mood: string };

const TRICKS: Trick[] = [
  { id: "flip", say: "Сальто назад!", mood: "happy" },
  { id: "juggle", say: "Жонглирую тегами!", mood: "wink" },
  { id: "handstand", say: "Стойка на руках!", mood: "silly" },
  { id: "moonwalk", say: "Лунная походка!", mood: "happy" },
  { id: "dance", say: "Танец роботов!", mood: "love" },
  { id: "spin", say: "Волчок!", mood: "surprised" },
];

export function PixelTricks() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % TRICKS.length), 3600);
    return () => clearInterval(t);
  }, []);

  const trick = TRICKS[i];

  return (
    <div className="pixel-tricks" aria-hidden="true">
      <p key={trick.id} className="pixel-tricks-say">
        {trick.say}
      </p>
      <div className="pixel-tricks-stage">
        {trick.id === "juggle" && (
          <div className="pt-balls">
            <span className="pt-ball pt-ball-1">&lt;p&gt;</span>
            <span className="pt-ball pt-ball-2">&lt;h1&gt;</span>
            <span className="pt-ball pt-ball-3">&lt;a&gt;</span>
          </div>
        )}
        <div key={trick.id} className={`pixel-bot pt-bot trick-${trick.id}`} data-mood={trick.mood}>
          <PixelFigure />
        </div>
        <div className="pt-ground" />
      </div>
    </div>
  );
}
