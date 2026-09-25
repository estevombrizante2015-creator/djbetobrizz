/**
 * Música de fundo — motor único (singleton, só no navegador).
 *
 * - Nada é baixado até o visitante apertar o botão SOM (os navegadores bloqueiam áudio sem clique).
 * - Toca a playlist (src/data/music.ts) em sequência, em loop.
 * - Web Audio AnalyserNode: os Visualizers do site reagem à música de verdade enquanto toca.
 * - Pausa sozinha quando um <video> do site começa a tocar; outros players (SoundCloud)
 *   chamam pauseBackgroundMusic().
 * - Media Session: título/artista/capa e controles na tela de bloqueio do celular.
 */
import { playlist, type Track } from "@/data/music";

export type MusicState = {
  playing: boolean;
  /** Carregando/bufferizando a faixa atual. */
  loading: boolean;
  index: number;
  track: Track | undefined;
  /** O visitante já ativou o som alguma vez nesta página. */
  started: boolean;
};

let state: MusicState = {
  playing: false,
  loading: false,
  index: 0,
  track: playlist[0],
  started: false,
};

const listeners = new Set<() => void>();
const emit = (patch: Partial<MusicState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

export function subscribeMusic(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export const getMusicState = () => state;
export const getServerMusicState = () => state;

let audio: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let bins: Uint8Array<ArrayBuffer> | null = null;

function ensureAudio() {
  if (audio) return audio;
  audio = new Audio();
  audio.preload = "none";
  audio.volume = 0.8;
  audio.addEventListener("ended", () => next());
  audio.addEventListener("playing", () => emit({ playing: true, loading: false }));
  audio.addEventListener("waiting", () => emit({ loading: true }));
  audio.addEventListener("pause", () => emit({ playing: false, loading: false }));
  audio.addEventListener("error", () => {
    emit({ playing: false, loading: false });
    // faixa com problema → tenta a próxima (uma vez por faixa)
    if (playlist.length > 1) window.setTimeout(() => next(), 400);
  });

  // Outro vídeo do site começou a tocar → a música de fundo sai de cena
  document.addEventListener(
    "play",
    (e) => {
      if (e.target instanceof HTMLMediaElement && e.target !== audio) audio?.pause();
    },
    true,
  );

  if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("play", () => void play());
    navigator.mediaSession.setActionHandler("pause", () => pause());
    navigator.mediaSession.setActionHandler("nexttrack", () => next());
    navigator.mediaSession.setActionHandler("previoustrack", () => previous());
  }
  return audio;
}

/** Cria o analisador na primeira reprodução (precisa acontecer dentro do clique). */
function ensureAnalyser(el: HTMLAudioElement) {
  if (ctx) {
    if (ctx.state === "suspended") void ctx.resume();
    return;
  }
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  try {
    ctx = new AC();
    const source = ctx.createMediaElementSource(el);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.78;
    bins = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
    source.connect(analyser);
    analyser.connect(ctx.destination);
  } catch {
    // sem Web Audio: a música toca normalmente, os visualizers seguem no modo sintético
    ctx = null;
    analyser = null;
  }
}

function updateMediaSession(track: Track | undefined) {
  if (!track || !("mediaSession" in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artist,
    album: "DJ BetoBrizz — Sound & Visual Experience",
    artwork: track.cover ? [{ src: track.cover, sizes: "160x160", type: "image/webp" }] : [],
  });
}

function load(index: number) {
  const el = ensureAudio();
  const i = ((index % playlist.length) + playlist.length) % playlist.length;
  const track = playlist[i];
  if (!track) return el;
  if (el.getAttribute("src") !== track.src) {
    el.src = track.src;
    emit({ index: i, track });
    updateMediaSession(track);
  }
  return el;
}

/** Toca (ou retoma). Chame a partir de um clique/toque do visitante. */
export async function play(index = state.index) {
  if (!playlist.length) return;
  const el = load(index);
  ensureAnalyser(el);
  emit({ loading: true, started: true });
  try {
    await el.play();
  } catch {
    emit({ playing: false, loading: false });
  }
}

export function pause() {
  audio?.pause();
}

export function toggle() {
  if (state.playing) pause();
  else void play();
}

export function next() {
  void play(state.index + 1);
}

export function previous() {
  void play(state.index - 1);
}

/** Para players externos (ex.: SoundCloud) pedirem silêncio. */
export function pauseBackgroundMusic() {
  pause();
}

/**
 * Níveis 0..1 por barra a partir do espectro real (escala logarítmica de frequência).
 * Retorna false quando a música não está tocando (o Visualizer usa o sinal sintético).
 */
export function readLevels(out: Float32Array): boolean {
  if (!state.playing || !analyser || !bins) return false;
  analyser.getByteFrequencyData(bins);
  const n = out.length;
  const maxBin = Math.floor(bins.length * 0.72); // acima disso quase não há energia em música
  for (let i = 0; i < n; i++) {
    const a = Math.floor(Math.pow(maxBin, i / n));
    const b = Math.max(a + 1, Math.floor(Math.pow(maxBin, (i + 1) / n)));
    let sum = 0;
    for (let k = a; k < b; k++) sum += bins[k];
    out[i] = sum / (b - a) / 255;
  }
  return true;
}
