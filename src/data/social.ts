import { siteConfig } from "@/config/site";

export type SocialKey = "instagram" | "facebook" | "soundcloud" | "whatsapp";

export const socialLinks: { key: SocialKey; label: string; handle: string; href: string }[] = [
  { key: "instagram", label: "Instagram", handle: siteConfig.instagramHandle, href: siteConfig.instagram },
  { key: "facebook", label: "Facebook", handle: siteConfig.facebookName, href: siteConfig.facebook },
  { key: "soundcloud", label: "SoundCloud", handle: siteConfig.soundcloudName, href: siteConfig.soundcloud },
  { key: "whatsapp", label: "WhatsApp", handle: "Fale com BetoBrizz", href: siteConfig.whatsappUrl },
];

/** Itens do menu principal (âncoras da one-page). `deck` é o rótulo estilo equipamento de DJ. */
export const navItems = [
  { id: "inicio", label: "Início", deck: "LIVE" },
  { id: "sobre", label: "Sobre", deck: "DJ" },
  { id: "experiencia", label: "Experiência", deck: "VISUAL" },
  { id: "eventos", label: "Eventos", deck: "EVENTS" },
  { id: "videos", label: "Vídeos", deck: "VIDEO" },
  { id: "sets", label: "Sets", deck: "MIX" },
  { id: "contato", label: "Contato", deck: "CONTACT" },
] as const;

export type NavId = (typeof navItems)[number]["id"];
