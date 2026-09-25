"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import type { VideoItem } from "@/data/types";
import { gallery } from "@/data/gallery";
import { useExperience } from "@/components/Effects/ExperienceContext";
import { InstagramIcon, KnobIcon, PlayIcon } from "@/components/ui/Icons";
import { track } from "@/lib/analytics";
import { cn, getImageMeta } from "@/lib/utils";
import { PosterImage } from "./PosterImage";
import { VideoEmbed } from "./VideoEmbed";
import { platformLabel, resolveVideoPoster, type VideoSource } from "./video-source";

/** Vídeo já validado (ver `resolveVideoSource`) para tocar dentro do telão. */
export type CrtVideo = { item: VideoItem; source: VideoSource };

type PhotoChannel = { kind: "photo"; key: string; src: string; label: string; alt: string };
type VideoChannel = { kind: "video"; key: string; label: string; video: CrtVideo };
type Channel = PhotoChannel | VideoChannel;

/** Fotos horizontais reais para os canais; o alt vem da galeria quando existir. */
const PHOTOS: PhotoChannel[] = [
  { src: "/images/events/betobrizz-telao-vermelho.webp", label: "DJ + VJ" },
  { src: "/images/events/betobrizz-palco-telas-retro.webp", label: "Telões" },
  { src: "/images/events/betobrizz-mixagem-close.webp", label: "Mixagem" },
  { src: "/images/events/betobrizz-set-pioneer.webp", label: "Cabine" },
  { src: "/images/art/betobrizz-arena.webp", label: "Sound & Visual" },
].map((c) => ({
  kind: "photo",
  key: c.src,
  ...c,
  alt: gallery.find((p) => p.src === c.src)?.alt ?? `DJ BetoBrizz — ${c.label}`,
}));

/** Total de canais (cabe em 360px com botões de 40px). */
const MAX_CHANNELS = 5;
/** Vídeos que entram no telão (mais que isso, a seção usa a grade de cards). */
const MAX_VIDEO_CHANNELS = 2;
const AUTO_MS = 6500;
const SCREEN_SIZES = "(min-width: 1280px) 780px, (min-width: 1024px) 62vw, 94vw";

function buildChannels(videos: CrtVideo[]): Channel[] {
  const videoChannels: VideoChannel[] = videos.slice(0, MAX_VIDEO_CHANNELS).map((video, i) => ({
    kind: "video",
    key: `video-${i}-${video.item.id}`,
    label: "Vídeo",
    video,
  }));
  return [...videoChannels, ...PHOTOS.slice(0, MAX_CHANNELS - videoChannels.length)];
}

function blur(src: string) {
  const { blurDataURL } = getImageMeta(src);
  return blurDataURL ? { placeholder: "blur" as const, blurDataURL } : {};
}
const pad = (n: number) => String(n + 1).padStart(2, "0");
const channelTitle = (c: Channel) => (c.kind === "video" ? c.video.item.title : c.label);

/** Ruído de "troca de canal" (SVG inline, sem requisição). */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

type Props = {
  /** Vídeos de `data/videos` que tocam no próprio telão (canais 01, 02…). */
  videos?: CrtVideo[];
  className?: string;
};

/**
 * Telão/TV CRT com seletor de canais (referência a mesa de VJ). Liga como um CRT ao entrar na tela.
 * Com vídeos: os primeiros canais são os vídeos (capa + ▶; o player só carrega no clique) e o telão
 * fica parado neles. Sem vídeos: fotos reais trocando sozinhas enquanto visível (pausa sob o mouse;
 * para ao interagir/focar, fora da tela, em aba oculta ou com movimento reduzido).
 */
const NO_VIDEOS: CrtVideo[] = [];

