import type { VideoItem } from "@/data/types";
import { siteConfig } from "@/config/site";
import { NeonButton } from "@/components/ui/NeonButton";
import { InstagramIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
import { VideoCard } from "./VideoCard";
import { resolveVideoSource } from "./video-source";

/** Grade de vídeos vinda de `data/videos` — o primeiro ganha destaque quando há 3 ou mais. */
export function VideoGrid({ items }: { items: VideoItem[] }) {
  const playable = items.flatMap((item) => {
    const source = resolveVideoSource(item);
    return source ? [{ item, source }] : [];
  });
  if (playable.length === 0) return null;

  const featureFirst = playable.length >= 3;

  return (
    <div className="mt-12 lg:mt-16">
      <div
        className={cn(
          "grid gap-x-6 gap-y-10",
          playable.length === 1 ? "mx-auto max-w-4xl" : "sm:grid-cols-2",
          playable.length >= 3 && "lg:grid-cols-3",
        )}
      >
        {playable.map(({ item, source }, i) => (
          <Reveal key={`${item.platform}-${item.id}`} className={cn(featureFirst && i === 0 && "sm:col-span-2 lg:row-span-2")}>
            <VideoCard item={item} source={source} index={i} featured={featureFirst && i === 0} />
          </Reveal>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-start gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-mute">
          Mais vídeos em <span className="text-white">{siteConfig.instagramHandle}</span>
        </p>
        <NeonButton
          href={siteConfig.instagram}
          external
          icon={<InstagramIcon size={18} />}
          event="instagram_click"
          eventParams={{ source: "videos" }}
        >
          Assista no Instagram
        </NeonButton>
      </div>
    </div>
  );
}
