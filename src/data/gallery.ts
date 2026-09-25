import type { Photo } from "./types";
import { events } from "./events";

/**
 * Galeria "Digital Contact Sheet".
 * Para adicionar fotos: coloque o arquivo em public/images/gallery/ (ou outra pasta),
 * rode `npm run images` e adicione um item aqui.
 *
 * Só fotos que NÃO aparecem em "Eventos" (src/data/events.ts) — repetir as mesmas fotos
 * duas seções depois deixa a página longa e repetitiva no celular.
 * A ordem separa as fotos parecidas (Feixes x Salão; Faders x Mixagem; as duas artes com o logo)
 * para que nunca fiquem lado a lado nem empilhadas nas grades de 2, 3 ou 4 colunas.
 */
export const gallery: Photo[] = [
  {
    src: "/images/events/betobrizz-mixagem-close-azul.webp",
    alt: "Mãos do DJ nos faders e botões da controladora, telão ao fundo",
    caption: "Faders",
  },
  {
    src: "/images/events/betobrizz-pista-verde.webp",
    alt: "Público dançando sob luzes verdes e feixes roxos, visto do palco",
    caption: "Vista do palco",
  },
  {
    src: "/images/art/betobrizz-neon-stage.webp",
    alt: "Logo DJ BetoBrizz em neon sobre palco com caixas de som e piso quadriculado",
    caption: "Identidade",
  },
  {
    src: "/images/profile/betobrizz-perfil.webp",
    alt: "Retrato do DJ BetoBrizz de jaqueta de couro diante de um painel de LED",
    caption: "BetoBrizz",
  },
  {
    src: "/images/events/betobrizz-set-pioneer.webp",
    alt: "DJ BetoBrizz tocando com controladora Pioneer e notebook",
    caption: "Set",
  },
  {
    src: "/images/events/betobrizz-mixagem-close.webp",
    alt: "Close das mãos do DJ BetoBrizz na controladora Pioneer",
    caption: "Mixagem",
  },
  {
    src: "/images/events/betobrizz-pista-feixes-centro.webp",
    alt: "Feixes de luz convergindo no centro do salão sobre a pista cheia",
    caption: "Feixes",
  },
  {
    src: "/images/events/betobrizz-equipe-palco.webp",
    alt: "Equipe reunida no palco ao lado das controladoras, sob luz amarela",
    caption: "Equipe",
  },
  {
    src: "/images/art/betobrizz-arena.webp",
    alt: "Arte de palco com o logo DJ BetoBrizz, lasers e torres de som",
    caption: "Sound & Visual",
  },
  {
    src: "/images/events/betobrizz-pista-registro.webp",
    alt: "Público registrando a festa com o celular sob luzes azuis",
    caption: "Registro",
  },
  {
    src: "/images/events/betobrizz-fones-controladora.webp",
    alt: "DJ BetoBrizz de fones de ouvido ajustando a controladora",
    caption: "Fones",
  },
  {
    src: "/images/events/betobrizz-pista-azul.webp",
    alt: "Salão com luzes azuis e amarelas e o público dançando",
    caption: "Salão",
  },
];

/**
 * Texto alternativo de uma foto do site pelo caminho — procura na galeria e nas fotos de "Eventos".
 * Use em vez de `gallery.find(...)` quando a foto pode estar só em events.ts.
 */
export function photoAlt(src: string): string | undefined {
  return gallery.find((p) => p.src === src)?.alt ?? events.find((e) => e.image.src === src)?.image.alt;
}
