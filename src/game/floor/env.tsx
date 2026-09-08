import { Suspense } from "react";
import { Environment, MeshReflectorMaterial, Sky } from "@react-three/drei";
import type { Texture } from "three";
import { useQuality } from "../quality";

/** World-space sun. Lights, sky disc, and atrium shadows all use this. */
export const SUN_POS: [number, number, number] = [46, 78, 32];

/** Day sky + city HDRI for glass. Background comes from `Sky`, not the HDRI. */
export function HqEnvironment() {
  const { level } = useQuality();
  return (
    <>
      <Sky
        sunPosition={SUN_POS}
        turbidity={2.4}
        rayleigh={0.42}
        mieCoefficient={0.0045}
        mieDirectionalG={0.8}
      />
      {level === "low" ? null : (
        <Suspense fallback={null}>
          <Environment
            preset="city"
            background={false}
            environmentIntensity={level === "high" ? 1.05 : 0.62}
            environmentRotation={[0, Math.PI * 0.28, 0]}
          />
        </Suspense>
      )}
    </>
  );
}

export function MarbleSlab({
  position,
  args,
  map,
  color = "#9aa3ad",
  reflect = false,
}: {
  position: [number, number, number];
  args: [number, number];
  map?: Texture | null;
  color?: string;
  reflect?: boolean;
}) {
  const { settings, level } = useQuality();
  const tex = map ?? undefined;
  const resolution = level === "high" ? 384 : 256;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position} receiveShadow={settings.shadows}>
      <planeGeometry args={args} />
      {reflect ? (
        <MeshReflectorMaterial
          map={tex}
          color={color}
          resolution={resolution}
          blur={[320, 96]}
          mixBlur={0.9}
          mixStrength={0.68}
          mixContrast={1.05}
          mirror={0.2}
          roughness={0.16}
          metalness={0.44}
          envMapIntensity={0.9}
          depthScale={0.65}
          minDepthThreshold={0.32}
          maxDepthThreshold={1.4}
          depthToBlurRatioBias={0.28}
          reflectorOffset={0.02}
        />
      ) : (
        <meshPhysicalMaterial
          map={tex}
          color={color}
          roughness={0.12}
          metalness={0.42}
          envMapIntensity={1.2}
          clearcoat={0.32}
          clearcoatRoughness={0.28}
        />
      )}
    </mesh>
  );
}
