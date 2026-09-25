"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Ilha cliente da caixa de discos: só a lista rolável + a barra de progresso do carrossel (mobile).
 * As capas chegam prontas do servidor (children) e não são hidratadas.
 * Custo por rolagem: 1 leitura de scrollLeft + 1 escrita de variável CSS por frame (rAF);
 * a largura rolável só é medida quando o tamanho da lista muda (ResizeObserver).
 */
export function CrateCarousel({ count, children }: { count: number; children: ReactNode }) {
  const listRef = useRef<HTMLUListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const bar = barRef.current;
    if (!list || !bar) return;
    let raf = 0;
    let max = 0;
    const paint = () => {
      raf = 0;
      bar.style.setProperty("--p", max > 0 ? String(Math.min(1, list.scrollLeft / max)) : "0");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    // Rolando na horizontal, a lista vira focável (setas do teclado rolam); na grade (sm+) sai da ordem de Tab.
    const measure = () => {
      max = list.scrollWidth - list.clientWidth;
      if (max > 1) list.setAttribute("tabindex", "0");
      else list.removeAttribute("tabindex");
      paint();
    };
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    list.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      list.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <ul
        ref={listRef}
        aria-label="Estilos musicais"
        className={cn(
          "-mx-4 mt-12 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pt-2 pb-8",
          "focus-visible:outline-offset-[-2px]",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "sm:mx-0 sm:mt-16 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-14 sm:overflow-visible sm:px-0 sm:pb-0",
          "lg:grid-cols-3 lg:gap-x-10 lg:gap-y-16",
        )}
      >
        {children}
      </ul>

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
        <span className="hud text-[0.65rem] text-mute">{pad(count)} discos</span>
      </div>
    </>
  );
}
