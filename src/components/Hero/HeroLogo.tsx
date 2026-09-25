"use client";

import { useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { useHeroIntro } from "./HeroIntro";
import styles from "./Hero.module.css";

/**
 * Mesmo `sizes` em todas as cópias → o navegador baixa o logo uma única vez.
 * Acompanha os limites do layout: 78vh em telas baixas, 760/700px no desktop, 92vw no celular.
 */
const SIZES = "(max-height: 500px) 78vh, (min-width: 1280px) 760px, (min-width: 1024px) 700px, 92vw";

type Phase = "intro" | "idle" | "glitch";

/**
 * Logo grande do hero — a imagem LCP: visível desde a primeira pintura (alta resolução + fetchPriority high),
 * nunca escondida esperando a intro. No modo completo, um glitch RGB decorativo (cópias ciano/magenta
 * fatiadas + barra de varredura, ~0,5 s) toca POR CIMA do logo já visível quando o show começa, e
 * repete curto ao passar o mouse. Decorativo: o nome acessível fica no texto do <h1>.
 */
export function HeroLogo({ className }: { className?: string }) {
  const { fx, started } = useHeroIntro();
  const [phase, setPhase] = useState<Phase>("intro");
  const baseRef = useRef<HTMLSpanElement>(null);

  const state = started ? phase : "idle";

  return (
    <span
      aria-hidden
      data-state={state}
      className={cn(styles.logo, className)}
      onAnimationEnd={(e) => {
        if (e.target === baseRef.current) setPhase("idle");
      }}
      onPointerEnter={() => {
        if (state === "idle" && started) setPhase("glitch");
      }}
    >
      <span ref={baseRef} className={styles.base}>
        <Logo eager sizes={SIZES} alt="" />
      </span>
      {fx ? (
        <>
          <span className={cn(styles.slice, styles.sliceA)}>
            <Logo eager sizes={SIZES} alt="" />
          </span>
          <span className={cn(styles.slice, styles.sliceB)}>
            <Logo eager sizes={SIZES} alt="" />
          </span>
          <span className={styles.scan} />
        </>
      ) : null}
    </span>
  );
}
