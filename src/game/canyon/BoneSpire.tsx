import { FittedCanyonModel } from "./FittedCanyonModel";
import type { Vec3 } from "./types";

export const BONE_SPIRE = "/models/bone-spire.glb?v=6";
export const BONE_SPIRE_LOD = "/models/bone-spire-lod1.glb?v=6";
/** Native Meshy height is ~12 m. JSON scale 2.2 → ~26 m far-gate read. */
const NATIVE_H = 12;
export const BONE_SPIRE_LOD_DIST = 60;
const ZERO: Vec3 = [0, 0, 0];

/** Meshy bone spire — fitted to JSON scale so quantization cannot explode the canyon. */
export function BoneSpire({
  position,
  rotation = ZERO,
  scale = 2.2,
}: {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
}) {
  return (
    <FittedCanyonModel
      url={BONE_SPIRE}
      lodUrl={BONE_SPIRE_LOD}
      position={position}
      rotation={rotation}
      nativeSize={NATIVE_H}
      scale={scale}
      lodDistance={BONE_SPIRE_LOD_DIST}
      envMapIntensity={0.55}
    />
  );
}
