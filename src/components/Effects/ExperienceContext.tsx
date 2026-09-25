"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";
import { track } from "@/lib/analytics";
import { DESKTOP_QUERY, PERF_KEY } from "@/lib/perf-tier";

/**
 * Nível de efeitos visuais (ver src/lib/perf-tier.ts):
 * - "full":     desktops capazes — partículas, lasers, parallax e animações ligadas ao scroll.
 * - "balanced": celulares e PCs comuns — animações baratas ligadas (equalizadores, brilhos,
 *               entradas), sem efeitos caros (blend, blur, scroll-linked, partículas).
 * - "lite":     aparelhos realmente fracos, economia de dados ou movimento reduzido — estático.
 *
 * Decidido antes da primeira pintura por PERF_TIER_SCRIPT (layout.tsx), que grava
 * `<html data-perf="…">`. O CSS usa esse atributo; os componentes usam este contexto.
 * Em produção, se o FPS medido ficar baixo, o nível desce um degrau (full → balanced → lite).
 */
export type PerfTier = "lite" | "balanced" | "full";

type ExperienceState = {
  /** "ENTER EXPERIENCE" ativado pelo usuário: visualizer/partículas/luzes mais intensos. */
  experienceMode: boolean;
  toggleExperience: () => void;
  setExperienceMode: (value: boolean) => void;
  /** Usuário pediu menos movimento. Sempre false no SSR e no 1º render do cliente (sem mismatch). */
  reducedMotion: boolean;
  /** Nível de efeitos (sempre "lite" no SSR e no 1º render do cliente — sem mismatch). */
  tier: PerfTier;
  /** Atalho: tier === "lite" (aparelho fraco / movimento reduzido) → versão estática. */
  lite: boolean;
  /**
   * Desktop CAPAZ de efeitos ricos: ponteiro fino + ≥1024px + tier "full".
   * Falso no SSR, em celulares e em computadores simples → efeitos pesados ficam desligados.
   */
  isDesktop: boolean;
  /**
   * Intensidade dos efeitos contínuos: 0 (estático) · 1 (normal) · 2 (experience mode).
   * 0 com movimento reduzido ou no nível "lite" (a menos que o usuário ative o Experience Mode).
   */
  intensity: 0 | 1 | 2;
  /** Intro/loader terminou — o hero pode começar sua animação de entrada. */
  introDone: boolean;
  setIntroDone: (value: boolean) => void;
};

const ExperienceContext = createContext<ExperienceState | null>(null);

const noopSubscribe = () => () => {};

function readTier(): PerfTier {
  const v = document.documentElement.getAttribute("data-perf");
  return v === "full" || v === "lite" ? v : "balanced";
}

/** Observa mudanças em <html data-perf> (ex.: rebaixamento automático para "lite"). */
function subscribeTier(onChange: () => void) {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-perf"] });
  return () => mo.disconnect();
}

function subscribeDesktop(onChange: () => void) {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function setTierAttribute(tier: PerfTier, persist: boolean) {
  document.documentElement.setAttribute("data-perf", tier);
  if (!persist) return;
  try {
    sessionStorage.setItem(PERF_KEY, tier);
  } catch {
    // storage indisponível — mantém só nesta página
  }
}

/**
 * Mede o FPS em janelas curtas (após a carga e nas primeiras rolagens). Duas janelas ruins
 * seguidas → desce um nível e guarda na sessão. Só em produção (o modo dev é lento por natureza).
 * - full: ruim se mediana > 22 ms (~45 fps) ou p75 > 34 ms
 * - balanced: ruim se mediana > 40 ms (~25 fps) ou p75 > 60 ms
 */
function useFpsGuard(tier: PerfTier, onSlow: () => void) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || tier === "lite") return;
    const [maxMedian, maxP75] = tier === "full" ? [22, 34] : [40, 60];
    let bad = 0;
    let raf = 0;
    let windows = 0;
    let measuring = false;
    let lastScrollWindow = 0;

    const measure = (ms: number) => {
      if (measuring) return;
      measuring = true;
      const frames: number[] = [];
      let last = performance.now();
      const start = last;
      const tick = (t: number) => {
        frames.push(t - last);
        last = t;
        if (t - start < ms) {
          raf = requestAnimationFrame(tick);
          return;
        }
        measuring = false;
        windows += 1;
        if (document.hidden || frames.length < 10) return;
        const sorted = frames.slice(1).sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const p75 = sorted[Math.floor(sorted.length * 0.75)];
        bad = median > maxMedian || p75 > maxP75 ? bad + 1 : 0;
        if (bad >= 2) onSlow();
      };
      raf = requestAnimationFrame(tick);
    };

    const first = window.setTimeout(() => measure(1500), 2500);
    const onScroll = () => {
      const now = performance.now();
      if (windows >= 4 || now - lastScrollWindow < 3000) return;
      lastScrollWindow = now;
      measure(1200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(first);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [tier, onSlow]);
}

export function ExperienceProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const prefersReduced = useReducedMotion() ?? false;
  const reducedMotion = hydrated && prefersReduced;

  const [experienceMode, setExperienceMode] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  // SSR e hidratação usam os valores "seguros" (lite / não-desktop); o cliente atualiza logo depois.
  const desktopMedia = useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
  const tier = useSyncExternalStore<PerfTier>(subscribeTier, readTier, () => "lite");

  const downgrade = useCallback(() => setTierAttribute(tier === "full" ? "balanced" : "lite", true), [tier]);

  useFpsGuard(tier, downgrade);

  useEffect(() => {
    document.documentElement.dataset.experience = experienceMode ? "on" : "off";
  }, [experienceMode]);

  const toggleExperience = useCallback(() => {
    setExperienceMode((v) => {
      track("experience_mode", { enabled: !v });
      return !v;
    });
  }, []);

  const lite = tier === "lite";

  const value = useMemo<ExperienceState>(
    () => ({
      experienceMode,
      toggleExperience,
      setExperienceMode,
      reducedMotion,
      tier,
      lite,
      isDesktop: desktopMedia && tier === "full",
      intensity: reducedMotion ? 0 : experienceMode ? 2 : lite ? 0 : 1,
      introDone,
      setIntroDone,
    }),
    [experienceMode, toggleExperience, reducedMotion, tier, lite, desktopMedia, introDone],
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperience() {
  const ctx = useContext(ExperienceContext);
  if (!ctx) throw new Error("useExperience deve ser usado dentro de <ExperienceProvider>");
  return ctx;
}
