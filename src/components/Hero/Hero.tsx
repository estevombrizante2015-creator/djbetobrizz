import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { HeroIntroProvider } from "./HeroIntro";
import { HeroBackground } from "./HeroBackground";
import { HeroFx } from "./HeroFx";
import { HeroContent } from "./HeroContent";
import { HeroBottom } from "./HeroBottom";
import { HeroTimecode } from "./HeroTimecode";
import styles from "./Hero.module.css";

/** Sem JavaScript, nada da coreografia pode ficar invisível. */
const NO_JS_CSS = ".hero-reveal{opacity:1!important;transform:none!important;clip-path:none!important}";

const corner = "absolute h-4 w-4 border-white/35 sm:h-5 sm:w-5";

/** Moldura de monitor de VJ: cantos, canal, REC e timecode. Puramente decorativa. */
function HeroHud() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-3 top-[84px] bottom-3 z-10 sm:inset-x-6 sm:bottom-6 lg:inset-x-8 lg:top-[96px]"
    >
      <span className={cn(corner, "top-0 left-0 border-t border-l")} />
      <span className={cn(corner, "top-0 right-0 border-t border-r")} />
      <span className={cn(corner, "bottom-0 left-0 border-b border-l")} />
      <span className={cn(corner, "right-0 bottom-0 border-r border-b")} />

      <div className="hud absolute top-0 left-6 flex -translate-y-1/2 items-center gap-3 text-[0.62rem] text-white/75 sm:left-8">
        <span className="flex items-center gap-1.5">
          <span className="animate-rec h-1.5 w-1.5 rounded-full bg-red shadow-neon-red" />
          REC
        </span>
        <span className="text-white/45">CH-01</span>
        <span className="hidden text-white/45 md:inline">Sound &amp; Visual Experience</span>
      </div>

      <div className="vhs absolute top-0 right-6 flex -translate-y-1/2 items-center gap-2 text-base text-white/80 sm:right-8 sm:text-lg">
        <span>PLAY ▶</span>
        <HeroTimecode />
      </div>

      <p className="hud absolute bottom-0 left-8 hidden translate-y-1/2 text-[0.62rem] text-white/60 lg:block">
        {siteConfig.location}
      </p>
    </div>
  );
}

/**
 * HERO — a abertura do show.
 * Camadas (de baixo para cima): foto/vídeo com Ken Burns · sombras e luz colorida · lasers e partículas ·
 * grão + scanlines · moldura HUD · conteúdo (h1 com logo, DJ & VJ, texto, CTAs) · equalizador + scroll.
 */
export function Hero() {
  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-void"
    >
      <HeroIntroProvider>
        <HeroBackground />

        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className={cn("absolute inset-0 lg:hidden", styles.shadeBottom)} />
          <div className={cn("absolute inset-0 hidden lg:block", styles.shadeSide)} />
          <div className={cn("absolute inset-0 lg:mix-blend-screen", styles.wash)} />
          <div className={cn("absolute inset-0", styles.vignette)} />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-void to-transparent" />
        </div>

        <HeroFx />

        {/* textura CRT: grão + scanlines com blend no desktop; versão leve (sem blend) no touch */}
        <div aria-hidden className="fx-desktop-only pointer-events-none absolute inset-0">
          <div className="grain scanlines h-full w-full" />
        </div>
        <div aria-hidden className={cn("pointer-events-none absolute inset-0 [@media(hover:hover)]:hidden", styles.scanlinesLite)} />

        <HeroHud />

        <div className="container-bb relative z-10 flex flex-1 flex-col justify-end pt-32 pb-36 sm:pb-40 lg:justify-center lg:pt-36 lg:pb-40">
          <HeroContent />
        </div>

        <HeroBottom />
      </HeroIntroProvider>

      <noscript>
        <style>{NO_JS_CSS}</style>
      </noscript>
    </section>
  );
}
