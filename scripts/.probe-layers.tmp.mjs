// Temporary: lists compositor layers (and reasons) whose DOM node lives inside my sections.
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const get = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : d;
};
const tier = get("tier", "lite");
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
await page.waitForTimeout(2500);
const cdp = await context.newCDPSession(page);
await cdp.send("DOM.enable");
await cdp.send("LayerTree.enable");

let latest = [];
cdp.on("LayerTree.layerTreeDidChange", (e) => {
  if (e.layers) latest = e.layers;
});

for (const id of ["#eventos", "#tipos-de-evento", "#galeria"]) {
  await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: "start" }), id);
  await page.waitForTimeout(1500);
  // mark nodes inside the section
  await page.evaluate((s) => {
    document.querySelectorAll("[data-probe]").forEach((e) => e.removeAttribute("data-probe"));
    document.querySelector(s).querySelectorAll("*").forEach((e) => e.setAttribute("data-probe", ""));
    document.querySelector(s).setAttribute("data-probe", "");
  }, id);
  await page.evaluate(() => window.scrollBy(0, 1));
  await page.waitForTimeout(800);
  const { root } = await cdp.send("DOM.getDocument", { depth: 0 });
  const { nodeIds } = await cdp.send("DOM.querySelectorAll", { nodeId: root.nodeId, selector: "[data-probe]" });
  const { backendNodeIds } = await cdp
    .send("DOM.describeNode", { nodeId: nodeIds[0] })
    .then(async () => {
      const ids = [];
      for (const n of nodeIds) {
        const d = await cdp.send("DOM.describeNode", { nodeId: n });
        ids.push(d.node.backendNodeId);
      }
      return { backendNodeIds: ids };
    });
  const inside = new Set(backendNodeIds);
  const mine = latest.filter((l) => l.backendNodeId && inside.has(l.backendNodeId) && l.drawsContent !== undefined);
  console.log(`\n${id} [${tier}${desktop ? " desktop" : " phone"}] total layers in page: ${latest.length}, in section: ${mine.length}`);
  for (const l of mine.slice(0, 40)) {
    let reasons = [];
    try {
      const r = await cdp.send("LayerTree.compositingReasons", { layerId: l.layerId });
      reasons = r.compositingReasonIds ?? r.compositingReasons ?? [];
    } catch {}
    const d = await cdp.send("DOM.describeNode", { backendNodeId: l.backendNodeId });
    const cls = (d.node.attributes ?? []).reduce((acc, v, i, a) => (a[i - 1] === "class" ? v : acc), "");
    console.log(
      ` ${d.node.localName}.${cls.split(" ").slice(0, 4).join(".")} ${Math.round(l.width)}x${Math.round(l.height)} draws=${l.drawsContent} :: ${reasons.join(",")}`,
    );
  }
}
await browser.close();
