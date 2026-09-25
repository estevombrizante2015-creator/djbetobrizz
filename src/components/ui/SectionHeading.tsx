"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { fadeUp, stagger } from "@/lib/animations";
import { cn } from "@/lib/utils";

type Accent = "magenta" | "cyan" | "purple" | "red";

const accentText: Record<Accent, string> = {
  magenta: "text-magenta",
  cyan: "text-cyan",
  purple: "text-purple",
  red: "text-red",
};

const accentBar: Record<Accent, string> = {
  magenta: "bg-magenta shadow-neon-magenta",
  cyan: "bg-cyan shadow-neon-cyan",
  purple: "bg-purple shadow-neon-purple",
  red: "bg-red shadow-neon-red",
};

type Props = {
  /** Rótulo HUD acima do título, ex.: "04 // EVENTOS" */
  kicker?: string;
  title: string;
  subtitle?: string;
  accent?: Accent;
  align?: "left" | "center";
  /** Glitch único quando o título entra na tela (momento estratégico). */
  glitch?: boolean;
  className?: string;
  /** id para aria-labelledby da <section> */
  id?: string;
  children?: React.ReactNode;
};

/**
 * Cabeçalho padrão das seções: kicker HUD + título display gigante + subtítulo.
 */
export function SectionHeading({
  kicker,
  title,
  subtitle,
  accent = "magenta",
  align = "left",
  glitch = true,
  className,
  id,
  children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    if (!inView || !glitch) return;
    const start = window.setTimeout(() => setGlitching(true), 250);
    const stop = window.setTimeout(() => setGlitching(false), 750);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(stop);
    };
  }, [inView, glitch]);

  return (
    <motion.div
      ref={ref}
      variants={stagger(0.1)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      className={cn("flex flex-col gap-4", align === "center" && "items-center text-center", className)}
    >
      {kicker ? (
        <motion.p variants={fadeUp} className={cn("hud flex items-center gap-3", accentText[accent])}>
          <span aria-hidden className={cn("h-px w-8", accentBar[accent])} />
          {kicker}
        </motion.p>
      ) : null}
      <motion.h2
        id={id}
        variants={fadeUp}
        className="font-display text-[clamp(2.1rem,6.5vw,5.25rem)] leading-[0.95] font-black tracking-tight text-balance uppercase"
      >
        <span className={cn("glitch", glitching && "is-glitching")} data-text={title}>
          {title}
        </span>
      </motion.h2>
      {subtitle ? (
        <motion.p
          variants={fadeUp}
          className={cn(
            "font-hud text-lg font-semibold tracking-[0.18em] uppercase sm:text-xl",
            accentText[accent],
          )}
        >
          {subtitle}
        </motion.p>
      ) : null}
      {children}
    </motion.div>
  );
}
