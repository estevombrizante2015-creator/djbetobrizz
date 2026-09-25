import type { CSSProperties } from "react";
import Image from "next/image";
import { events } from "@/data/events";
import { phrases } from "@/data/content";
import type { EventItem } from "@/data/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn, getImageMeta } from "@/lib/utils";
import styles from "./Events.module.css";

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
  { bar: "bg-magenta shadow-neon-magenta", text: "text-magenta", rgb: "255 20 147" },
  { bar: "bg-cyan shadow-neon-cyan", text: "text-cyan", rgb: "0 229 255" },
  { bar: "bg-red shadow-neon-red", text: "text-red", rgb: "255 36 20" },
  { bar: "bg-purple shadow-neon-purple", text: "text-purple", rgb: "138 43 226" },
] as const;

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * Um "feed" da mesa de corte. Server component, sem JS: a decoração é CSS estático
 * (cantoneiras e scanlines em 1 elemento cada, sem blend/filtro) e os efeitos de hover
 * (zoom, wash neon, brilho da borda) só existem no modo completo — ver Events.module.css.
 */
function EventTile({ tile, rowSum, total }: { tile: Tile; rowSum: number; total: number }) {
  const { item, index, weight, mobileRatio } = tile;
  const meta = getImageMeta(item.image.src);
  const accent = accents[index % accents.length];
  const share = weight / rowSum;
  // celular: largura do container (100vw − 2rem de padding)
  const sizes = `(min-width: 1280px) ${Math.round(share * CONTAINER_PX)}px, (min-width: 640px) ${Math.round(share * 100)}vw, calc(100vw - 2rem)`;
  const details = [item.location, item.date].filter(Boolean).join(" · ");
  const label = item.title ?? item.type;
  // Com nome de evento vira "EVENTO DESTACADO" (§18); o tipo passa a ser o rótulo de cima.
  const highlighted = Boolean(item.title);
  const kicker = highlighted ? ["Evento destacado", item.type].filter(Boolean).join(" · ") : undefined;
  const big = highlighted || item.featured;

  const style = {
    "--m-ar": mobileRatio,
    "--tile-flex": `${weight} 1 0%`,
    "--acc": accent.rgb,
    // Placeholder: a miniatura (12px) ampliada pelo navegador já fica desfocada — sem o SVG
    // com feGaussianBlur do placeholder="blur", caro de pintar na rolagem em celular.
    ...(meta.blurDataURL ? { backgroundImage: `url("${meta.blurDataURL}")` } : {}),
  } as CSSProperties;

  return (
    <figure
      style={style}
      className={cn(
        styles.tile,
        "relative isolate aspect-(--m-ar) min-w-0 overflow-hidden rounded-sm bg-ink bg-cover bg-center ring-1 ring-line",
        "hover:ring-magenta/60",
        "sm:flex-(--tile-flex) sm:aspect-auto",
      )}
    >
      <Image
        src={item.image.src}
        alt={item.image.alt}
        fill
        sizes={sizes}
        quality={60}
        className={cn(styles.img, "object-cover")}
      />

      {/* leitura: base escura + vinheta */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/90 via-void/15 to-void/35"
      />
      <span aria-hidden className={styles.wash} />
      <span aria-hidden className={styles.lines} />
      <span aria-hidden className={styles.edgeGlow} />
      <span aria-hidden className={styles.viewfinder} />

      {/* HUD do monitor: câmera + tally (acende no hover) + contador */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-5 flex items-center justify-between sm:inset-x-8 sm:top-6"
      >
        <span className="hud flex items-center gap-2 text-[0.65rem] text-white/85">
          <span className={cn(styles.tally, "size-1.5 rounded-full bg-white/50")} />
          CAM {pad2(index + 1)}
          <span className={cn(styles.live, "hidden text-red opacity-0 sm:inline")}>· LIVE</span>
        </span>
        <span className="font-vhs text-base leading-none text-white/70 tabular-nums">
          {pad2(index + 1)}/{pad2(total)}
        </span>
      </span>

      {label ? (
        <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 sm:p-8">
          <span className="flex items-center gap-3">
            <span aria-hidden className={cn(styles.bar, "h-px w-6", accent.bar)} />
            {kicker ? <span className={cn("hud", accent.text)}>{kicker}</span> : null}
          </span>
          {/* Rajdhani: o til do Orbitron vira um traço inclinado ("TELÃO" parece "TELÀO") */}
          <span
            className={cn(
              styles.title,
              "font-hud leading-[0.95] font-bold tracking-[0.04em] text-balance text-white uppercase",
              big ? "text-[2rem] sm:text-[2.4rem] lg:text-[2.8rem]" : "text-[1.7rem] sm:text-[1.9rem] lg:text-[2.15rem]",
            )}
          >
            {label}
          </span>
          {details ? <span className="font-hud text-sm font-semibold tracking-[0.18em] text-white/80 uppercase">{details}</span> : null}
          {item.description ? (
            <span className="line-clamp-2 max-w-prose text-sm leading-relaxed text-white/85">{item.description}</span>
          ) : null}
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
      {/* Atmosfera: brilhos em gradiente radial (sem filter: blur — barato na rolagem) */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-16 -left-56 size-[40rem] bg-[radial-gradient(closest-side,rgb(255_20_147/0.12),rgb(255_20_147/0.04)_55%,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-14rem] bottom-0 size-[36rem] bg-[radial-gradient(closest-side,rgb(0_229_255/0.08),transparent)]"
      />
      {/* Entrada vinda do preto: sem emenda dura sob o palco do Flashback */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-void to-transparent" />

      <div className="container-bb relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          {/* leading local maior: o acento do "Ú" (MÚSICA) invadia a linha de cima */}
          <SectionHeading
            id="eventos-titulo"
            kicker="05 // EVENTOS"
            title="ONDE A MÚSICA ACONTECE."
            accent="magenta"
            className="[&_h2]:leading-[1.08]"
          />
          <Reveal className="flex shrink-0 flex-col gap-2 lg:items-end lg:pb-3 lg:text-right">
            <p className="hud flex items-center gap-2 text-mute">
              <span aria-hidden className={cn(styles.rec, "size-1.5 rounded-full bg-red")} />
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
                className="flex flex-col gap-3 sm:aspect-(--row-ar) sm:max-h-[min(34rem,78svh)] sm:w-full sm:flex-row sm:gap-4"
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
