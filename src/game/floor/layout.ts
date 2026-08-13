import type { Collider } from "../districts3d";

export type FloorDesk = {
  id: string;
  x: number;
  z: number;
  rotY: number;
  screen: string;
  kind: "trade" | "analyst" | "rex";
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

export const FLOOR_BOUNDS = { minX: -11.6, maxX: 11.6, minZ: -13.6, maxZ: 11.6 };
export const FLOOR_SPAWN = { x: 4.6, z: 5.2, yaw: 0 };

export const FLOOR_DESKS: FloorDesk[] = [
  { id: "trade-1", x: -4.6, z: 3.4, rotY: 0, screen: "/life/analysis.jpg", kind: "trade" },
  { id: "trade-2", x: 4.6, z: 3.4, rotY: 0, screen: "/life/finance.jpg", kind: "trade" },
  { id: "trade-3", x: -4.6, z: 0.15, rotY: 0, screen: "/life/office.jpg", kind: "trade" },
  { id: "trade-4", x: 4.6, z: 0.15, rotY: 0, screen: "/life/analysis.jpg", kind: "trade" },
  { id: "analyst-1", x: -3.6, z: -9.4, rotY: 0, screen: "/life/analysis.jpg", kind: "analyst" },
  { id: "analyst-2", x: 0, z: -9.4, rotY: 0, screen: "/life/office.jpg", kind: "analyst" },
  { id: "analyst-3", x: 3.6, z: -9.4, rotY: 0, screen: "/life/finance.jpg", kind: "analyst" },
  { id: "rex-desk", x: -9.4, z: -7.2, rotY: Math.PI / 2, screen: "/life/finance.jpg", kind: "rex" },
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
    terminal: d.id,
  };
}

export const FLOOR_SEATS: FloorSeat[] = [
  ...FLOOR_DESKS.map(seatFor),
  {
    id: "sit-conf",
    x: 9.15,
    z: -4.1,
    w: 0.7,
    d: 0.7,
    sitX: 9.15,
    sitZ: -4.1,
    sitYaw: -Math.PI / 2,
    label: "Sit at the table",
  },
];

export const FLOOR_INSPECT: { id: string; x: number; z: number; w: number; d: number }[] = [
  { id: "forum-reception", x: 0, z: 7.6, w: 2.4, d: 1.2 },
  { id: "forum-window", x: 0, z: -12.6, w: 8, d: 1.4 },
  { id: "forum-ticker", x: 0, z: 5.6, w: 4, d: 0.8 },
  { id: "forum-rex-desk", x: -9.4, z: -7.2, w: 2.2, d: 1.4 },
  { id: "forum-board", x: 11.1, z: -7.2, w: 1.2, d: 3.2 },
  { id: "forum-coffee", x: -8.6, z: 8.4, w: 1.6, d: 1.2 },
  { id: "trade-1", x: -4.6, z: 3.0, w: 1.4, d: 0.8 },
  { id: "trade-2", x: 4.6, z: 3.0, w: 1.4, d: 0.8 },
  { id: "trade-3", x: -4.6, z: -0.2, w: 1.4, d: 0.8 },
];

export const FLOOR_COLLIDERS: Collider[] = [
  { x: 0, z: FLOOR_BOUNDS.minZ - 0.35, w: 28, d: 0.7 },
  { x: 0, z: FLOOR_BOUNDS.maxZ + 0.35, w: 28, d: 0.7 },
  { x: FLOOR_BOUNDS.minX - 0.35, z: 0, w: 0.7, d: 28 },
  { x: FLOOR_BOUNDS.maxX + 0.35, z: 0, w: 0.7, d: 28 },
  { x: -7.25, z: -10.2, w: 0.28, d: 5.2 },
  { x: -7.25, z: 1.6, w: 0.28, d: 5.4 },
  { x: 7.25, z: -10.2, w: 0.28, d: 5.2 },
  { x: 7.25, z: 1.6, w: 0.28, d: 5.4 },
  { x: 0, z: 8.15, w: 3.8, d: 1.15 },
  { x: 6.1, z: 8.5, w: 1.1, d: 0.9 },
  { x: -8.6, z: 8.5, w: 1.5, d: 0.9 },
  { x: 9.35, z: -6.6, w: 2.1, d: 4.4 },
  ...FLOOR_DESKS.map((d) => ({
    x: d.x,
    z: d.z,
    w: d.kind === "rex" ? 2.2 : 1.65,
    d: d.kind === "rex" ? 1.15 : 0.82,
  })),
];
