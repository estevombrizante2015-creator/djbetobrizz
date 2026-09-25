import Image from "next/image";
import { siteConfig } from "@/config/site";
import { getImageMeta, cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Largura renderizada aproximada (para o atributo sizes). */
  sizes?: string;
  /** Carregamento imediato (acima da dobra). */
  eager?: boolean;
  /**
   * Arquivo em alta resolução + prioridade alta (imagem LCP do hero).
   * Padrão: igual a `eager`. Logos pequenos acima da dobra (cabeçalho) usam `eager hd={false}`.
   */
  hd?: boolean;
  alt?: string;
};

/** Logo oficial BetoBrizz DJ (WebP transparente). */
export function Logo({ className, sizes = "240px", eager = false, hd = eager, alt = siteConfig.logo.alt }: Props) {
  const src = hd ? siteConfig.logo.src : siteConfig.logo.srcSmall;
  const meta = getImageMeta(src);
  return (
    <Image
      src={src}
      width={meta.width}
      height={meta.height}
      alt={alt}
      sizes={sizes}
      quality={85}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={hd ? "high" : "auto"}
      className={cn("h-auto w-full select-none", className)}
      draggable={false}
    />
  );
}
