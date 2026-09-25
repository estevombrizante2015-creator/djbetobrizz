import Image from "next/image";
import { imageProps } from "@/lib/utils";
import { ImpactStage } from "./ImpactStage";
import { ImpactStatic } from "./ImpactStatic";

const BACKGROUND = "/images/events/betobrizz-pista-verde.webp";

/**
 * Duotone magenta/roxo feito só com filtros de cor. A ORDEM importa (por isso inline e não
 * utilitários do Tailwind, que aplicam sepia por último e deixam a foto marrom):
 * cinza → sépia → gira o matiz para o magenta → satura → escurece.
 * O desfoque (--impact-blur) entra só no modo completo; no leve a foto pequena ampliada
 * já fica suave, sem o custo de um blur em tela cheia.
 */
const duotone = {
  filter: "grayscale(1) sepia(1) hue-rotate(262deg) saturate(3.2) brightness(0.5) contrast(1.15) var(--impact-blur,)",
};

/**
 * Fundo da frase de impacto: foto real da pista escurecida e em duotone magenta/roxo —
 * filtros de cor estáticos e gradientes; blur e scanlines (blend) só no modo completo.
 */
function ImpactBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-void">
      <Image
        {...imageProps(BACKGROUND)}
        alt=""
        sizes="(min-width: 1024px) 45vw, 60vw"
        quality={60}
        className="absolute inset-0 h-full w-full object-cover object-[50%_45%] [html[data-perf=full]_&]:scale-110 [html[data-perf=full]_&]:[--impact-blur:blur(3px)]"
        style={duotone}
      />
      {/* duotone: roxo nas sombras, magenta nas luzes */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgb(138_43_226/0.5),rgb(5_5_5/0.2)_45%,rgb(255_20_147/0.32))]" />
      {/* vinheta + fusão com as seções vizinhas */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,transparent_10%,rgb(5_5_5/0.72)_62%,#050505_100%)]" />
      <div className="absolute inset-0 bg-linear-to-b from-void via-transparent to-void" />
      <div className="fx-full-only absolute inset-0">
        <div className="scanlines h-full w-full" />
      </div>
    </div>
  );
}

/** §23 — Frase de impacto em tela cheia: "A música passa. A experiência fica." */
export function Impact() {
  const backdrop = <ImpactBackdrop />;
  return (
    <section id="impacto" data-section="impact" aria-label="Frase de impacto" className="relative bg-void">
      <ImpactStage backdrop={backdrop} fallback={<ImpactStatic backdrop={backdrop} />} />
    </section>
  );
}
