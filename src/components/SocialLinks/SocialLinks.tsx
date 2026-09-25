"use client";

import { socialLinks } from "@/data/social";
import { socialEvent, track } from "@/lib/analytics";
import { cn, safeExternalUrl } from "@/lib/utils";
import { socialIcons } from "@/components/ui/Icons";
import styles from "./SocialLinks.module.css";

/** Redes da barra (o WhatsApp tem botão próprio). Links validados uma vez, no módulo. */
const items = socialLinks
  .filter((s) => s.key !== "whatsapp")
  .map((s) => ({ ...s, href: safeExternalUrl(s.href) }))
  .filter((s): s is typeof s & { href: string } => Boolean(s.href));

/**
 * Barra social flutuante (§26) na borda esquerda — só em telas largas, onde há margem
 * livre ao lado do container (no mobile, as redes ficam no menu e no footer).
 * Rótulo "FOLLOW" girado, ícones com tooltip e uma linha fina descendo até a base.
 * Modo leve: estática e visível desde a primeira pintura (sem desfoque, sem entrada animada).
 */
export function SocialLinks() {
  if (items.length === 0) return null;

  return (
    <aside
      aria-label="Redes sociais do BetoBrizz"
      className={cn(styles.bar, "fixed bottom-0 left-5 z-30 hidden flex-col items-center gap-4 min-[1360px]:flex")}
    >
      <span
        aria-hidden
        className="font-hud text-[0.66rem] font-semibold tracking-[0.42em] text-dim uppercase [writing-mode:vertical-rl] rotate-180"
      >
        Follow
      </span>
      <span aria-hidden className="h-6 w-px bg-line-strong" />

      <ul className="flex flex-col items-center gap-2.5">
        {items.map((s) => {
          const Icon = socialIcons[s.key];
          return (
            <li key={s.key}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${s.label}: ${s.handle} (abre em nova aba)`}
                onClick={() => track(socialEvent(s.key), { source: "floating_bar" })}
                className={cn(
                  "group relative grid size-10 place-items-center rounded-full border border-line bg-void/90 text-mute",
                  // desfoque só nos desktops capazes; no modo leve, fundo sólido
                  "[html[data-perf=full]_&]:bg-void/70 [html[data-perf=full]_&]:backdrop-blur-sm",
                  "transition-[color,border-color,box-shadow,translate] duration-300 ease-out",
                  "hover:-translate-y-0.5 hover:border-magenta/70 hover:text-white hover:shadow-neon-magenta",
                  "focus-visible:border-magenta/70 focus-visible:text-white",
                )}
              >
                <Icon size={18} />
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute top-1/2 left-full ml-3 -translate-x-1 -translate-y-1/2 opacity-0",
                    "flex items-center gap-2 rounded-full border border-line-strong bg-panel/95 px-3.5 py-1.5 whitespace-nowrap",
                    "font-hud text-[0.7rem] font-semibold tracking-[0.18em] uppercase",
                    "transition-[opacity,translate] duration-300 ease-out",
                    "group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
                  )}
                >
                  <span className="text-white">{s.label}</span>
                  <span className="text-mute normal-case tracking-[0.06em]">{s.handle}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      <span
        aria-hidden
        className="h-24 w-px bg-linear-to-b from-line-strong via-magenta/60 to-transparent xl:h-28"
      />
    </aside>
  );
}
