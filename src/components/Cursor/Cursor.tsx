"use client";

import dynamic from "next/dynamic";
import { useExperience } from "@/components/Effects/ExperienceContext";

/** Baixado só quando vai ser usado: celulares e computadores simples nunca carregam este código. */
const CursorFollower = dynamic(() => import("./CursorFollower"), { ssr: false });

/**
 * Cursor discreto (§28) — só desktops capazes (ponteiro fino + modo completo) e sem reduced motion.
 * No SSR, em touch, no modo leve e com movimento reduzido não renderiza nada nem registra listeners.
 */
export function Cursor() {
  const { isDesktop, reducedMotion } = useExperience();
  if (!isDesktop || reducedMotion) return null;
  return <CursorFollower />;
}
