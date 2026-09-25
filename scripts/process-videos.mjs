/**
 * Converte os vídeos de trabalho/ para public/videos/ (leves para celular) e gera as capas.
 * - H.264 30 fps, bitrate limitado (~1,2 Mbps), faststart (começa a tocar antes de baixar tudo)
 * - áudio AAC 96 kbps
 * - capa WebP em public/images/art/<nome>-poster.webp (frame em POSTER_AT segundos)
 *
 * Requer ffmpeg no PATH ou em FFMPEG (ver `npx --yes ffmpeg-static`). Depois rode `npm run images`.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const FFMPEG = process.env.FFMPEG || "ffmpeg";
const ROOT = process.cwd();

// origem (trabalho/) → nome de saída (sem extensão) · segundo usado para a capa
const VIDEOS = [
  ["WhatsApp Video 2026-09-25 at 14.37.23.mp4", "betobrizz-vj-telao", 2.7],
  ["WhatsApp Video 2026-09-25 at 14.40.37.mp4", "betobrizz-vj-telao-2", 2.0],
  ["WhatsApp Video 2026-09-25 at 14.41.02.mp4", "betobrizz-vj-telao-3", 2.0],
];

fs.mkdirSync(path.join(ROOT, "public", "videos"), { recursive: true });
fs.mkdirSync(path.join(ROOT, "public", "images", "art"), { recursive: true });

for (const [from, name, posterAt] of VIDEOS) {
  const input = path.join(ROOT, "trabalho", from);
  if (!fs.existsSync(input)) continue;
  const out = path.join(ROOT, "public", "videos", `${name}.mp4`);
  execFileSync(FFMPEG, [
    "-v", "error", "-y", "-i", input,
    "-r", "30",
    "-c:v", "libx264", "-profile:v", "main", "-preset", "slow",
    "-crf", "28", "-maxrate", "1200k", "-bufsize", "2400k",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    "-c:a", "aac", "-b:a", "96k", "-ac", "2",
    "-map_metadata", "-1",
    out,
  ]);
  const tmp = path.join(os.tmpdir(), `${name}-poster.png`);
  execFileSync(FFMPEG, ["-v", "error", "-y", "-ss", String(posterAt), "-i", input, "-frames:v", "1", tmp]);
  await sharp(tmp).webp({ quality: 80 }).toFile(path.join(ROOT, "public", "images", "art", `${name}-poster.webp`));
  fs.rmSync(tmp, { force: true });
  console.log(`${from} → videos/${name}.mp4 (${Math.round(fs.statSync(out).size / 1024)} KB) + capa`);
}
