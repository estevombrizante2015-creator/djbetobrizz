import Script from "next/script";
import { siteConfig } from "@/config/site";

/** Google Analytics 4 — carregado só quando há um ID configurado (siteConfig.gaId / NEXT_PUBLIC_GA_ID). */
export function Analytics() {
  const id = siteConfig.gaId;
  if (!id || !/^G-[A-Z0-9]+$/i.test(id)) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  );
}
