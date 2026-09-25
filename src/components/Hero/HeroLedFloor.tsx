"use client";

import type { ReactNode } from "react";
import { useExperience } from "@/components/Effects/ExperienceContext";
import { Visualizer } from "@/components/Visualizer/Visualizer";

/**
 * Piso de LED do hero: estático (`children`, SVG de 1 path vindo do servidor) quando nada anima —
 * SSR, modo leve, movimento reduzido. Com efeitos (modo completo, ou Experience Mode ligado pelo
 * usuário), troca pelo Visualizer em canvas (~30 fps, pausa fora da tela).
 */
export function HeroLedFloor({ children }: { children: ReactNode }) {
  const { intensity, isDesktop } = useExperience();
  if (intensity === 0) return <>{children}</>;
  if (isDesktop) return <Visualizer bars={56} height="100%" palette="neon" />;
  return (
    <>
      <div className="h-full md:hidden">
        <Visualizer bars={28} height="100%" palette="red" />
      </div>
      <div className="hidden h-full md:block">
        <Visualizer bars={56} height="100%" palette="neon" />
      </div>
    </>
  );
}
