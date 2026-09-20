#!/usr/bin/env node
/**
 * Paradise Floor sky — equirectangular bake from the official still.
 *
 * Projects the still into a *horizon + sky* band on the sphere (not a tall
 * vertical wall). Foreground foliage of the painting is cropped so looking
 * around immerses without a billboard-beside-HQ read.
 *
 *   node scripts/make-paradise-sky.mjs
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
  let uu = u % 1;
  if (uu < 0) uu += 1;
  const vv = Math.min(1, Math.max(0, v));
  const x = uu * (sw - 1);
  const y = vv * (sh - 1);
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const x1 = (x0 + 1) % sw;
  const a = pix(x0, y0);
  const b = pix(x1, y0);
  const c = pix(x0, y0 + 1);
  const d = pix(x1, y0 + 1);
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

const ZENITH = [160, 185, 215];
const GOLD = [255, 214, 155];
const TEAL = [110, 175, 168];
const TEAL_DEEP = [68, 132, 128];
const FOREST = [30, 68, 46];

// Still crop: keep moon / floating islands / distant valleys; drop foreground trunks/flowers
const STILL_V0 = 0.0;
const STILL_V1 = 0.58;
// Where that crop lands on the equirect (horizon-centric, not full wall)
const DOME_V0 = 0.18; // sky content starts
const DOME_V1 = 0.52; // mist takes over below — avoids tall wall beside HQ

const skySample = sample(0.55, 0.08);
const mistSample = sample(0.5, 0.55);

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const u = x / W;
    const v = y / H;

    let col;

    if (v < DOME_V0) {
      col = lerp3(skySample, ZENITH, smoothstep(DOME_V0, 0, v));
      col = lerp3(col, GOLD, smoothstep(0.18, 0, v) * 0.3);
    } else if (v <= DOME_V1) {
      const t = (v - DOME_V0) / (DOME_V1 - DOME_V0);
      const sv = STILL_V0 + t * (STILL_V1 - STILL_V0);
      const photo = sample(u, sv);
      // Crossfade edges of band into atmosphere so it never reads as a hard plate
      const edge = smoothstep(DOME_V0, DOME_V0 + 0.08, v) * (1 - smoothstep(DOME_V1 - 0.1, DOME_V1, v));
      const atmos = lerp3(skySample, mistSample, t);
      col = lerp3(atmos, photo, 0.4 + 0.6 * edge);
      // Extra teal toward bottom of band (depth)
      col = lerp3(col, TEAL, smoothstep(0.45, 0.95, t) * 0.35);
    } else {
      // Lower hemisphere: misty teal ring → forest nadir (no tall painting wall)
      const t = (v - DOME_V1) / (1 - DOME_V1);
      col = lerp3(mistSample, TEAL, smoothstep(0, 0.45, t));
      col = lerp3(col, TEAL_DEEP, smoothstep(0.35, 0.85, t));
      col = lerp3(col, FOREST, smoothstep(0.7, 1, t) * 0.55);
    }

    // Soft U wrap seam
    const seam = Math.min(u, 1 - u);
    if (seam < 0.05) {
      const other = sample(u + 0.5, clamp01(STILL_V0 + ((v - DOME_V0) / (DOME_V1 - DOME_V0)) * (STILL_V1 - STILL_V0)));
      col = lerp3(col, other, ((0.05 - seam) / 0.05) * 0.25);
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

console.log("wrote horizon-band equirect", dest);
