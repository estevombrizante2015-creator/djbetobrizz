"use client";

import { useEffect, useRef } from "react";
import { useExperience } from "./ExperienceContext";
import { cn } from "@/lib/utils";

export type ParticlesProps = {
  className?: string;
  /** Multiplicador de densidade (1 = padrão). */
  density?: number;
  /** Cores das partículas (CSS). */
  colors?: string[];
};

const DEFAULT_COLORS = ["#ff1493", "#00e5ff", "#8a2be2", "#ff2414", "#ffffff"];

/** Área (px²) por partícula na densidade 1 (~65 partículas num notebook 1366×768). */
const AREA_PER_PARTICLE = 16000;
const MAX_PARTICLES = 120;
const SPRITE = 64;
/** Teto de resolução do canvas (monitores retina/4K não precisam de 2×+ para poeira desfocada). */
const MAX_DPR = 1.5;
/** Intervalo mínimo entre quadros: ~60 fps mesmo em monitores de 120/144 Hz. */
const MIN_FRAME_MS = 15;

type Particle = {
  x: number;
  y: number;
  /** Diâmetro desenhado (px CSS). */
  size: number;
  /** Velocidade de subida (px/s). */
  vy: number;
  /** Amplitude e fase do balanço lateral. */
  sway: number;
  phase: number;
  /** Brilho base e velocidade do "twinkle". */
  alpha: number;
  twinkle: number;
  color: number;
};

/** Sprite de glow (núcleo claro → cor → transparente) pré-renderizado por cor. */
function makeSprite(color: string) {
  const c = document.createElement("canvas");
  c.width = c.height = SPRITE;
  const g = c.getContext("2d");
  if (!g) return c;
  const r = SPRITE / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, "rgba(255,255,255,0.95)");
  grad.addColorStop(0.18, color);
  grad.addColorStop(0.45, color);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.globalAlpha = 1;
  g.fillStyle = grad;
  g.beginPath();
  g.arc(r, r, r, 0, Math.PI * 2);
  g.fill();
  // suaviza a borda da cor (bokeh)
  g.globalCompositeOperation = "destination-in";
  const fade = g.createRadialGradient(r, r, r * 0.2, r, r, r);
  fade.addColorStop(0, "rgba(0,0,0,1)");
  fade.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = fade;
  g.fillRect(0, 0, SPRITE, SPRITE);
  return c;
}

/** Nova partícula: espalhada pela área (início) ou nascendo abaixo da borda inferior. */
function spawn(w: number, h: number, colors: number, anywhere: boolean): Particle {
  const bokeh = Math.random() < 0.12;
  const size = bokeh ? 10 + Math.random() * 16 : 2 + Math.random() * 5;
  return {
    x: Math.random() * w,
    y: anywhere ? Math.random() * h : h + size,
    size,
    vy: (bokeh ? 6 : 12) + Math.random() * (bokeh ? 10 : 34),
    sway: 4 + Math.random() * 18,
    phase: Math.random() * Math.PI * 2,
    alpha: bokeh ? 0.12 + Math.random() * 0.14 : 0.35 + Math.random() * 0.5,
    twinkle: 0.6 + Math.random() * 2.4,
    color: Math.floor(Math.random() * colors),
  };
}

/**
 * Poeira neon / bokeh subindo lentamente em <canvas>.
 * - Só no desktop capaz (modo completo): no modo leve, no SSR e com movimento reduzido não renderiza nada;
 * - DPR ≤ 1,5, ~60 fps no máximo, redimensiona com ResizeObserver;
 * - pausa fora da tela (IntersectionObserver) e com a aba oculta (e só escuta o scroll enquanto roda);
 * - quantidade = área × densidade (×1,5 no Experience Mode).
 */
export function Particles({ className, density = 1, colors = DEFAULT_COLORS }: ParticlesProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { reducedMotion, isDesktop, experienceMode } = useExperience();
  const enabled = isDesktop && !reducedMotion;
  const colorKey = colors.join("|");

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !enabled) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const palette = colorKey.split("|").filter(Boolean);
    const sprites = (palette.length ? palette : DEFAULT_COLORS).map(makeSprite);
    const factor = density * (experienceMode ? 1.5 : 1);
    const speed = experienceMode ? 1.6 : 1;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    let raf = 0;
    let last = 0;
    let inView = false;
    let energy = 0;
    let lastScroll = window.scrollY;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.min(MAX_PARTICLES, Math.max(6, Math.round(((w * h) / AREA_PER_PARTICLE) * factor)));
      if (particles.length > target) particles = particles.slice(0, target);
      while (particles.length < target) particles.push(spawn(w, h, sprites.length, true));
      particles.forEach((p) => {
        if (p.x > w) p.x = Math.random() * w;
      });
    };

    const draw = (time: number) => {
      raf = requestAnimationFrame(draw);
      if (last && time - last < MIN_FRAME_MS) return;
      const dt = Math.min(0.05, last ? (time - last) / 1000 : 0.016);
      last = time;
      energy *= 0.93;
      const t = time / 1000;
      const boost = speed * (1 + energy * 3);

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.vy * boost * dt;
        if (p.y < -p.size) particles[i] = spawn(w, h, sprites.length, false);
        const x = p.x + Math.sin(t * 0.6 + p.phase) * p.sway;
        const a = p.alpha * (0.55 + 0.45 * Math.sin(t * p.twinkle + p.phase));
        // some quando chega perto do topo
        const fade = Math.min(1, p.y / (h * 0.25));
        ctx.globalAlpha = Math.max(0, a * fade);
        ctx.drawImage(sprites[p.color], x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      ctx.globalAlpha = 1;
    };

    const onScroll = () => {
      const y = window.scrollY;
      energy = Math.min(1, energy + Math.abs(y - lastScroll) / 600);
      lastScroll = y;
    };

    const start = () => {
      if (raf || !inView || document.hidden) return;
      last = 0;
      lastScroll = window.scrollY;
      window.addEventListener("scroll", onScroll, { passive: true });
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener("scroll", onScroll);
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) start();
      else stop();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, experienceMode, density, colorKey]);

  if (!enabled) return null;

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    />
  );
}
