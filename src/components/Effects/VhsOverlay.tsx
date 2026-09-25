"use client";

import { useEffect, useRef, useState } from "react";
import { useExperience } from "./ExperienceContext";
import { cn, timecode } from "@/lib/utils";

type Props = {
  /** Texto do canto superior direito (ex.: "PLAY", "REC"). */
  mode?: "PLAY" | "REC" | "PAUSE";
  /** Rótulo do canto inferior (ex.: "TRACK 04"). */
  track?: string;
  /** Timecode inicial em segundos. */
  start?: number;
  className?: string;
};

/**
 * Elementos decorativos inspirados em VHS: REC ●, PLAY, timecode e TRACK.
 * Posicionado absolutamente dentro de um pai `relative`. Puramente decorativo.
 */
export function VhsOverlay({ mode = "PLAY", track = "TRACK 04", start = 92, className }: Props) {
  const { reducedMotion } = useExperience();
  const [seconds, setSeconds] = useState(start);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    let id = 0;
    const io = new IntersectionObserver(([e]) => {
      window.clearInterval(id);
      if (e.isIntersecting) id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(id);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("vhs pointer-events-none absolute inset-0 z-10 p-4 text-base text-white/90 sm:p-6 sm:text-xl", className)}
    >
      <div className="flex items-start justify-between">
        <span className="flex items-center gap-2">
          {mode === "REC" ? <span className="animate-rec text-red">●</span> : null}
          {mode}
          {mode === "PLAY" ? <span>▶</span> : null}
        </span>
        <span className="flex items-center gap-2">
          <span className="animate-rec text-red">●</span> REC
        </span>
      </div>
      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between sm:inset-x-6 sm:bottom-6">
        <span>{track}</span>
        <span className="tabular-nums">{timecode(seconds)}</span>
      </div>
    </div>
  );
}
