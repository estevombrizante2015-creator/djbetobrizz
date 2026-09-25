"use client";

import { useEffect, useRef, useState } from "react";
import { useExperience } from "@/components/Effects/ExperienceContext";
import { Visualizer } from "@/components/Visualizer/Visualizer";
import { PlayIcon, SoundCloudIcon } from "@/components/ui/Icons";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Platter } from "./Platter";
import { Waveform } from "./Waveform";

/** Faixa pronta para o deck (validada no servidor). */
export type DeckTrack = {
  /** URL do SoundCloud (faixa, set, playlist ou perfil). */
  url: string;
  /** Título original (analytics e rótulos acessíveis). */
  title: string;
  /** Linha grande do display, ex.: "SET — FLASHBACK". */
  display: string;
  genre?: string;
  duration?: string;
};

type Status = "idle" | "playing" | "paused";

const SC_ORIGIN = "https://w.soundcloud.com";

function widgetSrc(url: string) {
  return (
    `${SC_ORIGIN}/player/?url=${encodeURIComponent(url)}` +
    "&color=%23ff1493&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true"
  );
}

/**
 * Deck estilo CDJ: prato com vinil + display com forma de onda + ▶.
 * Nada toca antes do clique (§48): o widget oficial do SoundCloud só é inserido no ▶.
 * Eventos play/pause do widget (postMessage) controlam o giro do disco e o visualizer.
 */
