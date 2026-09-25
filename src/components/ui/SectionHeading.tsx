"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Accent = "magenta" | "cyan" | "purple" | "red";

const accentText: Record<Accent, string> = {
  magenta: "text-magenta",
  cyan: "text-cyan",
  purple: "text-purple",
  red: "text-red",
};

const accentBar: Record<Accent, string> = {
  magenta: "bg-magenta shadow-neon-magenta",
  cyan: "bg-cyan shadow-neon-cyan",
  purple: "bg-purple shadow-neon-purple",
  red: "bg-red shadow-neon-red",
};

type Props = {
  /** Rótulo HUD acima do título, ex.: "04 // EVENTOS" */
  kicker?: string;
  title: string;
  subtitle?: string;
  accent?: Accent;
  align?: "left" | "center";
  /** Glitch único quando o título entra na tela (momento estratégico). */
  glitch?: boolean;
  className?: string;
  /** id para aria-labelledby da <section> */
  id?: string;
  /** Idioma do título quando difere do pt-BR da página (ex.: "en" em "SEE THE VIBE.") — WCAG 3.1.2. */
  lang?: string;
  /** Idioma do kicker quando difere do pt-BR (ex.: "en" em "Turn up the moment"). */
  kickerLang?: string;
  children?: React.ReactNode;
};

/**
 * Cabeçalho padrão das seções: kicker HUD + título display gigante + subtítulo.
 * Entrada em CSS puro (.reveal, só no modo completo) — o texto nasce visível no HTML.
 */
export function SectionHeading({
  kicker,
  title,
  subtitle,
  accent = "magenta",
  align = "left",
  glitch = true,
  className,
  id,
  lang,
  kickerLang,
  children,
}: Props) {
  const titleRef = useRef<HTMLSpanElement>(null);
  const [glitching, setGlitching] = useState(false);

  // Um único glitch quando o título aparece (IntersectionObserver, sem custo por frame).
  useEffect(() => {
    const el = titleRef.current;
    if (!glitch || !el) return;
    let stop = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setGlitching(true);
        stop = window.setTimeout(() => setGlitching(false), 600);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(stop);
    };
  }, [glitch]);

  return (
    <div className={cn("flex flex-col gap-4", align === "center" && "items-center text-center", className)}>
      {kicker ? (
        <p lang={kickerLang} className={cn("reveal hud flex items-center gap-3", accentText[accent])}>
          <span aria-hidden className={cn("h-px w-8", accentBar[accent])} />
          {kicker}
        </p>
      ) : null}
      <h2
        id={id}
        lang={lang}
        className="reveal font-display text-[clamp(2.1rem,6.5vw,5.25rem)] leading-[1.05] font-black tracking-tight text-balance uppercase"
      >
        <span ref={titleRef} className={cn("glitch", glitching && "is-glitching")} data-text={title}>
          {title}
        </span>
      </h2>
      {subtitle ? (
        <p
          className={cn(
            "reveal reveal-2 font-hud text-lg font-semibold tracking-[0.18em] uppercase sm:text-xl",
            accentText[accent],
          )}
        >
          {subtitle}
        </p>
      ) : null}
      {children}
    </div>
  );
}
