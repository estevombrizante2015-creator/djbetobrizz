"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { siteConfig } from "@/config/site";
import { navItems } from "@/data/social";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { NeonButton } from "@/components/ui/NeonButton";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { ExperienceToggle } from "@/components/Effects/ExperienceToggle";
import { MixerNav } from "./MixerNav";
import { MobileMenu } from "./MobileMenu";
import { MenuButton } from "./MenuButton";
import { TrackWaveform } from "./TrackWaveform";
import { useActiveSection } from "./useActiveSection";

const MENU_ID = "menu-mobile";
const SECTION_IDS = navItems.map((item) => item.id);
const FOCUSABLE = "a[href], button:not([disabled])";

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/** true depois de rolar além do limite (false no SSR). Só re-renderiza quando cruza o limite. */
function useScrolledPast(threshold: number) {
  return useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > threshold,
    () => false,
  );
}

/**
 * Header fixo: transparente sobre o hero, vira uma barra de vidro escura ao rolar.
 * Desktop: logo · faixa de canais de mixer (LED na seção ativa) · Experience Mode · CONTRATE.
 * Mobile: logo · hamburger → menu em tela cheia estilo deck de DJ.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolledPast(24);
  const { active, missing } = useActiveSection(SECTION_IDS);
  const items = missing.length ? navItems.filter((item) => !missing.includes(item.id)) : navItems;

  const headerRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const unlockRef = useRef<(() => void) | null>(null);

  // Menu aberto: trava a rolagem da página (compensando a largura da barra de rolagem).
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const body = document.body;
    const gap = window.innerWidth - html.clientWidth;
    const prevOverflow = html.style.overflow;
    const prevPadding = body.style.paddingRight;
    html.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    const unlock = () => {
      html.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
      unlockRef.current = null;
    };
    unlockRef.current = unlock;
    return unlock;
  }, [open]);

  // Menu aberto: foco no primeiro link, Esc fecha e Tab circula dentro do header.
  useEffect(() => {
    if (!open) return;
    // O painel sai de `visibility: hidden` ao longo da transição: tenta focar por alguns frames.
    let raf = 0;
    let tries = 0;
    const focusFirst = () => {
      const link = firstLinkRef.current;
      link?.focus({ preventScroll: true });
      if (link && document.activeElement !== link && ++tries < 20) raf = requestAnimationFrame(focusFirst);
    };
    raf = requestAnimationFrame(focusFirst);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        buttonRef.current?.focus({ preventScroll: true });
        return;
      }
      const root = headerRef.current;
      if (e.key !== "Tab" || !root) return;
      const nodes = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0 && !el.closest("[inert]"),
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const current = document.activeElement;
      if (!root.contains(current)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && current === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Ao chegar no layout desktop o menu mobile deixa de existir: fecha e libera a rolagem.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggleMenu = useCallback(() => setOpen((v) => !v), []);

  /** Link do menu: libera a rolagem ANTES da navegação por âncora do navegador e fecha o menu. */
  const onNavigate = useCallback(() => {
    unlockRef.current?.();
    setOpen(false);
  }, []);

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-50">
      {/* Sobre o hero: só um véu escuro no topo para legibilidade */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-void/85 via-void/40 to-transparent transition-opacity duration-500",
          scrolled || open ? "opacity-0" : "opacity-100",
        )}
      />
      {/* Após rolar: barra de vidro escura */}
      <div
        aria-hidden
        className={cn(
          "glass pointer-events-none absolute inset-0 border-b border-line transition-opacity duration-500",
          scrolled && !open ? "opacity-100" : "opacity-0",
        )}
      />

      <div className="relative z-20 mx-auto flex h-[72px] max-w-[96rem] items-center justify-between gap-3 px-4 sm:px-6 lg:grid lg:h-[84px] lg:grid-cols-[1fr_auto_1fr] lg:gap-5 lg:px-8">
        <a
          href="#inicio"
          onClick={open ? onNavigate : undefined}
          aria-label={`${siteConfig.name} — voltar ao início`}
          className="group/logo relative block w-[108px] shrink-0 rounded-sm lg:w-[124px] xl:w-[136px]"
        >
          <Logo
            eager
            alt=""
            sizes="(min-width: 1280px) 136px, (min-width: 1024px) 124px, 108px"
            className="transition-[filter] duration-300 group-hover/logo:drop-shadow-[0_0_12px_rgb(255_36_20/0.5)]"
          />
        </a>

        <div className="hidden min-w-0 justify-center lg:flex">
          <MixerNav items={items} active={active} />
        </div>

        <div className="flex shrink-0 items-center gap-2.5 justify-self-end xl:gap-3">
          <div className="hidden lg:block">
            <ExperienceToggle labelClassName="sr-only xl:not-sr-only" />
          </div>
          <div className="hidden sm:block">
            <NeonButton
              href={siteConfig.whatsappUrl}
              external
              variant="red"
              size="sm"
              icon={<WhatsAppIcon size={16} />}
              event="whatsapp_click"
              eventParams={{ source: "header" }}
              aria-label="Contrate BetoBrizz pelo WhatsApp (abre em nova aba)"
            >
              Contrate
            </NeonButton>
          </div>
          <MenuButton
            ref={buttonRef}
            open={open}
            onToggle={toggleMenu}
            controls={MENU_ID}
            className="lg:hidden"
          />
        </div>
      </div>

      <TrackWaveform visible={scrolled && !open} />

      <MobileMenu
        id={MENU_ID}
        open={open}
        items={items}
        active={active}
        firstLinkRef={firstLinkRef}
        onNavigate={onNavigate}
      />
    </header>
  );
}
