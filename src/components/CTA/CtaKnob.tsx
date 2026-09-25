"use client";

import { lazy, Suspense, type ReactNode } from "react";
import { useExperience } from "@/components/Effects/ExperienceContext";

/** Versão ligada ao scroll: só baixada em desktops capazes. */
const CtaKnobLive = lazy(() => import("./CtaKnobLive").then((mod) => ({ default: mod.CtaKnobLive })));

type Props = {
  className?: string;
  /** Knob estático no MÁXIMO, renderizado no servidor (SSR, modo leve, movimento reduzido). */
  fallback: ReactNode;
};

/**
 * Knob do logo (o "O" de BETO) como controle de mixer — "turn up the moment".
 * Modo completo: gira de MIN a MAX conforme o visitante rola até o contato.
 * Modo leve / movimento reduzido: parado no máximo (markup do servidor, sem JS por frame).
 */
export function CtaKnob({ className, fallback }: Props) {
  const { isDesktop, reducedMotion } = useExperience();
  if (!isDesktop || reducedMotion) return fallback;
  return (
    <Suspense fallback={fallback}>
      <CtaKnobLive className={className} />
    </Suspense>
  );
}
