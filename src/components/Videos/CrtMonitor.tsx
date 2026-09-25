"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { gallery } from "@/data/gallery";
import { useExperience } from "@/components/Effects/ExperienceContext";
import { KnobIcon } from "@/components/ui/Icons";
import { cn, getImageMeta } from "@/lib/utils";

/** Canais do telão — fotos horizontais reais; o alt vem da galeria quando existir. */
const CHANNELS = [
  { src: "/images/events/betobrizz-telao-vermelho.webp", label: "DJ + VJ" },
  { src: "/images/events/betobrizz-palco-telas-retro.webp", label: "Telões" },
  { src: "/images/events/betobrizz-mixagem-close.webp", label: "Mixagem" },
  { src: "/images/art/betobrizz-arena.webp", label: "Sound & Visual" },
].map((c) => ({ ...c, alt: gallery.find((p) => p.src === c.src)?.alt ?? `DJ BetoBrizz — ${c.label}` }));

const AUTO_MS = 6500;

function blur(src: string) {
  const { blurDataURL } = getImageMeta(src);
  return blurDataURL ? { placeholder: "blur" as const, blurDataURL } : {};
}
const pad = (n: number) => String(n + 1).padStart(2, "0");

/** Ruído de "troca de canal" (SVG inline, sem requisição). */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * Telão/TV CRT com seletor de canais (referência a mesa de VJ).
 * Liga como um CRT ao entrar na tela; troca de canal sozinho enquanto visível
 * (para ao interagir, fora da tela, em aba oculta ou com movimento reduzido).
 */
export function CrtMonitor({ className }: { className?: string }) {
  const { reducedMotion } = useExperience();
  const rootRef = useRef<HTMLElement>(null);
  const [channel, setChannel] = useState(0);
  const [loaded, setLoaded] = useState<number[]>([0, 1]);
  const [switchKey, setSwitchKey] = useState(0);
  const [manual, setManual] = useState(false);

  const tune = useCallback((next: number, byUser: boolean) => {
    const n = CHANNELS.length;
    const i = ((next % n) + n) % n;
    setChannel(i);
    setLoaded((prev) => Array.from(new Set([...prev, i, (i + 1) % n])));
    setSwitchKey((k) => k + 1);
    if (byUser) setManual(true);
  }, []);

  // Troca automática enquanto o telão está visível.
  const channelRef = useRef(0);
  useEffect(() => {
    channelRef.current = channel;
  }, [channel]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || manual || reducedMotion) return;
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
  }, [manual, reducedMotion, tune]);

  const current = CHANNELS[channel];

  return (
    <figure ref={rootRef} className={cn("relative", className)}>
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
            {CHANNELS.map((c, i) =>
              loaded.includes(i) ? (
                <Image
                  key={c.src}
                  src={c.src}
                  alt={i === channel ? c.alt : ""}
                  aria-hidden={i === channel ? undefined : true}
                  fill
                  sizes="(min-width: 1280px) 780px, (min-width: 1024px) 62vw, 94vw"
                  quality={75}
                  {...blur(c.src)}
                  className={cn(
                    "object-cover brightness-90 contrast-110 saturate-[1.15] transition-opacity duration-500 ease-out",
                    i === channel ? "opacity-100" : "opacity-0",
                  )}
                />
              ) : null,
            )}
            {/* Brilho de "ligar" o CRT */}
            <motion.span
              aria-hidden
              className="absolute inset-0 bg-white motion-reduce:hidden"
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

          {/* Curvatura, vinheta, reflexo e scanlines do CRT */}
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

          {/* OSD do canal */}
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
              {CHANNELS.map((c, i) => (
                <button
                  key={c.src}
                  type="button"
                  aria-pressed={i === channel}
                  aria-label={`Canal ${pad(i)}: ${c.label}`}
                  onClick={() => tune(i, true)}
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-md border font-vhs text-lg leading-none transition-[color,border-color,background-color,box-shadow] duration-200 sm:h-8 sm:w-10",
                    i === channel
                      ? "border-magenta bg-magenta/15 text-white shadow-neon-magenta"
                      : "border-line-strong bg-void/60 text-mute hover:border-white/50 hover:text-white",
                  )}
                >
                  {pad(i)}
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
                style={{ transform: `rotate(${channel * 90}deg)` }}
              />
            </button>
          </div>
        </div>
      </div>
    </figure>
  );
}
