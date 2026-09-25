"use client";

import * as m from "motion/react-m";
import { cn } from "@/lib/utils";

export type NavEntry = { id: string; label: string; deck: string };

type Props = {
  items: readonly NavEntry[];
  active: string;
};

/**
 * Menu desktop como a faixa de canais de um mixer (§51):
 * LED por canal (aceso na seção ativa), rótulo HUD e um "crossfader"
 * que desliza até o canal ativo. Links comuns — nada atrapalha a usabilidade.
 */
export function MixerNav({ items, active }: Props) {
  return (
    <nav aria-label="Navegação principal" className="hidden lg:block">
      <div className="relative flex items-stretch rounded-lg border border-line bg-white/[0.02] px-1.5">
        {/* parafusos do painel */}
        <span aria-hidden className="absolute top-1/2 left-1 size-[3px] -translate-y-1/2 rounded-full bg-white/20" />
        <span aria-hidden className="absolute top-1/2 right-1 size-[3px] -translate-y-1/2 rounded-full bg-white/20" />
        {/* trilho do crossfader */}
        <span aria-hidden className="absolute inset-x-3 bottom-[5px] h-px bg-line-strong" />

        <ul className="flex items-stretch">
          {items.map((item, i) => {
            const isActive = item.id === active;
            return (
              <li key={item.id} className="relative flex">
                {i > 0 ? <span aria-hidden className="my-2.5 w-px bg-line" /> : null}
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? "location" : undefined}
                  className="group/ch relative flex flex-col items-center gap-1.5 rounded-md px-2.5 pt-2 pb-3.5 xl:px-4"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "size-[5px] rounded-full transition-[background-color,box-shadow] duration-300",
                      isActive
                        ? "bg-cyan shadow-[0_0_6px_1px_rgb(0_229_255/0.9),0_0_14px_2px_rgb(0_229_255/0.45)]"
                        : "bg-white/15 group-hover/ch:bg-magenta group-hover/ch:shadow-[0_0_6px_1px_rgb(255_20_147/0.7)]",
                    )}
                  />
                  <span
                    className={cn(
                      "font-hud text-[0.74rem] leading-none font-bold tracking-[0.16em] uppercase transition-colors duration-300 xl:tracking-[0.2em]",
                      isActive ? "text-white" : "text-mute group-hover/ch:text-white",
                    )}
                  >
                    {item.label}
                  </span>
                  {isActive ? (
                    <m.span
                      layoutId="mixer-fader"
                      aria-hidden
                      className="absolute inset-x-0 bottom-[2px] mx-auto h-[7px] w-5 rounded-[2px] border border-white/70 bg-gradient-to-b from-white to-mute shadow-[0_0_10px_rgb(0_229_255/0.6)]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    >
                      <span className="absolute inset-x-0 top-1/2 mx-auto h-px w-3 -translate-y-1/2 bg-void/70" />
                    </m.span>
                  ) : null}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
