import { Detailed } from "@react-three/drei";
import { useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { detectQuality, readQualityOverride, useQuality } from "../quality";
import { useGameGLTF } from "../use-game-gltf";
import { fitAndSit } from "./fit";
import type { Vec3 } from "./types";

const SRC = "/models/bone-bridge.glb?v=5";
const LOD = "/models/bone-bridge-lod1.glb?v=5";
/** Native Meshy long axis is ~10.77 m. JSON scale 2.55 → ~27 m chasm span. */
const NATIVE_SPAN = 10.77;
const LOD_DIST = 48;

const bootQuality =
  typeof window !== "undefined" ? (readQualityOverride() ?? detectQuality()) : "mid";
if (typeof window !== "undefined") {
  useGameGLTF.preload(LOD);
  if (bootQuality !== "low") useGameGLTF.preload(SRC);
}

function TuskRailStandin() {
  return (
    <group>
      <mesh position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.4, 26]} />
        <meshStandardMaterial color="#5a4030" roughness={0.94} />
      </mesh>
      {[-1.45, 1.45].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          {[-10, -5, 0, 5, 10].map((z) => (
            <mesh key={z} position={[0, 1.6, z]} rotation={[0, 0, x > 0 ? -0.35 : 0.35]} scale={[0.28, 1, 2.4]}>
              <torusGeometry args={[1.35, 0.16, 6, 10, Math.PI]} />
              <meshStandardMaterial color="#d8c4a4" roughness={0.55} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function BridgeMesh({
  url,
  rotation,
  scale,
  onReady,
}: {
  url: string;
  rotation: Vec3;
  scale: number;
  onReady?: () => void;
}) {
  const rig = useRef<THREE.Group>(null);
  const { scene } = useGameGLTF(url);

  useLayoutEffect(() => {
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
        mat.envMapIntensity = 0.5;
        mat.needsUpdate = true;
      }
    });
    if (rig.current) {
      fitAndSit(rig.current, "z", NATIVE_SPAN * scale);
      onReady?.();
    }
  }, [scene, scale, rotation, onReady]);

  return (
    <group ref={rig} rotation={rotation}>
      <primitive object={scene} />
    </group>
  );
}

/** Meshy bone bridge — yaw 1.57 so tusks run down-canyon; fitted so quantized meshes cannot explode. */
export function BoneBridge({
  position,
  rotation = [0, 1.57, 0],
  scale = 2.55,
}: {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
}) {
  const { level } = useQuality();
  const [ready, setReady] = useState(false);
  const lowOnly = level === "low";
  const markReady = () => setReady(true);

  return (
    <group position={position}>
      {ready ? null : <TuskRailStandin />}
      <group visible={ready}>
        {lowOnly ? (
          <BridgeMesh url={LOD} rotation={rotation} scale={scale} onReady={markReady} />
        ) : (
          <Detailed distances={[0, LOD_DIST]}>
            <BridgeMesh url={SRC} rotation={rotation} scale={scale} onReady={markReady} />
            <BridgeMesh url={LOD} rotation={rotation} scale={scale} />
          </Detailed>
        )}
      </group>
    </group>
  );
}
