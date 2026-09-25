"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import { ExperienceProvider } from "@/components/Effects/ExperienceContext";

/** Recursos de animação baixados depois da hidratação — o JS inicial fica menor. */
const loadMotionFeatures = () => import("@/lib/motion-features").then((mod) => mod.default);

/**
 * Providers globais:
 * - LazyMotion: componentes usam `m.div` (de "motion/react"), cujos recursos chegam sob demanda.
 * - MotionConfig: respeita prefers-reduced-motion em todas as animações do motion.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadMotionFeatures}>
      <MotionConfig reducedMotion="user">
        <ExperienceProvider>{children}</ExperienceProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
