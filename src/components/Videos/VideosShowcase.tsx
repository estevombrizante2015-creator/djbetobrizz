import { siteConfig } from "@/config/site";
import { NeonButton } from "@/components/ui/NeonButton";
import { InstagramIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { slideRight } from "@/lib/animations";
import { CrtMonitor } from "./CrtMonitor";
import { ReelCard } from "./ReelCard";

/**
 * Estado sem vídeos cadastrados: telão CRT + reel em moldura de celular + convite para o Instagram.
 * Não afirma que existam vídeos específicos — aponta para o perfil oficial.
 */
export function VideosShowcase() {
  return (
    <div className="mt-12 grid gap-y-10 lg:mt-16 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-12">
      <Reveal className="lg:col-span-8 lg:row-start-1">
        <CrtMonitor />
      </Reveal>

      <Reveal
        variants={slideRight}
        className="relative z-10 mx-auto w-[66%] max-w-[270px] sm:max-w-[300px] lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:mt-10 lg:w-full lg:max-w-none"
      >
        <ReelCard />
      </Reveal>

      <Reveal className="lg:col-span-8 lg:row-start-2">
        <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:text-left">
          <div className="max-w-xl">
            <p className="hud flex items-center justify-center gap-3 text-magenta lg:justify-start">
              <span aria-hidden className="h-px w-8 bg-magenta shadow-neon-magenta" />
              Vídeos // Instagram
            </p>
            <p className="mt-4 font-display text-xl leading-snug font-bold text-balance text-white uppercase sm:text-2xl">
              Os vídeos das apresentações estão no Instagram.
            </p>
            <p className="mt-3 text-base text-mute">
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
