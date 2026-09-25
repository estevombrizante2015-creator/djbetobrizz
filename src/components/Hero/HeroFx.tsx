"use client";

import dynamic from "next/dynamic";
import { useExperience } from "@/components/Effects/ExperienceContext";
import { cn } from "@/lib/utils";
import { useHeroIntro } from "./HeroIntro";
import styles from "./Hero.module.css";

// Efeitos pesados em chunks separados, só no cliente e só quando vão aparecer.
const Particles = dynamic(() => import("@/components/Effects/Particles").then((m) => m.Particles), { ssr: false });
const Lasers = dynamic(() => import("@/components/Effects/Lasers").then((m) => m.Lasers), { ssr: false });

const PARTICLE_COLORS = ["#ff1493", "#00e5ff", "#8a2be2", "#ff2414", "#ffffff"];

/**
 * Camada de luz do show: lasers (desktop) + poeira neon (desktop completo, ~40% no mobile).
 * Monta só depois que a intro começa e nunca com prefers-reduced-motion.
 */
export function HeroFx() {
  const { started, reduced } = useHeroIntro();
  const { isDesktop } = useExperience();
  if (!started || reduced) return null;

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", styles.fxIn)}>
      {isDesktop ? <Lasers count={6} /> : null}
      <Particles colors={PARTICLE_COLORS} />
    </div>
  );
}
