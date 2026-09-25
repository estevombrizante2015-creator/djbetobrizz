/**
 * Perfil de rolagem SEÇÃO POR SEÇÃO em aparelho simples simulado.
 * Para cada seção: altura, FPS, frames > 50ms e tarefas longas enquanto ela passa pela tela.
 *
 *   node scripts/perf-sections.mjs [--url http://localhost:3107] [--cpu 6] [--desktop]
 */
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const get = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : d;
};
const url = get("url", "http://localhost:3107");
const cpu = Number(get("cpu", "6"));
const desktop = args.includes("--desktop");

const browser = await chromium.launch({
  executablePath: process.env.BROWSER_PATH ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
});
const context = await browser.newContext(
  desktop
    ? { viewport: { width: 1366, height: 768 } }
    : { viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
);
const page = await context.newPage();
await page.addInitScript(() => {
  window.__lt = [];
  new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push(e.duration))).observe({ type: "longtask" });
});
await page.goto(url, { waitUntil: "load" });
await page.waitForTimeout(3000);
const cdp = await context.newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });

const rows = await page.evaluate(async () => {
  const sel = [
    "#inicio", "#sobre", "#experiencia", "#the-experience", "#estilos", "#flashback",
    "#eventos", "#tipos-de-evento", "#galeria", "#videos", "#sets", "#impacto", "#contato", "footer",
  ];
  const out = [];
  for (const s of sel) {
    const el = document.querySelector(s);
    if (!el) { out.push({ section: s, missing: true }); continue; }
    const top = el.getBoundingClientRect().top + scrollY;
    const h = el.offsetHeight;
    const from = Math.max(0, top - innerHeight);
    const to = top + h;
    window.scrollTo(0, from);
    await new Promise((r) => setTimeout(r, 400));
    const ltBefore = window.__lt.length;
    const frames = [];
    let last = performance.now(), run = true;
    const tick = (t) => { frames.push(t - last); last = t; if (run) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    const dur = Math.max(1500, (to - from) * 1.0);
    const start = performance.now();
    await new Promise((res) => {
      const step = () => {
        const p = Math.min(1, (performance.now() - start) / dur);
        window.scrollTo(0, from + (to - from) * p);
        if (p < 1) setTimeout(step, 16); else res();
      };
      step();
    });
    run = false;
    const avg = frames.reduce((a, b) => a + b, 0) / frames.length;
    const lts = window.__lt.slice(ltBefore);
    out.push({
      section: s,
      height: h,
      fps: Math.round(1000 / avg),
      jank: frames.filter((f) => f > 50).length,
      longTasks: lts.length,
      worstMs: Math.round(Math.max(0, ...lts)),
      sumLongMs: Math.round(lts.reduce((a, b) => a + b, 0)),
    });
  }
  return out;
});

console.log(desktop ? `desktop CPU ${cpu}x` : `celular 360 CPU ${cpu}x`);
console.table(rows);

// Contagem de elementos potencialmente caros
const cost = await page.evaluate(() => {
  const all = [...document.querySelectorAll("*")];
  const cs = all.map((e) => [e, getComputedStyle(e)]);
  const count = (f) => cs.filter(([, s]) => f(s)).length;
  return {
    elements: all.length,
    canvases: document.querySelectorAll("canvas").length,
    videos: document.querySelectorAll("video").length,
    backdropFilter: count((s) => s.backdropFilter && s.backdropFilter !== "none"),
    blendModes: count((s) => s.mixBlendMode && s.mixBlendMode !== "normal"),
    filters: count((s) => s.filter && s.filter !== "none"),
    infiniteAnimations: count((s) => s.animationIterationCount === "infinite" && s.animationName !== "none"),
    willChange: count((s) => s.willChange && s.willChange !== "auto"),
    fixed: count((s) => s.position === "fixed"),
    sticky: count((s) => s.position === "sticky"),
  };
});
console.log(cost);
await browser.close();
