import type { Transition, Variants } from "motion/react";

/** Curvas e durações compartilhadas — mantêm o ritmo das animações consistente. */
export const ease = {
  out: [0.16, 1, 0.3, 1] as const, // expo-out: entradas
  inOut: [0.65, 0, 0.35, 1] as const,
  snap: [0.2, 0.9, 0.1, 1] as const,
};

export const duration = { fast: 0.25, base: 0.6, slow: 0.9 };

export const springSoft: Transition = { type: "spring", stiffness: 180, damping: 22 };

/** Entrada padrão de blocos ao rolar: sobe + fade. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.base, ease: ease.out } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: duration.base, ease: ease.out } },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: duration.slow, ease: ease.out } },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { duration: duration.slow, ease: ease.out } },
};

/** Container que escalona a entrada dos filhos. */
export function stagger(staggerChildren = 0.08, delayChildren = 0): Variants {
  return { hidden: {}, show: { transition: { staggerChildren, delayChildren } } };
}

/** Configuração padrão de viewport para whileInView. */
export const inViewOnce = { once: true, amount: 0.2 } as const;
