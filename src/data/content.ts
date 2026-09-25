export type Accent = "magenta" | "cyan" | "purple" | "blue" | "red";

/** Estilos musicais ("QUAL É A SUA VIBE?") — ajuste conforme o repertório real. */
export const musicStyles: { title: string; text: string; accent: Accent }[] = [
  { title: "Flashback", text: "Clássicos que marcaram gerações.", accent: "magenta" },
  { title: "Electronic", text: "House, dance e música eletrônica.", accent: "cyan" },
  { title: "Anos 80", text: "Synths, clássicos e nostalgia.", accent: "purple" },
  { title: "Anos 90", text: "Dance, eurodance e hits.", accent: "blue" },
  { title: "Anos 2000", text: "Hits que marcaram uma geração.", accent: "magenta" },
  { title: "Open Format", text: "Mistura de estilos para manter a pista em movimento.", accent: "red" },
];

/** Tipos de evento atendidos — exiba apenas serviços realmente oferecidos. */
export const eventTypes: { icon: string; title: string }[] = [
  { icon: "🎉", title: "Festas" },
  { icon: "🪩", title: "Flashback" },
  { icon: "🏢", title: "Eventos corporativos" },
  { icon: "🥂", title: "Confraternizações" },
  { icon: "🎂", title: "Aniversários" },
  { icon: "💃", title: "Clubes" },
  { icon: "🎧", title: "Eventos temáticos" },
];

/** Décadas da seção "VOLTE NO TEMPO". */
export const decades: { year: string; label: string; hint: string }[] = [
  { year: "1980", label: "Synths & neon", hint: "Synthpop, new wave e os clássicos das pistas" },
  { year: "1990", label: "Dance & eurodance", hint: "Eurodance, house e os hits que lotavam as pistas" },
  { year: "2000", label: "Hits da virada", hint: "Pop, electro e club hits" },
  { year: "TODAY", label: "A energia de hoje", hint: "House, open format e remixes atuais" },
];

/** Pilares da seção "THE EXPERIENCE". */
export const pillars: { title: string; text: string; accent: Accent }[] = [
  { title: "Sound", text: "Música e mixagem.", accent: "magenta" },
  { title: "Visual", text: "VJ e conteúdo visual.", accent: "cyan" },
  { title: "Energy", text: "Interação e atmosfera.", accent: "red" },
];

/** Frases de marketing — use poucas por vez. */
export const phrases = [
  "Music is the start.",
  "Visuals create the atmosphere.",
  "The experience is everything.",
  "Turn up the moment.",
  "Sound. Visual. Energy.",
  "O som marca o momento.",
  "A experiência fica.",
] as const;
