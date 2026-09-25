"use client";

import { useEffect, useRef } from "react";
import { useExperience } from "./ExperienceContext";
import { useHydrated } from "./useHydrated";
import { cn } from "@/lib/utils";

export type ParticlesProps = {
  className?: string;
  /** Multiplicador de densidade (1 = padrão). Reduzido automaticamente no mobile. */
  density?: number;
  /** Cores das partículas (CSS). */
  colors?: string[];
};

const DEFAULT_COLORS = ["#ff1493", "#00e5ff", "#8a2be2", "#ff2414", "#ffffff"];

/** Área (px²) por partícula na densidade 1. */
const AREA_PER_PARTICLE = 11000;
const MAX_PARTICLES = 240;
const SPRITE = 64;

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
 * - DPR-aware, redimensiona com ResizeObserver;
 * - pausa fora da tela (IntersectionObserver) e com a aba oculta;
 * - quantidade = área × densidade (≈40% fora do desktop, ×1,8 no Experience Mode);
 * - não renderiza nada com prefers-reduced-motion.
 */
export function Particles({ className, density = 1, colors = DEFAULT_COLORS }: ParticlesProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { reducedMotion: prefersReduced, isDesktop, experienceMode } = useExperience();
  const reducedMotion = useHydrated() && prefersReduced;
  const colorKey = colors.join("|");

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reducedMotion) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const palette = colorKey.split("|").filter(Boolean);
    const sprites = (palette.length ? palette : DEFAULT_COLORS).map(makeSprite);
    const factor = density * (isDesktop ? 1 : 0.4) * (experienceMode ? 1.8 : 1);
    const speed = experienceMode ? 1.6 : 1;
    const dpr = Math.min(window.devicePixelRatio || 1, isDesktop ? 2 : 1.5);

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
      raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (raf || !inView || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onScroll = () => {
      const y = window.scrollY;
      energy = Math.min(1, energy + Math.abs(y - lastScroll) / 600);
      lastScroll = y;
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
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reducedMotion, isDesktop, experienceMode, density, colorKey]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    />
  );
}
