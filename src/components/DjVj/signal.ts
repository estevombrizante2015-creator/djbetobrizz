/**
 * Geradores dos traçados de "sinal" que conectam DJ → VJ.
 * Lado DJ: forma de onda de áudio (analógica). Lado VJ: pulsos digitais (sinal de vídeo).
 * Tudo determinístico (sem Math.random) para o SSR e a hidratação baterem.
 */

/** [posição ao longo do sinal, desvio a partir do eixo] */
type Point = [along: number, offset: number];

function noise(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Forma de onda de áudio com envelope (cresce e some nas pontas). */
function audioWave(from: number, to: number, amp: number, step: number): Point[] {
  const pts: Point[] = [[from, 0]];
  let i = 0;
  for (let a = from + step; a < to; a += step, i++) {
    const t = (a - from) / (to - from);
    const env = Math.pow(Math.sin(Math.PI * t), 0.7);
    const h = amp * env * (0.3 + 0.7 * noise(i));
    pts.push([a, i % 2 === 0 ? -h : h]);
  }
  pts.push([to, 0]);
  return pts;
}

/** Pulsos quadrados alternados (sync de vídeo) com envelope. */
function digitalWave(from: number, to: number, amp: number, unit: number): Point[] {
  const widths = [1, 0.6, 1.6, 0.8, 0.5, 1.3, 0.7, 2, 0.6, 1.1, 0.8, 1.5, 0.5, 0.9];
  const pts: Point[] = [[from, 0]];
  let a = from;
  let k = 0;
  while (a < to - unit) {
    const w = widths[k % widths.length] * unit;
    const t = (a - from) / (to - from);
    const env = 0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, t * 1.1));
    const h = (k % 2 === 0 ? -1 : 1) * amp * env;
    const end = Math.min(a + w, to - unit / 2);
    // sobe, segue, desce, pequena pausa na linha de base
    pts.push([a, h], [end, h], [end, 0]);
    a = end + unit * 0.45;
    pts.push([a, 0]);
    k++;
  }
  pts.push([to, 0]);
  return pts;
}

function toPath(points: Point[], orientation: "horizontal" | "vertical", axis: number) {
  return points
    .map(([along, offset], i) => {
      const [x, y] = orientation === "horizontal" ? [along, axis + offset] : [axis + offset, along];
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

/** Traçado horizontal (desktop) — viewBox 0 0 1200 100, nó central em x = 600. */
export const signalHorizontal = toPath(
  [...audioWave(40, 470, 36, 7), [600, 0], ...digitalWave(730, 1160, 24, 16)],
  "horizontal",
  50,
);

/** Segmento vertical de áudio (mobile, acima da equação) — viewBox 0 0 40 112. */
export const signalAudioVertical = toPath(audioWave(0, 112, 14, 5), "vertical", 20);

/** Segmento vertical digital (mobile, abaixo da equação) — viewBox 0 0 40 112. */
export const signalVideoVertical = toPath(digitalWave(0, 112, 11, 8), "vertical", 20);
