import { sampleVideos as videos } from "./tmp-sample";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VideoGrid } from "./VideoGrid";
import { VideosShowcase } from "./VideosShowcase";

/**
 * 08 // VÍDEOS — "SEE THE VIBE."
 * Com itens em `data/videos`: grade de cards com facade (o player só carrega no clique).
 * Sem itens: telão CRT + reel levando ao Instagram oficial.
 */
export function Videos() {
  const hasVideos = videos.length > 0;

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
            subtitle="DJ + VJ em movimento"
            accent="magenta"
          />
          <OnAirSign />
        </div>

        {hasVideos ? <VideoGrid items={videos} /> : <VideosShowcase />}
      </div>
    </section>
  );
}

/** Placa "ON AIR" de estúdio — decorativa. */
function OnAirSign() {
  return (
    <div
      aria-hidden
      className="mb-2 hidden shrink-0 items-center gap-3 rounded-lg border border-red/70 px-4 py-2.5 shadow-neon-red md:flex"
      style={{ background: "linear-gradient(180deg, rgb(255 36 20 / 0.16), rgb(255 36 20 / 0.04))" }}
    >
      <span className="size-2.5 animate-rec rounded-full bg-red" />
      <span className="font-display text-sm font-black tracking-[0.3em] text-red text-glow-red">ON AIR</span>
    </div>
  );
}
