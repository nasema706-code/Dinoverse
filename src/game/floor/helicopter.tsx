import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { HELI_PAD } from "./layout";
import { heliLive } from "./heli-live";

const SRC = "/models/helicopter.glb?v=3";
/** Span the pad like the old block heli (~6.4 m rotor-to-tail). Native XZ is ~15.6 m. */
const LENGTH = 6.4;
/** Model nose +Z vs explorer look −Z. */
const FACE_YAW = Math.PI;
/** Three.js strips dots from glTF names (Empty.001_83 → Empty001_83). */
function hubKey(name: string) {
  return name.toLowerCase().replace(/[.\s]/g, "");
}

/** Inner hub empties — blades hang on local Y. Do not spin blade meshes. */
const INNER_HUBS = new Set(["empty001_83", "empty002_40"]);
/** Sketchfab animation targets (fallback if inner empties are missing). */
const OUTER_HUBS = new Set(["empty_84", "empty003_41"]);

useGLTF.preload(SRC);

function localBox(obj: THREE.Object3D) {
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj);
  if (obj.parent) {
    box.applyMatrix4(obj.parent.matrixWorld.clone().invert());
  }
  return box;
}

function sitOnPad(root: THREE.Object3D, length: number) {
  root.scale.set(1, 1, 1);
  root.position.set(0, 0, 0);
  const box = localBox(root);
  const size = box.getSize(new THREE.Vector3());
  const span = Math.max(size.x, size.z);
  if (span < 1e-5) return;
  root.scale.multiplyScalar(length / span);
  const fitted = localBox(root);
  const center = fitted.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y -= fitted.min.y;
  root.position.y += 0.12;
}

function collectRotorHubs(scene: THREE.Object3D) {
  const inner: THREE.Object3D[] = [];
  const outer: THREE.Object3D[] = [];
  scene.traverse((obj) => {
    const n = hubKey(obj.name);
    if (INNER_HUBS.has(n)) inner.push(obj);
    else if (OUTER_HUBS.has(n)) outer.push(obj);
  });
  if (inner.length >= 2) return inner;
  if (outer.length) return outer;
  return inner;
}

function isTailHub(name: string) {
  const n = hubKey(name);
  return n.startsWith("empty002") || n.startsWith("empty003");
}

/** Roof helicopter — parked on the pad, then follows flight pose when boarded. */
export function Helicopter({ position: _position }: { position: [number, number, number] }) {
  const root = useRef<THREE.Group>(null);
  const rig = useRef<THREE.Group>(null);
  const rotors = useRef<THREE.Object3D[]>([]);
  const { scene } = useGLTF(SRC);

  useLayoutEffect(() => {
    scene.traverse((obj) => {
      obj.castShadow = true;
      obj.receiveShadow = true;
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.frustumCulled = false;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const raw of mats) {
        if (!raw) continue;
        const mat = raw as THREE.MeshStandardMaterial;
        mat.side = THREE.DoubleSide;
        mat.transparent = false;
        mat.opacity = 1;
        mat.depthWrite = true;
        mat.needsUpdate = true;
      }
    });
    rotors.current = collectRotorHubs(scene);
    if (rig.current) sitOnPad(rig.current, LENGTH);
  }, [scene]);

  useFrame((_, dt) => {
    const node = root.current;
    if (!node) return;
    node.position.set(heliLive.x, heliLive.y, heliLive.z);
    node.rotation.order = "YXZ";
    node.rotation.y = heliLive.yaw + FACE_YAW;
    node.rotation.x = heliLive.pitch;
    node.rotation.z = heliLive.roll;
    const spin = heliLive.boarded ? 34 : 1.15;
    for (const rotor of rotors.current) {
      rotor.rotateY(dt * spin * (isTailHub(rotor.name) ? 1.55 : 1));
    }
  });

  return (
    <group
      ref={root}
      position={[HELI_PAD.x, HELI_PAD.y, HELI_PAD.z]}
      userData={{ floorHeli: true }}
      onPointerDown={(e) => {
        e.stopPropagation();
        heliLive.absorbClick = true;
        if (!heliLive.boarded) heliLive.boardRequest = true;
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <group ref={rig}>
        <primitive object={scene} />
      </group>
    </group>
  );
}