export function CrtMonitor({ videos = NO_VIDEOS, className }: Props) {
  const { reducedMotion } = useExperience();
  const channels = useMemo(() => buildChannels(videos), [videos]);
  const hasVideo = channels.some((c) => c.kind === "video");
  const rootRef = useRef<HTMLElement>(null);
  const [channel, setChannel] = useState(0);
  const [loaded, setLoaded] = useState<number[]>([0, 1]);
  const [switchKey, setSwitchKey] = useState(0);
  const [manual, setManual] = useState(false);
  const [hold, setHold] = useState(false);
  const [playing, setPlaying] = useState(false);

  const count = channels.length;
  const tune = useCallback(
    (next: number, byUser: boolean) => {
      const i = ((next % count) + count) % count;
      setChannel(i);
      setPlaying(false);
      setLoaded((prev) => Array.from(new Set([...prev, i, (i + 1) % count])));
      setSwitchKey((k) => k + 1);
      if (byUser) setManual(true);
    },
    [count],
  );

  // Troca automática enquanto o telão está visível (só no modo fotos).
  const channelRef = useRef(0);
  useEffect(() => {
    channelRef.current = channel;
  }, [channel]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || hasVideo || manual || hold || reducedMotion) return;
    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        window.clearInterval(timer);
        if (entry.isIntersecting) {
          timer = window.setInterval(() => {
            if (!document.hidden) tune(channelRef.current + 1, false);
          }, AUTO_MS);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, [hasVideo, manual, hold, reducedMotion, tune]);

  const current = channels[channel] ?? channels[0];
  const liveVideo = current.kind === "video" && playing ? current.video : null;
  /** Knob seletor: de -135° a +135°, um "clique" por canal. */
  const knobAngle = -135 + (270 / Math.max(1, count - 1)) * channel;

  const onPlay = (video: CrtVideo) => {
    track("video_play", { platform: video.item.platform, title: video.item.title, source: "videos_crt" });
    if (video.source.kind !== "link") {
      setManual(true);
      setPlaying(true);
    }
  };

  return (
    <figure
      ref={rootRef}
      className={cn("relative", className)}
      // Pausa a troca automática sob o mouse; ao receber foco (teclado), para de vez.
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setManual(true)}
    >
      {/* Carcaça da TV */}
      <div
        className="relative rounded-[1.6rem] border border-line-strong p-2.5 sm:rounded-[2.2rem] sm:p-4 lg:p-5"
        style={{
          background: "linear-gradient(160deg, #221e2e 0%, #0f0d16 45%, #16131f 100%)",
          boxShadow:
            "inset 0 1px 0 rgb(255 255 255 / 0.08), inset 0 -2px 0 rgb(0 0 0 / 0.6), 0 50px 120px -50px rgb(255 36 20 / 0.55), 0 0 0 1px rgb(0 0 0 / 0.7)",
        }}
      >
        {/* Tela */}
        <div className="relative aspect-video overflow-hidden rounded-[1rem] bg-black sm:rounded-[1.5rem] lg:rounded-[1.75rem]">
          <motion.div
            className="absolute inset-0"
            initial={{ scaleX: 0.35, scaleY: 0.012 }}
            whileInView={{ scaleX: [0.35, 1, 1], scaleY: [0.012, 0.012, 1] }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.85, times: [0, 0.35, 1], ease: [0.16, 1, 0.3, 1] }}
          >
            {channels.map((c, i) => {
              if (!loaded.includes(i)) return null;
              const visible = i === channel;
              const fade = cn("transition-opacity duration-500 ease-out", visible ? "opacity-100" : "opacity-0");
              return c.kind === "photo" ? (
                <Image
                  key={c.key}
                  src={c.src}
                  alt={visible ? c.alt : ""}
                  aria-hidden={visible ? undefined : true}
                  fill
                  sizes={SCREEN_SIZES}
                  quality={75}
                  {...blur(c.src)}
                  className={cn("object-cover brightness-90 contrast-110 saturate-[1.15]", fade)}
                />
              ) : (
                <span key={c.key} aria-hidden className={cn("absolute inset-0", fade)}>
                  <PosterImage poster={resolveVideoPoster(c.video.item)} sizes={SCREEN_SIZES} className="saturate-[1.1]" />
                </span>
              );
            })}

            {/* Vídeo: capa com ▶ (facade) ou o player real depois do clique */}
            {current.kind === "video" ? (
              liveVideo && liveVideo.source.kind !== "link" ? (
                <VideoEmbed key={current.key} item={liveVideo.item} source={liveVideo.source} className="z-30" />
              ) : (
                <VideoFacade key={current.key} video={current.video} onPlay={() => onPlay(current.video)} />
              )
            ) : null}

            {/* Brilho de "ligar" o CRT */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-40 bg-white motion-reduce:hidden"
              initial={{ opacity: 1 }}
              whileInView={{ opacity: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            />
          </motion.div>

          {/* Ruído na troca de canal */}
          {switchKey > 0 ? (
            <motion.span
              key={switchKey}
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 motion-reduce:hidden"
              style={{ backgroundImage: `${NOISE}, repeating-linear-gradient(to bottom, rgb(255 255 255 / 0.14) 0 2px, transparent 2px 5px)` }}
              initial={{ opacity: 0.9, x: "-2%" }}
              animate={{ opacity: 0, x: "0%" }}
              transition={{ duration: 0.38, ease: "easeOut" }}
            />
          ) : null}

          {/* Curvatura, vinheta, reflexo, scanlines e OSD — saem da frente enquanto o vídeo toca */}
          {liveVideo ? null : (
            <>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 z-10"
                style={{
                  background:
                    "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, rgb(0 0 0 / 0.6) 100%), linear-gradient(125deg, rgb(255 255 255 / 0.1) 0%, transparent 32%)",
                }}
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 z-10 opacity-70"
                style={{ background: "repeating-linear-gradient(to bottom, rgb(0 0 0 / 0.28) 0 1px, transparent 1px 3px)" }}
              />
              <div aria-hidden className="vhs pointer-events-none absolute inset-0 z-20 p-3 text-lg text-white sm:p-5 sm:text-2xl lg:text-3xl">
                <div className="flex items-start justify-between">
                  <span>CH {pad(channel)}</span>
                  <span className="text-base sm:text-xl">AV·1</span>
                </div>
                <div className="absolute inset-x-3 bottom-3 flex items-end justify-between sm:inset-x-5 sm:bottom-5">
                  <span className="text-base sm:text-xl">{current.label}</span>
                  <span className="flex items-end gap-[3px]">
                    {[0.35, 0.55, 0.75, 1].map((h) => (
                      <span key={h} className="w-1 bg-white/85 sm:w-1.5" style={{ height: `${h * 1.1}rem` }} />
                    ))}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Painel frontal: marca + canais + knob */}
        <div className="mt-2.5 flex items-center justify-between gap-3 px-1 sm:mt-4 sm:px-2">
          <div className="flex min-w-0 items-center gap-2.5" aria-hidden>
            <span className="size-2 shrink-0 rounded-full bg-red shadow-neon-red" />
            <span className="hidden truncate font-display text-[0.65rem] font-bold tracking-[0.32em] text-mute sm:block">
              BETOBRIZZ <span className="text-dim">VISION</span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div role="group" aria-label="Canais do telão" className="flex gap-1 sm:gap-1.5">
              {channels.map((c, i) => (
                <button
                  key={c.key}
                  type="button"
                  aria-pressed={i === channel}
                  aria-label={`Canal ${pad(i)}: ${channelTitle(c)}`}
                  onClick={() => tune(i, true)}
                  className={cn(
                    "relative grid size-10 place-items-center rounded-md border font-vhs text-lg leading-none transition-[color,border-color,background-color,box-shadow] duration-200 sm:h-9",
                    i === channel
                      ? "border-magenta bg-magenta/15 text-white shadow-neon-magenta"
                      : "border-line-strong bg-void/60 text-mute hover:border-white/50 hover:text-white",
                  )}
                >
                  {pad(i)}
                  {/* Canal de vídeo: ponto vermelho de "REC" */}
                  {c.kind === "video" ? (
                    <span aria-hidden className="absolute top-1 right-1 size-1.5 rounded-full bg-red shadow-neon-red" />
                  ) : null}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => tune(channel + 1, true)}
              aria-label="Próximo canal"
              className="grid size-10 place-items-center rounded-full border border-line-strong bg-[radial-gradient(circle_at_35%_30%,#3a3547,#121019_70%)] text-white shadow-[0_4px_12px_rgb(0_0_0/0.6)] transition-colors hover:border-cyan hover:text-cyan"
            >
              <KnobIcon
                size={26}
                className="transition-transform duration-500 ease-out"
                style={{ transform: `rotate(${knobAngle}deg)` }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Legenda (§20): título + "EVENTO / APRESENTAÇÃO" — só quando o telão tem vídeos */}
      {hasVideo ? (
        <figcaption className="mt-4 flex flex-col gap-1 px-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <span className="min-w-0 font-hud text-base leading-tight font-bold tracking-[0.14em] text-balance text-white uppercase sm:truncate sm:text-lg">
            {channelTitle(current)}
          </span>
          <span className="hud shrink-0 text-[0.65rem] text-magenta">
            {current.kind === "video"
              ? (current.video.item.subtitle ?? platformLabel[current.video.item.platform])
              : "Foto"}
          </span>
        </figcaption>
      ) : null}
    </figure>
  );
}

/** Capa do canal de vídeo: ▶ neon central (Instagram abre o post em nova aba). */
function VideoFacade({ video, onPlay }: { video: CrtVideo; onPlay: () => void }) {
  const { item, source } = video;
  const ring = (
    <span
      aria-hidden
      className={cn(
        "relative grid size-16 place-items-center rounded-full border-2 border-white/90 bg-void/45 text-white backdrop-blur-sm sm:size-20 lg:size-24",
        "transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out",
        "group-hover:scale-110 group-hover:border-magenta group-hover:bg-magenta group-hover:text-void group-hover:shadow-neon-magenta",
        "group-focus-visible:border-magenta group-focus-visible:bg-magenta group-focus-visible:text-void",
      )}
    >
      <span className="absolute -inset-2 animate-pulse-glow rounded-full border border-magenta/60" />
      {source.kind === "link" ? <InstagramIcon size={30} /> : <PlayIcon size={32} className="translate-x-[2px]" />}
    </span>
  );
  const className =
    "group absolute inset-0 z-30 grid cursor-pointer place-items-center rounded-[inherit] focus-visible:outline-offset-[-4px]";

  if (source.kind === "link") {
    return (
      <a
        href={source.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onPlay}
        aria-label={`Assistir no Instagram: ${item.title} (abre em nova aba)`}
        className={className}
      >
        {ring}
      </a>
    );
  }
  return (
    <button type="button" onClick={onPlay} aria-label={`Reproduzir vídeo: ${item.title}`} className={className}>
      {ring}
    </button>
  );
}
