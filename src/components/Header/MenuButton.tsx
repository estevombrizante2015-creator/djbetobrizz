"use client";

import type { Ref } from "react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onToggle: () => void;
  controls: string;
  ref?: Ref<HTMLButtonElement>;
  className?: string;
};

const lines = [
  { pos: "top-0", open: "translate-y-[6.25px] rotate-45", cap: "left-[22%] bg-cyan" },
  { pos: "top-1/2 -translate-y-1/2", open: "scale-x-0 opacity-0", cap: "left-[62%] bg-magenta" },
  { pos: "bottom-0", open: "-translate-y-[6.25px] -rotate-45", cap: "left-[40%] bg-red" },
];

/**
 * Hamburger como três faders de canal (com "caps" coloridos) que viram um X.
 */
export function MenuButton({ open, onToggle, controls, ref, className }: Props) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={open ? "Fechar menu" : "Abrir menu"}
      aria-expanded={open}
      aria-controls={controls}
      onClick={onToggle}
      className={cn(
        "relative grid size-11 shrink-0 place-items-center rounded-full border bg-void/40 transition-[border-color,box-shadow] duration-300",
        open ? "border-magenta/70 shadow-neon-magenta" : "border-line-strong hover:border-cyan/70",
        className,
      )}
    >
      <span aria-hidden className="relative block h-3.5 w-5">
        {lines.map((l, i) => (
          <span
            key={i}
            className={cn(
              "absolute inset-x-0 h-[1.5px] rounded-full bg-white transition-[translate,rotate,scale,opacity] duration-300 ease-out",
              l.pos,
              open && l.open,
            )}
          >
            <span
              className={cn(
                "absolute top-1/2 size-[5px] -translate-y-1/2 rounded-[1px] transition-opacity duration-200",
                l.cap,
                open ? "opacity-0" : "opacity-100",
              )}
            />
          </span>
        ))}
      </span>
    </button>
  );
}
