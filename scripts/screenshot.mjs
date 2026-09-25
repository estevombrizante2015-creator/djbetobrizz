/**
 * Screenshot headless do site (usa o Microsoft Edge instalado, via playwright-core).
 *
 * Exemplos:
 *   node scripts/screenshot.mjs --out shot.png                         # hero, desktop 1440x900
 *   node scripts/screenshot.mjs --selector "#eventos" --out ev.png     # uma seção
 *   node scripts/screenshot.mjs --mobile --selector "#sobre" --out m.png
 *   node scripts/screenshot.mjs --full --out page.png                  # página inteira
 *   node scripts/screenshot.mjs --reduced-motion --out rm.png
 *   node scripts/screenshot.mjs --click "button[aria-label='Abrir menu']" --out menu.png
 *
 * Requer o servidor rodando (padrão http://localhost:3000).
 */
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const get = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : fallback;
};
const has = (name) => args.includes(`--${name}`);

const url = get("url", "http://localhost:3000");
const out = get("out", "screenshot.png");
const selector = get("selector", null);
const click = get("click", null);
const mobile = has("mobile");
const wait = Number(get("wait", "2600"));
const width = Number(get("width", mobile ? "390" : "1440"));
const height = Number(get("height", mobile ? "844" : "900"));

const executablePath =
  process.env.BROWSER_PATH ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

const browser = await chromium.launch({ executablePath, headless: true });
const context = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 1,
  isMobile: mobile,
  hasTouch: mobile,
  reducedMotion: has("reduced-motion") ? "reduce" : "no-preference",
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text()}`);
});

await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(wait);

if (click) {
  await page.click(click);
  await page.waitForTimeout(900);
}

if (has("full")) {
  // rola a página inteira para disparar as animações whileInView
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += Math.floor(height * 0.6)) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(250);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.screenshot({ path: out, fullPage: true });
} else if (selector) {
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1400);
  await el.screenshot({ path: out });
} else {
  await page.screenshot({ path: out });
}

console.log(`ok ${out}`);
if (errors.length) console.log("ERROS NO NAVEGADOR:\n" + errors.join("\n"));
await browser.close();
