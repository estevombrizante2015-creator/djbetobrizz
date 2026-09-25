"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type AnimationEvent, type RefObject } from "react";
import { useInView, useMotionValueEvent, useScroll } from "motion/react";
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

/** Progresso a partir do qual as duas metades estão "conectadas". */
const LINK_AT = 0.9;

/** Janela do scroll: começa com o topo do palco a 95% da tela e termina com o centro a 58%. */
const START = 0.95;
const END = 0.58;

/**
 * Palco dividido DJ | = | VJ.
 * - Desktop no modo completo: conforme o scroll as metades se aproximam, o sinal (onda de áudio →
 *   pulsos de vídeo) atravessa o nó "=" e o VJ recebe um glitch RGB único (ver <ScrollLink/>).
 * - Modo leve (celular, tablet, PC simples), movimento reduzido e SSR: já nasce conectado e parado —
 *   nenhum JavaScript ligado ao scroll. Mobile: empilhado, com a conexão na vertical.
 */
export function DjVjStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const { isDesktop, reducedMotion } = useExperience();
  const animated = isDesktop && !reducedMotion;

  // O markup é sempre o estado final (conectado). No desktop completo o <ScrollLink/> move
  // decks, traçado e knob direto no DOM (data-deck / data-draw / data-knob).
  const [linked, setLinked] = useState(true);
  const [inView, setInView] = useState(false);
  const [jolt, setJolt] = useState(false);
  const linkedRef = useRef(true);

  // Só muda de estado ao CRUZAR o ponto de conexão (nunca por frame).
  const onLinkedChange = useCallback((next: boolean, withJolt: boolean) => {
    if (next === linkedRef.current) return;
    linkedRef.current = next;
    setLinked(next);
    if (next && withJolt) setJolt(true);
  }, []);

  const pulsing = animated && linked && inView;

  return (
    <div
      ref={stageRef}
      className="relative mt-10 grid sm:mt-14 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]"
    >
      {animated ? (
        <ScrollLink target={stageRef} onLinkedChange={onLinkedChange} onInViewChange={setInView} />
      ) : null}

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
        {/* pathLength 1 + dasharray "1 1": desenhado por inteiro; o ScrollLink recua o dashoffset */}
        <path
          data-draw=""
          d={signalHorizontal}
          pathLength={1}
          strokeDasharray="1 1"
          fill="none"
          stroke="url(#djvj-signal)"
          strokeWidth={8}
          strokeOpacity={0.2}
          strokeLinejoin="round"
        />
        <path
          data-draw=""
          d={signalHorizontal}
          pathLength={1}
          strokeDasharray="1 1"
          fill="none"
          stroke="url(#djvj-signal)"
          strokeWidth={2}
          strokeLinejoin="round"
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

      <Deck side="dj" linked={linked} />

      <Equation linked={linked} pulsing={pulsing} />

      <Deck
        side="vj"
        linked={linked}
        jolt={jolt && animated}
        onJoltEnd={() => setJolt(false)}
      />
    </div>
  );
}

type ScrollLinkProps = {
  target: RefObject<HTMLDivElement | null>;
  onLinkedChange: (linked: boolean, withJolt: boolean) => void;
  onInViewChange: (inView: boolean) => void;
};

/** Interpolação linear limitada (como o useTransform com clamp). */
function mix(v: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const t = Math.min(1, Math.max(0, (v - inMin) / (inMax - inMin)));
  return outMin + (outMax - outMin) * t;
}

/**
 * Pinta o palco para um progresso — só ESCRITAS de estilo (nenhuma leitura de layout), em
 * transform/opacity/dashoffset. `reset` devolve o markup ao estado final estático.
 */
