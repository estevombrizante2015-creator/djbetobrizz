"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { siteConfig } from "@/config/site";
import { navItems, type NavId } from "@/data/social";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { NeonButton } from "@/components/ui/NeonButton";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { ExperienceToggle } from "@/components/Effects/ExperienceToggle";
import { useActiveSection } from "./useActiveSection";
import { MixerNav } from "./MixerNav";
import { MenuButton } from "./MenuButton";
import { MobileMenu } from "./MobileMenu";
import { TrackWaveform } from "./TrackWaveform";

/** Ids das seções do menu — constante de módulo (referência estável para o scroll-spy). */
const NAV_IDS: readonly NavId[] = navItems.map((item) => item.id);
const MENU_ID = "menu-mobile";
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Header fixo: transparente sobre o hero, vira uma barra de vidro escuro ao rolar.
 * Desktop: navegação estilo mixer (LED no canal ativo). Mobile: hamburger + menu em tela cheia (deck de DJ).
 */
export function Header() {
  const active = useActiveSection(NAV_IDS);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Estado "rolado" (throttle por frame).
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > 24);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  }, []);

  // Menu aberto: trava a rolagem, foca o primeiro link, Esc fecha, Tab circula dentro do header.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = { overflow: root.style.overflow, gutter: root.style.scrollbarGutter };
    root.style.overflow = "hidden";
    root.style.scrollbarGutter = "stable";
    const focusRaf = requestAnimationFrame(() => firstLinkRef.current?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close(true);
        return;
      }
      if (e.key !== "Tab" || !headerRef.current) return;
      const items = Array.from(headerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0,
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (e.shiftKey && (current === first || !headerRef.current.contains(current))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (current === last || !headerRef.current.contains(current))) {
        e.preventDefault();
        first.focus();
      }
    };

    // Se a tela crescer para o layout desktop, o menu mobile deixa de existir: fecha e destrava.
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => {
      if (mq.matches) setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      cancelAnimationFrame(focusRaf);
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
      root.style.overflow = prev.overflow;
      root.style.scrollbarGutter = prev.gutter;
    };
  }, [open, close]);

  const solid = scrolled && !open;

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-50">
      <AnimatePresence>
        {open ? (
          <MobileMenu id={MENU_ID} active={active} onNavigate={() => close(false)} firstLinkRef={firstLinkRef} />
        ) : null}
      </AnimatePresence>

      <div
        className={cn(
          "relative z-10 border-b transition-[background-color,border-color,box-shadow] duration-500",
          solid
            ? "glass border-line shadow-[0_12px_40px_-24px_rgb(0_0_0/0.9)]"
            : "border-transparent bg-transparent",
        )}
      >
        {/* Sombra superior para legibilidade sobre o hero (some quando a barra fica sólida). */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 bg-linear-to-b from-void/85 via-void/40 to-transparent transition-opacity duration-500",
            scrolled || open ? "opacity-0" : "opacity-100",
          )}
        />

        <div
          className={cn(
            "container-bb grid grid-cols-[auto_1fr_auto] items-center gap-3 transition-[height] duration-500 ease-out lg:gap-5",
            scrolled ? "h-16" : "h-[4.5rem] lg:h-20",
          )}
        >
          <a
            href="#inicio"
            aria-label={`${siteConfig.name} — voltar ao início`}
            onClick={() => close(false)}
            className={cn(
              "block w-[6.75rem] shrink-0 transition-[width,filter] duration-500 min-[380px]:w-28 lg:w-32 xl:w-36",
              "hover:[filter:drop-shadow(-2px_0_0_rgb(0_229_255/0.75))_drop-shadow(2px_0_0_rgb(255_20_147/0.75))]",
              scrolled && "lg:w-28 xl:w-32",
            )}
          >
            <Logo eager sizes="(min-width: 1280px) 144px, (min-width: 1024px) 128px, 112px" alt="" />
          </a>

          <div className="flex min-w-0 justify-center">
            <MixerNav active={active} />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ExperienceToggle />
            <NeonButton
              href={siteConfig.whatsappUrl}
              external
              event="whatsapp_click"
              eventParams={{ source: "header" }}
              variant="red"
              size="sm"
              icon={<WhatsAppIcon size={16} />}
              className="hidden bg-void/30 sm:inline-flex"
              aria-label="Contrate o DJ BetoBrizz pelo WhatsApp"
            >
              Contrate
            </NeonButton>
            <MenuButton ref={buttonRef} open={open} onToggle={() => setOpen((v) => !v)} controls={MENU_ID} className="lg:hidden" />
          </div>
        </div>

        <TrackWaveform visible={scrolled && !open} />
      </div>
    </header>
  );
}
