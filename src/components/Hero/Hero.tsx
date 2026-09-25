import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { HeroShell } from "./HeroIntro";
import { HeroBackground } from "./HeroBackground";
import { HeroFx } from "./HeroFx";
import { HeroContent } from "./HeroContent";
import { HeroBottom } from "./HeroBottom";
import { HeroTimecode } from "./HeroTimecode";
import styles from "./Hero.module.css";

const corner = "absolute h-4 w-4 border-white/35 sm:h-5 sm:w-5";

/** ▶ + VS15 (U+FE0E): força a apresentação em texto — sem isso o iOS/macOS pode pintar o emoji colorido. */
const PLAY = "▶︎";

/**
 * Moldura de monitor de VJ (continua a do Loader): cantos, REC, canal/local e timecode. Decorativa.
 * A base da moldura "pousa" sobre o piso de LED (HeroBottom) em vez de cruzar as barras.
 */
function HeroHud() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-3 top-[84px] bottom-[3.25rem] z-10 sm:inset-x-6 md:bottom-[4.5rem] lg:inset-x-8 lg:top-[96px] [@media(max-height:500px)]:bottom-[2.75rem]"
    >
      <span className={cn(corner, "top-0 left-0 border-t border-l")} />
      <span className={cn(corner, "top-0 right-0 border-t border-r")} />
      <span className={cn(corner, "bottom-0 left-0 border-b border-l md:hidden")} />
      <span className={cn(corner, "right-0 bottom-0 border-r border-b")} />

      <div className="hud absolute top-0 left-6 flex -translate-y-1/2 items-center gap-3 text-[0.62rem] text-white/75 sm:left-8">
        <span className="flex items-center gap-1.5">
          {/* pisca só no modo completo */}
          <span className="h-1.5 w-1.5 rounded-full bg-red shadow-neon-red motion-safe:[html[data-perf=full]_&]:animate-rec" />
          REC
        </span>
        <span className="text-white/45">CH-01</span>
        <span className="hidden text-white/55 md:inline">{siteConfig.location}</span>
      </div>

      <div className="vhs absolute top-0 right-6 flex -translate-y-1/2 items-center gap-2 text-base text-white/80 sm:right-8 sm:text-lg">
        <span>PLAY {PLAY}</span>
        <HeroTimecode />
      </div>
    </div>
  );
}

/**
 * HERO — a abertura do show.
 * Camadas (de baixo para cima): foto (Ken Burns + parallax só no modo completo) · sombras e luz colorida ·
 * lasers e partículas (modo completo) · grão + scanlines · moldura HUD · conteúdo (h1 com logo, DJ & VJ,
 * texto, CTAs) · equalizador + scroll.
 * Tudo que é conteúdo nasce visível no HTML do servidor; efeitos são decorativos e só no desktop capaz.
 */
export function Hero() {
  return (
    <HeroShell
      id="inicio"
      aria-labelledby="hero-title"
      className={cn("relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-void", styles.hero)}
    >
      <HeroBackground />

      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className={cn("absolute inset-0 lg:hidden", styles.shadeBottom)} />
        <div className={cn("absolute inset-0 hidden lg:block", styles.shadeSide)} />
        <div className={cn("absolute inset-0", styles.wash)} />
        <div className={cn("absolute inset-0", styles.vignette)} />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-void to-transparent" />
      </div>

      <HeroFx />

      {/* textura CRT: grão + scanlines com blend no modo completo; scanlines simples (sem blend) no leve */}
      <div aria-hidden className="fx-full-only pointer-events-none absolute inset-0">
        <div className="grain scanlines h-full w-full" />
      </div>
      <div aria-hidden className={cn("fx-lite-only pointer-events-none absolute inset-0", styles.scanlinesLite)} />

      <HeroHud />

      <div className={cn("container-bb relative z-10 flex flex-1 flex-col justify-end lg:justify-center", styles.stage)}>
        <HeroContent />
      </div>

      <HeroBottom />
    </HeroShell>
  );
}
