"use client";

import { siteConfig } from "@/config/site";
import { track } from "@/lib/analytics";
import { cn, safeExternalUrl } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/ui/Icons";
import styles from "./WhatsAppButton.module.css";

/**
 * WhatsApp flutuante (§25), canto inferior direito.
 * Desktop: pílula "WhatsApp" + balão "FALE COM BETOBRIZZ" no hover/foco. Mobile: só o ícone.
 * Modo leve: visível desde a primeira pintura, estático (sem pulso, sem desfoque).
 * Modo completo: entra logo após a intro e pulsa (só transform/opacity). Respeita a safe area do iOS.
 */
export function WhatsAppButton() {
  const href = safeExternalUrl(siteConfig.whatsappUrl);
  if (!href) return null;

  return (
    <div
      className={cn(
        styles.dock,
        "fixed right-[calc(env(safe-area-inset-right)+1rem)] bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-40 md:right-6 md:bottom-6",
      )}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar com BetoBrizz no WhatsApp (abre em nova aba)"
        onClick={() => track("whatsapp_click", { source: "floating" })}
        className={cn(
          "group relative flex size-14 items-center justify-center rounded-full border border-magenta/60 bg-void/90",
          // vidro com desfoque só nos desktops capazes (no modo leve, fundo sólido)
          "[html[data-perf=full]_&]:bg-void/75 [html[data-perf=full]_&]:backdrop-blur-md",
          "shadow-[0_10px_30px_-10px_rgb(0_0_0/0.9),0_0_22px_-6px_rgb(255_20_147/0.7)]",
          "transition-[border-color,box-shadow,background-color,scale] duration-300 ease-out active:scale-95",
          "hover:border-magenta hover:bg-void/90 hover:shadow-neon-magenta focus-visible:border-magenta focus-visible:shadow-neon-magenta",
          "md:w-auto md:justify-start md:gap-3 md:py-1.5 md:pr-6 md:pl-1.5",
        )}
      >
        {/* Anel pulsando (vermelho do logo → magenta) */}
        <span aria-hidden className={styles.ping} />

        {/* Balão "FALE COM BETOBRIZZ" — desktop, no hover/foco */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 right-full mr-4 hidden -translate-y-1/2 md:block",
            "translate-x-2 scale-95 opacity-0 transition-[opacity,translate,scale] duration-300 ease-out",
            "group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100",
            "group-focus-visible:translate-x-0 group-focus-visible:scale-100 group-focus-visible:opacity-100",
          )}
        >
          <span className="relative block rounded-xl border border-magenta/60 bg-panel/95 px-4 py-2.5 font-hud text-xs font-bold tracking-[0.24em] whitespace-nowrap text-white uppercase shadow-[0_0_24px_-8px_rgb(255_20_147/0.8)]">
            Fale com <span className="text-magenta text-glow-magenta">BetoBrizz</span>
            {/* cauda do balão */}
            <span className="absolute top-1/2 -right-[6px] size-2.5 -translate-y-1/2 rotate-45 border-t border-r border-magenta/60 bg-panel" />
          </span>
        </span>

        <span
          aria-hidden
          className="relative grid size-11 shrink-0 place-items-center rounded-full bg-linear-to-br from-red via-[#ff1a5e] to-magenta text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_0_16px_rgb(255_36_20/0.45)] transition-transform duration-300 group-hover:scale-105"
        >
          <WhatsAppIcon size={24} />
        </span>
        <span aria-hidden className="hidden font-hud text-sm font-bold tracking-[0.2em] text-white uppercase md:inline">
          WhatsApp
        </span>
      </a>
    </div>
  );
}
