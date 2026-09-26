import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const url = process.argv[2] || "http://127.0.0.1:8080/worlds?district=forum";
const out = process.argv[3] || "/workspace/screenshots/floor-exterior-after.png";
mkdirSync("/workspace/screenshots", { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.addInitScript(() => {
  try {
    localStorage.setItem("dinoverse-quality", "high");
  } catch {}
});
await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
await page.waitForSelector("canvas", { timeout: 60000 });
await page.waitForTimeout(5500);
await page.screenshot({ path: out, fullPage: false });
console.log(JSON.stringify({ url, out, title: await page.title() }));
await browser.close();
