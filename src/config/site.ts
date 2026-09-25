/**
 * Configuração central do site.
 * Contatos, redes sociais e textos principais ficam aqui — os componentes leem deste arquivo.
 */

const whatsappNumber = "5519996441824";
const whatsappMessage =
  "Olá Beto! Vi seu site e gostaria de saber mais sobre seu trabalho para um evento.";
const availabilityMessage = "Olá Beto! Vi seu site e gostaria de verificar sua disponibilidade para uma data.";

export const siteConfig = {
  name: "DJ BetoBrizz",
  shortName: "BetoBrizz",
  title: "DJ & VJ",
  tagline: "Music • Video • Entertainment",
  experienceName: "BetoBrizz — Sound & Visual Experience",
  heroText: "Música, imagem e energia para transformar seu evento em uma experiência inesquecível.",

  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://djbetobrizz.com.br",
  locale: "pt_BR",

  location: "Mogi Guaçu • Mogi Mirim • SP",
  region: "Atendimento para eventos em toda a região.",
  /** Cidades atendidas — mantenha apenas as que são realmente atendidas. */
  cities: ["Mogi Guaçu", "Mogi Mirim", "Estiva Gerbi", "Itapira", "Campinas e região"],

  /** Número do WhatsApp (só dígitos, para links wa.me). */
  whatsapp: whatsappNumber,
  /** Número formatado para exibir como texto no site. */
  whatsappDisplay: "+55 19 99644-1824",
  whatsappMessage,
  whatsappUrl: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`,
  /** CTA principal ("VERIFICAR DISPONIBILIDADE") — WhatsApp com mensagem sobre data. */
  availabilityMessage,
  availabilityUrl: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(availabilityMessage)}`,

  instagram: "https://www.instagram.com/djbetobrizzoficial/",
  instagramHandle: "@djbetobrizzoficial",
  facebook: "https://www.facebook.com/djbetobrizz/",
  facebookName: "Beto Brizz DJ VJ",
  soundcloud: "https://soundcloud.com/beto-brizz-dj",
  soundcloudName: "Beto Brizz DJ",

  logo: {
    /** Alta resolução — usada só no hero (imagem LCP). */
    src: "/images/logo/betobrizz-logo.webp",
    /** Versão leve para cabeçalho, rodapé e selos. */
    srcSmall: "/images/logo/betobrizz-logo-sm.webp",
    /** PNG para JSON-LD / compartilhamento. */
    png: "/images/logo/betobrizz-logo.png",
    alt: "DJ BetoBrizz",
  },
  profileImage: "/images/profile/betobrizz-perfil.webp",

  /**
   * Vídeo de fundo do hero (opcional). Coloque os arquivos em public/videos/
   * e preencha os caminhos. Sem vídeo, o hero usa `heroImage` + efeitos.
   * Ex.: { desktop: "/videos/betobrizz-intro.mp4", poster: "/images/art/betobrizz-intro-poster.webp" }
   */
  heroVideo: null as null | { desktop: string; mobile?: string; poster: string },
  heroImage: {
    desktop: "/images/events/betobrizz-telao-vermelho.webp",
    mobile: "/images/events/betobrizz-pista-magenta.webp",
    alt: "DJ BetoBrizz se apresentando ao vivo diante de telões de LED",
  },

  /** ID do Google Analytics 4 (ex.: "G-XXXXXXX"). Também pode vir de NEXT_PUBLIC_GA_ID. */
  gaId: process.env.NEXT_PUBLIC_GA_ID ?? "",
} as const;

export type SiteConfig = typeof siteConfig;
