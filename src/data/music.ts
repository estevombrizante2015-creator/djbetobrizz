import { musicLibrary } from "./music.generated";

export type Track = {
  title: string;
  artist: string;
  /** Caminho em public/ (ex.: "/audio/faixa.mp3") */
  src: string;
  /** Capa quadrada (opcional) */
  cover?: string;
};

/**
 * Música de fundo do site (botão SOM). A lista vem de musicadefundo/ via `npm run audio`.
 * Para reordenar ou esconder faixas, troque por uma lista manual, ex.:
 *   export const playlist = [musicLibrary[2], musicLibrary[0]];
 */
export const playlist: Track[] = musicLibrary;
