"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { motion, useMotionValueEvent, useScroll, useTransform, type Variants } from "motion/react";
import { useExperience } from "@/components/Effects/ExperienceContext";
import { Lasers } from "@/components/Effects/Lasers";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const Particles = dynamic(() => import("@/components/Effects/Particles").then((m) => m.Particles), { ssr: false });

/** Progresso do scroll em que o neon "acende" (e, com histerese, "apaga" ao voltar). */
const LIGHT_ON = 0.46;
const LIGHT_OFF = 0.3;

const LINE_1 = ["A música", "passa."] as const;
const LINE_2 = ["A experiência", "fica."] as const;

/** Tubo de neon aceso: núcleo quase branco + halo magenta/roxo. */
const neonLit: CSSProperties = {
  color: "#fff0f8",
  textShadow:
    "0 0 4px rgb(255 255 255 / 0.85), 0 0 14px rgb(255 20 147 / 0.95), 0 0 38px rgb(255 20 147 / 0.65), 0 0 90px rgb(138 43 226 / 0.6)",
};

/** Liga uma vez com flicker (lâmpada de neon), desliga suave. */
const neonSwitch: Variants = {
  off: { opacity: 0, transition: { duration: 0.35 } },
  on: {
    opacity: [0, 1, 0.12, 0.9, 0.3, 1],
    transition: { duration: 0.95, times: [0, 0.08, 0.2, 0.32, 0.44, 1], ease: "linear" },
  },
};

/** Linhas da frase — mesmo markup nas camadas sobrepostas para alinhar pixel a pixel. */
function Rows({ rows, glitch = false }: { rows: readonly string[]; glitch?: boolean }) {
  return rows.map((row, i) => (
    <span key={row} className="block">
      <span className={cn("inline-block", glitch && "glitch is-glitching")} data-text={glitch ? row : undefined}>
        {row}
      </span>
      {i < rows.length - 1 ? " " : null}
    </span>
  ));
}

type Props = {
  /** Camadas de fundo renderizadas no servidor (imagem + gradientes). */
  backdrop: ReactNode;
};

/**
 * Palco da frase de impacto: trilho alto com um quadro sticky em tela cheia.
 * Ao rolar, "A música passa." entra e depois se esvazia (fica só o contorno);
 * "A experiência fica." acende como neon (flicker único + glitch breve).
 * Com prefers-reduced-motion: seção estática de uma tela, frase já acesa.
 */
