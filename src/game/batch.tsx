import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type Vec3 = [number, number, number];

export type BatchShape = "box" | "dodeca" | "octa" | "cone3" | "cone4" | "cone5" | "cyl6" | "cyl8" | "cyl12" | "sphere";

export type BatchLook = {
  color: string;
  metal?: number;
  rough?: number;
  emissive?: string;
  eInt?: number;
  env?: number;
  opacity?: number;
  basic?: boolean;
  map?: THREE.Texture | null;
};

function makeGeometry(shape: BatchShape): THREE.BufferGeometry {
  switch (shape) {
    case "box":
      return new THREE.BoxGeometry(1, 1, 1);
    case "dodeca":
      return new THREE.DodecahedronGeometry(1, 0);
    case "octa":
      return new THREE.OctahedronGeometry(1, 0);
    case "cone3":
      return new THREE.ConeGeometry(1, 1, 3);
    case "cone4":
      return new THREE.ConeGeometry(1, 1, 4);
    case "cone5":
      return new THREE.ConeGeometry(1, 1, 5);
    case "cyl6":
      return new THREE.CylinderGeometry(1, 1, 1, 6);
    case "cyl8":
      return new THREE.CylinderGeometry(1, 1, 1, 8);
    case "cyl12":
      return new THREE.CylinderGeometry(1, 1, 1, 12);
    case "sphere":
      return new THREE.SphereGeometry(1, 10, 8);
  }
}

function makeMaterial(look: BatchLook): THREE.Material {
  const opacity = look.opacity ?? 1;
  const transparent = opacity < 1;
  if (look.basic) {
    return new THREE.MeshBasicMaterial({ color: look.color, map: look.map ?? null, transparent, opacity, toneMapped: false });
  }
  const eInt = look.eInt ?? 0;
  const mat = new THREE.MeshStandardMaterial({
    color: look.color,
    metalness: look.metal ?? 0,
    roughness: look.rough ?? 1,
    map: look.map ?? null,
    emissive: eInt > 0 ? (look.emissive ?? look.color) : "#000000",
    emissiveIntensity: eInt,
    transparent,
    opacity,
  });
  if (look.env !== undefined) mat.envMapIntensity = look.env;
  return mat;
}

function lookKey(shape: BatchShape, l: BatchLook) {
  return [shape, l.color, l.metal ?? 0, l.rough ?? 1, l.emissive ?? "", l.eInt ?? 0, l.env ?? "", l.opacity ?? 1, l.basic ? 1 : 0, l.map?.uuid ?? ""].join("|");
}

type Item = { anchor: THREE.Object3D; scale: Vec3 };

type Bucket = {
  shape: BatchShape;
  look: BatchLook;
  items: Map<number, Item>;
  mesh: THREE.InstancedMesh | null;
  material: THREE.Material | null;
};

class Batcher {
  root: THREE.Object3D | null = null;
  shadows = false;
  private buckets = new Map<string, Bucket>();
  private geometries = new Map<BatchShape, THREE.BufferGeometry>();
  private dirty = new Set<Bucket>();
  private nextId = 1;
  private scratch = new THREE.Matrix4();
  private rootInv = new THREE.Matrix4();
  private scaleM = new THREE.Matrix4();

