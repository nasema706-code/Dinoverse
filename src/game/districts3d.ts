import type { WorldId } from "@/lib/worlds";
import {
  FLOOR_BOUNDS,
  FLOOR_COLLIDERS,
  FLOOR_INSPECT,
  FLOOR_SEATS,
  FLOOR_SPAWN,
  type FloorSeat,
} from "./floor/layout";

export type Vec3 = [number, number, number];

export type Collider = { x: number; z: number; w: number; d: number; minY?: number; maxY?: number };

export type ScreenWall = {
  src: string;
  position: Vec3;
  rotY: number;
  w: number;
  h: number;
};

export type PropBox = {
  position: Vec3;
  size: Vec3;
  color: string;
  metal?: number;
  collide?: boolean;
};

export type District3D = {
  id: WorldId;
  fog: string;
  fogFar: number;
  ambient: string;
  ground: string;
  sky: string;
  indoor: boolean;
  spawn: { x: number; z: number; yaw: number };
  backdrop: ScreenWall;
  screens: ScreenWall[];
  props: PropBox[];
  portals: { to: WorldId; x: number; z: number; w: number; d: number; label: string; yaw: number }[];
  shards: { id: string; position: Vec3 }[];
  npcs: { id: string; position: Vec3 }[];
  inspect: { id: string; x: number; z: number; w: number; d: number }[];
  seats: FloorSeat[];
  extraColliders: Collider[];
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
};

const B = { minX: -15, maxX: 15, minZ: -13, maxZ: 13 };

