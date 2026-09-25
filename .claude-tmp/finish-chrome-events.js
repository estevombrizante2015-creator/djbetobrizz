export const meta = {
  name: 'finish-chrome-events',
  description: 'Finish the header/chrome and events/gallery groups (interrupted earlier), then art-direct and fix them',
  phases: [
    { title: 'Build', detail: 'chrome + events builders' },
    { title: 'Art direction', detail: 'independent reviewer per group' },
  ],
}

const ROOT = 'c:/djbetobrizz'
const SHOTS = 'C:/Users/ESTEVO~1/AppData/Local/Temp/claude/c--djbetobrizz/93580ea0-18b4-4d9f-b8fd-dcfc6a55707b/scratchpad/shots'

const BRIEF = `
# CONTEXT — DJ BetoBrizz website (DJ & VJ, Mogi Guaçu / Mogi Mirim - SP)
Project root: ${ROOT}. Full spec (Portuguese): ${ROOT}/projeto.md — READ the sections listed for your task, plus §4-6 (art direction, palette, type), §28-31 (interactions, glitch, VHS, responsiveness), §34 (a11y), §50 (no generic template look), §63-65 (guiding principle).
Concept: "BETOBRIZZ — SOUND & VISUAL EXPERIENCE". Retro-futuristic / night club / audiovisual. Black dominates; neon (purple #8A2BE2, magenta #FF1493, cyan #00E5FF, electric blue #0066FF) + the LOGO RED #FF2414 (the "DJ" in the logo) + white. Mix flashback (VHS, CRT, scanlines, cassette, CD, vinyl, 80s grid) with electronic (waveforms, spectrum, lasers, glow, particles) and VJ (screens/telões, frames, glitch, projections). Premium, NOT a generic template, NOT bootstrap cards, NOT an agency layout. The visitor should feel they entered a dance floor.
Brand assets: the logo (public/images/logo/logo-dark.png, use <Logo/>) = "BETO" white solid + "BRIZZ" white outline + "DJ" red, with a mixer KNOB as the "O" of BETO (brand symbol, also the favicon; <KnobIcon/> exists). Promo art uses tagline "MUSIC VIDEO ENTERTAINMENT".

## Stack (already set up — DO NOT add npm dependencies)
- Next.js 16.3 App Router, React 19.2, TypeScript strict. Read node_modules/next/dist/docs/ if unsure about an API. next/image: \`priority\` is DEPRECATED → use \`preload\` (or loading="eager" + fetchPriority="high") only above the fold; allowed \`quality\` values are ONLY 60, 75, 85; always pass a correct \`sizes\`. Use \`imageProps(src)\` from "@/lib/utils" to spread {src,width,height,placeholder:"blur",blurDataURL} for local images (or \`fill\` + sizes inside a sized relative parent).
- Tailwind CSS v4 (CSS-first). Tokens in src/app/globals.css (READ IT FIRST): colors void/ink/panel/panel-2/line/line-strong/purple/magenta/cyan/blue/red/white/mute/dim (e.g. bg-void, text-mute, border-line, text-cyan); fonts font-display (Orbitron: big titles), font-hud (Rajdhani: labels/nav), font-sans (Inter: body), font-vhs (VT323: VHS OSD only); shadows shadow-neon-{magenta,cyan,purple,red}; animations animate-eq, animate-scroll-cue, animate-rec, animate-flicker, animate-scan, animate-grid, animate-marquee, animate-pulse-glow, animate-spin-slow; custom utilities: container-bb (page container), section-y (section vertical padding), hud (HUD label style), vhs, text-glow-{magenta,cyan,purple,red}, text-neon-gradient, text-outline, scanlines, grain, retro-grid, neon-frame, glass; plain CSS classes .glitch (+ data-text attr; animates on hover, on .group:hover, or with .is-glitching) and .fx-desktop-only.
- motion 13 (Framer Motion): \`import { motion, useScroll, useTransform, useInView, AnimatePresence } from "motion/react"\`. <MotionConfig reducedMotion="user"> is already global.
- Shared modules (READ before use; do NOT modify them):
  - @/config/site → siteConfig (name, title, tagline, heroText, whatsappUrl, instagram, facebook, soundcloud, handles, cities, region, location, logo, profileImage, heroImage {desktop,mobile,alt}, heroVideo (null now)).
  - @/data/events, gallery, videos (EMPTY), sets (EMPTY), content (stats (EMPTY → hide), musicStyles, eventTypes, decades, pillars, phrases), social (socialLinks, navItems), types.
  - @/lib/utils → cn, imageProps, getImageMeta, safeExternalUrl, timecode. @/lib/analytics → track(event, params), socialEvent(key). Events: page_view, whatsapp_click, instagram_click, facebook_click, soundcloud_click, video_play, gallery_open, cta_click, experience_mode.
  - @/lib/animations → ease, duration, fadeUp, fadeIn, scaleIn, slideLeft, slideRight, stagger(), inViewOnce.
  - @/components/Effects/ExperienceContext → useExperience(): { experienceMode, toggleExperience, setExperienceMode, reducedMotion, isDesktop (fine pointer + ≥1024px; false on SSR/touch), intensity 0|1|2, introDone, setIntroDone }.
  - @/components/ui/NeonButton (pill neon button; href/external/event/eventParams/icon/variant magenta|cyan|purple|red|white/size sm|md|lg), @/components/ui/SectionHeading (kicker/title/subtitle/accent/align/glitch/id — renders the section h2; pass id and use it in <section aria-labelledby>), @/components/ui/Reveal, @/components/ui/Logo, @/components/ui/Icons (WhatsApp, Instagram, Facebook, SoundCloud, Headphones, Play, ArrowDown, ArrowRight, Close, ChevronLeft/Right, ZoomIn/Out, Volume, MapPin, Menu, Spark, Knob icons + socialIcons map).
  - @/components/Visualizer/Visualizer (<Visualizer bars height palette="neon|red|cyan" mirror label/>: scroll-reactive fake spectrum), @/components/Visualizer/SectionDivider, @/components/Effects/VhsOverlay (<VhsOverlay mode="PLAY|REC|PAUSE" track="TRACK 04" start={92}/> absolute overlay inside a relative parent), @/components/Effects/Particles (<Particles className density colors/>) and @/components/Effects/Lasers (<Lasers className count/>) — these two are being implemented by the hero builder right now; import them freely, their props API is fixed.
- Page composition is in src/app/page.tsx (do NOT edit). Order: Loader, Cursor, Header, main#conteudo[Hero, About, DjVj, TheExperience, divider, MusicStyles, Flashback, Events, EventTypes, Gallery, divider, Videos, Sets, Impact, CTA], Footer, SocialLinks, WhatsAppButton. Anchor ids used by the nav: inicio, sobre, experiencia, eventos, videos, sets, contato (keep these ids on the right sections).

## Images available (public/…; all already in image-meta, use imageProps)
/images/logo/logo-dark.png (logo for dark bg) · /images/profile/betobrizz-perfil.webp (portrait, leather jacket, LED bg, vertical) ·
/images/events/betobrizz-telao-vermelho.webp (DJ at controller in front of red LED screens — landscape) · betobrizz-palco-telas-retro.webp (wide stage: DJ booth + LED screens shaped like RETRO CRT TVs + lighting truss + drum kit) · betobrizz-mixagem-close.webp (hands on Pioneer controller, warm) · betobrizz-mixagem-close-azul.webp (hands on faders, cool) · betobrizz-na-cabine.webp (DJ with headphones at controller) · betobrizz-cabine-pioneer.webp (DJ + laptop + controller, bright) · betobrizz-controladora.webp (vertical, green light, DJ at controller) · betobrizz-pista-verde.webp (vertical, view from booth to crowd, green) · betobrizz-pista-magenta.webp (vertical, crowd, magenta/red) ·
/images/art/betobrizz-neon-stage.webp (3D neon logo on stage with 80s neon grid floor, landscape) · betobrizz-arena.webp (wide arena stage art with logo + lasers) · betobrizz-poster-vertical.webp (vertical 9:16 promo art with logo).

## HARD RULES
1. FILE OWNERSHIP: only create/edit the files listed as yours (you may add new files inside your own component folders, e.g. a colocated Foo.module.css or subcomponents). Never edit shared files (globals.css, lib/*, ui/*, config/*, data/*, page.tsx, layout.tsx, other groups' components). If you need a shared change, put it in sharedChangeRequests in your report.
2. NEVER invent facts: no fake event names, dates, numbers, testimonials, clients, cities or years of experience. Render only what data/config provides; hide empty fields gracefully. Content must stay data-driven (adding an item to a data file must "just work").
3. UI copy in Brazilian Portuguese, keeping the spec's English flourishes (SEE THE VIBE, LISTEN TO THE MIX, THE EXPERIENCE, SCROLL TO ENTER THE EXPERIENCE…). Use the exact copy from the spec where given.
4. Accessibility: semantic <section aria-labelledby> with the h2 from SectionHeading (single h1 is in the Hero only), alt text, all interactive elements keyboard-operable with visible focus, aria-label on icon-only buttons, decorative layers aria-hidden, contrast ≥ AA for body text (use text-white / text-mute for body; text-dim only decorative). prefers-reduced-motion: no autoplaying motion loops/canvas/parallax when reducedMotion (static fallback).
5. Performance, mobile-first: heavy effects (canvas, many layers, parallax, blend modes) only when isDesktop; pause rAF/canvas when offscreen (IntersectionObserver) and when document.hidden; lazy-load images below the fold; dynamic import (next/dynamic or import()) for heavy client-only pieces; no layout shift; NO horizontal overflow at 360–390px width (test it!). Avoid "use client" on components that don't need it (split into small client islands when practical).
6. Glitch only at strategic moments (logo/titles/transitions/hover), never constant. VHS elements only in some areas.
7. Code quality: TypeScript strict, no \`any\`, no eslint errors, match the style of existing files (named exports, small focused components, short Portuguese JSDoc where useful).

## VERIFY YOUR WORK (mandatory)
- A Next dev server with HMR is ALREADY running at http://localhost:3000 serving this folder. DO NOT start another server and DO NOT run \`next build\` (shared .next dir).
- \`cd ${ROOT} && npx tsc --noEmit\` and \`npx eslint <your files>\` must be clean for your files (errors in files owned by other groups while they work are not yours — ignore them).
- Screenshots: \`node scripts/screenshot.mjs --selector "#yourId" --out ${SHOTS}/<group>/<name>.png\` (desktop 1440x900), add \`--mobile\` for 390x844, \`--reduced-motion\`, \`--full\`, \`--click "<css>"\`, \`--wait <ms>\`. It prints browser console errors — fix any from your code. Open the PNGs with the Read tool and LOOK at them critically. Iterate until it looks premium on desktop AND mobile. If the page shows a Next.js error overlay caused by another group's file mid-edit, wait ~30s (sleep via a short loop is not allowed — just re-run later after doing other work) and retry.

## CONCURRENCY NOTE
Other agents are simultaneously finishing OTHER groups (hero, about/DjVj/TheExperience, styles/flashback, media, closing/CTA/footer). Never touch their files. The page on :3000 may transiently show errors from their in-progress files — work around it (retry later, or verify your component in isolation via tsc/eslint) and do not "fix" their files.
## CLIENT DECISIONS (override anything above)
- No statistics/numbers section anywhere on the site.
- WhatsApp: chat BALLOON that opens the prefilled wa.me link; the number "+55 19 99644-1824" (siteConfig.whatsappDisplay) may also appear as text.
- Events: photos + short type labels are the final content (no names/dates needed).
`

