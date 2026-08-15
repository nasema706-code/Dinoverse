import { L2_HEIGHT, SPIRAL } from "./levels";

export const LIFT = {
  cx: SPIRAL.cx,
  cz: SPIRAL.cz,
  r: 1.14,
  doorReach: 2.35,
  cabH: 2.32,
  speed: 3.35,
};

export const LIFT_GROUND_ANG = Math.PI / 2;

export function liftMezzAng() {
  return SPIRAL.start + SPIRAL.turns * Math.PI * 2;
}

let floorY = 0;
let targetY = 0;
let moving = false;

export function getLiftFloorY() {
  return floorY;
}

export function liftBusy() {
  return moving;
}

export function inLiftCabin(x: number, z: number) {
  return Math.hypot(x - LIFT.cx, z - LIFT.cz) < LIFT.r - 0.05;
}

export function nearLift(x: number, z: number) {
  const dx = x - LIFT.cx;
  const dz = z - LIFT.cz;
  const r = Math.hypot(dx, dz);
  if (r < LIFT.doorReach) return true;
  if (dx > 0.35 && Math.abs(dz) < 0.95 && r < 3.1) return true;
  return onLiftBridge(x, z);
}

export function onLiftBridge(x: number, z: number) {
  const dx = x - LIFT.cx;
  const dz = z - LIFT.cz;
  const r = Math.hypot(dx, dz);
  if (r < LIFT.r - 0.02 || r > SPIRAL.r0 + 0.35) return false;
  const ang = Math.atan2(dx, dz);
  const land = SPIRAL.start + SPIRAL.turns * Math.PI * 2;
  let d = Math.abs(ang - land);
  while (d > Math.PI) d = Math.abs(d - Math.PI * 2);
  return d < 0.42;
}

export function liftPrompt(x: number, z: number, groundY: number): string | null {
  const inside = inLiftCabin(x, z);
  const close = nearLift(x, z) || onLiftBridge(x, z);
  if (!inside && !close) return null;
  if (moving) return "Lift in motion";
  const atMezz = groundY > 3;
  if (inside) return atMezz ? "Ride to lobby" : "Ride to mezzanine";
  const cabHere = atMezz ? floorY > L2_HEIGHT - 0.25 : floorY < 0.25;
  return cabHere ? "Step inside" : "Call lift";
}

export function requestLift(x: number, z: number, groundY: number) {
  if (moving) return;
  const atMezz = groundY > 3;
  if (inLiftCabin(x, z)) {
    targetY = atMezz ? 0 : L2_HEIGHT;
    moving = Math.abs(targetY - floorY) > 0.04;
    return;
  }
  targetY = atMezz ? L2_HEIGHT : 0;
  moving = Math.abs(targetY - floorY) > 0.04;
}

export function tickLift(dt: number) {
  if (!moving) return;
  const dir = Math.sign(targetY - floorY);
  floorY += dir * LIFT.speed * dt;
  if ((dir >= 0 && floorY >= targetY) || (dir <= 0 && floorY <= targetY)) {
    floorY = targetY;
    moving = false;
  }
}

export function clampInCab(x: number, z: number): { x: number; z: number } {
  const dx = x - LIFT.cx;
  const dz = z - LIFT.cz;
  const r = Math.hypot(dx, dz);
  const max = LIFT.r - 0.22;
  if (r <= max || r < 0.0001) return { x, z };
  return { x: LIFT.cx + (dx / r) * max, z: LIFT.cz + (dz / r) * max };
}
