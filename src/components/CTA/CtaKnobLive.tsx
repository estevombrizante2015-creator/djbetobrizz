"use client";

import { useId, useRef, useState } from "react";
import { useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import * as m from "motion/react-m";
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

/**
 * Knob que gira de MIN a MAX conforme o visitante rola até o contato — SÓ no modo completo.
 * Tudo por MotionValues (rotação, nível, brilho, GAIN) — o React só re-renderiza quando o PEAK muda.
 * Sem filtros SVG: o brilho do trilho é um traço largo translúcido (repintar um blur a cada frame
 * do spring custava caro); o halo fica numa camada própria (opacidade só no compositor).
 */
export function CtaKnobLive({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center 0.42"] });
  const value = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.6 });

  const rotate = useTransform(value, [0, 1], [START, START + SWEEP]);
  const glow = useTransform(value, [0, 1], [0.15, 1]);
  const gain = useTransform(value, (v) => String(Math.round(v * 10)).padStart(2, "0"));

  const [peak, setPeak] = useState(false);
  const peakRef = useRef(false);
  useMotionValueEvent(value, "change", (v) => {
    const next = v > 0.96;
    if (next === peakRef.current) return;
    peakRef.current = next;
    setPeak(next);
  });

  return (
    <div ref={ref} aria-hidden className={cn("relative select-none", className)}>
      {/* halo que cresce com o volume */}
      <m.div className={`${HALO_CLASS} will-change-[opacity]`} style={{ opacity: glow }} />

      <svg viewBox="0 0 300 300" className="relative block h-auto w-full overflow-visible">
        <KnobDefs uid={uid} />
        <KnobBase uid={uid} />

        {/* escala de LEDs acesa até o valor atual */}
        <g mask={`url(#${uid}-ticks)`}>
          <m.path d={TICK_ARC} fill="none" stroke={`url(#${uid}-lvl)`} strokeWidth={16} style={{ pathLength: value }} />
        </g>

        {/* trilho interno com brilho (traços largos translúcidos + núcleo) */}
        <m.path
          d={TRACK_ARC}
          fill="none"
          stroke={`url(#${uid}-lvl)`}
          strokeWidth={12}
          strokeOpacity={0.22}
          strokeLinecap="round"
          style={{ pathLength: value }}
        />
        <m.path
          d={TRACK_ARC}
          fill="none"
          stroke={`url(#${uid}-lvl)`}
          strokeWidth={6}
          strokeOpacity={0.45}
          strokeLinecap="round"
          style={{ pathLength: value }}
        />
        <m.path
          d={TRACK_ARC}
          fill="none"
          stroke={`url(#${uid}-lvl)`}
          strokeWidth={2.5}
          strokeLinecap="round"
          style={{ pathLength: value }}
        />

        <KnobBody uid={uid} />
        <m.g style={{ rotate }}>
          <KnobCap
            uid={uid}
            glow={<circle cx={C} cy={C - 82} r={9} fill="#ff2414" opacity={0.28} />}
          />
        </m.g>
      </svg>

      <KnobReadout gain={<m.span className={GAIN_CLASS}>{gain}</m.span>} peak={peak} />
    </div>
  );
}