const GROUPS = [
  {
    key: 'chrome',
    files: ['src/components/Header/* (Header.tsx + helpers)', 'src/components/Effects/ExperienceToggle.tsx', 'src/components/Loader/Loader.tsx', 'src/components/Cursor/Cursor.tsx', 'src/components/WhatsAppButton/WhatsAppButton.tsx', 'src/components/SocialLinks/SocialLinks.tsx'],
    spec: '§8 (menu), §25 (WhatsApp flutuante), §26 (redes sociais), §28 (cursor), §47 (loading), §48-49 (experience mode), §51 (navegação estilo equipamento de DJ), §10 (hero animation — you own its first half via the Loader)',
    selectors: 'header (top of page, desktop + mobile, mobile menu opened via --click on the hamburger), the WhatsApp button, the social bar',
    task: `STATE: an earlier agent was interrupted mid-work. Header.tsx, Loader.tsx, Cursor.tsx, WhatsAppButton.tsx and SocialLinks.tsx are still STUBS. Unverified, unimported helper files it left: src/components/Header/{MenuButton.tsx, MixerNav.tsx, MobileMenu.tsx, TrackWaveform.tsx, useActiveSection.ts} and src/components/Effects/{ExperienceToggle.tsx, ExperienceToggle.module.css}. Read them: reuse what is good, fix or rewrite the rest, and delete any orphan helper you end up not importing.
Build the site "chrome":
- Header.tsx: fixed header, transparent over the hero, turns into a dark glass bar (glass + border-line) after scrolling. Left: the Logo (small, links to #inicio). Desktop nav: navItems (INÍCIO, SOBRE, EXPERIÊNCIA, EVENTOS, VÍDEOS, SETS, CONTATO) styled like a DJ mixer/CDJ strip (§51): each item has a tiny LED dot that lights up (neon) for the ACTIVE section (IntersectionObserver on the section ids), HUD font, subtle channel-fader/waveform hint — without hurting usability. Right: <ExperienceToggle/> + a compact "CONTRATE" NeonButton → siteConfig.whatsappUrl (external, event whatsapp_click, eventParams {source:"header"}). Mobile: animated hamburger (lines morph to X) opening a fullscreen overlay menu designed like a DJ deck (§51 ASCII: "● LIVE ● MIX ● VISUAL ● EVENTS ● CONTACT" using navItems[].deck + label), with staggered entrance, social icons and WhatsApp CTA at the bottom; lock body scroll while open, close on Escape/link click, focus management (focus first link on open, return focus to the button on close), aria-expanded/aria-controls.
- ExperienceToggle.tsx: export ExperienceToggle (button "ENTER EXPERIENCE" / when on "EXPERIENCE ON" with an EQ icon animating; aria-pressed; toggles useExperience().toggleExperience). ALSO export ExperienceOverlay from the same file and render it from within ExperienceToggle via a portal or simply as a fixed element: while experienceMode is on (and not reducedMotion) show a fixed, pointer-events-none, aria-hidden layer with sweeping neon light beams from the top corners + a soft pulsing vignette synced to ~123 BPM; desktop gets the full effect, mobile a lighter one. Always allow switching off. No audio autoplay ever (§48).
- Loader.tsx (§47 + §10 steps 1-4): overlay on top of the SSR'd page: black screen → a faint electronic noise/grain flicker → a horizontal frequency line (SVG waveform) appears and grows in amplitude → "BETOBRIZZ" + "LOADING EXPERIENCE..." + a segmented progress bar ████████░░░░. Total ≤ 900ms, then fade/slide out and CALL useExperience().setIntroDone(true) as the fade starts (the Hero waits for introDone to play the second half: name glitch, DJ & VJ, background motion). Show only once per browser session (sessionStorage flag, wrapped in try/catch); when skipped or when reducedMotion → do not render the overlay and call setIntroDone(true) immediately on mount. Never trap focus or block scrolling longer than the animation; aria-hidden; it must not hide content from crawlers (content is SSR'd beneath).
- Cursor.tsx: desktop-only (useExperience().isDesktop && !reducedMotion) discreet custom cursor: small neon dot + trailing ring following the mouse with spring smoothing; do NOT hide the native cursor. Over interactive elements (a, button, [role=button], [data-cursor]) the ring grows, changes glow color (cyan→magenta) and becomes a circle outline. pointer-events-none, aria-hidden, no layout cost (transform only), render nothing on touch devices.
- WhatsAppButton.tsx (§25, CLIENT DECISION): the floating WhatsApp is a chat BALLOON — a speech-bubble shape with a tail (not a plain circle), WhatsAppIcon inside, brand glow (magenta/red neon ring, subtle pulse). Desktop: next to it a small message-preview bubble "Fale com BetoBrizz" that expands on hover/focus to "FALE COM BETOBRIZZ" + a preview of the predefined message. Mobile: the balloon icon only (aria-label "Falar com BetoBrizz no WhatsApp"). Click opens siteConfig.whatsappUrl (predefined message "Olá Beto! Vi seu site e gostaria de saber mais sobre seu trabalho para um evento." is already in the URL), target _blank rel noopener, track whatsapp_click {source:"floating"}. Appears after a short delay / after leaving the hero top; safe-area inset aware; must not cover content awkwardly on mobile. The phone number may be shown as text via siteConfig.whatsappDisplay ("+55 19 99644-1824") — e.g. in the mobile menu footer (optional).
- SocialLinks.tsx (§26): floating vertical social bar on the left edge for lg+ screens only (hidden on mobile to keep it clean — the footer and mobile menu carry the links): Instagram, Facebook, SoundCloud icons with tooltips/labels, a thin vertical line and a rotated HUD label "FOLLOW". Tracks socialEvent(key) with {source:"floating_bar"}. External links with rel noopener.`,
  },
  {
    key: 'events',
    files: ['src/components/Events/* (Events.tsx, PowerOn.tsx + helpers)', 'src/components/EventTypes/* (EventTypes.tsx, PadGrid.tsx + helpers)', 'src/components/Gallery/* (Gallery.tsx, Lightbox.tsx + helpers)'],
    spec: '§17 (eventos), §18 (eventos destacados), §19 (galeria de fotos), §54 (localização), §55 (tipos de eventos)',
    selectors: '#eventos, #tipos-de-evento, #galeria, and the lightbox open (use --click on the first gallery item) desktop + mobile',
    task: `STATE: an earlier agent was interrupted mid-work. Events.tsx (+ Events/PowerOn.tsx) were written but are unverified (it was rewriting Events.tsx as a server component with justified rows by aspect ratio); EventTypes.tsx is still a STUB but EventTypes/PadGrid.tsx exists (unverified, unimported); Gallery.tsx is a STUB and Lightbox.tsx does not exist. Read what exists: reuse what is good, fix or rewrite the rest, delete orphans.
CLIENT DECISION: event names/dates are NOT needed — the photos with their short type labels ("Ao vivo", "Pista cheia"…) are the FINAL content; tiles must look complete with just the label (no empty slots, no placeholder title/city/date UI). Keep optional rendering of title/location/date only if present in data.
Build:
- Events.tsx — section id="eventos". Title "ONDE A MÚSICA ACONTECE." (kicker "05 // EVENTOS"). Gallery-grid of data/events (§17 layout: 2 columns desktop; featured:true items span larger — build a pleasing bento with the 6 current items, mixing portrait and landscape photos without awkward crops; 1 column mobile). Each tile: next/image lazy with proper sizes, dark gradient, hover (desktop) → image scales up, neon overlay (magenta/cyan duotone wash), reveals name/city/date/type — but ONLY fields that exist (currently only "type" exists; title/location/date are undefined — don't render empty placeholders). On touch devices show the type label always. If an item has title → treat as "EVENTO DESTACADO" (§18) with a bigger caption (future-proof). Add a small HUD label per tile like "CAM 01" / frame counter for the VJ/monitor feel. Tiles are not links (no event pages); if you make them focusable for hover-info parity, keep semantics correct (e.g. figure + figcaption, tabIndex only if meaningful) — simplest: figure/figcaption.
- EventTypes.tsx — section id="tipos-de-evento". Title like "PARA QUAL EVENTO?" or "TIPOS DE EVENTO" (kicker "06 // SERVIÇOS"). Chips/cards from data/content eventTypes (icon + title), styled like illuminated pads of a DJ controller (a 4x2 pad grid that lights up in neon on hover/focus — very on-brand) + regional service block (§54): MapPinIcon + siteConfig.cities as a list + siteConfig.region text + CTA "VER DISPONIBILIDADE" (NeonButton → whatsappUrl, event cta_click {cta:"ver_disponibilidade"}).
- Gallery.tsx — section id="galeria". Title "DIGITAL CONTACT SHEET" (§19) (kicker "07 // GALERIA"). Grid of data/gallery styled as a film contact sheet: thin borders, frame numbers (e.g. "01A ▸"), sprocket-hole strips, glow + zoom on hover + one-shot glitch on hover, subtle red grease-pencil circle mark on one "selected" frame (decorative). Each frame is a <button aria-label="Abrir foto: {alt}"> that opens the lightbox at that index and tracks gallery_open {index}. Responsive: 4 cols desktop / 3 tablet / 2 mobile; no overflow.
- Lightbox.tsx — loaded with next/dynamic (ssr:false) only when first opened. Features (§19): next, previous, close, zoom (toggle zoom ×2 with pan on drag/mouse move; double-tap to zoom on mobile), keyboard (←/→/Esc, focus trap, return focus to the opener), swipe left/right on touch (motion drag or pointer events), counter "03 / 12", caption, preload neighbors, body scroll lock, role="dialog" aria-modal aria-label. Dark backdrop with scanlines, neon UI controls (≥44px touch targets). Use next/image with sizes="100vw" and quality 85.`,
  },
]

