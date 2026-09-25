"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useInView, useMotionValueEvent, useScroll } from "motion/react";

/**
 * Parte do palco DJ | = | VJ ligada ao scroll. Fica num chunk próprio (carregado com React.lazy
 * pelo <DjVjStage/>) para que useScroll/useMotionValueEvent não entrem no bundle inicial de
 * celulares e PCs simples, que nunca montam o <ScrollLink/>.
 */

/** Progresso a partir do qual as duas metades estão "conectadas". */
const LINK_AT = 0.9;

/** Janela do scroll: começa com o topo do palco a 95% da tela e termina com o centro a 58%. */
const START = 0.95;
const END = 0.58;

type ScrollLinkProps = {
  target: RefObject<HTMLDivElement | null>;
  onLinkedChange: (linked: boolean, withJolt: boolean) => void;
  onInViewChange: (inView: boolean) => void;
};

/** Interpolação linear limitada (como o useTransform com clamp). */
function mix(v: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const t = Math.min(1, Math.max(0, (v - inMin) / (inMax - inMin)));
  return outMin + (outMax - outMin) * t;
}

/**
 * Pinta o palco para um progresso — só ESCRITAS de estilo (nenhuma leitura de layout), em
 * transform/opacity/dashoffset. `reset` devolve o markup ao estado final estático.
 */
function stagePainter(stage: HTMLElement) {
  const decks = Array.from(stage.querySelectorAll<HTMLElement>("[data-deck]"));
  const draws = Array.from(stage.querySelectorAll<SVGPathElement>("[data-draw]"));
  const knob = stage.querySelector<HTMLElement>("[data-knob]");
  for (const el of decks) el.style.willChange = "transform, opacity";
  return {
    apply(v: number) {
      const x = mix(v, 0, 0.75, 120, 0);
      const opacity = String(mix(v, 0, 0.55, 0.3, 1));
      for (const el of decks) {
        el.style.transform = `translateX(${el.dataset.deck === "dj" ? -x : x}px)`;
        el.style.opacity = opacity;
      }
      const offset = String(1 - mix(v, 0.25, LINK_AT, 0, 1));
      for (const el of draws) el.style.strokeDashoffset = offset;
      if (knob) knob.style.rotate = `${mix(v, 0, LINK_AT, -135, 135)}deg`;
    },
    reset() {
      for (const el of decks) {
        el.style.transform = "";
        el.style.opacity = "";
        el.style.willChange = "";
      }
      for (const el of draws) el.style.strokeDashoffset = "";
      if (knob) knob.style.rotate = "";
    },
  };
}

/** Progresso inicial calculado da geometria (o useScroll só mede no frame seguinte). */
function measureProgress(el: HTMLElement) {
  const { top, height } = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const span = (START - END) * vh + height / 2;
  return Math.min(1, Math.max(0, (START * vh - top) / span));
}

/**
 * Liga o palco ao scroll — montado SÓ no desktop no modo completo, então o modo leve não tem
 * nenhum listener de scroll aqui. Não renderiza nada: pinta o DOM a cada mudança do scroll
 * (dentro do frame do motion) e só mexe no estado React nas mudanças discretas
 * (conectou/desconectou, entrou/saiu da tela).
 */
export function ScrollLink({ target, onLinkedChange, onInViewChange }: ScrollLinkProps) {
  const { scrollYProgress } = useScroll({ target, offset: [`start ${START}`, `center ${END}`] });
  const inView = useInView(target, { amount: 0.1 });
  const paintRef = useRef<((v: number) => void) | null>(null);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    paintRef.current?.(v);
    onLinkedChange(v >= LINK_AT, true);
  });

  useEffect(() => {
    const stage = target.current;
    if (!stage) return;
    const painter = stagePainter(stage);
    paintRef.current = painter.apply;
    const v = measureProgress(stage);
    painter.apply(v);
    onLinkedChange(v >= LINK_AT, false);
    // Se o nível cair para "lite", volta ao estado estático (conectado).
    return () => {
      paintRef.current = null;
      painter.reset();
      onLinkedChange(true, false);
    };
  }, [target, onLinkedChange]);

  useEffect(() => {
    onInViewChange(inView);
  }, [inView, onInViewChange]);

  return null;
}
