import { mkdirSync } from "node:fs";
import { chromium } from "playwright";
mkdirSync("/workspace/docs/paradise-floor", { recursive: true });
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.setDefaultTimeout(90000);
await page.addInitScript(() => { try { localStorage.setItem("dinoverse-quality", "high"); } catch {} });
await page.goto("http://127.0.0.1:8080/explore", { waitUntil: "domcontentloaded", timeout: 120000 });
await page.waitForTimeout(2000);
await page.getByText("Walk as you", { exact: false }).first().click({ force: true });
await page.waitForTimeout(400);
await page.locator("#enter-3d").click({ force: true });
await page.waitForFunction(() => typeof window.__controlsTest?.setPose === "function", null, { timeout: 180000 });
await page.waitForSelector("canvas", { timeout: 60000 });
await page.waitForTimeout(6000);

// Enable preserveDrawingBuffer for evidence captures
await page.evaluate(() => {
  const c = document.querySelector("canvas");
  // Can't change after create — rely on page screenshots instead
});

const shots = [
  ["fp-look-forward", Math.PI],
  ["fp-look-left", Math.PI / 2],
  ["fp-look-right", -Math.PI / 2],
  ["fp-look-back", 0],
  ["fp-look-up-valley", Math.PI * 0.92],
];

for (const [name, yaw] of shots) {
  await page.evaluate((y) => {
    window.__controlsTest.setPose(0, 26, y, "ground");
  }, yaw);
  await page.waitForTimeout(2500);
  const box = await page.locator("canvas").first().boundingBox();
  const path = `/workspace/docs/paradise-floor/${name}.png`;
  // Full viewport screenshot is more reliable than element shot with WebGL
  await page.screenshot({ path, type: "png", animations: "disabled", timeout: 90000 });
  console.log(name, "ok", box);
}
await browser.close();
