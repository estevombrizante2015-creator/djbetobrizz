"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { track } from "@/lib/analytics";
import { useExperience } from "@/components/Effects/ExperienceContext";

/**
 * Ilha cliente mínima da grade de pads (os pads em si são HTML do servidor):
 * - analytics por delegação: um único onClick lê `data-tipo` do pad clicado;
 * - modo completo: ao entrar na tela, liga `data-flash` UMA vez (1 IntersectionObserver)
 *   e o CSS faz a checagem dos LEDs. No modo leve não há observer nem animação.
 */
export function PadDeck({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { lite, reducedMotion } = useExperience();

  useEffect(() => {
    const el = ref.current;
    if (!el || lite || reducedMotion || el.dataset.flash !== undefined) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        el.dataset.flash = "";
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [lite, reducedMotion]);

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const pad = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-tipo]") : null;
    if (pad) track("whatsapp_click", { source: "tipos_de_evento", tipo: pad.dataset.tipo });
  };

  return (
    <div ref={ref} className={className} onClick={onClick}>
      {children}
    </div>
  );
}
