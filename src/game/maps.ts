import type { WorldId } from "@/lib/worlds";

export type Rect = { x: number; y: number; w: number; h: number };

export type Portal = Rect & {
  to: WorldId;
  spawn: { x: number; y: number };
  label: string;
};

export type Npc = {
  id: string;
  x: number;
  y: number;
};

export type Inspectable = Rect & { id: string };

export type GameMap = {
  id: WorldId;
  src: string;
  width: number;
  height: number;
  walk: Rect;
  spawn: { x: number; y: number };
  portals: Portal[];
  shards: { id: string; x: number; y: number }[];
  npcs: Npc[];
  inspectables: Inspectable[];
};

const W = 1600;
const H = 1200;
const walk: Rect = { x: 220, y: 200, w: 1160, h: 800 };

export const GAME_MAPS: Record<WorldId, GameMap> = {
  mart: {
    id: "mart",
    src: "/worlds/mart/map.jpg",
    width: W,
    height: H,
    walk,
    spawn: { x: 800, y: 600 },
    portals: [
      { x: 220, y: 520, w: 56, h: 160, to: "canopy", spawn: { x: 1280, y: 600 }, label: "The Mall" },
      { x: 1324, y: 520, w: 56, h: 160, to: "crater", spawn: { x: 320, y: 600 }, label: "The Arena" },
      { x: 700, y: 944, w: 200, h: 56, to: "forum", spawn: { x: 800, y: 320 }, label: "The Floor" },
    ],
    shards: [
      { id: "mart-a", x: 460, y: 420 },
      { id: "mart-b", x: 1120, y: 740 },
    ],
    npcs: [{ id: "brak", x: 920, y: 390 }],
    inspectables: [{ id: "mart-kiosk", x: 380, y: 700, w: 90, h: 70 }],
  },
  canopy: {
    id: "canopy",
    src: "/worlds/canopy/map.jpg",
    width: W,
    height: H,
    walk,
    spawn: { x: 800, y: 600 },
    portals: [
      { x: 1324, y: 520, w: 56, h: 160, to: "mart", spawn: { x: 320, y: 600 }, label: "Dino Mart" },
      { x: 700, y: 944, w: 200, h: 56, to: "forum", spawn: { x: 800, y: 320 }, label: "The Floor" },
    ],
    shards: [
      { id: "canopy-a", x: 500, y: 480 },
      { id: "canopy-b", x: 1080, y: 360 },
    ],
    npcs: [{ id: "nyla", x: 700, y: 640 }],
    inspectables: [{ id: "canopy-rail", x: 1180, y: 300, w: 80, h: 70 }],
  },
  crater: {
    id: "crater",
    src: "/worlds/crater/map.jpg",
    width: W,
    height: H,
    walk,
    spawn: { x: 800, y: 600 },
    portals: [
      { x: 220, y: 520, w: 56, h: 160, to: "mart", spawn: { x: 1280, y: 600 }, label: "Dino Mart" },
      { x: 700, y: 200, w: 200, h: 56, to: "forum", spawn: { x: 800, y: 880 }, label: "The Floor" },
    ],
    shards: [
      { id: "crater-a", x: 580, y: 680 },
      { id: "crater-b", x: 1020, y: 400 },
    ],
    npcs: [{ id: "jett", x: 840, y: 500 }],
    inspectables: [{ id: "crater-console", x: 760, y: 820, w: 100, h: 70 }],
  },
  forum: {
    id: "forum",
    src: "/worlds/forum/map.jpg",
    width: W,
    height: H,
    walk,
    spawn: { x: 800, y: 600 },
    portals: [
      { x: 700, y: 200, w: 200, h: 56, to: "canopy", spawn: { x: 800, y: 880 }, label: "The Mall" },
      { x: 1324, y: 520, w: 56, h: 160, to: "crater", spawn: { x: 320, y: 600 }, label: "The Arena" },
      { x: 700, y: 944, w: 200, h: 56, to: "mart", spawn: { x: 800, y: 320 }, label: "Dino Mart" },
    ],
    shards: [
      { id: "forum-a", x: 520, y: 560 },
      { id: "forum-b", x: 1100, y: 680 },
    ],
    npcs: [{ id: "kael", x: 800, y: 720 }],
    inspectables: [{ id: "forum-relief", x: 400, y: 280, w: 90, h: 80 }],
  },
};

export function rectsOverlap(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}
