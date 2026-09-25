"use client";

import { motion, useScroll, useTransform, type Transition, type Variants } from "motion/react";
import { siteConfig } from "@/config/site";
import { useExperience } from "@/components/Effects/ExperienceContext";
import { NeonButton } from "@/components/ui/NeonButton";
import { HeadphonesIcon, PlayIcon } from "@/components/ui/Icons";
import { ease } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useHeroIntro } from "./HeroIntro";
import { HeroLogo } from "./HeroLogo";
import styles from "./Hero.module.css";

/** Linha do tempo da entrada (s, a partir do início da intro). Total ≈ 1 s. */
const T = { title: 0.34, line: 0.5, tagline: 0.5, text: 0.6, ctas: 0.72 };

const rise: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

/** "DJ & VJ" → DJ (vermelho do logo: som) · & · VJ (ciano: imagem). */
function splitTitle(title: string) {
  const m = title.match(/^(.+?)\s*&\s*(.+)$/);
  if (!m) return [{ text: title, tone: "text-white text-glow-magenta" }];
  return [
    { text: m[1], tone: "text-white text-glow-red" },
    { text: " & ", tone: "font-hud font-medium text-white/55" },
    { text: m[2], tone: "text-white text-glow-cyan" },
  ];
}

/** Recorte da "digitação": abre da esquerda para a direita (folga vertical para o glow). */
const CLIP_HIDDEN = "inset(-60% 100% -60% -12%)";
const CLIP_SHOWN = "inset(-60% -12% -60% -12%)";

/** "DJ & VJ" digitado: revela caractere a caractere com um cursor ciano surfando na borda. */
function TypedTitle({ started, reduced }: { started: boolean; reduced: boolean }) {
  const parts = splitTitle(siteConfig.title);
  const count = Math.max(1, parts.reduce((n, p) => n + p.text.length, 0));
  const typing: Transition = reduced
    ? { duration: 0 }
    : { duration: count * 0.05, delay: T.title, ease: (t: number) => Math.ceil(t * count) / count };

  return (
    <span aria-hidden className="mt-4 flex items-center justify-center gap-4 sm:mt-5 lg:justify-start">
      <motion.span
        className="h-px w-10 origin-right bg-linear-to-l from-cyan/70 to-transparent sm:w-16 lg:hidden"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: started ? 1 : 0 }}
        transition={reduced ? { duration: 0 } : { duration: 0.5, ease: ease.out, delay: T.line }}
      />
      <span className="relative font-display text-[clamp(1.6rem,6.4vw,3rem)] leading-none font-black tracking-[0.2em] whitespace-pre">
        <motion.span
          className="hero-reveal block"
          initial={{ clipPath: CLIP_HIDDEN }}
          animate={{ clipPath: started ? CLIP_SHOWN : CLIP_HIDDEN }}
          transition={typing}
        >
          {parts.map((part) => (
            <span key={part.text} className={part.tone}>
              {part.text}
            </span>
          ))}
        </motion.span>
        {reduced ? null : (
          <motion.span
            className="pointer-events-none absolute inset-0"
            initial={{ x: "0%" }}
            animate={{ x: started ? "100%" : "0%" }}
            transition={typing}
          >
            {started ? <span className={styles.caret} /> : null}
          </motion.span>
        )}
      </span>
      <motion.span
        className="h-px w-10 flex-none origin-left bg-linear-to-r from-cyan/70 via-purple/50 to-transparent sm:w-16 lg:w-auto lg:flex-1"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: started ? 1 : 0 }}
        transition={reduced ? { duration: 0 } : { duration: 0.6, ease: ease.out, delay: T.line }}
      />
    </span>
  );
}

/**
 * Conteúdo do hero: h1 (logo + "DJ & VJ"), tagline HUD, texto e CTAs.
 * Entra em sequência depois do glitch do logo; no desktop sobe e some suavemente ao rolar.
 */
export function HeroContent() {
  const { started, reduced } = useHeroIntro();
  const { isDesktop } = useExperience();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, -120]);
  const opacity = useTransform(scrollY, [0, 560], [1, 0]);
  const parallax = isDesktop && !reduced;

  const state = started ? "show" : "hidden";
  const at = (delay: number): Transition =>
    reduced ? { duration: 0 } : { duration: 0.6, ease: ease.out, delay };

  return (
    <motion.div
      className={cn(
        "relative mx-auto w-full max-w-[700px] text-center lg:mr-0 lg:ml-auto lg:text-left",
        parallax && "will-change-transform",
      )}
      style={parallax ? { y, opacity } : undefined}
    >
      <h1 id="hero-title">
        <span className="sr-only">{`${siteConfig.name} — ${siteConfig.title}`}</span>
        <HeroLogo className="mx-auto w-full lg:mx-0" />
        <TypedTitle started={started} reduced={reduced} />
      </h1>

      <motion.p
        className="hud hero-reveal mt-5 flex items-center justify-center gap-3 text-[0.7rem] text-white/80 sm:text-xs lg:justify-start"
        variants={rise}
        initial="hidden"
        animate={state}
        transition={at(T.tagline)}
      >
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-red shadow-neon-red" />
        {siteConfig.tagline}
      </motion.p>

      <motion.p
        className="hero-reveal mx-auto mt-4 max-w-md text-base leading-relaxed text-pretty text-white/85 [text-shadow:0_1px_12px_rgb(0_0_0/0.8)] sm:text-lg lg:mx-0"
        variants={rise}
        initial="hidden"
        animate={state}
        transition={at(T.text)}
      >
        {siteConfig.heroText}
      </motion.p>

      <motion.div
        className="hero-reveal mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4 lg:justify-start"
        variants={rise}
        initial="hidden"
        animate={state}
        transition={at(T.ctas)}
      >
        <span className="relative flex rounded-full bg-void/55">
          <span
            aria-hidden
            className={cn("absolute -inset-2 rounded-full bg-red/40 blur-xl", !reduced && "animate-pulse-glow")}
          />
          <NeonButton
            href={siteConfig.whatsappUrl}
            external
            variant="red"
            size="lg"
            icon={<HeadphonesIcon size={20} />}
            event="cta_click"
            eventParams={{ cta: "hero_contrate" }}
            aria-label="Contrate o DJ pelo WhatsApp (abre em nova aba)"
            className="relative w-full"
          >
            Contrate o DJ
          </NeonButton>
        </span>
        <span className="relative flex rounded-full bg-void/55">
          <NeonButton
            href="#experiencia"
            variant="cyan"
            size="lg"
            icon={<PlayIcon size={16} />}
            event="cta_click"
            eventParams={{ cta: "hero_ver_experiencia" }}
            className="w-full"
          >
            Ver experiência
          </NeonButton>
        </span>
      </motion.div>
    </motion.div>
  );
}
