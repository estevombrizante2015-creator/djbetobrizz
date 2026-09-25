import { ArrowDownIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { HeroLedFloor } from "./HeroLedFloor";
import styles from "./Hero.module.css";

const GAP = 0.28; // espaço entre barras, em fração da largura de uma barra (igual ao Visualizer)

const PALETTES = {
  red: ["#8a2be2", "#ff1493", "#ff2414"],
  neon: ["#00e5ff", "#8a2be2", "#ff1493"],
} as const;

/** Altura (0..1) da barra i — mesma curva de repouso do Visualizer. */
function level(i: number) {
  return 0.22 + 0.62 * Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.23 + 0.4));
}

/** Todas as barras num único <path> (em vez de dezenas de <rect>). */
function barsPath(bars: number) {
  let d = "";
  for (let i = 0; i < bars; i++) {
    const h = +(level(i) * 100).toFixed(2);
    d += `M${+(i * (1 + GAP)).toFixed(2)} ${+(100 - h).toFixed(2)}h1v${h}h-1z`;
  }
  return d;
}

/** Equalizador estático (modo leve): 2 SVGs de 1 path cada, trocados por CSS (celular / md+). */
function StaticFloor() {
  const variants = [
    { bars: 28, palette: "red", className: "md:hidden" },
    { bars: 56, palette: "neon", className: "hidden md:block" },
  ] as const;
  return (
    <>
      {variants.map(({ bars, palette, className }) => {
        const id = `hero-led-${palette}`;
        return (
          <svg
            key={palette}
            viewBox={`0 0 ${bars * (1 + GAP) - GAP} 100`}
            preserveAspectRatio="none"
            className={cn("size-full", className)}
          >
            <defs>
              <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
                {PALETTES[palette].map((color, i, all) => (
                  <stop key={color} offset={i / (all.length - 1)} style={{ stopColor: color }} />
                ))}
              </linearGradient>
            </defs>
            <path d={barsPath(bars)} fill={`url(#${id})`} opacity={0.9} />
          </svg>
        );
      })}
    </>
  );
}

/**
 * Base do hero: o indicador "SCROLL TO ENTER THE EXPERIENCE ↓" apoiado sobre o
 * "piso de LED" do palco (equalizador segmentado). Visível desde a primeira pintura.
 * O indicador fica acima das barras, nunca sobre elas (no desktop e no celular deitado vira uma
 * linha só: ↓ + texto, para não encostar nos CTAs em telas baixas).
 */
export function HeroBottom() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center">
      <a
        href="#sobre"
        className={`${styles.scrollCue} hud group pointer-events-auto mb-2 flex flex-col items-center gap-2 rounded-md px-3 py-1.5 text-[0.65rem] text-white/80 transition-colors hover:text-white sm:mb-3 sm:text-[0.7rem] lg:mb-4 lg:flex-row-reverse lg:gap-3 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:flex-row-reverse [@media(max-height:500px)]:gap-3`}
      >
        <span lang="en">Scroll to enter the experience</span>
        <span
          aria-hidden
          className="grid h-8 w-8 place-items-center rounded-full border border-white/25 bg-void/40 text-cyan transition-colors group-hover:border-cyan"
        >
          {/* seta estática no modo leve; "desce" em loop só no modo completo */}
          <ArrowDownIcon size={16} className="motion-safe:[html[data-perf=full]_&]:animate-scroll-cue" />
        </span>
      </a>

      {/* equalizador — "piso de LED" do palco (altura no wrapper; o conteúdo ocupa 100%) */}
      <div aria-hidden className={cn("relative h-11 w-full md:h-16 [@media(max-height:500px)]:h-9", styles.ledFloor)}>
        <HeroLedFloor>
          <StaticFloor />
        </HeroLedFloor>
      </div>
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-magenta/70 to-transparent"
      />
    </div>
  );
}
