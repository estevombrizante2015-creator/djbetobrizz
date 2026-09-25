"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useExperience } from "@/components/Effects/ExperienceContext";

/**
 * Palavra gigante contornada ao fundo da seção (decorativa).
 * No desktop desliza na horizontal conforme o scroll.
 */
export function AboutBackdrop({ word }: { word: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { isDesktop, reducedMotion } = useExperience();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["6%", "-14%"]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      <motion.p
        style={isDesktop && !reducedMotion ? { x } : undefined}
        className="text-outline absolute bottom-[4%] left-0 font-display text-[clamp(5.5rem,19vw,19rem)] leading-none font-black whitespace-nowrap uppercase opacity-[0.07] lg:top-[6%] lg:bottom-auto"
      >
        {word}
      </motion.p>
    </div>
  );
}
