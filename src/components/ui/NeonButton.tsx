"use client";

import type { ReactNode } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export type NeonVariant = "magenta" | "cyan" | "purple" | "red" | "white";

const variants: Record<NeonVariant, string> = {
  magenta:
    "border-magenta text-white hover:bg-magenta hover:text-void hover:shadow-neon-magenta focus-visible:bg-magenta focus-visible:text-void",
  cyan: "border-cyan text-white hover:bg-cyan hover:text-void hover:shadow-neon-cyan focus-visible:bg-cyan focus-visible:text-void",
  purple:
    "border-purple text-white hover:bg-purple hover:text-white hover:shadow-neon-purple focus-visible:bg-purple",
  red: "border-red text-white hover:bg-red hover:text-white hover:shadow-neon-red focus-visible:bg-red",
  white: "border-white/70 text-white hover:bg-white hover:text-void focus-visible:bg-white focus-visible:text-void",
};

const sizes = {
  sm: "h-10 px-4 text-[0.7rem] gap-2",
  md: "h-12 px-6 text-xs gap-2.5",
  lg: "h-14 px-8 text-sm gap-3",
};

type CommonProps = {
  children: ReactNode;
  variant?: NeonVariant;
  size?: keyof typeof sizes;
  icon?: ReactNode;
  className?: string;
  /** Evento de analytics disparado no clique. */
  event?: AnalyticsEvent;
  eventParams?: Record<string, string | number | boolean>;
  "aria-label"?: string;
};

type LinkProps = CommonProps & { href: string; external?: boolean; onClick?: never; type?: never };
type ButtonProps = CommonProps & {
  href?: undefined;
  external?: never;
  onClick?: () => void;
  type?: "button" | "submit";
  "aria-pressed"?: boolean;
};

/**
 * Botão da identidade: fundo transparente, borda neon 1px, pílula.
 * Hover: glow + fundo neon + texto preto.
 * Com `href` vira <a>; `external` abre em nova aba com rel seguro.
 */
export function NeonButton(props: LinkProps | ButtonProps) {
  const { children, variant = "magenta", size = "md", icon, className, event, eventParams } = props;

  const classes = cn(
    "group/btn relative inline-flex shrink-0 items-center justify-center rounded-full border bg-transparent",
    "font-hud font-bold uppercase tracking-[0.2em] whitespace-nowrap select-none",
    "transition-[background-color,color,box-shadow,transform] duration-300 ease-out active:scale-[0.97]",
    variants[variant],
    sizes[size],
    className,
  );

  const handleClick = () => {
    if (event) track(event, eventParams);
  };

  const content = (
    <>
      {icon ? <span className="grid place-items-center transition-transform duration-300 group-hover/btn:scale-110">{icon}</span> : null}
      <span>{children}</span>
    </>
  );

  if (props.href !== undefined) {
    return (
      <a
        href={props.href}
        className={classes}
        onClick={handleClick}
        aria-label={props["aria-label"]}
        {...(props.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      className={classes}
      aria-label={props["aria-label"]}
      aria-pressed={props["aria-pressed"]}
      onClick={() => {
        handleClick();
        props.onClick?.();
      }}
    >
      {content}
    </button>
  );
}