export function ImpactStage({ backdrop }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { reducedMotion, isDesktop } = useExperience();
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start 0.5", "end end"] });

  const [lit, setLit] = useState(false);
  const [glitching, setGlitching] = useState(false);
  const litRef = useRef(false);
  const glitchTimer = useRef(0);

  const onProgress = useCallback((v: number) => {
    if (!litRef.current && v >= LIGHT_ON) {
      litRef.current = true;
      setLit(true);
      setGlitching(true);
      window.clearTimeout(glitchTimer.current);
      glitchTimer.current = window.setTimeout(() => setGlitching(false), 650);
    } else if (litRef.current && v < LIGHT_OFF) {
      litRef.current = false;
      setLit(false);
    }
  }, []);
  useMotionValueEvent(scrollYProgress, "change", onProgress);
  useEffect(() => () => window.clearTimeout(glitchTimer.current), []);

  // Linha 1: entra, segura e "passa" (o preenchimento some, fica o contorno).
  const line1Opacity = useTransform(scrollYProgress, [0.06, 0.28], [0, 1]);
  const line1Y = useTransform(scrollYProgress, [0.06, 0.28, 0.5, 0.78], [56, 0, 0, -28]);
  const line1Fill = useTransform(scrollYProgress, [0.5, 0.74], [1, 0]);
  // Linha 2: o tubo apagado aparece, depois acende no limiar LIGHT_ON.
  const line2Opacity = useTransform(scrollYProgress, [0.26, 0.4], [0, 1]);
  const line2Y = useTransform(scrollYProgress, [0.26, 0.44], [40, 0]);
  const captionOpacity = useTransform(scrollYProgress, [0.6, 0.76], [0, 1]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.16, 1]);

  const still = reducedMotion;
  const isLit = still || lit;

  return (
    <div ref={trackRef} className="relative h-[210vh] md:h-[240vh] motion-reduce:h-auto">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden motion-reduce:relative motion-reduce:h-auto motion-reduce:min-h-svh motion-reduce:py-28">
        {/* fundo (parallax de escala só no desktop) */}
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={isDesktop && !still ? { scale: bgScale } : undefined}
        >
          {backdrop}
        </motion.div>

        {/* efeitos: somem sozinhos com reduced motion; mobile recebe versões leves */}
        <Lasers count={5} className="opacity-45" />
        <Particles density={isDesktop ? 0.9 : 0.6} colors={["#ff1493", "#8a2be2", "#ffffff", "#00e5ff"]} />

        {/* bloom do neon atrás da linha 2 */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute top-[58%] left-1/2 h-[70vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_20_147/0.34),rgb(138_43_226/0.18)_55%,transparent)]"
          initial={false}
          animate={{ opacity: isLit ? 1 : 0 }}
          transition={{ duration: still ? 0 : 1.2, delay: still ? 0 : 0.35 }}
        />

        <div className="container-bb relative z-10">
          <figure className="relative">
            <p className="hud mb-8 flex items-center gap-3 text-mute sm:mb-10">
              <span aria-hidden className="h-px w-10 bg-magenta shadow-neon-magenta" />
              Sound • Visual • Energy
            </p>

            <blockquote className="relative font-display font-black tracking-[-0.02em] uppercase">
              <span
                aria-hidden
                className="text-glow-magenta pointer-events-none absolute -top-[0.28em] -left-[0.08em] font-display text-[clamp(4rem,14vw,11rem)] leading-none text-magenta/80 select-none max-sm:hidden"
                style={{ transform: "translateX(-100%)" }}
              >
                “
              </span>

              {/* Linha 1 — "A música passa." */}
              <motion.p
                className="relative text-[clamp(1.9rem,7.4vw,6rem)] leading-[0.95]"
                style={still ? undefined : { opacity: line1Opacity, y: line1Y }}
              >
                <span className="text-outline block opacity-60">
                  <Rows rows={LINE_1} />
                </span>
                <motion.span
                  aria-hidden
                  className="text-glow-cyan absolute inset-0 text-white"
                  style={still ? { opacity: 0.92 } : { opacity: line1Fill }}
                >
                  <Rows rows={LINE_1} />
                </motion.span>
              </motion.p>

              {/* Linha 2 — "A experiência fica." acende como neon */}
              <motion.p
                className="relative mt-[0.18em] text-[clamp(2rem,10.4vw,8.5rem)] leading-[0.92]"
                style={still ? undefined : { opacity: line2Opacity, y: line2Y }}
              >
                <span className="block text-transparent [-webkit-text-stroke:1.5px_rgb(255_20_147/0.45)]">
                  <Rows rows={LINE_2} />
                </span>
                <motion.span
                  aria-hidden
                  className="absolute inset-0"
                  style={neonLit}
                  variants={neonSwitch}
                  initial={still ? "on" : "off"}
                  animate={isLit ? "on" : "off"}
                >
                  <Rows rows={LINE_2} glitch={glitching && !still} />
                </motion.span>
              </motion.p>
            </blockquote>

            <motion.figcaption
              className="hud mt-10 flex items-center gap-3 text-mute sm:mt-12"
              style={still ? undefined : { opacity: captionOpacity }}
            >
              <span aria-hidden className="h-px w-10 bg-cyan shadow-neon-cyan" />
              {siteConfig.experienceName}
            </motion.figcaption>
          </figure>
        </div>

        {/* medidor de energia (VU) que sobe com o scroll — desktop */}
        <div
          aria-hidden
          className="absolute top-1/2 right-6 z-10 hidden h-[44vh] -translate-y-1/2 flex-col items-center gap-3 lg:flex xl:right-10"
        >
          <span className="hud text-[0.65rem] text-dim [writing-mode:vertical-rl]">Energy</span>
          <div className="relative w-2 flex-1 overflow-hidden rounded-full bg-white/[0.06] [mask-image:repeating-linear-gradient(to_top,#000_0_7px,transparent_7px_10px)]">
            <motion.div
              className="absolute inset-0 origin-bottom bg-[linear-gradient(to_top,var(--color-cyan),var(--color-purple)_45%,var(--color-magenta)_75%,var(--color-red))]"
              style={{ scaleY: still ? 1 : scrollYProgress }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
