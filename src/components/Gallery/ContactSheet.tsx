"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import type { Photo } from "@/data/types";
import { track } from "@/lib/analytics";
import { ease, fadeUp, stagger } from "@/lib/animations";
import { cn, getImageMeta } from "@/lib/utils";
import { ZoomInIcon } from "@/components/ui/Icons";
import { useExperience } from "@/components/Effects/ExperienceContext";
import styles from "./Gallery.module.css";

/** O lightbox só é baixado quando alguém abre (ou mira) uma foto. */
const Lightbox = dynamic(() => import("./Lightbox").then((m) => m.Lightbox), { ssr: false });
const preloadLightbox = () => {
  void import("./Lightbox");
};

/** Frame circulado com lápis dermatográfico (puramente decorativo). */
const MARKED_FRAME = 3;

/** 2 colunas no celular · 3 no tablet · 4 no desktop (container de 80rem). */
const SIZES = "(min-width: 1280px) 290px, (min-width: 1024px) 23vw, (min-width: 640px) 31vw, 47vw";

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Círculo à mão, em vermelho, que "se desenha" quando o frame entra na tela. */
function GreasePencil() {
  const { reducedMotion } = useExperience();
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 190"
      preserveAspectRatio="none"
      className="pointer-events-none absolute top-[-0.6rem] left-[-0.5rem] z-10 h-[calc(100%+1.2rem)] w-[calc(100%+1rem)] overflow-visible"
    >
      <motion.path
        d="M52 22 C96 4 164 12 186 48 C206 84 197 146 154 170 C114 192 48 186 20 150 C-4 118 2 60 36 32 C54 18 84 10 110 13"
        fill="none"
        stroke="var(--color-red)"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
        style={{ filter: "drop-shadow(0 0 5px rgb(255 36 20 / 0.55))" }}
        // `initial` fixo (igual no SSR e no cliente); com reduced-motion o traço aparece sem animar.
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.7 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.9, ease: ease.inOut, delay: 0.5 }}
      />
    </svg>
  );
}

type FrameProps = {
  photo: Photo;
  index: number;
  onOpen: (index: number) => void;
  setRef: (index: number, el: HTMLButtonElement | null) => void;
};

/** Um fotograma da tira: perfurações, foto 4:3, numeração de borda e legenda. */
function Frame({ photo, index, onOpen, setRef }: FrameProps) {
  const meta = getImageMeta(photo.src);
  const portrait = meta.height > meta.width;
  const edge = `${pad2(index + 1)}A ▸`;

  return (
    <button
      ref={(el) => setRef(index, el)}
      type="button"
      aria-label={`Abrir foto: ${photo.alt}`}
      onClick={() => onOpen(index)}
      onPointerEnter={preloadLightbox}
      onFocus={preloadLightbox}
      className={cn(
        "group relative block w-full cursor-zoom-in px-1 pb-1 text-left sm:px-1.5",
        "focus-visible:z-10 focus-visible:rounded-none",
        styles.strip,
        styles.frame,
      )}
    >
      <span aria-hidden className={styles.perfs} />

      <span
        className={cn(
          "relative block aspect-[4/3] overflow-hidden bg-ink ring-1 ring-white/10",
          "transition-[box-shadow] duration-300 ease-out",
          "group-hover:shadow-neon-cyan group-hover:ring-cyan/80 group-focus-visible:shadow-neon-cyan group-focus-visible:ring-cyan/80",
        )}
      >
        <span className={cn("absolute inset-0 block", styles.jolt)}>
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes={SIZES}
            {...(meta.blurDataURL ? { placeholder: "blur" as const, blurDataURL: meta.blurDataURL } : {})}
            className={cn(
              "object-cover brightness-[0.82] saturate-[0.9] transition-[scale,filter] duration-700 ease-out",
              "group-hover:scale-110 group-hover:brightness-105 group-hover:saturate-125",
              "group-focus-visible:scale-110 group-focus-visible:brightness-105",
              portrait && "object-[50%_18%]",
            )}
          />
        </span>
        <span aria-hidden className={cn("fx-desktop-only", styles.glitch)} />
        {/* vinheta de lente */}
        <span aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_36px_rgb(0_0_0/0.65)]" />
        <span
          aria-hidden
          className="fx-desktop-only absolute right-2 bottom-2 grid size-8 translate-y-1 place-items-center rounded-full border border-cyan/70 bg-void/70 text-cyan opacity-0 transition-[opacity,translate] duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
        >
          <ZoomInIcon size={15} />
        </span>
      </span>

      <span aria-hidden className={styles.perfs} />

      {/* impressão de borda do filme */}
      <span aria-hidden className="flex items-baseline justify-between gap-2 px-0.5 pt-0.5">
        <span className="glitch font-vhs text-[0.95rem] leading-none text-red" data-text={edge}>
          {edge}
        </span>
        {photo.caption ? (
          <span className="min-w-0 truncate font-hud text-[0.62rem] leading-none font-semibold tracking-[0.2em] text-mute uppercase sm:text-[0.66rem]">
            {photo.caption}
          </span>
        ) : null}
      </span>
    </button>
  );
}

/**
 * Folha de contato: tiras de filme em grade (2 · 3 · 4 colunas). Cada frame é um
 * botão que abre o lightbox naquela foto; ao fechar, o foco volta ao frame de origem.
 */
export function ContactSheet({ photos }: { photos: readonly Photo[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const frames = useRef<Array<HTMLButtonElement | null>>([]);

  const setRef = useCallback((index: number, el: HTMLButtonElement | null) => {
    frames.current[index] = el;
  }, []);

  const open = useCallback((index: number) => {
    opener.current = frames.current[index] ?? null;
    setOpenIndex(index);
    track("gallery_open", { index });
  }, []);

  // O próprio lightbox devolve o foco ao frame de origem ao desmontar
  // (depois de liberar o `inert` do resto da página).
  const close = useCallback(() => setOpenIndex(null), []);

  return (
    <>
      <motion.ul
        variants={stagger(0.05)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-2 gap-y-4 sm:grid-cols-3 sm:gap-y-5 lg:grid-cols-4 lg:gap-y-6"
      >
        {photos.map((photo, i) => (
          <motion.li key={`${i}-${photo.src}`} variants={fadeUp} className="relative min-w-0">
            <Frame photo={photo} index={i} onOpen={open} setRef={setRef} />
            {i === MARKED_FRAME ? <GreasePencil /> : null}
          </motion.li>
        ))}
      </motion.ul>

      <AnimatePresence>
        {openIndex !== null ? (
          <Lightbox key="lightbox" photos={photos} startIndex={openIndex} onClose={close} returnFocus={opener} />
        ) : null}
      </AnimatePresence>
    </>
  );
}
