import type { ReactNode } from "react";

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

/** The pink-to-violet sky with dots, sparkles and orbits; the content goes on top. Used by the catalog and every topic page. */
export function BannerFrame({ children, className = "mb-5" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[linear-gradient(90deg,#a84f80_0%,#7d3592_45%,#5124a8_75%,#4720a6_100%)] shadow-[0_10px_30px_rgb(79_31_209/0.18)] ${className}`}>
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
      <div className="relative">{children}</div>
    </div>
  );
}

/**
 * The wide header of a page: a header picture (public/headers/<image>.png, 2480 × 460), or the sky while a page
 * has no picture yet. No text or logo on top; the title stays in the page for screen readers.
 */
export function PageHeader({ title, note, image, className = "mb-5" }: { title: string; note?: ReactNode; image?: string; className?: string }) {
  const text = (
    <>
      <h1 className="sr-only">{title}</h1>
      {note && <p className="sr-only">{note}</p>}
    </>
  );
  if (image)
    return (
      <div className={`overflow-hidden rounded-2xl shadow-[0_10px_30px_rgb(79_31_209/0.18)] ${className}`}>
        <img src={`${import.meta.env.BASE_URL}headers/${image}.png`} alt="" width={2480} height={460} className="block h-auto w-full" />
        {text}
      </div>
    );
  return (
    <BannerFrame className={className}>
      <div className="h-[140px] sm:h-[200px]" />
      {text}
    </BannerFrame>
  );
}

/** The banner of a section page. The label and icon are kept in the call sites for later, but not drawn now. */
export function CatalogBanner({ title, note, image }: { kicker: string; title: string; note?: ReactNode; icon?: ReactNode; image?: string }) {
  return <PageHeader title={title} note={note} image={image} />;
}