export function SetsDeck({ tracks, className }: { tracks: DeckTrack[]; className?: string }) {
  const { isDesktop } = useExperience();
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  const focusPlayRef = useRef(false);

  const current = tracks[index] ?? tracks[0];
  const loaded = status !== "idle";
  const playing = status === "playing";

  const load = (i: number) => {
    const t = tracks[i];
    if (!t) return;
    track("soundcloud_click", { source: "sets_player", title: t.title });
    setIndex(i);
    setStatus("playing");
  };

  const eject = () => {
    focusPlayRef.current = true;
    setStatus("idle");
  };

  // Foco: entra no player ao carregar; volta ao ▶ ao ejetar.
  useEffect(() => {
    if (loaded) iframeRef.current?.focus({ preventScroll: true });
    else if (focusPlayRef.current) {
      focusPlayRef.current = false;
      playRef.current?.focus({ preventScroll: true });
    }
  }, [loaded, index]);

  // Escuta play/pause/finish do widget (API de postMessage do SoundCloud).
  useEffect(() => {
    if (!loaded) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== SC_ORIGIN || e.source !== iframeRef.current?.contentWindow) return;
      let data: unknown = e.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      const method = typeof data === "object" && data !== null ? (data as { method?: unknown }).method : undefined;
      if (method === "ready") subscribe(iframeRef.current);
      else if (method === "play") setStatus("playing");
      else if (method === "pause" || method === "finish") setStatus("paused");
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [loaded]);

  if (!current) return null;

  return (
    <div className={cn("relative", className)} data-deck-status={status}>
      {/* Halo ambiente */}
      <div
        aria-hidden
        className={cn("pointer-events-none absolute -inset-x-10 -inset-y-16 -z-10 transition-opacity duration-1000", playing ? "opacity-100" : "opacity-60")}
        style={{
          background:
            "radial-gradient(closest-side at 28% 50%, rgb(138 43 226 / 0.28), transparent), radial-gradient(closest-side at 75% 55%, rgb(0 229 255 / 0.14), transparent)",
        }}
      />

      <div
        className="relative rounded-[1.75rem] border border-line-strong p-4 sm:p-6 lg:rounded-[2.25rem] lg:p-8"
        style={{
          background: "linear-gradient(170deg, #1c1928 0%, #0e0d14 42%, #0a0910 100%)",
          boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.07), 0 50px 120px -50px rgb(0 0 0 / 0.95)",
        }}
      >
        <Screws />
        <span
          aria-hidden
          className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan/70 to-transparent lg:inset-x-24"
        />

        {/* Faixa superior do equipamento */}
        <div className="flex items-center justify-between gap-4 px-1">
          <p className="hud flex items-center gap-2.5 text-[0.65rem] text-mute">
            <span
              aria-hidden
              className={cn("size-2 rounded-full transition-colors", playing ? "bg-magenta shadow-neon-magenta" : loaded ? "bg-cyan" : "bg-dim")}
            />
            Deck A
            <span aria-hidden className="hidden text-dim sm:inline">
              {"// "}
              {playing ? "On air" : loaded ? "Pause" : "Standby"}
            </span>
          </p>
          {loaded ? (
            <button
              type="button"
              onClick={eject}
              className="hud rounded-full border border-line-strong px-3 py-1.5 text-[0.65rem] text-mute transition-colors hover:border-white/60 hover:text-white"
            >
              <span aria-hidden>⏏ </span>Fechar player
            </button>
          ) : (
            <p className="hud flex items-center gap-2 text-[0.65rem] text-mute">
              <SoundCloudIcon size={18} className="text-white" />
              SoundCloud
            </p>
          )}
        </div>

        <div className="mt-5 grid items-center gap-8 lg:mt-7 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-10">
          <Platter spinning={playing} armDown={loaded} className="mx-auto w-[74%] max-w-[300px] sm:max-w-[340px] lg:w-full lg:max-w-[440px]" />

          {/* Display do deck / player */}
          <div
            className="relative h-[400px] overflow-hidden rounded-2xl border border-line bg-[#06050a] sm:h-[420px]"
            style={{ boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 0.9), inset 0 20px 60px rgb(0 0 0 / 0.6)" }}
          >
            {loaded ? (
              <iframe
                key={current.url}
                ref={iframeRef}
                src={widgetSrc(current.url)}
                title={`Player do SoundCloud — ${current.title}`}
                loading="lazy"
                allow="autoplay; encrypted-media"
                onLoad={(e) => subscribe(e.currentTarget)}
                className="absolute inset-0 h-full w-full border-0"
              />
            ) : (
              <DeckFacade track={current} playRef={playRef} onPlay={() => load(index)} />
            )}
          </div>
        </div>

        {/* Spectrum — mais intenso quando o set está tocando */}
        <div className="mt-8 flex items-center gap-3 lg:mt-10">
          <span aria-hidden className="hud hidden text-[0.6rem] text-dim sm:block">
            L
          </span>
          <div
            className={cn(
              "flex-1 origin-center transition-[opacity,transform,filter] duration-700 ease-out",
              playing ? "scale-y-100 opacity-100 lg:drop-shadow-[0_0_10px_rgb(255_20_147/0.45)]" : "scale-y-[0.8] opacity-75",
            )}
          >
            <Visualizer bars={isDesktop ? 72 : 32} height="4.5rem" palette={playing ? "neon" : "red"} mirror />
          </div>
          <span aria-hidden className="hud hidden text-[0.6rem] text-dim sm:block">
            R
          </span>
        </div>

        {tracks.length > 1 ? (
          <Playlist tracks={tracks} index={index} status={status} onSelect={load} />
        ) : null}
      </div>
    </div>
  );
}

/** Pede ao widget os eventos de reprodução (sem carregar a api.js). */
function subscribe(frame: HTMLIFrameElement | null) {
  const target = frame?.contentWindow;
  if (!target) return;
  for (const value of ["play", "pause", "finish"]) {
    target.postMessage(JSON.stringify({ method: "addEventListener", value }), SC_ORIGIN);
  }
}

