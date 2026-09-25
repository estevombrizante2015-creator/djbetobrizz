import type { ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { VhsOverlay } from "@/components/Effects/VhsOverlay";
import { KnobIcon } from "@/components/ui/Icons";
import { cn, timecode } from "@/lib/utils";
import { SceneScreen, type SceneKey } from "./scenes";
import styles from "./Flashback.module.css";

type Props = {
  scene: SceneKey;
  index: number;
  total: number;
  /** Modo completo: chuvisco, rolagem da imagem, "liga o canal" e timecode vivo. */
  fx: boolean;
  /** Anima a troca de canal (só depois da primeira troca feita pelo usuário/scroll). */
  animateSwap: boolean;
  /** Mídia física da década (fita, CD…) — posicionada em relação à TV, sem cobrir o OSD. */
  children?: ReactNode;
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Televisão CRT desenhada em CSS: tela curva com scanlines, OSD de canal e overlay VHS.
 * O knob da marca (o "O" de BETO) é o seletor de canal — gira a cada década.
 * Puramente decorativa: o conteúdo acessível fica no painel de texto ao lado.
 * Modo leve: tudo estático (OSD VHS sem timer, sem chuvisco/rolagem) e troca por fade simples.
 */
export function CrtTv({ scene, index, total, fx, animateSwap, children }: Props) {
  const knobAngle = total > 1 ? -135 + (270 * index) / (total - 1) : 0;
  const track = `TRACK ${pad(index + 1)}`;
  const start = 92 + index * 47;

  return (
    <div aria-hidden className={styles.tv}>
      <div className={styles.cabinet}>
        <div className={styles.tvBody}>
          <div className={styles.bezel}>
            <div className={styles.screen}>
              {fx ? (
                <AnimatePresence initial={false}>
                  <m.div
                    key={`${scene}-${index}`}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className={cn("absolute inset-0", animateSwap && styles.channelOn)}>
                      <SceneScreen scene={scene} />
                    </div>
                  </m.div>
                </AnimatePresence>
              ) : (
                <div key={`${scene}-${index}`} className={cn("absolute inset-0", animateSwap && styles.fadeIn)}>
                  <SceneScreen scene={scene} />
                </div>
              )}

              {fx && animateSwap ? <span key={`static-${index}`} className={styles.static} /> : null}
              <span className={styles.screenFx} />
              {fx ? <span className={styles.rollbar} /> : null}
              {animateSwap ? (
                <span key={`osd-${index}`} className={cn("vhs", styles.osd)}>
                  CH {pad(index + 1)}
                </span>
              ) : null}
              {/* key: cada canal é uma "fita" nova — o timecode recomeça do ponto da faixa */}
              {fx ? (
                <VhsOverlay key={`vhs-${index}`} mode="PLAY" track={track} start={start} />
              ) : (
                <StaticVhsOsd track={track} start={start} />
              )}
            </div>
          </div>

          {/* Painel lateral: canal, knobs, alto-falante */}
          <div className={styles.panel}>
            <span className={styles.led}>
              <span className="vhs text-red">{pad(index + 1)}</span>
            </span>
            <span className={styles.knobWrap}>
              <span className={styles.ticks} />
              <span className={styles.knob} style={{ rotate: `${knobAngle}deg` }} />
            </span>
            <span className={cn(styles.knob, styles.knobSmall)} style={{ rotate: "-40deg" }} />
            <span className={styles.grille} />
            <span className={styles.power} />
          </div>
        </div>

        <div className={styles.plate}>
          <KnobIcon className="size-[1.1em]" />
          <span>BETOBRIZZ</span>
        </div>
      </div>
      <div className={styles.feet}>
        <span />
        <span />
      </div>
      {/* Espaço para a mídia "apoiada" na frente da TV (medido em cqi da própria TV) */}
      <div className={styles.propSpace} />
      {children ? <div className={styles.propSlot}>{children}</div> : null}
    </div>
  );
}

/** OSD VHS estático (modo leve): mesmo visual do VhsOverlay, sem timer nem REC piscando. */
function StaticVhsOsd({ track, start }: { track: string; start: number }) {
  return (
    <div className="vhs pointer-events-none absolute inset-0 z-10 p-4 text-base text-white/90 sm:p-6 sm:text-xl">
      <div className="flex items-start justify-between">
        <span className="flex items-center gap-2">
          PLAY <span>▶</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="text-red">●</span> REC
        </span>
      </div>
      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between sm:inset-x-6 sm:bottom-6">
        <span>{track}</span>
        <span className="tabular-nums">{timecode(start)}</span>
      </div>
    </div>
  );
}
