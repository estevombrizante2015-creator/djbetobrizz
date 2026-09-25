"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type RefObject } from "react";
import {
  AnimatePresence,
  m,
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
import { SceneBackdrop, SceneProp, sceneFor, sceneTheme } from "./scenes";
import styles from "./Flashback.module.css";

type Decade = (typeof decadesData)[number];

const pad = (n: number) => String(n).padStart(2, "0");

/** Botões de "videocassete" do modo abas (voltar/avançar década). */
const deckBtn =
  "vhs inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong bg-void/40 px-5 text-xl text-white transition-colors hover:border-white/50";

/** O til da Orbitron parece crase (Ã → À): textos com til usam a fonte HUD. */
const hasTilde = (s: string) => /[ãõñÃÕÑ]/.test(s);

/**
 * Máquina do tempo 1980 → 1990 → 2000 → TODAY.
 * - Modo completo + desktop (sem reduced motion): trilho alto com palco "sticky";
 *   o progresso do scroll escolhe a década (hooks de scroll isolados em <ScrollDriver>,
 *   setState só quando a década muda). Troca com glitch, chuvisco e cross-fade.
 * - Níveis "balanced" (celulares, tablets, PCs comuns) e "lite" / reduced motion: palco compacto
 *   com abas (tablist) trocadas só pelo usuário — sem loops, sem scroll JS, sem timers,
 *   cenários estáticos. Troca: "balanced" ganha um glitch único só em CSS (transform/opacidade);
 *   "lite" e reduced motion, um simples fade de opacidade.
 * O layout de cada modo é decidido no CSS por html[data-perf] + media query (sem salto na hidratação).
 */
export function TimeMachine({ decades }: { decades: Decade[] }) {
  const n = decades.length;
  const { tier, isDesktop, reducedMotion } = useExperience();
  const scrollMode = isDesktop && !reducedMotion;
  /** Só no nível "full": cross-fades (motion), chuvisco, timecode vivo, REC piscando, cenários animados. */
  const fx = tier === "full" && !reducedMotion;
  /** Glitch de troca de uma vez só (CSS, sem trabalho contínuo) — níveis "full" e "balanced". */
  const glitch = tier !== "lite" && !reducedMotion;

  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [index, setIndex] = useState(0);
  /** Já houve troca de década? (as animações de troca não rodam na montagem) */
  const [swapped, setSwapped] = useState(false);
  const [progress, setProgress] = useState<MotionValue<number> | null>(null);

  const select = useCallback((i: number) => {
    setIndex(i);
    setSwapped(true);
  }, []);

  const active = Math.min(index, n - 1);
  const decade = decades[active];
  const scene = sceneFor(decade.year, active);
  const theme = sceneTheme[scene];
  const maxChars = Math.max(4, ...decades.map((d) => d.year.length));
  const animateSwap = swapped && !reducedMotion;
  const yearFont = hasTilde(decade.year) ? styles.yearHud : null;

  const goTo = (i: number) => {
    if (!scrollMode) {
      select(i);
      return;
    }
    const track = trackRef.current;
    if (!track) return;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const dist = track.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (dist * (i + 0.5)) / n, behavior: "smooth" });
  };

  const step = (delta: number) => goTo((active + delta + n) % n);

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
      {scrollMode ? (
        <ScrollDriver trackRef={trackRef} total={n} current={active} onIndex={select} onProgress={setProgress} />
      ) : null}
      {fx ? <PauseOffscreen target={stageRef} /> : null}

      <div ref={stageRef} className={styles.stage} data-scene={scene} style={{ "--acc": theme.acc } as CSSProperties}>
        {/* Fundo de tela cheia — muda a cada década */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {fx ? (
            <AnimatePresence initial={false}>
              <m.div
                key={`${scene}-${active}`}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: ease.inOut }}
              >
                <SceneBackdrop scene={scene} />
              </m.div>
            </AnimatePresence>
          ) : (
            <div key={`${scene}-${active}`} className={cn("absolute inset-0", animateSwap && styles.fadeIn)}>
              <SceneBackdrop scene={scene} />
            </div>
          )}
          <div className={styles.stageShade} />
          {glitch && swapped ? <span key={`burst-${active}`} className={styles.burst} /> : null}
        </div>

        <div className={cn("container-bb", styles.stageGrid)}>
          {/* Texto + seletor de década */}
          <div className={styles.info}>
            <p className="hud flex items-center gap-3 text-white/85">
              <span aria-hidden className={cn("size-2 rounded-full bg-red shadow-neon-red", fx && "animate-rec")} />
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
                {/* Brilho neon estático (text-shadow) atrás do ano em gradiente — sem filter: drop-shadow */}
                <span
                  key={`glow-${active}`}
                  aria-hidden
                  className={cn(styles.year, styles.yearGlow, styles[`glow_${scene}`], yearFont, glitch && swapped && styles.yearEnter)}
                >
                  {decade.year}
                </span>
                <h3
                  key={`year-${active}`}
                  className={cn(styles.year, styles[`year_${scene}`], yearFont, glitch && swapped && styles.yearEnter)}
                >
                  {decade.year}
                </h3>
                {glitch && swapped ? (
                  <>
                    <span key={`ga-${active}`} aria-hidden className={cn(styles.year, styles.ghost, styles.ghostA, yearFont)}>
                      {decade.year}
                    </span>
                    <span key={`gb-${active}`} aria-hidden className={cn(styles.year, styles.ghost, styles.ghostB, yearFont)}>
                      {decade.year}
                    </span>
                  </>
                ) : null}
              </div>
              <p className={cn("mt-3 font-hud text-xl font-bold tracking-[0.22em] uppercase sm:text-2xl", theme.label)}>
                {decade.label}
              </p>
              <p className="mt-2 min-h-[3.25em] max-w-md text-base leading-relaxed text-white/85 sm:text-lg">{decade.hint}</p>
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
                      {progress ? (
                        <ScrollFill progress={progress} index={i} total={n} />
                      ) : (
                        <span className={cn(styles.fill, i <= active && styles.fillFull)} />
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-bold tracking-wider transition-colors sm:text-base",
                        hasTilde(d.year) ? "font-hud" : "font-display",
                        selected ? "text-white" : "text-mute group-hover/tab:text-white",
                      )}
                    >
                      {d.year}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex min-h-11 items-center gap-3">
              {scrollMode ? (
                <p className="hud flex items-center gap-3 text-mute">
                  <ArrowDownIcon size={16} className="animate-scroll-cue text-(--acc)" />
                  {active < n - 1 ? "Role para viajar no tempo" : "Role para continuar"}
                </p>
              ) : (
                <>
                  <button type="button" onClick={() => step(-1)} className={deckBtn}>
                    <span aria-hidden className="text-(--acc)">
                      ◀◀
                    </span>
                    REW
                    <span className="sr-only"> (década anterior)</span>
                  </button>
                  <button type="button" onClick={() => step(1)} className={deckBtn}>
                    FF
                    <span className="sr-only"> (próxima década)</span>
                    <span aria-hidden className="text-(--acc)">
                      ▶▶
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* TV + mídia da década */}
          <div className={styles.tvCol}>
            <CrtTv scene={scene} index={active} total={n} fx={fx} glitch={glitch} animateSwap={animateSwap}>
              {fx ? (
                <AnimatePresence initial={false}>
                  <m.div
                    key={scene}
                    data-prop={scene}
                    className={styles.prop}
                    initial={{ opacity: 0, y: 40, rotate: -11 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    exit={{ opacity: 0, y: 24, rotate: 11 }}
                    transition={{ duration: 0.7, ease: ease.out }}
                  >
                    <div className={styles.propTilt}>
                      <SceneProp scene={scene} year={decade.year} />
                    </div>
                  </m.div>
                </AnimatePresence>
              ) : (
                <div
                  key={scene}
                  data-prop={scene}
                  className={cn(styles.prop, animateSwap && (glitch ? styles.propIn : styles.fadeIn))}
                >
                  <div className={styles.propTilt}>
                    <SceneProp scene={scene} year={decade.year} />
                  </div>
                </div>
              )}
            </CrtTv>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Só no modo scroll (desktop capaz): liga o progresso do trilho à década.
 * Chama onIndex apenas quando a década muda (nunca por evento de scroll).
 */
function ScrollDriver({
  trackRef,
  total,
  current,
  onIndex,
  onProgress,
}: {
  trackRef: RefObject<HTMLDivElement | null>;
  total: number;
  current: number;
  onIndex: (i: number) => void;
  onProgress: (p: MotionValue<number> | null) => void;
}) {
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const last = useRef(current);

  const report = useCallback(
    (p: number) => {
      const i = Math.min(total - 1, Math.max(0, Math.floor(p * total)));
      if (i === last.current) return;
      last.current = i;
      onIndex(i);
    },
    [total, onIndex],
  );

  useMotionValueEvent(scrollYProgress, "change", report);

  // Ao entrar no modo scroll (após hidratação), expõe o progresso e sincroniza com a posição atual.
  useEffect(() => {
    onProgress(scrollYProgress);
    const id = requestAnimationFrame(() => report(scrollYProgress.get()));
    return () => {
      cancelAnimationFrame(id);
      onProgress(null);
    };
  }, [scrollYProgress, onProgress, report]);

  return null;
}

/** Fora da tela (modo completo): congela as animações CSS do palco — sem re-render (atributo direto no DOM). */
function PauseOffscreen({ target }: { target: RefObject<HTMLElement | null> }) {
  useEffect(() => {
    const el = target.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => el.toggleAttribute("data-paused", !entry.isIntersecting));
    io.observe(el);
    return () => {
      io.disconnect();
      el.removeAttribute("data-paused");
    };
  }, [target]);
  return null;
}

/** Preenchimento contínuo da aba conforme o scroll avança dentro da década (motion value, sem re-render). */
function ScrollFill({ progress, index, total }: { progress: MotionValue<number>; index: number; total: number }) {
  const scaleX = useTransform(progress, [index / total, (index + 1) / total], [0, 1], { clamp: true });
  return <m.span className={cn(styles.fill, "origin-left")} style={{ scaleX }} />;
}
