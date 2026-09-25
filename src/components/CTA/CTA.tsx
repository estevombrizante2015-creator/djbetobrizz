import Image from "next/image";
import { siteConfig } from "@/config/site";
import { NeonButton } from "@/components/ui/NeonButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon, InstagramIcon, MapPinIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { cn, safeExternalUrl } from "@/lib/utils";
import { CtaKnob } from "./CtaKnob";
import { KnobStatic } from "./KnobStatic";
import styles from "./CTA.module.css";
import { TrackedLink } from "./TrackedLink";
import { formatPhoneBR, whatsappLink } from "./contact";

const BG = "/images/art/betobrizz-arena.webp";
const NEW_TAB = " (abre em nova aba)";
const KNOB_CLASS = "w-[min(15rem,66vw)] sm:w-[19rem] lg:w-full lg:max-w-[27rem]";

/** Atalhos de conversão (§45) — cada um abre o WhatsApp com uma mensagem diferente. */
const quickActions = [
  {
    id: "orcamento",
    label: "Solicitar orçamento",
    message: "Olá Beto! Vi seu site e gostaria de solicitar um orçamento para um evento.",
  },
  {
    id: "disponibilidade",
    label: "Ver disponibilidade",
    message: "Olá Beto! Vi seu site e gostaria de saber sua disponibilidade para uma data.",
  },
] as const;

/**
 * CALL TO ACTION — "VAMOS CRIAR ESSA EXPERIÊNCIA?"
 * Palco escuro + knob MASTER subindo até o máximo. O botão do WhatsApp é o protagonista.
 */
