import Image from "next/image";
import { Visualizer } from "@/components/Visualizer/Visualizer";
import { KnobIcon } from "@/components/ui/Icons";
import { cn, getImageMeta } from "@/lib/utils";
import styles from "./Flashback.module.css";

/** Cenários visuais da máquina do tempo. */
export type SceneKey = "synth" | "rave" | "y2k" | "now";

const ORDER: SceneKey[] = ["synth", "rave", "y2k", "now"];
const BY_YEAR: Record<string, SceneKey> = { "1980": "synth", "1990": "rave", "2000": "y2k", TODAY: "now" };

/** Década → cenário. Anos desconhecidos (ex.: uma nova década nos dados) ciclam pelos cenários. */
export function sceneFor(year: string, index: number): SceneKey {
  return BY_YEAR[year.trim().toUpperCase()] ?? ORDER[index % ORDER.length];
}

/** Cor de destaque (glows) e classe do rótulo de cada cenário. */
export const sceneTheme: Record<SceneKey, { acc: string; label: string }> = {
  synth: { acc: "var(--color-magenta)", label: "text-magenta text-glow-magenta" },
  rave: { acc: "var(--color-purple)", label: "text-purple text-glow-purple" },
  y2k: { acc: "var(--color-blue)", label: "text-cyan text-glow-cyan" },
  now: { acc: "var(--color-red)", label: "text-red text-glow-red" },
};

const IMG = {
  stage: "/images/art/betobrizz-neon-stage.webp",
  arena: "/images/art/betobrizz-arena.webp",
  crowd: "/images/events/betobrizz-pista-magenta.webp",
};

function Photo({ src, sizes, className, quality = 60 }: { src: string; sizes: string; className?: string; quality?: 60 | 75 }) {
  const { blurDataURL } = getImageMeta(src);
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes={sizes}
      quality={quality}
      className={cn("object-cover", className)}
      {...(blurDataURL ? { placeholder: "blur" as const, blurDataURL } : {})}
    />
  );
}

/* Posições determinísticas (sem Math.random no render). */
const BUBBLES = [
  { l: 8, t: 58, s: 16, d: 0 },
  { l: 22, t: 18, s: 9, d: -2 },
  { l: 72, t: 12, s: 12, d: -4 },
  { l: 82, t: 56, s: 18, d: -1 },
  { l: 60, t: 72, s: 8, d: -3 },
  { l: 36, t: 76, s: 11, d: -5 },
  { l: 90, t: 30, s: 6, d: -2.5 },
];
const SPARKS = [
  { l: 16, t: 34, s: 5, d: 0 },
  { l: 76, t: 36, s: 4, d: -1.2 },
  { l: 46, t: 14, s: 3.5, d: -0.6 },
  { l: 64, t: 84, s: 4, d: -1.8 },
];
const BEAMS = [
  { x: 12, r: 24, c: "var(--color-red)", d: 4.2 },
  { x: 30, r: -18, c: "var(--color-magenta)", d: 5.1 },
  { x: 50, r: 8, c: "var(--color-cyan)", d: 3.6 },
  { x: 70, r: 20, c: "var(--color-magenta)", d: 4.7 },
  { x: 88, r: -26, c: "var(--color-red)", d: 5.6 },
];

