import type { Collider } from "../districts3d";

export const L2_HEIGHT = 6;

export const SPIRAL = {
  cx: -12.2,
  cz: 2.6,
  r0: 2.48,
  r1: 4.28,
  turns: 0.88,
  start: 1.62,
};

export const MEZZ = {
  holeMinX: -7.15,
  holeMaxX: 7.15,
  holeMinZ: -6.4,
  holeMaxZ: 8.6,
  deckMinX: -17.5,
  deckMaxX: 17.5,
  deckMinZ: -8.8,
  deckMaxZ: 14.4,
};

export function spiralTotalAngle() {
  return SPIRAL.turns * Math.PI * 2;
}

export function spiralPoint(t: number) {
  const ang = SPIRAL.start + t * spiralTotalAngle();
  const r = (SPIRAL.r0 + SPIRAL.r1) / 2;
  return {
    x: SPIRAL.cx + Math.sin(ang) * r,
    z: SPIRAL.cz + Math.cos(ang) * r,
    y: t * L2_HEIGHT,
    ang,
  };
}

function onSpiral(x: number, z: number) {
  const dx = x - SPIRAL.cx;
  const dz = z - SPIRAL.cz;
  const r = Math.hypot(dx, dz);
  if (r < SPIRAL.r0 - 0.16 || r > SPIRAL.r1 + 0.16) return -1;
  let tAng = Math.atan2(dx, dz) - SPIRAL.start;
  while (tAng < 0) tAng += Math.PI * 2;
  const total = spiralTotalAngle();
  if (tAng > total + 0.18) return -1;
  return Math.min(1, tAng / total);
}

function inSpiralWell(x: number, z: number) {
  return Math.hypot(x - SPIRAL.cx, z - SPIRAL.cz) < SPIRAL.r1 + 0.22;
}

export function nearStairLanding(x: number, z: number) {
  const top = spiralPoint(1);
  return Math.hypot(x - top.x, z - top.z) < 1.85;
}

export function onMezzanine(x: number, z: number) {
  if (x < MEZZ.deckMinX || x > MEZZ.deckMaxX || z < MEZZ.deckMinZ || z > MEZZ.deckMaxZ) {
    return false;
  }
  if (x > MEZZ.holeMinX && x < MEZZ.holeMaxX && z > MEZZ.holeMinZ && z < MEZZ.holeMaxZ) {
    return false;
  }
  if (inSpiralWell(x, z) && !nearStairLanding(x, z)) return false;
  return true;
}

export function floorHeightAt(x: number, z: number, prevY = 0) {
  const st = onSpiral(x, z);
  if (st >= 0 && st < 0.97) return st * L2_HEIGHT;
  if (prevY > 2.7 && onMezzanine(x, z)) return L2_HEIGHT;
  if (st >= 0) return st * L2_HEIGHT;
  return 0;
}

function wellRails(): Collider[] {
  const land = spiralPoint(1);
  const out: Collider[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x = SPIRAL.cx + Math.sin(a) * (SPIRAL.r1 + 0.14);
    const z = SPIRAL.cz + Math.cos(a) * (SPIRAL.r1 + 0.14);
    if (Math.hypot(x - land.x, z - land.z) < 1.75) continue;
    out.push({ x, z, w: 0.72, d: 0.72, minY: 5.15, maxY: 8.4 });
  }
  return out;
}

export const MEZZ_COLLIDERS: Collider[] = [
  { x: SPIRAL.cx, z: SPIRAL.cz, w: 3.7, d: 3.7 },
  { x: 0, z: MEZZ.holeMaxZ, w: 14.4, d: 0.22, minY: 5.15, maxY: 8.4 },
  { x: 0, z: MEZZ.holeMinZ, w: 14.4, d: 0.22, minY: 5.15, maxY: 8.4 },
  { x: MEZZ.holeMinX, z: 1.1, w: 0.22, d: 15.1, minY: 5.15, maxY: 8.4 },
  { x: MEZZ.holeMaxX, z: 1.1, w: 0.22, d: 15.1, minY: 5.15, maxY: 8.4 },
  ...wellRails(),
];
