/**
 * Processa as imagens originais (trabalho/) para public/images e gera
 * src/data/image-meta.generated.ts (dimensões + blur placeholder).
 *
 * Uso: npm run images
 * Para adicionar novas fotos: coloque o arquivo em public/images/<pasta>/
 * (qualquer .jpg/.png/.webp) e rode `npm run images` para atualizar os metadados.
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "trabalho");
const OUT = path.join(ROOT, "public", "images");

// origem (trabalho/) -> destino (public/images/)
const SOURCES = [
  ["meuperfil.png", "profile/betobrizz-perfil.webp"],
  ["WhatsApp Image 2026-09-25 at 08.59.08.jpeg", "art/betobrizz-neon-stage.webp"],
  ["WhatsApp Image 2026-09-25 at 09.00.38.jpeg", "art/betobrizz-poster-vertical.webp"],
  ["WhatsApp Image 2026-09-25 at 09.02.02.jpeg", "art/betobrizz-arena.webp"],
  ["WhatsApp Image 2026-09-25 at 08.59.59 (1).jpeg", "events/betobrizz-controladora.webp"],
  ["WhatsApp Image 2026-09-25 at 08.59.59 (2).jpeg", "events/betobrizz-pista-verde.webp"],
  ["WhatsApp Image 2026-09-25 at 08.59.59.jpeg", "events/betobrizz-pista-magenta.webp"],
  ["WhatsApp Image 2026-09-25 at 09.09.44.jpeg", "events/betobrizz-telao-vermelho.webp"],
  ["WhatsApp Image 2026-09-25 at 09.09.44 (1).jpeg", "events/betobrizz-palco-telas-retro.webp"],
  ["WhatsApp Image 2026-09-25 at 09.09.44 (2).jpeg", "events/betobrizz-cabine-pioneer.webp"],
  ["WhatsApp Image 2026-09-25 at 09.09.45.jpeg", "events/betobrizz-mixagem-close.webp"],
  ["WhatsApp Image 2026-09-25 at 09.09.45 (1).jpeg", "events/betobrizz-mixagem-close-azul.webp"],
  ["WhatsApp Image 2026-09-25 at 09.09.45 (2).jpeg", "events/betobrizz-na-cabine.webp"],
];

const MAX = 1920;

async function processSources() {
  if (!fs.existsSync(SRC)) return;
  for (const [from, to] of SOURCES) {
    const input = path.join(SRC, from);
    if (!fs.existsSync(input)) continue;
    const output = path.join(OUT, to);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    await sharp(input)
      .rotate()
      .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 84, effort: 6 })
      .toFile(output);
  }

  // Open Graph: 1200x630
  const arena = path.join(SRC, "WhatsApp Image 2026-09-25 at 09.02.02.jpeg");
  if (fs.existsSync(arena)) {
    await sharp(arena)
      .resize(1200, 630, { fit: "cover", position: "centre" })
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(path.join(ROOT, "public", "social-preview.jpg"));
  }
}

const ICON_SVG = fs.readFileSync(path.join(ROOT, "src", "app", "icon.svg"));

async function processIcons() {
  fs.mkdirSync(path.join(ROOT, "public", "icons"), { recursive: true });
  for (const size of [192, 512]) {
    await sharp(ICON_SVG, { density: 600 })
      .resize(size, size)
      .png()
      .toFile(path.join(ROOT, "public", "icons", `icon-${size}.png`));
  }
  // maskable: símbolo com margem de segurança
  await sharp({ create: { width: 512, height: 512, channels: 4, background: "#050505" } })
    .composite([{ input: await sharp(ICON_SVG, { density: 600 }).resize(360, 360).png().toBuffer(), gravity: "centre" }])
    .png()
    .toFile(path.join(ROOT, "public", "icons", "icon-maskable-512.png"));
  await sharp(ICON_SVG, { density: 600 })
    .resize(180, 180)
    .flatten({ background: "#050505" })
    .png()
    .toFile(path.join(ROOT, "src", "app", "apple-icon.png"));
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : /\.(webp|jpe?g|png|avif)$/i.test(e.name) ? [p] : [];
  });
}

async function generateMeta() {
  const entries = [];
  for (const file of walk(OUT).sort()) {
    const { width, height } = await sharp(file).metadata();
    const blur = await sharp(file).resize(12, 12, { fit: "inside" }).webp({ quality: 40 }).toBuffer();
    const src = "/" + path.relative(path.join(ROOT, "public"), file).split(path.sep).join("/");
    entries.push(
      `  ${JSON.stringify(src)}: { width: ${width}, height: ${height}, blurDataURL: "data:image/webp;base64,${blur.toString("base64")}" },`,
    );
  }
  const body = `// Arquivo gerado por scripts/process-images.mjs — não edite à mão.
// Rode \`npm run images\` após adicionar imagens em public/images/.

export type ImageMeta = { width: number; height: number; blurDataURL: string };

export const imageMeta: Record<string, ImageMeta> = {
${entries.join("\n")}
};
`;
  fs.writeFileSync(path.join(ROOT, "src", "data", "image-meta.generated.ts"), body);
  console.log(`image-meta: ${entries.length} imagens`);
}

await processSources();
await processIcons();
await generateMeta();
