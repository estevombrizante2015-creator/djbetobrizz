/**
 * Eventos de analytics. Envia para o GA4 (gtag) e/ou dataLayer quando existirem;
 * sem analytics configurado, as chamadas são ignoradas silenciosamente.
 */
export type AnalyticsEvent =
  | "page_view"
  | "whatsapp_click"
  | "instagram_click"
  | "facebook_click"
  | "soundcloud_click"
  | "video_play"
  | "gallery_open"
  | "cta_click"
  | "experience_mode"
  | "music_toggle";

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: AnalyticsEvent, params: Params = {}) {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", event, params);
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event, ...params });
    }
    if (process.env.NODE_ENV === "development") {
      console.debug("[analytics]", event, params);
    }
  } catch {
    // analytics nunca deve quebrar a página
  }
}

/** Evento correspondente a um link social. */
export function socialEvent(key: "instagram" | "facebook" | "soundcloud" | "whatsapp"): AnalyticsEvent {
  return `${key}_click` as AnalyticsEvent;
}
