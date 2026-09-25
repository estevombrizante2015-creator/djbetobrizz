"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useExperience } from "@/components/Effects/ExperienceContext";
import { cn } from "@/lib/utils";
import styles from "./Loader.module.css";

const SESSION_KEY = "bb:intro-seen";
/** Início da saída (ms) — igual ao `animation-delay` de `.loader` no CSS. */
const EXIT_AT = 640;
/** Duração total (entrada + saída) — igual ao CSS. */
const TOTAL = 900;
const SEGMENTS = 16;

/**
 * Roda antes da primeira pintura: se a intro já foi vista nesta sessão, esconde o overlay
 * (sem "flash" de tela preta). Só insere um <style> no <head> — não altera nós do React.
 */
const PRE_PAINT = `(function(){try{var s=window.sessionStorage;if(s.getItem("${SESSION_KEY}")){var e=document.createElement("style");e.textContent="[data-bb-loader]{display:none!important}";document.head.appendChild(e)}else{s.setItem("${SESSION_KEY}","1")}}catch(e){}})();`;

/* Waveform "burst" determinística (mesma string no SSR e no cliente). */
const WAVE_W = 600;
const WAVE_H = 120;
function wavePath(freqA: number, freqB: number, phase: number, gain: number) {
  const steps = 240;
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

/** Cor de cada segmento do medidor (VU): ciano → roxo → magenta → vermelho do logo. */
function segmentColor(i: number) {
  if (i < 7) return "var(--color-cyan, #00e5ff)";
  if (i < 11) return "var(--color-purple, #8a2be2)";
  if (i < 14) return "var(--color-magenta, #ff1493)";
  return "var(--color-red, #ff2414)";
}

/**
 * Intro de abertura (§47 + §10, passos 1–4): tela preta → ruído → linha de frequência que ganha
 * amplitude → BETOBRIZZ + LOADING EXPERIENCE... + medidor. ≤ 900 ms, uma vez por sessão.
 * A coreografia é 100% CSS (funciona antes da hidratação e nunca trava a página);
 * o JS só avisa o hero (`setIntroDone`) quando a saída começa e remove o overlay no fim.
 */
export function Loader() {
  const { reducedMotion, setIntroDone } = useExperience();
  const ref = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // sessionStorage indisponível (modo privado/bloqueado): segue sem lembrar
    }

    const el = ref.current;
    const playing = Boolean(el) && !reducedMotion && getComputedStyle(el as HTMLDivElement).display !== "none";

    // Quanto da animação CSS já passou (ela começa na primeira pintura, antes da hidratação).
    let elapsed = TOTAL;
    if (playing && el) {
      const t = el.getAnimations?.()[0]?.currentTime;
      elapsed = typeof t === "number" ? t : performance.now();
    }

    const introTimer = window.setTimeout(() => setIntroDone(true), Math.max(0, EXIT_AT - elapsed));
    const doneTimer = window.setTimeout(() => setDone(true), Math.max(0, TOTAL - elapsed) + 80);
    return () => {
      window.clearTimeout(introTimer);
      window.clearTimeout(doneTimer);
    };
  }, [reducedMotion, setIntroDone]);

  if (done) return null;

  return (
    <>
      <div ref={ref} data-bb-loader="" aria-hidden className={styles.loader}>
        <div className={styles.noise} />

        {/* Moldura de câmera/VJ */}
        <div className={styles.frame}>
          <span className="absolute top-0 left-0 size-5 border-t border-l border-white/25" />
          <span className="absolute top-0 right-0 size-5 border-t border-r border-white/25" />
          <span className="absolute bottom-0 left-0 size-5 border-b border-l border-white/25" />
          <span className="absolute right-0 bottom-0 size-5 border-r border-b border-white/25" />
          <span className={cn(styles.rec, "absolute top-3 left-4 flex items-center gap-2 font-vhs text-lg leading-none text-red")}>
            <span className="size-2 rounded-full bg-red shadow-neon-red" />
            REC
          </span>
        </div>

        <div className={styles.stage}>
          <p className={cn(styles.brand, "font-display font-black tracking-[0.1em] uppercase")}>
            <span className="text-white">BETO</span>
            <span className="text-outline">BRIZZ</span>
            <span className={styles.dj}>DJ</span>
          </p>

          <div className={styles.waveWrap}>
            <svg
              viewBox={`0 0 ${WAVE_W} ${WAVE_H}`}
              preserveAspectRatio="none"
              className={styles.wave}
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
              <path
                d={WAVE_ECHO}
                className={styles.echo}
                fill="none"
                stroke="#8a2be2"
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={WAVE_MAIN}
                className={styles.main}
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
              <span className="hud text-[0.66rem] tracking-[0.34em] text-mute sm:text-xs">
                Loading experience<span className={styles.dots} />
              </span>
              <span className={cn(styles.pct, "font-vhs text-lg leading-none text-white")} />
            </div>
            <div className={styles.meter}>
              {Array.from({ length: SEGMENTS }, (_, i) => (
                <span key={i} className={styles.seg} style={{ "--i": i, "--c": segmentColor(i) } as CSSProperties} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: PRE_PAINT }} />
    </>
  );
}
