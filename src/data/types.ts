export type Photo = {
  /** Caminho em public/ (ex.: "/images/events/foto.webp") */
  src: string;
  alt: string;
  /** Legenda curta opcional exibida na galeria */
  caption?: string;
};

export type EventItem = {
  /** Nome do evento. Deixe sem preencher se não quiser divulgar o nome. */
  title?: string;
  /** Cidade - UF */
  location?: string;
  /** Data livre (ex.: "Mar 2026") */
  date?: string;
  /** Tipo/rótulo curto (ex.: "Festa Flashback", "Clube", "Ao vivo") */
  type?: string;
  description?: string;
  image: Photo;
  /** Vídeo hospedado em public/videos/ (opcional) */
  video?: string;
  /** Destacar em tamanho maior na grade */
  featured?: boolean;
};

export type VideoItem = {
  title: string;
  subtitle?: string;
  platform: "youtube" | "vimeo" | "instagram" | "file";
  /** YouTube/Vimeo: ID do vídeo · Instagram: URL do post/reel · file: caminho em public/videos/ */
  id: string;
  /** Capa (obrigatória para instagram e file; YouTube usa a capa oficial se omitida) */
  poster?: string;
};

export type SetItem = {
  title: string;
  platform: "SoundCloud";
  /** URL da faixa, set ou playlist no SoundCloud */
  url: string;
  genre?: string;
  duration?: string;
};
