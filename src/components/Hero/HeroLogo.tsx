"use client";

import { useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { useExperience } from "@/components/Effects/ExperienceContext";
import { cn } from "@/lib/utils";
import { useHeroIntro } from "./HeroIntro";
import styles from "./Hero.module.css";

/** Mesmo `sizes` nas três cópias → o navegador baixa o logo uma única vez. */
const SIZES = "(min-width: 1024px) 700px, 92vw";

type Phase = "intro" | "idle" | "glitch";

/**
 * Logo grande do hero com entrada em glitch RGB (fatias com clip-path + cópias deslocadas
 * em ciano/magenta, ~0,5 s). No desktop, passar o mouse repete um glitch curto.
 * Decorativo: o nome acessível fica no texto do <h1>.
 */
export function HeroLogo({ className }: { className?: string }) {
  const { started, reduced } = useHeroIntro();
  const { isDesktop } = useExperience();
  const [phase, setPhase] = useState<Phase>("intro");
  const baseRef = useRef<HTMLSpanElement>(null);

  const state = reduced ? "idle" : started ? phase : "pre";

  return (
    <span
      aria-hidden
      data-state={state}
      className={cn(styles.logo, className)}
      onAnimationEnd={(e) => {
        if (e.target === baseRef.current) setPhase("idle");
      }}
      onPointerEnter={() => {
        if (isDesktop && state === "idle") setPhase("glitch");
      }}
    >
      <span ref={baseRef} className={cn(styles.base, "hero-reveal")}>
        <Logo eager sizes={SIZES} alt="" />
      </span>
      {reduced ? null : (
        <>
          <span className={cn(styles.slice, styles.sliceA)}>
            <Logo eager sizes={SIZES} alt="" />
          </span>
          <span className={cn(styles.slice, styles.sliceB)}>
            <Logo eager sizes={SIZES} alt="" />
          </span>
          <span className={styles.scan} />
        </>
      )}
    </span>
  );
}
