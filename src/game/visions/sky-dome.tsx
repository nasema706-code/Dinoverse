import { useTexture } from "@react-three/drei";
import * as THREE from "three";

/** Inward photo sphere so orbit/fly scenes match the stills on home. */
export function VisionSkyDome({ src, radius = 92 }: { src: string; radius?: number }) {
  const map = useTexture(src);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  return (
    <mesh scale={[-1, 1, 1]} frustumCulled={false}>
      <sphereGeometry args={[radius, 48, 32]} />
      <meshBasicMaterial map={map} side={THREE.BackSide} depthWrite={false} fog={false} toneMapped={false} />
    </mesh>
  );
}
