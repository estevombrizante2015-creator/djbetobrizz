"use client";

import { useCallback, useRef, useState, type FocusEvent, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { Photo } from "@/data/types";
import { track } from "@/lib/analytics";

/**
 * O lightbox (e o AnimatePresence dele) só é baixado quando alguém abre uma foto —
 * ou, com mouse/teclado, quando mira um frame. No toque não há pré-carga: rolar a
 * galeria no celular nunca dispara download/parse de JS.
 */
const LightboxHost = dynamic(() => import("./Lightbox").then((m) => m.LightboxHost), { ssr: false });
let preloaded = false;
const preloadLightbox = () => {
  if (preloaded) return;
  preloaded = true;
  void import("./Lightbox");
};

const frameOf = (target: EventTarget | null) =>
  target instanceof Element ? target.closest<HTMLButtonElement>("button[data-frame]") : null;

/**
 * Ilha cliente da folha de contato: os frames são HTML do servidor (children) e o clique
 * chega por delegação (data-frame). Abre o lightbox naquela foto; ao fechar, o próprio
 * lightbox devolve o foco ao frame de origem (depois de liberar o `inert` da página).
 */
export function ContactSheet({ photos, children }: { photos: readonly Photo[]; children: ReactNode }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [armed, setArmed] = useState(false);
  const opener = useRef<HTMLElement | null>(null);

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const frame = frameOf(e.target);
    const index = Number(frame?.dataset.frame);
    if (!frame || !Number.isInteger(index) || index < 0 || index >= photos.length) return;
    opener.current = frame;
    setArmed(true);
    setOpenIndex(index);
    track("gallery_open", { index });
  };

  const onPointerOver = (e: PointerEvent<HTMLDivElement>) => {
    if (!preloaded && e.pointerType === "mouse" && frameOf(e.target)) preloadLightbox();
  };

  const onFocus = (e: FocusEvent<HTMLDivElement>) => {
    if (!preloaded && frameOf(e.target)) preloadLightbox();
  };

  const close = useCallback(() => setOpenIndex(null), []);

  return (
    <>
      <div onClick={onClick} onPointerOver={onPointerOver} onFocus={onFocus}>
        {children}
      </div>
      {armed ? <LightboxHost photos={photos} openIndex={openIndex} onClose={close} returnFocus={opener} /> : null}
    </>
  );
}
