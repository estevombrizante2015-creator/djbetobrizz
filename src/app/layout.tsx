import type { Metadata, Viewport } from "next";
import { Inter, Orbitron, Rajdhani, VT323 } from "next/font/google";
import { siteConfig } from "@/config/site";
import { Providers } from "@/components/Providers";
import { PERF_TIER_SCRIPT } from "@/lib/perf-tier";
import { Analytics } from "@/components/Analytics";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  display: "swap",
});

// 500 saiu: era usado só no " & " do hero (agora semibold). Um arquivo a menos no preload.
const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

// Texto corrido quase todo abaixo da dobra: sem preload (~48 KB a menos disputando com o CSS e a
// imagem do LCP). `swap` + fallback ajustado do next/font mantêm o layout estável.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const vt323 = VT323({
  variable: "--font-vt323",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const title = "DJ BetoBrizz | DJ & VJ em Mogi Guaçu e Mogi Mirim";
const description =
  "DJ BetoBrizz — DJ e VJ para eventos, festas e experiências audiovisuais em Mogi Guaçu, Mogi Mirim e região.";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title,
  description,
  applicationName: siteConfig.name,
  keywords: [
    "DJ Mogi Guaçu",
    "DJ Mogi Mirim",
    "DJ para festas",
    "DJ para eventos",
    "DJ VJ",
    "DJ Flashback",
    "DJ eletrônico",
    "VJ Mogi Guaçu",
    "DJ região de Campinas",
  ],
  authors: [{ name: siteConfig.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/",
    siteName: siteConfig.name,
    title: "DJ BetoBrizz | DJ & VJ",
    description: "Música, imagem e energia para transformar seu evento.",
    images: [{ url: "/social-preview.jpg", width: 1200, height: 630, alt: "DJ BetoBrizz — Music Video Entertainment" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DJ BetoBrizz | DJ & VJ",
    description: "Música, imagem e energia para transformar seu evento.",
    images: ["/social-preview.jpg"],
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EntertainmentBusiness",
  name: siteConfig.name,
  description,
  url: siteConfig.url,
  image: `${siteConfig.url}/social-preview.jpg`,
  logo: `${siteConfig.url}${siteConfig.logo.png}`,
  telephone: `+${siteConfig.whatsapp}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Mogi Guaçu",
    addressRegion: "SP",
    addressCountry: "BR",
  },
  areaServed: siteConfig.cities.map((name) => ({ "@type": "City", name })),
  sameAs: [siteConfig.instagram, siteConfig.facebook, siteConfig.soundcloud],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-perf="lite"
      suppressHydrationWarning
      className={`${orbitron.variable} ${rajdhani.variable} ${inter.variable} ${vt323.variable} antialiased`}
    >
      <head>
        {/* Decide o nível de efeitos (lite/full) antes da primeira pintura — ver ExperienceContext. */}
        <script dangerouslySetInnerHTML={{ __html: PERF_TIER_SCRIPT }} />
      </head>
      <body className="min-h-dvh bg-void text-white">
        <a
          href="#conteudo"
          className="hud sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-cyan focus:px-4 focus:py-2 focus:text-void"
        >
          Pular para o conteúdo
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
