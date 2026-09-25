import { siteConfig } from "@/config/site";
import { phrases, pillars, type Accent } from "@/data/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { KnobIcon } from "@/components/ui/Icons";
import { Visualizer } from "@/components/Visualizer/Visualizer";
import { cn } from "@/lib/utils";
import { PauseOffscreen } from "./PauseOffscreen";
import styles from "./TheExperience.module.css";

type VisualKind = "sound" | "visual" | "energy";
const visualKinds: VisualKind[] = ["sound", "visual", "energy"];

/** Escolhe o mini visual pelo título do pilar (ou pela posição, para pilares novos). */
function visualFor(title: string, index: number): VisualKind {
  const key = title.trim().toLowerCase();
  return visualKinds.find((k) => k === key) ?? visualKinds[index % visualKinds.length];
}

const accents: Record<
  Accent,
  {
    text: string;
    led: string;
    bar: string;
    /** Filete de cor no topo do canal (código de cor da mesa). */
    edge: string;
    hover: string;
    stroke: string;
    palette: "neon" | "red" | "cyan";
  }
> = {
  magenta: {
    text: "text-magenta",
    led: "bg-magenta shadow-neon-magenta",
    bar: "bg-magenta shadow-neon-magenta",
    edge: "via-magenta",
    hover: "hover:border-magenta/55 hover:shadow-[0_24px_70px_-28px_rgb(255_20_147/0.75)]",
    stroke: "group-hover:[-webkit-text-stroke-color:var(--color-magenta)]",
    palette: "red",
  },
  cyan: {
    text: "text-cyan",
    led: "bg-cyan shadow-neon-cyan",
    bar: "bg-cyan shadow-neon-cyan",
    edge: "via-cyan",
    hover: "hover:border-cyan/55 hover:shadow-[0_24px_70px_-28px_rgb(0_229_255/0.7)]",
    stroke: "group-hover:[-webkit-text-stroke-color:var(--color-cyan)]",
    palette: "cyan",
  },
  purple: {
    text: "text-purple",
    led: "bg-purple shadow-neon-purple",
    bar: "bg-purple shadow-neon-purple",
    edge: "via-purple",
    hover: "hover:border-purple/60 hover:shadow-[0_24px_70px_-28px_rgb(138_43_226/0.8)]",
    stroke: "group-hover:[-webkit-text-stroke-color:var(--color-purple)]",
    palette: "neon",
  },
  blue: {
    text: "text-blue",
    led: "bg-blue shadow-neon-cyan",
    bar: "bg-blue shadow-neon-cyan",
    edge: "via-blue",
    hover: "hover:border-blue/60 hover:shadow-[0_24px_70px_-28px_rgb(0_102_255/0.8)]",
    stroke: "group-hover:[-webkit-text-stroke-color:var(--color-blue)]",
    palette: "cyan",
  },
  red: {
    text: "text-red",
    led: "bg-red shadow-neon-red",
    bar: "bg-red shadow-neon-red",
    edge: "via-red",
    hover: "hover:border-red/55 hover:shadow-[0_24px_70px_-28px_rgb(255_36_20/0.75)]",
    stroke: "group-hover:[-webkit-text-stroke-color:var(--color-red)]",
    palette: "red",
  },
};

/** Frase principal (SOUND. VISUAL. ENERGY.) — derivada dos pilares se não estiver nas frases. */
const statement =
  phrases.find((p) => /^sound\.\s*visual\.\s*energy\.?$/i.test(p)) ?? pillars.map((p) => `${p.title}.`).join(" ");
const closing = phrases.find((p) => /experience is everything/i.test(p));
const marqueeItems = closing ? [statement, closing] : [statement];

/**
 * THE EXPERIENCE (conceito): os três pilares (SOUND / VISUAL / ENERGY) como
 * canais de uma mesa, cada um com um mini visual ao vivo.
 */
