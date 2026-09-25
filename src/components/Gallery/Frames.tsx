import Image from "next/image";
import type { Photo } from "@/data/types";
import { cn, getImageMeta } from "@/lib/utils";
import { ZoomInIcon } from "@/components/ui/Icons";
import styles from "./Gallery.module.css";

/** Frame circulado com lápis dermatográfico (puramente decorativo). */
const MARKED_FRAME = 3;

/** Colunas: 2 · 3 (640-767) · 4 (768+) (container de 80rem). */
const SIZES = "(min-width: 1280px) 290px, (min-width: 768px) 23vw, (min-width: 640px) 31vw, 47vw";

const pad2 = (n: number) => String(n).padStart(2, "0");

const PENCIL = "M52 22 C96 4 164 12 186 48 C206 84 197 146 154 170 C114 192 48 186 20 150 C-4 118 2 60 36 32 C54 18 84 10 110 13";

/**
 * Círculo à mão, em vermelho. Brilho = traço largo translúcido por baixo (sem drop-shadow).
 * Modo leve: já desenhado. Modo completo: "se desenha" com a rolagem (CSS scroll-driven).
 */
function GreasePencil() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 190"
      preserveAspectRatio="none"
      className={cn(
        styles.pencil,
        "pointer-events-none absolute top-[-0.6rem] left-[-0.5rem] z-10 h-[calc(100%+1.2rem)] w-[calc(100%+1rem)] overflow-visible",
      )}
    >
      <g fill="none" stroke="var(--color-red)" strokeLinecap="round" strokeLinejoin="round">
        <path className={styles.pencilStroke} d={PENCIL} pathLength={1} strokeWidth={7} opacity={0.16} />
        <path className={styles.pencilStroke} d={PENCIL} pathLength={1} strokeWidth={2.6} opacity={0.85} />
      </g>
    </svg>
  );
}

/**
 * Um fotograma da tira: perfurações (CSS), foto 4:3, numeração de borda e legenda.
 * HTML do servidor: o clique é tratado por delegação no ContactSheet (data-frame).
 */
function Frame({ photo, index }: { photo: Photo; index: number }) {
  const meta = getImageMeta(photo.src);
  const portrait = meta.height > meta.width;
  const edge = `${pad2(index + 1)}A ▸`;

  return (
    <button
      type="button"
      data-frame={index}
      aria-label={`Abrir foto: ${photo.alt}`}
      className={cn(
        "group relative block w-full cursor-zoom-in px-1 pb-1 text-left sm:px-1.5",
        "focus-visible:z-10 focus-visible:rounded-none",
        styles.frame,
      )}
    >
      <span
        className={cn(
          styles.photo,
          "relative block aspect-[4/3] overflow-hidden bg-ink ring-1 ring-white/10",
          "group-hover:ring-cyan/80 group-focus-visible:shadow-neon-cyan group-focus-visible:ring-cyan/80",
        )}
      >
        {/* Placeholder: miniatura de 12px ampliada (já desfocada) — sem o SVG com blur do next/image */}
        <span
          className={cn("absolute inset-0 block bg-cover", portrait ? "bg-position-[50%_18%]" : "bg-center", styles.jolt)}
          style={meta.blurDataURL ? { backgroundImage: `url("${meta.blurDataURL}")` } : undefined}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes={SIZES}
            quality={60}
            className={cn(styles.img, "object-cover", portrait && "object-[50%_18%]")}
          />
        </span>
        <span
          aria-hidden
          className="fx-full-only absolute right-2 bottom-2 z-[1] grid size-8 translate-y-1 place-items-center rounded-full border border-cyan/70 bg-void/70 text-cyan opacity-0 transition-[opacity,translate] duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
        >
          <ZoomInIcon size={15} />
        </span>
      </span>

      {/* impressão de borda do filme (as perfurações inferiores são o fundo desta linha) */}
      <span aria-hidden className={cn(styles.edge, "flex items-baseline justify-between gap-2 px-0.5")}>
        <span className={cn("glitch font-vhs text-[0.95rem] leading-none text-red", styles.edgeText)} data-text={edge}>
          {edge}
        </span>
        {photo.caption ? (
          <span className="min-w-0 truncate pt-[0.25em] font-hud text-[0.62rem] leading-none font-semibold tracking-[0.2em] text-mute uppercase sm:text-[0.66rem]">
            {photo.caption}
          </span>
        ) : null}
      </span>
    </button>
  );
}

/** Folha de contato: tiras de filme em grade (2 · 3 (640-767) · 4 (768+) colunas). Entrada por CSS (.reveal). */
export function FrameGrid({ photos }: { photos: readonly Photo[] }) {
  return (
    <ul className="grid grid-cols-2 gap-y-4 sm:grid-cols-3 sm:gap-y-5 md:grid-cols-4 lg:gap-y-6">
      {photos.map((photo, i) => (
        <li key={`${i}-${photo.src}`} className={cn("reveal relative min-w-0", i % 2 === 1 && "reveal-2")}>
          <Frame photo={photo} index={i} />
          {i === MARKED_FRAME ? <GreasePencil /> : null}
        </li>
      ))}
    </ul>
  );
}
