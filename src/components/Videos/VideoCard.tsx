"use client";

import { useState } from "react";
import type { VideoItem } from "@/data/types";
import { VhsOverlay } from "@/components/Effects/VhsOverlay";
import { InstagramIcon, PlayIcon } from "@/components/ui/Icons";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { PosterImage } from "./PosterImage";
import { VideoEmbed } from "./VideoEmbed";
import { platformLabel, resolveVideoPoster, type VideoSource } from "./video-source";

type Props = {
  item: VideoItem;
  source: VideoSource;
  index: number;
  featured?: boolean;
};

/**
 * Card de vídeo com "facade": só a capa + botão ▶ neon são carregados.
 * O player (YouTube/Vimeo/arquivo) entra apenas depois do clique; Instagram abre o post em nova aba.
 */
export function VideoCard({ item, source, index, featured = false }: Props) {
  const [playing, setPlaying] = useState(false);
  const poster = resolveVideoPoster(item);
  const trackNo = `TRACK ${String(index + 1).padStart(2, "0")}`;
  const sizes = featured ? "(min-width: 1024px) 66vw, (min-width: 640px) 100vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

  const onPlay = () => {
    track("video_play", { platform: item.platform, title: item.title });
    if (source.kind !== "link") setPlaying(true);
  };

  const facade = (
    <>
      <PosterImage poster={poster} sizes={sizes} />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-void/85 via-void/10 to-void/40" />
      <span
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{ background: "repeating-linear-gradient(to bottom, rgb(0 0 0 / 0.25) 0 1px, transparent 1px 3px)" }}
      />
      <VhsOverlay mode="PLAY" track={trackNo} start={92 + index * 37} className="text-sm sm:text-lg" />
      <span
        aria-hidden
        className={cn(
          "absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white/85 bg-void/60 text-white [html[data-perf=full]_&]:bg-void/40 [html[data-perf=full]_&]:backdrop-blur-sm",
          "transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out",
          "group-hover:scale-110 group-hover:border-magenta group-hover:bg-magenta group-hover:text-void group-hover:shadow-neon-magenta",
          "group-focus-visible:border-magenta group-focus-visible:bg-magenta group-focus-visible:text-void",
          featured ? "size-20 sm:size-24" : "size-16 sm:size-[4.5rem]",
        )}
      >
        {source.kind === "link" ? <InstagramIcon size={featured ? 34 : 28} /> : <PlayIcon size={featured ? 36 : 28} className="translate-x-[2px]" />}
      </span>
    </>
  );

  const facadeClass =
    "group absolute inset-0 block cursor-pointer overflow-hidden rounded-[inherit] focus-visible:outline-offset-[-4px] [&_img]:transition-transform [&_img]:duration-700 [&_img]:ease-out hover:[&_img]:scale-[1.04]";

  return (
    <figure className="flex flex-col gap-4">
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-line bg-panel shadow-[0_30px_80px_-40px_rgb(255_20_147/0.45)] transition-[border-color,box-shadow] duration-300 hover:border-magenta/60">
        {playing && source.kind !== "link" ? (
          <VideoEmbed item={item} source={source} className="z-20" />
        ) : source.kind === "link" ? (
          <a
            href={source.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onPlay}
            aria-label={`Assistir no Instagram: ${item.title} (abre em nova aba)`}
            className={facadeClass}
          >
            {facade}
          </a>
        ) : (
          <button type="button" onClick={onPlay} aria-label={`Reproduzir vídeo: ${item.title}`} className={facadeClass}>
            {facade}
          </button>
        )}
      </div>
      <figcaption className="flex items-start justify-between gap-4">
        <span className="min-w-0">
          <span className="block font-hud text-lg leading-tight font-bold tracking-[0.14em] text-white uppercase">{item.title}</span>
          {item.subtitle ? <span className="mt-1 block text-sm text-mute">{item.subtitle}</span> : null}
        </span>
        <span className="hud shrink-0 pt-1 text-[0.65rem] text-magenta">{platformLabel[item.platform]}</span>
      </figcaption>
    </figure>
  );
}
