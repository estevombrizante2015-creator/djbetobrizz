import { cn } from "@/lib/utils";

/** Hash FNV-1a (32 bits) — mesma string, mesma forma de onda (sem hydration mismatch). */
export function hashString(value: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** PRNG determinístico (mulberry32). */
function prng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Picos de uma "mix" fake: intro e outro mais baixas, seções com energia diferente,
 * quebras curtas e variação por batida.
 */
export function waveformPeaks(seedText: string, count: number) {
  const rand = prng(hashString(seedText));
  const sections = 6 + Math.floor(rand() * 4);
  const levels = Array.from({ length: sections }, (_, i) =>
    i === 0 || i === sections - 1 ? 0.35 + rand() * 0.2 : 0.55 + rand() * 0.45,
  );
  const raw = Array.from({ length: count }, (_, i) => {
    const pos = (i / count) * sections;
    const s = Math.min(sections - 1, Math.floor(pos));
    const edge = pos - s < 0.06 ? 0.35 : 1; // pequena quebra no início de cada seção
    const beat = i % 4 === 0 ? 1 : 0.78 + rand() * 0.18;
    return levels[s] * edge * beat * (0.6 + rand() * 0.4);
  });
  // Suaviza levemente para parecer áudio real
  return raw.map((v, i) => {
    const prev = raw[i - 1] ?? v;
    const next = raw[i + 1] ?? v;
    return Math.min(1, Math.max(0.06, v * 0.6 + (prev + next) * 0.2));
  });
}

/** Posição do "cue" (parte já tocada), entre 22% e 38%. */
export function cuePosition(seedText: string) {
  return 0.22 + (hashString(seedText) % 17) / 100;
}

type Props = {
  /** Texto que gera a forma de onda (normalmente o título do set). */
  seed: string;
  bars?: number;
  className?: string;
};

/**
 * Forma de onda estática estilo CDJ: parte tocada em neon, restante apagada, playhead no cue.
 * SVG puro, gerado de forma determinística a partir do título.
 */
export function Waveform({ seed, bars = 150, className }: Props) {
  const peaks = waveformPeaks(seed, bars);
  const played = cuePosition(seed);
  const playedBars = Math.round(bars * played);
  const gradId = `wf-${hashString(seed).toString(36)}`;
  const step = 3;

  return (
    <div aria-hidden className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${bars * step} 100`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        focusable="false"
      >
        <defs>
          <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1="0" x2={Math.max(1, playedBars * step)} y1="0" y2="0">
            <stop offset="0%" style={{ stopColor: "var(--color-cyan)" }} />
            <stop offset="55%" style={{ stopColor: "var(--color-purple)" }} />
            <stop offset="100%" style={{ stopColor: "var(--color-magenta)" }} />
          </linearGradient>
        </defs>
        <line x1="0" x2={bars * step} y1="50" y2="50" stroke="rgb(255 255 255 / 0.12)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
        {peaks.map((p, i) => {
          const h = p * 94;
          return (
            <rect
              key={i}
              x={i * step}
              y={(50 - h / 2).toFixed(2)}
              width={step - 1}
              height={h.toFixed(2)}
              rx="0.6"
              fill={i < playedBars ? `url(#${gradId})` : "rgb(255 255 255 / 0.22)"}
            />
          );
        })}
      </svg>
      {/* Playhead */}
      <span
        className="absolute inset-y-[-6%] w-[2px] -translate-x-1/2 bg-white shadow-neon-red"
        style={{ left: `${(playedBars / bars) * 100}%` }}
      />
    </div>
  );
}
