"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useExperience } from "@/components/Effects/ExperienceContext";
import type { siteConfig } from "@/config/site";

type HeroVideoConfig = NonNullable<typeof siteConfig.heroVideo>;

/**
 * Vídeo de fundo opcional — só no desktop capaz (modo completo, sem movimento reduzido).
 * No SSR, no modo leve ou se o vídeo falhar, mostra a foto (`fallback`).
 * muted/loop/playsInline; pausa fora da tela e com a aba oculta.
 */
export function HeroVideo({ video, fallback }: { video: HeroVideoConfig; fallback: ReactNode }) {
  const { isDesktop, reducedMotion } = useExperience();
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  const enabled = isDesktop && !reducedMotion && !failed;

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    let inView = true;
    const sync = () => {
      if (inView && !document.hidden) el.play().catch(() => undefined);
      else el.pause();
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [enabled]);

  if (!enabled) return <>{fallback}</>;

  return (
    <video
      ref={ref}
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={video.poster}
      aria-hidden
      onError={() => setFailed(true)}
    >
      <source src={video.desktop} onError={() => setFailed(true)} />
    </video>
  );
}
