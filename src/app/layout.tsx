import type { Metadata, Viewport } from "next";
import { Inter, Orbitron, Rajdhani, VT323 } from "next/font/google";
import { siteConfig } from "@/config/site";
import { Providers } from "@/components/Providers";
import { Analytics } from "@/components/Analytics";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  display: "swap",
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
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
  logo: `${siteConfig.url}${siteConfig.logo.src}`,
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
      className={`${orbitron.variable} ${rajdhani.variable} ${inter.variable} ${vt323.variable} antialiased`}
    >
      <body className="min-h-dvh bg-void text-white">
        <a
          href="#conteudo"
          className="hud fixed top-3 left-3 z-[100] -translate-y-20 rounded-full bg-cyan px-4 py-2 text-void transition-transform focus:translate-y-0"
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
