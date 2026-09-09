import type { Collider } from "../districts3d";
import { HINTZE_HALL, L2_HEIGHT, MEZZ_COLLIDERS } from "./levels";

export type FloorDesk = {
  id: string;
  x: number;
  z: number;
  rotY: number;
  screen: string;
  kind: "trade" | "rex" | "build";
};

export type FloorSeat = {
  id: string;
  x: number;
  z: number;
  w: number;
  d: number;
  sitX: number;
  sitZ: number;
  sitYaw: number;
  label: string;
  terminal?: string;
};

export const FLOOR_BOUNDS = { minX: -24, maxX: 24, minZ: -32, maxZ: 34 };
export const FLOOR_SPAWN = { x: 0, z: 24, yaw: 0 };
/** HQ bird on the north roof helipad (L2). */
export const HELI_PAD = { x: 10.4, z: 27.6, y: L2_HEIGHT };
export { HINTZE_HALL, HINTZE_LENGTH } from "./levels";
/** Ptera Drift standing west of the roof helicopter, facing the pad. */
export const PTERA_PAD = { x: 7.55, z: 25.5, y: L2_HEIGHT, rotY: Math.PI / 2 };
/** Enzo on the east plaza tiles, outside HQ — west of the helipad stilts. */
export const ENZO_PLAZA = { x: 4.4, z: 21.5, rotY: 0.15 };
/** Mutated as he walks so the player still bumps the body. */
export const ENZO_COLLIDER: Collider = { x: ENZO_PLAZA.x, z: ENZO_PLAZA.z, w: 1.55, d: 1.65, maxY: 2.8 };

export const FLOOR_DESKS: FloorDesk[] = [
  { id: "trade-1", x: -6.2, z: -0.4, rotY: 0, screen: "/life/analysis.jpg", kind: "trade" },
  { id: "trade-2", x: 0, z: -0.4, rotY: 0, screen: "/life/analysis.jpg", kind: "trade" },
  { id: "trade-3", x: 6.2, z: -0.4, rotY: 0, screen: "/life/analysis.jpg", kind: "trade" },
  { id: "trade-4", x: -6.2, z: -4.6, rotY: 0, screen: "/life/analysis.jpg", kind: "trade" },
  { id: "trade-5", x: 0, z: -4.6, rotY: 0, screen: "/life/analysis.jpg", kind: "trade" },
  { id: "trade-6", x: 6.2, z: -4.6, rotY: 0, screen: "/life/analysis.jpg", kind: "trade" },
  { id: "build-1", x: -14.2, z: -20.4, rotY: 0, screen: "/life/office.jpg", kind: "build" },
  { id: "build-2", x: -9.4, z: -20.4, rotY: 0, screen: "/life/office.jpg", kind: "build" },
  { id: "build-3", x: -14.2, z: -15.2, rotY: 0, screen: "/life/office.jpg", kind: "build" },
  { id: "build-4", x: -9.4, z: -15.2, rotY: 0, screen: "/life/office.jpg", kind: "build" },
  { id: "rex-desk", x: -18.4, z: -4.2, rotY: Math.PI / 2, screen: "/life/finance.jpg", kind: "rex" },
];

function seatFor(d: FloorDesk): FloorSeat {
  const back = 0.82;
  const sitX = d.x + Math.sin(d.rotY) * back;
  const sitZ = d.z + Math.cos(d.rotY) * back;
  return {
    id: `sit-${d.id}`,
    x: sitX,
    z: sitZ,
    w: 0.7,
    d: 0.7,
    sitX,
    sitZ,
    sitYaw: d.rotY,
    label: d.kind === "rex" ? "Sit at Rex's desk" : d.kind === "build" ? "Sit at the build desk" : "Sit at the terminal",
    terminal: d.id,
  };
}

