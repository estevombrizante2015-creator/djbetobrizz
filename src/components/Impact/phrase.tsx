import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Peças compartilhadas da frase de impacto — usadas pelo quadro estático (servidor, modo leve)
 * e pelo palco com scroll (cliente, modo completo). Sem hooks: pode rodar no servidor.
 */

export const LINE_1 = ["A música", "passa."] as const;
export const LINE_2 = ["A experiência", "fica."] as const;

/** Tubo de neon aceso: núcleo quase branco + halo magenta/roxo. */
export const neonLit: CSSProperties = {
  color: "#fff0f8",
  textShadow:
    "0 0 4px rgb(255 255 255 / 0.85), 0 0 14px rgb(255 20 147 / 0.95), 0 0 38px rgb(255 20 147 / 0.65), 0 0 90px rgb(138 43 226 / 0.6)",
};

/** Tamanho extra por linha no mobile: "FICA." vira a palavra gigante — é o que fica. */
export const LINE_2_ROW_CLASS = [undefined, "max-sm:text-[2.05em] max-sm:leading-[0.88]"] as const;

/** Tipografia das duas linhas (mesma nas duas versões para o layout não mudar entre os modos). */
export const LINE_1_CLASS =
  "relative text-[clamp(1.9rem,9vw,3rem)] leading-[0.95] sm:text-[clamp(1.9rem,min(7.4vw,10.5svh),6rem)]";
export const LINE_2_CLASS = "relative mt-[0.18em] text-[clamp(2rem,min(10.4vw,15svh),8.5rem)] leading-[0.92]";
export const LINE_2_STROKE = "block text-transparent [-webkit-text-stroke:1.5px_rgb(255_20_147/0.45)]";

/** Brilho radial atrás da linha 2 (gradiente puro — sem filtro). */
export const BLOOM_CLASS =
  "pointer-events-none absolute top-[58%] left-1/2 h-[70vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_20_147/0.34),rgb(138_43_226/0.18)_55%,transparent)]";

/** Linhas da frase — mesmo markup nas camadas sobrepostas para alinhar pixel a pixel. */
export function Rows({
  rows,
  glitch = false,
  rowClass,
}: {
  rows: readonly string[];
  glitch?: boolean;
  rowClass?: readonly (string | undefined)[];
}) {
  return rows.map((row, i) => (
    <span key={row} className={cn("block", rowClass?.[i])}>
      <span className={cn("inline-block", glitch && "glitch is-glitching")} data-text={glitch ? row : undefined}>
        {row}
      </span>
      {i < rows.length - 1 ? " " : null}
    </span>
  ));
}

/** Aspas decorativas à esquerda (só em telas bem largas). */
export function QuoteMark() {
  return (
    <span
      aria-hidden
      className="text-glow-magenta pointer-events-none absolute hidden -top-[0.28em] -left-[0.08em] font-display text-[clamp(4rem,14vw,11rem)] leading-none text-magenta/80 select-none min-[1400px]:block"
      style={{ transform: "translateX(-100%)" }}
    >
      “
    </span>
  );
}

/** Fades do topo/base que fundem o quadro com as seções vizinhas. */
export function EdgeFades() {
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-void to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-void to-transparent" />
    </>
  );
}
