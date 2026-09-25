"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useExperience } from "./ExperienceContext";
import { cn } from "@/lib/utils";
import styles from "./ExperienceToggle.module.css";

const sizes = {
  sm: "h-10 min-w-10 gap-2.5 px-3 text-[0.7rem]",
  lg: "h-12 min-w-12 gap-3 px-5 text-xs",
};

type Props = {
  className?: string;
  /** Classes do texto do botão — ex.: "sr-only xl:not-sr-only" para mostrar só o ícone em telas menores. */
  labelClassName?: string;
  size?: keyof typeof sizes;
  /** Renderiza a camada de luzes do Experience Mode (use apenas em uma instância). */
  withOverlay?: boolean;
};

/**
 * Botão "ENTER EXPERIENCE" (§49): liga/desliga o Experience Mode.
 * Nunca toca áudio — apenas intensifica visualizer, partículas e luzes.
 * Nome acessível fixo ("Experience mode") + aria-pressed; o texto visível troca de estado.
 */
export function ExperienceToggle({ className, labelClassName, size = "sm", withOverlay = true }: Props) {
  const { experienceMode, toggleExperience, reducedMotion } = useExperience();

  return (
    <>
      <button
        type="button"
        aria-pressed={experienceMode}
        onClick={toggleExperience}
        title={experienceMode ? "Desligar Experience Mode" : "Ligar Experience Mode (luzes e efeitos, sem áudio)"}
        className={cn(
          "group/xp relative inline-flex shrink-0 items-center justify-center rounded-full border",
          "font-hud font-bold tracking-[0.2em] whitespace-nowrap uppercase select-none",
          "transition-[border-color,background-color,color,box-shadow,scale] duration-300 ease-out active:scale-[0.97]",
          sizes[size],
          experienceMode
            ? "border-magenta/80 bg-magenta/10 text-white shadow-[0_0_18px_-4px_rgb(255_20_147/0.8)]"
            : "border-line-strong bg-void/30 text-mute hover:border-cyan/70 hover:text-white hover:shadow-[0_0_16px_-6px_rgb(0_229_255/0.8)]",
          className,
        )}
      >
        <EqGlyph active={experienceMode} animated={experienceMode && !reducedMotion} />
        <span className="sr-only">Experience mode</span>
        {/* Os dois rótulos ocupam a mesma célula: a largura do botão não muda ao alternar. */}
        <span aria-hidden className={cn("grid", labelClassName)}>
          <span className={cn("whitespace-nowrap [grid-area:1/1]", experienceMode && "invisible")}>Enter experience</span>
          <span className={cn("whitespace-nowrap [grid-area:1/1]", !experienceMode && "invisible")}>
            Experience <span className="text-magenta text-glow-magenta">on</span>
          </span>
        </span>
      </button>
      {withOverlay ? <ExperienceOverlay /> : null}
    </>
  );
}

const EQ_BARS = [0.45, 0.8, 0.6, 0.95];

/** Mini equalizador do botão: estático desligado, dançando quando ligado. */
function EqGlyph({ active, animated }: { active: boolean; animated: boolean }) {
  return (
    <span aria-hidden className="flex h-3.5 w-4 shrink-0 items-end justify-between">
      {EQ_BARS.map((h, i) => (
        <span
          key={i}
          className={cn(
            "h-full w-[2px] origin-bottom rounded-full transition-colors duration-300",
            active ? (i % 2 ? "bg-cyan" : "bg-magenta") : "bg-current group-hover/xp:bg-cyan",
            animated && "animate-eq",
          )}
          style={
            animated
              ? { animationDelay: `${-i * 0.23}s`, animationDuration: `${0.9 + i * 0.12}s` }
              : { transform: `scaleY(${active ? h : h * 0.55})` }
          }
        />
      ))}
    </span>
  );
}

const noop = () => () => {};

/** true apenas no cliente (após a hidratação) — sem setState em efeito. */
function useIsClient() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

/**
 * Luzes do Experience Mode: feixes neon varrendo a partir dos cantos superiores
 * e vinheta pulsando a ~123 BPM. Fixa, sem eventos de ponteiro, decorativa.
 * Portal no <body>: o header tem backdrop-filter, que prenderia um `fixed` dentro dele.
 * Desktop: efeito completo · mobile: versão leve · reduced motion: nada.
 */
export function ExperienceOverlay() {
  const { experienceMode, reducedMotion, isDesktop } = useExperience();
  const isClient = useIsClient();
  if (!isClient) return null;

  const show = experienceMode && !reducedMotion;

  return createPortal(
    <AnimatePresence>
      {show ? (
        <motion.div
          key="experience-overlay"
          aria-hidden
          className={cn(styles.overlay, isDesktop ? styles.full : styles.lite)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className={styles.ceiling} />
          <div className={styles.floor} />
          <div className={cn(styles.beam, styles.left, styles.magenta)} />
          <div className={cn(styles.beam, styles.right, styles.cyan)} />
          {isDesktop ? (
            <>
              <div className={cn(styles.beam, styles.left2, styles.purple)} />
              <div className={cn(styles.beam, styles.right2, styles.red)} />
            </>
          ) : null}
          <div className={styles.vignette} />
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
