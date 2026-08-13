import { chromium } from "playwright";

const base = process.argv[2] || "http://127.0.0.1:8080";

const browser = await chromium.launch({ args: ["--no-sandbox"] });

async function shot(page, name) {
  await page.screenshot({ path: `/workspace/screenshots/${name}`, fullPage: false });
}

const errors = [];
function attach(page) {
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
}

const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 } });
attach(desktop);
await desktop.goto(base + "/", { waitUntil: "networkidle" });
await desktop.waitForTimeout(400);
await shot(desktop, "qa-home.png");

await desktop.goto(base + "/crew", { waitUntil: "networkidle" });
await desktop.waitForTimeout(300);
await desktop.getByRole("button", { name: /Rex Volt/i }).click();
await desktop.waitForTimeout(200);
await shot(desktop, "qa-crew-rex.png");

await desktop.goto(base + "/worlds?district=mart", { waitUntil: "networkidle" });
await desktop.waitForTimeout(300);
await shot(desktop, "qa-worlds-rex.png");
await desktop.getByRole("tab", { name: "Launch Crater" }).click();
await desktop.waitForTimeout(250);
await shot(desktop, "qa-worlds-crater.png");

await desktop.goto(base + "/explore?district=mart", { waitUntil: "networkidle" });
await desktop.waitForTimeout(800);
await shot(desktop, "qa-explore-start.png");
const enter = desktop.getByRole("button", { name: "Enter" });
if (await enter.isVisible()) await enter.click();
await desktop.waitForTimeout(400);
await shot(desktop, "qa-explore-play.png");

// Controls: A should decrease x
const before = await desktop.evaluate(() => window.__controlsTest?.getX?.() ?? null);
await desktop.evaluate(() => window.__controlsTest?.setKeys?.(["KeyA"]));
await desktop.waitForTimeout(500);
const afterA = await desktop.evaluate(() => window.__controlsTest?.getX?.() ?? null);
await desktop.evaluate(() => window.__controlsTest?.setKeys?.([]));
await desktop.evaluate(() => window.__controlsTest?.setKeys?.(["KeyD"]));
await desktop.waitForTimeout(500);
const afterD = await desktop.evaluate(() => window.__controlsTest?.getX?.() ?? null);
await desktop.evaluate(() => window.__controlsTest?.setKeys?.([]));
await desktop.keyboard.press("KeyE");
await desktop.waitForTimeout(300);
await shot(desktop, "qa-explore-interact.png");

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
attach(mobile);
await mobile.goto(base + "/", { waitUntil: "networkidle" });
await mobile.waitForTimeout(400);
const overflow = await mobile.evaluate(() => {
  const doc = document.documentElement;
  return { sw: doc.scrollWidth, cw: doc.clientWidth };
});
await shot(mobile, "qa-mobile-home.png");
await mobile.goto(base + "/worlds", { waitUntil: "networkidle" });
await mobile.waitForTimeout(300);
await shot(mobile, "qa-mobile-worlds.png");
await mobile.goto(base + "/explore?district=mart", { waitUntil: "networkidle" });
await mobile.waitForTimeout(600);
const mEnter = mobile.getByRole("button", { name: "Enter" });
if (await mEnter.isVisible()) await mEnter.click();
await mobile.waitForTimeout(400);
await shot(mobile, "qa-mobile-explore.png");

console.log(
  JSON.stringify(
    {
      errors,
      controls: { before, afterA, afterD, aDecreasedX: afterA != null && before != null && afterA < before, dIncreasedX: afterD != null && afterA != null && afterD > afterA },
      mobileOverflow: overflow,
    },
    null,
    2,
  ),
);

await browser.close();
