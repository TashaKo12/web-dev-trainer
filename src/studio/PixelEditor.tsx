import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Eraser, FlipHorizontal, PaintBucket, Pencil, Pipette, RotateCcw, Trash2, X } from "lucide-react";
import { isColor, isImage, type Look } from "./model";

// A small pixel-art editor: the child draws their own hero cell by cell. The picture is saved as a PNG
// (each cell becomes 4×4 real pixels, so it stays sharp on the scene) and works like any uploaded picture.

type Tool = "pen" | "eraser" | "fill" | "picker";
const PALETTE = [
  "#000000", "#ffffff", "#9ca3af", "#4b5563",
  "#ef4444", "#f97316", "#facc15", "#22c55e",
  "#14b8a6", "#3b82f6", "#6366f1", "#a855f7",
  "#ec4899", "#7c2d12", "#fcd9b6", "#166534",
];
const EXPORT_SCALE = 4;
const VIEW = 480; // the drawing area, in screen pixels

const blank = (n: number) => Array<string>(n * n).fill("");

/** Turns the current look into cells: a drawn/uploaded picture, an emoji, or a colour. */
function lookToCells(look: Look | undefined, size: number): Promise<string[]> {
  return new Promise((resolve) => {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    const read = () => {
      const d = ctx.getImageData(0, 0, size, size).data;
      const cells: string[] = [];
      for (let i = 0; i < size * size; i++) {
        const [r, g, b, a] = [d[i * 4], d[i * 4 + 1], d[i * 4 + 2], d[i * 4 + 3]];
        cells.push(a < 128 ? "" : `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`);
      }
      resolve(cells);
    };
    if (!look) return resolve(blank(size));
    if (isColor(look)) return resolve(Array(size * size).fill(look));
    if (isImage(look)) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, size, size);
        read();
      };
      img.onerror = () => resolve(blank(size));
      img.src = look;
      return;
    }
    ctx.font = `${Math.round(size * 0.9)}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(look, size / 2, size / 2 + size * 0.05);
    read();
  });
}

export function PixelEditor({ look, onSave, onClose }: { look?: Look; onSave: (dataUrl: string) => void; onClose: () => void }) {
  const [size, setSize] = useState(32);
  const [cells, setCells] = useState<string[]>(() => blank(32));
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#3b82f6");
  const [mirror, setMirror] = useState(false);
  const [history, setHistory] = useState<string[][]>([]);
  const [grid, setGrid] = useState(true);
  const canvas = useRef<HTMLCanvasElement>(null);
  const preview = useRef<HTMLCanvasElement>(null);
  const drawing = useRef<{ last: number } | null>(null);

  // start from the object's current picture
  useEffect(() => {
    lookToCells(look, 32).then(setCells);
  }, [look]);

  // draw the cells
  useEffect(() => {
    for (const [el, cell, lines] of [
      [canvas.current, VIEW / size, grid],
      [preview.current, 64 / size, false],
    ] as const) {
      if (!el) continue;
      const ctx = el.getContext("2d")!;
      ctx.clearRect(0, 0, el.width, el.height);
      for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
          const c = cells[y * size + x];
          if (c) ctx.fillStyle = c;
          else ctx.fillStyle = (x + y) % 2 ? "#e5e7eb" : "#f8fafc"; // transparent shows as a chessboard
          ctx.fillRect(x * cell, y * cell, cell, cell);
        }
      if (lines) {
        ctx.strokeStyle = "rgb(0 0 0 / 0.08)";
        ctx.lineWidth = 1;
        for (let i = 1; i < size; i++) {
          ctx.beginPath();
          ctx.moveTo(i * cell + 0.5, 0);
          ctx.lineTo(i * cell + 0.5, VIEW);
          ctx.moveTo(0, i * cell + 0.5);
          ctx.lineTo(VIEW, i * cell + 0.5);
          ctx.stroke();
        }
        if (mirror) {
          ctx.strokeStyle = "rgb(124 58 237 / 0.6)";
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(VIEW / 2, 0);
          ctx.lineTo(VIEW / 2, VIEW);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }
  }, [cells, size, grid, mirror]);

  const cellAt = (e: PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * size);
    const y = Math.floor(((e.clientY - r.top) / r.height) * size);
    return x < 0 || y < 0 || x >= size || y >= size ? -1 : y * size + x;
  };

  function paint(next: string[], i: number) {
    const value = tool === "eraser" ? "" : color;
    next[i] = value;
    if (mirror) {
      const x = i % size;
      const y = Math.floor(i / size);
      next[y * size + (size - 1 - x)] = value;
    }
  }

  function fill(next: string[], start: number) {
    const target = next[start];
    if (target === color) return;
    const stack = [start];
    while (stack.length) {
      const i = stack.pop()!;
      if (next[i] !== target) continue;
      next[i] = color;
      const x = i % size;
      if (x > 0) stack.push(i - 1);
      if (x < size - 1) stack.push(i + 1);
      if (i >= size) stack.push(i - size);
      if (i < size * (size - 1)) stack.push(i + size);
    }
  }

  function down(e: PointerEvent) {
    const i = cellAt(e);
    if (i < 0) return;
    if (tool === "picker") {
      if (cells[i]) setColor(cells[i]);
      setTool("pen");
      return;
    }
    setHistory((h) => [...h.slice(-30), cells]);
    const next = [...cells];
    if (tool === "fill") fill(next, i);
    else {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      drawing.current = { last: i };
      paint(next, i);
    }
    setCells(next);
  }

  function move(e: PointerEvent) {
    const d = drawing.current;
    if (!d) return;
    const i = cellAt(e);
    if (i < 0 || i === d.last) return;
    // fill the cells between the last and this one, so a quick stroke has no gaps
    const [x0, y0, x1, y1] = [d.last % size, Math.floor(d.last / size), i % size, Math.floor(i / size)];
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    setCells((prev) => {
      const next = [...prev];
      for (let s = 1; s <= steps; s++) paint(next, Math.round(y0 + ((y1 - y0) * s) / steps) * size + Math.round(x0 + ((x1 - x0) * s) / steps));
      return next;
    });
    d.last = i;
  }

  function undo() {
    setHistory((h) => {
      if (!h.length) return h;
      setCells(h[h.length - 1]);
      return h.slice(0, -1);
    });
  }

  function resize(n: number) {
    lookToCells(exportPng(), n).then((c) => {
      setHistory((h) => [...h, cells]);
      setSize(n);
      setCells(c);
    });
  }

  function flip() {
    setHistory((h) => [...h, cells]);
    setCells((prev) => prev.map((_, i) => prev[Math.floor(i / size) * size + (size - 1 - (i % size))]));
  }

  function exportPng() {
    const c = document.createElement("canvas");
    c.width = c.height = size * EXPORT_SCALE;
    const ctx = c.getContext("2d")!;
    cells.forEach((v, i) => {
      if (!v) return;
      ctx.fillStyle = v;
      ctx.fillRect((i % size) * EXPORT_SCALE, Math.floor(i / size) * EXPORT_SCALE, EXPORT_SCALE, EXPORT_SCALE);
    });
    return c.toDataURL("image/png");
  }

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ") {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  const toolBtn = (t: Tool, label: string, Icon: typeof Pencil) => (
    <button
      type="button"
      onClick={() => setTool(t)}
      title={label}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${tool === t ? "bg-[#7046ec] text-white" : "bg-[#2a2c36] text-[#d1d5db] hover:bg-[#343744]"}`}
    >
      <Icon className="h-4 w-4" strokeWidth={2.2} /> {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3">
      <div className="max-h-[96vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-[#2e3039] bg-[#1f2028] text-[#e5e7eb] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#2e3039] px-4 py-3">
          <p className="font-bold">🎨 Нарисуй своего персонажа</p>
          <button type="button" onClick={onClose} aria-label="Закрыть" className="rounded p-1 text-[#9ca3af] hover:bg-[#2a2c36] hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-[auto_minmax(0,1fr)]">
          <canvas
            ref={canvas}
            width={VIEW}
            height={VIEW}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={() => (drawing.current = null)}
            className={`aspect-square w-full max-w-[480px] touch-none rounded-lg border border-[#2e3039] ${tool === "picker" ? "cursor-copy" : "cursor-crosshair"}`}
          />
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-1.5">
              {toolBtn("pen", "Карандаш", Pencil)}
              {toolBtn("eraser", "Ластик", Eraser)}
              {toolBtn("fill", "Заливка", PaintBucket)}
              {toolBtn("picker", "Пипетка", Pipette)}
            </div>
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-[#9ca3af]">Цвет</p>
              <div className="grid grid-cols-8 gap-1">
                {PALETTE.map((c) => (
                  <button key={c} type="button" aria-label={`Цвет ${c}`} onClick={() => (setColor(c), tool === "eraser" && setTool("pen"))} className={`h-7 rounded ${color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#1f2028]" : ""}`} style={{ background: c }} />
                ))}
              </div>
              <label className="mt-2 flex items-center gap-2 text-sm text-[#d1d5db]">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-12 cursor-pointer rounded border border-[#2e3039] bg-transparent" />
                свой цвет
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5 text-sm">
              <button type="button" onClick={() => setMirror((m) => !m)} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold ${mirror ? "bg-[#7046ec] text-white" : "bg-[#2a2c36] text-[#d1d5db]"}`}>
                🪞 Зеркально
              </button>
              <button type="button" onClick={flip} className="inline-flex items-center gap-1.5 rounded-lg bg-[#2a2c36] px-3 py-1.5 font-semibold text-[#d1d5db] hover:bg-[#343744]">
                <FlipHorizontal className="h-4 w-4" /> Отразить
              </button>
              <button type="button" onClick={undo} disabled={!history.length} className="inline-flex items-center gap-1.5 rounded-lg bg-[#2a2c36] px-3 py-1.5 font-semibold text-[#d1d5db] hover:bg-[#343744] disabled:opacity-40">
                <RotateCcw className="h-4 w-4" /> Отменить
              </button>
              <button type="button" onClick={() => (setHistory((h) => [...h, cells]), setCells(blank(size)))} className="inline-flex items-center gap-1.5 rounded-lg bg-[#2a2c36] px-3 py-1.5 font-semibold text-[#d1d5db] hover:bg-[#343744]">
                <Trash2 className="h-4 w-4" /> Очистить
              </button>
              <button type="button" onClick={() => setGrid((g) => !g)} className="rounded-lg bg-[#2a2c36] px-3 py-1.5 font-semibold text-[#d1d5db] hover:bg-[#343744]">
                {grid ? "Скрыть сетку" : "Показать сетку"}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <canvas ref={preview} width={64} height={64} className="rounded border border-[#2e3039] [image-rendering:pixelated]" />
              <div className="text-sm text-[#9ca3af]">
                <p>Так персонаж будет выглядеть в игре.</p>
                <label className="mt-1 flex items-center gap-2">
                  Клеток:
                  <select value={size} onChange={(e) => resize(Number(e.target.value))} className="rounded bg-[#2a2c36] px-2 py-1 text-[#e5e7eb]">
                    <option value={16}>16 × 16 (крупно)</option>
                    <option value={32}>32 × 32</option>
                  </select>
                </label>
              </div>
            </div>
            <p className="text-xs text-[#9ca3af]">Пустые клетки (в шашечку) будут прозрачными. «Зеркально» рисует сразу обе половинки — удобно для лица и тела.</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => onSave(exportPng())} className="flex-1 rounded-lg bg-[#7046ec] py-2.5 font-bold text-white hover:bg-[#5e38d6]">
                Сохранить персонажа
              </button>
              <button type="button" onClick={onClose} className="rounded-lg bg-[#2a2c36] px-4 py-2.5 font-semibold text-[#d1d5db] hover:bg-[#343744]">
                Отмена
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
