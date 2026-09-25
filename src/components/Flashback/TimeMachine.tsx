"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import type { decades as decadesData } from "@/data/content";
import { useExperience } from "@/components/Effects/ExperienceContext";
import { ArrowDownIcon } from "@/components/ui/Icons";
import { ease } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { CrtTv } from "./CrtTv";
import { SceneBackdrop, SceneProp, propWidth, sceneFor, sceneTheme } from "./scenes";
import styles from "./Flashback.module.css";

type Decade = (typeof decadesData)[number];

/** Tempo de cada década no modo automático (mobile/tablet). */
const AUTO_MS = 5200;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Máquina do tempo 1980 → 1990 → 2000 → TODAY.
 * - Desktop (mouse + ≥1024px, sem reduced motion): trilho alto com palco "sticky";
 *   o progresso do scroll escolhe a década.
 * - Mobile/tablet/reduced motion: palco compacto com abas (tablist) e avanço
 *   automático opcional (pausável; parado com reduced motion, fora da tela ou aba oculta).
 * O layout de cada modo é decidido por media query no CSS (sem salto na hidratação).
 */
export function TimeMachine({ decades }: { decades: Decade[] }) {
  const n = decades.length;
  const { isDesktop, reducedMotion } = useExperience();
  const scrollMode = isDesktop && !reducedMotion;

  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [scrollIndex, setScrollIndex] = useState(0);
  const [autoIndex, setAutoIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);
  const inView = useInView(stageRef, { amount: 0.3 });

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const toIndex = useCallback((p: number) => Math.min(n - 1, Math.max(0, Math.floor(p * n))), [n]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = toIndex(p);
    setScrollIndex((prev) => (prev === i ? prev : i));
  });

  // Ao entrar no modo scroll (após hidratação), sincroniza com a posição atual.
  useEffect(() => {
    if (!scrollMode) return;
    const id = requestAnimationFrame(() => setScrollIndex(toIndex(scrollYProgress.get())));
    return () => cancelAnimationFrame(id);
  }, [scrollMode, scrollYProgress, toIndex]);

  useEffect(() => {
    const onVisibility = () => setPageHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const active = Math.min(scrollMode ? scrollIndex : autoIndex, n - 1);
  const decade = decades[active];
  const scene = sceneFor(decade.year, active);
  const theme = sceneTheme[scene];
  const maxChars = Math.max(4, ...decades.map((d) => d.year.length));

  const autoplay = !scrollMode && !reducedMotion && !userPaused;
  const running = autoplay && inView && !pageHidden;

  const goTo = (i: number) => {
    if (!scrollMode) {
      setAutoIndex(i);
      setUserPaused(true);
      return;
    }
    const track = trackRef.current;
    if (!track) return;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const dist = track.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (dist * (i + 0.5)) / n, behavior: "smooth" });
  };

  const onTabKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: n - 1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = (keys[e.key] + n) % n;
    goTo(next);
    tabRefs.current[next]?.focus({ preventScroll: true });
  };

  return (
    <div ref={trackRef} className={styles.track} style={{ "--n": n } as CSSProperties}>
      <div
        ref={stageRef}
        className={styles.stage}
        data-scene={scene}
        data-paused={inView ? undefined : ""}
        style={{ "--acc": theme.acc } as CSSProperties}
      >
        {/* Fundo de tela cheia — muda a cada década */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <AnimatePresence initial={false}>
            <motion.div
              key={`${scene}-${active}`}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: ease.inOut }}
            >
              <SceneBackdrop scene={scene} />
            </motion.div>
          </AnimatePresence>
          <div className={styles.stageShade} />
          {!reducedMotion ? <span key={`burst-${active}`} className={styles.burst} /> : null}
        </div>

        <div className={cn("container-bb", styles.stageGrid)}>
          {/* Texto + seletor de década */}
          <div className={styles.info}>
            <p className="hud flex items-center gap-3 text-white/85">
              <span aria-hidden className="size-2 animate-rec rounded-full bg-red shadow-neon-red" />
              Time machine
              <span aria-hidden className="text-white/30">
                {"//"}
              </span>
              <span className="text-mute">
                CH {pad(active + 1)} / {pad(n)}
              </span>
            </p>

            <div
              id="flashback-panel"
              role="tabpanel"
              aria-labelledby={`flashback-tab-${active}`}
              tabIndex={0}
              className="mt-3 rounded-sm sm:mt-4"
            >
              <div className={styles.yearWrap} style={{ "--chars": maxChars } as CSSProperties}>
                <h3 key={active} className={cn(styles.year, styles[`year_${scene}`], !reducedMotion && styles.yearEnter)}>
                  {decade.year}
                </h3>
                {!reducedMotion ? (
                  <>
                    <span key={`ga-${active}`} aria-hidden className={cn(styles.year, styles.ghost, styles.ghostA)}>
                      {decade.year}
                    </span>
                    <span key={`gb-${active}`} aria-hidden className={cn(styles.year, styles.ghost, styles.ghostB)}>
                      {decade.year}
                    </span>
                  </>
                ) : null}
              </div>
              <p className={cn("mt-3 font-hud text-xl font-bold tracking-[0.22em] uppercase sm:text-2xl", theme.label)}>
                {decade.label}
              </p>
              <p className="mt-2 max-w-md text-base leading-relaxed text-white/85 sm:text-lg">{decade.hint}</p>
            </div>

            {/* Abas — 1980 · 1990 · 2000 · TODAY */}
            <div
              role="tablist"
              aria-label="Escolha a década"
              onKeyDown={onTabKeyDown}
              className="mt-7 grid gap-2 sm:mt-9 sm:gap-3"
              style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
            >
              {decades.map((d, i) => {
                const selected = i === active;
                return (
                  <button
                    key={`${d.year}-${i}`}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`flashback-tab-${i}`}
                    aria-selected={selected}
                    aria-controls="flashback-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => goTo(i)}
                    className="group/tab flex min-h-11 flex-col items-start gap-2.5 rounded-sm pt-1 pb-1.5 text-left"
                  >
                    <span className="relative block h-[3px] w-full overflow-hidden rounded-full bg-white/12">
                      {scrollMode ? (
                        <ScrollFill progress={scrollYProgress} index={i} total={n} />
                      ) : (
                        <span
                          key={`${i}-${active}-${autoplay}`}
                          className={cn(
                            styles.fill,
                            i < active || (selected && !autoplay) ? styles.fillFull : null,
                            selected && autoplay ? styles.fillRun : null,
                          )}
                          style={
                            selected && autoplay
                              ? { animationDuration: `${AUTO_MS}ms`, animationPlayState: running ? "running" : "paused" }
                              : undefined
                          }
                          onAnimationEnd={(e) => {
                            if (e.target === e.currentTarget && selected && autoplay) setAutoIndex((active + 1) % n);
                          }}
                        />
                      )}
                    </span>
                    <span
                      className={cn(
                        "font-display text-sm font-bold tracking-wider transition-colors sm:text-base",
                        selected ? "text-white" : "text-mute group-hover/tab:text-white",
                      )}
                    >
                      {d.year}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex min-h-11 items-center gap-4">
              {scrollMode ? (
                <p className="hud flex items-center gap-3 text-mute">
                  <ArrowDownIcon size={16} className="animate-scroll-cue text-(--acc)" />
                  {active < n - 1 ? "Role para viajar no tempo" : "Role para continuar"}
                </p>
              ) : !reducedMotion ? (
                <button
                  type="button"
                  onClick={() => setUserPaused((v) => !v)}
                  className="vhs inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong bg-void/40 px-5 text-xl text-white transition-colors hover:border-white/50"
                >
                  <span aria-hidden>{userPaused ? "▶" : "❚❚"}</span>
                  {userPaused ? "PLAY" : "PAUSE"}
                  <span className="sr-only">— troca automática das décadas</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* TV + mídia da década */}
          <div className={styles.tvCol}>
            <CrtTv scene={scene} index={active} total={n} mode={autoplay || scrollMode ? "PLAY" : "PAUSE"} reducedMotion={reducedMotion} />
            <div aria-hidden className={styles.propSlot}>
              <AnimatePresence initial={false}>
                <motion.div
                  key={scene}
                  className={cn(styles.prop, propWidth[scene])}
                  initial={{ opacity: 0, y: 40, rotate: -18 }}
                  animate={{ opacity: 1, y: 0, rotate: -7 }}
                  exit={{ opacity: 0, y: 24, rotate: 4 }}
                  transition={{ duration: 0.7, ease: ease.out }}
                >
                  <SceneProp scene={scene} year={decade.year} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Preenchimento contínuo da aba conforme o scroll avança dentro da década. */
function ScrollFill({ progress, index, total }: { progress: MotionValue<number>; index: number; total: number }) {
  const scaleX = useTransform(progress, [index / total, (index + 1) / total], [0, 1], { clamp: true });
  return <motion.span className={cn(styles.fill, "origin-left")} style={{ scaleX }} />;
}
