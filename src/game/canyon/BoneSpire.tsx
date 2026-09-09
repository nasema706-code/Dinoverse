import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { fitAndSit } from "./fit";
import type { Vec3 } from "./types";

const SRC = "/models/bone-spire.glb?v=3";
/** Native Meshy height is ~12 m. JSON scale 2.2 → ~26 m far-gate read. */
const NATIVE_H = 12;

if (typeof window !== "undefined") useGLTF.preload(SRC);

/** Meshy bone spire — fitted to JSON scale so quantization cannot explode the canyon. */
export function BoneSpire({
  position,
  rotation = [0, 0, 0],
  scale = 2.2,
}: {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
}) {
  const rig = useRef<THREE.Group>(null);
  const { scene } = useGLTF(SRC);

  useLayoutEffect(() => {
    scene.traverse((obj) => {
      obj.castShadow = false;
      obj.receiveShadow = true;
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.frustumCulled = false;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const raw of mats) {
        if (!raw) continue;
        const mat = raw as THREE.MeshStandardMaterial;
        mat.side = THREE.FrontSide;
        mat.envMapIntensity = 0.55;
        mat.needsUpdate = true;
      }
    });
    if (rig.current) fitAndSit(rig.current, "y", NATIVE_H * scale);
  }, [scene, scale, rotation]);

  return (
    <group position={position}>
      <group ref={rig} rotation={rotation}>
        <primitive object={scene} />
      </group>
    </group>
  );
}
