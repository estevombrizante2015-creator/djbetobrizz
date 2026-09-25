import type { CSSProperties } from "react";
import Image from "next/image";
import { events } from "@/data/events";
import { phrases } from "@/data/content";
import type { EventItem } from "@/data/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn, getImageMeta } from "@/lib/utils";

/* ==========================================================================
   Layout "justified": cada fileira soma as proporções reais das fotos, então
   retratos e paisagens dividem a mesma altura quase sem corte. Destaques
   (featured) ganham mais largura. Adicionar um evento em data/events.ts
   recalcula a grade sozinho.
   ========================================================================== */

/** Soma de proporções a partir da qual a fileira fecha (≈ 2 fotos por linha). */
const ROW_TARGET = 2.3;
/** Destaques ocupam ~30% mais largura (corte leve em cima/embaixo). */
const FEATURED_BOOST = 1.3;
/** Largura útil do container no desktop (80rem − padding) — usada no `sizes`. */
const CONTAINER_PX = 1216;

type Tile = { item: EventItem; index: number; ratio: number; weight: number; mobileRatio: number };
/** `sum` = soma dos pesos (largura relativa) · `natural` = soma das proporções reais (altura da fileira). */
type Row = { tiles: Tile[]; sum: number; natural: number };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const total = (tiles: Tile[], key: "ratio" | "weight") => tiles.reduce((acc, t) => acc + t[key], 0);

function buildRows(items: EventItem[]): Row[] {
  const groups: Tile[][] = [];
  let tiles: Tile[] = [];

  items.forEach((item) => {
    const meta = getImageMeta(item.image.src);
    const ratio = clamp(meta.width / meta.height, 0.6, 2.4);
    const weight = item.featured ? ratio * FEATURED_BOOST : ratio;
    // no celular (1 coluna): retrato 4:5, paisagem 3:2
    tiles.push({ item, index: 0, ratio, weight, mobileRatio: clamp(ratio, 0.8, 1.5) });
    if (total(tiles, "weight") >= ROW_TARGET) {
      groups.push(tiles);
      tiles = [];
    }
  });

  if (tiles.length) {
    const last = groups.at(-1);
    // um retrato sozinho na última fileira ficaria gigante: junta à fileira anterior
    if (last && tiles.length === 1 && total(tiles, "weight") < ROW_TARGET / 2) last.push(...tiles);
    else groups.push(tiles);
  }

  // Zigue-zague: fileiras ímpares invertidas NO DOM (não com flex-row-reverse),
  // assim a ordem de leitura e os números CAM 01, 02, 03… seguem a ordem visual.
  let index = 0;
  return groups.map((group, r) => {
    const ordered = r % 2 === 1 ? [...group].reverse() : group;
    const numbered = ordered.map((t) => ({ ...t, index: index++ }));
    return { tiles: numbered, sum: total(numbered, "weight"), natural: total(numbered, "ratio") };
  });
}

const accents = [
  { bar: "bg-magenta shadow-neon-magenta", text: "text-magenta", glow: "group-hover/tile:text-glow-magenta" },
  { bar: "bg-cyan shadow-neon-cyan", text: "text-cyan", glow: "group-hover/tile:text-glow-cyan" },
  { bar: "bg-red shadow-neon-red", text: "text-red", glow: "group-hover/tile:text-glow-red" },
  { bar: "bg-purple shadow-neon-purple", text: "text-purple", glow: "group-hover/tile:text-glow-purple" },
] as const;

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Cantoneiras de visor de câmera — fecham levemente no hover. */
function Viewfinder() {
  const corner =
    "absolute size-4 border-white/45 transition-all duration-500 ease-out group-hover/tile:size-6 group-hover/tile:border-cyan sm:size-5";
  return (
    <span aria-hidden className="pointer-events-none absolute inset-3 sm:inset-4">
      <span className={cn(corner, "top-0 left-0 border-t border-l")} />
      <span className={cn(corner, "top-0 right-0 border-t border-r")} />
      <span className={cn(corner, "bottom-0 left-0 border-b border-l")} />
      <span className={cn(corner, "right-0 bottom-0 border-r border-b")} />
    </span>
  );
}

