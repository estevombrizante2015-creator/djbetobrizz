"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useExperience } from "./ExperienceContext";
import styles from "./ExperienceToggle.module.css";

/** Alturas de repouso das barras do EQ (escala 0–1) e defasagem da animação. */
const EQ_BARS = [
  { rest: 0.45, delay: "-0.15s", color: "bg-cyan" },
  { rest: 0.9, delay: "-0.6s", color: "bg-purple" },
  { rest: 0.65, delay: "-0.35s", color: "bg-magenta" },
  { rest: 0.3, delay: "-0.85s", color: "bg-red" },
] as const;

const noopSubscribe = () => () => {};

/** `true` só no cliente, após a hidratação (portais precisam de `document`). */
function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

function EqIcon({ on }: { on: boolean }) {
  return (
    <span aria-hidden className="flex h-3.5 w-4 items-end justify-between">
      {EQ_BARS.map((bar, i) => (
        <span
          key={i}
          className={cn(
            "h-full w-[2.5px] origin-bottom rounded-full transition-colors duration-300",
            on ? cn(bar.color, "animate-eq") : "bg-current",
          )}
          style={on ? { animationDelay: bar.delay } : { transform: `scaleY(${bar.rest})` }}
        />
      ))}
    </span>
  );
}

/**
 * Botão "ENTER EXPERIENCE" (§49): liga/desliga o experience mode.
 * Nunca toca áudio — apenas intensifica visualizer, partículas e luzes.
 * Renderiza também o overlay de luzes (via portal, fora do header com backdrop-filter).
 */
export function ExperienceToggle({ className }: { className?: string }) {
  const { experienceMode, toggleExperience } = useExperience();

  return (
    <>
      <button
        type="button"
        aria-pressed={experienceMode}
        onClick={toggleExperience}
        className={cn(
          "group relative inline-flex h-10 shrink-0 items-center justify-center gap-2.5 rounded-full border px-3 sm:px-4",
          "font-hud text-[0.7rem] font-bold tracking-[0.2em] uppercase",
          "transition-[border-color,background-color,color,box-shadow] duration-300",
          experienceMode
            ? "border-magenta/80 bg-magenta/10 text-white shadow-[0_0_18px_-4px_rgb(255_20_147/0.75)]"
            : "border-line-strong bg-void/30 text-mute hover:border-cyan/70 hover:text-white hover:shadow-[0_0_16px_-6px_rgb(0_229_255/0.8)]",
          className,
        )}
      >
        <EqIcon on={experienceMode} />
        <span className="sr-only">Experience mode</span>
        {/* Os dois rótulos ocupam a mesma célula: a largura não muda ao alternar. */}
        <span aria-hidden className="hidden sm:grid">
          <span className={cn("[grid-area:1/1]", experienceMode && "invisible")}>Enter Experience</span>
          <span className={cn("flex items-center gap-1.5 [grid-area:1/1]", !experienceMode && "invisible")}>
            Experience
            <span className="text-magenta text-glow-magenta">On</span>
          </span>
        </span>
      </button>
      <ExperienceOverlay />
    </>
  );
}

/**
 * Luzes do experience mode: feixes neon varrendo a partir dos cantos superiores
 * + vinheta pulsando a ~123 BPM. Fixo, sem interação, aria-hidden.
 * Desktop: efeito completo (blend "screen"); mobile: versão leve; reduced motion: estático.
 */
export function ExperienceOverlay() {
  const { experienceMode, isDesktop, reducedMotion } = useExperience();
  const isClient = useIsClient();
  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {experienceMode ? (
        <motion.div
          key="experience-overlay"
          aria-hidden
          className={cn(
            styles.overlay,
            isDesktop ? styles.full : styles.lite,
            reducedMotion && styles.still,
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.7 } }}
          exit={{ opacity: 0, transition: { duration: 0.45 } }}
        >
          <div className={styles.vignette} />
          <div className={styles.floor} />
          <div className={cn(styles.beam, styles.left, styles.magenta)} />
          <div className={cn(styles.beam, styles.right, styles.cyan)} />
          {isDesktop ? (
            <>
              <div className={cn(styles.beam, styles.left, styles.purple, styles.slow)} />
              <div className={cn(styles.beam, styles.right, styles.red, styles.slow)} />
            </>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
