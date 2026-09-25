import { siteConfig } from "@/config/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { DjVjStage } from "./DjVjStage";

/** Cores do slogan: som (lado DJ) · vídeo (lado VJ) · entretenimento (o resultado). */
const taglineColors = ["text-red", "text-cyan", "text-white"];

/**
 * 02 — DJ + VJ: palco dividido em duas metades que se conectam no scroll (desktop, modo completo)
 * ou já conectadas (modo leve). Âncora "experiencia" do menu.
 */
export function DjVj() {
  const tagline = siteConfig.tagline.split("•").map((part) => part.trim()).filter(Boolean);

  return (
    // overflow-clip (e não hidden): hidden vira "scroll container" e congela as entradas <Reveal> em CSS
    <section id="experiencia" aria-labelledby="djvj-title" className="section-y relative isolate overflow-clip">
      {/* Luz ambiente: magenta do lado DJ, ciano do lado VJ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_12%_62%,rgb(255_20_147/0.12),transparent),radial-gradient(45%_40%_at_88%_62%,rgb(0_229_255/0.1),transparent)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-line-strong to-transparent" />

      <div className="container-bb">
        <SectionHeading id="djvj-title" kicker="02 // DJ + VJ" title="DJ + VJ" accent="red" align="center">
          {tagline.length ? (
            <Reveal
              as="p"
              step={3}
              className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 font-hud text-base font-semibold tracking-[0.14em] uppercase min-[400px]:text-lg sm:gap-x-4 sm:text-xl sm:tracking-[0.18em]"
            >
              <span className="sr-only">{siteConfig.tagline}</span>
              {tagline.map((part, i) => (
                <span key={part} aria-hidden className="inline-flex items-center gap-2.5 sm:gap-4">
                  {i > 0 ? <span className="text-dim">•</span> : null}
                  <span className={taglineColors[i % taglineColors.length]}>{part}</span>
                </span>
              ))}
            </Reveal>
          ) : null}
        </SectionHeading>
        <DjVjStage />
      </div>
    </section>
  );
}
