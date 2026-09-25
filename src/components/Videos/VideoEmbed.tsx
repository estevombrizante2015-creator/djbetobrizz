"use client";

import { useEffect, useRef } from "react";
import type { VideoItem } from "@/data/types";
import { cn } from "@/lib/utils";
import { resolveVideoPoster, type VideoSource } from "./video-source";

type Props = {
  item: VideoItem;
  /** Só fontes reproduzíveis na página (Instagram abre em nova aba). */
  source: Extract<VideoSource, { kind: "iframe" | "file" }>;
  className?: string;
};

/**
 * Player real — montado só depois do clique na capa (facade).
 * Recebe o foco ao aparecer, para quem navega por teclado continuar de onde parou.
 */
export function VideoEmbed({ item, source, className }: Props) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    (frameRef.current ?? videoRef.current)?.focus({ preventScroll: true });
  }, []);

  if (source.kind === "iframe") {
    return (
      <iframe
        ref={frameRef}
        src={source.src}
        title={`${item.title} — player de vídeo`}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className={cn("absolute inset-0 h-full w-full border-0 bg-black", className)}
      />
    );
  }

  const poster = resolveVideoPoster(item);
  return (
    <video
      ref={videoRef}
      src={source.src}
      poster={poster.kind === "none" ? undefined : poster.src}
      aria-label={item.title}
      controls
      autoPlay
      playsInline
      className={cn("absolute inset-0 h-full w-full bg-black object-contain", className)}
    />
  );
}
