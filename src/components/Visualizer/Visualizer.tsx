"use client";

import { useEffect, useId, useRef } from "react";
import { useExperience } from "@/components/Effects/ExperienceContext";
import { cn } from "@/lib/utils";

type Palette = "neon" | "red" | "cyan";

type Props = {
  /** Número de barras. */
  bars?: number;
  className?: string;
  /** Altura do bloco (CSS). */
  height?: string;
  /** Gradiente das barras (de baixo para cima). */
  palette?: Palette;
  /** Espelha as barras para cima e para baixo a partir do centro. */
  mirror?: boolean;
  /** Rótulo acessível; sem ele o visualizer é decorativo (aria-hidden). */
  label?: string;
  /** Multiplicador de intensidade desta instância (ex.: 1.4 enquanto um set toca). */
  boost?: number;
};

/** Cores (de baixo para cima) como variáveis CSS do tema, com fallback. */
const PALETTES: Record<Palette, Array<[string, string]>> = {
  neon: [
    ["--color-cyan", "#00e5ff"],
    ["--color-purple", "#8a2be2"],
    ["--color-magenta", "#ff1493"],
  ],
  red: [
    ["--color-purple", "#8a2be2"],
    ["--color-magenta", "#ff1493"],
    ["--color-red", "#ff2414"],
  ],
  cyan: [
    ["--color-blue", "#0066ff"],
    ["--color-cyan", "#00e5ff"],
  ],
};

const GAP_RATIO = 0.28; // espaço entre barras, em fração da largura de uma barra
const FRAME_MS = 33; // ~30 fps é suficiente para o efeito e metade do custo

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Altura estática (0..1) da barra i — usada no SSR, no modo leve e com movimento reduzido. */
function restingLevel(i: number) {
  return 0.22 + 0.62 * Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.23 + 0.4));
}

/**
 * Spectrum analyzer simulado — sem áudio.
 * - Modo leve / movimento reduzido / SSR: SVG estático (zero JS por frame, zero camadas de GPU).
 * - Modo completo: um único <canvas> a ~30 fps, reagindo a um "beat" sintético e à velocidade
 *   do scroll; pausa fora da tela e com a aba oculta. Mais intenso no Experience Mode.
 */
export function Visualizer({
  bars = 32,
  className,
  height = "4rem",
  palette = "neon",
  mirror = false,
  label,
  boost = 1,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boostRef = useRef(boost);
  const gradientId = `viz-${useId().replace(/:/g, "")}`;
  const { intensity } = useExperience();
  const animated = intensity > 0;

  useEffect(() => {
    boostRef.current = boost;
  }, [boost]);

  useEffect(() => {
    if (!animated) return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!wrap || !canvas || !ctx) return;

    const css = getComputedStyle(document.documentElement);
    const colors = PALETTES[palette].map(([v, fallback]) => css.getPropertyValue(v).trim() || fallback);
    const seeds = Array.from({ length: bars }, (_, i) => 0.6 + ((i * 7919) % 97) / 97);
    const gain = intensity === 2 ? 1.35 : 1;

    let w = 0;
    let h = 0;
    let fill: CanvasGradient | string = colors[0];
    const resize = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      w = wrap.clientWidth;
      h = wrap.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = mirror ? ctx.createLinearGradient(0, h / 2, 0, 0) : ctx.createLinearGradient(0, h, 0, 0);
      colors.forEach((c, i) => g.addColorStop(colors.length === 1 ? 0 : i / (colors.length - 1), c));
      fill = g;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    let raf = 0;
    let running = false;
    let visible = false;
    let last = 0;
    let lastY = window.scrollY;
    let energy = 0;

    const onScroll = () => {
      const y = window.scrollY;
      energy = Math.min(1, energy + Math.abs(y - lastY) / 400);
      lastY = y;
    };

    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < FRAME_MS) return;
      last = t;
      const time = t / 1000;
      energy *= 0.9;
      const beat = Math.pow(Math.max(0, Math.sin(time * Math.PI * 2 * 2.05)), 8); // ~123 BPM
      const barW = w / (bars + (bars - 1) * GAP_RATIO);
      const step = barW * (1 + GAP_RATIO);
      const g = gain * boostRef.current;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = fill;
      ctx.globalAlpha = 0.9;
      for (let i = 0; i < bars; i++) {
        const x = i / bars;
        const bass = (1 - x) * 0.55 * beat;
        const wave = 0.5 + 0.5 * Math.sin(time * (2.2 + seeds[i] * 2.4) + i * 0.55);
        const v = Math.min(1, (0.14 + wave * 0.42 * seeds[i] + bass + energy * 0.5) * g);
        const bh = Math.max(1, v * h);
        ctx.fillRect(i * step, mirror ? (h - bh) / 2 : h - bh, barW, bh);
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      lastY = window.scrollY;
      window.addEventListener("scroll", onScroll, { passive: true });
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
    const sync = () => (visible && !document.hidden ? start() : stop());

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(wrap);
    document.addEventListener("visibilitychange", sync);

    return () => {
      io.disconnect();
      ro.disconnect();
      stop();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [animated, intensity, bars, palette, mirror]);

  const unit = 1 + GAP_RATIO;
  const viewW = round2(bars * unit - GAP_RATIO);

  return (
    <div
      ref={wrapRef}
      className={cn("relative w-full", className)}
      style={{ height }}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      {animated ? (
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      ) : (
        <svg viewBox={`0 0 ${viewW} 100`} preserveAspectRatio="none" className="absolute inset-0 size-full">
          <defs>
            <linearGradient id={gradientId} x1="0" y1={mirror ? "0.5" : "1"} x2="0" y2="0">
              {PALETTES[palette].map(([v, fallback], i, all) => (
                <stop key={v} offset={all.length === 1 ? 0 : i / (all.length - 1)} stopColor={`var(${v}, ${fallback})`} />
              ))}
            </linearGradient>
          </defs>
          <g fill={`url(#${gradientId})`} opacity={0.9}>
            {Array.from({ length: bars }, (_, i) => {
              // Arredondado: Math.sin difere nas últimas casas entre Node (SSR) e navegador → mismatch.
              const bh = round2(restingLevel(i) * 100);
              return (
                <rect
                  key={i}
                  x={round2(i * unit)}
                  y={round2(mirror ? (100 - bh) / 2 : 100 - bh)}
                  width={1}
                  height={bh}
                />
              );
            })}
          </g>
        </svg>
      )}
    </div>
  );
}
