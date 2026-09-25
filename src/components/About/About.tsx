import { Fragment } from "react";
import { siteConfig } from "@/config/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { MapPinIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { AboutPortrait } from "./AboutPortrait";
import { AboutBackdrop } from "./AboutBackdrop";

/** Cadeia de sinal do conceito: SOM + IMAGEM + LUZ + EXPERIÊNCIA. */
const signalChain = [
  { label: "Som", led: "bg-magenta shadow-neon-magenta" },
  { label: "Imagem", led: "bg-cyan shadow-neon-cyan" },
  { label: "Luz", led: "bg-purple shadow-neon-purple" },
  { label: "Experiência", led: "bg-red shadow-neon-red" },
];

/**
 * 01 — "MAIS QUE UM DJ."
 * Retrato em monitor CRT + texto de apresentação.
 * (Os indicadores numéricos foram removidos por decisão do cliente.)
 */
export function About() {
  return (
    <section id="sobre" aria-labelledby="sobre-title" className="section-y relative isolate overflow-hidden">
      <AboutBackdrop word={siteConfig.shortName} />

      <div className="container-bb relative grid items-center gap-14 sm:gap-16 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16 xl:gap-24">
        <Reveal className="px-1 sm:px-4 md:px-2 lg:px-0">
          <AboutPortrait />
        </Reveal>

        <div className="flex min-w-0 flex-col gap-8">
          <SectionHeading
            id="sobre-title"
            kicker="01 // Quem é BetoBrizz"
            title="Mais que um DJ."
            subtitle="Uma experiência audiovisual."
            accent="magenta"
          />

          <div className="flex max-w-xl flex-col gap-5">
            <Reveal as="p" className="text-lg leading-relaxed text-white sm:text-xl">
              DJ BetoBrizz é <strong className="font-semibold text-white">DJ e VJ</strong>, levando música, vídeo e
              energia para eventos, festas e noites especiais.
            </Reveal>
            <Reveal as="p" step={2} className="text-base leading-relaxed text-mute sm:text-lg">
              Com uma experiência que mistura grandes clássicos, flashbacks e música eletrônica, cada apresentação é
              pensada para criar uma atmosfera única e manter a pista conectada do início ao fim.
            </Reveal>
          </div>

          <Reveal step={2} className="max-w-xl">
            <div className="relative border-y border-line py-4">
              <span aria-hidden className="absolute top-[-1px] left-0 h-px w-16 bg-magenta shadow-neon-magenta" />
              <p className="hud flex flex-wrap items-center gap-x-2 gap-y-2 text-[0.7rem] tracking-[0.16em] text-white min-[400px]:text-[0.8rem] sm:gap-x-3 sm:text-sm sm:tracking-[0.28em] md:tracking-[0.2em] lg:tracking-[0.28em]">
                {signalChain.map((item, i) => (
                  <Fragment key={item.label}>
                    {i > 0 ? <span className="text-dim">+</span> : null}
                    <span className="inline-flex items-center gap-1.5 sm:gap-2">
                      <span aria-hidden className={cn("size-1.5 rounded-full", item.led)} />
                      {item.label}
                    </span>
                  </Fragment>
                ))}
              </p>
            </div>
            <p className="hud mt-4 flex items-center gap-2 text-[0.7rem] text-mute">
              <MapPinIcon size={15} className="shrink-0 text-magenta" />
              {siteConfig.location}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