function EventTile({ tile, rowSum, total }: { tile: Tile; rowSum: number; total: number }) {
  const { item, index, weight, mobileRatio } = tile;
  const meta = getImageMeta(item.image.src);
  const accent = accents[index % accents.length];
  const share = weight / rowSum;
  const sizes = `(min-width: 1280px) ${Math.round(share * CONTAINER_PX)}px, (min-width: 640px) ${Math.round(share * 100)}vw, 100vw`;
  const details = [item.location, item.date].filter(Boolean).join(" · ");
  const label = item.title ?? item.type;
  const kicker = item.title ? item.type : undefined;

  const style = {
    "--m-ar": mobileRatio,
    "--tile-flex": `${weight} 1 0%`,
  } as CSSProperties;

  return (
    <figure
      style={style}
      className={cn(
        "group/tile relative isolate aspect-(--m-ar) min-w-0 overflow-hidden rounded-sm bg-ink",
        "ring-1 ring-line transition-[box-shadow] duration-500 hover:ring-magenta/60 hover:shadow-neon-magenta",
        "sm:flex-(--tile-flex) sm:aspect-auto",
      )}
    >
      <Image
        src={item.image.src}
        alt={item.image.alt}
        fill
        sizes={sizes}
        {...(meta.blurDataURL ? { placeholder: "blur" as const, blurDataURL: meta.blurDataURL } : {})}
        className="object-cover transition-transform duration-[900ms] ease-out group-hover/tile:scale-[1.07]"
      />

      {/* leitura: base escura + vinheta */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/90 via-void/15 to-void/35"
      />
      {/* wash duotone neon (só em dispositivos com hover) */}
      <span
        aria-hidden
        className="fx-desktop-only pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,var(--color-magenta),var(--color-purple)_48%,var(--color-cyan))] opacity-0 mix-blend-color transition-opacity duration-500 group-hover/tile:opacity-60"
      />
      <span aria-hidden className="scanlines pointer-events-none absolute! inset-0 opacity-70" />

      <Viewfinder />

      {/* HUD do monitor: câmera + tally (acende no hover) + contador */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-5 flex items-center justify-between sm:inset-x-8 sm:top-6"
      >
        <span className="hud flex items-center gap-2 text-[0.65rem] text-white/85">
          <span className="size-1.5 rounded-full bg-white/50 transition-colors duration-300 group-hover/tile:bg-red group-hover/tile:shadow-neon-red" />
          CAM {pad2(index + 1)}
          <span className="hidden text-red opacity-0 transition-opacity duration-300 group-hover/tile:opacity-100 sm:inline">
            · LIVE
          </span>
        </span>
        <span className="font-vhs text-base leading-none text-white/70 tabular-nums">
          {pad2(index + 1)}/{pad2(total)}
        </span>
      </span>

      {label ? (
        <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 sm:p-8">
          <span className="flex items-center gap-3">
            <span
              aria-hidden
              className={cn("h-px w-6 transition-all duration-500 group-hover/tile:w-12", accent.bar)}
            />
            {kicker ? <span className={cn("hud", accent.text)}>{kicker}</span> : null}
          </span>
          <span
            className={cn(
              "font-display leading-[1.02] font-black tracking-tight text-balance text-white uppercase transition-[text-shadow] duration-500",
              item.featured ? "text-2xl sm:text-3xl lg:text-4xl" : "text-xl sm:text-2xl lg:text-[1.7rem]",
              accent.glow,
            )}
          >
            {label}
          </span>
          {details ? <span className="font-hud text-sm font-semibold tracking-[0.18em] text-mute uppercase">{details}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** "ONDE A MÚSICA ACONTECE." — grade de eventos estilo mesa de corte multicâmera. */
export function Events() {
  if (!events.length) return null;
  const rows = buildRows(events);

  return (
    <section id="eventos" aria-labelledby="eventos-titulo" className="section-y relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 size-[36rem] rounded-full bg-magenta/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-12rem] bottom-0 size-[32rem] rounded-full bg-cyan/[0.06] blur-3xl"
      />

      <div className="container-bb relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading id="eventos-titulo" kicker="05 // EVENTOS" title="ONDE A MÚSICA ACONTECE." accent="magenta" />
          <Reveal className="flex shrink-0 flex-col gap-2 lg:items-end lg:pb-3 lg:text-right">
            <p className="hud flex items-center gap-2 text-mute">
              <span aria-hidden className="size-1.5 animate-rec rounded-full bg-red" />
              MULTICAM · {pad2(events.length)} FEEDS
            </p>
            <p className="font-hud text-lg font-semibold tracking-[0.12em] text-white/90 uppercase">
              {phrases[5]} {phrases[6]}
            </p>
          </Reveal>
        </div>

        <div className="mt-12 flex flex-col gap-3 sm:mt-16 sm:gap-4">
          {rows.map((row) => (
            <Reveal key={row.tiles[0].index}>
              {/* Altura da fileira pelas proporções reais (ritmo constante entre fileiras);
                  w-full impede que o max-h encolha a largura via aspect-ratio. */}
              <div
                style={{ "--row-ar": row.natural } as CSSProperties}
                className="flex flex-col gap-3 sm:aspect-(--row-ar) sm:max-h-[34rem] sm:w-full sm:flex-row sm:gap-4"
              >
                {row.tiles.map((tile) => (
                  <EventTile key={tile.index} tile={tile} rowSum={row.sum} total={events.length} />
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
