import type { CSSProperties } from "react";
import type { Accent, musicStyles } from "@/data/content";
import { KnobIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { CrateCarousel } from "./CrateCarousel";
import styles from "./MusicStyles.module.css";

type StyleItem = (typeof musicStyles)[number];

const accentVar: Record<Accent, string> = {
  magenta: "var(--color-magenta)",
  cyan: "var(--color-cyan)",
  purple: "var(--color-purple)",
  blue: "var(--color-blue)",
  red: "var(--color-red)",
};

/** Entrada escalonada por coluna (CSS scroll-driven, só no modo completo). */
const revealStep = ["reveal", "reveal reveal-2", "reveal reveal-3"] as const;

const pad = (n: number) => String(n).padStart(2, "0");

/** O til da Orbitron parece crase (Ã → À): títulos com til usam a fonte HUD. */
const hasTilde = (s: string) => /[ãõñÃÕÑ]/.test(s);

/**
 * Caixa de discos: cada estilo musical é uma capa de vinil. Desktop: grade 3 colunas
 * (2 no tablet) com o disco deslizando (e girando, no modo completo) no hover. Mobile: carrossel com snap.
 * Renderizado no servidor — só o carrossel (CrateCarousel) é cliente.
 * Modo leve: capas estáticas, disco já parcialmente fora, sem filtros nem blend.
 */
export function StyleCrate({ items }: { items: StyleItem[] }) {
  const half = Math.ceil(items.length / 2);

  return (
    <CrateCarousel count={items.length}>
      {items.map((item, i) => (
        <RecordSleeve
          key={`${item.title}-${i}`}
          item={item}
          index={i}
          track={i < half ? `A${i + 1}` : `B${i - half + 1}`}
        />
      ))}
    </CrateCarousel>
  );
}

function RecordSleeve({ item, index, track }: { item: StyleItem; index: number; track: string }) {
  const words = item.title.trim().split(/\s+/);
  const stacked = words.join("\n");
  const longest = Math.max(...words.map((w) => w.length), 4);
  // Tamanho do título proporcional à capa (container query), limitado pela palavra mais longa.
  const titleSize = `min(15.5cqw, ${(84 / (longest * 0.86)).toFixed(2)}cqw)`;
  const variant = index % 6;

  return (
    <li
      className={cn(
        "group w-[80%] max-w-[21rem] shrink-0 snap-start sm:w-auto sm:max-w-none",
        revealStep[index % 3],
        styles.card,
      )}
      style={{ "--acc": accentVar[item.accent] } as CSSProperties}
    >
      <div className={styles.lift}>
        <div className="relative aspect-[1.32/1]">
          {/* Vinil */}
          <div aria-hidden className={styles.recordTrack}>
            <div className={styles.recordOut}>
              <div className={styles.recordSpin} />
              <span className={styles.recordSheen} />
            </div>
          </div>

          {/* Capa */}
          <div className={styles.sleeve}>
            <SleeveArt variant={variant} index={index} />
            <div className={styles.scrim} />

            <div className="absolute inset-x-[7%] top-[6.5%] flex items-start justify-between" aria-hidden>
              <span className="hud text-[length:max(0.6rem,3.6cqw)] leading-tight text-white/75">
                BB—{pad(index + 1)}
                <span className="block text-white/45">33⅓ RPM</span>
              </span>
              <KnobIcon className="size-[9cqw] text-white/70" />
            </div>

            <h3
              className={cn(
                "absolute inset-x-[7%] bottom-[7%] font-black text-white uppercase",
                hasTilde(item.title) ? "font-hud" : "font-display",
                styles.title,
              )}
              style={{ fontSize: titleSize }}
            >
              {/* O conteúdo gerado do .glitch (data-text) entra no nome acessível — leitor de tela lê só o texto limpo. */}
              <span className="sr-only">{item.title}</span>
              <span aria-hidden className="glitch" data-text={stacked}>
                {stacked}
              </span>
            </h3>
          </div>
        </div>

        {/* Encarte */}
        <div className="mt-5 flex items-baseline gap-4 pr-[12%]">
          <span aria-hidden className="hud shrink-0 text-white">
            <span className="mr-2 inline-block size-1.5 -translate-y-px rounded-full bg-(--acc) shadow-[0_0_10px_var(--acc)]" />
            {track}
          </span>
          <p className="text-[0.95rem] leading-relaxed text-mute">{item.text}</p>
        </div>
      </div>
    </li>
  );
}

/** Estampa da capa — seis variações em ciclo, todas na cor de destaque do estilo. */
function SleeveArt({ variant, index }: { variant: number; index: number }) {
  if (variant === 4) {
    // Forma de onda (estilo player) — um único <path>
    const bars = Array.from({ length: 44 }, (_, i) => {
      const x = 7 + i * 2;
      const a = 3 + 17 * Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.11 + 0.6)) + (i % 3) * 1.2;
      return `M${x} ${(44 - a).toFixed(1)}V${(44 + a * 0.55).toFixed(1)}`;
    }).join("");
    return (
      <div aria-hidden className={styles.art}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.svgArt}>
          <path d={bars} style={{ stroke: "var(--acc)" }} strokeWidth="1.1" strokeLinecap="round" opacity="0.85" />
          <path d="M7 44H93" style={{ stroke: "var(--acc)" }} strokeWidth="0.3" opacity="0.6" />
        </svg>
      </div>
    );
  }
  if (variant === 5) {
    // Espectro em "chamas" (valores arredondados: idênticos no servidor e no navegador)
    const gradientId = `bb-flame-${index}`;
    const bars = Array.from({ length: 15 }, (_, i) => {
      const h = 10 + 34 * Math.abs(Math.sin(i * 0.9 + 0.4)) * (0.55 + 0.45 * Math.cos(i * 0.33));
      return { x: Number((8 + i * 5.8).toFixed(1)), h: Number(h.toFixed(2)) };
    });
    return (
      <div aria-hidden className={styles.art}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.svgArt}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" style={{ stopColor: "var(--acc)" }} stopOpacity="0.95" />
              <stop offset="1" style={{ stopColor: "var(--acc)" }} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {bars.map((b) => (
            <rect
              key={b.x}
              x={b.x}
              y={Number((62 - b.h).toFixed(2))}
              width="3.6"
              height={b.h}
              rx="0.6"
              fill={`url(#${gradientId})`}
            />
          ))}
        </svg>
      </div>
    );
  }
  return <div aria-hidden className={cn(styles.art, [styles.p0, styles.p1, styles.p2, styles.p3][variant])} />;
}
