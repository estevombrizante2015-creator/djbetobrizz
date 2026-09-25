"use client";

import { motion, type Variants } from "motion/react";
import { fadeUp, inViewOnce } from "@/lib/animations";

type Props = {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
  delay?: number;
  as?: "div" | "li" | "article" | "p" | "span";
};

/** Entrada suave ao rolar (fade + slide). Respeita prefers-reduced-motion via MotionConfig. */
export function Reveal({ children, className, variants = fadeUp, delay = 0, as = "div" }: Props) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={inViewOnce}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </Component>
  );
}
