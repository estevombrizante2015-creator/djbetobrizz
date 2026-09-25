# DJ BetoBrizz — Sound & Visual Experience

Site oficial do **DJ BetoBrizz — DJ & VJ** (Mogi Guaçu • Mogi Mirim • SP).
One page em Next.js 16 + TypeScript + Tailwind CSS v4 + Motion.

A especificação completa do projeto está em [`projeto.md`](projeto.md).

## Rodando localmente

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de produção
npm run start      # serve o build
npm run lint
npm run typecheck
```

## Onde editar o conteúdo (sem mexer nos componentes)

| O quê | Arquivo |
| --- | --- |
| WhatsApp, Instagram, Facebook, SoundCloud, cidades, textos do hero, imagem/vídeo do hero, ID do Analytics | [`src/config/site.ts`](src/config/site.ts) |
| Eventos (foto + rótulo curto; nome/cidade/data opcionais) | [`src/data/events.ts`](src/data/events.ts) |
| Galeria de fotos | [`src/data/gallery.ts`](src/data/gallery.ts) |
| Vídeos (YouTube, Vimeo, Instagram, arquivo) | [`src/data/videos.ts`](src/data/videos.ts) |
| Sets do SoundCloud | [`src/data/sets.ts`](src/data/sets.ts) |
| Estilos musicais, tipos de evento, décadas, pilares, frases | [`src/data/content.ts`](src/data/content.ts) |
| Menu | [`src/data/social.ts`](src/data/social.ts) |

> **Regra do projeto:** nunca inventar informações. Campos opcionais vazios simplesmente não aparecem no site.
>
> **WhatsApp:** o balão/botão abre o WhatsApp já com a mensagem pré-definida (`whatsappMessage` em `site.ts`);
> o número formatado (`whatsappDisplay`) também aparece como texto no contato e no rodapé.

### Adicionando fotos

1. Coloque a imagem em `public/images/<pasta>/` (JPG, PNG ou WebP).
2. Rode `npm run images` — gera dimensões e o *blur placeholder* em `src/data/image-meta.generated.ts`.
3. Adicione o item em `gallery.ts` ou `events.ts` com `src` e `alt` (descrição da foto).

As fotos originais ficam em `trabalho/`. O script `scripts/process-images.mjs` converte para WebP
otimizado, gera o `social-preview.jpg` (Open Graph 1200×630) e os ícones do PWA.
O logo transparente é gerado por `python scripts/process_logo.py`.

### Adicionando um vídeo

```ts
// src/data/videos.ts
{ title: "Festa Flashback", subtitle: "Mogi Guaçu - SP", platform: "youtube", id: "ID_DO_VIDEO" }
```

Vídeos gravados no celular (verticais) aparecem sozinhos na faixa **"VJ // TELÕES"** em molduras 9:16;
horizontais vão para o telão. Para vídeos próprios: coloque o arquivo em `trabalho/`, adicione-o em
`scripts/process-videos.mjs` e rode `FFMPEG="<caminho>" npm run videos` (converte para 30 fps / ~1,2 Mbps
e gera a capa) e depois `npm run images`. Nenhum vídeo baixa antes do visitante apertar ▶.

### Adicionando um set

```ts
// src/data/sets.ts
{ title: "DJ BetoBrizz — Set Flashback", platform: "SoundCloud", url: "https://soundcloud.com/beto-brizz-dj/nome-do-set" }
```

Com a lista vazia, a seção incorpora o perfil completo do SoundCloud.

### Vídeo de fundo no hero

Coloque os arquivos em `public/videos/` e preencha `heroVideo` em `site.ts`
(1080p para desktop, 720p para mobile, com `poster`). Sem vídeo, o hero usa a foto + efeitos.

## Música de fundo

O site abre com o player **ligado** (canto inferior esquerdo) e tenta tocar sozinho. Como os
navegadores bloqueiam som antes de um gesto do visitante, nesse caso a música começa no primeiro
toque/clique em qualquer lugar da página (o player mostra "Toque para ouvir"). Se o visitante pausar,
ela não volta sozinha naquela visita; com "economia de dados" ativada, não liga sozinha.
Enquanto toca, os equalizadores do site reagem à música de verdade.

Para trocar as faixas: coloque os arquivos (MP3) em `musicadefundo/` e rode

```bash
npx --yes ffmpeg-static          # mostra o caminho do ffmpeg baixado
FFMPEG="<caminho>" npm run audio # converte para 128 kbps, extrai as capas e gera a lista
```

A ordem das faixas pode ser ajustada em [`src/data/music.ts`](src/data/music.ts).

## Níveis de performance

O site escolhe automaticamente o nível de efeitos (`<html data-perf>`), antes da primeira pintura:

| Nível | Quem | O que muda |
| --- | --- | --- |
| `full` | Desktops com mouse, ≥4 núcleos e ≥4 GB | Tudo: partículas, lasers, parallax, efeitos ligados ao scroll, vidro com blur |
| `balanced` | Celulares, tablets e PCs comuns | Animações leves (equalizadores, brilhos, entradas), sem efeitos caros |
| `lite` | Aparelhos fracos, economia de dados, movimento reduzido | Visual estático |

Em produção, se o FPS medido cair, o nível desce um degrau sozinho. Para testar: `?perf=lite`,
`?perf=balanced` ou `?perf=full` na URL. Medição: `node scripts/perf-check.mjs` e
`node scripts/perf-sections.mjs` contra o build de produção.

## Analytics

Defina `NEXT_PUBLIC_GA_ID=G-XXXXXXX` (variável de ambiente) ou `gaId` em `site.ts`.
Eventos rastreados: `whatsapp_click`, `instagram_click`, `facebook_click`, `soundcloud_click`,
`video_play`, `gallery_open`, `cta_click`, `experience_mode` (+ `page_view` automático do GA4).

## Deploy

Recomendado: **Vercel** (zero configuração) — também funciona em Netlify, Cloudflare Pages ou servidor Node.

- Domínio: `djbetobrizz.com.br` (redirecionar `www` → domínio principal no painel da hospedagem).
- Defina `NEXT_PUBLIC_SITE_URL=https://djbetobrizz.com.br` se usar outro domínio (canonical, OG, sitemap).
- Headers de segurança já configurados em `next.config.ts` (HSTS, nosniff, frame, referrer, permissions).

## Estrutura

```text
src/
├── app/            layout (SEO, fontes, JSON-LD), page, manifest, robots, sitemap, ícones
├── components/     uma pasta por seção (Hero, About, DjVj, Events, Gallery, Videos, Sets, CTA…)
│   ├── Effects/    Experience Mode, partículas, lasers, overlay VHS
│   ├── Visualizer/ spectrum analyzer simulado (reage ao scroll)
│   └── ui/         botão neon, títulos de seção, logo, ícones
├── config/site.ts  configuração central
├── data/           conteúdo editável
└── lib/            analytics, animações, utilitários
```
