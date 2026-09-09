import { HELI_PAD } from "./layout";

/** Shared pose between the explorer and the roof helicopter. */
export const heliLive = {
  boarded: false,
  boardRequest: false,
  absorbClick: false,
  x: HELI_PAD.x,
  y: HELI_PAD.y,
  z: HELI_PAD.z,
  yaw: 0,
  /** Visual bank, radians. */
  roll: 0,
  pitch: 0,
  flying: false,
  /** Touch climb, −1 down … +1 up. */
  climbStick: 0,
};

export function resetHeli() {
  heliLive.boarded = false;
  heliLive.boardRequest = false;
  heliLive.absorbClick = false;
  heliLive.x = HELI_PAD.x;
  heliLive.y = HELI_PAD.y;
  heliLive.z = HELI_PAD.z;
  heliLive.yaw = 0;
  heliLive.roll = 0;
  heliLive.pitch = 0;
  heliLive.flying = false;
  heliLive.climbStick = 0;
}

export function nearHeli(px: number, pz: number, footY: number) {
  const dx = px - heliLive.x;
  const dz = pz - heliLive.z;
  const dy = footY - heliLive.y;
  return dx * dx + dz * dz < 3.8 * 3.8 && Math.abs(dy) < 2.4;
}
