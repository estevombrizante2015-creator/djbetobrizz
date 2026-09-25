import Image from "next/image";
import { Logo } from "@/components/ui/Logo";
import { cn, getImageMeta } from "@/lib/utils";
import type { VideoPoster } from "./video-source";

type Props = {
  poster: VideoPoster;
  sizes: string;
  className?: string;
};

/**
 * Capa de vídeo (decorativa — o botão ▶ tem o rótulo acessível):
 * imagem local otimizada, capa remota/fora de /images (<img>) ou capa neutra com o logo.
 * Preenche o pai posicionado.
 */
export function PosterImage({ poster, sizes, className }: Props) {
  if (poster.kind === "optimized") {
    const meta = getImageMeta(poster.src);
    return (
      <Image
        src={poster.src}
        alt=""
        fill
        sizes={sizes}
        quality={75}
        className={cn("object-cover", className)}
        {...(meta.blurDataURL ? { placeholder: "blur" as const, blurDataURL: meta.blurDataURL } : {})}
      />
    );
  }

  if (poster.kind === "plain") {
    return (
      // Capas remotas (ex.: i.ytimg.com) ou fora de /images não passam pelo otimizador do next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={poster.src}
        alt=""
        loading="lazy"
        decoding="async"
        className={cn("absolute inset-0 h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn("absolute inset-0 grid place-items-center", className)}
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, rgb(138 43 226 / 0.45), transparent 60%), radial-gradient(ellipse at 80% 90%, rgb(255 20 147 / 0.35), transparent 55%), var(--color-ink)",
      }}
    >
      <span className="w-1/2 max-w-64 opacity-80">
        <Logo sizes="256px" alt="" />
      </span>
    </span>
  );
}
