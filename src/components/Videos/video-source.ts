import type { VideoItem } from "@/data/types";
import { getImageMeta, safeExternalUrl } from "@/lib/utils";

/** Como o vídeo é reproduzido depois do clique na capa (facade). */
export type VideoSource =
  | { kind: "iframe"; src: string }
  | { kind: "file"; src: string }
  | { kind: "link"; href: string };

const YOUTUBE_ID = /^[A-Za-z0-9_-]{6,20}$/;
const VIMEO_ID = /^\d{4,15}$/;

function isHost(url: string, host: string) {
  try {
    const { hostname } = new URL(url);
    return hostname === host || hostname.endsWith(`.${host}`);
  } catch {
    return false;
  }
}

/** Caminho local em public/ (ex.: "/videos/abertura.mp4"). */
function isLocalPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//");
}

/**
 * Resolve o destino de reprodução de um item de `data/videos`.
 * Retorna `null` quando o id/URL é inválido — o card simplesmente não aparece.
 */
export function resolveVideoSource(item: VideoItem): VideoSource | null {
  const id = item.id.trim();
  switch (item.platform) {
    case "youtube":
      return YOUTUBE_ID.test(id)
        ? { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` }
        : null;
    case "vimeo":
      return VIMEO_ID.test(id) ? { kind: "iframe", src: `https://player.vimeo.com/video/${id}?autoplay=1` } : null;
    case "file": {
      if (isLocalPath(id)) return { kind: "file", src: id };
      const url = safeExternalUrl(id);
      return url ? { kind: "file", src: url } : null;
    }
    case "instagram": {
      const url = safeExternalUrl(id);
      return url && isHost(url, "instagram.com") ? { kind: "link", href: url } : null;
    }
    default:
      return null;
  }
}

/**
 * Capa do card: otimizada pelo next/image (só /images/**, o padrão liberado em next.config),
 * <img> simples (outros caminhos locais ou URLs remotas) ou nenhuma (capa neutra).
 */
export type VideoPoster = { kind: "optimized"; src: string } | { kind: "plain"; src: string } | { kind: "none" };

export function resolveVideoPoster(item: VideoItem): VideoPoster {
  const poster = item.poster?.trim();
  if (poster) {
    if (poster.startsWith("/images/")) return { kind: "optimized", src: poster };
    if (isLocalPath(poster)) return { kind: "plain", src: poster };
    const url = safeExternalUrl(poster);
    if (url) return { kind: "plain", src: url };
  }
  if (item.platform === "youtube" && YOUTUBE_ID.test(item.id.trim())) {
    return { kind: "plain", src: `https://i.ytimg.com/vi/${item.id.trim()}/hqdefault.jpg` };
  }
  return { kind: "none" };
}

/**
 * Vertical (9:16, gravado no celular) ou horizontal. Usa `item.orientation`; sem ele,
 * detecta pelas dimensões da capa (image-meta). Sem capa conhecida → horizontal.
 */
export function videoOrientation(item: VideoItem): "landscape" | "portrait" {
  if (item.orientation) return item.orientation;
  const poster = item.poster?.trim();
  if (poster && poster.startsWith("/images/")) {
    const { width, height } = getImageMeta(poster);
    if (height > width) return "portrait";
  }
  return "landscape";
}

/** Rótulo curto da plataforma para o HUD do card. */
export const platformLabel: Record<VideoItem["platform"], string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  instagram: "Instagram",
  file: "Vídeo",
};
