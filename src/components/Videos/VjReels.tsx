import type { VideoItem } from "@/data/types";
import { Reveal } from "@/components/ui/Reveal";
import { ReelPlayer } from "./ReelPlayer";

/**
 * Faixa "VJ // TELÕES": vídeos verticais do trabalho de VJ em molduras de celular.
 * Desktop: lado a lado · Celular: carrossel com snap (arrastar para o lado).
 */
export function VjReels({ items }: { items: Array<{ item: VideoItem; src: string }> }) {
  if (!items.length) return null;

  return (
    <div className="mt-16 lg:mt-24">
      <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div>
          <p className="hud flex items-center gap-3 text-cyan">
            <span aria-hidden className="h-px w-8 bg-cyan shadow-neon-cyan" />
            VJ // Telões
          </p>
          <p className="mt-3 font-hud text-2xl leading-snug font-bold tracking-[0.04em] text-balance text-white uppercase sm:text-3xl">
            Imagem que acompanha a música.
          </p>
        </div>
        <p className="max-w-sm text-base text-pretty text-mute">
          Conteúdo visual nos telões de LED, criado para o tema de cada evento.
        </p>
      </Reveal>

      <ul
        className="-mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0 lg:gap-10 [&::-webkit-scrollbar]:hidden"
        aria-label="Vídeos do trabalho de VJ"
      >
        {items.map(({ item, src }, i) => (
          <li key={src} className="w-[68%] max-w-[18rem] shrink-0 snap-start sm:w-auto sm:max-w-none">
            <ReelPlayer item={item} src={src} index={i} />
          </li>
        ))}
      </ul>
      {items.length > 1 ? <p className="hud mt-2 text-[0.65rem] text-mute sm:hidden">Arraste para o lado →</p> : null}
    </div>
  );
}
