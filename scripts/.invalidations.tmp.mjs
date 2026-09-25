// Temporary: which nodes get style/paint invalidated while scrolling a range.
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const get = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : d;
};
const tier = get("tier", "balanced");
const fromSel = get("from", "#eventos");
const toSel = get("to", "#videos");
const desktop = args.includes("--desktop");

const browser = await chromium.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
});
const context = await browser.newContext(
  desktop
    ? { viewport: { width: 1366, height: 768 } }
    : { viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
);
const page = await context.newPage();
await page.goto(`http://localhost:3000/?perf=${tier}`, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2000);
const cdp = await context.newCDPSession(page);
const events = [];
cdp.on("Tracing.dataCollected", (e) => events.push(...e.value));
const done = new Promise((res) => cdp.once("Tracing.tracingComplete", res));
await cdp.send("Tracing.start", {
  categories:
    "devtools.timeline,disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.invalidationTracking",
  transferMode: "ReportEvents",
});
await page.evaluate(
  async ([a, b]) => {
    const top = (s) => document.querySelector(s).getBoundingClientRect().top + scrollY;
    const from = top(a) - innerHeight;
    const to = top(b);
    const dur = 4000;
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

const counts = {};
const recalcs = [];
for (const e of events) {
  if (e.name === "StyleRecalcInvalidationTracking" || e.name === "StyleInvalidatorInvalidationTracking" || e.name === "PaintInvalidationTracking" || e.name === "ScheduleStyleInvalidationTracking") {
    const d = e.args?.data ?? {};
    const k = `${e.name.replace("InvalidationTracking", "")} | ${d.nodeName ?? "?"} | ${d.reason ?? d.invalidationSet?.[0]?.classes ?? d.changedClass ?? d.changedAttribute ?? d.changedPseudo ?? ""}`;
    counts[k] = (counts[k] ?? 0) + 1;
  }
  if (e.name === "UpdateLayoutTree" && e.ph === "X") recalcs.push(e.args?.elementCount ?? 0);
}
const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 40);
console.log(`${tier} ${fromSel}→${toSel}: UpdateLayoutTree events ${recalcs.length}, elements total ${recalcs.reduce((a, b) => a + b, 0)}`);
for (const [k, v] of top) console.log(String(v).padStart(5), k.slice(0, 200));
await browser.close();
