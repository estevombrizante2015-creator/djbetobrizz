"use client";

import Image from "next/image";
import { useRef, useState, useSyncExternalStore, type AnimationEvent } from "react";
import {
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "motion/react";
import { useExperience } from "@/components/Effects/ExperienceContext";
import { cn, imageProps } from "@/lib/utils";
import { signalAudioVertical, signalHorizontal, signalVideoVertical } from "./signal";
import styles from "./DjVj.module.css";

type Side = "dj" | "vj";

const decks: Record<
  Side,
  { title: string; deck: string; channel: string; code: string; words: string[]; photo: string; alt: string }
> = {
  dj: {
    title: "DJ",
    deck: "Deck A",
    channel: "Audio",
    code: "A",
    words: ["Mixagem", "Energia", "Flashback", "Eletrônica"],
    photo: "/images/events/betobrizz-mixagem-close.webp",
    alt: "Mãos de DJ BetoBrizz mixando em uma controladora Pioneer",
  },
  vj: {
    title: "VJ",
    deck: "Deck B",
    channel: "Video",
    code: "B",
    words: ["Vídeo", "Telões", "Visuais", "Sincronia"],
    photo: "/images/events/betobrizz-palco-telas-retro.webp",
    alt: "Palco do DJ BetoBrizz diante de telões de LED em formato de TVs retrô",
  },
};

const noopSubscribe = () => () => {};

/**
 * false no SSR e durante a hidratação, true depois. O prefers-reduced-motion só é
 * conhecido no cliente — usá-lo no render antes disso quebraria a hidratação.
 */
function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/** Progresso a partir do qual as duas metades estão "conectadas". */
const LINK_AT = 0.9;

/**
 * Palco dividido DJ | = | VJ. Conforme o scroll, as metades se aproximam,
 * o sinal (onda de áudio → pulsos de vídeo) atravessa o nó "=" e o VJ
 * recebe um glitch RGB único. Mobile: empilhado, com a conexão na vertical.
 */
export function DjVjStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const { isDesktop, reducedMotion: prefersReduced } = useExperience();
  const reducedMotion = useHydrated() && prefersReduced;
  const inView = useInView(stageRef, { amount: 0.1 });

  const { scrollYProgress } = useScroll({ target: stageRef, offset: ["start 0.95", "center 0.58"] });
  const djX = useTransform(scrollYProgress, [0, 0.75], [-120, 0]);
  const vjX = useTransform(scrollYProgress, [0, 0.75], [120, 0]);
  const deckOpacity = useTransform(scrollYProgress, [0, 0.55], [0.3, 1]);
  const drawH = useTransform(scrollYProgress, [0.25, LINK_AT], [0, 1]);
  const drawTop = useTransform(scrollYProgress, [0.45, 0.75], [0, 1]);
  const drawBottom = useTransform(scrollYProgress, [0.78, 1], [0, 1]);
  const knob = useTransform(scrollYProgress, [0, LINK_AT], [-135, 135]);

  const [linked, setLinked] = useState(false);
  const [jolt, setJolt] = useState(false);
  const linkedRef = useRef(false);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = v >= LINK_AT;
    if (next === linkedRef.current) return;
    linkedRef.current = next;
    setLinked(next);
    if (next) setJolt(true);
  });

  const isLinked = reducedMotion || linked;
  const slide = isDesktop && !reducedMotion;
  const pulsing = isLinked && inView && !reducedMotion;

  const deckStyle = (x: MotionValue<number>): MotionStyle | undefined =>
    slide ? { x, opacity: deckOpacity } : undefined;

  return (
    <div
      ref={stageRef}
      className="relative mt-12 grid sm:mt-16 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]"
    >
      {/* Sinal horizontal DJ → = → VJ (lg+) */}
      <svg
        aria-hidden
        viewBox="0 0 1200 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 top-1/2 z-20 hidden h-24 -translate-y-1/2 overflow-visible lg:block"
      >
        <defs>
          <linearGradient id="djvj-signal" gradientUnits="userSpaceOnUse" x1="40" y1="0" x2="1160" y2="0">
            <stop offset="0" stopColor="#ff2414" />
            <stop offset="0.3" stopColor="#ff1493" />
            <stop offset="0.5" stopColor="#ffffff" />
            <stop offset="0.7" stopColor="#00e5ff" />
            <stop offset="1" stopColor="#0066ff" />
          </linearGradient>
        </defs>
        <motion.path
          d={signalHorizontal}
          fill="none"
          stroke="url(#djvj-signal)"
          strokeWidth={8}
          strokeOpacity={0.2}
          strokeLinejoin="round"
          style={{ pathLength: reducedMotion ? 1 : drawH }}
        />
        <motion.path
          d={signalHorizontal}
          fill="none"
          stroke="url(#djvj-signal)"
          strokeWidth={2}
          strokeLinejoin="round"
          style={{ pathLength: reducedMotion ? 1 : drawH }}
        />
        {pulsing ? (
          <>
            <path
              d={signalHorizontal}
              pathLength={1}
              fill="none"
              stroke="#ffffff"
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.pulse}
            />
            <path
              d={signalHorizontal}
              pathLength={1}
              fill="none"
              stroke="#ffffff"
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(styles.pulse, styles.pulseLate)}
            />
          </>
        ) : null}
      </svg>

      <Deck side="dj" style={deckStyle(djX)} linked={isLinked} />

      <Equation
        linked={isLinked}
        knob={reducedMotion ? 135 : knob}
        drawTop={reducedMotion ? 1 : drawTop}
        drawBottom={reducedMotion ? 1 : drawBottom}
      />

      <Deck
        side="vj"
        style={deckStyle(vjX)}
        linked={isLinked}
        jolt={jolt && !reducedMotion}
        onJoltEnd={() => setJolt(false)}
      />
    </div>
  );
}