export const FLOOR_SEATS: FloorSeat[] = [
  ...FLOOR_DESKS.map(seatFor),
  {
    id: "sit-sec",
    x: 0,
    z: 9.3,
    w: 0.7,
    d: 0.7,
    sitX: 0,
    sitZ: 9.3,
    sitYaw: Math.PI,
    label: "Sit at Dino-Sec",
  },
  {
    id: "sit-command",
    x: 8.4,
    z: 7.35,
    w: 0.7,
    d: 0.7,
    sitX: 8.4,
    sitZ: 7.35,
    sitYaw: Math.PI,
    label: "Sit at the command station",
    terminal: "forum-dinose",
  },
  {
    id: "sit-conf-1",
    x: 11.35,
    z: -16.4,
    w: 0.7,
    d: 0.7,
    sitX: 11.35,
    sitZ: -16.4,
    sitYaw: Math.PI / 2,
    label: "Sit at the table",
  },
  {
    id: "sit-conf-2",
    x: 11.35,
    z: -18.6,
    w: 0.7,
    d: 0.7,
    sitX: 11.35,
    sitZ: -18.6,
    sitYaw: Math.PI / 2,
    label: "Sit at the table",
  },
  {
    id: "sit-conf-3",
    x: 13.45,
    z: -16.4,
    w: 0.7,
    d: 0.7,
    sitX: 13.45,
    sitZ: -16.4,
    sitYaw: -Math.PI / 2,
    label: "Sit at the table",
  },
  {
    id: "sit-conf-4",
    x: 13.45,
    z: -18.6,
    w: 0.7,
    d: 0.7,
    sitX: 13.45,
    sitZ: -18.6,
    sitYaw: -Math.PI / 2,
    label: "Sit at the table",
  },
  {
    id: "sit-cafe-1",
    x: -11.05,
    z: 10.75,
    w: 0.65,
    d: 0.65,
    sitX: -11.05,
    sitZ: 10.75,
    sitYaw: 0.4,
    label: "Sit at Eggpresso",
  },
  {
    id: "sit-cafe-2",
    x: -10.15,
    z: 10.75,
    w: 0.65,
    d: 0.65,
    sitX: -10.15,
    sitZ: 10.75,
    sitYaw: -0.35,
    label: "Sit at Eggpresso",
  },
  {
    id: "sit-cafe-3",
    x: -13.15,
    z: 10.45,
    w: 0.65,
    d: 0.65,
    sitX: -13.15,
    sitZ: 10.45,
    sitYaw: 0.5,
    label: "Sit at Eggpresso",
  },
  {
    id: "sit-cafe-4",
    x: -12.25,
    z: 10.4,
    w: 0.65,
    d: 0.65,
    sitX: -12.25,
    sitZ: 10.4,
    sitYaw: -0.45,
    label: "Sit at Eggpresso",
  },
  {
    id: "sit-lunch-1",
    x: -15.5,
    z: 7.1,
    w: 0.65,
    d: 0.65,
    sitX: -15.5,
    sitZ: 7.1,
    sitYaw: 0.2,
    label: "Sit for lunch",
  },
  {
    id: "sit-lunch-2",
    x: -14.6,
    z: 7.1,
    w: 0.65,
    d: 0.65,
    sitX: -14.6,
    sitZ: 7.1,
    sitYaw: -0.2,
    label: "Sit for lunch",
  },
  {
    id: "sit-lunch-3",
    x: -15.5,
    z: 8.05,
    w: 0.65,
    d: 0.65,
    sitX: -15.5,
    sitZ: 8.05,
    sitYaw: Math.PI - 0.2,
    label: "Sit for lunch",
  },
  {
    id: "sit-lunch-4",
    x: -14.6,
    z: 8.05,
    w: 0.65,
    d: 0.65,
    sitX: -14.6,
    sitZ: 8.05,
    sitYaw: Math.PI + 0.2,
    label: "Sit for lunch",
  },
  {
    id: "sit-lunch-5",
    x: -13.7,
    z: 7.2,
    w: 0.65,
    d: 0.65,
    sitX: -13.7,
    sitZ: 7.2,
    sitYaw: 0.25,
    label: "Sit for lunch",
  },
  {
    id: "sit-lunch-6",
    x: -12.8,
    z: 7.2,
    w: 0.65,
    d: 0.65,
    sitX: -12.8,
    sitZ: 7.2,
    sitYaw: -0.25,
    label: "Sit for lunch",
  },
];

