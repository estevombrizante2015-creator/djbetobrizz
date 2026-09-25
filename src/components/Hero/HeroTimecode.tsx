"use client";

import { useEffect, useRef, useState } from "react";
import { timecode } from "@/lib/utils";
import { useHeroIntro } from "./HeroIntro";

/** Timecode VHS que começa a correr quando o show abre; pausa fora da tela. */
export function HeroTimecode() {
  const { started, reduced } = useHeroIntro();
  const [seconds, setSeconds] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !started || reduced) return;
    let id = 0;
    const io = new IntersectionObserver(([entry]) => {
      window.clearInterval(id);
      if (entry.isIntersecting) id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(id);
    };
  }, [started, reduced]);

  return (
    <span ref={ref} className="tabular-nums">
      {timecode(seconds)}
    </span>
  );
}
