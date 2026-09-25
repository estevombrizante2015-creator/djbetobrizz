import { videos } from "@/data/videos";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { CrtVideo } from "./CrtMonitor";
import { VideoGrid } from "./VideoGrid";
import { VideosShowcase } from "./VideosShowcase";
import { VjReels } from "./VjReels";
import { resolveVideoSource, videoOrientation } from "./video-source";

/** A partir de quantos vídeos válidos a seção vira grade de cards. */
const GRID_FROM = 3;

/**
 * 08 // VÍDEOS — "SEE THE VIBE."
 * Vídeos HORIZONTAIS: 0–2 válidos → telão CRT (tocam nele; sem vídeos, fotos reais) + reel levando
 * ao Instagram; 3 ou mais → grade de cards com facade.
 * Vídeos VERTICAIS (trabalho de VJ gravado no celular) → faixa "VJ // TELÕES" em molduras 9:16.
 * Em todos os casos o player só carrega no clique.
 */
export function Videos() {
  const landscapeItems = videos.filter((item) => videoOrientation(item) === "landscape");
  const playable: CrtVideo[] = landscapeItems.flatMap((item) => {
    const source = resolveVideoSource(item);
    return source ? [{ item, source }] : [];
  });
  const reels = videos
    .filter((item) => videoOrientation(item) === "portrait")
    .flatMap((item) => {
      const source = resolveVideoSource(item);
      return source?.kind === "file" ? [{ item, src: source.src }] : [];
    });

  return (
    <section id="videos" aria-labelledby="videos-title" className="section-y relative overflow-hidden">
      {/* Luz ambiente: vermelho do telão à esquerda, magenta do reel à direita */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-[18%] -left-[20%] h-[70%] w-[80%] opacity-80"
          style={{ background: "radial-gradient(closest-side, rgb(255 36 20 / 0.16), transparent)" }}
        />
        <div
          className="absolute -right-[15%] bottom-[5%] h-[60%] w-[55%]"
          style={{ background: "radial-gradient(closest-side, rgb(138 43 226 / 0.18), transparent)" }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-line-strong to-transparent" />
      </div>

      <div className="container-bb relative">
        <div className="flex items-end justify-between gap-6">
          <SectionHeading
            id="videos-title"
            kicker="08 // VÍDEOS"
            title="SEE THE VIBE."
            lang="en"
            subtitle="DJ + VJ em movimento"
            accent="magenta"
          />
          <OnAirSign />
        </div>

        {playable.length >= GRID_FROM ? <VideoGrid items={landscapeItems} /> : <VideosShowcase videos={playable} />}
        <VjReels items={reels} />
      </div>
    </section>
  );
}

/** Placa "ON AIR" de estúdio — decorativa. A luz pisca (só opacidade, compositor) fora do nível "lite". */
function OnAirSign() {
  return (
    <div
      aria-hidden
      className="mb-2 hidden shrink-0 items-center gap-3 rounded-lg border border-red/70 px-4 py-2.5 shadow-neon-red md:flex"
      style={{ background: "linear-gradient(180deg, rgb(255 36 20 / 0.16), rgb(255 36 20 / 0.04))" }}
    >
      <span className="size-2.5 rounded-full bg-red [html:not([data-perf=lite])_&]:motion-safe:animate-rec" />
      <span className="font-display text-sm font-black tracking-[0.3em] text-red text-glow-red">ON AIR</span>
    </div>
  );
}
