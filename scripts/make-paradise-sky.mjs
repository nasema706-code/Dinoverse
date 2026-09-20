#!/usr/bin/env node
/**
 * Procedural Paradise Floor sky plate (equirect JPEG).
 *
 * Regenerates `public/worlds/forum/paradise-sky.jpg` — a golden-hour + giant
 * pale moon panorama used as an art-direction reference / optional sky-dome
 * source. The live Floor currently drives the sky via drei `<Sky>` + moon mesh
 * in `src/game/floor/env.tsx`; this script is the offline bake path when you
 * want a photo-sphere plate or to retune palette without touching React.
 *
 * Tune constants below (moon size/pos, gold/teal mix, turbidity stand-ins),
 * then: `node scripts/make-paradise-sky.mjs`
 *
 * Optional: drop an official still at
 * `public/worlds/forum/paradise-plate-ref.png` — the script copies it beside
 * the bake for PR evidence; it does not sample it (unlike canyon).
 */
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const dest = resolve("public/worlds/forum/paradise-sky.jpg");

const W = 2048;
const H = 1024;
const buf = Buffer.alloc(W * H * 3);

const ZENITH = [140, 175, 210];
const HAZE = [190, 210, 220];
const GOLD = [255, 214, 150];
const HORIZON_GOLD = [240, 188, 120];
const TEAL_MIST = [126, 184, 176];
const MOON = [243, 234, 212];
const FOREST = [40, 90, 58];
const RIDGE = [55, 70, 48];

function lerp(a, b, t) {
  return a + (b - a) * t;
}
function lerp3(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}
function clamp01(t) {
  return Math.min(1, Math.max(0, t));
}
function smoothstep(e0, e1, x) {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}

const moonU = 0.42;
const moonV = 0.28;
const sunU = 0.78;
const sunV = 0.52;

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const u = x / W;
    const v = y / H;
    const elev = 1 - v;

    let col = lerp3(HAZE, ZENITH, smoothstep(0.18, 0.85, elev));
    const towardSun = 1 - Math.min(1, Math.min(Math.abs(u - sunU), 1 - Math.abs(u - sunU)) * 3.2);
    col = lerp3(col, GOLD, smoothstep(0.4, 0.62, v) * towardSun * 0.85);
    col = lerp3(col, HORIZON_GOLD, smoothstep(0.52, 0.7, v) * (0.3 + 0.7 * towardSun));

    const wrapM = Math.min(Math.abs(u - moonU), 1 - Math.abs(u - moonU));
    const dMoon = Math.sqrt(wrapM * wrapM * 2.2 + (v - moonV) * (v - moonV));
    const moonDisc = Math.exp(-dMoon * dMoon * 90);
    const moonHalo = Math.exp(-dMoon * dMoon * 18);
    col = lerp3(col, MOON, clamp01(moonDisc * 1.4));
    col = [
      col[0] + 40 * moonHalo,
      col[1] + 30 * moonHalo,
      col[2] + 18 * moonHalo,
    ];

    const wrapS = Math.min(Math.abs(u - sunU), 1 - Math.abs(u - sunU));
    const dSun = Math.sqrt(wrapS * wrapS + (v - sunV) * (v - sunV) * 1.6);
    const bloom = Math.exp(-dSun * dSun * 28);
    const core = Math.exp(-dSun * dSun * 180);
    col = [
      col[0] + 150 * bloom + 60 * core,
      col[1] + 110 * bloom + 45 * core,
      col[2] + 40 * bloom + 15 * core,
    ];

    const mist = smoothstep(0.58, 0.92, v);
    col = lerp3(col, TEAL_MIST, mist * 0.72);

    const ridge =
      smoothstep(0.62, 0.78, v) *
      (1 - smoothstep(0.82, 0.95, v)) *
      (0.35 + 0.65 * Math.max(0, Math.sin(u * Math.PI * 6 + 0.4)));
    col = lerp3(col, RIDGE, clamp01(ridge * 0.55));
    const forestBand =
      smoothstep(0.7, 0.84, v) * (1 - smoothstep(0.88, 0.98, v)) * (0.4 + 0.6 * Math.abs(Math.sin(u * 14)));
    col = lerp3(col, FOREST, clamp01(forestBand * 0.65));

    const i = (y * W + x) * 3;
    buf[i] = Math.min(255, Math.max(0, col[0]));
    buf[i + 1] = Math.min(255, Math.max(0, col[1]));
    buf[i + 2] = Math.min(255, Math.max(0, col[2]));
  }
}

mkdirSync(dirname(dest), { recursive: true });
await sharp(buf, { raw: { width: W, height: H, channels: 3 } })
  .jpeg({ quality: 90 })
  .toFile(dest);

console.log("wrote", dest);
