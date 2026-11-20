import { useEffect, useRef, useState } from "react";
import { rem } from "../quest/Board";

// A level is played on one screen. On a wide screen a side column may be only as tall as the room from its top
// to the bottom of the window; a long program then scrolls inside its own box, not the whole page.

/** bottomGap is in rem: the page's padding under the column. */
export function useRoomBelow<T extends HTMLElement>(bottomGap = 1) {
  const ref = useRef<T>(null);
  const [room, setRoom] = useState<number | undefined>(undefined);
  useEffect(() => {
    const fit = () => {
      const el = ref.current;
      if (!el || window.innerWidth < 1024) return setRoom(undefined);
      const top = el.getBoundingClientRect().top + window.scrollY;
      const r = window.innerHeight - top - bottomGap * rem();
      setRoom(r > 14 * rem() ? r : undefined);
    };
    fit();
    window.addEventListener("resize", fit);
    const t = setTimeout(fit, 300); // after fonts and pictures settle
    // the text above can change (another level, a new hint): measure again
    const ro = new ResizeObserver(fit);
    ro.observe(document.body);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
      clearTimeout(t);
    };
  }, [bottomGap]);
  return { ref, room };
}
