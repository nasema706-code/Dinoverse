export type Vec3 = [number, number, number];

export type Placement = {
  url: string;
  position: Vec3;
  rotation?: Vec3;
  scale?: number | Vec3;
};

export type ScatterSpec = {
  url: string;
  count: number;
  seed: number;
  scale?: [number, number];
};

export type CanyonItem = {
  id: string;
  model?: string;
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
};

export type CanyonData = {
  name: string;
  camera: { position: Vec3; target: Vec3; fov: number; far: number };
  fog: { color: string; near: number; far: number };
  items: CanyonItem[];
};

export function canyonItem(data: CanyonData, id: string): CanyonItem {
  const found = data.items.find((item) => item.id === id);
  if (!found) throw new Error(`Skull Gate Canyon missing item "${id}"`);
  return found;
}
