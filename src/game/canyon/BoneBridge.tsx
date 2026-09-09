import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { fitAndSit } from "./fit";
import type { Vec3 } from "./types";

const SRC = "/models/bone-bridge.glb?v=3";
/** Native Meshy long axis is ~10.77 m. JSON scale 2.55 → ~27 m chasm span. */
const NATIVE_SPAN = 10.77;

if (typeof window !== "undefined") useGLTF.preload(SRC);

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
  const rig = useRef<THREE.Group>(null);
  const { scene } = useGLTF(SRC);
  const [ready, setReady] = useState(false);

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
      fitAndSit(rig.current, "z", NATIVE_SPAN * scale);
      setReady(true);
    }
  }, [scene, scale, rotation]);

  return (
    <group position={position}>
      {ready ? null : <TuskRailStandin />}
      <group ref={rig} rotation={rotation} visible={ready}>
        <primitive object={scene} />
      </group>
    </group>
  );
}
