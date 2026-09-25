"use client";

import { useEffect, useRef } from "react";
import { useExperience } from "@/components/Effects/ExperienceContext";
import { cn } from "@/lib/utils";

type Props = {
  /** Número de barras. */
  bars?: number;
  className?: string;
  /** Altura do bloco (CSS). */
  height?: string;
  /** Gradiente das barras (de baixo para cima). */
  palette?: "neon" | "red" | "cyan";
  /** Espelha as barras para cima e para baixo a partir do centro. */
  mirror?: boolean;
  /** Rótulo acessível; sem ele o visualizer é decorativo (aria-hidden). */
  label?: string;
};

const palettes = {
  neon: "linear-gradient(to top, var(--color-cyan), var(--color-purple) 55%, var(--color-magenta))",
  red: "linear-gradient(to top, var(--color-purple), var(--color-magenta) 50%, var(--color-red))",
  cyan: "linear-gradient(to top, var(--color-blue), var(--color-cyan))",
};

/**
 * Spectrum analyzer simulado — sem áudio. As barras "dançam" com um sinal
 * sintético e reagem à velocidade do scroll. Pausa fora da tela e respeita
 * prefers-reduced-motion (fica estático). No Experience Mode fica mais intenso.
 */
export function Visualizer({ bars = 32, className, height = "4rem", palette = "neon", mirror = false, label }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { intensity } = useExperience();

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll<HTMLSpanElement>("[data-bar]"));
    const seeds = nodes.map((_, i) => 0.6 + ((i * 7919) % 97) / 97);

    if (intensity === 0) {
      nodes.forEach((n, i) => (n.style.transform = `scaleY(${0.25 + 0.6 * Math.abs(Math.sin(i * 0.7))})`));
      return;
    }

    let raf = 0;
    let visible = false;
    let lastY = window.scrollY;
    let energy = 0;
    const gain = intensity === 2 ? 1.35 : 1;

    const onScroll = () => {
      const y = window.scrollY;
      energy = Math.min(1, energy + Math.abs(y - lastY) / 400);
      lastY = y;
    };

    const tick = (t: number) => {
      const time = t / 1000;
      energy *= 0.94;
      const beat = Math.pow(Math.max(0, Math.sin(time * Math.PI * 2 * 2.05)), 8); // ~123 BPM
      for (let i = 0; i < nodes.length; i++) {
        const x = i / nodes.length;
        const bass = (1 - x) * 0.55 * beat;
        const wave = 0.5 + 0.5 * Math.sin(time * (2.2 + seeds[i] * 2.4) + i * 0.55);
        const v = Math.min(1, (0.14 + wave * 0.42 * seeds[i] + bass + energy * 0.5) * gain);
        nodes[i].style.transform = `scaleY(${v.toFixed(3)})`;
      }
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      const next = entry.isIntersecting;
      if (next && !visible) raf = requestAnimationFrame(tick);
      if (!next) cancelAnimationFrame(raf);
      visible = next;
    });
    io.observe(root);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [intensity, bars]);

  return (
    <div
      ref={ref}
      className={cn("flex w-full items-end gap-[3px]", mirror && "items-center", className)}
      style={{ height }}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          data-bar
          className={cn("block flex-1 rounded-[2px] will-change-transform", mirror ? "h-full origin-center" : "h-full origin-bottom")}
          style={{ backgroundImage: palettes[palette], transform: "scaleY(0.3)", opacity: 0.9 }}
        />
      ))}
    </div>
  );
}
