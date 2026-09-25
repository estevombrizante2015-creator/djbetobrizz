import type { SetItem } from "./types";

/**
 * Sets musicais ("LISTEN TO THE MIX").
 * Adicione a URL de cada set do SoundCloud. Exemplo:
 *   { title: "DJ BetoBrizz — Set Flashback", platform: "SoundCloud", url: "https://soundcloud.com/beto-brizz-dj/nome-do-set", genre: "Flashback" }
 *
 * Enquanto a lista estiver vazia, a seção incorpora o perfil completo do SoundCloud.
 */
export const sets: SetItem[] = [];
