import { Detailed } from "@react-three/drei";
import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { useQuality } from "../quality";
import { useGameGLTF } from "../use-game-gltf";
import { fitAndSit } from "./fit";
import type { Vec3 } from "./types";

function prepScene(scene: THREE.Object3D, envMapIntensity = 0.5) {
  scene.traverse((obj) => {
    obj.castShadow = false;
    obj.receiveShadow = true;
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.frustumCulled = true;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const raw of mats) {
      if (!raw) continue;
      const mat = raw as THREE.MeshStandardMaterial;
      mat.side = THREE.FrontSide;
      mat.envMapIntensity = envMapIntensity;
      mat.needsUpdate = true;
    }
  });
}

function FittedMesh({
  url,
  rotation,
  nativeSize,
  scale,
  fitAxis,
  onReady,
}: {
  url: string;
  rotation: Vec3;
  nativeSize: number;
  scale: number;
  fitAxis: "x" | "y" | "z";
  onReady?: () => void;
}) {
  const rig = useRef<THREE.Group>(null);
  const { scene } = useGameGLTF(url);

  useLayoutEffect(() => {
    prepScene(scene);
    if (rig.current) {
      fitAndSit(rig.current, fitAxis, nativeSize * scale);
      onReady?.();
    }
  }, [scene, nativeSize, scale, fitAxis, rotation, onReady]);

  return (
    <group ref={rig} rotation={rotation}>
      <primitive object={scene} />
    </group>
  );
}

/** Sit a canyon GLB on the dirt and fit one axis to nativeSize * scale. */
export function FittedCanyonModel({
  url,
  lodUrl,
  position,
  rotation = [0, 0, 0],
  nativeSize,
  scale = 1,
  fitAxis = "y",
  lodDistance = 52,
  onReady,
}: {
  url: string;
  /** Optional far LOD1 sibling from scripts/opt-*.mjs (via gltf-opt-shared). */
  lodUrl?: string;
  position: Vec3;
  rotation?: Vec3;
  nativeSize: number;
  scale?: number;
  fitAxis?: "x" | "y" | "z";
  lodDistance?: number;
  onReady?: () => void;
}) {
  const { level } = useQuality();
  const preferLod = level === "low" && lodUrl;

  return (
    <group position={position}>
      {preferLod ? (
        <FittedMesh
          url={lodUrl}
          rotation={rotation}
          nativeSize={nativeSize}
          scale={scale}
          fitAxis={fitAxis}
          onReady={onReady}
        />
      ) : lodUrl ? (
        <Detailed distances={[0, lodDistance]}>
          <FittedMesh
            url={url}
            rotation={rotation}
            nativeSize={nativeSize}
            scale={scale}
            fitAxis={fitAxis}
            onReady={onReady}
          />
          <FittedMesh
            url={lodUrl}
            rotation={rotation}
            nativeSize={nativeSize}
            scale={scale}
            fitAxis={fitAxis}
          />
        </Detailed>
      ) : (
        <FittedMesh
          url={url}
          rotation={rotation}
          nativeSize={nativeSize}
          scale={scale}
          fitAxis={fitAxis}
          onReady={onReady}
        />
      )}
    </group>
  );
}

export function preloadCanyonModel(url: string) {
  if (typeof window !== "undefined") useGameGLTF.preload(url);
}
