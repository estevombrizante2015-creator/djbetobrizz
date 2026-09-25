"use client";

import { MotionConfig } from "motion/react";
import { ExperienceProvider } from "@/components/Effects/ExperienceContext";

/** Providers globais: respeita prefers-reduced-motion em todas as animações do motion. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ExperienceProvider>{children}</ExperienceProvider>
    </MotionConfig>
  );
}
