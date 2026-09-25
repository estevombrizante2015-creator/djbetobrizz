"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useExperience } from "@/components/Effects/ExperienceContext";
import { VhsOverlay } from "@/components/Effects/VhsOverlay";
import { KnobIcon } from "@/components/ui/Icons";
import { siteConfig } from "@/config/site";
import { imageProps } from "@/lib/utils";

/**
 * Retrato em um monitor CRT: moldura/bezel, scanlines, vinheta, REC no canto
 * e contornos neon deslocados. Parallax sutil apenas no desktop sem reduced motion.
 */
export function AboutPortrait() {
  const ref = useRef<HTMLDivElement>(null);
  const { isDesktop, reducedMotion } = useExperience();
  const parallax = isDesktop && !reducedMotion;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const outlineA = useTransform(scrollYProgress, [0, 1], [26, -26]);
  const outlineB = useTransform(scrollYProgress, [0, 1], [-16, 16]);

  return (
    <div ref={ref} className="group relative mx-auto w-full max-w-[25rem] lg:max-w-[27rem] xl:max-w-[28.5rem]">
      {/* Contornos neon deslocados (profundidade) */}
      <motion.div
        aria-hidden
        style={parallax ? { y: outlineA } : undefined}
        className="absolute inset-0 translate-x-3 translate-y-3 rounded-[1.9rem] border border-magenta/70 shadow-neon-magenta transition-transform duration-500 ease-out group-hover:translate-x-4 group-hover:translate-y-4 sm:translate-x-5 sm:translate-y-5"
      />
      <motion.div
        aria-hidden
        style={parallax ? { y: outlineB } : undefined}
        className="absolute inset-0 -translate-x-2 -translate-y-2 rounded-[1.9rem] border border-cyan/45 transition-transform duration-500 ease-out group-hover:-translate-x-3 group-hover:-translate-y-3 sm:-translate-x-3 sm:-translate-y-3"
      />

      {/* Gabinete do monitor */}
      <div className="relative rounded-[1.9rem] bg-gradient-to-b from-panel-2 to-ink p-2.5 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)] ring-1 ring-line-strong sm:p-3">
        {/* Tela */}
        <div className="relative aspect-square overflow-hidden rounded-[1.4rem] bg-ink sm:aspect-[4/5]">
          <motion.div style={parallax ? { y: imageY } : undefined} className="absolute inset-[-7%]">
            <Image
              {...imageProps(siteConfig.profileImage)}
              alt="Retrato de DJ BetoBrizz de jaqueta de couro diante de um painel de LED"
              sizes="(min-width: 1024px) 520px, (min-width: 640px) 460px, 100vw"
              className="h-full w-full object-cover object-[50%_22%]"
            />
          </motion.div>

          {/* Tratamento CRT: tinta neon, vinheta e scanlines */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-void/85 via-transparent to-purple/15"
          />
          <div
            aria-hidden
            className="absolute inset-0 shadow-[inset_0_0_90px_rgb(0_0_0/0.85),inset_0_0_0_1px_rgb(255_255_255/0.06)]"
          />
          <div aria-hidden className="scanlines absolute inset-0" />
          <VhsOverlay mode="PLAY" track="TRACK 01" start={92} />
        </div>

        {/* Barra de controles do monitor */}
        <div aria-hidden className="flex items-center justify-between px-2 pt-2.5 sm:px-3 sm:pt-3">
          <span className="hud text-[0.65rem] text-dim">BB-CRT · CH 01</span>
          <span className="flex items-center gap-3 text-dim">
            <KnobIcon size={16} />
            <KnobIcon size={16} className="rotate-90" />
            <span className="size-1.5 rounded-full bg-red shadow-neon-red" />
          </span>
        </div>
      </div>
    </div>
  );
}
