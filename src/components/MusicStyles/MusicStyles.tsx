import { musicStyles } from "@/data/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StyleCrate } from "./StyleCrate";

/**
 * 03 // ESTILOS — "QUAL É A SUA VIBE?"
 * Cada estilo de data/content (musicStyles) vira uma capa de disco na "caixa" do DJ.
 */
export function MusicStyles() {
  if (musicStyles.length === 0) return null;

  return (
    <section id="estilos" aria-labelledby="estilos-title" className="section-y relative overflow-x-clip">
      {/* Fundo: sulcos de um vinil gigante + brilho neon suave (gradientes — sem filter: blur) */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-[4%] -right-[18rem] size-[36rem] rounded-full bg-[repeating-radial-gradient(circle,rgb(255_255_255/0.035)_0_1px,transparent_1px_7px)] [mask-image:radial-gradient(circle,#000_30%,transparent_70%)] sm:-right-[12rem] lg:size-[46rem]" />
        <div className="absolute top-[26%] -left-64 size-[40rem] bg-[radial-gradient(closest-side,rgb(0_229_255/0.1),rgb(0_229_255/0.04)_55%,transparent)]" />
        <div className="absolute -right-48 -bottom-16 size-[38rem] bg-[radial-gradient(closest-side,rgb(255_20_147/0.1),rgb(255_20_147/0.04)_55%,transparent)]" />
      </div>

      <div className="container-bb relative">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
          <SectionHeading id="estilos-title" kicker="03 // ESTILOS" title="QUAL É A SUA VIBE?" accent="cyan" />
          <p className="max-w-xs text-mute md:pb-2 md:text-right">
            <span lang="en" className="hud mb-2 block text-cyan">Select your record</span>
            Escolha o disco. Repertório ajustado para cada evento.
          </p>
        </div>

        <StyleCrate items={musicStyles} />
      </div>
    </section>
  );
}
