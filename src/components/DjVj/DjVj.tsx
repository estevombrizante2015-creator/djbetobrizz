import { siteConfig } from "@/config/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DjVjStage } from "./DjVjStage";

/**
 * 02 — DJ + VJ: palco dividido em duas metades que se conectam no scroll.
 * Âncora "experiencia" do menu.
 */
export function DjVj() {
  return (
    <section id="experiencia" aria-labelledby="djvj-title" className="section-y relative isolate overflow-hidden">
      {/* Luz ambiente: magenta do lado DJ, ciano do lado VJ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_12%_62%,rgb(255_20_147/0.12),transparent),radial-gradient(45%_40%_at_88%_62%,rgb(0_229_255/0.1),transparent)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-line-strong to-transparent" />

      <div className="container-bb">
        <SectionHeading
          id="djvj-title"
          kicker="02 // DJ + VJ"
          title="DJ + VJ"
          subtitle={siteConfig.tagline}
          accent="purple"
          align="center"
        />
        <DjVjStage />
      </div>
    </section>
  );
}
