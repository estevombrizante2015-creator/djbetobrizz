import { siteConfig } from "@/config/site";
import { NeonButton } from "@/components/ui/NeonButton";
import { CalendarIcon, PlayIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { HeroLogo } from "./HeroLogo";
import styles from "./Hero.module.css";

/** "DJ & VJ" → DJ (vermelho do logo: som) · & · VJ (ciano: imagem). */
function splitTitle(title: string) {
  const m = title.match(/^(.+?)\s*&\s*(.+)$/);
  if (!m) return [{ text: title, tone: "text-white text-glow-magenta" }];
  return [
    { text: m[1], tone: "text-white text-glow-red" },
    { text: " & ", tone: "font-hud font-semibold text-white/55" },
    { text: m[2], tone: "text-white text-glow-cyan" },
  ];
}

/**
 * "DJ & VJ" — sempre visível. No modo completo, quando o show começa, as linhas se estendem e um
 * cursor ciano "digita" por cima do título e pisca no fim (decorativo, só transform/opacity; ver CSS).
 */
function Title() {
  const parts = splitTitle(siteConfig.title);
  return (
    <span className="mt-4 flex items-center justify-center gap-4 sm:mt-5 lg:justify-start">
      <span
        aria-hidden
        className={cn(
          "h-px w-10 origin-right bg-linear-to-l from-cyan/70 to-transparent sm:w-16 lg:hidden",
          styles.lineIn,
        )}
      />
      <span className="relative font-display text-[clamp(1.35rem,min(6.4vw,7svh),3rem)] leading-none font-black tracking-[0.2em] whitespace-pre">
        {parts.map((part, i) => (
          <span key={`${i}-${part.text}`} className={part.tone}>
            {part.text}
          </span>
        ))}
        <span aria-hidden className={styles.caretTrack}>
          <span className={styles.caret} />
        </span>
      </span>
      <span
        aria-hidden
        className={cn(
          "h-px w-10 flex-none origin-left bg-linear-to-r from-cyan/70 via-purple/50 to-transparent sm:w-16 lg:w-auto lg:flex-1",
          styles.lineIn,
        )}
      />
    </span>
  );
}

/**
 * Conteúdo do hero: h1 (logo + "DJ & VJ"), tagline HUD, texto e CTAs.
 * Tudo visível no HTML do servidor e na primeira pintura (LCP). No desktop do modo completo,
 * sobe e some suavemente ao rolar (animação CSS ligada ao scroll, sem JS).
 */
export function HeroContent() {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[700px] text-center lg:mr-0 lg:ml-auto lg:text-left xl:max-w-[760px]",
        styles.contentParallax,
      )}
    >
      <h1 id="hero-title">
        <span className="sr-only">{`${siteConfig.name} — `}</span>
        {/* limitado pela altura também: telas baixas (celular deitado, notebook 720p/768p) */}
        <HeroLogo className={cn("mx-auto w-full lg:mx-0", styles.logoFit)} />
        <Title />
      </h1>

      <p
        lang="en"
        className="hud mt-5 flex items-center justify-center gap-3 text-[0.7rem] text-white/80 sm:text-xs lg:justify-start"
      >
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-red shadow-neon-red" />
        {siteConfig.tagline}
      </p>

      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-pretty text-white/85 [text-shadow:0_1px_12px_rgb(0_0_0/0.8)] sm:text-lg lg:mx-0">
        {siteConfig.heroText}
      </p>

      <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4 lg:justify-start">
        <span className="relative flex rounded-full bg-void/55">
          {/* brilho estático (sem filter: blur); pulsa só no modo completo */}
          <span
            aria-hidden
            className="absolute -inset-1 rounded-full bg-red/20 shadow-[0_0_26px_6px_rgb(255_36_20/0.32)] [html[data-perf=full]_&]:animate-pulse-glow"
          />
          <NeonButton
            href={siteConfig.availabilityUrl}
            external
            variant="red"
            size="lg"
            icon={<CalendarIcon size={20} />}
            event="cta_click"
            eventParams={{ cta: "hero_disponibilidade" }}
            aria-label="Verificar disponibilidade pelo WhatsApp (abre em nova aba)"
            className="relative w-full max-sm:gap-2.5! max-sm:px-4! max-sm:text-[0.8rem]! max-sm:tracking-[0.14em]!"
          >
            Verificar disponibilidade
          </NeonButton>
        </span>
        <span className="relative flex rounded-full bg-void/55">
          <NeonButton
            href="#experiencia"
            variant="cyan"
            size="lg"
            icon={<PlayIcon size={16} />}
            event="cta_click"
            eventParams={{ cta: "hero_ver_experiencia" }}
            className="w-full"
          >
            Ver experiência
          </NeonButton>
        </span>
      </div>
    </div>
  );
}
