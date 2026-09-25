import type { EventItem } from "./types";

/**
 * Eventos exibidos em "ONDE A MÚSICA ACONTECE".
 * As fotos com o rótulo curto (`type`) são o conteúdo final — nome, cidade e data são opcionais
 * e só aparecem se forem preenchidos.
 */
export const events: EventItem[] = [
  {
    type: "Pista lotada",
    image: {
      src: "/images/events/betobrizz-pista-dourada.webp",
      alt: "Pista lotada sob feixes de luz dourados vindos do palco do DJ BetoBrizz",
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
    type: "Luz & som",
    image: {
      src: "/images/events/betobrizz-moving-heads.webp",
      alt: "Feixes brancos de moving heads cortando o salão sobre o público",
    },
  },
  {
    type: "Energia",
    image: {
      src: "/images/events/betobrizz-pista-lotada-feixes.webp",
      alt: "Salão lotado com feixes amarelos e azuis de iluminação sobre a pista",
    },
  },
  {
    type: "Palco completo",
    image: {
      src: "/images/events/betobrizz-palco-telas-retro.webp",
      alt: "Palco do DJ BetoBrizz com telões em formato de TV retrô, treliça de iluminação e bateria",
    },
    featured: true,
  },
  {
    type: "Pista cheia",
    image: {
      src: "/images/events/betobrizz-pista-danca.webp",
      alt: "Público dançando na pista sob luzes rosa e roxas",
    },
  },
  {
    type: "Ao vivo",
    image: {
      src: "/images/events/betobrizz-pista-magenta.webp",
      alt: "DJ BetoBrizz de costas comandando a pista lotada sob luzes magenta e vermelhas",
    },
  },
  {
    type: "Mixagem ao vivo",
    image: {
      src: "/images/events/betobrizz-controladora.webp",
      alt: "DJ BetoBrizz mixando em uma controladora Pioneer com fones de ouvido sob luz verde",
    },
  },
];
