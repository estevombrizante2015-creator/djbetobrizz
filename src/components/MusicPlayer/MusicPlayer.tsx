"use client";

import { useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import { playlist } from "@/data/music";
import { autoStartMusic, getMusicState, getServerMusicState, next, pause, play, subscribeMusic } from "@/lib/audio-engine";
import { track as trackEvent } from "@/lib/analytics";
import { NextIcon, PauseIcon, PlayIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

/**
 * Mini player da música de fundo (canto inferior esquerdo; o WhatsApp fica à direita).
 * Decisão do cliente: o site abre com a música LIGADA — ver src/lib/audio-engine.ts.
 * Se o navegador bloquear o som até o primeiro gesto, o player mostra "Toque para ouvir".
 */
export function MusicPlayer() {
  const music = useSyncExternalStore(subscribeMusic, getMusicState, getServerMusicState);

  // Liga a música ao abrir, sem disputar a carga inicial (LCP/hidratação) com o download do áudio.
  useEffect(() => {
    const start = () => autoStartMusic();
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(start, 1200);
    return () => window.clearTimeout(id);
  }, []);

  if (!playlist.length) return null;

  const { enabled, playing, loading, blocked, track } = music;
  // Estado real do som (não a intenção): com o autoplay bloqueado o botão mostra "Tocar", e um toque
  // nele chama play() dentro do gesto (liga o analisador e a música começa). `enabled` só arma a borda.
  const active = playing || loading;

  const subtitle = blocked ? "Toque para ouvir" : loading && !playing ? "Carregando…" : track?.artist;

  return (
    <div
      role="region"
      aria-label="Música de fundo"
      data-music-control
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-[calc(env(safe-area-inset-left)+1rem)] z-40 md:bottom-6 md:left-6"
    >
      {/* Anúncio para leitores de tela quando a faixa muda */}
      <p className="sr-only" aria-live="polite">
        {playing && track ? `Tocando: ${track.title} — ${track.artist}` : ""}
      </p>

      <div
        className={cn(
          "flex h-14 max-w-[calc(100vw-6.5rem)] items-center gap-2 rounded-full border bg-void/92 p-1.5 text-white md:max-w-[22rem]",
          enabled ? "border-magenta/70 shadow-[0_0_26px_-8px_rgb(255_20_147/0.8)]" : "border-line-strong",
        )}
      >
        <button
          type="button"
          onClick={() => {
            trackEvent("music_toggle", { action: active ? "pause" : "play", title: track?.title });
            if (active) pause();
            else void play();
          }}
          aria-label={active ? "Pausar a música de fundo" : "Tocar a música de fundo"}
          className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-magenta to-red"
        >
          {track?.cover ? (
            <Image
              src={track.cover}
              alt=""
              width={44}
              height={44}
              sizes="44px"
              className={cn("absolute inset-0 size-full object-cover transition-opacity", active ? "opacity-45" : "opacity-30")}
            />
          ) : null}
          <span className="relative">{active ? <PauseIcon size={18} /> : <PlayIcon size={18} />}</span>
          {/* Som ligado mas bloqueado pelo navegador: anel pulsando chamando o toque (parado no lite) */}
          {blocked ? <span aria-hidden className="absolute inset-0 animate-pulse-glow rounded-full ring-2 ring-cyan/80" /> : null}
        </button>

        {/* Equalizador (CSS): anima com o som LIGADO — o player abre "vivo"; parado no nível lite */}
        <span aria-hidden className="flex h-5 shrink-0 items-end gap-[3px]">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="h-full w-[3px] origin-bottom animate-eq rounded-sm bg-gradient-to-t from-cyan via-purple to-magenta"
              style={{
                animationDelay: `${i * -0.27}s`,
                animationDuration: `${0.9 + i * 0.17}s`,
                animationPlayState: active || enabled ? "running" : "paused",
              }}
            />
          ))}
        </span>

        <div className="min-w-0 flex-1 pr-1 leading-tight">
          <p className="truncate font-hud text-sm font-bold tracking-wide text-white">{track?.title}</p>
          <p className={cn("truncate font-hud text-[0.7rem] tracking-wider uppercase", blocked ? "text-cyan" : "text-mute")}>
            {subtitle}
          </p>
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
    </div>
  );
}