const BUILD_SCHEMA = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
    sharedChangeRequests: { type: 'array', items: { type: 'string' } },
    concerns: { type: 'array', items: { type: 'string' } },
  },
  required: ['files', 'summary', 'sharedChangeRequests', 'concerns'],
}

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    fixed: { type: 'array', items: { type: 'string' } },
    remainingIssues: { type: 'array', items: { type: 'string' } },
    sharedChangeRequests: { type: 'array', items: { type: 'string' } },
    verdict: { type: 'string' },
  },
  required: ['fixed', 'remainingIssues', 'sharedChangeRequests', 'verdict'],
}

const results = await pipeline(
  GROUPS,
  (g) => agent(
    `${BRIEF}

# YOUR TASK — group "${g.key}"
You own ONLY these files: ${g.files.join(', ')} (they currently contain stubs — replace them).
Relevant spec sections in projeto.md: ${g.spec}.

${g.task}

When done and verified (tsc + eslint clean for your files, screenshots of ${g.selectors} reviewed at desktop and mobile, no browser console errors from your code), return the structured report. Screenshot folder: ${SHOTS}/${g.key}/`,
    { label: `build:${g.key}`, phase: 'Build', schema: BUILD_SCHEMA },
  ),
  (built, g) => agent(
    `${BRIEF}

# YOUR ROLE — exacting ART DIRECTOR + senior frontend reviewer for group "${g.key}"
Another engineer just implemented these files: ${g.files.join(', ')}.
Their report: ${JSON.stringify(built)}
Spec sections: ${g.spec}. The original task they were given:
${g.task}

Do an independent, skeptical review and then FIX what you find directly in those files (you now own them; same hard rules):
1. Read the code fully. Check spec coverage item by item against the task above and projeto.md — list anything missing/wrong and implement it.
2. Take fresh screenshots of ${g.selectors} at desktop 1440, a laptop 1280x720 (--width 1280 --height 720), mobile 390 (--mobile) and 360 (--mobile --width 360), and with --reduced-motion. LOOK at each. Judge like a demanding art director: does it look premium, bold and on-brand (retro-futuristic night club, DJ+VJ, neon on black, logo red), or template-y/cluttered/broken? Check typography scale & rhythm, spacing, alignment, cropping of photos (faces not cut), text legibility over images, overflow/horizontal scroll at 360px, tap target sizes, hover states (desktop), focus-visible states.
3. Bugs: hydration mismatches (SSR vs client differences — e.g. Math.random/Date in render, isDesktop-dependent markup rendered on the server), effects without cleanup, rAF/canvas not paused offscreen, listeners leaking, missing keys, a11y (roles/labels/keyboard/focus trap/aria), reduced-motion not respected, images missing sizes or wrong quality values (only 60/75/85 allowed), \`priority\` prop used (deprecated), console errors in the screenshot output.
4. Fix everything you can within the owned files, re-verify (tsc, eslint on the files, screenshots again) and report. Be concrete in remainingIssues about anything you could not fix (e.g. needs a shared-file change).
Screenshot folder: ${SHOTS}/${g.key}-review/`,
    { label: `review:${g.key}`, phase: 'Art direction', schema: REVIEW_SCHEMA },
  ).then((r) => ({ group: g.key, built, review: r })),
)

return results.filter(Boolean)