function Beams({ className }: { className?: string }) {
  return (
    <div className={cn(styles.lasers, className)}>
      {BEAMS.map((b) => (
        <span
          key={b.x}
          className={styles.beam}
          style={{ "--x": `${b.x}%`, "--r": `${b.r}deg`, "--c": b.c, "--d": `${b.d}s` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function Zigzag({ className, color }: { className?: string; color: string }) {
  const pts = Array.from({ length: 21 }, (_, i) => `${i * 10},${i % 2 ? 4 : 16}`).join(" ");
  return (
    <svg viewBox="0 0 200 20" preserveAspectRatio="none" className={className}>
      <polyline points={pts} fill="none" style={{ stroke: color }} strokeWidth="2.2" strokeLinejoin="miter" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ==========================================================================
   Tela da TV — o "canal" de cada década
   ========================================================================== */

export function SceneScreen({ scene }: { scene: SceneKey }) {
  switch (scene) {
    case "synth":
      return (
        <div className={styles.scrSynth}>
          <span className={styles.stars} />
          <span className={styles.sun} />
          <svg viewBox="0 0 400 60" preserveAspectRatio="none" className={styles.mountains}>
            <polygon
              points="0,60 0,42 30,30 58,40 92,14 124,36 150,28 178,44 206,20 238,38 262,26 296,42 322,16 352,34 376,24 400,36 400,60"
              fill="#0c0216"
              stroke="rgb(255 20 147 / 0.7)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className={styles.floor} />
        </div>
      );
    case "rave":
      return (
        <div className={styles.scrRave}>
          <div className={styles.checker} />
          <Zigzag className={cn(styles.zig, "top-[14%]")} color="var(--color-cyan)" />
          <Zigzag className={cn(styles.zig, "top-[20%] opacity-70")} color="var(--color-magenta)" />
          <svg viewBox="0 0 100 100" className={cn(styles.tri, "top-[34%] left-[12%] w-[18%]")}>
            <polygon points="50,6 94,90 6,90" fill="none" stroke="#fff" strokeWidth="5" />
          </svg>
          <svg viewBox="0 0 100 100" className={cn(styles.tri, styles.triAlt, "top-[30%] right-[14%] w-[13%]")}>
            <polygon points="50,6 94,90 6,90" fill="none" stroke="var(--color-cyan)" strokeWidth="7" />
          </svg>
          <span className={styles.tracking} />
          <span className={cn(styles.tracking, styles.trackingThin)} />
        </div>
      );
    case "y2k":
      return (
        <div className={styles.scrY2k}>
          {BUBBLES.map((b) => (
            <span
              key={`${b.l}-${b.t}`}
              className={styles.bubble}
              style={{ left: `${b.l}%`, top: `${b.t}%`, width: `${b.s}%`, animationDelay: `${b.d}s` }}
            />
          ))}
          <span className={styles.orb} />
          <span className={styles.chromeRing} />
          {SPARKS.map((s) => (
            <span
              key={`${s.l}-${s.t}`}
              className={styles.spark}
              style={{ left: `${s.l}%`, top: `${s.t}%`, width: `${s.s}%`, animationDelay: `${s.d}s` }}
            />
          ))}
        </div>
      );
    case "now":
      return (
        <div className="absolute inset-0 bg-void">
          <Photo src={IMG.crowd} sizes="(min-width: 1024px) 40vw, 90vw" quality={75} className="object-[50%_42%]" />
          <div className={styles.nowTint} />
          <Beams />
          <div className={styles.ledDots} />
          <div className="absolute inset-x-[8%] bottom-[17%] opacity-90">
            <Visualizer bars={26} height="clamp(1.5rem, 9cqi, 3.5rem)" palette="red" />
          </div>
        </div>
      );
  }
}

/* ==========================================================================
   Fundo de tela cheia do palco
   ========================================================================== */

export function SceneBackdrop({ scene }: { scene: SceneKey }) {
  switch (scene) {
    case "synth":
      return (
        <div className={cn(styles.bd, styles.bdSynth)}>
          <Photo src={IMG.stage} sizes="100vw" className={cn("object-[50%_85%]", styles.bdPhoto)} />
          <span className={styles.bdSunGlow} />
          <div className={styles.bdGrid} />
        </div>
      );
    case "rave":
      return (
        <div className={cn(styles.bd, styles.bdRave)}>
          <div className={styles.bdChecker} />
          <Zigzag className={cn(styles.bdZig, "top-[18%]")} color="rgb(0 229 255 / 0.35)" />
          <Zigzag className={cn(styles.bdZig, "top-[24%]")} color="rgb(255 20 147 / 0.25)" />
          <span className={styles.bdTracking} />
        </div>
      );
    case "y2k":
      return (
        <div className={cn(styles.bd, styles.bdY2k)}>
          <span className={styles.bdSheen} />
          {BUBBLES.slice(0, 5).map((b) => (
            <span
              key={`${b.l}-${b.t}`}
              className={cn(styles.bubble, styles.bdBubble)}
              style={{ left: `${(b.l * 7) % 100}%`, top: `${b.t}%`, width: `${b.s * 0.45}vw`, animationDelay: `${b.d}s` }}
            />
          ))}
        </div>
      );
    case "now":
      return (
        <div className={cn(styles.bd, styles.bdNow)}>
          <Photo src={IMG.arena} sizes="100vw" className={styles.bdPhoto} />
          <Beams className={styles.bdBeams} />
          <div className={cn(styles.ledDots, styles.bdLed)} />
        </div>
      );
  }
}

/* ==========================================================================
   Mídia física de cada década (fita, CD, MP3 player, jog wheel)
   ========================================================================== */

export function SceneProp({ scene, year }: { scene: SceneKey; year: string }) {
  switch (scene) {
    case "synth":
      return <Cassette year={year} />;
    case "rave":
      return <HoloCd year={year} />;
    case "y2k":
      return <Mp3Player year={year} />;
    case "now":
      return <JogWheel />;
  }
}

/** Largura relativa de cada objeto (em % da coluna da TV). */
export const propWidth: Record<SceneKey, string> = {
  synth: "w-[38%]",
  rave: "w-[30%]",
  y2k: "w-[19%]",
  now: "w-[30%]",
};

function Cassette({ year }: { year: string }) {
  return (
    <svg viewBox="0 0 240 152" className={styles.cassette}>
      <defs>
        <linearGradient id="bbfx-cas-body" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#2a2635" />
          <stop offset="1" stopColor="#0d0b13" />
        </linearGradient>
        <clipPath id="bbfx-cas-window">
          <rect x="62" y="46" width="116" height="30" rx="15" />
        </clipPath>
      </defs>
      <rect x="3" y="3" width="234" height="146" rx="12" fill="url(#bbfx-cas-body)" stroke="rgb(255 255 255 / 0.16)" strokeWidth="1.2" />
      {/* etiqueta */}
      <rect x="16" y="13" width="208" height="90" rx="6" fill="#121019" stroke="rgb(255 255 255 / 0.08)" />
      <rect x="16" y="80" width="208" height="6" style={{ fill: "var(--color-magenta)" }} />
      <rect x="16" y="86" width="208" height="4" style={{ fill: "var(--color-red)" }} />
      <rect x="16" y="90" width="208" height="3" style={{ fill: "var(--color-purple)" }} />
      <text x="28" y="33" fill="#fff" style={{ fontFamily: "var(--font-orbitron), sans-serif" }} fontWeight="900" fontSize="13" letterSpacing="1.5">
        BETOBRIZZ
      </text>
      <text x="212" y="33" textAnchor="end" fill="rgb(255 255 255 / 0.6)" style={{ fontFamily: "var(--font-rajdhani), sans-serif" }} fontWeight="700" fontSize="10" letterSpacing="2">
        SIDE A
      </text>
      <text x="28" y="72" style={{ fill: "var(--color-magenta)", fontFamily: "var(--font-vt323), monospace" }} fontSize="15" letterSpacing="1">
        MIX {year}
      </text>
      <text x="212" y="72" textAnchor="end" fill="rgb(255 255 255 / 0.45)" style={{ fontFamily: "var(--font-vt323), monospace" }} fontSize="13">
        C-90
      </text>
      {/* janela + fita */}
      <rect x="62" y="46" width="116" height="30" rx="15" fill="#07060a" />
      <g clipPath="url(#bbfx-cas-window)">
        <circle cx="90" cy="61" r="23" fill="#2b1810" />
        <circle cx="150" cy="61" r="14" fill="#2b1810" />
      </g>
      <rect x="62" y="46" width="116" height="30" rx="15" fill="none" stroke="rgb(255 255 255 / 0.22)" />
      {[90, 150].map((cx) => (
        <g key={cx} className={styles.reel}>
          <circle cx={cx} cy="61" r="9" fill="#ece8f3" />
          <circle cx={cx} cy="61" r="4.2" fill="#07060a" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <rect key={a} x={cx - 1} y="52.6" width="2" height="3.2" fill="#07060a" transform={`rotate(${a} ${cx} 61)`} />
          ))}
        </g>
      ))}
      {/* parafusos */}
      {[
        [12, 12],
        [228, 12],
        [12, 140],
        [228, 140],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="3.4" fill="#1c1924" stroke="rgb(0 0 0 / 0.7)" />
          <path d={`M${x - 2} ${y}H${x + 2}`} stroke="rgb(255 255 255 / 0.3)" strokeWidth="0.8" />
        </g>
      ))}
      {/* base trapezoidal */}
      <path d="M56 149 L67 116 H173 L184 149 Z" fill="#17141f" stroke="rgb(255 255 255 / 0.1)" />
      <circle cx="86" cy="134" r="4" fill="#07060a" />
      <circle cx="154" cy="134" r="4" fill="#07060a" />
      <rect x="108" y="128" width="24" height="10" rx="2" fill="#07060a" />
    </svg>
  );
}

function HoloCd({ year }: { year: string }) {
  const ring = `BETOBRIZZ • DANCE MIX ${year} • MUSIC VIDEO ENTERTAINMENT • `;
  return (
    <div className={styles.cd}>
      <svg viewBox="0 0 200 200" className={styles.cdPrint}>
        <defs>
          <path id="bbfx-cd-ring" d="M100,100 m-64,0 a64,64 0 1,1 128,0 a64,64 0 1,1 -128,0" />
        </defs>
        <text fill="rgb(255 255 255 / 0.85)" style={{ fontFamily: "var(--font-rajdhani), sans-serif" }} fontWeight="700" fontSize="10.5" letterSpacing="2.2">
          <textPath href="#bbfx-cd-ring">{ring}</textPath>
        </text>
      </svg>
      <span className={styles.cdHub} />
    </div>
  );
}

function Mp3Player({ year }: { year: string }) {
  return (
    <div className={styles.mp3}>
      <div className={styles.mp3Screen}>
        <span className={styles.mp3Line}>▶ NOW PLAYING</span>
        <span className={styles.mp3Title}>{year} HITS</span>
        <span className={styles.mp3Eq}>
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} style={{ animationDelay: `${-i * 0.17}s` }} />
          ))}
        </span>
        <span className={styles.mp3Bar} />
      </div>
      <div className={styles.wheel}>
        <span className={cn(styles.wheelLabel, "top-[7%] left-1/2 -translate-x-1/2")}>MENU</span>
        <span className={cn(styles.wheelLabel, "top-1/2 left-[9%] -translate-y-1/2")}>◀◀</span>
        <span className={cn(styles.wheelLabel, "top-1/2 right-[9%] -translate-y-1/2")}>▶▶</span>
        <span className={cn(styles.wheelLabel, "bottom-[7%] left-1/2 -translate-x-1/2")}>▶❚❚</span>
        <span className={styles.wheelBtn} />
      </div>
    </div>
  );
}

function JogWheel() {
  return (
    <div className={styles.jog}>
      <span className={styles.jogRing} />
      <span className={styles.jogPlatter} />
      <span className={styles.jogCenter}>
        <KnobIcon className="size-[46%] text-red" />
      </span>
    </div>
  );
}
