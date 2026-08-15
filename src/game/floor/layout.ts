import type { Collider } from "../districts3d";
import { MEZZ_COLLIDERS } from "./levels";

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
];

export const FLOOR_INSPECT: { id: string; x: number; z: number; w: number; d: number }[] = [
  { id: "forum-reception", x: 0, z: 10.2, w: 3.8, d: 1.7 },
  { id: "forum-window", x: -17.4, z: -1.2, w: 1.6, d: 10 },
  { id: "forum-ticker", x: 17.2, z: -1.4, w: 1.6, d: 8 },
  { id: "forum-rex-desk", x: -18.4, z: -4.2, w: 2.4, d: 1.5 },
  { id: "forum-board", x: 12.4, z: -18, w: 2.2, d: 4.4 },
  { id: "forum-q2", x: 12.4, z: -20.6, w: 2.2, d: 1.2 },
  { id: "forum-coffee", x: -10.4, z: 12.2, w: 1.6, d: 1.2 },
  { id: "forum-stairs", x: -8.4, z: 2.6, w: 2.2, d: 2.2 },
  { id: "forum-pad", x: 10.4, z: 27.6, w: 4.4, d: 4.4 },
  { id: "forum-heli", x: 10.4, z: 27.6, w: 3.2, d: 2.2 },
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

  { x: 0, z: 10.15, w: 4.0, d: 1.45, maxY: 3.5 },
  { x: -10.4, z: 12.2, w: 1.5, d: 0.9, maxY: 3.5 },
  { x: 8.4, z: 12.4, w: 1.2, d: 0.9, maxY: 3.5 },
  { x: -5.2, z: 8.4, w: 1.4, d: 1.4 },
  { x: 5.2, z: 8.4, w: 1.4, d: 1.4 },
  { x: 8.4, z: 6.4, w: 2.5, d: 1.3, maxY: 3.5 },
  { x: 12.4, z: -18, w: 2.0, d: 4.6, maxY: 3.5 },
  { x: 10.4, z: 27.6, w: 7.2, d: 7.2, maxY: 4.2 },
  { x: -4.2, z: 18.2, w: 0.7, d: 0.7, maxY: 3.5 },
  { x: 4.2, z: 18.2, w: 0.7, d: 0.7, maxY: 3.5 },
  { x: -7.2, z: 17.4, w: 1.7, d: 0.5, maxY: 3.5 },
  { x: 7.2, z: 17.4, w: 1.7, d: 0.5, maxY: 3.5 },
  { x: -16, z: 20, w: 0.35, d: 0.35, maxY: 3.5 },
  { x: 16, z: 20, w: 0.35, d: 0.35, maxY: 3.5 },
  { x: -16, z: 28, w: 0.35, d: 0.35, maxY: 3.5 },
  { x: 16, z: 28, w: 0.35, d: 0.35, maxY: 3.5 },
  { x: 0, z: 32, w: 0.35, d: 0.35, maxY: 3.5 },
  { x: -8, z: 24, w: 0.35, d: 0.35, maxY: 3.5 },

  { x: -6.5, z: 18.6, w: 0.9, d: 0.6, maxY: 3.5 },
  { x: -6.6, z: 21.2, w: 0.7, d: 0.7, maxY: 3.5 },
  { x: -10.2, z: 22.4, w: 1.4, d: 0.55, maxY: 3.5 },
  { x: 6.6, z: 21.8, w: 1.4, d: 0.55, maxY: 3.5 },
  { x: -1.8, z: 30.2, w: 1.4, d: 0.55, maxY: 3.5 },
  { x: -8.1, z: 13.1, w: 1.6, d: 1.4, maxY: 3.5 },
  { x: 2.2, z: 21.5, w: 0.7, d: 0.55, maxY: 3.5 },
  { x: -3.2, z: 16.9, w: 0.6, d: 0.55, maxY: 3.5 },
  { x: 3.2, z: 16.9, w: 0.6, d: 0.55, maxY: 3.5 },
  { x: -1.85, z: 15.85, w: 0.25, d: 1.5, maxY: 3.5 },
  { x: 1.85, z: 15.85, w: 0.25, d: 1.5, maxY: 3.5 },

  ...FLOOR_DESKS.map((d) => ({
    x: d.x,
    z: d.z,
    w: d.kind === "rex" ? 2.3 : d.kind === "build" ? 2.4 : 1.8,
    d: d.kind === "rex" ? 1.2 : 0.9,
    maxY: 3.5,
  })),
  ...MEZZ_COLLIDERS,
];
