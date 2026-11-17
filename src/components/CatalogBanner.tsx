import { Blocks } from "lucide-react";

// The banner at the top of the catalog: a pink-to-violet sky with dots, sparkles and two thin orbits.

/** A four-pointed sparkle centred at (x, y). */
const sparkle = (x: number, y: number, r: number) =>
  `M${x} ${y - r} C${x + r * 0.15} ${y - r * 0.15} ${x + r * 0.15} ${y - r * 0.15} ${x + r} ${y} C${x + r * 0.15} ${y + r * 0.15} ${x + r * 0.15} ${y + r * 0.15} ${x} ${y + r} C${x - r * 0.15} ${y + r * 0.15} ${x - r * 0.15} ${y + r * 0.15} ${x - r} ${y} C${x - r * 0.15} ${y - r * 0.15} ${x - r * 0.15} ${y - r * 0.15} ${x} ${y - r}Z`;

const DOTS: [number, number, number][] = [
  [205, 4, 4], [300, 20, 4], [400, 0, 3], [460, 95, 4], [565, 113, 4], [625, 90, 4], [805, 62, 5], [940, 135, 5],
  [540, 188, 4], [728, 188, 4], [265, 150, 4], [36, 190, 7],
];
const SPARKLES: [number, number, number][] = [
  [50, 43, 7], [365, 79, 7], [660, 128, 7], [863, 170, 7], [1090, 94, 7], [608, 4, 10], [1055, 22, 18], [85, 117, 16], [428, 178, 12],
];

export function CatalogBanner({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="relative mb-5 overflow-hidden rounded-2xl bg-[linear-gradient(90deg,#a84f80_0%,#7d3592_45%,#5124a8_75%,#4720a6_100%)] shadow-[0_10px_30px_rgb(79_31_209/0.18)]">
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 1120 216" preserveAspectRatio="xMidYMid slice">
        <path d="M125 0 C 95 45 85 90 85 118" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.6" />
        <path d="M1055 30 C 1065 140 980 206 825 206" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.6" />
        {DOTS.map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#fff" fillOpacity="0.55" />
        ))}
        {SPARKLES.map(([x, y, r]) => (
          <path key={`${x}-${y}`} d={sparkle(x, y, r)} fill="#fff" fillOpacity="0.7" />
        ))}
      </svg>
      <div className="relative flex min-h-[170px] items-end gap-4 p-6 sm:min-h-[216px] sm:p-7">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#c084fc,#6d28d9_70%)] text-white ring-2 ring-white/40 sm:h-[68px] sm:w-[68px]">
          <Blocks className="h-8 w-8" strokeWidth={2} />
        </span>
        <span className="min-w-0 pb-1">
          <span className="block text-xs font-semibold text-white/75 sm:text-sm">{kicker}</span>
          <span className="block text-xl font-bold text-white sm:text-2xl">{title}</span>
        </span>
      </div>
    </div>
  );
}