  add(shape: BatchShape, look: BatchLook, item: Item) {
    const key = lookKey(shape, look);
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = { shape, look, items: new Map(), mesh: null, material: null };
      this.buckets.set(key, bucket);
    }
    const id = this.nextId++;
    bucket.items.set(id, item);
    this.dirty.add(bucket);
    const b = bucket;
    return () => {
      b.items.delete(id);
      this.dirty.add(b);
    };
  }

  setShadows(on: boolean) {
    this.shadows = on;
    for (const b of this.buckets.values()) {
      if (!b.mesh) continue;
      b.mesh.castShadow = on;
      b.mesh.receiveShadow = on;
    }
  }

  flush() {
    const root = this.root;
    if (!root || this.dirty.size === 0) return;
    root.updateWorldMatrix(true, false);
    this.rootInv.copy(root.matrixWorld).invert();
    for (const b of this.dirty) this.rebuild(b, root);
    this.dirty.clear();
  }

  private geometry(shape: BatchShape) {
    let g = this.geometries.get(shape);
    if (!g) {
      g = makeGeometry(shape);
      this.geometries.set(shape, g);
    }
    return g;
  }

  private rebuild(b: Bucket, root: THREE.Object3D) {
    const n = b.items.size;
    if (!b.material) b.material = makeMaterial(b.look);
    if (!b.mesh || b.mesh.instanceMatrix.count < n) {
      if (b.mesh) {
        root.remove(b.mesh);
        b.mesh.dispose();
      }
      const capacity = Math.max(8, Math.ceil(n * 1.25));
      b.mesh = new THREE.InstancedMesh(this.geometry(b.shape), b.material, capacity);
      b.mesh.castShadow = this.shadows;
      b.mesh.receiveShadow = this.shadows;
      root.add(b.mesh);
    }
    const mesh = b.mesh;
    let i = 0;
    for (const { anchor, scale } of b.items.values()) {
      anchor.updateWorldMatrix(true, false);
      this.scaleM.makeScale(scale[0], scale[1], scale[2]);
      this.scratch.multiplyMatrices(this.rootInv, anchor.matrixWorld).multiply(this.scaleM);
      mesh.setMatrixAt(i++, this.scratch);
    }
    mesh.count = n;
    mesh.visible = n > 0;
    mesh.instanceMatrix.needsUpdate = true;
    if (n > 0) mesh.computeBoundingSphere();
  }

  dispose() {
    for (const b of this.buckets.values()) {
      if (b.mesh) {
        b.mesh.removeFromParent();
        b.mesh.dispose();
      }
      b.material?.dispose();
    }
    for (const g of this.geometries.values()) g.dispose();
    this.buckets.clear();
    this.geometries.clear();
    this.dirty.clear();
  }
}

const BatchCtx = createContext<Batcher | null>(null);

/**
 * Collapses every <Batched> below it into one InstancedMesh per shape + look.
 * Transforms are captured when a piece mounts or its own props change, so only
 * static geometry belongs here — wrap animated subtrees in <NoBatch>.
 */
export function StaticBatch({ shadows = false, children }: { shadows?: boolean; children: ReactNode }) {
  const batcher = useMemo(() => new Batcher(), []);
  const root = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    batcher.root = root.current;
  }, [batcher]);

  useEffect(() => {
    batcher.setShadows(shadows);
  }, [batcher, shadows]);

  useEffect(() => () => batcher.dispose(), [batcher]);

  useFrame(() => batcher.flush());

  return (
    <group ref={root}>
      <BatchCtx.Provider value={batcher}>{children}</BatchCtx.Provider>
    </group>
  );
}

export function NoBatch({ children }: { children: ReactNode }) {
  return <BatchCtx.Provider value={null}>{children}</BatchCtx.Provider>;
}

export function useInBatch() {
  return useContext(BatchCtx) !== null;
}

type BatchedProps = {
  shape: BatchShape;
  look: BatchLook;
  position?: Vec3;
  rotation?: Vec3;
  /** Scales the unit shape: box = size, dodeca/octa/sphere = radius, cone/cyl = [radius, height, radius]. */
  scale?: Vec3 | number;
  castShadow?: boolean;
  receiveShadow?: boolean;
};

const ZERO: Vec3 = [0, 0, 0];

function BatchedPiece({ batcher, shape, look, position = ZERO, rotation = ZERO, scale }: BatchedProps & { batcher: Batcher }) {
  const anchor = useRef<THREE.Group>(null);
  const s: Vec3 = typeof scale === "number" ? [scale, scale, scale] : (scale ?? [1, 1, 1]);
  const key = lookKey(shape, look);

  useLayoutEffect(() => {
    const a = anchor.current;
    if (!a) return;
    a.updateMatrix();
    return batcher.add(shape, look, { anchor: a, scale: [s[0], s[1], s[2]] });
    // look is captured by key; positional props by value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batcher, key, position[0], position[1], position[2], rotation[0], rotation[1], rotation[2], s[0], s[1], s[2]]);

  return <group ref={anchor} position={position} rotation={rotation} matrixAutoUpdate={false} />;
}

function SoloPiece({ shape, look, position, rotation, scale, castShadow, receiveShadow }: BatchedProps) {
  const geometry = useMemo(() => makeGeometry(shape), [shape]);
  const key = lookKey(shape, look);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const material = useMemo(() => makeMaterial(look), [key]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    />
  );
}

/** A static primitive that instances itself inside <StaticBatch>, or renders as a plain mesh outside one. */
export function Batched(props: BatchedProps) {
  const batcher = useContext(BatchCtx);
  return batcher ? <BatchedPiece {...props} batcher={batcher} /> : <SoloPiece {...props} />;
}
