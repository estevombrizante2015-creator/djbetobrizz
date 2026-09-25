"use client";

import dynamic from "next/dynamic";
import { useHeroIntro } from "./HeroIntro";
import styles from "./Hero.module.css";

// Efeitos pesados em chunks separados, só no cliente e só no desktop capaz (nunca baixados no modo leve).
const Particles = dynamic(() => import("@/components/Effects/Particles").then((m) => m.Particles), { ssr: false });
const Lasers = dynamic(() => import("@/components/Effects/Lasers").then((m) => m.Lasers), { ssr: false });

const PARTICLE_COLORS = ["#ff1493", "#00e5ff", "#8a2be2", "#ff2414", "#ffffff"];

/**
 * Camada de luz do show: lasers + poeira neon. Só no modo completo (desktop capaz, sem movimento
 * reduzido) e só depois que o show começa. No modo leve não monta nada (nem baixa o JS).
 */
export function HeroFx() {
  const { started } = useHeroIntro();
  if (!started) return null;

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${styles.fxIn}`}>
      <Lasers count={5} />
      <Particles colors={PARTICLE_COLORS} />
    </div>
  );
}
