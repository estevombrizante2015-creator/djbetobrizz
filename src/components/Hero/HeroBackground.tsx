import { getImageProps } from "next/image";
import { siteConfig } from "@/config/site";
import { cn, getImageMeta } from "@/lib/utils";
import { HeroVideo } from "./HeroVideo";
import styles from "./Hero.module.css";

/** Paisagem (desktop, tablet deitado, celular deitado) usa a foto horizontal; retrato usa a vertical. */
const LANDSCAPE = "(orientation: landscape)";

/**
 * Art direction sem download duplo: <picture> com <source media> (docs do next/image).
 * Acima da dobra → eager + fetchPriority high. Placeholders: data URI minúsculo ampliado
 * (a interpolação do navegador já suaviza — sem filter: blur em tela cheia).
 */
function HeroPicture() {
  const { desktop, mobile, alt } = siteConfig.heroImage;
  const common = { alt, fill: true, sizes: "100vw" } as const;
  const {
    props: { srcSet: landscapeSrcSet },
  } = getImageProps({ ...common, src: desktop, quality: 75 });
  const {
    props: { srcSet: portraitSrcSet, ...rest },
  } = getImageProps({ ...common, src: mobile, quality: 60, loading: "eager", fetchPriority: "high" });

  const blurLandscape = getImageMeta(desktop).blurDataURL;
  const blurPortrait = getImageMeta(mobile).blurDataURL;

  return (
    <>
      {blurPortrait ? (
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center landscape:hidden"
          style={{ backgroundImage: `url("${blurPortrait}")` }}
        />
      ) : null}
      {blurLandscape ? (
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-cover bg-center landscape:block"
          style={{ backgroundImage: `url("${blurLandscape}")` }}
        />
      ) : null}
      <picture>
        <source media={LANDSCAPE} srcSet={landscapeSrcSet} sizes="100vw" />
        <img {...rest} srcSet={portraitSrcSet} alt={alt} className="object-cover object-[50%_30%] landscape:object-[50%_28%]" />
      </picture>
    </>
  );
}

/**
 * Fundo do hero: foto com art direction (ou vídeo, só no modo completo).
 * Modo leve: imagem estática. Modo completo: Ken Burns lento + parallax ligado ao scroll,
 * ambos em CSS (scroll-driven animation no compositor — zero JavaScript por frame) — ver Hero.module.css.
 */
export function HeroBackground() {
  const video = siteConfig.heroVideo;
  const picture = <HeroPicture />;

  return (
    <div className="absolute inset-0 overflow-hidden bg-void">
      <div className={cn("absolute inset-0", styles.bgParallax)}>
        <div className={cn("absolute inset-0", styles.kenburns)}>
          {video ? <HeroVideo video={video} fallback={picture} /> : picture}
        </div>
      </div>
      {/* "luzes acendendo" (modo completo): o fundo clareia quando o show começa */}
      <div aria-hidden className={cn("absolute inset-0 bg-void", styles.lightsOn)} />
    </div>
  );
}
