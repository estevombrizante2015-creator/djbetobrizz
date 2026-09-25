/**
 * Música de fundo — motor único (singleton, só no navegador).
 *
 * Decisão do cliente: o site abre com a música LIGADA.
 * - Ao carregar, tenta tocar sozinho. Os navegadores bloqueiam som antes de um gesto do visitante
 *   (exceto quem já ouviu mídia no site); nesse caso a música começa no PRIMEIRO toque/clique/tecla
 *   em qualquer lugar da página — o player já aparece ativo com a dica "Toque para ouvir".
 * - Se o visitante pausar, a música não volta sozinha nesta sessão. "Economia de dados" → não liga sozinha.
 * - Toca a playlist (src/data/music.ts) em sequência, em loop.
 * - Web Audio AnalyserNode: os Visualizers reagem à música de verdade (ligado só dentro de um gesto,
 *   porque um AudioContext sem gesto fica suspenso e deixaria a música muda).
 * - Pausa quando um <video> do site começa a tocar; players externos (SoundCloud) chamam pauseBackgroundMusic().
 * - Media Session: título/artista/capa e controles na tela de bloqueio do celular.
 */
import { playlist, type Track } from "@/data/music";

export type MusicState = {
  /** Intenção de som ligado (o player aparece ativo). */
  enabled: boolean;
  /** Áudio realmente tocando. */
  playing: boolean;
  /** Carregando/bufferizando a faixa atual. */
  loading: boolean;
  /** O navegador bloqueou o início automático — aguardando o primeiro gesto do visitante. */
  blocked: boolean;
  index: number;
  track: Track | undefined;
};

const OFF_KEY = "bb-music-off";

// Estado inicial igual no servidor e no cliente (hidratação sem divergência).
const initial: MusicState = {
  enabled: playlist.length > 0,
  playing: false,
  loading: false,
  blocked: false,
  index: 0,
  track: playlist[0],
};
let state: MusicState = initial;

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
export const getServerMusicState = () => initial;

let audio: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let bins: Uint8Array<ArrayBuffer> | null = null;
let disarmGesture: (() => void) | null = null;

function ensureAudio() {
  if (audio) return audio;
  audio = new Audio();
  audio.preload = "none";
  audio.volume = 0.8;
  audio.addEventListener("ended", () => void play(state.index + 1, false));
  audio.addEventListener("playing", () => emit({ playing: true, loading: false, blocked: false }));
  audio.addEventListener("waiting", () => emit({ loading: true }));
  audio.addEventListener("pause", () => emit({ playing: false, loading: false }));
  audio.addEventListener("error", () => {
    emit({ playing: false, loading: false });
    if (playlist.length > 1 && state.enabled) window.setTimeout(() => void play(state.index + 1, false), 400);
  });

  // Outro vídeo do site começou a tocar → a música de fundo sai de cena
  document.addEventListener(
    "play",
    (e) => {
      if (e.target instanceof HTMLMediaElement && e.target !== audio) pauseBackgroundMusic();
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

/** Liga o analisador (espectro real). Só chamar dentro de um gesto do visitante. */
function ensureAnalyser(el: HTMLAudioElement) {
  if (ctx) {
    if (ctx.state === "suspended") void ctx.resume();
    return;
  }
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  try {
    ctx = new AC();
    if (ctx.state === "suspended") void ctx.resume();
    const source = ctx.createMediaElementSource(el);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.78;
    bins = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
    source.connect(analyser);
    analyser.connect(ctx.destination);
  } catch {
    // sem Web Audio: a música toca normalmente e os visualizers seguem no modo sintético
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
  if (track && el.getAttribute("src") !== track.src) {
    el.src = track.src;
    emit({ index: i, track });
    updateMediaSession(track);
  }
  return el;
}

function rememberOff(off: boolean) {
  try {
    if (off) sessionStorage.setItem(OFF_KEY, "1");
    else sessionStorage.removeItem(OFF_KEY);
  } catch {
    // storage indisponível
  }
}

/**
 * Toca (ou retoma) a faixa `index`.
 * @param fromGesture true quando chamado dentro de um clique/toque (liga o analisador).
 */
export async function play(index = state.index, fromGesture = true) {
  if (!playlist.length) return;
  disarmGesture?.();
  const el = load(index);
  if (fromGesture) ensureAnalyser(el);
  emit({ enabled: true, loading: true });
  rememberOff(false);
  try {
    await el.play();
    // Começou sem gesto (navegador permitiu): o analisador liga no primeiro toque.
    if (!fromGesture && !ctx) armAnalyserOnGesture(el);
  } catch {
    // bloqueado pelo navegador → começa no primeiro gesto
    emit({ loading: false, blocked: true });
    armFirstGesture();
  }
}

function armAnalyserOnGesture(el: HTMLAudioElement) {
  const opts = { capture: true, passive: true, once: true } as const;
  const attach = () => {
    ["pointerup", "touchend", "keydown"].forEach((t) => window.removeEventListener(t, attach, opts));
    ensureAnalyser(el);
  };
  ["pointerup", "touchend", "keydown"].forEach((t) => window.addEventListener(t, attach, opts));
}

/** Pausa pedida pelo visitante (botão/tela de bloqueio): não volta sozinha nesta sessão. */
export function pause() {
  disarmGesture?.();
  audio?.pause();
  emit({ enabled: false, blocked: false, loading: false });
  rememberOff(true);
}

export function toggle() {
  if (state.enabled) pause();
  else void play();
}

export function next() {
  void play(state.index + 1);
}

export function previous() {
  void play(state.index - 1);
}

/** Outro player (vídeo, SoundCloud) começou: silencia sem marcar como "desligado pelo visitante". */
export function pauseBackgroundMusic() {
  disarmGesture?.();
  audio?.pause();
  emit({ enabled: false, blocked: false, loading: false });
}

/**
 * Primeiro gesto do visitante em qualquer lugar → começa a música (e liga o analisador).
 * Gestos dentro do próprio player são ignorados aqui (o botão dele decide).
 */
function armFirstGesture() {
  if (disarmGesture) return;
  const onGesture = (e: Event) => {
    if (e.type === "keydown") {
      const key = (e as KeyboardEvent).key;
      if (["Tab", "Escape", "Shift", "Control", "Alt", "Meta"].includes(key)) return;
    }
    if (e.type === "pointerdown" && (e as PointerEvent).pointerType !== "mouse") return;
    const target = e.target as Element | null;
    if (target?.closest?.("[data-music-control]")) return;
    disarmGesture?.();
    if (state.enabled && !state.playing) void play(state.index, true);
  };
  const opts = { capture: true, passive: true } as const;
  const events = ["pointerdown", "pointerup", "touchend", "keydown"] as const;
  events.forEach((t) => window.addEventListener(t, onGesture, opts));
  disarmGesture = () => {
    events.forEach((t) => window.removeEventListener(t, onGesture, opts));
    disarmGesture = null;
  };
}

/**
 * Chamado uma vez ao abrir o site: liga a música automaticamente (se permitido),
 * senão deixa armado para o primeiro gesto. Respeita "economia de dados" e a pausa do visitante.
 */
export function autoStartMusic() {
  if (!playlist.length) return;
  let off = false;
  try {
    off = sessionStorage.getItem(OFF_KEY) === "1";
  } catch {
    off = false;
  }
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  if (off || saveData) {
    emit({ enabled: false });
    return;
  }
  void play(state.index, false);
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
