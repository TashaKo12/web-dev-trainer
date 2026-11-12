import { Children, isValidElement, useEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Check, Dumbbell, Gamepad2, Lock, Sparkles } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { TrainerHero } from "./TrainerHero";
import { WebMissions } from "../missions/WebMissions";
import { emitPixel } from "../lib/pixelBus";
import { loadItem, saveItem } from "../lib/storage";

// A topic page as a slider: theory → game → practice → check. One block on screen at a time.
// The theory must stay open for at least 20 seconds before the student can move on.

const THEORY_SECONDS = 20;

type Kind = "theory" | "game" | "practice" | "check";
type Slide = { kind: Kind; title: string; nodes: ReactNode[] };

const KIND_OF: Record<string, Kind> = { Теория: "theory", Игра: "game", Практика: "practice", "Проверь себя": "check" };
const LABEL: Record<Kind, string> = { theory: "Теория", game: "Игра", practice: "Практика", check: "Проверь себя" };
const ICON = { theory: BookOpen, game: Gamepad2, practice: Dumbbell, check: Sparkles };

function split(children: ReactNode) {
  let hero: ReactNode = null;
  const slides: Slide[] = [];
  for (const child of Children.toArray(children)) {
    if (isValidElement(child) && child.type === TrainerHero) {
      hero = child;
      continue;
    }
    if (isValidElement(child) && child.type === WebMissions) {
      slides.push({ kind: "game", title: "Помоги Пикселю собрать сайт", nodes: [child] });
      continue;
    }
    if (isValidElement(child) && child.type === SectionHeading) {
      const props = (child as ReactElement<{ kicker: string; title: string }>).props;
      slides.push({ kind: KIND_OF[props.kicker] ?? "practice", title: props.title, nodes: [child] });
      continue;
    }
    if (!slides.length) slides.push({ kind: "theory", title: "", nodes: [] });
    slides[slides.length - 1].nodes.push(child);
  }
  return { hero, slides };
}

export function TopicSlider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { hero, slides } = useMemo(() => split(children), [children]);
  const slideKey = `slide:${pathname}`; // view state only — not part of the progress
  const readKey = (i: number) => `theory-read:${pathname}:${i}`;

  const fromUrl = window.location.hash.includes("level=") ? slides.findIndex((s) => s.kind === "practice") : -1;
  const [index, setIndex] = useState(() => {
    if (fromUrl >= 0) return fromUrl;
    const saved = Number(loadItem(slideKey));
    return Number.isInteger(saved) && saved >= 0 && saved < slides.length ? saved : 0;
  });
  const slide = slides[index];
  const isTheory = slide.kind === "theory";
  const alreadyRead = isTheory && loadItem(readKey(index)) === "1";
  const [left, setLeft] = useState(isTheory && !alreadyRead ? THEORY_SECONDS : 0);
  const top = useRef<HTMLDivElement>(null);

  // a new slide: Pixel comes out from behind it, the theory timer starts again if it was not read yet
  useEffect(() => {
    const read = slides[index].kind !== "theory" || loadItem(readKey(index)) === "1";
    setLeft(read ? 0 : THEORY_SECONDS);
    saveItem(slideKey, String(index));
    emitPixel("enter");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, pathname]);

  // the theory clock runs only while the page is in front of the student
  useEffect(() => {
    if (left <= 0) return;
    const t = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setLeft((s) => {
        if (s <= 1) {
          saveItem(readKey(index), "1");
          emitPixel("complete");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left > 0, index]);

  const locked = left > 0;

  function go(i: number) {
    if (i < 0 || i >= slides.length || (i > index && locked)) return;
    setIndex(i);
    requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <div>
      {hero}

      <div ref={top} className="scroll-mt-24">
        <nav className="mb-6 flex flex-wrap items-center gap-2" aria-label="Части темы">
          {slides.map((s, i) => {
            const Icon = ICON[s.kind];
            const active = i === index;
            const blocked = i > index && locked;
            return (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                disabled={blocked}
                aria-current={active ? "step" : undefined}
                className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-sm font-bold transition ${
                  active
                    ? "border-transparent bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow"
                    : blocked
                      ? "cursor-not-allowed border-slate-200 text-slate-300"
                      : "border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600"
                }`}
              >
                {blocked ? <Lock className="h-3.5 w-3.5" strokeWidth={2.2} /> : <Icon className="h-4 w-4" strokeWidth={2} />}
                <span className="hidden sm:inline">{LABEL[s.kind]}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
            );
          })}
        </nav>

        <div key={index} data-slide className="slide-in relative">
          {slide.nodes}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 disabled:invisible"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
            Назад
          </button>

          {locked && (
            <div className="flex min-w-[12rem] flex-1 items-center gap-3 sm:max-w-sm">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${((THEORY_SECONDS - left) / THEORY_SECONDS) * 100}%` }}
                />
              </div>
              <span className="whitespace-nowrap text-xs font-bold text-slate-500">Изучи теорию · {left} с</span>
            </div>
          )}

          {index < slides.length - 1 ? (
            <button
              type="button"
              onClick={() => go(index + 1)}
              disabled={locked}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-2.5 text-sm font-bold text-white shadow transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              {LABEL[slides[index + 1].kind]}
              <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600">
              <Check className="h-4 w-4" strokeWidth={2.5} />
              Последняя часть темы
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
