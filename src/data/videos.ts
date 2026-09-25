import type { VideoItem } from "./types";

/**
 * Vídeos de apresentações ("SEE THE VIBE").
 * Exemplos:
 *   { title: "Festa Flashback", subtitle: "Mogi Guaçu - SP", platform: "youtube", id: "ID_DO_VIDEO" }
 *   { title: "Reel ao vivo", platform: "instagram", id: "https://www.instagram.com/reel/XXXX/", poster: "/images/events/foto.webp" }
 *   { title: "Abertura", platform: "file", id: "/videos/abertura.mp4", poster: "/images/events/foto.webp" }
 *
 * Enquanto a lista estiver vazia, a seção mostra um convite para assistir no Instagram.
 */
export const videos: VideoItem[] = [
  {
    title: "BetoBrizz — Sound & Visual",
    subtitle: "Abertura / VJ",
    platform: "file",
    id: "/videos/betobrizz-intro.mp4",
    poster: "/images/art/betobrizz-intro-poster.webp",
  },
];