export const DISTRICTS_3D: Record<WorldId, District3D> = {
  forum: {
    id: "forum",
    fog: "#b9d6ee",
    fogFar: 175,
    ambient: "#fff6dd",
    ground: "#1a1d22",
    sky: "#8ec4ea",
    indoor: true,
    spawn: FLOOR_SPAWN,
    backdrop: { src: "/life/hq.jpg", position: [0, 8, -48], rotY: 0, w: 40, h: 16 },
    screens: [],
    props: [],
    portals: [
      { to: "mart", x: 20.4, z: 24.2, w: 1.6, d: 2.4, label: "Dino Mart", yaw: -Math.PI / 2 },
      { to: "canopy", x: -20.4, z: 24.2, w: 1.6, d: 2.4, label: "The Mall", yaw: Math.PI / 2 },
      { to: "crater", x: 0, z: 32.2, w: 2.6, d: 1.3, label: "The Arena", yaw: Math.PI },
    ],
    shards: [
      { id: "forum-a", position: [-16.6, 1.15, -26.4] },
      { id: "forum-b", position: [9.8, 1.15, -6.2] },
      { id: "mart-a", position: [17.2, 1.15, 20.6] },
      { id: "mart-b", position: [-17.2, 1.15, 20.6] },
      { id: "canopy-a", position: [2.8, 1.15, 30.4] },
      { id: "canopy-b", position: [-12.4, 1.15, 22.2] },
      { id: "crater-a", position: [12.6, 1.15, 8.4] },
      { id: "crater-b", position: [-2.2, 1.15, -8.4] },
    ],
    npcs: [{ id: "kael", position: [2.2, 0, 11.4] }],
    inspect: FLOOR_INSPECT,
    seats: FLOOR_SEATS,
    extraColliders: FLOOR_COLLIDERS,
    bounds: FLOOR_BOUNDS,
  },
  mart: {
    id: "mart",
    fog: "#1a1814",
    fogFar: 38,
    ambient: "#c8bba8",
    ground: "#d8d2c6",
    sky: "#c9d4dc",
    indoor: true,
    spawn: { x: 0, z: 9, yaw: 0 },
    backdrop: {
      src: "/life/mart.jpg",
      position: [0, 4, -12.6],
      rotY: 0,
      w: 22,
      h: 8,
    },
    screens: [
      { src: "/life/produce.jpg", position: [-14.6, 3.1, -2], rotY: Math.PI / 2, w: 8, h: 4.2 },
      { src: "/life/market.jpg", position: [14.6, 3.1, -1.4], rotY: -Math.PI / 2, w: 8, h: 4.2 },
      { src: "/life/brew.jpg", position: [-9, 2.8, 12.6], rotY: Math.PI, w: 6.2, h: 3.6 },
      { src: "/life/coffee.jpg", position: [-2.2, 2.8, 12.6], rotY: Math.PI, w: 6.2, h: 3.6 },
      { src: "/life/mac-street.jpg", position: [6.4, 2.9, 12.6], rotY: Math.PI, w: 6.6, h: 3.8 },
      { src: "/life/mac-counter.jpg", position: [10.6, 2.2, 5.4], rotY: -0.6, w: 3.2, h: 2.2 },
    ],
    props: [
      { position: [-4.2, 1.2, -2], size: [1.4, 2.4, 8], color: "#3a3d36", collide: true },
      { position: [0, 1.2, -1], size: [1.4, 2.4, 8], color: "#3a3d36", collide: true },
      { position: [4.2, 1.2, -2], size: [1.4, 2.4, 8], color: "#3a3d36", collide: true },
      { position: [8.4, 0.7, 3.2], size: [2.8, 1.4, 1.2], color: "#2c2c2c", collide: true },
      { position: [0, 7.2, 0], size: [31, 0.2, 27], color: "#e8e4dc" },
    ],
    portals: [
      { to: "forum", x: -14.2, z: 8, w: 1.4, d: 2.4, label: "The Floor", yaw: Math.PI / 2 },
      { to: "canopy", x: 14.2, z: 8, w: 1.4, d: 2.4, label: "The Mall", yaw: -Math.PI / 2 },
      { to: "crater", x: 0, z: 12.4, w: 2.6, d: 1.2, label: "The Arena", yaw: Math.PI },
    ],
    shards: [
      { id: "mart-a", position: [-7.4, 1.1, -6] },
      { id: "mart-b", position: [7.8, 1.1, 6.4] },
    ],
    npcs: [{ id: "brak", position: [8.2, 0, 2.6] }],
    inspect: [{ id: "mart-kiosk", x: 8.4, z: 3.2, w: 2.2, d: 1.6 }],
    seats: [],
    extraColliders: [],
    bounds: B,
  },
  canopy: {
    id: "canopy",
    fog: "#8aa0b4",
    fogFar: 55,
    ambient: "#d7e4ef",
    ground: "#4a4d52",
    sky: "#7ea3c4",
    indoor: false,
    spawn: { x: 0, z: 10, yaw: 0 },
    backdrop: {
      src: "/life/mega-mall.jpg",
      position: [0, 5.2, -12.8],
      rotY: 0,
      w: 26,
      h: 10.4,
    },
    screens: [
      { src: "/life/mall-sunset.jpg", position: [-14.7, 4.2, 0], rotY: Math.PI / 2, w: 10, h: 6 },
      { src: "/life/athlete.jpg", position: [8.4, 2.6, -6.4], rotY: 0.15, w: 4.4, h: 3.2 },
      { src: "/life/tech.jpg", position: [-8.2, 2.6, -6.2], rotY: -0.12, w: 4.4, h: 3.2 },
      { src: "/life/milkshake.jpg", position: [14.6, 3.2, 3], rotY: -Math.PI / 2, w: 6.4, h: 3.8 },
    ],
    props: [
      { position: [-8.2, 1.6, -7.4], size: [5.2, 3.2, 2.2], color: "#2a2d33", metal: 0.3, collide: true },
      { position: [8.4, 1.6, -7.6], size: [5.2, 3.2, 2.2], color: "#2a2d33", metal: 0.3, collide: true },
      { position: [0, 0.15, 1], size: [6, 0.3, 6], color: "#3ecf8e" },
      { position: [-10, 14, -4], size: [3.2, 0.5, 1.4], color: "#1c1e22", metal: 0.8 },
      { position: [9, 16, 2], size: [2.6, 0.4, 1.2], color: "#1c1e22", metal: 0.8 },
    ],
    portals: [
      { to: "forum", x: 14.2, z: 8, w: 1.4, d: 2.4, label: "The Floor", yaw: -Math.PI / 2 },
      { to: "mart", x: -14.2, z: 8, w: 1.4, d: 2.4, label: "Dino Mart", yaw: Math.PI / 2 },
      { to: "crater", x: 0, z: 12.4, w: 2.6, d: 1.2, label: "The Arena", yaw: Math.PI },
    ],
    shards: [
      { id: "canopy-a", position: [-5.2, 1.1, 4.4] },
      { id: "canopy-b", position: [6.6, 1.1, -3.2] },
    ],
    npcs: [{ id: "nyla", position: [-1.2, 0, 0.6] }],
    inspect: [{ id: "canopy-rail", x: 0, z: 1, w: 3, d: 3 }],
    seats: [],
    extraColliders: [],
    bounds: B,
  },
  crater: {
    id: "crater",
    fog: "#10140f",
    fogFar: 48,
    ambient: "#6b7a68",
    ground: "#2a4a28",
    sky: "#0a0c10",
    indoor: false,
    spawn: { x: 0, z: 8, yaw: 0 },
    backdrop: {
      src: "/life/football.jpg",
      position: [0, 5.4, -12.8],
      rotY: 0,
      w: 24,
      h: 10.6,
    },
    screens: [
      { src: "/life/gym.jpg", position: [-14.6, 3.6, -1], rotY: Math.PI / 2, w: 8.4, h: 4.8 },
      { src: "/life/track.jpg", position: [14.6, 3.6, -1], rotY: -Math.PI / 2, w: 8.4, h: 4.8 },
      { src: "/life/soccer.jpg", position: [-7, 3.4, 12.6], rotY: Math.PI, w: 7, h: 4 },
      { src: "/life/tennis.jpg", position: [7, 3.4, 12.6], rotY: Math.PI, w: 7, h: 4 },
      { src: "/life/trophy.jpg", position: [0, 6.6, -12.4], rotY: 0, w: 5.2, h: 2.6 },
    ],
    props: [
      { position: [-12.4, 1.4, 0], size: [2.4, 2.8, 18], color: "#1a1c20", collide: true },
      { position: [12.4, 1.4, 0], size: [2.4, 2.8, 18], color: "#1a1c20", collide: true },
      { position: [-12.4, 3.2, 0], size: [2.8, 1.2, 18], color: "#22252b", collide: true },
      { position: [12.4, 3.2, 0], size: [2.8, 1.2, 18], color: "#22252b", collide: true },
      { position: [0, 0.08, 0], size: [16, 0.16, 22], color: "#2f6b32" },
    ],
    portals: [
      { to: "forum", x: 0, z: 12.4, w: 2.6, d: 1.2, label: "The Floor", yaw: Math.PI },
      { to: "mart", x: -14.2, z: 8, w: 1.4, d: 2.4, label: "Dino Mart", yaw: Math.PI / 2 },
      { to: "canopy", x: 14.2, z: 8, w: 1.4, d: 2.4, label: "The Mall", yaw: -Math.PI / 2 },
    ],
    shards: [
      { id: "crater-a", position: [-4.6, 1.1, -5.2] },
      { id: "crater-b", position: [5.2, 1.1, 5.8] },
    ],
    npcs: [{ id: "jett", position: [2.2, 0, -2] }],
    inspect: [{ id: "crater-console", x: 0, z: -10.4, w: 4, d: 1.6 }],
    seats: [],
    extraColliders: [],
    bounds: B,
  },
};

export function hitAABB(x: number, z: number, r: number, c: Collider, y = 0) {
  if (c.minY != null && y + 1.55 < c.minY) return false;
  if (c.maxY != null && y > c.maxY) return false;
  const nx = Math.max(c.x - c.w / 2, Math.min(x, c.x + c.w / 2));
  const nz = Math.max(c.z - c.d / 2, Math.min(z, c.z + c.d / 2));
  const dx = x - nx;
  const dz = z - nz;
  return dx * dx + dz * dz < r * r;
}

export function collidersFor(d: District3D): Collider[] {
  const walls: Collider[] = [
    { x: 0, z: d.bounds.minZ - 0.4, w: 40, d: 0.8 },
    { x: 0, z: d.bounds.maxZ + 0.4, w: 40, d: 0.8 },
    { x: d.bounds.minX - 0.4, z: 0, w: 0.8, d: 40 },
    { x: d.bounds.maxX + 0.4, z: 0, w: 0.8, d: 40 },
    ...d.extraColliders,
  ];
  for (const p of d.props) {
    if (!p.collide) continue;
    walls.push({ x: p.position[0], z: p.position[2], w: p.size[0], d: p.size[2] });
  }
  return walls;
}