export function TheExperience() {
  return (
    <section id="the-experience" aria-labelledby="the-experience-title" className="relative isolate overflow-hidden">
      <PauseOffscreen className="relative pb-20 md:pb-28 xl:pb-36">
        <Marquee />

        {/* Piso retrô anos 80 + horizonte */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[20rem]">
          <div className="absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_30%)]">
            <div className="absolute inset-0 -scale-y-100">
              <div className="retro-grid absolute -inset-x-1/4 top-0 h-[140%] opacity-35 motion-reduce:animate-none lg:[@media(hover:hover)]:animate-grid" />
            </div>
          </div>
          <div className="absolute inset-x-0 top-[30%] h-px bg-gradient-to-r from-transparent via-magenta/40 to-transparent" />
          <div className="absolute inset-x-0 top-[30%] h-40 -translate-y-1/2 bg-[radial-gradient(45%_50%_at_50%_50%,rgb(138_43_226/0.22),transparent)]" />
        </div>

        <div className="container-bb pt-16 md:pt-24 xl:pt-28">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12">
            <SectionHeading
              id="the-experience-title"
              kicker="// O conceito"
              title="The Experience"
              subtitle={siteConfig.experienceName}
              accent="cyan"
            />
            <Reveal step={2}>
              <p className="flex flex-col gap-1.5 border-l-2 border-line-strong pl-4 font-hud text-base font-bold tracking-[0.16em] text-white uppercase sm:text-lg lg:border-l-0 lg:pl-0 lg:text-right">
                <span>
                  <span className="text-magenta">Som</span> que envolve.
                </span>
                <span>
                  <span className="text-cyan">Imagem</span> que impressiona.
                </span>
                <span>
                  <span className="text-red">Energia</span> que permanece.
                </span>
              </p>
            </Reveal>
          </div>

          <ul className="mt-12 grid gap-5 md:mt-16 md:grid-cols-3 lg:gap-6">
            {pillars.map((pillar, i) => (
              <li key={pillar.title}>
                <Reveal className="h-full">
                  <PillarTile
                    index={i}
                    title={pillar.title}
                    text={pillar.text}
                    accent={pillar.accent}
                    kind={visualFor(pillar.title, i)}
                  />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </PauseOffscreen>
    </section>
  );
}

/** Faixa com a frase em loop — o knob da marca separa as frases. */
function Marquee() {
  const run = [...marqueeItems, ...marqueeItems];
  return (
    <div className="relative border-y border-line bg-ink/80 py-4 sm:py-6">
      <p className="sr-only">{marqueeItems.join(" ")}</p>
      <div aria-hidden className="overflow-hidden">
        <div className={cn("flex w-max", styles.marquee)}>
          {[0, 1].map((half) => (
            <div key={half} className="flex shrink-0 items-center">
              {run.map((text, i) => (
                <span key={`${half}-${i}`} className="flex items-center">
                  <span
                    className={cn(
                      "px-5 font-display text-[clamp(1.6rem,4.6vw,3.75rem)] leading-none font-black tracking-tight whitespace-nowrap uppercase sm:px-9",
                      i % 2 === 0 ? "text-white" : "text-outline",
                    )}
                  >
                    {text}
                  </span>
                  <KnobIcon size={30} className="shrink-0 text-red" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type PillarProps = { index: number; title: string; text: string; accent: Accent; kind: VisualKind };

/** Um pilar como "channel strip": cabeçalho HUD, monitor ao vivo, número gigante e título. */
function PillarTile({ index, title, text, accent, kind }: PillarProps) {
  const a = accents[accent];
  const num = String(index + 1).padStart(2, "0");

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-panel to-ink p-4 sm:p-5",
        "transition-[transform,border-color,box-shadow] duration-500 ease-out-expo hover:-translate-y-2",
        a.hover,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100",
          a.edge,
        )}
      />

      {/* Cabeçalho do canal */}
      <div aria-hidden className="hud flex items-center justify-between text-[0.62rem] text-mute">
        <span>
          CH {num} <span className={a.text}>·</span> {kind}
        </span>
        <span className="flex items-center gap-1.5">
          <span className={cn("size-1.5 animate-pulse-glow rounded-full", a.led)} />
          On
        </span>
      </div>

      {/* Monitor com o mini visual */}
      <div
        aria-hidden
        className="relative mt-3 h-32 overflow-hidden rounded-xl border border-line bg-void shadow-[inset_0_0_30px_rgb(0_0_0/0.9)] sm:h-36"
      >
        {kind === "sound" ? <SoundVisual palette={a.palette} /> : null}
        {kind === "visual" ? <CrtVisual /> : null}
        {kind === "energy" ? <EnergyVisual /> : null}
        <div className="scanlines pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 rounded-xl shadow-[inset_0_0_24px_6px_rgb(0_0_0/0.7)]" />
      </div>

      {/* Número gigante do canal */}
      <span
        aria-hidden
        className={cn(
          "text-outline pointer-events-none absolute right-4 bottom-2 font-display text-[4.5rem] leading-none font-black opacity-20 transition-[opacity,-webkit-text-stroke-color] duration-500 group-hover:opacity-60 sm:right-5 sm:text-[5.25rem] md:text-[3.5rem] lg:text-[4.25rem] xl:text-[5.25rem]",
          a.stroke,
        )}
      >
        {num}
      </span>

      {/* Texto */}
      <div className="relative mt-7 flex flex-1 flex-col">
        <h3 className="relative font-display text-[clamp(1.85rem,3.1vw,2.75rem)] leading-none font-black tracking-tight uppercase">
          <span className="sr-only">{title}</span>
          <span aria-hidden className="glitch" data-text={title}>
            {title}
          </span>
        </h3>
        <p className="relative mt-3 text-base text-mute sm:text-lg">{text}</p>
        <div className="mt-auto pt-7">
          <span
            aria-hidden
            className={cn("block h-0.5 w-10 transition-[width] duration-700 ease-out-expo group-hover:w-full", a.bar)}
          />
        </div>
      </div>
    </div>
  );
}

/** SOUND: spectrum espelhado (onda) — pausa sozinho fora da tela. */
function SoundVisual({ palette }: { palette: "neon" | "red" | "cyan" }) {
  return (
    <div className="absolute inset-0 flex items-center px-4">
      <span className="absolute inset-x-3 top-1/2 h-px bg-white/10" />
      <Visualizer bars={30} height="72%" palette={palette} mirror />
      <span className="hud absolute top-2 left-3 text-[0.55rem] text-white/60">L · R</span>
      <span className="hud absolute top-2 right-3 text-[0.55rem] text-white/60">Mix</span>
    </div>
  );
}

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** VISUAL: mini CRT com barras de cor, estática e faixa de rolagem. */
function CrtVisual() {
  return (
    <div className="absolute inset-2 overflow-hidden rounded-[1rem/1.35rem] bg-void">
      <div className={cn(styles.bars, "opacity-75")}>
        <div className={styles.barsTop}>
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
        <div className={styles.barsBottom}>
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
      </div>
      <div
        className={cn("absolute -inset-[10%] mix-blend-overlay", styles.static)}
        style={{ backgroundImage: NOISE, backgroundSize: "120px 120px" }}
      />
      <div className={styles.roll} />
      <div className="absolute inset-0 shadow-[inset_0_0_28px_8px_rgb(0_0_0/0.75)]" />
      <span className="vhs absolute top-1.5 left-3 text-base text-white">CH 02</span>
      <span className="vhs absolute top-1.5 right-3 text-base text-white">▶ Play</span>
    </div>
  );
}

/** ENERGY: strobe pulsando no tempo (~123 BPM) + medidores de LED L/R. */
function EnergyVisual() {
  const rings = [
    { scale: 0.55, delay: "0s" },
    { scale: 0.85, delay: "-0.65s" },
    { scale: 1.15, delay: "-1.3s" },
  ];
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-5 px-5 sm:gap-7 md:gap-4 md:px-4 xl:gap-7 xl:px-5">
      <div className="relative size-20 shrink-0 sm:size-24 md:size-16 lg:size-20 xl:size-24">
        {rings.map((r) => (
          <span
            key={r.delay}
            className={styles.ring}
            style={{ "--ring-scale": r.scale, "--ring-delay": r.delay } as React.CSSProperties}
          />
        ))}
        <span className={cn("absolute inset-[36%] rounded-full bg-red shadow-neon-red", styles.beat)} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:max-w-[11rem]">
        {["L", "R"].map((channel, k) => (
          <div key={channel} className="flex items-center gap-2">
            <span className="hud w-2 shrink-0 text-[0.55rem] text-white/60">{channel}</span>
            <div className="relative h-3 flex-1">
              <span className={cn("absolute inset-0", styles.meterBar)} />
              <span className={cn("bg-void/85", styles.meterCover, k === 1 && styles.meterCoverAlt)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
