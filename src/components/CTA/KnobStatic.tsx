import { cn } from "@/lib/utils";
import {
  C,
  GAIN_CLASS,
  HALO_CLASS,
  KnobBase,
  KnobBody,
  KnobCap,
  KnobDefs,
  KnobReadout,
  START,
  SWEEP,
  TICK_ARC,
  TRACK_ARC,
} from "./knob-parts";

const UID = "cta-knob-max";

/**
 * Knob MASTER parado no MÁXIMO — modo leve, movimento reduzido e SSR.
 * SVG estático renderizado no servidor: sem scroll, sem spring e sem filtros
 * (o brilho do trilho é um traço largo translúcido, não um feGaussianBlur).
 */
export function KnobStatic({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("relative select-none", className)}>
      <div className={HALO_CLASS} />

      <svg viewBox="0 0 300 300" className="relative block h-auto w-full overflow-visible">
        <KnobDefs uid={UID} />
        <KnobBase uid={UID} />

        {/* escala de LEDs toda acesa */}
        <path d={TICK_ARC} fill="none" stroke={`url(#${UID}-lvl)`} strokeWidth={16} mask={`url(#${UID}-ticks)`} />

        {/* trilho interno: brilho falso (traço largo e translúcido) + núcleo */}
        <path d={TRACK_ARC} fill="none" stroke={`url(#${UID}-lvl)`} strokeWidth={12} strokeOpacity={0.22} strokeLinecap="round" />
        <path d={TRACK_ARC} fill="none" stroke={`url(#${UID}-lvl)`} strokeWidth={6} strokeOpacity={0.45} strokeLinecap="round" />
        <path d={TRACK_ARC} fill="none" stroke={`url(#${UID}-lvl)`} strokeWidth={2.5} strokeLinecap="round" />

        <KnobBody uid={UID} />
        <g transform={`rotate(${START + SWEEP} ${C} ${C})`}>
          <KnobCap uid={UID} glow={<circle cx={C} cy={C - 82} r={9} fill="#ff2414" opacity={0.28} />} />
        </g>
      </svg>

      <KnobReadout gain={<span className={GAIN_CLASS}>10</span>} peak />
    </div>
  );
}
