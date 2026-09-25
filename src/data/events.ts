import type { EventItem } from "./types";

/**
 * Eventos exibidos em "ONDE A MÚSICA ACONTECE".
 * As fotos com o rótulo curto (`type`) são o conteúdo final — nome, cidade e data são opcionais
 * e só aparecem se forem preenchidos.
 */
export const events: EventItem[] = [
  {
    type: "Ao vivo",
    image: {
      src: "/images/events/betobrizz-pista-magenta.webp",
      alt: "DJ BetoBrizz de costas comandando a pista lotada sob luzes magenta e vermelhas",
    },
    featured: true,
  },
  {
    type: "DJ + telão",
    image: {
      src: "/images/events/betobrizz-telao-vermelho.webp",
      alt: "DJ BetoBrizz mixando na controladora diante de telões de LED com visuais vermelhos",
    },
  },
  {
    type: "Pista cheia",
    image: {
      src: "/images/events/betobrizz-pista-verde.webp",
      alt: "Vista da cabine do DJ BetoBrizz para o público dançando sob luzes verdes e moving heads",
    },
  },
  {
    type: "Palco completo",
    image: {
      src: "/images/events/betobrizz-palco-telas-retro.webp",
      alt: "Palco com cabine do DJ BetoBrizz, telões em formato de TV retrô, treliça de iluminação e bateria",
    },
    featured: true,
  },
  {
    type: "Na cabine",
    image: {
      src: "/images/events/betobrizz-controladora.webp",
      alt: "DJ BetoBrizz mixando em uma controladora Pioneer com fones de ouvido sob luz verde",
    },
  },
  {
    type: "Set ao vivo",
    image: {
      src: "/images/events/betobrizz-cabine-pioneer.webp",
      alt: "DJ BetoBrizz na cabine com controladora Pioneer e notebook",
    },
  },
];
