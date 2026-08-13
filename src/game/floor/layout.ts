import type { Collider } from "../districts3d";
import { MEZZ_COLLIDERS } from "./levels";

export type FloorDesk = {
  id: string;
  x: number;
  z: number;
  rotY: number;
  screen: string;
  kind: "trade" | "analyst" | "rex" | "build";
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

export const FLOOR_DESKS: FloorDesk[] = [
  { id: "trade-1", x: -6.2, z: -0.4, rotY: 0, screen: "/life/analysis.jpg", kind: "trade" },
  { id: "trade-2", x: 6.2, z: -0.4, rotY: 0, screen: "/life/finance.jpg", kind: "trade" },
  { id: "trade-3", x: -6.2, z: -4.6, rotY: 0, screen: "/life/office.jpg", kind: "trade" },
  { id: "trade-4", x: 6.2, z: -4.6, rotY: 0, screen: "/life/analysis.jpg", kind: "trade" },
  { id: "analyst-1", x: -14.2, z: -20.4, rotY: 0, screen: "/life/analysis.jpg", kind: "analyst" },
  { id: "analyst-2", x: -9.4, z: -20.4, rotY: 0, screen: "/life/office.jpg", kind: "analyst" },
  { id: "analyst-3", x: -4.6, z: -20.4, rotY: 0, screen: "/life/finance.jpg", kind: "analyst" },
  { id: "trade-build", x: -14.2, z: -15.2, rotY: 0, screen: "/life/office.jpg", kind: "build" },
  { id: "rex-desk", x: -18.4, z: -4.2, rotY: Math.PI / 2, screen: "/life/finance.jpg", kind: "rex" },
];

function seatFor(d: FloorDesk): FloorSeat {
  const back = 0.78;
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
    label: d.kind === "rex" ? "Sit at Rex's desk" : "Sit",
    terminal: d.id === "trade-build" ? "trade-3" : d.id,
  };
}

export const FLOOR_SEATS: FloorSeat[] = [
  ...FLOOR_DESKS.map(seatFor),
  {
    id: "sit-conf",
    x: 13.2,
    z: -18.6,
    w: 0.7,
    d: 0.7,
    sitX: 13.2,
    sitZ: -18.6,
    sitYaw: -Math.PI / 2,
    label: "Sit at the table",
  },
];

export const FLOOR_INSPECT: { id: string; x: number; z: number; w: number; d: number }[] = [
  { id: "forum-reception", x: 0, z: 10.2, w: 3.2, d: 1.6 },
  { id: "forum-window", x: -17.4, z: -1.2, w: 1.6, d: 10 },
  { id: "forum-ticker", x: 17.2, z: -1.4, w: 1.6, d: 8 },
  { id: "forum-rex-desk", x: -18.4, z: -4.2, w: 2.2, d: 1.4 },
  { id: "forum-board", x: 17.6, z: -22.4, w: 1.4, d: 3.6 },
  { id: "forum-coffee", x: -10.4, z: 12.2, w: 1.6, d: 1.2 },
  { id: "forum-stairs", x: -8.4, z: 2.6, w: 2.2, d: 2.2 },
  { id: "forum-mezz", x: -14.2, z: 12.4, w: 2.4, d: 2.2 },
  { id: "trade-1", x: -6.2, z: -0.8, w: 1.4, d: 0.8 },
  { id: "trade-2", x: 6.2, z: -0.8, w: 1.4, d: 0.8 },
  { id: "trade-3", x: -14.2, z: -15.6, w: 1.4, d: 0.8 },
];

export const FLOOR_COLLIDERS: Collider[] = [
  { x: 0, z: FLOOR_BOUNDS.minZ - 0.4, w: 52, d: 0.8 },
  { x: 0, z: FLOOR_BOUNDS.maxZ + 0.4, w: 52, d: 0.8 },
  { x: FLOOR_BOUNDS.minX - 0.4, z: 0, w: 0.8, d: 72 },
  { x: FLOOR_BOUNDS.maxX + 0.4, z: 0, w: 0.8, d: 72 },

  { x: -8.4, z: 16, w: 11.2, d: 0.45 },
  { x: 8.4, z: 16, w: 11.2, d: 0.45 },
  { x: -14.1, z: 11, w: 0.4, d: 10.2 },
  { x: 14.1, z: 11, w: 0.4, d: 10.2 },

  { x: -18.2, z: -1, w: 0.35, d: 14 },
  { x: 18.2, z: -1, w: 0.4, d: 14 },

  { x: -14, z: -10.2, w: 12, d: 0.4 },
  { x: 3.2, z: -10.2, w: 8.4, d: 0.4 },
  { x: 20, z: -10.2, w: 6, d: 0.4 },
  { x: -2.2, z: -20, w: 0.4, d: 20 },
  { x: 6.2, z: -20, w: 0.4, d: 20 },

  { x: 0, z: 10.15, w: 4.2, d: 1.35, maxY: 3.5 },
  { x: -10.4, z: 12.2, w: 1.5, d: 0.9, maxY: 3.5 },
  { x: 8.4, z: 12.4, w: 1.2, d: 0.9, maxY: 3.5 },
  { x: -5.2, z: 8.4, w: 1.4, d: 1.4 },
  { x: 5.2, z: 8.4, w: 1.4, d: 1.4 },
  { x: 14.6, z: -20.2, w: 2.2, d: 4.6, maxY: 3.5 },
  { x: -8, z: 26.2, w: 3.4, d: 3.4, maxY: 3.5 },
  { x: -16, z: 20, w: 0.35, d: 0.35, maxY: 3.5 },
  { x: 16, z: 20, w: 0.35, d: 0.35, maxY: 3.5 },
  { x: -16, z: 28, w: 0.35, d: 0.35, maxY: 3.5 },
  { x: 16, z: 28, w: 0.35, d: 0.35, maxY: 3.5 },

  ...FLOOR_DESKS.map((d) => ({
    x: d.x,
    z: d.z,
    w: d.kind === "rex" ? 2.2 : 1.7,
    d: d.kind === "rex" ? 1.15 : 0.86,
    maxY: 3.5,
  })),
  ...MEZZ_COLLIDERS,
];
