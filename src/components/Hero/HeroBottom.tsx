"use client";

import { motion } from "motion/react";
import { Visualizer } from "@/components/Visualizer/Visualizer";
import { ArrowDownIcon } from "@/components/ui/Icons";
import { ease } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useHeroIntro } from "./HeroIntro";
import styles from "./Hero.module.css";

/**
 * Base do hero: o indicador "SCROLL TO ENTER THE EXPERIENCE ↓" apoiado sobre o
 * "piso de LED" do palco — equalizador segmentado (reage ao scroll / batida simulada).
 * O indicador fica acima das barras, nunca sobre elas (no desktop vira uma linha só: ↓ + texto,
 * para não encostar nos CTAs em notebooks baixos).
 */
export function HeroBottom() {
  const { started, reduced } = useHeroIntro();

  return (
    <motion.div
      className="hero-reveal pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: started ? 1 : 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.9, ease: ease.out, delay: 0.8 }}
    >
      <a
        href="#sobre"
        className="hud group pointer-events-auto mb-2 flex flex-col items-center gap-2 rounded-md px-3 py-1.5 text-[0.65rem] text-white/80 transition-colors hover:text-white sm:mb-3 sm:text-[0.7rem] lg:mb-4 lg:flex-row-reverse lg:gap-3"
      >
        <span lang="en">Scroll to enter the experience</span>
        <span
          aria-hidden
          className="grid h-8 w-8 place-items-center rounded-full border border-white/25 bg-void/40 text-cyan transition-colors group-hover:border-cyan"
        >
          <ArrowDownIcon size={16} className={reduced ? undefined : "animate-scroll-cue"} />
        </span>
      </a>

      {/* equalizador — "piso de LED" do palco (altura no wrapper; o Visualizer ocupa 100%) */}
      <div aria-hidden className={cn("relative h-11 w-full md:h-16 [@media(max-height:500px)]:h-9", styles.ledFloor)}>
        <div className="h-full md:hidden">
          <Visualizer bars={28} height="100%" palette="red" />
        </div>
        <div className="hidden h-full md:block">
          <Visualizer bars={56} height="100%" palette="neon" />
        </div>
      </div>
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-magenta/70 to-transparent"
      />
    </motion.div>
  );
}
