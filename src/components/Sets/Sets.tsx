import Image from "next/image";
import { sets } from "@/data/sets";
import type { SetItem } from "@/data/types";
import { siteConfig } from "@/config/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NeonButton } from "@/components/ui/NeonButton";
import { SoundCloudIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { imageProps, safeExternalUrl } from "@/lib/utils";
import { SetsDeck, type DeckTrack } from "./SetsDeck";

const PROFILE_TITLE = "SETS & MIXES — BETO BRIZZ DJ";

/** Aceita apenas links http(s) do SoundCloud (faixa, set, playlist). */
function soundcloudUrl(url: string) {
  const safe = safeExternalUrl(url);
  if (!safe) return undefined;
  const host = new URL(safe).hostname;
  return host === "soundcloud.com" || host.endsWith(".soundcloud.com") ? safe : undefined;
}

/**
 * "DJ BetoBrizz — Set Flashback" / "BETO BRIZZ DJ - Set house" → "SET — FLASHBACK" / "SET — HOUSE"
 * (o display já mostra "DJ BETOBRIZZ").
 */
function deckTitle(title: string) {
  const t = title.replace(/^\s*(?:dj\s*)?beto\s*brizz(?:\s*dj)?\s*[—–:-]?\s*/i, "").trim();
  if (!t) return title.trim();
  if (/^set\s*[—–-]/i.test(t)) return t;
  if (/^set\s+/i.test(t)) return t.replace(/^set\s+/i, "Set — ");
  return `Set — ${t}`;
}

function toDeckTracks(items: SetItem[]): DeckTrack[] {
  return items.flatMap((item) => {
    const url = soundcloudUrl(item.url);
    return url ? [{ url, title: item.title, display: deckTitle(item.title), genre: item.genre, duration: item.duration }] : [];
  });
}

/**
 * 09 // SETS — "LISTEN TO THE MIX."
 * Com itens em `data/sets`: deck com o primeiro set + lista para trocar.
 * Sem itens: o deck carrega o perfil completo do SoundCloud.
 */
export function Sets() {
  const fromData = toDeckTracks(sets);
  const tracks: DeckTrack[] =
    fromData.length > 0
      ? fromData
      : [{ url: siteConfig.soundcloud, title: PROFILE_TITLE, display: PROFILE_TITLE, note: "Perfil oficial" }];

  return (
    <section id="sets" aria-labelledby="sets-title" className="section-y relative overflow-hidden">
      {/* Fundo: mãos nos faders, bem apagado (só a partir do tablet — economiza dados no celular) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
        <Image
          {...imageProps("/images/events/betobrizz-mixagem-close-azul.webp")}
          alt=""
          sizes="(min-width: 768px) 100vw, 1px"
          quality={60}
          className="absolute inset-0 h-full w-full object-cover opacity-[0.12] [html[data-perf=full]_&]:opacity-[0.13] [html[data-perf=full]_&]:grayscale-[35%]"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0%, #000 25%, #000 55%, transparent 95%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 25%, #000 55%, transparent 95%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-void via-void/70 to-void/30" />
      </div>

      <div className="container-bb relative">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
          <SectionHeading
            id="sets-title"
            kicker="09 // SETS"
            title="LISTEN TO THE MIX."
            subtitle="Direto do SoundCloud"
            accent="cyan"
            className="lg:col-span-7"
          />
          <Reveal className="lg:col-span-5 lg:pb-2">
            <p className="max-w-md text-lg text-balance text-white">
              Sinta a vibe antes da festa: sets e mixes do {siteConfig.soundcloudName}.
            </p>
            <p className="mt-2 max-w-md text-sm text-pretty text-mute">O player só carrega quando você aperta ▶ — nada toca sozinho.</p>
            <NeonButton
              href={siteConfig.soundcloud}
              external
              variant="cyan"
              icon={<SoundCloudIcon size={20} />}
              event="soundcloud_click"
              eventParams={{ source: "sets" }}
              className="mt-6"
            >
              Ouvir no SoundCloud
            </NeonButton>
          </Reveal>
        </div>

        <Reveal className="mt-12 lg:mt-16">
          <SetsDeck tracks={tracks} />
        </Reveal>
      </div>
    </section>
  );
}
