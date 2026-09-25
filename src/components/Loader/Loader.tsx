"use client";

import { useEffect, useRef, useState } from "react";
import { useExperience } from "@/components/Effects/ExperienceContext";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import styles from "./Loader.module.css";

const SESSION_KEY = "bb:intro-seen";
/** Início da saída (ms) — igual ao `animation-delay` de `.screen` no CSS. */
const EXIT_AT = 460;
/** Duração total (entrada + saída) — igual ao CSS (`.loader`). */
const TOTAL = 680;
/**
 * `sizes` IDÊNTICO ao do logo do hero (HeroLogo): o navegador escolhe o mesmo candidato do srcset
 * que o hero já pede com fetchPriority high — o logo da intro não baixa nenhum byte a mais.
 * Se mudar lá, mude aqui.
 */
const LOGO_SIZES = "(max-height: 500px) 78vh, (min-width: 1280px) 760px, (min-width: 1024px) 700px, 92vw";

/**
 * Roda no parse do HTML, antes da primeira pintura: se a intro já foi vista nesta sessão,
 * esconde o overlay (sem "flash" de tela preta). Só insere um <style> no <head> — não altera nós do React.
 * Vai como innerHTML de um contêiner: executa no HTML do servidor e nunca é recriado como <script> no cliente.
 */
const PRE_PAINT = `<script>(function(){try{var s=window.sessionStorage;if(s.getItem("${SESSION_KEY}")){var e=document.createElement("style");e.textContent="[data-bb-loader]{display:none!important}";document.head.appendChild(e)}else{s.setItem("${SESSION_KEY}","1")}}catch(e){}})();</script>`;

/* Waveform "burst" determinística (mesma string no SSR e no cliente). */
const WAVE_W = 600;
const WAVE_H = 120;
function wavePath(freqA: number, freqB: number, phase: number, gain: number) {
  const steps = 160;
  const mid = WAVE_H / 2;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const env = Math.exp(-((t - 0.5) ** 2) / (2 * 0.17 ** 2));
    const carrier = Math.sin(t * Math.PI * 2 * freqA + phase) * 0.72 + Math.sin(t * Math.PI * 2 * freqB + phase * 2) * 0.28;
    const y = mid - carrier * env * (mid - 4) * gain;
    d += `${i === 0 ? "M" : "L"}${(t * WAVE_W).toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}
const WAVE_MAIN = wavePath(9, 23, 0, 1);
const WAVE_ECHO = wavePath(7, 31, 1.1, 0.72);

/**
 * Intro de abertura (§47 + §10): tela preta → ruído → linha de frequência que ganha amplitude →
 * logo BetoBrizz + LOADING EXPERIENCE + medidor → a tela "desliga" como um CRT. ≤ 680 ms, uma vez por sessão.
 *
 * Só no modo completo (desktops capazes). No modo leve, com movimento reduzido ou se a intro já foi
 * vista, o CSS esconde a camada desde a primeira pintura e o componente sai do DOM ao montar.
 * A coreografia é 100% CSS e a saída usa só transform/opacity (compositor): mesmo com a hidratação
 * ocupando a thread principal, a camada nunca cobre a página por mais de ~680 ms. O hero é pintado
 * por baixo desde o primeiro frame (a intro não atrasa o LCP).
 */
export function Loader() {
  const { setIntroDone } = useExperience();
  const ref = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // sessionStorage indisponível (modo privado/bloqueado): segue sem lembrar
    }

    const el = ref.current;
    // O CSS decide se a intro toca (modo completo, sem reduced motion, primeira visita na sessão).
    const playing = el !== null && getComputedStyle(el).display !== "none";

    // Quanto da animação CSS já passou (ela começa na primeira pintura, antes da hidratação).
    let elapsed = TOTAL;
    if (playing && el) {
      const t = el.getAnimations?.()[0]?.currentTime;
      elapsed = typeof t === "number" ? t : performance.now();
    }

    const introTimer = window.setTimeout(() => setIntroDone(true), Math.max(0, EXIT_AT - elapsed));
    const doneTimer = window.setTimeout(() => setDone(true), playing ? Math.max(0, TOTAL - elapsed) + 60 : 0);
    return () => {
      window.clearTimeout(introTimer);
      window.clearTimeout(doneTimer);
    };
  }, [setIntroDone]);

  if (done) return null;

  return (
    <>
      <div ref={ref} data-bb-loader="" aria-hidden className={styles.loader}>
        <div className={styles.screen}>
          <div className={styles.noise} />
          <div className={styles.glow} />

          {/* Moldura de câmera/VJ: cantos em um único elemento (gradientes) + REC */}
          <div className={styles.frame}>
            <span className={cn(styles.rec, "absolute top-3 left-4 flex items-center gap-2 font-vhs text-lg leading-none text-red")}>
              <span className="size-2 rounded-full bg-red shadow-neon-red" />
              REC
            </span>
          </div>

          <div className={styles.stage}>
            {/* Logo oficial (disco de vinil no "O") — mesma imagem/`sizes` do hero, sem download extra */}
            <span className={styles.brand}>
              <Logo eager sizes={LOGO_SIZES} alt="" />
            </span>

            <div className={styles.waveWrap}>
              <svg
                viewBox={`0 0 ${WAVE_W} ${WAVE_H}`}
                preserveAspectRatio="none"
                className={cn(styles.wave, styles.echo)}
                focusable="false"
              >
                <path d={WAVE_ECHO} fill="none" stroke="#8a2be2" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
              </svg>
              <svg
                viewBox={`0 0 ${WAVE_W} ${WAVE_H}`}
                preserveAspectRatio="none"
                className={cn(styles.wave, styles.main)}
                focusable="false"
              >
                <defs>
                  <linearGradient id="bb-loader-grad" gradientUnits="userSpaceOnUse" x1="0" x2={WAVE_W} y1="0" y2="0">
                    <stop offset="0" stopColor="#00e5ff" stopOpacity="0.2" />
                    <stop offset="0.3" stopColor="#00e5ff" />
                    <stop offset="0.55" stopColor="#8a2be2" />
                    <stop offset="0.75" stopColor="#ff1493" />
                    <stop offset="1" stopColor="#ff2414" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                {/* brilho neon sem filter: a mesma linha, larga e translúcida, por baixo */}
                <path
                  d={WAVE_MAIN}
                  fill="none"
                  stroke="url(#bb-loader-grad)"
                  strokeWidth={9}
                  strokeOpacity={0.22}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d={WAVE_MAIN}
                  fill="none"
                  stroke="url(#bb-loader-grad)"
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>

            <div className={styles.status}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-hud text-[0.68rem] font-semibold tracking-[0.34em] text-mute uppercase sm:text-xs">
                  Loading experience<span className={styles.dots} />
                </span>
                <span className={cn(styles.pct, "font-vhs text-lg leading-none text-white")} />
              </div>
              {/* Medidor VU: 16 segmentos desenhados por gradiente, revelados por transform */}
              <div className={styles.meter}>
                <div className={styles.meterFill}>
                  <div className={styles.meterBar} />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* A linha brilhante que sobra quando a tela "desliga" (fora da tela que encolhe) */}
        <div className={styles.line} />
      </div>
      <div hidden dangerouslySetInnerHTML={{ __html: PRE_PAINT }} />
    </>
  );
}
