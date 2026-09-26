import { useCallback, useState } from "react";
import { FittedCanyonModel } from "./FittedCanyonModel";
import type { Vec3 } from "./types";

export const BONE_BRIDGE = "/models/bone-bridge.glb?v=6";
export const BONE_BRIDGE_LOD = "/models/bone-bridge-lod1.glb?v=6";
/** Native Meshy long axis is ~10.77 m. JSON scale 2.55 → ~27 m chasm span. */
const NATIVE_SPAN = 10.77;
export const BONE_BRIDGE_LOD_DIST = 48;
const DEFAULT_ROT: Vec3 = [0, 1.57, 0];

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
  rotation = DEFAULT_ROT,
  scale = 2.55,
}: {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
}) {
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => setReady(true), []);

  return (
    <group>
      {ready ? null : (
        <group position={position}>
          <TuskRailStandin />
        </group>
      )}
      <FittedCanyonModel
        url={BONE_BRIDGE}
        lodUrl={BONE_BRIDGE_LOD}
        position={position}
        rotation={rotation}
        nativeSize={NATIVE_SPAN}
        scale={scale}
        fitAxis="z"
        lodDistance={BONE_BRIDGE_LOD_DIST}
        onReady={markReady}
      />
    </group>
  );
}
