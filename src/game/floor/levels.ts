import type { Collider } from "../districts3d";

export const L2_HEIGHT = 6;

/** Roomy two-abreast tread; turns stay under 1 so XZ never overlaps itself. */
export const SPIRAL = {
  cx: -12.2,
  cz: 2.6,
  r0: 1.58,
  r1: 5.12,
  turns: 0.96,
  start: 1.62,
};

export const MEZZ = {
  /** West edge nudged east so the wider stair well still clears the atrium hole. */
  holeMinX: -6.65,
  holeMaxX: 7.15,
  holeMinZ: -6.4,
  holeMaxZ: 8.6,
  /** Deck pushed west a bit for the larger outer radius. */
  deckMinX: -18.2,
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
  // Generous radial band so the player does not fall off the wider treads.
  if (r < SPIRAL.r0 - 0.32 || r > SPIRAL.r1 + 0.38) return -1;
  let tAng = Math.atan2(dx, dz) - SPIRAL.start;
  while (tAng < 0) tAng += Math.PI * 2;
  const total = spiralTotalAngle();
  if (tAng > total + 0.42) return -1;
  return Math.min(1, tAng / total);
}

/** True when the player is on the spiral climb (for looser step-up checks). */
export function onStairPath(x: number, z: number) {
  return onSpiral(x, z) >= 0;
}

/** 0–1 along the climb, or -1 if off the spiral. */
export function stairProgress(x: number, z: number) {
  return onSpiral(x, z);
}

/** Ground approach pad at the foot of the spiral. */
export function nearStairBottom(x: number, z: number) {
  const foot = spiralPoint(0);
  return Math.hypot(x - foot.x, z - foot.z) < 2.9 && Math.hypot(x - SPIRAL.cx, z - SPIRAL.cz) < SPIRAL.r1 + 0.9;
}

/** Guide copy for HUD / prompts. */
export function stairGuideAt(x: number, z: number, groundY: number): {
  progress: number;
  title: string;
  hint: string;
  prompt: string;
} | null {
  const prog = onSpiral(x, z);
  if (prog >= 0) {
    if (prog > 0.88 || nearStairLanding(x, z)) {
      return {
        progress: prog,
        title: "Mezzanine landing",
        hint: "Step off onto the deck · or follow gold arrows down",
        prompt: "Step onto mezzanine",
      };
    }
    if (prog < 0.12) {
      return {
        progress: prog,
        title: "Spiral stair",
        hint: "Follow the gold arrows up to the mezzanine",
        prompt: "Climb to mezzanine",
      };
    }
    return {
      progress: prog,
      title: "Spiral stair",
      hint: groundY > 3 ? "Keep right · mezzanine above" : "Keep walking · gold arrows mark up",
      prompt: prog > 0.5 ? "Almost there · mezzanine" : "Climbing · mezzanine",
    };
  }
  if (nearStairLanding(x, z) && groundY > 3) {
    return {
      progress: 1,
      title: "Mezzanine landing",
      hint: "Gold arrows down return to the lobby",
      prompt: "Descend to lobby",
    };
  }
  if (nearStairBottom(x, z) && groundY < 2.5) {
    return {
      progress: 0,
      title: "Spiral stair",
      hint: "Walk onto the lit pad · arrows lead up",
      prompt: "Climb to mezzanine",
    };
  }
  return null;
}

function inSpiralWell(x: number, z: number) {
  return Math.hypot(x - SPIRAL.cx, z - SPIRAL.cz) < SPIRAL.r1 + 0.22;
}

