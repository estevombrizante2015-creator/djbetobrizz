import { cn } from "@/lib/utils";
import styles from "./TrackWaveform.module.css";

const W = 960;
const H = 12;

/** Waveform "overview" estilo CDJ — determinística (mesma no SSR e no cliente). */
const wavePath = (() => {
  let d = "";
  const bars = 240;
  for (let i = 0; i < bars; i++) {
    const t = i / bars;
    // envelope de uma faixa: intro baixa, drops, breakdown, outro
    const env = 0.35 + 0.65 * Math.min(1, Math.abs(Math.sin(t * Math.PI * 3.2)) * 1.4) * (t < 0.06 || t > 0.95 ? 0.4 : 1);
    const n = Math.abs(Math.sin(i * 0.37) * 0.55 + Math.sin(i * 1.13) * 0.3 + Math.sin(i * 0.071) * 0.35);
    const h = Math.max(1.2, Math.min(H - 1, n * (H - 1) * env * 1.2));
    const x = (i + 0.5) * (W / bars);
    d += `M${x.toFixed(1)} ${((H - h) / 2).toFixed(2)}V${((H + h) / 2).toFixed(2)}`;
  }
  return d;
})();

function Wave({ className, stroke }: { className?: string; stroke: string }) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={cn("block h-full w-full", className)}
      aria-hidden
      focusable="false"
    >
      <path d={wavePath} stroke={stroke} strokeWidth={2} />
    </svg>
  );
}

/**
 * Barra de progresso da página desenhada como a waveform da faixa num CDJ:
 * parte "tocada" em neon + playhead. 100% CSS (`animation-timeline: scroll()`), roda no
 * compositor — nenhum JavaScript por rolagem. Só nos desktops capazes (o Header decide);
 * sem suporte a scroll-driven animations mostra apenas a faixa apagada.
 */
export function TrackWaveform({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 -bottom-[5px] h-2.5 transition-opacity duration-500",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <Wave stroke="rgb(255 255 255 / 0.13)" />
      <div className={cn(styles.clip, "absolute inset-0 overflow-hidden")}>
        <div className={cn(styles.inner, "absolute inset-0")}>
          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient id="bb-track-grad" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#00e5ff" />
                <stop offset="0.5" stopColor="#8a2be2" />
                <stop offset="0.85" stopColor="#ff1493" />
                <stop offset="1" stopColor="#ff2414" />
              </linearGradient>
            </defs>
          </svg>
          <Wave stroke="url(#bb-track-grad)" className="opacity-90" />
        </div>
      </div>
      <div className={cn(styles.head, "absolute inset-0")}>
        <span className="absolute top-[-3px] bottom-[-3px] left-0 w-px bg-white shadow-[0_0_6px_1px_rgb(255_255_255/0.7)]" />
      </div>
    </div>
  );
}
