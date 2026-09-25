"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import { track } from "@/lib/analytics";

type ExperienceState = {
  /** "ENTER EXPERIENCE" ativado pelo usuário: visualizer/partículas/luzes mais intensos. */
  experienceMode: boolean;
  toggleExperience: () => void;
  setExperienceMode: (value: boolean) => void;
  /** Usuário pediu menos movimento (prefers-reduced-motion). */
  reducedMotion: boolean;
  /** Dispositivo com ponteiro fino e hover (desktop). Falso no SSR e em touch. */
  isDesktop: boolean;
  /** Intensidade dos efeitos: 0 (reduzido) · 1 (normal) · 2 (experience mode). */
  intensity: 0 | 1 | 2;
  /** Intro/loader terminou — o hero pode começar sua animação de entrada. */
  introDone: boolean;
  setIntroDone: (value: boolean) => void;
};

const ExperienceContext = createContext<ExperienceState | null>(null);

export function ExperienceProvider({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion() ?? false;
  const [experienceMode, setExperienceMode] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.experience = experienceMode ? "on" : "off";
  }, [experienceMode]);

  const toggleExperience = useCallback(() => {
    setExperienceMode((v) => {
      track("experience_mode", { enabled: !v });
      return !v;
    });
  }, []);

  const value = useMemo<ExperienceState>(
    () => ({
      experienceMode,
      toggleExperience,
      setExperienceMode,
      reducedMotion,
      isDesktop,
      intensity: reducedMotion ? 0 : experienceMode ? 2 : 1,
      introDone,
      setIntroDone,
    }),
    [experienceMode, toggleExperience, reducedMotion, isDesktop, introDone],
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperience() {
  const ctx = useContext(ExperienceContext);
  if (!ctx) throw new Error("useExperience deve ser usado dentro de <ExperienceProvider>");
  return ctx;
}