export const FLOOR_INSPECT: { id: string; x: number; z: number; w: number; d: number; y?: number }[] = [
  { id: "forum-reception", x: 0, z: 10.2, w: 3.8, d: 1.7 },
  { id: "forum-window", x: -17.4, z: -1.2, w: 1.6, d: 10 },
  { id: "forum-ticker", x: 17.2, z: -1.4, w: 1.6, d: 8 },
  { id: "forum-rex-desk", x: -18.4, z: -4.2, w: 2.4, d: 1.5 },
  { id: "forum-board", x: 12.4, z: -18, w: 2.2, d: 4.4 },
  { id: "forum-q2", x: 12.4, z: -20.6, w: 2.2, d: 1.2 },
  { id: "forum-coffee", x: -11.2, z: 12.1, w: 3.8, d: 2.8 },
  { id: "forum-vend", x: -15.2, z: 5.3, w: 3.8, d: 1.6 },
  { id: "forum-drinks", x: -14.55, z: 12.45, w: 1.4, d: 1.2 },
  { id: "forum-lunch", x: -14.4, z: 7.5, w: 3.6, d: 2.4 },
  /** Foot of the spiral only — mid-climb uses the stair HUD, not this inspect. */
  { id: "forum-stairs", x: -8.9, z: 2.45, w: 3.2, d: 3.2 },
  { id: "forum-pad", x: HELI_PAD.x, z: HELI_PAD.z, w: 4.4, d: 4.4, y: HELI_PAD.y },
  { id: "forum-heli", x: HELI_PAD.x, z: HELI_PAD.z, w: 3.2, d: 2.2, y: HELI_PAD.y },
  { id: "forum-hintze", x: 14.7, z: 21.6, w: 2.6, d: 3.2, y: HINTZE_HALL.y },
  { id: "forum-hq-sign", x: 0, z: 16.3, w: 5.6, d: 1.4 },
  { id: "forum-directory", x: -6.5, z: 18.6, w: 1.2, d: 0.8 },
  { id: "forum-mezz", x: -14.2, z: 12.4, w: 2.4, d: 2.2 },
  { id: "forum-dinose", x: -4.2, z: 2.4, w: 3.2, d: 2.2 },
  { id: "forum-office", x: -11.8, z: -17.8, w: 6.4, d: 6.2 },
  { id: "forum-command", x: 8.4, z: 6.4, w: 2.4, d: 1.4 },
  { id: "trade-1", x: -6.2, z: -0.8, w: 1.5, d: 0.9 },
  { id: "trade-2", x: 0, z: -0.8, w: 1.5, d: 0.9 },
  { id: "trade-3", x: 6.2, z: -0.8, w: 1.5, d: 0.9 },
  { id: "trade-4", x: -6.2, z: -5, w: 1.5, d: 0.9 },
  { id: "trade-5", x: 0, z: -5, w: 1.5, d: 0.9 },
  { id: "trade-6", x: 6.2, z: -5, w: 1.5, d: 0.9 },
  { id: "build-1", x: -14.2, z: -20.8, w: 1.8, d: 0.9 },
  { id: "build-2", x: -9.4, z: -20.8, w: 1.8, d: 0.9 },
  { id: "build-3", x: -14.2, z: -15.6, w: 1.8, d: 0.9 },
  { id: "build-4", x: -9.4, z: -15.6, w: 1.8, d: 0.9 },
];

