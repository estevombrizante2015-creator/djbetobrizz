"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import { playlist } from "@/data/music";
import { getMusicState, getServerMusicState, next, subscribeMusic, toggle } from "@/lib/audio-engine";
import { track as trackEvent } from "@/lib/analytics";
import { NextIcon, PauseIcon, PlayIcon, VolumeIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

/**
 * Botão SOM + mini player da música de fundo (canto inferior esquerdo; o WhatsApp fica à direita).
 * Nada toca nem é baixado antes do clique do visitante (item 48 da especificação).
 */
export function MusicPlayer() {
  const music = useSyncExternalStore(subscribeMusic, getMusicState, getServerMusicState);
  if (!playlist.length) return null;

  const { playing, loading, started, track } = music;

  const onToggle = () => {
    trackEvent("music_toggle", { playing: !playing, title: track?.title });
    toggle();
  };

  return (
    <div
      role="region"
      aria-label="Música de fundo"
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-[calc(env(safe-area-inset-left)+1rem)] z-40 md:bottom-6 md:left-6"
    >
      {/* Anúncio para leitores de tela quando a faixa muda */}
      <p className="sr-only" aria-live="polite">
        {playing && track ? `Tocando: ${track.title} — ${track.artist}` : ""}
      </p>

      {!started ? (
        <button
          type="button"
          onClick={onToggle}
          aria-label="Ligar a música de fundo"
          className={cn(
            "group relative flex h-12 items-center gap-2.5 rounded-full border border-magenta/70 bg-void/90 pr-4 pl-1.5 text-white",
            "shadow-[0_0_24px_-6px_rgb(255_20_147/0.7)] transition-[border-color,box-shadow,transform] duration-300",
            "hover:border-magenta hover:shadow-[0_0_30px_-4px_rgb(255_20_147/0.9)] active:scale-95",
          )}
        >
          {/* anel "chamando" (parado no nível lite pela regra global de animate-*) */}
          <span aria-hidden className="absolute inset-0 animate-pulse-glow rounded-full ring-1 ring-magenta/50" />
          <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-magenta to-red">
            <VolumeIcon size={18} />
          </span>
          <span className="hud text-[0.7rem] font-bold tracking-[0.22em]">
            <span className="md:hidden">Som</span>
            <span className="hidden md:inline">Ligar o som</span>
          </span>
        </button>
      ) : (
        <div
          className={cn(
            "flex h-14 max-w-[calc(100vw-6.5rem)] items-center gap-2 rounded-full border bg-void/92 py-1.5 pr-1.5 pl-1.5 text-white md:max-w-[22rem]",
            playing ? "border-magenta/70 shadow-[0_0_26px_-8px_rgb(255_20_147/0.8)]" : "border-line-strong",
          )}
        >
          <button
            type="button"
            onClick={onToggle}
            aria-label={playing ? "Pausar a música de fundo" : "Tocar a música de fundo"}
            aria-pressed={playing}
            className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-magenta to-red"
          >
            {track?.cover ? (
              <Image
                src={track.cover}
                alt=""
                width={44}
                height={44}
                sizes="44px"
                className={cn("absolute inset-0 size-full object-cover transition-opacity", playing ? "opacity-45" : "opacity-30")}
              />
            ) : null}
            <span className="relative">{playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}</span>
          </button>

          {/* Equalizador (CSS; parado quando pausado e no nível lite) */}
          <span aria-hidden className="flex h-5 shrink-0 items-end gap-[3px]">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="h-full w-[3px] origin-bottom animate-eq rounded-sm bg-gradient-to-t from-cyan via-purple to-magenta"
                style={{
                  animationDelay: `${i * -0.27}s`,
                  animationDuration: `${0.9 + i * 0.17}s`,
                  animationPlayState: playing ? "running" : "paused",
                }}
              />
            ))}
          </span>

          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate font-hud text-sm font-bold tracking-wide text-white">
              {loading && !playing ? "Carregando…" : track?.title}
            </p>
            <p className="truncate font-hud text-[0.7rem] tracking-wider text-mute uppercase">{track?.artist}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              trackEvent("music_toggle", { action: "next" });
              next();
            }}
            aria-label="Próxima música"
            className="grid size-11 shrink-0 place-items-center rounded-full text-mute transition-colors hover:bg-white/5 hover:text-white"
          >
            <NextIcon size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
