#!/usr/bin/env node
/**
 * Paradise Floor sky plate (equirect JPEG) from the official Earth-Like Worlds still.
 *
 * Source: `public/worlds/forum/paradise-plate-ref.jpg`
 * Output: `public/worlds/forum/paradise-sky.jpg` (loaded by VisionSkyDome on mid/high)
 *
 * Rebuild after replacing the ref:
 *   node scripts/make-paradise-sky.mjs
 *
 * Mapping: cylindrical wrap of the still across the horizon band, with soft
 * zenith fill and nadir mist so the inward sky sphere does not seam hard.
 */
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const stillPath = resolve("public/worlds/forum/paradise-plate-ref.jpg");
const dest = resolve("public/worlds/forum/paradise-sky.jpg");

if (!existsSync(stillPath)) {
  console.error("Missing official still:", stillPath);
  process.exit(1);
}

const { data, info } = await sharp(stillPath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const sw = info.width;
const sh = info.height;
const ch = info.channels;

function pix(ix, iy) {
  const x = Math.min(sw - 1, Math.max(0, ix | 0));
  const y = Math.min(sh - 1, Math.max(0, iy | 0));
  const i = (y * sw + x) * ch;
  return [data[i], data[i + 1], data[i + 2]];
}

function sample(u, v) {
  const x = u * (sw - 1);
  const y = v * (sh - 1);
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const a = pix(x0, y0);
  const b = pix(x0 + 1, y0);
  const c = pix(x0, y0 + 1);
  const d = pix(x0 + 1, y0 + 1);
  return [0, 1, 2].map((k) => {
    const top = a[k] + (b[k] - a[k]) * fx;
    const bot = c[k] + (d[k] - c[k]) * fx;
    return top + (bot - top) * fy;
  });
}

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

const W = 2048;
const H = 1024;
const buf = Buffer.alloc(W * H * 3);

/** Soft fills where the still does not cover (zenith / nadir). */
const ZENITH = [168, 188, 210];
const GOLD_HAZE = [242, 210, 150];
const TEAL_MIST = [110, 168, 162];
const FOREST = [36, 78, 52];

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const u = x / W;
    const v = y / H;
    const elev = 1 - v;

    // Cylindrical wrap: still spans full yaw; v maps into the painting's sky→valley.
    // Bias so the giant moon + floating islands sit in the upper hemisphere.
    const photoU = (u + 0.08) % 1;
    const photoV = clamp01(0.02 + v * 0.92);
    const photo = sample(photoU, photoV);

    let col = photo;

    // Zenith: blend toward soft blue so the dome top is not a stretched crop.
    const zenithW = smoothstep(0.72, 0.98, elev);
    col = lerp3(col, ZENITH, zenithW * 0.55);

    // Warm rim near sun side of painting (right half of still).
    const towardGold = smoothstep(0.45, 0.85, photoU) * smoothstep(0.35, 0.7, v);
    col = lerp3(col, GOLD_HAZE, towardGold * 0.18);

    // Valley mist / nadir teal so ground-looking angles stay paradise, not black.
    const nadir = smoothstep(0.72, 0.98, v);
    col = lerp3(col, TEAL_MIST, nadir * 0.55);
    col = lerp3(col, FOREST, nadir * 0.25);

    // Soft seam hide — slight horizontal blur via neighbor sample.
    const seam = Math.min(u, 1 - u);
    if (seam < 0.04) {
      const other = sample((photoU + 0.5) % 1, photoV);
      col = lerp3(col, other, (0.04 - seam) * 4 * 0.2);
    }

    const i = (y * W + x) * 3;
    buf[i] = Math.min(255, Math.max(0, col[0]));
    buf[i + 1] = Math.min(255, Math.max(0, col[1]));
    buf[i + 2] = Math.min(255, Math.max(0, col[2]));
  }
}

mkdirSync(dirname(dest), { recursive: true });
await sharp(buf, { raw: { width: W, height: H, channels: 3 } })
  .jpeg({ quality: 92 })
  .toFile(dest);

console.log("wrote", dest, "from", stillPath);
