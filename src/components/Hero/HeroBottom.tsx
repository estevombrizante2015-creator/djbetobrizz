"use client";

import { motion } from "motion/react";
import { Visualizer } from "@/components/Visualizer/Visualizer";
import { ArrowDownIcon } from "@/components/ui/Icons";
import { ease } from "@/lib/animations";
import { useHeroIntro } from "./HeroIntro";

/**
 * Base do hero: equalizador de palco (reage ao scroll / batida simulada)
 * e o indicador "SCROLL TO ENTER THE EXPERIENCE ↓".
 */
export function HeroBottom() {
  const { started, reduced } = useHeroIntro();

  return (
    <motion.div
      className="hero-reveal pointer-events-none absolute inset-x-0 bottom-0 z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: started ? 1 : 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.9, ease: ease.out, delay: 0.8 }}
    >
      {/* equalizador — "piso de LED" do palco */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 opacity-50 [mask-image:radial-gradient(ellipse_62%_100%_at_50%_100%,black_35%,transparent_100%)] md:opacity-45"
      >
        <div className="md:hidden">
          <Visualizer bars={24} height="4.5rem" palette="red" />
        </div>
        <div className="hidden md:block">
          <Visualizer bars={48} height="6.5rem" palette="neon" />
        </div>
      </div>
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-magenta/70 to-transparent"
      />

      <div className="relative flex justify-center pt-6 pb-5 sm:pb-7">
        <a
          href="#sobre"
          className="hud group pointer-events-auto flex flex-col items-center gap-2 rounded-md px-3 py-1 text-[0.65rem] text-white/80 transition-colors hover:text-white sm:text-[0.7rem]"
        >
          <span>Scroll to enter the experience</span>
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-full border border-white/25 text-cyan transition-colors group-hover:border-cyan"
          >
            <ArrowDownIcon size={16} className={reduced ? undefined : "animate-scroll-cue"} />
          </span>
        </a>
      </div>
    </motion.div>
  );
}
