import { cn } from "@/lib/utils";
import styles from "./About.module.css";

/**
 * Palavra gigante contornada ao fundo da seção (decorativa).
 * No desktop (modo completo) desliza na horizontal conforme o scroll — em CSS puro,
 * sem JavaScript; no modo leve fica parada.
 */
export function AboutBackdrop({ word }: { word: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-clip select-none", styles.backdrop)}>
      <p
        className={cn(
          "text-outline absolute bottom-[4%] left-0 font-display text-[clamp(5.5rem,19vw,19rem)] leading-none font-black whitespace-nowrap uppercase opacity-[0.07] lg:top-[6%] lg:bottom-auto",
          styles.drift,
        )}
      >
        {word}
      </p>
    </div>
  );
}
