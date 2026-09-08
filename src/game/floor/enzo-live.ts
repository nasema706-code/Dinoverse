import { ENZO_PLAZA } from "./layout";

export const enzoLive = {
  x: ENZO_PLAZA.x,
  z: ENZO_PLAZA.z,
};

export function resetEnzoLive() {
  enzoLive.x = ENZO_PLAZA.x;
  enzoLive.z = ENZO_PLAZA.z;
}

export function enzoNpcPos(fallback: [number, number, number]): { x: number; z: number } {
  return { x: enzoLive.x || fallback[0], z: enzoLive.z || fallback[2] };
}
