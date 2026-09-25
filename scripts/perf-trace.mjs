/**
 * Trace do Chromium durante a rolagem da página (aparelho simples simulado) e resumo
 * do tempo de main thread por categoria: script, estilo, layout, pintura, composição.
 *
 *   node scripts/perf-trace.mjs [--url http://localhost:3107] [--cpu 6] [--desktop] [--from "#eventos"] [--to "#videos"]
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
const fromSel = get("from", null);
const toSel = get("to", null);

const browser = await chromium.launch({
  executablePath: process.env.BROWSER_PATH ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
});
const context = await browser.newContext(
  desktop
    ? { viewport: { width: 1366, height: 768 } }
    : { viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
);
const page = await context.newPage();
await page.goto(url, { waitUntil: "load" });
await page.waitForTimeout(3000);
const cdp = await context.newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });

const events = [];
cdp.on("Tracing.dataCollected", (e) => events.push(...e.value));
const done = new Promise((r) => cdp.once("Tracing.tracingComplete", r));
await cdp.send("Tracing.start", {
  categories: "devtools.timeline,disabled-by-default-devtools.timeline,v8.execute,blink.user_timing",
  transferMode: "ReportEvents",
});

await page.evaluate(
  async ([fromSel, toSel]) => {
    const pos = (s, fallback) => {
      const el = s && document.querySelector(s);
      return el ? el.getBoundingClientRect().top + scrollY : fallback;
    };
    const from = pos(fromSel, 0);
    const to = pos(toSel, document.documentElement.scrollHeight - innerHeight);
    window.scrollTo(0, from);
    await new Promise((r) => setTimeout(r, 300));
    const dur = Math.max(4000, Math.abs(to - from) * 0.8);
    const start = performance.now();
    await new Promise((res) => {
      const step = () => {
        const p = Math.min(1, (performance.now() - start) / dur);
        window.scrollTo(0, from + (to - from) * p);
        if (p < 1) setTimeout(step, 16);
        else res();
      };
      step();
    });
  },
  [fromSel, toSel],
);

await cdp.send("Tracing.end");
await done;

// Agrega duração (ms) na main thread do renderer
const mainTids = new Map();
for (const e of events) {
  if (e.name === "thread_name" && e.args?.name === "CrRendererMain") mainTids.set(`${e.pid}:${e.tid}`, true);
}
const cats = {
  FunctionCall: "script",
  EvaluateScript: "script",
  TimerFire: "script",
  FireAnimationFrame: "script (rAF)",
  EventDispatch: "script (eventos)",
  RunMicrotasks: "script",
  UpdateLayoutTree: "estilo (recalc)",
  Layout: "layout",
  "PrePaint": "pré-pintura",
  Paint: "pintura",
  PaintImage: "pintura",
  "Layerize": "composição",
  UpdateLayer: "composição",
  UpdateLayerTree: "composição",
  CompositeLayers: "composição",
  "Commit": "composição",
  ScrollLayer: "composição",
  "HitTest": "hit test",
  IntersectionObserverController: "IntersectionObserver",
  "ParseAuthorStyleSheet": "estilo (parse)",
};
const totals = {};
const top = {};
for (const e of events) {
  if (e.ph !== "X" || !mainTids.has(`${e.pid}:${e.tid}`)) continue;
  const c = cats[e.name];
  if (!c) continue;
  const ms = (e.dur ?? 0) / 1000;
  totals[c] = (totals[c] ?? 0) + ms;
  if (e.name === "FunctionCall" || e.name === "FireAnimationFrame" || e.name === "EventDispatch") {
    const k = `${e.name} ${e.args?.data?.url?.split("/").pop() ?? ""}:${e.args?.data?.functionName ?? e.args?.data?.type ?? ""}`;
    top[k] = (top[k] ?? 0) + ms;
  }
}
const round = (o) => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, Math.round(v)]));
console.log(desktop ? `desktop CPU ${cpu}x` : `celular 360 CPU ${cpu}x`, fromSel ?? "topo", "→", toSel ?? "fim");
console.log("ms por categoria (main thread):", round(totals));
console.log("maiores chamadas de script:", Object.entries(round(top)).slice(0, 15));
await browser.close();
