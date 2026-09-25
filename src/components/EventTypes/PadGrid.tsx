"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { siteConfig } from "@/config/site";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { KnobIcon } from "@/components/ui/Icons";
import { useExperience } from "@/components/Effects/ExperienceContext";

type PadColor = "magenta" | "cyan" | "purple" | "blue" | "red";

/** Cores dos pads — ciclo neon + vermelho do logo. */
const cycle: PadColor[] = ["magenta", "cyan", "purple", "red", "blue", "magenta", "cyan", "purple"];

/** Classes por cor (estáticas para o Tailwind encontrar). */
const tone: Record<PadColor, { rim: string; lit: string; glow: string; text: string; led: string }> = {
  magenta: {
    rim: "border-magenta/35",
    lit: "group-hover:border-magenta group-focus-visible:border-magenta group-hover:shadow-neon-magenta group-focus-visible:shadow-neon-magenta",
    glow: "bg-[radial-gradient(120%_90%_at_50%_0%,rgb(255_20_147/0.55),transparent_70%)]",
    text: "group-hover:text-glow-magenta group-focus-visible:text-glow-magenta",
    led: "bg-magenta",
  },
  cyan: {
    rim: "border-cyan/35",
    lit: "group-hover:border-cyan group-focus-visible:border-cyan group-hover:shadow-neon-cyan group-focus-visible:shadow-neon-cyan",
    glow: "bg-[radial-gradient(120%_90%_at_50%_0%,rgb(0_229_255/0.5),transparent_70%)]",
    text: "group-hover:text-glow-cyan group-focus-visible:text-glow-cyan",
    led: "bg-cyan",
  },
  purple: {
    rim: "border-purple/45",
    lit: "group-hover:border-purple group-focus-visible:border-purple group-hover:shadow-neon-purple group-focus-visible:shadow-neon-purple",
    glow: "bg-[radial-gradient(120%_90%_at_50%_0%,rgb(138_43_226/0.6),transparent_70%)]",
    text: "group-hover:text-glow-purple group-focus-visible:text-glow-purple",
    led: "bg-purple",
  },
  red: {
    rim: "border-red/40",
    lit: "group-hover:border-red group-focus-visible:border-red group-hover:shadow-neon-red group-focus-visible:shadow-neon-red",
    glow: "bg-[radial-gradient(120%_90%_at_50%_0%,rgb(255_36_20/0.55),transparent_70%)]",
    text: "group-hover:text-glow-red group-focus-visible:text-glow-red",
    led: "bg-red",
  },
  blue: {
    rim: "border-blue/45",
    lit: "group-hover:border-blue group-focus-visible:border-blue group-hover:shadow-[0_0_12px_rgb(0_102_255/0.6),0_0_32px_rgb(0_102_255/0.3)] group-focus-visible:shadow-[0_0_12px_rgb(0_102_255/0.6),0_0_32px_rgb(0_102_255/0.3)]",
    glow: "bg-[radial-gradient(120%_90%_at_50%_0%,rgb(0_102_255/0.6),transparent_70%)]",
    text: "",
    led: "bg-blue",
  },
};

/** Link do WhatsApp com a mensagem já citando o tipo de evento escolhido. */
function whatsappFor(title: string) {
  const text = `Olá Beto! Vi seu site e gostaria de consultar a disponibilidade para um evento: ${title}.`;
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(text)}`;
}

const HOT_CUES = "ABCDEFGH";

type Props = { items: ReadonlyArray<{ icon: string; title: string }> };

/**
 * Grade de pads de controladora (HOT CUE). Cada pad é um link para o WhatsApp
 * com o tipo de evento na mensagem. Ao entrar na tela os pads piscam uma vez
 * em sequência, como a checagem de LEDs ao ligar o equipamento.
 */
export function PadGrid({ items }: Props) {
  const ref = useRef<HTMLUListElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const { reducedMotion } = useExperience();

  // Pads "apagados" completam a última fileira (4 colunas; 2 no celular).
  const fill4 = (4 - (items.length % 4)) % 4;
  const fill2 = (2 - (items.length % 2)) % 2;

  return (
    <ul ref={ref} className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
      {items.map((item, i) => {
        const color = cycle[i % cycle.length];
        const t = tone[color];
        return (
          <li key={item.title} className="min-w-0">
            <a
              href={whatsappFor(item.title)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${item.title} — consultar disponibilidade no WhatsApp`}
              onClick={() => track("whatsapp_click", { source: "tipos_de_evento", tipo: item.title })}
              className="group relative block h-full rounded-xl outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
            >
              <span
                className={cn(
                  "relative flex aspect-[5/4] h-full flex-col justify-between overflow-hidden rounded-xl border p-3 sm:p-4",
                  "bg-gradient-to-b from-panel-2 to-ink",
                  "shadow-[inset_0_1px_0_rgb(255_255_255/0.07),inset_0_-10px_24px_rgb(0_0_0/0.55)]",
                  "transition-[border-color,box-shadow,transform] duration-300 ease-out group-active:scale-[0.96]",
                  t.rim,
                  t.lit,
                )}
              >
                {/* Luz de fundo do pad: fraca em repouso, acesa no hover/foco */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-0 opacity-15 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100",
                    t.glow,
                  )}
                />
                {/* Flash único de checagem dos LEDs */}
                {!reducedMotion ? (
                  <motion.span
                    aria-hidden
                    className={cn("absolute inset-0", t.glow)}
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: [0, 1, 0] } : { opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 + i * 0.09, ease: "easeOut" }}
                  />
                ) : null}

                <span aria-hidden className="relative flex items-center justify-between">
                  <span className="hud text-[0.6rem] text-white/55">PAD {String(i + 1).padStart(2, "0")}</span>
                  <span className={cn("h-1 w-4 rounded-full opacity-70 transition-opacity group-hover:opacity-100", t.led)} />
                </span>

                <span
                  aria-hidden
                  className="relative text-3xl leading-none grayscale-[0.85] brightness-110 transition-[filter,transform] duration-300 group-hover:scale-110 group-hover:grayscale-0 group-focus-visible:grayscale-0 sm:text-4xl"
                >
                  {item.icon}
                </span>

                <span className="relative flex items-end justify-between gap-2">
                  <span
                    className={cn(
                      "font-hud text-[0.95rem] leading-tight font-bold tracking-[0.12em] text-white uppercase sm:text-base",
                      t.text,
                    )}
                  >
                    {item.title}
                  </span>
                  <span aria-hidden className="hud text-[0.6rem] text-white/40">
                    {HOT_CUES[i % HOT_CUES.length]}
                  </span>
                </span>
              </span>
            </a>
          </li>
        );
      })}

      {Array.from({ length: fill4 }, (_, k) => (
        <li key={`vazio-${k}`} aria-hidden className={cn(k >= fill2 && "hidden sm:block")}>
          <span className="flex aspect-[5/4] h-full flex-col items-center justify-center gap-2 rounded-xl border border-line bg-gradient-to-b from-panel to-void shadow-[inset_0_1px_0_rgb(255_255_255/0.05),inset_0_-10px_24px_rgb(0_0_0/0.6)]">
            <KnobIcon size={26} className="text-white/25" />
            <span className="hud text-[0.6rem] text-white/30">Shift</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
