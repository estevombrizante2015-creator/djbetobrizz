/**
 * Abre o site e lista erros/avisos do console (hidratação, runtime, etc.).
 *   node scripts/console-check.mjs [--url http://localhost:3000] [--mobile]
 */
import { chromium } from "playwright-core";
const args = process.argv.slice(2);
const i = args.indexOf("--url");
const url = i >= 0 ? args[i + 1] : "http://localhost:3000";
const mobile = args.includes("--mobile");
const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" });
const ctx = await browser.newContext(mobile ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const out = [];
page.on("console", (m) => { if (["error", "warning"].includes(m.type())) out.push(`${m.type()}: ${m.text().split("\n")[0].slice(0, 220)}`); });
page.on("pageerror", (e) => out.push(`pageerror: ${e.message.split("\n")[0]}`));
await page.goto(url, { waitUntil: "networkidle" });
for (let y = 0; y < 30000; y += 700) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(120); }
await page.waitForTimeout(1500);
console.log(`${url} ${mobile ? "mobile" : "desktop"} tier=${await page.evaluate(() => document.documentElement.dataset.perf)}`);
console.log(out.length ? out.join("\n") : "console limpo");
await browser.close();
