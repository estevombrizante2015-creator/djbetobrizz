/**
 * Medição de performance simulando aparelhos simples (usa o Edge instalado via playwright-core).
 *
 *   node scripts/perf-check.mjs                       # http://localhost:3107, perfil "celular simples"
 *   node scripts/perf-check.mjs --url http://localhost:3000 --cpu 4 --desktop
 *
 * Mede: JS/CSS/imagens transferidos, LCP, tempo de tarefas longas (TBT aprox.) no carregamento,
 * FPS durante a rolagem da página inteira e tarefas longas durante a rolagem.
 * Rode contra o build de produção (`npm run build && npx next start -p 3107`).
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
const cdp = await context.newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
await cdp.send("Network.enable");
await cdp.send("Network.emulateNetworkConditions", {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
});

const bytes = { script: 0, stylesheet: 0, image: 0, font: 0, media: 0, other: 0 };
const sizes = new Map();
cdp.on("Network.responseReceived", (e) => sizes.set(e.requestId, e.type));
cdp.on("Network.loadingFinished", (e) => {
  const t = (sizes.get(e.requestId) ?? "Other").toLowerCase();
  const key = t in bytes ? t : t === "fetch" || t === "xhr" ? "other" : t === "document" ? "other" : t in bytes ? t : "other";
  bytes[key] = (bytes[key] ?? 0) + e.encodedDataLength;
});

await page.addInitScript(() => {
  window.__perf = { longTasks: [], lcp: 0 };
  new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__perf.longTasks.push([e.startTime, e.duration]))).observe({
    type: "longtask",
    buffered: true,
  });
  new PerformanceObserver((l) => {
    const e = l.getEntries().at(-1);
    if (e) window.__perf.lcp = e.startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });
});

const t0 = Date.now();
await page.goto(url, { waitUntil: "load", timeout: 120000 });
const loadMs = Date.now() - t0;
await page.waitForTimeout(5000);

const loadStats = await page.evaluate(() => {
  const tasks = window.__perf.longTasks;
  const tbt = tasks.reduce((s, [, d]) => s + Math.max(0, d - 50), 0);
  return { lcp: Math.round(window.__perf.lcp), longTasks: tasks.length, tbt: Math.round(tbt) };
});

// Rolagem contínua da página inteira medindo FPS
const scroll = await page.evaluate(async () => {
  const before = window.__perf.longTasks.length;
  const total = document.documentElement.scrollHeight - innerHeight;
  const frames = [];
  let last = performance.now();
  let running = true;
  const tick = (t) => {
    frames.push(t - last);
    last = t;
    if (running) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  const duration = Math.max(8000, total * 1.2); // ~0,8 px/ms
  const start = performance.now();
  await new Promise((resolve) => {
    const step = () => {
      const p = Math.min(1, (performance.now() - start) / duration);
      window.scrollTo(0, total * p);
      if (p < 1) setTimeout(step, 16);
      else resolve();
    };
    step();
  });
  running = false;
  const sorted = [...frames].sort((a, b) => a - b);
  const avg = frames.reduce((a, b) => a + b, 0) / frames.length;
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const jank = frames.filter((f) => f > 50).length;
  const newTasks = window.__perf.longTasks.slice(before);
  return {
    pageHeight: Math.round(total + innerHeight),
    fps: Math.round(1000 / avg),
    p95FrameMs: Math.round(p95),
    framesOver50ms: jank,
    frames: frames.length,
    longTasksDuringScroll: newTasks.length,
    longestTaskMs: Math.round(Math.max(0, ...newTasks.map(([, d]) => d))),
  };
});

const kb = (n) => `${Math.round(n / 1024)} KB`;
console.log(
  JSON.stringify(
    {
      profile: desktop ? `desktop, CPU ${cpu}x` : `celular 360px, CPU ${cpu}x, 4G lento`,
      loadEventMs: loadMs,
      ...loadStats,
      transfer: Object.fromEntries(Object.entries(bytes).map(([k, v]) => [k, kb(v)])),
      scroll,
    },
    null,
    2,
  ),
);
await browser.close();
