import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const still = resolve(
  "C:/Users/44748/.cursor/projects/c-Users-44748-Downloads-Dinoverse/assets/c__Users_44748_AppData_Roaming_Cursor_User_workspaceStorage_489dbcb3e1075c5d3acf480b16f30bab_images_image-1f321b9f-21e6-4c96-8c51-d42350ae6e08.jpg",
);
const dest = resolve("public/visions/skull-gate-canyon.jpg");
const refCopy = resolve("public/visions/skull-gate-canyon-ref.jpg");

const src = sharp(still);
const { data, info } = await src.removeAlpha().raw().toBuffer({ resolveWithObject: true });
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

const ZENITH = [120, 176, 220];
const HAZE_BLUE = [168, 200, 226];
const GOLD = [244, 214, 150];
const HORIZON_GOLD = [232, 176, 108];
const FOG = [226, 184, 106];
const RIDGE = [92, 48, 28];

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const u = x / W;
    const v = y / H;
    const sunU = 0.12;
    const sunV = 0.56;
    const wrap = Math.min(Math.abs(u - sunU), 1 - Math.abs(u - sunU));
    const dv = (v - sunV) * 1.7;
    const d = Math.sqrt(wrap * wrap + dv * dv);

    const elev = 1 - v;
    const towardSun = 1 - Math.min(1, wrap * 3.4);

    let col = lerp3(HAZE_BLUE, ZENITH, smoothstep(0.22, 0.9, elev));
    col = lerp3(col, GOLD, smoothstep(0.44, 0.6, v) * towardSun);
    col = lerp3(col, HORIZON_GOLD, smoothstep(0.52, 0.62, v) * (0.25 + 0.75 * towardSun));

    const photoV = clamp01(v * 0.28 + 0.02);
    const photoU = clamp01(0.04 + towardSun * 0.18 + (1 - towardSun) * 0.32);
    const photo = sample(photoU, photoV);
    const photoW = smoothstep(0.35, 0.75, elev) * (0.35 + 0.25 * towardSun);
    col = lerp3(col, photo, photoW * 0.55);

    const bloom = Math.exp(-d * d * 38);
    const core = Math.exp(-d * d * 240);
    col = [
      col[0] + 160 * bloom + 70 * core,
      col[1] + 120 * bloom + 55 * core,
      col[2] + 40 * bloom + 20 * core,
    ];

    const cloud =
      Math.max(0, Math.sin(u * 19 + v * 6) * Math.sin(u * 7.1 + 1.2) * (1 - Math.abs(v - 0.36) * 3.4));
    if (cloud > 0.22) {
      col[0] += 42 * cloud;
      col[1] += 16 * cloud;
      col[2] -= 14 * cloud;
    }

    const haze = smoothstep(0.62, 0.86, v);
    col = lerp3(col, FOG, haze * 0.88);

    const ridgeBand = v > 0.54 && v < 0.74 ? 1 : 0;
    const ridgeWave = Math.max(0, Math.sin((u + 0.18) * Math.PI * 5.5) * 0.55 + 0.18);
    const leftRidge = u < 0.22 || u > 0.92 ? smoothstep(0.5, 0.62, v) * (1 - smoothstep(0.7, 0.8, v)) : 0;
    const ridgeAmt = ridgeBand * ridgeWave * 0.55 + leftRidge * 0.85;
    col = lerp3(col, RIDGE, clamp01(ridgeAmt));

    const i = (y * W + x) * 3;
    buf[i] = Math.min(255, Math.max(0, col[0]));
    buf[i + 1] = Math.min(255, Math.max(0, col[1]));
    buf[i + 2] = Math.min(255, Math.max(0, col[2]));
  }
}

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(still, refCopy);
await sharp(buf, { raw: { width: W, height: H, channels: 3 } })
  .jpeg({ quality: 90 })
  .toFile(dest);
console.log("wrote", dest, "and", refCopy);
