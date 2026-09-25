// Audit of #eventos, #tipos-de-evento, #galeria per perf tier.
// node probe-events.mjs --tier lite|balanced|full [--desktop] [--width W]
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const get = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : d;
};
const tier = get("tier", "lite");
const desktop = args.includes("--desktop");
const width = Number(get("width", desktop ? "1440" : "360"));
const base = get("base", "http://localhost:3000/");

const browser = await chromium.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
});
const context = await browser.newContext(
  desktop
    ? { viewport: { width, height: 900 } }
    : { viewport: { width, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
);
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") errors.push(`${m.type()}: ${m.text().slice(0, 300)}`);
});
const requests = [];
page.on("request", (r) => requests.push(r.url()));

await page.goto(`${base}?perf=${tier}`, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2500);

const out = {};
for (const id of ["#eventos", "#tipos-de-evento", "#galeria"]) {
  await page.locator(id).scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  out[id] = await page.evaluate((sel) => {
    const root = document.querySelector(sel);
    const all = [root, ...root.querySelectorAll("*")];
    const r = {
      dataPerf: document.documentElement.dataset.perf,
      elements: all.length,
      backdrop: [],
      blend: [],
      filter: [],
      willChange: [],
      fixed: [],
      infinite: [],
      runningAnimations: [],
      bigShadows: 0,
      opacity0: [],
      images: [],
      overflowX: document.documentElement.scrollWidth > innerWidth,
    };
    const label = (e) =>
      `${e.tagName.toLowerCase()}.${String(e.className?.baseVal ?? e.className ?? "").split(" ").slice(0, 3).join(".")}`;
    for (const e of all) {
      for (const pseudo of [null, "::before", "::after"]) {
        const s = getComputedStyle(e, pseudo);
        if (pseudo && (s.content === "none" || s.content === "normal" || s.display === "none")) continue;
        if (s.display === "none") continue;
        const tag = label(e) + (pseudo ?? "");
        if (s.backdropFilter && s.backdropFilter !== "none") r.backdrop.push(tag);
        if (s.mixBlendMode && s.mixBlendMode !== "normal") r.blend.push(`${tag} ${s.mixBlendMode}`);
        if (s.filter && s.filter !== "none") r.filter.push(`${tag} ${s.filter}`);
        if (s.willChange && s.willChange !== "auto") r.willChange.push(tag);
        if (s.position === "fixed") r.fixed.push(tag);
        if (s.animationName !== "none" && s.animationIterationCount === "infinite")
          r.infinite.push(`${tag} ${s.animationName} ${s.animationPlayState}`);
      }
    }
    for (const a of root.getAnimations({ subtree: true })) {
      r.runningAnimations.push(
        `${a.animationName ?? a.constructor.name} ${a.playState} ${a.effect?.target ? label(a.effect.target) : ""} ${a.effect?.pseudoElement ?? ""} tl=${a.timeline?.constructor?.name}`,
      );
    }
    for (const img of root.querySelectorAll("img")) {
      r.images.push({
        loading: img.loading,
        sizes: img.sizes.slice(0, 60),
        current: decodeURIComponent(img.currentSrc).replace(/.*url=/, "").slice(0, 90),
        rendered: `${Math.round(img.getBoundingClientRect().width)}x${Math.round(img.getBoundingClientRect().height)}`,
        natural: `${img.naturalWidth}x${img.naturalHeight}`,
      });
    }
    return r;
  }, id);
}

// Section-level: all animations in the document, grouped by source
const docAnimations = await page.evaluate(() =>
  document.getAnimations().filter((a) => a.playState === "running").length,
);
console.log(JSON.stringify({ tier, desktop, width, docAnimations, sections: out }, null, 1));
console.log("REQUESTS lightbox chunk:", requests.filter((u) => /Lightbox|lightbox/i.test(u)).length);
if (errors.length) console.log("BROWSER MSGS:\n" + errors.join("\n"));
await browser.close();
