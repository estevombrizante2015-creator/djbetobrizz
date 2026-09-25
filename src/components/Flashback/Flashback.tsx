import { decades } from "@/data/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TimeMachine } from "./TimeMachine";

/**
 * 04 // FLASHBACK — "VOLTE NO TEMPO." (VHS, fita cassete, CD, vinil, CRT, glitch e neon).
 * As décadas vêm de data/content (decades); cada uma troca o cenário do palco.
 */
export function Flashback() {
  if (decades.length === 0) return null;
  const first = decades[0].year;
  const last = decades[decades.length - 1].year;

  return (
    <section id="flashback" aria-labelledby="flashback-title" className="relative overflow-x-clip">
      <div className="container-bb flex flex-col gap-6 pt-20 pb-10 md:flex-row md:items-end md:justify-between md:pt-28 md:pb-14 xl:pt-36">
        <SectionHeading
          id="flashback-title"
          kicker="04 // FLASHBACK"
          title="VOLTE NO TEMPO."
          subtitle="MAS COM A ENERGIA DE HOJE."
          accent="magenta"
        />
        <p aria-hidden className="vhs flex items-center gap-3 text-xl text-white/80 md:pb-3 md:text-2xl">
          <span className="text-magenta">◀◀</span> REW
          <span className="text-white/40">{first}</span>
          <span className="h-px w-10 bg-white/25" />
          <span className="text-white/40">{last}</span>
        </p>
      </div>

      <TimeMachine decades={decades} />
    </section>
  );
}