function stagePainter(stage: HTMLElement) {
  const decks = Array.from(stage.querySelectorAll<HTMLElement>("[data-deck]"));
  const draws = Array.from(stage.querySelectorAll<SVGPathElement>("[data-draw]"));
  const knob = stage.querySelector<HTMLElement>("[data-knob]");
  for (const el of decks) el.style.willChange = "transform, opacity";
  return {
    apply(v: number) {
      const x = mix(v, 0, 0.75, 120, 0);
      const opacity = String(mix(v, 0, 0.55, 0.3, 1));
      for (const el of decks) {
        el.style.transform = `translateX(${el.dataset.deck === "dj" ? -x : x}px)`;
        el.style.opacity = opacity;
      }
      const offset = String(1 - mix(v, 0.25, LINK_AT, 0, 1));
      for (const el of draws) el.style.strokeDashoffset = offset;
      if (knob) knob.style.rotate = `${mix(v, 0, LINK_AT, -135, 135)}deg`;
    },
    reset() {
      for (const el of decks) {
        el.style.transform = "";
        el.style.opacity = "";
        el.style.willChange = "";
      }
      for (const el of draws) el.style.strokeDashoffset = "";
      if (knob) knob.style.rotate = "";
    },
  };
}

/** Progresso inicial calculado da geometria (o useScroll só mede no frame seguinte). */
function measureProgress(el: HTMLElement) {
  const { top, height } = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const span = (START - END) * vh + height / 2;
  return Math.min(1, Math.max(0, (START * vh - top) / span));
}

/**
 * Liga o palco ao scroll — montado SÓ no desktop no modo completo, então o modo leve não tem
 * nenhum listener de scroll aqui. Não renderiza nada: pinta o DOM a cada mudança do scroll
 * (dentro do frame do motion) e só mexe no estado React nas mudanças discretas
 * (conectou/desconectou, entrou/saiu da tela).
 */
function ScrollLink({ target, onLinkedChange, onInViewChange }: ScrollLinkProps) {
  const { scrollYProgress } = useScroll({ target, offset: [`start ${START}`, `center ${END}`] });
  const inView = useInView(target, { amount: 0.1 });
  const paintRef = useRef<((v: number) => void) | null>(null);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    paintRef.current?.(v);
    onLinkedChange(v >= LINK_AT, true);
  });

  useEffect(() => {
    const stage = target.current;
    if (!stage) return;
    const painter = stagePainter(stage);
    paintRef.current = painter.apply;
    const v = measureProgress(stage);
    painter.apply(v);
    onLinkedChange(v >= LINK_AT, false);
    // Se o nível cair para "lite", volta ao estado estático (conectado).
    return () => {
      paintRef.current = null;
      painter.reset();
      onLinkedChange(true, false);
    };
  }, [target, onLinkedChange]);

  useEffect(() => {
    onInViewChange(inView);
  }, [inView, onInViewChange]);

  return null;
}

type DeckProps = {
  side: Side;
  linked: boolean;
  jolt?: boolean;
  onJoltEnd?: () => void;
};

/** Uma metade do palco: foto tratada + letra gigante + lista de canais. */
function Deck({ side, linked, jolt = false, onJoltEnd }: DeckProps) {
  const d = decks[side];
  const isDj = side === "dj";

  const handleAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onJoltEnd?.();
  };

  return (
    <div data-deck={side} className="group relative z-10">
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
          // Celular: quadrado; tablet: 16/9 (palco mais baixo); desktop: altura da tela.
          "relative isolate aspect-square overflow-hidden rounded-2xl border bg-ink sm:aspect-[16/9] lg:aspect-auto lg:h-full lg:min-h-[max(30rem,min(36rem,calc(100svh_-_12rem)))]",
          isDj ? "border-magenta/35" : "border-cyan/35",
        )}
      >
        <div className={cn("absolute inset-0", jolt && styles.jolt)} onAnimationEnd={handleAnimationEnd}>
          <Image
            {...imageProps(d.photo)}
            alt={d.alt}
            quality={60}
            sizes="(min-width: 1280px) 480px, (min-width: 1024px) 36vw, 100vw"
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
    </div>
  );
}

type EquationProps = {
  linked: boolean;
  /** Anel pulsante do nó (só no modo completo, com o palco na tela). */
  pulsing: boolean;
};

