"use client";

import { useEffect, useId, useRef, type CSSProperties } from "react";
import { motion, type Variants } from "motion/react";
import type { Accent, musicStyles } from "@/data/content";
import { KnobIcon } from "@/components/ui/Icons";
import { ease, stagger } from "@/lib/animations";
import { cn } from "@/lib/utils";
import styles from "./MusicStyles.module.css";

type StyleItem = (typeof musicStyles)[number];

const accentVar: Record<Accent, string> = {
  magenta: "var(--color-magenta)",
  cyan: "var(--color-cyan)",
  purple: "var(--color-purple)",
  blue: "var(--color-blue)",
  red: "var(--color-red)",
};

const cardIn: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: ease.out } },
};

/** O vinil "sai" da capa logo depois que o card entra. */
const recordOut: Variants = {
  hidden: { x: "-24%" },
  show: { x: "0%", transition: { duration: 1.1, ease: ease.out, delay: 0.3 } },
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Caixa de discos: cada estilo musical é uma capa de vinil. Desktop: grade 3 colunas
 * (2 no tablet) com o disco deslizando e girando no hover. Mobile: carrossel com snap.
 */
export function StyleCrate({ items }: { items: StyleItem[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  // Indicador de progresso do carrossel (mobile) — atualiza via CSS var, sem re-render.
  useEffect(() => {
    const list = listRef.current;
    const bar = barRef.current;
    if (!list || !bar) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = list.scrollWidth - list.clientWidth;
      bar.style.setProperty("--p", String(max > 0 ? list.scrollLeft / max : 0));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    list.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      list.removeEventListener("scroll", onScroll);
    };
  }, []);

  const half = Math.ceil(items.length / 2);

  return (
    <>
      <motion.ul
        ref={listRef}
        variants={stagger(0.09)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className={cn(
          "-mx-4 mt-12 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pt-2 pb-8",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "sm:mx-0 sm:mt-16 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-14 sm:overflow-visible sm:px-0 sm:pb-0",
          "lg:grid-cols-3 lg:gap-x-10 lg:gap-y-16",
        )}
      >
        {items.map((item, i) => (
          <RecordSleeve
            key={`${item.title}-${i}`}
            item={item}
            index={i}
            track={i < half ? `A${i + 1}` : `B${i - half + 1}`}
          />
        ))}
      </motion.ul>

      {/* Progresso do carrossel — só no mobile */}
      <div aria-hidden className="mt-1 flex items-center gap-4 sm:hidden">
        <span className="hud text-[0.65rem] text-mute">Arraste</span>
        <span className="relative h-px flex-1 overflow-hidden bg-line-strong">
          <span
            ref={barRef}
            className="absolute inset-y-0 left-0 w-1/4 bg-cyan shadow-neon-cyan"
            style={{ transform: "translateX(calc(var(--p, 0) * 300%))" }}
          />
        </span>
        <span className="hud text-[0.65rem] text-mute">{pad(items.length)} discos</span>
      </div>
    </>
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
    <motion.li
      variants={cardIn}
      className={cn("group w-[80%] max-w-[21rem] shrink-0 snap-start sm:w-auto sm:max-w-none", styles.card)}
      style={{ "--acc": accentVar[item.accent] } as CSSProperties}
    >
      <div className={styles.lift}>
        <div className="relative aspect-[1.32/1]">
          {/* Vinil */}
          <div aria-hidden className={styles.recordTrack}>
            <motion.div variants={recordOut} className="relative size-full">
              <div className={styles.recordSpin} />
              <span className={styles.recordSheen} />
            </motion.div>
          </div>

          {/* Capa */}
          <div className={styles.sleeve}>
            <SleeveArt variant={variant} />
            <div className={styles.scrim} />

            <div className="absolute inset-x-[7%] top-[6.5%] flex items-start justify-between" aria-hidden>
              <span className="hud text-[length:max(0.6rem,3.6cqw)] leading-tight text-white/75">
                BB—{pad(index + 1)}
                <span className="block text-white/45">33⅓ RPM</span>
              </span>
              <KnobIcon className="size-[9cqw] text-white/70" />
            </div>

            <h3
              className={cn("absolute inset-x-[7%] bottom-[7%] font-display font-black text-white uppercase", styles.title)}
              style={{ fontSize: titleSize }}
            >
              <span className="glitch" data-text={stacked}>
                {stacked}
              </span>
            </h3>
          </div>
        </div>

        {/* Encarte */}
        <div className="mt-5 flex items-baseline gap-4 pr-[12%]">
          <span className="hud shrink-0 text-white">
            <span aria-hidden className="mr-2 inline-block size-1.5 -translate-y-px rounded-full bg-(--acc) shadow-[0_0_10px_var(--acc)]" />
            {track}
          </span>
          <p className="text-[0.95rem] leading-relaxed text-mute">{item.text}</p>
        </div>
      </div>
    </motion.li>
  );
}

/** Estampa da capa — seis variações em ciclo, todas na cor de destaque do estilo. */
function SleeveArt({ variant }: { variant: number }) {
  const gradientId = `bb-flame-${useId().replace(/:/g, "")}`;
  if (variant === 4) {
    // Forma de onda (estilo player)
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
    // Espectro em "chamas"
    const bars = Array.from({ length: 15 }, (_, i) => {
      const h = 10 + 34 * Math.abs(Math.sin(i * 0.9 + 0.4)) * (0.55 + 0.45 * Math.cos(i * 0.33));
      return { x: 8 + i * 5.8, h };
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
            <rect key={b.x} x={b.x} y={62 - b.h} width="3.6" height={b.h} rx="0.6" fill={`url(#${gradientId})`} />
          ))}
        </svg>
      </div>
    );
  }
  return <div aria-hidden className={cn(styles.art, [styles.p0, styles.p1, styles.p2, styles.p3][variant])} />;
}
