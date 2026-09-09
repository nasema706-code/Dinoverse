import { PTERA_PAD } from "./layout";

/** Live plaza pose for Ptera Drift. Written from the 3D actor, read by the explorer HUD. */
export const pteraLive = {
  x: PTERA_PAD.x,
  z: PTERA_PAD.z,
  absorbClick: false,
  approach: false,
  pendingTalk: false,
};

export function pteraNpcPos(fallback: [number, number, number]): { x: number; z: number } {
  return { x: pteraLive.x || fallback[0], z: pteraLive.z || fallback[2] };
}
