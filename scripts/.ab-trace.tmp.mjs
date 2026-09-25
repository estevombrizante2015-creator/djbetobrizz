// Temporary A/B trace: main-thread ms per category while scrolling a range, with optional injected CSS.
// node scripts/.ab-trace.tmp.mjs --tier balanced --from "#eventos" --to "#videos" --runs 3 [--css "..."] [--desktop]
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const get = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : d;
};
const tier = get("tier", "balanced");
const cpu = Number(get("cpu", "4"));
const runs = Number(get("runs", "3"));
const css = get("css", "");
const fromSel = get("from", "#eventos");
const toSel = get("to", "#videos");
const desktop = args.includes("--desktop");

const cats = {
  FunctionCall: "script",
  EvaluateScript: "script",
  TimerFire: "script",
  FireAnimationFrame: "script",
  EventDispatch: "script",
  RunMicrotasks: "script",
  UpdateLayoutTree: "style",
  Layout: "layout",
  PrePaint: "prepaint",
  Paint: "paint",
  PaintImage: "paint",
  Layerize: "composite",
  UpdateLayer: "composite",
  UpdateLayerTree: "composite",
  CompositeLayers: "composite",
  Commit: "composite",
};

const browser = await chromium.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
});
const agg = {};
const lts = [];
for (let r = 0; r < runs; r++) {
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
  await page.goto(`http://localhost:3000/?perf=${tier}`, { waitUntil: "networkidle", timeout: 60000 });
  if (css) await page.addStyleTag({ content: css });
  // warm: scroll range once so images decode, then trace the second pass
  await page.evaluate(
    async ([a, b]) => {
      const top = (s) => document.querySelector(s).getBoundingClientRect().top + scrollY;
      for (let y = top(a) - innerHeight; y < top(b); y += 300) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
    },
    [fromSel, toSel],
  );
  await page.waitForTimeout(1500);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
  const events = [];
  cdp.on("Tracing.dataCollected", (e) => events.push(...e.value));
  const done = new Promise((res) => cdp.once("Tracing.tracingComplete", res));
  await cdp.send("Tracing.start", {
    categories: "devtools.timeline,disabled-by-default-devtools.timeline",
    transferMode: "ReportEvents",
  });
  const ltCount = await page.evaluate(
    async ([a, b]) => {
      const top = (s) => document.querySelector(s).getBoundingClientRect().top + scrollY;
      const from = top(a) - innerHeight;
      const to = top(b);
      window.scrollTo(0, from);
      await new Promise((r) => setTimeout(r, 300));
      const before = window.__lt.length;
      const dur = Math.max(4000, (to - from) * 1.0);
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
      return window.__lt.slice(before);
    },
    [fromSel, toSel],
  );
  await cdp.send("Tracing.end");
  await done;
  const main = new Set();
  for (const e of events)
    if (e.name === "thread_name" && e.args?.name === "CrRendererMain") main.add(`${e.pid}:${e.tid}`);
  const tot = {};
  for (const e of events) {
    if (e.ph !== "X" || !main.has(`${e.pid}:${e.tid}`)) continue;
    const c = cats[e.name];
    if (!c) continue;
    tot[c] = (tot[c] ?? 0) + (e.dur ?? 0) / 1000;
  }
  for (const [k, v] of Object.entries(tot)) (agg[k] ??= []).push(Math.round(v));
  lts.push(ltCount.map(Math.round));
  await context.close();
}
const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
console.log(`${tier}${desktop ? " desktop" : " phone"} cpu${cpu} ${fromSel}→${toSel} css=${css ? "yes" : "no"}`);
console.log(Object.fromEntries(Object.entries(agg).map(([k, v]) => [k, `med ${med(v)} [${v.join(",")}]`])));
console.log("long tasks per run:", JSON.stringify(lts));
await browser.close();