function DeckFacade({
  track: t,
  playRef,
  onPlay,
}: {
  track: DeckTrack;
  playRef: React.RefObject<HTMLButtonElement | null>;
  onPlay: () => void;
}) {
  return (
    <div className="relative flex h-full flex-col p-5 sm:p-7">
      {/* Textura de LCD */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 85% 0%, rgb(0 229 255 / 0.1), transparent 60%), repeating-linear-gradient(to bottom, rgb(255 255 255 / 0.025) 0 1px, transparent 1px 4px)",
        }}
      />

      <div className="relative">
        <p className="font-hud text-sm font-bold tracking-[0.34em] text-mute uppercase">DJ BetoBrizz</p>
        <h3 className="mt-2 font-display text-[1.35rem] leading-tight font-black text-balance text-white uppercase sm:text-3xl">
          {t.display}
        </h3>
        {t.genre || t.duration ? (
          <p className="mt-3 flex flex-wrap gap-2">
            {t.genre ? (
              <span className="hud rounded-full border border-cyan/50 px-2.5 py-1 text-[0.65rem] text-cyan">{t.genre}</span>
            ) : null}
            {t.duration ? (
              <span className="hud rounded-full border border-line-strong px-2.5 py-1 text-[0.65rem] text-mute">{t.duration}</span>
            ) : null}
          </p>
        ) : null}
      </div>

      <div className="relative mt-auto">
        <Waveform seed={t.title} className="h-20 sm:h-24" />
        <div aria-hidden className="mt-2 flex justify-between">
          {Array.from({ length: 11 }, (_, i) => (
            <span key={i} className={cn("w-px bg-white/25", i % 5 === 0 ? "h-2.5" : "h-1.5")} />
          ))}
        </div>
      </div>

      <div className="relative mt-5 flex items-center gap-4 sm:mt-6 sm:gap-5">
        <div className="flex flex-col items-center gap-1.5">
          <button
            ref={playRef}
            type="button"
            onClick={onPlay}
            aria-label={`Ouvir ${t.title} — carrega o player do SoundCloud`}
            className="group relative grid size-16 place-items-center rounded-full border-2 border-magenta bg-magenta/10 text-white transition-[background-color,color,box-shadow,transform] duration-300 ease-out hover:scale-105 hover:bg-magenta hover:text-void hover:shadow-neon-magenta focus-visible:bg-magenta focus-visible:text-void active:scale-95 sm:size-[4.5rem]"
          >
            <span aria-hidden className="absolute -inset-1.5 animate-pulse-glow rounded-full border border-magenta/50" />
            <PlayIcon size={28} className="translate-x-[2px]" />
          </button>
          <span aria-hidden className="hud text-[0.55rem] text-dim">
            Play / Pause
          </span>
        </div>
        <div aria-hidden className="flex flex-col items-center gap-1.5">
          <span className="grid size-12 place-items-center rounded-full border-2 border-white/25 font-hud text-xs font-bold tracking-[0.15em] text-mute">
            CUE
          </span>
          <span className="hud invisible text-[0.55rem]">Cue</span>
        </div>
        <p className="ml-1 max-w-[16rem] text-sm leading-snug text-mute">
          Toque <span className="text-white">▶</span> para ouvir aqui mesmo. Nada toca sozinho.
        </p>
      </div>
    </div>
  );
}

function Playlist({
  tracks,
  index,
  status,
  onSelect,
}: {
  tracks: DeckTrack[];
  index: number;
  status: Status;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="mt-8 border-t border-line pt-6">
      <p className="hud text-[0.65rem] text-mute">Browse // Sets</p>
      <ol className="mt-3 divide-y divide-line">
        {tracks.map((t, i) => {
          const active = i === index && status !== "idle";
          return (
            <li key={t.url}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={active ? "true" : undefined}
                aria-label={`Ouvir ${t.title}`}
                className={cn(
                  "group flex w-full items-center gap-4 rounded-lg px-2 py-3 text-left transition-colors hover:bg-white/[0.04]",
                  active ? "text-cyan" : "text-white",
                )}
              >
                <span className="font-vhs text-xl text-dim tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1 truncate font-hud text-base font-bold tracking-[0.12em] uppercase">
                  {t.display}
                </span>
                {t.genre ? <span className="hud hidden text-[0.65rem] text-mute sm:inline">{t.genre}</span> : null}
                {t.duration ? <span className="hud text-[0.65rem] text-mute tabular-nums">{t.duration}</span> : null}
                <PlayIcon size={16} className="shrink-0 text-magenta transition-transform group-hover:scale-125" />
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Quatro parafusos do painel — detalhe de hardware. */
function Screws() {
  return (
    <>
      {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map((pos) => (
        <span
          key={pos}
          aria-hidden
          className={cn("absolute hidden size-2 rounded-full bg-[#2b2835] shadow-[inset_0_1px_1px_rgb(255_255_255/0.2)] lg:block", pos)}
        />
      ))}
    </>
  );
}
