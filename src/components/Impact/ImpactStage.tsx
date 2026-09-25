"use client";

import { lazy, Suspense, type ReactNode } from "react";
import { useExperience } from "@/components/Effects/ExperienceContext";

/** Palco com scroll + partículas + lasers: só baixado em desktops capazes. */
const ImpactStageFull = lazy(() => import("./ImpactStageFull").then((mod) => ({ default: mod.ImpactStageFull })));

type Props = {
  /** Camadas de fundo renderizadas no servidor (imagem + gradientes). */
  backdrop: ReactNode;
  /** Quadro estático renderizado no servidor — SSR, modo leve e movimento reduzido. */
  fallback: ReactNode;
};

/**
 * Escolhe a versão da frase de impacto pelo nível de efeitos.
 * SSR e 1º render do cliente usam sempre o quadro estático (sem divergência de hidratação);
 * em desktop capaz troca pelo trilho com scroll, carregado sob demanda.
 */
export function ImpactStage({ backdrop, fallback }: Props) {
  const { isDesktop, reducedMotion } = useExperience();
  if (!isDesktop || reducedMotion) return fallback;
  return (
    <Suspense fallback={fallback}>
      <ImpactStageFull backdrop={backdrop} />
    </Suspense>
  );
}
