import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * `false` no SSR e durante a hidratação, `true` depois.
 * Evita divergência de markup ao decidir efeitos com base em `reducedMotion`
 * (que só é conhecido no cliente).
 */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