export const FLOOR_COLLIDERS: Collider[] = [
  { x: 0, z: FLOOR_BOUNDS.minZ - 0.4, w: 52, d: 0.8 },
  { x: 0, z: FLOOR_BOUNDS.maxZ + 0.4, w: 52, d: 0.8 },
  { x: FLOOR_BOUNDS.minX - 0.4, z: 0, w: 0.8, d: 72 },
  { x: FLOOR_BOUNDS.maxX + 0.4, z: 0, w: 0.8, d: 72 },

  { x: -8.4, z: 16, w: 11.2, d: 0.45 },
  /** East plaza glass — open at L2 so the roof bridge can exit. */
  { x: 8.4, z: 16, w: 11.2, d: 0.45, maxY: 5.15 },
  { x: 8.4, z: 16, w: 11.2, d: 0.45, minY: 8.35, maxY: 12.5 },
  { x: -14.1, z: 11, w: 0.4, d: 10.2 },
  { x: 14.1, z: 11, w: 0.4, d: 10.2 },

  { x: -18.2, z: -1, w: 0.35, d: 14 },
  { x: 18.2, z: -1, w: 0.4, d: 14 },

  { x: -14, z: -10.2, w: 12, d: 0.4 },
  { x: 3.2, z: -10.2, w: 8.4, d: 0.4 },
  { x: 20, z: -10.2, w: 6, d: 0.4 },
  { x: -2.2, z: -20, w: 0.4, d: 20 },
  { x: 6.2, z: -20, w: 0.4, d: 20 },

  { x: 0, z: 10.15, w: 4.0, d: 1.45, maxY: 3.5 },
  { x: -10.4, z: 12.2, w: 2.7, d: 1.0, maxY: 3.5 },
  { x: -9.2, z: 12.85, w: 0.6, d: 0.55, maxY: 3.5 },
  { x: -14.55, z: 12.45, w: 0.9, d: 0.75, maxY: 3.5 },
  { x: -15.75, z: 5.25, w: 1.1, d: 0.8, maxY: 3.5 },
  { x: -14.45, z: 5.25, w: 1.1, d: 0.8, maxY: 3.5 },
  { x: -13.15, z: 5.25, w: 1.1, d: 0.8, maxY: 3.5 },
  { x: -12.05, z: 6.05, w: 0.9, d: 0.75, maxY: 3.5 },
  { x: -15.05, z: 7.55, w: 1.5, d: 1.0, maxY: 3.5 },
  { x: -13.25, z: 7.65, w: 1.5, d: 1.0, maxY: 3.5 },
  { x: -11.65, z: 10.25, w: 1.4, d: 1.4, maxY: 3.5 },
  { x: -12.75, z: 9.95, w: 1.4, d: 1.4, maxY: 3.5 },
  { x: 8.4, z: 12.4, w: 1.2, d: 0.9, maxY: 3.5 },
  { x: -5.2, z: 8.4, w: 1.4, d: 1.4 },
  { x: 5.2, z: 8.4, w: 1.4, d: 1.4 },
  { x: 8.4, z: 6.4, w: 2.5, d: 1.3, maxY: 3.5 },
  { x: 12.4, z: -18, w: 2.0, d: 4.6, maxY: 3.5 },
  { x: -4.2, z: 18.2, w: 0.7, d: 0.7, maxY: 3.5 },
  { x: 4.2, z: 18.2, w: 0.7, d: 0.7, maxY: 3.5 },
  { x: -7.2, z: 17.4, w: 1.7, d: 0.5, maxY: 3.5 },
  { x: 7.2, z: 17.4, w: 1.7, d: 0.5, maxY: 3.5 },
  { x: -16, z: 20, w: 0.35, d: 0.35, maxY: 3.5 },
  { x: 16, z: 20, w: 0.35, d: 0.35, maxY: 3.5 },
  { x: -16, z: 28, w: 0.35, d: 0.35, maxY: 3.5 },
  { x: 16, z: 28, w: 0.35, d: 0.35, maxY: 3.5 },
  { x: 15.35, z: 18.2, w: 0.4, d: 0.4, maxY: 3.5 },
  { x: 21.35, z: 18.2, w: 0.4, d: 0.4, maxY: 3.5 },
  { x: 15.35, z: 23.5, w: 0.4, d: 0.4, maxY: 3.5 },
  { x: 21.35, z: 23.5, w: 0.4, d: 0.4, maxY: 3.5 },
  { x: 15.35, z: 28.8, w: 0.4, d: 0.4, maxY: 3.5 },
  { x: 21.35, z: 28.8, w: 0.4, d: 0.4, maxY: 3.5 },
  { x: 0, z: 32, w: 0.35, d: 0.35, maxY: 3.5 },
  { x: -8, z: 24, w: 0.35, d: 0.35, maxY: 3.5 },

  { x: -6.5, z: 18.6, w: 0.9, d: 0.6, maxY: 3.5 },
  { x: -6.6, z: 21.2, w: 0.7, d: 0.7, maxY: 3.5 },
  { x: -10.2, z: 22.4, w: 1.4, d: 0.55, maxY: 3.5 },
  { x: 6.6, z: 21.8, w: 1.4, d: 0.55, maxY: 3.5 },
  { x: -1.8, z: 30.2, w: 1.4, d: 0.55, maxY: 3.5 },
  { x: 2.2, z: 21.5, w: 0.7, d: 0.55, maxY: 3.5 },
  { x: -3.2, z: 16.9, w: 0.6, d: 0.55, maxY: 3.5 },
  { x: 3.2, z: 16.9, w: 0.6, d: 0.55, maxY: 3.5 },
  ENZO_COLLIDER,
  { x: -2.78, z: 16.18, w: 0.22, d: 0.36, maxY: 3.4 },
  { x: 2.78, z: 16.18, w: 0.22, d: 0.36, maxY: 3.4 },

  ...FLOOR_DESKS.map((d) => ({
    x: d.x,
    z: d.z,
    w: d.kind === "rex" ? 2.3 : d.kind === "build" ? 2.4 : 1.8,
    d: d.kind === "rex" ? 1.2 : 0.9,
    maxY: 3.5,
  })),
  ...MEZZ_COLLIDERS,
];
