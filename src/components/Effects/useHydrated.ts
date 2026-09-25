"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * `false` no servidor e durante a hidratação; `true` depois.
 * Use para decidir o que depende de APIs do navegador (ex.: prefers-reduced-motion)
 * sem divergir do HTML do servidor.
 */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
