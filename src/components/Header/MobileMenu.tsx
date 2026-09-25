"use client";

import type { Ref } from "react";
import { motion, type Variants } from "motion/react";
import { siteConfig } from "@/config/site";
import { socialLinks } from "@/data/social";
import { socialEvent, track } from "@/lib/analytics";
import { cn, safeExternalUrl } from "@/lib/utils";
import { ease } from "@/lib/animations";
import { NeonButton } from "@/components/ui/NeonButton";
import { WhatsAppIcon, socialIcons } from "@/components/ui/Icons";
import { ExperienceToggle } from "@/components/Effects/ExperienceToggle";
import type { NavEntry } from "./MixerNav";

type Props = {
  id: string;
  open: boolean;
  items: readonly NavEntry[];
  active: string;
  firstLinkRef: Ref<HTMLAnchorElement>;
  /** Clique em um link: fecha o menu (a navegação por âncora segue normalmente). */
  onNavigate: () => void;
};

const list: Variants = {
  hidden: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.08 } },
};

const row: Variants = {
  hidden: { opacity: 0, x: -18 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: ease.out } },
};

const footerIn: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.out, delay: 0.38 } },
};

const socials = socialLinks
  .filter((s) => s.key !== "whatsapp")
  .map((s) => ({ ...s, href: safeExternalUrl(s.href) }))
  .filter((s): s is typeof s & { href: string } => Boolean(s.href));

/**
 * Menu mobile em tela cheia desenhado como um deck de DJ (§51):
 * ● LIVE ● DJ ● VISUAL ● EVENTS … — cada canal com LED, rótulo de deck e nome da seção.
 * Sempre montado (aria-controls válido); fechado fica invisível e `inert`.
 */
export function MobileMenu({ id, open, items, active, firstLinkRef, onNavigate }: Props) {
  return (
    <div
      id={id}
      inert={!open}
      className={cn(
        "fixed inset-0 z-10 overflow-y-auto overscroll-contain bg-void lg:hidden",
        "transition-[opacity,visibility] duration-300 ease-out",
        open ? "visible opacity-100" : "invisible opacity-0 delay-100",
      )}
    >
      {/* atmosfera: brilho do palco + grid 80s + scanlines */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-[140%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(138_43_226/0.35),transparent)]" />
        <div className="absolute -right-24 bottom-24 size-72 bg-[radial-gradient(closest-side,rgb(255_20_147/0.16),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-56 overflow-hidden opacity-40">
          <div className="retro-grid absolute inset-x-[-50%] top-0 h-[200%]" />
        </div>
        <div className="scanlines absolute inset-0" />
      </div>

      <motion.nav
        aria-label="Menu principal"
        initial={false}
        animate={open ? "show" : "hidden"}
        className="relative container-bb flex min-h-full flex-col pt-[5.25rem] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        {/* Face do deck */}
        <div className="relative overflow-hidden rounded-2xl border border-line bg-panel/80 px-4 pt-3 pb-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.05)]">
          <div aria-hidden className="hud flex items-center justify-between text-[0.6rem] text-mute">
            <span>Deck A · Navegação</span>
            <span className="flex items-center gap-1.5 text-red">
              <span className="size-1.5 animate-rec rounded-full bg-red shadow-neon-red" />
              On air
            </span>
          </div>

          <motion.ul variants={list} className="mt-2 divide-y divide-line">
            {items.map((item, i) => {
              const isActive = item.id === active;
              return (
                <motion.li key={item.id} variants={row}>
                  <a
                    ref={i === 0 ? firstLinkRef : undefined}
                    href={`#${item.id}`}
                    onClick={onNavigate}
                    aria-current={isActive ? "location" : undefined}
                    className="group/row flex items-center gap-3.5 rounded-md py-2.5"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "size-2 shrink-0 rounded-full transition-[background-color,box-shadow] duration-300",
                        isActive
                          ? "bg-cyan shadow-[0_0_8px_2px_rgb(0_229_255/0.8)]"
                          : "bg-white/15 group-active/row:bg-magenta",
                      )}
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span
                        aria-hidden
                        className={cn("hud text-[0.6rem] leading-none", isActive ? "text-cyan" : "text-magenta")}
                      >
                        {item.deck}
                      </span>
                      <span
                        className={cn(
                          "truncate font-display text-[1.35rem] leading-tight font-black tracking-tight uppercase",
                          isActive ? "text-white text-glow-cyan" : "text-white/90",
                        )}
                      >
                        {item.label}
                      </span>
                    </span>
                    <span aria-hidden className="hud text-[0.6rem] text-dim tabular-nums">
                      CH{String(i + 1).padStart(2, "0")}
                    </span>
                  </a>
                </motion.li>
              );
            })}
          </motion.ul>

          <DeckControls />
        </div>

        {/* Redes + CTA */}
        <motion.div variants={footerIn} className="mt-auto flex flex-col gap-4 pt-6">
          {socials.length ? (
            <ul className="flex items-center justify-center gap-3" aria-label="Redes sociais">
              {socials.map((s) => {
                const Icon = socialIcons[s.key];
                return (
                  <li key={s.key}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${s.label} — ${s.handle} (abre em nova aba)`}
                      onClick={() => track(socialEvent(s.key), { source: "mobile_menu" })}
                      className="grid size-12 place-items-center rounded-full border border-line-strong bg-void/60 text-white transition-colors hover:border-magenta hover:text-magenta"
                    >
                      <Icon size={20} />
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : null}
          <NeonButton
            href={siteConfig.whatsappUrl}
            external
            variant="magenta"
            size="lg"
            className="w-full"
            icon={<WhatsAppIcon size={20} />}
            event="whatsapp_click"
            eventParams={{ source: "mobile_menu" }}
            aria-label="Falar com BetoBrizz no WhatsApp (abre em nova aba)"
          >
            Falar com BetoBrizz
          </NeonButton>
          <p className="hud text-center text-[0.65rem] text-mute">
            WhatsApp <span className="text-white tabular-nums">{siteConfig.whatsappDisplay}</span>
          </p>
        </motion.div>
      </motion.nav>
    </div>
  );
}

const FADERS = [0.35, 0.7, 0.5, 0.85];

/** Rodapé do deck: botão Experience Mode (real) + knob e faders decorativos (◉ /|\). */
function DeckControls() {
  return (
    <div className="mt-1 flex items-center justify-between gap-3 border-t border-line pt-3 pb-2">
      <ExperienceToggle withOverlay={false} className="min-w-0" />
      <div aria-hidden className="flex items-center gap-3">
        <svg viewBox="0 0 48 48" className="size-10 text-white">
          <circle
            cx="24"
            cy="24"
            r="21"
            fill="none"
            stroke="rgb(255 255 255 / 0.14)"
            strokeWidth="1"
            strokeDasharray="1.5 3.2"
          />
          <circle cx="24" cy="24" r="15" fill="var(--color-panel-2)" stroke="rgb(255 255 255 / 0.35)" strokeWidth="1.5" />
          <path d="M24 24 32.5 13.5" stroke="var(--color-red)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="24" cy="24" r="2" fill="currentColor" />
        </svg>
        <div className="flex h-9 items-stretch gap-2.5">
          {FADERS.map((v, i) => (
            <span key={i} className="relative w-[3px] rounded-full bg-white/10">
              <span
                className={cn(
                  "absolute left-1/2 h-1.5 w-3 -translate-x-1/2 rounded-[2px]",
                  i === 3 ? "bg-magenta shadow-neon-magenta" : "bg-white/70",
                )}
                style={{ bottom: `calc(${v * 100}% - 3px)` }}
              />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
