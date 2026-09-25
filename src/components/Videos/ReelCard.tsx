"use client";

import Image from "next/image";
import { siteConfig } from "@/config/site";
import { VhsOverlay } from "@/components/Effects/VhsOverlay";
import { InstagramIcon, PlayIcon } from "@/components/ui/Icons";
import { track } from "@/lib/analytics";
import { cn, imageProps } from "@/lib/utils";

/** Capa padrão: arte vertical oficial (9:16). */
const DEFAULT_POSTER = {
  src: "/images/art/betobrizz-poster-vertical.webp",
  alt: "Arte promocional DJ BetoBrizz — Music Video Entertainment",
};

type Props = {
  /** Troca a capa (ex.: foto da pista quando o telão ao lado já mostra a arte do logo). */
  poster?: { src: string; alt: string };
  className?: string;
};

/**
 * "Reel" em moldura de celular (9:16) — leva para o Instagram oficial.
 * Não finge ser um vídeo específico: é a porta de entrada para os vídeos no perfil.
 */
export function ReelCard({ poster = DEFAULT_POSTER, className }: Props) {
  return (
    <div className={cn("relative", className)}>
      <a
        href={siteConfig.instagram}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("instagram_click", { source: "videos" })}
        aria-label={`Assistir aos vídeos do ${siteConfig.name} no Instagram (abre em nova aba)`}
        className="group relative block rotate-[3deg] rounded-[2.4rem] outline-offset-4 lg:rotate-[2deg]"
      >
        {/* Halo neon atrás do aparelho — só gradientes (sem blur: o closest-side já esfuma a borda) */}
        <span
          aria-hidden
          className="absolute -inset-10 -z-10 rounded-[3rem] opacity-70 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(closest-side at 40% 35%, rgb(255 20 147 / 0.45), transparent), radial-gradient(closest-side at 65% 75%, rgb(0 102 255 / 0.35), transparent)",
          }}
        />

        {/* Aparelho */}
        <div
          className="relative rounded-[2.4rem] border border-line-strong p-2 transition-[border-color,transform] duration-500 ease-out group-hover:-translate-y-1 group-hover:border-magenta/70 sm:p-2.5"
          style={{
            background: "linear-gradient(160deg, #26222f 0%, #0c0b11 40%, #16131e 100%)",
            boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.1), 0 40px 90px -30px rgb(0 0 0 / 0.9)",
          }}
        >
          <div className="relative aspect-[9/16] overflow-hidden rounded-[1.9rem] bg-black">
            <Image
              {...imageProps(poster.src)}
              alt={poster.alt}
              sizes="(min-width: 1280px) 380px, (min-width: 1024px) 30vw, (min-width: 640px) 300px, 270px"
              quality={75}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
            <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-void/55 via-transparent to-void/80" />
            <span
              aria-hidden
              className="absolute inset-0 opacity-60"
              style={{ background: "repeating-linear-gradient(to bottom, rgb(0 0 0 / 0.25) 0 1px, transparent 1px 3px)" }}
            />

            {/* Notch */}
            <span aria-hidden className="absolute top-2.5 left-1/2 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-black sm:w-24" />

            <VhsOverlay mode="PLAY" track="REELS" start={214} className="pt-9 text-sm sm:pt-10 sm:text-lg" />

            {/* Play */}
            <span aria-hidden className="absolute inset-x-0 top-[74%] z-20 flex -translate-y-1/2 flex-col items-center gap-3">
              <span className="relative grid size-16 place-items-center rounded-full border-2 border-white/90 bg-void/65 text-white transition-[background-color,border-color,box-shadow,transform] [html[data-perf=full]_&]:bg-void/45 [html[data-perf=full]_&]:backdrop-blur-sm duration-300 ease-out group-hover:scale-110 group-hover:border-magenta group-hover:bg-magenta group-hover:text-void group-hover:shadow-neon-magenta group-focus-visible:border-magenta group-focus-visible:bg-magenta group-focus-visible:text-void sm:size-[4.5rem]">
                <span className="absolute -inset-2 animate-pulse-glow rounded-full border border-magenta/60" />
                <PlayIcon size={28} className="translate-x-[2px]" />
              </span>
            </span>
          </div>
        </div>
      </a>

      <p className="mt-5 flex items-center justify-center gap-2 font-hud text-sm font-semibold tracking-[0.2em] text-mute uppercase lg:justify-start">
        <InstagramIcon size={16} className="text-magenta" />
        Reels <span aria-hidden className="text-dim">·</span>
        <span className="normal-case tracking-[0.08em] text-white">{siteConfig.instagramHandle}</span>
      </p>
    </div>
  );
}
