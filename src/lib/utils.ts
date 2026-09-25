import { imageMeta, type ImageMeta } from "@/data/image-meta.generated";

/** Junta classes condicionais (sem dependência externa). */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const FALLBACK_META: ImageMeta = { width: 1600, height: 1067, blurDataURL: "" };

/**
 * Dimensões + blur placeholder de uma imagem em public/images.
 * Gerado por `npm run images` (scripts/process-images.mjs).
 */
export function getImageMeta(src: string): ImageMeta {
  return imageMeta[src] ?? FALLBACK_META;
}

/**
 * Props prontas para <Image> do next/image a partir de um caminho local:
 * width, height e placeholder blur quando disponível.
 */
export function imageProps(src: string) {
  const meta = getImageMeta(src);
  return {
    src,
    width: meta.width,
    height: meta.height,
    ...(meta.blurDataURL ? { placeholder: "blur" as const, blurDataURL: meta.blurDataURL } : {}),
  };
}

/** Garante que um link externo é http(s) — evita `javascript:` e similares vindos dos dados. */
export function safeExternalUrl(url: string): string | undefined {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

/** Formata segundos como timecode VHS (00:01:32). */
export function timecode(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
