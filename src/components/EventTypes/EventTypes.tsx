import { eventTypes } from "@/data/content";
import { siteConfig } from "@/config/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { NeonButton } from "@/components/ui/NeonButton";
import { MapPinIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { PadGrid } from "./PadGrid";
import styles from "./EventTypes.module.css";

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * TIPOS DE EVENTO (§55) + ATENDIMENTO REGIONAL (§54).
 * Os tipos viram pads iluminados de uma controladora; ao lado, um "radar" com as
 * cidades atendidas e o CTA "VERIFICAR DISPONIBILIDADE".
 */
export function EventTypes() {
  const cities = siteConfig.cities;

  return (
    <section
      id="tipos-de-evento"
      aria-labelledby="tipos-de-evento-titulo"
      className="section-y relative overflow-hidden"
    >
      {/* Atmosfera: brilho roxo do palco */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 left-1/2 h-[40rem] w-[70rem] max-w-[160%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(138_43_226/0.16),transparent)]"
      />

      <div className="container-bb relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="tipos-de-evento-titulo"
            kicker="06 // SERVIÇOS"
            title="PARA QUAL EVENTO?"
            accent="cyan"
          />
          <Reveal className="max-w-sm lg:pb-3 lg:text-right">
            <p className="text-base leading-relaxed text-mute">
              Escolha o pad do seu evento e consulte a disponibilidade direto no WhatsApp.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 sm:mt-16 lg:grid-cols-12 lg:gap-6">
          {/* ===== Chassi da controladora ===== */}
          <Reveal className="lg:col-span-8">
            <div className="relative flex h-full flex-col rounded-2xl border border-line-strong/60 bg-gradient-to-b from-panel-2 to-ink p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_30px_60px_-30px_rgb(0_0_0/0.9)] sm:p-6">
              <span aria-hidden className={styles.screws} />

              {/* Barra de modos (decorativa) */}
              <div aria-hidden className="mb-3 flex items-center justify-between gap-3 px-3 sm:mb-5 sm:px-2">
                <span className="hud text-[0.6rem] text-white/60 sm:text-[0.65rem]">Performance pads</span>
                <span className="flex items-center gap-1.5">
                  <span className="hud rounded-sm border border-cyan/70 px-2 py-1 text-[0.55rem] text-cyan shadow-[0_0_10px_rgb(0_229_255/0.35)]">
                    Hot cue
                  </span>
                  <span className="hud hidden rounded-sm border border-line-strong px-2 py-1 text-[0.55rem] text-white/40 sm:inline">
                    Pad FX
                  </span>
                  <span className="hud hidden rounded-sm border border-line-strong px-2 py-1 text-[0.55rem] text-white/40 md:inline">
                    Sampler
                  </span>
                </span>
              </div>

              <div className="flex flex-1 flex-col justify-center">
                <PadGrid items={eventTypes} />
              </div>

              <p className="mt-4 flex items-center gap-2 px-3 text-sm text-mute sm:mt-5 sm:px-2">
                <WhatsAppIcon size={16} className="shrink-0 text-cyan" />
                Toque em um pad para falar sobre o seu evento.
              </p>
            </div>
          </Reveal>

          {/* ===== Área de atendimento (radar) ===== */}
          <Reveal className="lg:col-span-4" step={2}>
            <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-ink/80 p-5 sm:p-6">
              <p className="hud flex items-center gap-2 text-[0.7rem] text-red">
                <MapPinIcon size={16} />
                Área de atendimento
              </p>

              <div className="mt-5 flex items-center gap-5">
                {/* Radar decorativo — sem posições "geográficas" inventadas */}
                <div
                  aria-hidden
                  className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-full border border-red/40 bg-[radial-gradient(circle,rgb(255_36_20/0.12),transparent_70%)] sm:w-28"
                >
                  <span className="absolute inset-[18%] rounded-full border border-red/25" />
                  <span className="absolute inset-[36%] rounded-full border border-red/20" />
                  <span className="absolute inset-x-0 top-1/2 h-px bg-red/20" />
                  <span className="absolute inset-y-0 left-1/2 w-px bg-red/20" />
                  <span className="absolute inset-0 animate-spin-slow rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_280deg,rgb(255_36_20/0.45)_360deg)]" />
                  <span className="absolute top-1/2 left-1/2 grid size-9 -translate-1/2 place-items-center rounded-full bg-void/70 text-red shadow-neon-red">
                    <MapPinIcon size={18} />
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="font-display text-lg leading-tight font-black tracking-tight text-white uppercase sm:text-xl">
                    Base regional
                  </p>
                  <p className="hud mt-1.5 text-[0.65rem] leading-relaxed tracking-[0.16em] text-balance text-mute">{siteConfig.location}</p>
                </div>
              </div>

              {cities.length ? (
                <ul aria-label="Cidades atendidas" className="mt-5 divide-y divide-line border-y border-line">
                  {cities.map((city, i) => (
                    <li key={city} className="flex items-center gap-3 py-2.5">
                      <span aria-hidden className="font-vhs text-base leading-none text-red/80 tabular-nums">
                        {pad2(i + 1)}
                      </span>
                      <span className="font-hud text-base font-semibold tracking-[0.12em] text-white uppercase">
                        {city}
                      </span>
                      {/* "sinal" decorativo */}
                      <span aria-hidden className={styles.signal} />
                    </li>
                  ))}
                </ul>
              ) : null}

              <p className="mt-4 text-sm leading-relaxed text-mute">{siteConfig.region}</p>

              <div className="mt-6 lg:mt-auto lg:pt-6">
                <NeonButton
                  href={siteConfig.availabilityUrl}
                  external
                  variant="red"
                  icon={<WhatsAppIcon size={18} />}
                  event="cta_click"
                  eventParams={{ cta: "ver_disponibilidade" }}
                  className="w-full"
                >
                  Verificar disponibilidade
                </NeonButton>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
