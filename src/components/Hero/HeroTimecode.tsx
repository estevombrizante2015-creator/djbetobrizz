"use client";

import { useEffect, useRef, useState } from "react";
import { timecode } from "@/lib/utils";
import { useHeroIntro } from "./HeroIntro";

/** Timecode VHS que começa a correr quando o show abre; pausa fora da tela e com a aba oculta. */
export function HeroTimecode() {
  const { started, reduced } = useHeroIntro();
  const [seconds, setSeconds] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !started || reduced) return;
    let id = 0;
    let inView = false;
    const sync = () => {
      window.clearInterval(id);
      id = 0;
      if (inView && !document.hidden) id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.clearInterval(id);
    };
  }, [started, reduced]);

  return (
    <span ref={ref} className="tabular-nums">
      {timecode(seconds)}
    </span>
  );
}
