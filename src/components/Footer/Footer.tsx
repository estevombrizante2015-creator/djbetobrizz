import { siteConfig } from "@/config/site";
import { socialLinks } from "@/data/social";
import { socialEvent } from "@/lib/analytics";
import { safeExternalUrl } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { ArrowDownIcon, MapPinIcon, socialIcons } from "@/components/ui/Icons";
import { Visualizer } from "@/components/Visualizer/Visualizer";
import { TrackedLink } from "@/components/CTA/TrackedLink";

/** Ano do copyright conforme a especificação (§27). */
const COPYRIGHT_YEAR = 2026;

/**
 * Footer minimalista (§27): logo, DJ & VJ, redes, localização e copyright.
 * Uma linha de spectrum abre o rodapé e o nome gigante em contorno fecha a "apresentação"
 * (e ainda reserva espaço para o botão flutuante do WhatsApp no mobile).
 */
export function Footer() {
  const links = socialLinks
    .map((s) => ({ ...s, href: safeExternalUrl(s.href) }))
    .filter((s): s is typeof s & { href: string } => Boolean(s.href));

  return (
    <footer className="relative overflow-hidden border-t border-line bg-void">
      {/* ---------- Linha de spectrum (menos barras no mobile, mais finas no desktop) ---------- */}
      <div aria-hidden className="relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-magenta to-transparent opacity-70" />
        <div className="container-bb [mask-image:linear-gradient(90deg,transparent,black_18%,black_82%,transparent)]">
          <div className="lg:hidden">
            <Visualizer bars={36} height="1.25rem" palette="red" mirror className="opacity-70" />
          </div>
          <div className="hidden lg:block">
            <Visualizer bars={112} height="1.5rem" palette="red" mirror className="opacity-70" />
          </div>
        </div>
      </div>
      {/* brilho baixo no centro, como luz de palco apagando */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 h-64 w-[min(60rem,120vw)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgb(255_20_147/0.12),transparent_70%)]"
      />

      <div className="container-bb relative pt-12 sm:pt-16">
        <div className="grid gap-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center lg:gap-16">
          {/* ---------- Marca ---------- */}
          <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
            <a
              href="#inicio"
              className="block w-40 transition-[filter] duration-300 hover:drop-shadow-[0_0_14px_rgb(255_36_20/0.45)] sm:w-48"
              aria-label={`${siteConfig.name} — voltar ao início`}
            >
              <Logo sizes="192px" alt="" />
            </a>
            <div className="flex flex-col items-center gap-2 lg:items-start">
              <p className="flex items-center gap-3 font-hud text-lg font-bold tracking-[0.32em] text-white uppercase">
                <span aria-hidden className="h-px w-6 bg-red shadow-neon-red" />
                {siteConfig.title}
                <span aria-hidden className="h-px w-6 bg-red shadow-neon-red lg:hidden" />
              </p>
              <p className="hud text-mute">{siteConfig.tagline}</p>
            </div>
          </div>

          {/* ---------- Redes + localização ---------- */}
          <div className="flex flex-col items-center gap-6 lg:items-end">
            <nav aria-label="Redes sociais">
              <ul className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:justify-end">
                {links.map((s) => {
                  const Icon = socialIcons[s.key];
                  return (
                    <li key={s.key}>
                      <TrackedLink
                        href={s.href}
                        external
                        event={socialEvent(s.key)}
                        eventParams={{ source: "footer" }}
                        className="group flex h-11 items-center gap-2 rounded-full border border-line-strong px-4 text-mute transition-[color,border-color,box-shadow] duration-300 hover:border-magenta hover:text-white hover:shadow-neon-magenta focus-visible:border-magenta focus-visible:text-white"
                      >
                        <Icon size={18} className="transition-colors duration-300 group-hover:text-magenta" />
                        <span className="font-hud text-sm font-semibold tracking-[0.14em] uppercase">{s.label}</span>
                        <span className="sr-only"> (abre em nova aba)</span>
                      </TrackedLink>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <p className="flex items-center gap-2 text-center font-hud text-base font-semibold tracking-[0.12em] text-white uppercase">
              <MapPinIcon size={16} className="shrink-0 text-red" />
              <span className="text-balance">{siteConfig.location}</span>
            </p>
          </div>
        </div>

        {/* ---------- Barra final ---------- */}
        <div className="mt-12 flex flex-col items-center gap-5 border-t border-line pt-6 text-center lg:flex-row lg:justify-between lg:text-left">
          <div className="flex flex-col gap-1.5">
            <p className="text-sm text-mute">
              © {COPYRIGHT_YEAR} {siteConfig.name}.{" "}
              <span className="whitespace-nowrap">Todos os direitos reservados.</span>
            </p>
            <p className="hud text-[0.65rem] text-mute/70">{siteConfig.experienceName}</p>
          </div>
          <a
            href="#inicio"
            className="hud group inline-flex min-h-11 items-center gap-3 rounded-full pr-1 pl-4 text-mute transition-colors duration-300 hover:text-cyan focus-visible:text-cyan"
          >
            Voltar ao topo
            <span
              aria-hidden
              className="grid size-9 place-items-center rounded-full border border-line-strong transition-[border-color,box-shadow,transform] duration-300 group-hover:-translate-y-0.5 group-hover:border-cyan group-hover:shadow-neon-cyan"
            >
              <ArrowDownIcon size={14} className="rotate-180" />
            </span>
          </a>
        </div>

        {/* ---------- Nome gigante: BETO sólido + BRIZZ em contorno (como no logo) ---------- */}
        <div aria-hidden className="@container pointer-events-none mt-12 select-none sm:mt-10">
          <p className="translate-y-[16%] text-center font-display text-[11.4cqi] leading-[0.8] font-black tracking-[-0.01em] whitespace-nowrap uppercase">
            <span className="text-white/[0.07]">Beto</span>
            <span className="text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.16)]">Brizz</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