type DeckProps = {
  side: Side;
  style?: MotionStyle;
  linked: boolean;
  jolt?: boolean;
  onJoltEnd?: () => void;
};

/** Uma metade do palco: foto tratada + letra gigante + lista de canais. */
function Deck({ side, style, linked, jolt = false, onJoltEnd }: DeckProps) {
  const d = decks[side];
  const isDj = side === "dj";

  const handleAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onJoltEnd?.();
  };

  return (
    <motion.div style={style} className="group relative z-10">
      {/* Moldura RGB do VJ (canais deslocados) */}
      {!isDj ? (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-1 -translate-y-1 rounded-2xl border border-cyan/70 transition-transform duration-500 ease-out-expo group-hover:-translate-x-2 group-hover:-translate-y-1.5"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 translate-x-1 translate-y-1 rounded-2xl border border-magenta/60 transition-transform duration-500 ease-out-expo group-hover:translate-x-2 group-hover:translate-y-1.5"
          />
        </>
      ) : null}

      <div
        className={cn(
          "relative isolate aspect-[4/5] overflow-hidden rounded-2xl border bg-ink sm:aspect-[16/11] lg:aspect-auto lg:h-full lg:min-h-[max(30rem,min(36rem,calc(100svh_-_12rem)))]",
          isDj ? "border-magenta/35" : "border-cyan/35",
        )}
      >
        <div className={cn("absolute inset-0", jolt && styles.jolt)} onAnimationEnd={handleAnimationEnd}>
          <Image
            {...imageProps(d.photo)}
            alt={d.alt}
            sizes="(min-width: 1024px) 40vw, 100vw"
            className={cn(
              "h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]",
              isDj
                ? "object-[62%_50%] brightness-[.62] contrast-[1.1] saturate-[1.15]"
                : "object-[45%_50%] [filter:sepia(.6)_hue-rotate(172deg)_saturate(1.9)_brightness(.48)_contrast(1.3)]",
            )}
          />
        </div>

        {/* Gradação de cor e leitura do texto */}
        {isDj ? (
          <>
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(90%_70%_at_0%_100%,rgb(255_36_20/0.38),transparent_65%)]" />
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_60%_at_100%_0%,rgb(255_20_147/0.28),transparent_70%)]" />
          </>
        ) : (
          <>
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(90%_70%_at_100%_100%,rgb(0_102_255/0.4),transparent_65%)]" />
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_60%_at_0%_0%,rgb(0_229_255/0.22),transparent_70%)]" />
            <div aria-hidden className="scanlines absolute inset-0" />
          </>
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-void/70 via-void/10 to-void/85" />

        {/* OSD do deck */}
        <div
          aria-hidden
          className={cn(
            "hud absolute inset-x-5 top-5 flex items-center justify-between text-[0.65rem] text-white/85 sm:inset-x-7 sm:top-6",
            !isDj && "flex-row-reverse",
          )}
        >
          <span className="flex items-center gap-2">
            <span
              className={cn(
                "size-1.5 rounded-full transition-colors duration-500",
                linked ? (isDj ? "bg-magenta shadow-neon-magenta" : "bg-cyan shadow-neon-cyan") : "bg-white/30",
              )}
            />
            {d.deck}
          </span>
          <span className={isDj ? "text-magenta" : "text-cyan"}>
            {isDj ? `${d.channel} ▸` : `◂ ${d.channel}`}
          </span>
        </div>

        {/* Letra gigante */}
        <div className={cn("absolute inset-x-5 top-12 sm:inset-x-7 sm:top-14", !isDj && "text-right")}>
          <h3
            className={cn(
              "font-display text-[clamp(4.25rem,10vw,8.5rem)] leading-[0.85] font-black tracking-tight",
              isDj ? "text-red text-glow-red" : "text-transparent [-webkit-text-stroke:2px_var(--color-cyan)]",
            )}
          >
            {/* O texto do glitch (data-text) duplicaria o nome do título: o leitor de tela lê só o sr-only. */}
            <span className="sr-only">{d.title}</span>
            <span aria-hidden className={cn("glitch", !isDj && jolt && "is-glitching")} data-text={d.title}>
              {d.title}
            </span>
          </h3>
        </div>

        {/* Canais */}
        <ul
          className={cn(
            "absolute inset-x-5 bottom-5 flex flex-col gap-1.5 sm:inset-x-7 sm:bottom-7 sm:gap-2",
            !isDj && "items-end",
          )}
        >
          {d.words.map((word, i) => (
            <li key={word} className={cn("flex items-center gap-3", !isDj && "flex-row-reverse")}>
              <span aria-hidden className={cn("hud w-5 text-[0.6rem]", isDj ? "text-magenta" : "text-right text-cyan")}>
                {d.code}
                {i + 1}
              </span>
              <span
                aria-hidden
                className={cn(
                  "h-px w-4 transition-[width] duration-500 ease-out-expo group-hover:w-8",
                  isDj ? "bg-magenta/70" : "bg-cyan/70",
                )}
              />
              <span className="font-hud text-lg font-bold tracking-[0.2em] text-white uppercase sm:text-xl">{word}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

type EquationProps = {
  linked: boolean;
  knob: MotionValue<number> | number;
  drawTop: MotionValue<number> | number;
  drawBottom: MotionValue<number> | number;
};

/** Centro: SOM + IMAGEM = EXPERIÊNCIA, com o nó "=" em forma de knob. */
function Equation({ linked, knob, drawTop, drawBottom }: EquationProps) {
  return (
    <div className="relative z-30 flex flex-col items-center py-2 lg:w-60 lg:py-0 xl:w-64">
      <p className="sr-only">Som + imagem = experiência</p>

      {/* Conexão vertical (mobile): onda de áudio descendo do DJ */}
      <svg aria-hidden viewBox="0 0 40 112" className="h-24 w-10 overflow-visible lg:hidden">
        <defs>
          <linearGradient id="djvj-audio-v" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff2414" />
            <stop offset="1" stopColor="#ff1493" />
          </linearGradient>
        </defs>
        <motion.path
          d={signalAudioVertical}
          fill="none"
          stroke="url(#djvj-audio-v)"
          strokeWidth={1.75}
          strokeLinejoin="round"
          style={{ pathLength: drawTop }}
        />
      </svg>

      <div aria-hidden className="flex flex-col items-center gap-0.5 pt-3 lg:flex-1 lg:justify-end lg:pt-0 lg:pb-6">
        <span className="font-display text-2xl font-black text-magenta text-glow-magenta xl:text-3xl">SOM</span>
        <span className="font-display text-xl leading-none font-bold text-dim">+</span>
        <span className="font-display text-2xl font-black text-cyan text-glow-cyan xl:text-3xl">IMAGEM</span>
      </div>

      <Node linked={linked} knob={knob} />

      <div aria-hidden className="flex flex-col items-center gap-3 pt-5 pb-3 lg:flex-1 lg:justify-start lg:pt-6 lg:pb-0">
        <span
          className={cn(
            "font-display text-xl font-black tracking-wide text-white transition-[text-shadow] duration-700 lg:text-lg xl:text-2xl",
            linked && "text-glow-purple",
          )}
        >
          EXPERIÊNCIA
        </span>
        <span className="hud flex items-center gap-2 text-[0.62rem] text-mute">
          <span
            className={cn(
              "size-1.5 rounded-full transition-colors duration-500",
              linked ? "bg-cyan shadow-neon-cyan" : "bg-white/30",
            )}
          />
          {linked ? "Sync · live" : "Sync · ···"}
        </span>
      </div>

      {/* Conexão vertical (mobile): pulsos de vídeo descendo para o VJ */}
      <svg aria-hidden viewBox="0 0 40 112" className="h-24 w-10 overflow-visible lg:hidden">
        <defs>
          <linearGradient id="djvj-video-v" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#00e5ff" />
            <stop offset="1" stopColor="#0066ff" />
          </linearGradient>
        </defs>
        <motion.path
          d={signalVideoVertical}
          fill="none"
          stroke="url(#djvj-video-v)"
          strokeWidth={1.75}
          strokeLinejoin="round"
          style={{ pathLength: drawBottom }}
        />
      </svg>
    </div>
  );
}

/** Nó "=": um knob (símbolo da marca) cujo ponteiro gira com o scroll. */
function Node({ linked, knob }: { linked: boolean; knob: MotionValue<number> | number }) {
  const ticks = Array.from({ length: 11 }, (_, i) => -135 + i * 27);
  return (
    <div className="relative grid size-20 shrink-0 place-items-center xl:size-24">
      {linked ? (
        <span aria-hidden className={cn("absolute inset-0 rounded-full border border-purple/70", styles.nodeRing)} />
      ) : null}
      <div
        aria-hidden
        className={cn(
          "relative grid size-full place-items-center rounded-full border-2 bg-void transition-[border-color,box-shadow] duration-500",
          linked ? "border-white/90 shadow-neon-purple" : "border-line-strong",
        )}
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
          {ticks.map((deg) => (
            <line
              key={deg}
              x1="50"
              y1="7"
              x2="50"
              y2="13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              transform={`rotate(${deg} 50 50)`}
              className={linked ? "text-white/60" : "text-white/20"}
            />
          ))}
        </svg>
        <motion.span style={{ rotate: knob }} className="absolute inset-[18%] rounded-full">
          <span
            className={cn(
              "absolute top-0 left-1/2 h-2.5 w-[3px] -translate-x-1/2 rounded-full",
              linked ? "bg-white shadow-neon-magenta" : "bg-white/50",
            )}
          />
        </motion.span>
        <span className="font-display text-3xl leading-none font-black text-white xl:text-4xl">=</span>
      </div>
    </div>
  );
}
