import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { fitAndSit } from "./fit";
import type { Vec3 } from "./types";

/** Sit a canyon GLB on the dirt and fit one axis to nativeSize * scale. */
export function FittedCanyonModel({
  url,
  position,
  rotation = [0, 0, 0],
  nativeSize,
  scale = 1,
  fitAxis = "y",
  onReady,
}: {
  url: string;
  position: Vec3;
  rotation?: Vec3;
  nativeSize: number;
  scale?: number;
  fitAxis?: "x" | "y" | "z";
  onReady?: () => void;
}) {
  const rig = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);

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
        mat.envMapIntensity = 0.5;
        mat.needsUpdate = true;
      }
    });
    if (rig.current) {
      fitAndSit(rig.current, fitAxis, nativeSize * scale);
      onReady?.();
    }
  }, [scene, nativeSize, scale, fitAxis, rotation, onReady]);

  return (
    <group position={position}>
      <group ref={rig} rotation={rotation}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

export function preloadCanyonModel(url: string) {
  if (typeof window !== "undefined") useGLTF.preload(url);
}
