"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import { useExperience } from "@/components/Effects/ExperienceContext";

/** Tempo máximo esperando o Loader antes de iniciar a coreografia mesmo assim. */
const FALLBACK_MS = 1500;

type HeroIntroState = {
  /** Efeitos decorativos permitidos: desktop capaz (tier "full") e sem movimento reduzido. */
  fx: boolean;
  /** A coreografia decorativa (glitch do logo, cursor, lasers) pode rodar. Sempre false no modo leve. */
  started: boolean;
};

const HeroIntroContext = createContext<HeroIntroState>({ fx: false, started: false });

/**
 * <section> do hero + estado da coreografia de entrada.
 *
 * O conteúdo (logo, título, textos, CTAs) já nasce visível no HTML do servidor — nada espera o Loader.
 * No modo completo, quando o Loader termina (ou após 1,5 s), `data-intro="play"` dispara efeitos
 * decorativos por cima do conteúdo já pintado. Fora da tela ou com a aba oculta, `data-paused`
 * congela as animações CSS contínuas do hero (Ken Burns, lasers, REC...).
 */
export function HeroShell({ children, ...props }: ComponentProps<"section">) {
  const { introDone, reducedMotion, isDesktop } = useExperience();
  const fx = isDesktop && !reducedMotion;
  const [timedOut, setTimedOut] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!fx) return;
    const id = window.setTimeout(() => setTimedOut(true), FALLBACK_MS);
    return () => window.clearTimeout(id);
  }, [fx]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !fx) return;
    let inView = true;
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
      el.removeAttribute("data-paused");
    };
  }, [fx]);

  const started = fx && (introDone || timedOut);
  const value = useMemo(() => ({ fx, started }), [fx, started]);

  return (
    <HeroIntroContext.Provider value={value}>
      <section ref={ref} data-intro={started ? "play" : undefined} {...props}>
        {children}
      </section>
    </HeroIntroContext.Provider>
  );
}

/** Estado da coreografia do hero: `fx` e `started` (seguros para hidratação: false no SSR). */
export function useHeroIntro() {
  return useContext(HeroIntroContext);
}
