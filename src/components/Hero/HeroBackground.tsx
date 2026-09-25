"use client";

import { useEffect, useRef, useState } from "react";
import { getImageProps } from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { siteConfig } from "@/config/site";
import { useExperience } from "@/components/Effects/ExperienceContext";
import { cn, getImageMeta } from "@/lib/utils";
import { useHeroIntro } from "./HeroIntro";
import styles from "./Hero.module.css";

/** Paisagem (desktop, tablet deitado, celular deitado) usa a foto horizontal; retrato usa a vertical. */
const LANDSCAPE = "(orientation: landscape)";

/**
 * Art direction sem download duplo: <picture> com <source media> (docs do next/image).
 * A imagem visível é o LCP → eager + fetchPriority high.
 */
function HeroPicture() {
  const { desktop, mobile, alt } = siteConfig.heroImage;
  const common = { alt, fill: true, sizes: "100vw" } as const;
  const {
    props: { srcSet: landscapeSrcSet },
  } = getImageProps({ ...common, src: desktop, quality: 75 });
  const {
    props: { srcSet: portraitSrcSet, ...rest },
  } = getImageProps({ ...common, src: mobile, quality: 60, loading: "eager", fetchPriority: "high" });

  const blurLandscape = getImageMeta(desktop).blurDataURL;
  const blurPortrait = getImageMeta(mobile).blurDataURL;

  return (
    <>
      {/* placeholders borrados (data URI, sem rede) enquanto a foto carrega */}
      {blurPortrait ? (
        <div
          aria-hidden
          className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl landscape:hidden"
          style={{ backgroundImage: `url("${blurPortrait}")` }}
        />
      ) : null}
      {blurLandscape ? (
        <div
          aria-hidden
          className="absolute inset-0 hidden scale-110 bg-cover bg-center blur-2xl landscape:block"
          style={{ backgroundImage: `url("${blurLandscape}")` }}
        />
      ) : null}
      <picture>
        <source media={LANDSCAPE} srcSet={landscapeSrcSet} sizes="100vw" />
        <img {...rest} srcSet={portraitSrcSet} alt={alt} className="object-cover object-[50%_30%] landscape:object-[50%_28%]" />
      </picture>
    </>
  );
}

type HeroVideoConfig = NonNullable<typeof siteConfig.heroVideo>;

/** Vídeo de fundo opcional: muted/loop/playsInline, pausa fora da tela e com a aba oculta. */
function HeroVideo({ video, onFail }: { video: HeroVideoConfig; onFail: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
  }, []);

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
      onError={onFail}
    >
      {video.mobile ? <source src={video.mobile} media="(max-width: 767px)" /> : null}
      <source src={video.desktop} onError={onFail} />
    </video>
  );
}

/**
 * Fundo do hero: vídeo (se configurado) ou foto com art direction,
 * Ken Burns lento após a intro e parallax no scroll (apenas desktop, sem reduced-motion).
 */
export function HeroBackground() {
  const { started, reduced } = useHeroIntro();
  const { isDesktop } = useExperience();
  const [videoFailed, setVideoFailed] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 260]);

  const moving = started && !reduced;
  const parallax = isDesktop && !reduced;
  const video = siteConfig.heroVideo;
  const showVideo = Boolean(video) && !videoFailed && !reduced;

  return (
    <div className="absolute inset-0 overflow-hidden bg-void">
      <motion.div className="absolute inset-0" style={parallax ? { y } : undefined}>
        <div className={cn("absolute inset-0", styles.kenburns, moving && styles.kenburnsOn)}>
          {showVideo && video ? (
            <HeroVideo video={video} onFail={() => setVideoFailed(true)} />
          ) : (
            <HeroPicture />
          )}
        </div>
      </motion.div>
      {/* "luzes acendendo": o fundo clareia quando o show começa */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-void transition-opacity duration-[1600ms] ease-out",
          started ? "opacity-0" : "opacity-70",
        )}
      />
    </div>
  );
}