export function CTA() {
  const instagram = safeExternalUrl(siteConfig.instagram);

  return (
    <section id="contato" aria-labelledby="contato-title" className="relative isolate overflow-hidden bg-void">
      {/* ---------- Palco: arte da arena desfocada, só luz e cor ---------- */}
      <div aria-hidden className="absolute inset-0 -z-10">
        {/* Arte só como luz e cor: imagem pequena ampliada (já fica suave); o blur real só no modo completo */}
        <Image
          src={BG}
          alt=""
          fill
          sizes="(min-width: 1024px) 75vw, 60vw"
          quality={60}
          className="object-cover object-[62%_50%] opacity-30 lg:object-[40%_50%] [html[data-perf=full]_&]:scale-110 [html[data-perf=full]_&]:opacity-40 [html[data-perf=full]_&]:[filter:saturate(1.15)_brightness(0.75)_blur(4px)]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-void via-void/70 to-void" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(5_5_5/0.2),rgb(5_5_5/0.75)_40%,rgb(5_5_5/0.92))] lg:bg-[linear-gradient(90deg,rgb(5_5_5/0.92)_0%,rgb(5_5_5/0.6)_45%,rgb(5_5_5/0.25)_100%)]" />
        <div className="absolute right-[-10%] bottom-[-20%] h-[80%] w-[70%] rounded-full bg-[radial-gradient(closest-side,rgb(255_20_147/0.22),rgb(138_43_226/0.1)_55%,transparent)] max-lg:right-[-35%] max-lg:w-[130%]" />
        {/* chão do palco: grid anos 80 */}
        <div className="absolute inset-x-0 bottom-0 h-[38%] overflow-hidden opacity-60">
          <div className={styles.floor}>
            <div className={styles.grid} />
          </div>
        </div>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-magenta/60 to-transparent" />
      </div>

      <div className="container-bb section-y grid items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-16">
        {/* ---------- Knob (no mobile vem primeiro, compacto) ---------- */}
        <div className="flex justify-center lg:order-2 lg:justify-end">
          <CtaKnob className={KNOB_CLASS} fallback={<KnobStatic className={KNOB_CLASS} />} />
        </div>

        {/* ---------- Conteúdo ---------- */}
        <div className="flex min-w-0 flex-col gap-8 lg:order-1">
          <SectionHeading id="contato-title" kicker="Turn up the moment" title="Vamos criar essa experiência?" accent="magenta" />

          <Reveal>
            <p className="max-w-xl text-lg leading-relaxed text-pretty text-mute sm:text-xl">
              Seu evento merece mais do que música.{" "}
              <span className="mt-1 block font-hud text-2xl font-bold tracking-[0.08em] text-white uppercase sm:text-3xl">
                Merece uma <span className="text-magenta text-glow-magenta">atmosfera.</span>
              </span>
            </p>
          </Reveal>

          <Reveal className="flex flex-col gap-4">
            {/* Botão principal — protagonista */}
            <div className="relative w-full sm:w-fit">
              {/* halo: brilho estático (box-shadow) no modo leve; blur pulsando só no modo completo */}
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-3 rounded-full shadow-[0_0_34px_6px_rgb(255_20_147/0.28)] [html[data-perf=full]_&]:bg-magenta/25 [html[data-perf=full]_&]:shadow-none [html[data-perf=full]_&]:blur-xl [html[data-perf=full]_&]:motion-safe:animate-pulse-glow"
              />
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-magenta/15" />
              <NeonButton
                href={siteConfig.whatsappUrl}
                external
                size="lg"
                variant="magenta"
                icon={<WhatsAppIcon size={24} />}
                event="whatsapp_click"
                eventParams={{ source: "cta" }}
                aria-label={`Falar com BetoBrizz pelo WhatsApp${NEW_TAB}`}
                className="h-16! w-full px-10! text-base! shadow-neon-magenta sm:w-auto"
              >
                Falar com BetoBrizz
              </NeonButton>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {quickActions.map((a) => (
                <NeonButton
                  key={a.id}
                  href={whatsappLink(a.message)}
                  external
                  size="md"
                  variant="white"
                  icon={<ArrowRightIcon size={16} />}
                  event="cta_click"
                  eventParams={{ source: "cta", action: a.id }}
                  aria-label={`${a.label} pelo WhatsApp${NEW_TAB}`}
                  className="w-full border-white/35! sm:w-auto"
                >
                  {a.label}
                </NeonButton>
              ))}
            </div>
          </Reveal>

          {/* ---------- Canais / região (§54) ---------- */}
          <Reveal>
            <dl className="relative grid overflow-hidden rounded-2xl border border-line bg-ink/85 sm:grid-cols-2">
              <span
                aria-hidden
                className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-magenta/70 to-transparent"
              />
              <div className={cn("flex flex-col gap-1.5 p-4 sm:p-5", !instagram && "sm:col-span-2")}>
                <dt className="hud flex items-center gap-2 text-mute">
                  <WhatsAppIcon size={14} className="text-magenta" /> WhatsApp
                </dt>
                <dd>
                  <TrackedLink
                    href={siteConfig.whatsappUrl}
                    external
                    event="whatsapp_click"
                    eventParams={{ source: "cta_numero" }}
                    className="font-hud text-xl font-bold tracking-wide text-white tabular-nums transition-colors hover:text-magenta"
                  >
                    {formatPhoneBR(siteConfig.whatsapp)}
                    <span className="sr-only">{NEW_TAB}</span>
                  </TrackedLink>
                </dd>
              </div>
              {instagram ? (
                <div className="flex min-w-0 flex-col gap-1.5 border-t border-line p-4 sm:border-t-0 sm:border-l sm:p-5">
                  <dt className="hud flex items-center gap-2 text-mute">
                    <InstagramIcon size={14} className="text-cyan" /> Instagram
                  </dt>
                  <dd className="min-w-0">
                    <TrackedLink
                      href={instagram}
                      external
                      event="instagram_click"
                      eventParams={{ source: "cta" }}
                      className="block truncate font-hud text-xl font-bold tracking-wide text-white transition-colors hover:text-cyan"
                    >
                      {siteConfig.instagramHandle}
                      <span className="sr-only">{NEW_TAB}</span>
                    </TrackedLink>
                  </dd>
                </div>
              ) : null}
              <div className="flex flex-col gap-1.5 border-t border-line p-4 sm:col-span-2 sm:p-5">
                <dt className="hud flex items-center gap-2 text-mute">
                  <MapPinIcon size={14} className="text-red" /> Região
                </dt>
                <dd className="flex flex-col gap-3">
                  <span className="font-hud text-xl font-bold tracking-wide text-white">{siteConfig.location}</span>
                  {siteConfig.cities.length ? (
                    <ul aria-label="Cidades atendidas" className="flex flex-wrap gap-1.5">
                      {siteConfig.cities.map((city) => (
                        <li
                          key={city}
                          className="rounded-full border border-line-strong px-3 py-1 font-hud text-xs font-semibold tracking-[0.12em] text-mute uppercase"
                        >
                          {city}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <span className="text-sm text-mute">{siteConfig.region}</span>
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
