import Image from "next/image";
import { imageProps } from "@/lib/utils";
import { ImpactStage } from "./ImpactStage";

const BACKGROUND = "/images/events/betobrizz-pista-verde.webp";

/**
 * Duotone magenta/roxo feito só com filtros. A ORDEM importa (por isso inline e não
 * utilitários do Tailwind, que aplicam sepia por último e deixam a foto marrom):
 * cinza → sépia → gira o matiz para o magenta → satura → escurece → desfoca.
 */
const duotone = {
  filter: "grayscale(1) sepia(1) hue-rotate(262deg) saturate(3.2) brightness(0.5) contrast(1.15) blur(3px)",
};

/**
 * Fundo da frase de impacto: foto real da pista (vista da cabine) escurecida,
 * desfocada e em duotone magenta/roxo — só filtros e gradientes; scanlines (blend) só no desktop.
 */
function ImpactBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-void">
      <Image
        {...imageProps(BACKGROUND)}
        alt=""
        sizes="(min-width: 1024px) 50vw, 100vw"
        quality={60}
        className="absolute inset-0 h-full w-full scale-110 object-cover object-[50%_45%]"
        style={duotone}
      />
      {/* duotone: roxo nas sombras, magenta nas luzes */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgb(138_43_226/0.5),rgb(5_5_5/0.2)_45%,rgb(255_20_147/0.32))]" />
      {/* vinheta + fusão com as seções vizinhas */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,transparent_10%,rgb(5_5_5/0.72)_62%,#050505_100%)]" />
      <div className="absolute inset-0 bg-linear-to-b from-void via-transparent to-void" />
      <div className="fx-desktop-only absolute inset-0">
        <div className="scanlines h-full w-full" />
      </div>
    </div>
  );
}

/** §23 — Frase de impacto em tela cheia: "A música passa. A experiência fica." */
export function Impact() {
  return (
    <section id="impacto" data-section="impact" aria-label="Frase de impacto" className="relative bg-void">
      <ImpactStage backdrop={<ImpactBackdrop />} />
    </section>
  );
}
