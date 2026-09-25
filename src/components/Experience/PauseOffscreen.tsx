"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import styles from "./TheExperience.module.css";

type Props = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Pausa as animações CSS dos filhos quando a área sai da tela ou a aba fica oculta.
 * Não re-renderiza: apenas alterna `data-paused` no DOM.
 */
export function PauseOffscreen({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let visible = false;
    const apply = () => {
      el.dataset.paused = visible && !document.hidden ? "false" : "true";
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        apply();
      },
      { rootMargin: "120px 0px" },
    );
    io.observe(el);
    document.addEventListener("visibilitychange", apply);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", apply);
    };
  }, []);

  return (
    <div ref={ref} data-paused="true" className={cn(styles.pausable, className)}>
      {children}
    </div>
  );
}
