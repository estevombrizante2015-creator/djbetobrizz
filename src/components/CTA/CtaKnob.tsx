"use client";

import { useId, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { useExperience } from "@/components/Effects/ExperienceContext";
import { cn } from "@/lib/utils";

/* Geometria do knob (viewBox 300×300): arco de 270°, de -135° (MIN) a +135° (MAX). */
const C = 150;
const START = -135;
const SWEEP = 270;
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

const TICK_ARC = arc(R_TICKS);
const TRACK_ARC = arc(R_TRACK);
const TICK_LEN = (2 * Math.PI * R_TICKS * SWEEP) / 360;
const TICK_GAP = (TICK_LEN - TICKS * TICK_W) / (TICKS - 1);
const [MIN_X, MIN_Y] = polar(R_TICKS + 4, START);
const [MAX_X, MAX_Y] = polar(R_TICKS + 4, START + SWEEP);

/**
 * Knob do logo (o "O" de BETO) como controle de mixer: gira de MIN a MAX
 * conforme o visitante rola até o contato — "turn up the moment".
 * Decorativo (aria-hidden). Com reduced motion fica parado no máximo.
 */
export function CtaKnob({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const { reducedMotion } = useExperience();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center 0.42"] });
  const value = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.6 });

  const rotate = useTransform(value, [0, 1], [START, START + SWEEP]);
  const glow = useTransform(value, [0, 1], [0.15, 1]);
  const gain = useTransform(value, (v) => String(Math.round(v * 10)).padStart(2, "0"));

  const [peak, setPeak] = useState(false);
  useMotionValueEvent(value, "change", (v) => setPeak(v > 0.96));

  const still = reducedMotion;
  const isPeak = still || peak;

  return (
    <div ref={ref} aria-hidden className={cn("relative select-none", className)}>
      {/* halo que cresce com o volume */}
      <motion.div
        className="pointer-events-none absolute inset-[4%] rounded-full bg-[radial-gradient(closest-side,rgb(255_36_20/0.4),rgb(255_20_147/0.22)_55%,transparent)] blur-2xl"
        style={{ opacity: still ? 1 : glow }}
      />

      <svg viewBox="0 0 300 300" className="relative block h-auto w-full overflow-visible">
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
            <path
              d={TICK_ARC}
              fill="none"
              stroke="#fff"
              strokeWidth={16}
              strokeDasharray={`${TICK_W} ${TICK_GAP.toFixed(3)}`}
            />
          </mask>
          <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* escala de LEDs: apagada + acesa até o valor atual */}
        <path d={TICK_ARC} fill="none" stroke="#fff" strokeOpacity={0.14} strokeWidth={16} mask={`url(#${uid}-ticks)`} />
        <g mask={`url(#${uid}-ticks)`}>
          <motion.path
            d={TICK_ARC}
            fill="none"
            stroke={`url(#${uid}-lvl)`}
            strokeWidth={16}
            style={{ pathLength: still ? 1 : value }}
          />
        </g>

        {/* trilho interno com brilho */}
        <path d={TRACK_ARC} fill="none" stroke="#fff" strokeOpacity={0.08} strokeWidth={3} strokeLinecap="round" />
        <motion.path
          d={TRACK_ARC}
          fill="none"
          stroke={`url(#${uid}-lvl)`}
          strokeWidth={6}
          strokeLinecap="round"
          filter={`url(#${uid}-soft)`}
          style={{ pathLength: still ? 1 : value, opacity: 0.9 }}
        />
        <motion.path
          d={TRACK_ARC}
          fill="none"
          stroke={`url(#${uid}-lvl)`}
          strokeWidth={2.5}
          strokeLinecap="round"
          style={{ pathLength: still ? 1 : value }}
        />

        <text x={MIN_X - 6} y={MIN_Y + 22} className="fill-mute font-hud text-[13px] font-bold tracking-[0.2em]" textAnchor="middle">
          MIN
        </text>
        <text x={MAX_X + 6} y={MAX_Y + 22} className="fill-red font-hud text-[13px] font-bold tracking-[0.2em]" textAnchor="middle">
          MAX
        </text>

        {/* corpo do knob */}
        <circle cx={C} cy={C} r={96} fill={`url(#${uid}-body)`} stroke="#fff" strokeOpacity={0.1} />
        <motion.g style={{ rotate: still ? START + SWEEP : rotate }}>
          {/* serrilhado gira junto — dá a sensação de movimento */}
          <circle cx={C} cy={C} r={90} fill="none" stroke="#fff" strokeOpacity={0.16} strokeWidth={6} strokeDasharray="1.6 4.2" />
          <circle cx={C} cy={C} r={74} fill={`url(#${uid}-cap)`} />
          {/* anel branco + ponteiro: o "O" do logo */}
          <circle cx={C} cy={C} r={58} fill="none" stroke="#fff" strokeWidth={7} />
          <line x1={C} y1={C} x2={C} y2={C - 48} stroke="#fff" strokeWidth={9} strokeLinecap="round" />
          <circle cx={C} cy={C - 82} r={4.5} fill="#ff2414" />
          <circle cx={C} cy={C - 82} r={9} fill="#ff2414" opacity={0.35} filter={`url(#${uid}-soft)`} />
        </motion.g>
      </svg>

      <div className="relative mt-2 flex items-center justify-center gap-5 font-hud text-sm font-bold tracking-[0.24em] uppercase">
        <span className="flex items-baseline gap-2 text-mute">
          Gain
          <motion.span className="font-display text-lg tracking-normal text-white tabular-nums">
            {still ? "10" : gain}
          </motion.span>
        </span>
        <span className={cn("flex items-center gap-2 transition-colors duration-300", isPeak ? "text-red" : "text-dim")}>
          <span
            className={cn(
              "size-2.5 rounded-full transition-[background-color,box-shadow] duration-300",
              isPeak ? "bg-red shadow-neon-red" : "bg-white/15",
            )}
          />
          Peak
        </span>
      </div>
    </div>
  );
}
