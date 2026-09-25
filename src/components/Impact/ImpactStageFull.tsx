"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { m, useMotionValueEvent, useScroll, useTransform, type Variants } from "motion/react";
import { Lasers } from "@/components/Effects/Lasers";
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

const Particles = dynamic(() => import("@/components/Effects/Particles").then((mod) => mod.Particles), { ssr: false });

/** Progresso do scroll em que o neon "acende" (e, com histerese, "apaga" ao voltar). */
const LIGHT_ON = 0.46;
const LIGHT_OFF = 0.3;

/** Liga uma vez com flicker (lâmpada de neon), desliga suave. */
const neonSwitch: Variants = {
  off: { opacity: 0, transition: { duration: 0.35 } },
  on: {
    opacity: [0, 1, 0.12, 0.9, 0.3, 1],
    transition: { duration: 0.95, times: [0, 0.08, 0.2, 0.32, 0.44, 1], ease: "linear" },
  },
};

/**
 * Palco da frase de impacto — SÓ no modo completo (desktop capaz, sem movimento reduzido).
 * Trilho alto com um quadro sticky em tela cheia. Ao rolar, "A música passa." entra e depois se
 * esvazia (fica só o contorno); "A experiência fica." acende como neon (flicker único + glitch breve).
 * setState apenas nas mudanças discretas (acendeu/apagou); o resto são MotionValues (sem render por frame).
 */
export function ImpactStageFull({ backdrop }: { backdrop: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
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

  return (
    <div ref={trackRef} className="relative h-[240vh]">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden pt-20">
        {/* fundo com parallax de escala (transform no compositor) */}
        <m.div className="absolute inset-0 will-change-transform" style={{ scale: bgScale }}>
          {backdrop}
        </m.div>

        <Lasers count={5} className="opacity-45" />
        <Particles density={0.9} colors={["#ff1493", "#8a2be2", "#ffffff", "#00e5ff"]} />
        <EdgeFades />

        {/* bloom do neon atrás da linha 2 */}
        <m.div
          aria-hidden
          className={BLOOM_CLASS}
          initial={false}
          animate={{ opacity: lit ? 1 : 0 }}
          transition={{ duration: 1.2, delay: 0.35 }}
        />

        <div className="container-bb relative z-10">
          <figure className="relative">
            <p className="hud mb-10 flex items-center gap-3 text-mute">
              <span aria-hidden className="h-px w-10 bg-magenta shadow-neon-magenta" />
              Sound • Visual • Energy
            </p>

            <blockquote className="relative font-display font-black tracking-[-0.02em] uppercase">
              <QuoteMark />

              {/* Linha 1 — "A música passa." */}
              <m.p className={LINE_1_CLASS} style={{ opacity: line1Opacity, y: line1Y }}>
                <span className="text-outline block opacity-60">
                  <Rows rows={LINE_1} />
                </span>
                <m.span
                  aria-hidden
                  className="text-glow-cyan absolute inset-0 text-white"
                  style={{ opacity: line1Fill }}
                >
                  <Rows rows={LINE_1} />
                </m.span>
              </m.p>

              {/* Linha 2 — "A experiência fica." acende como neon */}
              <m.p className={LINE_2_CLASS} style={{ opacity: line2Opacity, y: line2Y }}>
                <span className={LINE_2_STROKE}>
                  <Rows rows={LINE_2} rowClass={LINE_2_ROW_CLASS} />
                </span>
                <m.span
                  aria-hidden
                  className="absolute inset-0"
                  style={neonLit}
                  variants={neonSwitch}
                  initial="off"
                  animate={lit ? "on" : "off"}
                >
                  <Rows rows={LINE_2} rowClass={LINE_2_ROW_CLASS} glitch={glitching} />
                </m.span>
              </m.p>
            </blockquote>

            <m.figcaption className="hud mt-10 flex items-center gap-3 text-mute sm:mt-12" style={{ opacity: captionOpacity }}>
              <span aria-hidden className="h-px w-10 bg-cyan shadow-neon-cyan" />
              {siteConfig.experienceName}
            </m.figcaption>
          </figure>
        </div>

        {/* medidor de energia (VU) que sobe com o scroll */}
        <div
          aria-hidden
          className="absolute top-1/2 right-6 z-10 hidden h-[44vh] -translate-y-1/2 flex-col items-center gap-3 lg:flex xl:right-10"
        >
          <span className="hud text-[0.65rem] text-dim [writing-mode:vertical-rl]">Energy</span>
          <div className="relative w-2 flex-1 overflow-hidden rounded-full bg-white/[0.06] [mask-image:repeating-linear-gradient(to_top,#000_0_7px,transparent_7px_10px)]">
            <m.div
              className="absolute inset-0 origin-bottom bg-[linear-gradient(to_top,var(--color-cyan),var(--color-purple)_45%,var(--color-magenta)_75%,var(--color-red))]"
              style={{ scaleY: scrollYProgress }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
