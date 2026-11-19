import { useEffect, useRef, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import { Game, type GameStatus } from "./engine";
import { isColor, isImage, type Look, type Project } from "./model";

/** An object's picture in the editor: emoji, colour block or uploaded image. */
export function LookView({ look, className = "" }: { look: Look; className?: string }) {
  if (isColor(look)) return <span className={`block rounded-md ${className}`} style={{ background: look }} />;
  if (isImage(look)) return <img src={look} alt="" draggable={false} className={`block object-contain ${className}`} />;
  return <span className={`flex items-center justify-center leading-none ${className}`}>{look}</span>;
}

/** The game window: runs the project from the chosen scene until the child closes it. */
export function Player({ project, sceneId, onClose }: { project: Project; sceneId: string; onClose: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<GameStatus | null>(null);
  const [round, setRound] = useState(0);
  const scene = project.scenes.find((s) => s.id === sceneId) ?? project.scenes[0];

  useEffect(() => {
    const game = new Game(project, canvas.current!, setStatus);
    game.start(sceneId);
    canvas.current!.focus();
    return () => game.destroy();
  }, [project, sceneId, round]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-[#0b1026]/90 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 text-white">
        <p className="font-bold">
          ▶ {project.name} · {scene.name}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setRound((r) => r + 1)} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20">
            <RotateCcw className="h-4 w-4" strokeWidth={2.2} /> Заново
          </button>
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 rounded-lg bg-[#4d16c9] px-4 py-2 text-sm font-semibold hover:bg-[#4514b5]">
            <X className="h-4 w-4" strokeWidth={2.4} /> Стоп (Esc)
          </button>
        </div>
      </div>
      <div className="relative w-full max-w-5xl" style={{ aspectRatio: `${scene.w} / ${scene.h}`, maxHeight: "78vh" }}>
        <canvas ref={canvas} tabIndex={0} className="h-full w-full rounded-xl bg-white shadow-2xl outline-none [image-rendering:auto]" />
        {status && Object.keys(status.vars).length > 0 && (
          <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2">
            {Object.entries(status.vars).map(([k, v]) => (
              <span key={k} className="rounded-lg bg-black/55 px-3 py-1 text-sm font-bold text-white">
                {k}: {v}
              </span>
            ))}
          </div>
        )}
        {status?.message && !status.stopped && (
          <p className="pointer-events-none absolute inset-x-0 bottom-4 mx-auto w-fit max-w-[90%] rounded-xl bg-black/60 px-4 py-2 text-center font-bold text-white">{status.message}</p>
        )}
        {status?.stopped && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl bg-black/55 text-center">
            <p className="px-6 text-3xl font-extrabold text-white drop-shadow">{status.stopped}</p>
            <button type="button" onClick={() => setRound((r) => r + 1)} className="rounded-lg bg-[#4d16c9] px-5 py-2.5 font-semibold text-white hover:bg-[#4514b5]">
              Играть ещё раз
            </button>
          </div>
        )}
      </div>
      <p className="text-sm text-white/60">Управление: стрелки (или W A S D), прыжок — стрелка вверх или пробел. Мышью можно кликать по объектам.</p>
    </div>
  );
}
