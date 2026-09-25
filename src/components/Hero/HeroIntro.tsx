"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useExperience } from "@/components/Effects/ExperienceContext";
import { useHydrated } from "@/components/Effects/useHydrated";

/** Tempo máximo esperando o Loader antes de iniciar a entrada do hero mesmo assim. */
const FALLBACK_MS = 1500;

type HeroIntroState = {
  /** A coreografia de entrada pode rodar (ou já rodou). */
  started: boolean;
  /** prefers-reduced-motion, mas só depois da hidratação (evita divergência SSR/cliente). */
  reduced: boolean;
};

const HeroIntroContext = createContext<HeroIntroState>({ started: false, reduced: false });

/**
 * Sinaliza quando a coreografia do hero pode começar:
 * quando o Loader chama setIntroDone(true), após 1,5 s (fallback) ou imediatamente com reduced-motion.
 */
export function HeroIntroProvider({ children }: { children: React.ReactNode }) {
  const { introDone, reducedMotion } = useExperience();
  const hydrated = useHydrated();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setTimedOut(true), FALLBACK_MS);
    return () => window.clearTimeout(id);
  }, []);

  const reduced = hydrated && reducedMotion;
  const started = introDone || timedOut || reduced;
  const value = useMemo(() => ({ started, reduced }), [started, reduced]);

  return <HeroIntroContext.Provider value={value}>{children}</HeroIntroContext.Provider>;
}

/** Estado da entrada do hero: `started` e `reduced` (seguros para hidratação). */
export function useHeroIntro() {
  return useContext(HeroIntroContext);
}
