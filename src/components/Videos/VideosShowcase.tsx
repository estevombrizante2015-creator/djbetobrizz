import { siteConfig } from "@/config/site";
import { gallery } from "@/data/gallery";
import { NeonButton } from "@/components/ui/NeonButton";
import { InstagramIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { CrtMonitor, type CrtVideo } from "./CrtMonitor";
import { ReelCard } from "./ReelCard";

/** Com vídeo no telão (que já mostra a arte do logo), o reel mostra a pista — evita logo repetido lado a lado. */
const CROWD_SRC = "/images/events/betobrizz-pista-magenta.webp";
const CROWD_POSTER = {
  src: CROWD_SRC,
  alt: gallery.find((p) => p.src === CROWD_SRC)?.alt ?? "Pista cheia vista do palco",
};

/**
 * Telão CRT + reel em moldura de celular + convite para o Instagram.
 * Com 1–2 vídeos em `data/videos`, eles tocam no próprio telão (canais 01/02).
 * Sem vídeos, o telão mostra fotos reais e o texto não afirma que existam vídeos específicos.
 */
export function VideosShowcase({ videos = [] }: { videos?: CrtVideo[] }) {
  const hasVideos = videos.length > 0;

  return (
    <div className="mt-12 grid gap-y-10 lg:mt-16 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-12">
      <Reveal className="lg:col-span-8 lg:row-start-1">
        <CrtMonitor videos={videos} />
      </Reveal>

      <Reveal
        step={2}
        className="relative z-10 mx-auto w-[66%] max-w-[270px] sm:max-w-[300px] lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:mt-10 lg:w-full lg:max-w-none"
      >
        <ReelCard poster={hasVideos ? CROWD_POSTER : undefined} />
      </Reveal>

      <Reveal className="lg:col-span-8 lg:row-start-2">
        <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:text-left">
          <div className="max-w-xl">
            <p className="hud flex items-center justify-center gap-3 text-magenta lg:justify-start">
              <span aria-hidden className="h-px w-8 bg-magenta shadow-neon-magenta" />
              Vídeos // Instagram
            </p>
            <p className="mt-4 font-display text-xl leading-snug font-bold text-balance text-white uppercase sm:text-2xl">
              {hasVideos ? "Mais vídeos das apresentações no Instagram." : "Os vídeos das apresentações estão no Instagram."}
            </p>
            <p className="mt-3 text-base text-pretty text-mute">
              Siga <span className="text-white">{siteConfig.instagramHandle}</span> e veja a experiência DJ + VJ em
              movimento.
            </p>
          </div>
          <NeonButton
            href={siteConfig.instagram}
            external
            size="lg"
            icon={<InstagramIcon size={20} />}
            event="instagram_click"
            eventParams={{ source: "videos" }}
          >
            Assista no Instagram
          </NeonButton>
        </div>
      </Reveal>
    </div>
  );
}