export function nearStairLanding(x: number, z: number) {
  const top = spiralPoint(1);
  if (Math.hypot(x - top.x, z - top.z) < 2.85) return true;
  const dx = x - SPIRAL.cx;
  const dz = z - SPIRAL.cz;
  const r = Math.hypot(dx, dz);
  if (r < 0.9 || r > SPIRAL.r0 + 0.85) return false;
  let d = Math.abs(Math.atan2(dx, dz) - top.ang);
  while (d > Math.PI) d = Math.abs(d - Math.PI * 2);
  return d < 0.62;
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

/** Hintze Hall wing — east roof terrace off the helipad (L2). */
export const HINTZE_HALL = { x: 18.35, z: 23.5, y: L2_HEIGHT, rotY: Math.PI / 2 };
/** Native hall length (local X). After yaw this runs north–south. */
export const HINTZE_LENGTH = 12.6;
const HINTZE_HALF_W = 3.25;
const HINTZE_HALF_L = 6.05;

/** North roof bridge + helipad deck (east of the atrium, above the plaza). */
export function onRoofDeck(x: number, z: number) {
  if (x >= 5.8 && x <= 15.4 && z >= 13.9 && z <= 32.4) return true;
  if (x >= 14.2 && x <= 22.4 && z >= 16.8 && z <= 30.4) return true;
  return false;
}

export function onHintzeHall(x: number, z: number) {
  return Math.abs(x - HINTZE_HALL.x) < HINTZE_HALF_W && Math.abs(z - HINTZE_HALL.z) < HINTZE_HALF_L;
}

export function floorHeightAt(x: number, z: number, prevY = 0) {
  const st = onSpiral(x, z);
  if (st >= 0) {
    const spiralY = st * L2_HEIGHT;
    // Ease the last fifth up to mezz height so the top is a ramp, not a ledge.
    if (st >= 0.8) {
      const k = Math.min(1, (st - 0.8) / 0.2);
      const eased = spiralY + (L2_HEIGHT - spiralY) * k * k;
      if (nearStairLanding(x, z) || onMezzanine(x, z)) return L2_HEIGHT;
      return eased;
    }
    return spiralY;
  }
  if (prevY > 2.7 && (onMezzanine(x, z) || onRoofDeck(x, z) || onHintzeHall(x, z))) return L2_HEIGHT;
  return 0;
}

function wellRails(): Collider[] {
  const land = spiralPoint(1);
  const out: Collider[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x = SPIRAL.cx + Math.sin(a) * (SPIRAL.r1 + 0.14);
    const z = SPIRAL.cz + Math.cos(a) * (SPIRAL.r1 + 0.14);
    if (Math.hypot(x - land.x, z - land.z) < 2.75) continue;
    if (Math.hypot(x - SPIRAL.cx, z - SPIRAL.cz) < 1.55) continue;
    out.push({ x, z, w: 0.72, d: 0.72, minY: 5.15, maxY: 8.4 });
  }
  return out;
}

const HINTZE_WALLS: Collider[] = [
  { x: HINTZE_HALL.x + 3.56, z: HINTZE_HALL.z, w: 0.3, d: 12.0, minY: 5.15, maxY: 11.4 },
  { x: HINTZE_HALL.x, z: HINTZE_HALL.z + 6.3, w: 6.8, d: 0.3, minY: 5.15, maxY: 11.4 },
  { x: HINTZE_HALL.x, z: HINTZE_HALL.z - 6.3, w: 6.8, d: 0.3, minY: 5.15, maxY: 11.4 },
  { x: HINTZE_HALL.x - 3.56, z: 18.6, w: 0.3, d: 2.8, minY: 5.15, maxY: 11.4 },
  { x: HINTZE_HALL.x - 3.56, z: 26.55, w: 0.3, d: 6.1, minY: 5.15, maxY: 11.4 },
];

export const ROOF_COLLIDERS: Collider[] = [
  { x: 5.75, z: 23.2, w: 0.22, d: 17.8, minY: 5.15, maxY: 8.6 },
  { x: 15.05, z: 15.5, w: 0.22, d: 2.4, minY: 5.15, maxY: 8.6 },
  { x: 15.05, z: 31.35, w: 0.22, d: 1.6, minY: 5.15, maxY: 8.6 },
  { x: 10.4, z: 32.25, w: 9.6, d: 0.22, minY: 5.15, maxY: 8.6 },
  { x: 10.4, z: 27.7, w: 3.4, d: 5.4, minY: 5.2, maxY: 9.6 },
  { x: 22.15, z: 23.5, w: 0.22, d: 13.4, minY: 5.15, maxY: 8.6 },
  { x: 18.35, z: 16.85, w: 7.8, d: 0.22, minY: 5.15, maxY: 8.6 },
  { x: 18.35, z: 30.25, w: 7.8, d: 0.22, minY: 5.15, maxY: 8.6 },
  ...HINTZE_WALLS,
];

export const MEZZ_COLLIDERS: Collider[] = [
  { x: 0, z: MEZZ.holeMaxZ, w: 14.4, d: 0.22, minY: 5.15, maxY: 8.4 },
  { x: 0, z: MEZZ.holeMinZ, w: 14.4, d: 0.22, minY: 5.15, maxY: 8.4 },
  { x: MEZZ.holeMinX, z: 1.1, w: 0.22, d: 15.1, minY: 5.15, maxY: 8.4 },
  { x: MEZZ.holeMaxX, z: 1.1, w: 0.22, d: 15.1, minY: 5.15, maxY: 8.4 },
  ...wellRails(),
  ...ROOF_COLLIDERS,
];
