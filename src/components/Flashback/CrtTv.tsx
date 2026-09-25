import { AnimatePresence, motion } from "motion/react";
import { VhsOverlay } from "@/components/Effects/VhsOverlay";
import { KnobIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { SceneScreen, type SceneKey } from "./scenes";
import styles from "./Flashback.module.css";

type Props = {
  scene: SceneKey;
  index: number;
  total: number;
  /** Estado do "videocassete" mostrado no OSD. */
  mode: "PLAY" | "PAUSE";
  reducedMotion: boolean;
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Televisão CRT desenhada em CSS: tela curva com scanlines, OSD de canal e overlay VHS.
 * O knob da marca (o "O" de BETO) é o seletor de canal — gira a cada década.
 * Puramente decorativa: o conteúdo acessível fica no painel de texto ao lado.
 */
export function CrtTv({ scene, index, total, mode, reducedMotion }: Props) {
  const knobAngle = total > 1 ? -135 + (270 * index) / (total - 1) : 0;

  return (
    <div aria-hidden className={styles.tv}>
      <div className={styles.cabinet}>
        <div className={styles.tvBody}>
          <div className={styles.bezel}>
            <div className={styles.screen}>
              <AnimatePresence initial={false}>
                <motion.div
                  key={`${scene}-${index}`}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className={cn("absolute inset-0", !reducedMotion && styles.channelOn)}>
                    <SceneScreen scene={scene} />
                  </div>
                </motion.div>
              </AnimatePresence>

              {!reducedMotion ? <span key={`static-${index}`} className={styles.static} /> : null}
              <span className={styles.screenFx} />
              {!reducedMotion ? <span className={styles.rollbar} /> : null}
              <span key={`osd-${index}`} className={cn("vhs", styles.osd)}>
                CH {pad(index + 1)}
              </span>
              <VhsOverlay mode={mode} track={`TRACK ${pad(index + 1)}`} start={92 + index * 47} />
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
    </div>
  );
}
