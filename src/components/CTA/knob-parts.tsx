import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Geometria do knob (viewBox 300×300): arco de 270°, de -135° (MIN) a +135° (MAX). */
export const C = 150;
export const START = -135;
export const SWEEP = 270;
const R_TICKS = 134;
const R_TRACK = 112;
const TICKS = 41;
const TICK_W = 3.4;

function polar(r: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return [C + r * Math.sin(a), C - r * Math.cos(a)] as const;
}

function arc(r: number) {
  const [x0, y0] = polar(r, START);
  const [x1, y1] = polar(r, START + SWEEP);
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 1 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

export const TICK_ARC = arc(R_TICKS);
export const TRACK_ARC = arc(R_TRACK);
const TICK_LEN = (2 * Math.PI * R_TICKS * SWEEP) / 360;
const TICK_GAP = (TICK_LEN - TICKS * TICK_W) / (TICKS - 1);
const [MIN_X, MIN_Y] = polar(R_TICKS + 4, START);
const [MAX_X, MAX_Y] = polar(R_TICKS + 4, START + SWEEP);

/** Halo atrás do knob — gradiente radial puro (sem blur). */
export const HALO_CLASS =
  "pointer-events-none absolute inset-[4%] rounded-full bg-[radial-gradient(closest-side,rgb(255_36_20/0.4),rgb(255_20_147/0.22)_55%,transparent)]";

/** Gradientes e máscara dos LEDs (sem filtros: o brilho é feito com traços translúcidos). */
export function KnobDefs({ uid }: { uid: string }) {
  return (
    <defs>
      <linearGradient id={`${uid}-lvl`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#00e5ff" />
        <stop offset="0.38" stopColor="#8a2be2" />
        <stop offset="0.72" stopColor="#ff1493" />
        <stop offset="1" stopColor="#ff2414" />
      </linearGradient>
      <radialGradient id={`${uid}-body`} cx="0.42" cy="0.36" r="0.75">
        <stop offset="0" stopColor="#2c2638" />
        <stop offset="0.55" stopColor="#15121e" />
        <stop offset="1" stopColor="#07060b" />
      </radialGradient>
      <radialGradient id={`${uid}-cap`} cx="0.4" cy="0.32" r="0.8">
        <stop offset="0" stopColor="#1f1b29" />
        <stop offset="1" stopColor="#0a0910" />
      </radialGradient>
      <mask id={`${uid}-ticks`} maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="300">
        <path d={TICK_ARC} fill="none" stroke="#fff" strokeWidth={16} strokeDasharray={`${TICK_W} ${TICK_GAP.toFixed(3)}`} />
      </mask>
    </defs>
  );
}

/** Escala apagada, trilho de fundo, rótulos MIN/MAX e corpo do knob (partes que não mudam). */
export function KnobBase({ uid }: { uid: string }) {
  return (
    <>
      <path d={TICK_ARC} fill="none" stroke="#fff" strokeOpacity={0.14} strokeWidth={16} mask={`url(#${uid}-ticks)`} />
      <path d={TRACK_ARC} fill="none" stroke="#fff" strokeOpacity={0.08} strokeWidth={3} strokeLinecap="round" />
      <text x={MIN_X - 6} y={MIN_Y + 22} className="fill-mute font-hud text-[13px] font-bold tracking-[0.2em]" textAnchor="middle">
        MIN
      </text>
      <text x={MAX_X + 6} y={MAX_Y + 22} className="fill-red font-hud text-[13px] font-bold tracking-[0.2em]" textAnchor="middle">
        MAX
      </text>
    </>
  );
}

/** Corpo fixo do knob (fica por baixo da tampa que gira). */
export function KnobBody({ uid }: { uid: string }) {
  return <circle cx={C} cy={C} r={96} fill={`url(#${uid}-body)`} stroke="#fff" strokeOpacity={0.1} />;
}

/** Tampa que gira: serrilhado + "O" do logo + ponteiro. `glow`: halo do LED do ponteiro. */
export function KnobCap({ uid, glow }: { uid: string; glow: ReactNode }) {
  return (
    <>
      {/* serrilhado gira junto — dá a sensação de movimento */}
      <circle cx={C} cy={C} r={90} fill="none" stroke="#fff" strokeOpacity={0.16} strokeWidth={6} strokeDasharray="1.6 4.2" />
      <circle cx={C} cy={C} r={74} fill={`url(#${uid}-cap)`} />
      {/* anel branco + ponteiro: o "O" do logo */}
      <circle cx={C} cy={C} r={58} fill="none" stroke="#fff" strokeWidth={7} />
      <line x1={C} y1={C} x2={C} y2={C - 48} stroke="#fff" strokeWidth={9} strokeLinecap="round" />
      <circle cx={C} cy={C - 82} r={4.5} fill="#ff2414" />
      {glow}
    </>
  );
}

/** Leitura GAIN + PEAK abaixo do knob. */
export function KnobReadout({ gain, peak }: { gain: ReactNode; peak: boolean }) {
  return (
    <div className="relative mt-2 flex items-center justify-center gap-5 font-hud text-sm font-bold tracking-[0.24em] uppercase">
      <span className="flex items-baseline gap-2 text-mute">
        Gain
        {gain}
      </span>
      <span className={cn("flex items-center gap-2 transition-colors duration-300", peak ? "text-red" : "text-dim")}>
        <span
          className={cn(
            "size-2.5 rounded-full transition-[background-color,box-shadow] duration-300",
            peak ? "bg-red shadow-neon-red" : "bg-white/15",
          )}
        />
        Peak
      </span>
    </div>
  );
}

export const GAIN_CLASS = "font-display text-lg tracking-normal text-white tabular-nums";
