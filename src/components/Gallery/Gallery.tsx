import { gallery } from "@/data/gallery";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ContactSheet } from "./ContactSheet";
import { FrameGrid } from "./Frames";

/**
 * GALERIA (§19) — "DIGITAL CONTACT SHEET".
 * Folha de contato de filme: tiras com perfurações, numeração de frame e uma
 * marcação de lápis dermatográfico. Cada frame abre o lightbox.
 * Os frames são HTML do servidor; a única ilha cliente é o ContactSheet (clique → lightbox).
 */
export function Gallery() {
  if (!gallery.length) return null;

  return (
    <section id="galeria" aria-labelledby="galeria-titulo" className="section-y relative overflow-hidden">
      {/* "Mesa de luz": brilho frio atrás da folha */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[46rem] w-[80rem] max-w-[180%] -translate-1/2 bg-[radial-gradient(closest-side,rgb(0_229_255/0.07),transparent)]"
      />

      <div className="container-bb relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading id="galeria-titulo" kicker="07 // GALERIA" title="DIGITAL CONTACT SHEET" accent="red" />
          <Reveal className="max-w-sm shrink-0 lg:max-w-[17rem] lg:pb-3 lg:text-right">
            <p className="text-base leading-relaxed text-mute">
              Pista, mixagem, telão e identidade visual. Selecione um frame para ampliar.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 sm:mt-16">
          <ContactSheet photos={gallery}>
            <FrameGrid photos={gallery} />
          </ContactSheet>
        </div>
      </div>
    </section>
  );
}
