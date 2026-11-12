// Lets any task tell the mascot what just happened, without passing props through the page.

export type PixelEvent = "correct" | "wrong" | "complete" | "streak" | "achievement";

const listeners = new Set<(e: PixelEvent) => void>();

export function emitPixel(e: PixelEvent) {
  listeners.forEach((l) => l(e));
}

export function onPixel(listener: (e: PixelEvent) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
