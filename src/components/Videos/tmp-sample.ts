import type { SetItem, VideoItem } from "@/data/types";
export const sampleVideos: VideoItem[] = [
  { title: "Teste YouTube", subtitle: "Cidade - SP", platform: "youtube", id: "dQw4w9WgXcQ" },
  { title: "Teste Instagram", platform: "instagram", id: "https://www.instagram.com/djbetobrizzoficial/", poster: "/images/events/betobrizz-pista-magenta.webp" },
  { title: "Teste arquivo", platform: "file", id: "/videos/nao-existe.mp4", poster: "/images/events/betobrizz-na-cabine.webp" },
  { title: "Sem capa", platform: "vimeo", id: "76979871" },
];
export const sampleSets: SetItem[] = [
  { title: "DJ BetoBrizz — Set Flashback", platform: "SoundCloud", url: "https://soundcloud.com/beto-brizz-dj", genre: "Flashback", duration: "58:12" },
  { title: "Set House", platform: "SoundCloud", url: "https://soundcloud.com/beto-brizz-dj/tracks", genre: "House" },
  { title: "Invalido", platform: "SoundCloud", url: "javascript:alert(1)" },
];
