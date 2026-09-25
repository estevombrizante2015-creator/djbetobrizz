import Image from "next/image";
import { siteConfig } from "@/config/site";
import { getImageMeta, cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Largura renderizada aproximada (para o atributo sizes). */
  sizes?: string;
  /** Carregar com prioridade (apenas acima da dobra). */
  eager?: boolean;
  alt?: string;
};

/** Logo oficial BetoBrizz DJ — variante para fundo escuro (PNG transparente). */
export function Logo({ className, sizes = "240px", eager = false, alt = siteConfig.logo.alt }: Props) {
  const meta = getImageMeta(siteConfig.logo.src);
  return (
    <Image
      src={siteConfig.logo.src}
      width={meta.width}
      height={meta.height}
      alt={alt}
      sizes={sizes}
      quality={85}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      className={cn("h-auto w-full select-none", className)}
      draggable={false}
    />
  );
}
