/**
 * Prepara a música de fundo a partir de musicadefundo/ (MP3/MPEG com tags ID3):
 * - public/audio/<slug>.mp3 — 128 kbps estéreo, sem metadados (metade do tamanho original)
 * - public/images/music/<slug>.webp — capa (160px) extraída da faixa, se houver
 * - src/data/music.generated.ts — lista com título/artista das tags
 *
 * Requer ffmpeg: no PATH, ou informe o caminho em FFMPEG, ex.:
 *   npx --yes ffmpeg-static   (mostra o caminho do binário baixado)
 *   FFMPEG="C:/…/ffmpeg.exe" npm run audio
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "musicadefundo");
const OUT_AUDIO = path.join(ROOT, "public", "audio");
const OUT_COVER = path.join(ROOT, "public", "images", "music");
const FFMPEG = process.env.FFMPEG || "ffmpeg";

/** Correções de tags por arquivo (faixas que chegam com título/artista trocados ou errados). */
const TAG_FIXES = {
  "WhatsApp Audio 2026-09-26 at 12.07.19.mpeg": { title: "How Does It Feel (Extended Mix)", artist: "Dubdogz, FEZZO & Zaark" },
};

const slugify = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

function readTags(file) {
  // ffmpeg imprime os metadados em formato ffmetadata (chave=valor)
  const out = execFileSync(FFMPEG, ["-v", "error", "-i", file, "-f", "ffmetadata", "-"], { encoding: "utf8" });
  const tags = {};
  for (const line of out.split(/\r?\n/)) {
    const i = line.indexOf("=");
    if (i > 0) tags[line.slice(0, i).toLowerCase()] = line.slice(i + 1).replace(/\\(.)/g, "$1");
  }
  return tags;
}

fs.mkdirSync(OUT_AUDIO, { recursive: true });
fs.mkdirSync(OUT_COVER, { recursive: true });

const tracks = [];
const seen = new Set();
for (const name of fs.readdirSync(SRC).sort()) {
  if (!/\.(mp3|mpeg|m4a|wav|ogg|flac)$/i.test(name)) continue;
  const file = path.join(SRC, name);
  const tags = { ...readTags(file), ...TAG_FIXES[name] };
  const title = (tags.title || path.parse(name).name).trim();
  const artist = (tags.artist || "").replace(/^\/+/, "").trim();
  const slug = slugify(`${artist.split(",")[0] || "faixa"}-${title}`);
  // mesma faixa enviada duas vezes (mesmas tags) → uma só na playlist
  if (seen.has(slug)) {
    console.log(`${name} — repetida (${title} / ${artist}), ignorada`);
    continue;
  }
  seen.add(slug);

  const mp3 = path.join(OUT_AUDIO, `${slug}.mp3`);
  execFileSync(FFMPEG, ["-v", "error", "-y", "-i", file, "-map", "0:a:0", "-map_metadata", "-1", "-codec:a", "libmp3lame", "-b:a", "128k", "-ac", "2", mp3]);

  let cover;
  const tmp = path.join(os.tmpdir(), `${slug}-cover.jpg`);
  try {
    execFileSync(FFMPEG, ["-v", "error", "-y", "-i", file, "-an", "-map", "0:v:0", "-frames:v", "1", tmp]);
    await sharp(tmp).resize(160, 160, { fit: "cover" }).webp({ quality: 78 }).toFile(path.join(OUT_COVER, `${slug}.webp`));
    cover = `/images/music/${slug}.webp`;
    fs.rmSync(tmp, { force: true });
  } catch {
    cover = undefined; // faixa sem capa embutida
  }

  const kb = Math.round(fs.statSync(mp3).size / 1024);
  console.log(`${name} → ${slug}.mp3 (${kb} KB) — ${title} / ${artist}`);
  tracks.push({ title, artist, src: `/audio/${slug}.mp3`, ...(cover ? { cover } : {}) });
}

const body = `// Arquivo gerado por scripts/process-audio.mjs — não edite à mão.
// Para mudar a ordem ou esconder faixas, edite src/data/music.ts.
import type { Track } from "./music";

export const musicLibrary: Track[] = ${JSON.stringify(tracks, null, 2)};
`;
fs.writeFileSync(path.join(ROOT, "src", "data", "music.generated.ts"), body);
console.log(`music.generated.ts: ${tracks.length} faixas`);
