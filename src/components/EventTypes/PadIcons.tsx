import type { ReactNode } from "react";

/**
 * Ícones de linha neon dos pads (24×24, traço em currentColor, estilo do ui/Icons).
 * Cada ícone é desenhado duas vezes: um halo largo e translúcido (o "gás" do neon)
 * e o traço fino por cima — brilho sem filter/drop-shadow, custo zero na rolagem.
 */
type PadIconProps = { className?: string };

function NeonGlyph({ className, children }: PadIconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable={false}
      className={className}
    >
      <g data-halo="" strokeWidth={3.6} opacity={0.28}>
        {children}
      </g>
      <g data-core="" strokeWidth={1.5}>
        {children}
      </g>
    </svg>
  );
}

/** Festas — lança-confete. */
function PartyGlyph() {
  return (
    <>
      <path d="M3.5 20.5 8.2 9.3l6.5 6.5-11.2 4.7Z" />
      <path d="M6.2 14.1 9.9 17.8M5 17l2 2" />
      <path d="M11.3 8.2c.3-1.9 1.6-3 3.4-3.1M15.8 12.7c1.9-.3 3-1.6 3.1-3.4" />
      <path d="M13.5 2.8v1.4M19.8 5.2l-1 1M21.2 11.5h-1.4M17 2.9h.01M20.9 8.3h.01M10.5 4.3h.01" />
    </>
  );
}

/** Flashback — globo espelhado. */
function DiscoGlyph() {
  return (
    <>
      <path d="M12 2.5v4" />
      <circle cx="12" cy="13.5" r="6.8" />
      <path d="M5.2 13.5h13.6M6.2 10h11.6M6.2 17h11.6" />
      <path d="M12 6.7c-2.6 2-2.6 11.6 0 13.6M12 6.7c2.6 2 2.6 11.6 0 13.6" />
      <path d="M19.5 3v2.6M18.2 4.3h2.6" />
    </>
  );
}

/** Eventos corporativos — prédio. */
function BuildingGlyph() {
  return (
    <>
      <path d="M3 20.5h18" />
      <path d="M5.5 20.5v-16a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16" />
      <path d="M14.5 9.5h3a1 1 0 0 1 1 1v10" />
      <path d="M8.3 7.3h.01M11.7 7.3h.01M8.3 10.8h.01M11.7 10.8h.01M8.3 14.3h.01M11.7 14.3h.01M16.5 13h.01M16.5 16.3h.01" />
      <path d="M9 20.5v-2.7h2v2.7" />
    </>
  );
}

/** Confraternizações — brinde de taças. */
function ToastGlyph() {
  return (
    <>
      <g transform="rotate(-14 8 12)">
        <path d="M5.4 4h5.2l-.6 6.1a2 2 0 0 1-4 0L5.4 4Z" />
        <path d="M5.8 7.2h4.4M8 12.1v7.2M5.8 19.4h4.4" />
      </g>
      <g transform="rotate(14 16 12)">
        <path d="M13.4 4h5.2l-.6 6.1a2 2 0 0 1-4 0L13.4 4Z" />
        <path d="M13.8 7.2h4.4M16 12.1v7.2M13.8 19.4h4.4" />
      </g>
      <path d="M12 1.6v1.6M9.9 2.4l.7.9M14.1 2.4l-.7.9" />
    </>
  );
}

/** Aniversários — bolo com velas. */
function CakeGlyph() {
  return (
    <>
      <path d="M3.5 20.5h17" />
      <path d="M5 20.5v-6.8A1.7 1.7 0 0 1 6.7 12h10.6a1.7 1.7 0 0 1 1.7 1.7v6.8" />
      <path d="M5 15.6c1.2 0 1.2 1 2.3 1s1.2-1 2.4-1 1.1 1 2.3 1 1.2-1 2.3-1 1.2 1 2.4 1 1.1-1 2.3-1" />
      <path d="M8.5 12V9.3M12 12V9.3M15.5 12V9.3" />
      <path d="M8.5 7.2c-.6-.5-.6-1.3 0-2.2.6.9.6 1.7 0 2.2ZM12 7.2c-.6-.5-.6-1.3 0-2.2.6.9.6 1.7 0 2.2ZM15.5 7.2c-.6-.5-.6-1.3 0-2.2.6.9.6 1.7 0 2.2Z" />
    </>
  );
}

/** Clubes — dançarino na pista. */
function DancerGlyph() {
  return (
    <>
      <circle cx="13.6" cy="4.3" r="1.8" />
      <path d="M13 7.4 11.5 13" />
      <path d="M12.8 8.4l3.6 1.4 2.4-3.1M12.8 8.4 9.2 7.2 7 4" />
      <path d="M11.5 13l3 3.1-.9 4.4M11.5 13l-1.9 3.6-3.3 1.9" />
      <path d="M4.6 10.4v2.4M3.4 11.6h2.4M19.6 15.4v2.4M18.4 16.6h2.4" />
    </>
  );
}

/** Eventos temáticos — fones do DJ. */
function HeadphonesGlyph() {
  return (
    <>
      <path d="M4 14.5v-2.2a8 8 0 0 1 16 0v2.2" />
      <path d="M4 14.5a1.5 1.5 0 0 1 1.5-1.5h1A1.5 1.5 0 0 1 8 14.5v4A1.5 1.5 0 0 1 6.5 20h-1A1.5 1.5 0 0 1 4 18.5v-4ZM16 14.5a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5v-4Z" />
      <path d="M10 17.4v-1.8M12 18.4v-3.8M14 17.4v-1.8" />
    </>
  );
}

const glyphs = {
  party: PartyGlyph,
  disco: DiscoGlyph,
  building: BuildingGlyph,
  toast: ToastGlyph,
  cake: CakeGlyph,
  dancer: DancerGlyph,
  headphones: HeadphonesGlyph,
} as const;

type GlyphKey = keyof typeof glyphs;

/** Palavra-chave do título → ícone (os dados antigos traziam emojis, que não usamos). */
const byTitle: ReadonlyArray<[RegExp, GlyphKey]> = [
  [/festa/, "party"],
  [/flashback|anos\s?(80|90)|retro/, "disco"],
  [/corporativ|empresa/, "building"],
  [/confraterniza|brinde|formatura|casamento/, "toast"],
  [/aniversari|debutante|15 anos/, "cake"],
  [/clube|balada|boate|pista/, "dancer"],
  [/tematic|dj|som/, "headphones"],
];

const fallback: GlyphKey[] = ["party", "disco", "building", "toast", "cake", "dancer", "headphones"];

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Ícone neon do tipo de evento (pelo título; sem correspondência, pela posição). */
export function PadIcon({ title, index, className }: { title: string; index: number } & PadIconProps) {
  const t = normalize(title);
  const key = byTitle.find(([re]) => re.test(t))?.[1] ?? fallback[index % fallback.length];
  const Glyph = glyphs[key];
  return (
    <NeonGlyph className={className}>
      <Glyph />
    </NeonGlyph>
  );
}
