"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useExperience } from "./ExperienceContext";
import { cn } from "@/lib/utils";
import styles from "./Lasers.module.css";

export type LasersProps = {
  className?: string;
  /** Número de feixes. */
  count?: number;
};

const COLORS = ["var(--color-magenta)", "var(--color-cyan)", "var(--color-purple)", "var(--color-red)"];

/**
 * Pontos de origem dos feixes (% da largura) e ângulos de varredura.
 * rotate() positivo = sentido horário: feixe de cima vai para a esquerda, feixe de baixo para a direita.
 */
const ORIGINS = [
  { x: 12, edge: "top", a0: -8, a1: -48 },
  { x: 88, edge: "top", a0: 8, a1: 48 },
  { x: 30, edge: "bottom", a0: -28, a1: 34 },
  { x: 70, edge: "bottom", a0: 30, a1: -32 },
  { x: 52, edge: "top", a0: -36, a1: 30 },
] as const;

type Beam = {
  key: number;
  edge: "top" | "bottom";
  style: CSSProperties;
};

/** Configuração determinística (sem Math.random). */
function makeBeams(n: number): Beam[] {
  return Array.from({ length: n }, (_, i) => {
    const o = ORIGINS[i % ORIGINS.length];
    const round = Math.floor(i / ORIGINS.length);
    const offset = round * 7;
    const vars: Record<string, string> = {
      "--x": `${o.x + (o.x > 50 ? -offset : offset)}%`,
      "--a0": `${o.a0 + round * 9}deg`,
      "--a1": `${o.a1 - round * 7}deg`,
      "--c": COLORS[(i + round) % COLORS.length],
      "--dur": `${5.2 + ((i * 1.7) % 4.1)}s`,
      "--delay": `${-((i * 1.3) % 5)}s`,
      "--pdur": `${3.4 + ((i * 0.9) % 2.6)}s`,
      "--pdelay": `${-((i * 0.77) % 3)}s`,
    };
    return { key: i, edge: o.edge, style: vars as CSSProperties };
  });
}

/**
 * Feixes de laser varrendo a partir do topo e da base (magenta, ciano, roxo, vermelho).
 * Só no desktop capaz (modo completo): no modo leve, no SSR e com movimento reduzido não renderiza nada.
 * Só transform/opacity animados, sem filter; congela fora da tela e com a aba oculta.
 * Mais fortes e rápidos no Experience Mode.
 */
export function Lasers({ className, count = 5 }: LasersProps) {
  const { reducedMotion, isDesktop, experienceMode } = useExperience();
  const enabled = isDesktop && !reducedMotion;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    let inView = false;
    const sync = () => el.toggleAttribute("data-paused", !inView || document.hidden);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [enabled]);

  if (!enabled) return null;
  const beams = makeBeams(Math.max(0, count));

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(styles.root, className)}
      data-mode={experienceMode ? "on" : "off"}
    >
      {beams.map((b) => (
        <div key={b.key} className={cn(styles.beam, b.edge === "top" ? styles.top : styles.bottom)} style={b.style}>
          <div className={styles.pulse}>
            <span className={styles.flare} />
            <span className={styles.glow} />
            <span className={styles.core} />
          </div>
        </div>
      ))}
    </div>
  );
}
