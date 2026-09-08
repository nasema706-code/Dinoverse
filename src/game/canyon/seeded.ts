import type { Vec3 } from "./types";

export function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export type ScatterPose = {
  position: Vec3;
  rotation: Vec3;
  scale: number;
};

export function scatterPoses(
  count: number,
  seed: number,
  area: { minX: number; maxX: number; minZ: number; maxZ: number; y: number },
  scaleRange: [number, number],
): ScatterPose[] {
  const rand = mulberry32(seed);
  const poses: ScatterPose[] = [];
  for (let i = 0; i < count; i++) {
    poses.push({
      position: [
        area.minX + rand() * (area.maxX - area.minX),
        area.y,
        area.minZ + rand() * (area.maxZ - area.minZ),
      ],
      rotation: [0, rand() * Math.PI * 2, 0],
      scale: scaleRange[0] + rand() * (scaleRange[1] - scaleRange[0]),
    });
  }
  return poses;
}
