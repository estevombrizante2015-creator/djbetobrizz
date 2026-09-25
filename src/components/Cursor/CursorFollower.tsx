"use client";

import { useEffect, useRef, useState } from "react";
import { m, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

const INTERACTIVE = 'a[href], button, [role="button"], [data-cursor], label, summary, select, input, textarea';

/**
 * Ponto neon + anel com mola; sobre elementos interativos o anel cresce, vira círculo
 * contínuo e troca o glow (ciano → magenta). O cursor nativo continua visível.
 * Só transform nos elementos que se movem; estado React muda apenas em hover/press/visibilidade.
 */
export default function CursorFollower() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 380, damping: 32, mass: 0.55 });
  const ringY = useSpring(y, { stiffness: 380, damping: 32, mass: 0.55 });
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  const visibleRef = useRef(false);

  useEffect(() => {
    const show = (value: boolean) => {
      if (visibleRef.current === value) return;
      visibleRef.current = value;
      setVisible(value);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!visibleRef.current) {
        // primeira aparição: sem "voar" do canto — a mola já parte da posição do mouse
        ringX.jump(e.clientX);
        ringY.jump(e.clientY);
      }
      x.set(e.clientX);
      y.set(e.clientY);
      show(true);
    };
    const onOver = (e: PointerEvent) => {
      const target = e.target;
      setHover(target instanceof Element && target.closest(INTERACTIVE) !== null);
    };
    const onOut = (e: PointerEvent) => {
      if (e.relatedTarget === null) show(false); // saiu da janela
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onBlur = () => {
      show(false);
      setPressed(false);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [x, y, ringX, ringY]);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 z-[90] transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <m.div className="absolute top-0 left-0" style={{ x: ringX, y: ringY }}>
        <span
          className={cn(
            "block size-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px]",
            "transition-[scale,border-color,background-color,box-shadow] duration-300 ease-out",
            hover
              ? "border-solid border-magenta bg-magenta/10 shadow-[0_0_18px_rgb(255_20_147/0.55),inset_0_0_10px_rgb(255_20_147/0.3)]"
              : "border-dashed border-cyan/55 shadow-[0_0_10px_rgb(0_229_255/0.18)]",
            hover ? (pressed ? "scale-[0.85]" : "scale-100") : pressed ? "scale-[0.45]" : "scale-[0.62]",
          )}
        />
      </m.div>
      <m.div className="absolute top-0 left-0" style={{ x, y }}>
        <span
          className={cn(
            "block size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[background-color,box-shadow,scale] duration-200",
            hover
              ? "scale-125 bg-magenta shadow-[0_0_8px_2px_rgb(255_20_147/0.7)]"
              : "bg-cyan shadow-[0_0_8px_2px_rgb(0_229_255/0.6)]",
          )}
        />
      </m.div>
    </div>
  );
}