/** Centro: SOM + IMAGEM = EXPERIÊNCIA, com o nó "=" em forma de knob. */
function Equation({ linked, pulsing }: EquationProps) {
  return (
    <div className="relative z-30 flex flex-col items-center py-1 lg:w-60 lg:py-0 xl:w-64">
      <p className="sr-only">Som + imagem = experiência</p>

      {/* Conexão vertical (celular/tablet — sempre estática): onda de áudio descendo do DJ */}
      <svg aria-hidden viewBox="0 0 40 112" className="h-16 w-10 overflow-visible lg:hidden">
        <defs>
          <linearGradient id="djvj-audio-v" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff2414" />
            <stop offset="1" stopColor="#ff1493" />
          </linearGradient>
        </defs>
        <path d={signalAudioVertical} fill="none" stroke="url(#djvj-audio-v)" strokeWidth={1.75} strokeLinejoin="round" />
      </svg>

      {/* Celular/tablet: SOM + IMAGEM numa linha (palco mais curto); desktop: empilhado */}
      <div
        aria-hidden
        className="flex items-center gap-2.5 pt-2 pb-3 lg:flex-1 lg:flex-col lg:justify-end lg:gap-0.5 lg:pt-0 lg:pb-6"
      >
        <span className="font-display text-2xl font-black text-magenta text-glow-magenta xl:text-3xl">SOM</span>
        <span className="font-display text-xl leading-none font-bold text-dim">+</span>
        <span className="font-display text-2xl font-black text-cyan text-glow-cyan xl:text-3xl">IMAGEM</span>
      </div>

      <Node linked={linked} pulsing={pulsing} />

      <div aria-hidden className="flex flex-col items-center gap-2 pt-4 pb-2 lg:flex-1 lg:justify-start lg:gap-3 lg:pt-6 lg:pb-0">
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

      {/* Conexão vertical (celular/tablet — sempre estática): pulsos de vídeo descendo para o VJ */}
      <svg aria-hidden viewBox="0 0 40 112" className="h-16 w-10 overflow-visible lg:hidden">
        <defs>
          <linearGradient id="djvj-video-v" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#00e5ff" />
            <stop offset="1" stopColor="#0066ff" />
          </linearGradient>
        </defs>
        <path d={signalVideoVertical} fill="none" stroke="url(#djvj-video-v)" strokeWidth={1.75} strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/** Ângulos das 11 marcas do knob, como um único path (menos nós no DOM). */
const KNOB_TICKS = Array.from({ length: 11 }, (_, i) => {
  const rad = ((-135 + i * 27 - 90) * Math.PI) / 180;
  const p = (r: number) => `${(50 + r * Math.cos(rad)).toFixed(2)} ${(50 + r * Math.sin(rad)).toFixed(2)}`;
  return `M${p(43)} L${p(37)}`;
}).join(" ");

/** Nó "=": um knob (símbolo da marca) já no máximo; no desktop completo o ponteiro gira com o scroll. */
function Node({ linked, pulsing }: { linked: boolean; pulsing: boolean }) {
  return (
    <div className="relative grid size-20 shrink-0 place-items-center xl:size-24">
      {linked ? (
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-full border border-purple/70",
            pulsing ? styles.nodeRing : styles.nodeRingStatic,
          )}
        />
      ) : null}
      <div
        aria-hidden
        className={cn(
          "relative grid size-full place-items-center rounded-full border-2 bg-void transition-[border-color,box-shadow] duration-500",
          linked ? "border-white/90 shadow-neon-purple" : "border-line-strong",
        )}
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
          <path
            d={KNOB_TICKS}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={linked ? "text-white/60" : "text-white/20"}
          />
        </svg>
        <span data-knob="" className="absolute inset-[18%] rotate-[135deg] rounded-full">
          <span
            className={cn(
              "absolute top-0 left-1/2 h-2.5 w-[3px] -translate-x-1/2 rounded-full",
              linked ? "bg-white shadow-neon-magenta" : "bg-white/50",
            )}
          />
        </span>
        <span className="font-display text-3xl leading-none font-black text-white xl:text-4xl">=</span>
      </div>
    </div>
  );
}
