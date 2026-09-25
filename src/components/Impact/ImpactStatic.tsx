import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import {
  BLOOM_CLASS,
  EdgeFades,
  LINE_1,
  LINE_1_CLASS,
  LINE_2,
  LINE_2_CLASS,
  LINE_2_ROW_CLASS,
  LINE_2_STROKE,
  QuoteMark,
  Rows,
  neonLit,
} from "./phrase";

/**
 * Frase de impacto estática — modo leve (celulares, PCs simples, movimento reduzido) e SSR.
 * Uma tela de altura, frase já acesa em neon (text-shadow estático), sem trilho de scroll,
 * sem partículas/lasers, sem blend e sem filtros animados. Zero JS: renderizada no servidor.
 *
 * Em desktop "full" (o atributo data-perf já existe antes da 1ª pintura) o CSS dá a este quadro a
 * MESMA geometria do palco com scroll (trilho 240vh + quadro sticky h-svh): quando o palco animado
 * substitui o estático após a hidratação, a página não cresce ~140vh de repente abaixo do visitante.
 */
export function ImpactStatic({ backdrop }: { backdrop: ReactNode }) {
  return (
    <div className="relative lg:motion-safe:[html[data-perf=full]_&]:h-[240vh]">
      <div className="relative flex min-h-[min(100svh,56rem)] items-center overflow-hidden py-24 sm:py-28 lg:motion-safe:[html[data-perf=full]_&]:sticky lg:motion-safe:[html[data-perf=full]_&]:top-0 lg:motion-safe:[html[data-perf=full]_&]:h-svh lg:motion-safe:[html[data-perf=full]_&]:min-h-0 lg:motion-safe:[html[data-perf=full]_&]:pt-20 lg:motion-safe:[html[data-perf=full]_&]:pb-0">
        <div className="absolute inset-0">{backdrop}</div>
        <EdgeFades />
        <div aria-hidden className={BLOOM_CLASS} />

        <div className="container-bb relative z-10">
          <figure className="relative">
            <p className="hud mb-10 flex items-center gap-3 text-mute">
              <span aria-hidden className="h-px w-10 bg-magenta shadow-neon-magenta" />
              Sound • Visual • Energy
            </p>

            <blockquote className="relative font-display font-black tracking-[-0.02em] uppercase">
              <QuoteMark />

              {/* Linha 1 — "A música passa.": contorno + preenchimento já esmaecendo */}
              <p className={LINE_1_CLASS}>
                <span className="text-outline block opacity-60">
                  <Rows rows={LINE_1} />
                </span>
                <span aria-hidden className="text-glow-cyan absolute inset-0 text-white opacity-90">
                  <Rows rows={LINE_1} />
                </span>
              </p>

              {/* Linha 2 — "A experiência fica." acesa */}
              <p className={LINE_2_CLASS}>
                <span className={LINE_2_STROKE}>
                  <Rows rows={LINE_2} rowClass={LINE_2_ROW_CLASS} />
                </span>
                <span aria-hidden className="absolute inset-0" style={neonLit}>
                  <Rows rows={LINE_2} rowClass={LINE_2_ROW_CLASS} />
                </span>
              </p>
            </blockquote>

            <figcaption className="hud mt-10 flex items-center gap-3 text-mute sm:mt-12">
              <span aria-hidden className="h-px w-10 bg-cyan shadow-neon-cyan" />
              {siteConfig.experienceName}
            </figcaption>
          </figure>
        </div>

        {/* medidor de energia no máximo (desktop largo) */}
        <div
          aria-hidden
          className="absolute top-1/2 right-6 z-10 hidden h-[44vh] -translate-y-1/2 flex-col items-center gap-3 lg:flex xl:right-10"
        >
          <span className="hud text-[0.65rem] text-dim [writing-mode:vertical-rl]">Energy</span>
          <div className="relative w-2 flex-1 overflow-hidden rounded-full bg-white/[0.06] [mask-image:repeating-linear-gradient(to_top,#000_0_7px,transparent_7px_10px)]">
            <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-cyan),var(--color-purple)_45%,var(--color-magenta)_75%,var(--color-red))]" />
          </div>
        </div>
      </div>
    </div>
  );
}
