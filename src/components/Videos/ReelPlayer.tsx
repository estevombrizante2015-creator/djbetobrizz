"use client";

import { useState } from "react";
import Image from "next/image";
import type { VideoItem } from "@/data/types";
import { PlayIcon } from "@/components/ui/Icons";
import { track } from "@/lib/analytics";
import { imageProps } from "@/lib/utils";

type Props = {
  item: VideoItem;
  /** Caminho do arquivo de vídeo (fonte "file"). */
  src: string;
  index: number;
};

/**
 * Vídeo vertical (9:16) numa moldura de celular — facade: só a capa carrega; o <video> entra
 * depois do ▶ (nenhum byte do vídeo antes do clique). Tocar um vídeo pausa a música de fundo
 * (o motor de áudio escuta o evento "play" de qualquer <video>).
 */
export function ReelPlayer({ item, src, index }: Props) {
  const [playing, setPlaying] = useState(false);
  const channel = `CH ${String(index + 1).padStart(2, "0")}`;

  return (
    <figure className="flex flex-col gap-4">
      <div
        className="relative rounded-[2.2rem] border border-line-strong p-2 shadow-[0_30px_80px_-40px_rgb(255_20_147/0.55)] transition-[border-color] duration-300 hover:border-magenta/60"
        style={{ background: "linear-gradient(160deg, #26222f 0%, #0c0b11 40%, #16131e 100%)" }}
      >
        <div className="relative aspect-[9/16] overflow-hidden rounded-[1.75rem] bg-black">
          {playing ? (
            <video
              src={src}
              poster={item.poster}
              aria-label={item.title}
              controls
              autoPlay
              playsInline
              preload="auto"
              className="absolute inset-0 h-full w-full bg-black object-cover"
              ref={(el) => el?.focus({ preventScroll: true })}
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                track("video_play", { platform: item.platform, title: item.title });
                setPlaying(true);
              }}
              aria-label={`Reproduzir vídeo: ${item.title}`}
              className="group absolute inset-0 block cursor-pointer focus-visible:outline-offset-[-4px]"
            >
              {item.poster ? (
                <Image
                  {...imageProps(item.poster)}
                  alt=""
                  sizes="(min-width: 1024px) 300px, (min-width: 640px) 40vw, 68vw"
                  quality={75}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              ) : null}
              <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-void/50 via-transparent to-void/85" />
              {/* Notch + HUD */}
              <span aria-hidden className="absolute top-2 left-1/2 h-4 w-16 -translate-x-1/2 rounded-full bg-black" />
              <span aria-hidden className="vhs absolute top-7 left-4 text-sm text-white/90">
                VJ <span className="text-cyan">▸</span> {channel}
              </span>
              {/* Play */}
              <span
                aria-hidden
                className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white/90 bg-void/60 text-white transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out group-hover:scale-110 group-hover:border-magenta group-hover:bg-magenta group-hover:text-void group-hover:shadow-neon-magenta group-focus-visible:border-magenta group-focus-visible:bg-magenta group-focus-visible:text-void"
              >
                <PlayIcon size={26} className="translate-x-[2px]" />
              </span>
            </button>
          )}
        </div>
      </div>
      <figcaption className="px-1">
        <span className="block font-hud text-lg leading-tight font-bold tracking-[0.14em] text-white uppercase">{item.title}</span>
        {item.subtitle ? <span className="mt-1 block text-sm text-mute">{item.subtitle}</span> : null}
      </figcaption>
    </figure>
  );
}
