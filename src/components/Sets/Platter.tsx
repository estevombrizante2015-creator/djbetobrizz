import Image from "next/image";
import { siteConfig } from "@/config/site";
import { cn, getImageMeta } from "@/lib/utils";

type Props = {
  /** Disco girando (tocando). */
  spinning: boolean;
  /** Braço sobre o disco (player carregado). */
  armDown: boolean;
  className?: string;
};

/** Texto do anel do selo (o logo já está no centro). Ajustado para fechar a volta sem cortar. */
const LABEL_TEXT = "SOUND & VISUAL EXPERIENCE • MUSIC VIDEO ENTERTAINMENT • ";
/** Circunferência do caminho do anel (r = 40 no viewBox 100) menos uma folga mínima. */
const RING_LENGTH = (2 * Math.PI * 40 - 1.5).toFixed(1);

/**
 * Prato/vinil com o logo como selo. Gira só quando o set está tocando
 * e nunca com prefers-reduced-motion (classe motion-safe).
 */
export function Platter({ spinning, armDown, className }: Props) {
  const logo = getImageMeta(siteConfig.logo.src);

  return (
    <div aria-hidden className={cn("relative aspect-square select-none", className)}>
      {/* Base do prato + anel de strobe */}
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-shadow duration-700",
          spinning ? "shadow-[0_0_0_1px_rgb(255_20_147/0.5),0_0_60px_-6px_rgb(255_20_147/0.55)]" : "shadow-[0_0_0_1px_rgb(255_255_255/0.08)]",
        )}
        style={{
          background:
            "radial-gradient(circle, #1c1a24 0%, #0c0b11 68%, #1a1822 69%, #0b0a0f 72%, #16141d 100%)",
        }}
      />
      <div
        className="absolute inset-[1.8%] rounded-full opacity-60"
        style={{
          background: "repeating-conic-gradient(rgb(255 255 255 / 0.55) 0deg 1.2deg, transparent 1.2deg 7.5deg)",
          WebkitMask: "radial-gradient(circle, transparent 95.5%, #000 96%)",
          mask: "radial-gradient(circle, transparent 95.5%, #000 96%)",
        }}
      />

      {/* Disco */}
      <div
        className={cn("absolute inset-[5.5%] rounded-full", "motion-safe:animate-spin-slow")}
        style={{
          animationDuration: "3.2s",
          animationPlayState: spinning ? "running" : "paused",
          background:
            "radial-gradient(circle, transparent 34%, rgb(255 255 255 / 0.05) 34.5%, transparent 35.5%, transparent 62%, rgb(255 255 255 / 0.05) 62.5%, transparent 63.5%), repeating-radial-gradient(circle, #0a090e 0 1.5px, #15131b 1.5px 3px)",
          boxShadow: "0 18px 50px -12px rgb(0 0 0 / 0.9), inset 0 0 0 2px rgb(0 0 0 / 0.8)",
        }}
      >
        {/* Selo com o logo */}
        <div
          className="absolute inset-[30%] grid place-items-center overflow-hidden rounded-full"
          style={{
            background: "radial-gradient(circle at 50% 45%, #2a0f2c 0%, #12081a 55%, #07060a 100%)",
            boxShadow: "0 0 0 2px rgb(255 20 147 / 0.55), 0 0 24px rgb(255 20 147 / 0.25) inset",
          }}
        >
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" focusable="false">
            <defs>
              <path id="sets-label-ring" d="M50,50 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0" />
            </defs>
            <text className="font-hud" fill="rgb(255 255 255 / 0.62)" fontSize="6.4" fontWeight="700" letterSpacing="1.1">
              <textPath href="#sets-label-ring" textLength={RING_LENGTH} lengthAdjust="spacing">
                {LABEL_TEXT}
              </textPath>
            </text>
          </svg>
          <Image
            src={siteConfig.logo.src}
            width={logo.width}
            height={logo.height}
            alt=""
            sizes="160px"
            quality={85}
            className="relative w-[62%]"
            draggable={false}
          />
        </div>
      </div>

      {/* Reflexos das luzes da pista (fixos, não giram) */}
      <div
        className="pointer-events-none absolute inset-[5.5%] rounded-full"
        style={{
          background:
            "conic-gradient(from 20deg, transparent 0deg, rgb(255 20 147 / 0.2) 32deg, rgb(255 255 255 / 0.1) 40deg, transparent 78deg, transparent 185deg, rgb(0 229 255 / 0.16) 218deg, rgb(255 255 255 / 0.07) 226deg, transparent 262deg)",
          WebkitMask: "radial-gradient(circle, transparent 33%, #000 34%)",
          mask: "radial-gradient(circle, transparent 33%, #000 34%)",
        }}
      />

      {/* Eixo */}
      <div className="absolute top-1/2 left-1/2 size-[3.2%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-white to-mute shadow-[0_0_0_2px_rgb(0_0_0/0.6)]" />

      {/* Braço */}
      <svg
        viewBox="0 0 100 180"
        className="absolute -top-[4%] -right-[6%] w-[30%] transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transformOrigin: "70% 13%", transform: `rotate(${armDown ? 14 : -8}deg)` }}
        focusable="false"
      >
        <circle cx="70" cy="24" r="17" fill="#1b1924" stroke="rgb(255 255 255 / 0.18)" strokeWidth="1.5" />
        <circle cx="70" cy="24" r="7" fill="#3b3748" />
        <rect x="62" y="0" width="16" height="12" rx="3" fill="#2c2937" />
        <path d="M70 24 L62 128 L44 156" fill="none" stroke="#c9c6d6" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="30" y="150" width="22" height="14" rx="2.5" fill="#26232f" stroke="rgb(255 255 255 / 0.25)" strokeWidth="1" transform="rotate(-34 41 157)" />
        <circle cx="36" cy="166" r="2.2" fill={armDown ? "#ff1493" : "#7d7990"} />
      </svg>
    </div>
  );
}
