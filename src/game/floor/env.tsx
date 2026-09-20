import { Suspense } from "react";
import { Environment, MeshReflectorMaterial, Sky } from "@react-three/drei";
import type { Texture } from "three";
import { useQuality } from "../quality";

/**
 * Paradise Floor sun — low golden-hour disc from the right so rim light
 * reads on glass/foliage and god-rays can fan across the plate.
 * Shared by Sky, directional lights, and atrium shadow casters.
 */
export const SUN_POS: [number, number, number] = [68, 26, 22];

/** Soft cream moon — giant pale disc matching Earth-Like Worlds plate. */
const MOON_POS: [number, number, number] = [-38, 52, -70];

function PaleMoon({ detailed }: { detailed: boolean }) {
  return (
    <group position={MOON_POS}>
      <mesh frustumCulled={false}>
        <sphereGeometry args={[14, detailed ? 32 : 16, detailed ? 24 : 12]} />
        <meshBasicMaterial color="#f3ead4" fog={false} toneMapped={false} depthWrite={false} />
      </mesh>
      {detailed ? (
        <mesh frustumCulled={false}>
          <sphereGeometry args={[16.5, 24, 16]} />
          <meshBasicMaterial
            color="#ffe9c2"
            transparent
            opacity={0.22}
            fog={false}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      ) : null}
    </group>
  );
}

/** Soft volumetric shafts — lightweight planes, skipped on low tier. */
export function ParadiseGodRays({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return (
    <group position={[42, 18, 8]}>
      {[
        [0.12, -0.55, 0.08, 0.055],
        [0.02, -0.48, 0.14, 0.04],
        [-0.08, -0.62, 0.05, 0.032],
      ].map(([pitch, yaw, roll, opacity], i) => (
        <mesh key={i} rotation={[pitch, yaw, roll]} frustumCulled={false}>
          <planeGeometry args={[54, 10 + i * 2]} />
          <meshBasicMaterial
            color="#ffdfad"
            transparent
            opacity={opacity}
            depthWrite={false}
            fog={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Golden-hour sky + soft moon + park HDRI for glass.
 * Background comes from `Sky` (and moon), not the HDRI.
 */
export function HqEnvironment() {
  const { level } = useQuality();
  const detailed = level !== "low";
  return (
    <>
      <Sky
        sunPosition={SUN_POS}
        turbidity={8.5}
        rayleigh={0.55}
        mieCoefficient={0.006}
        mieDirectionalG={0.88}
      />
      <PaleMoon detailed={detailed} />
      {level === "low" ? null : (
        <Suspense fallback={null}>
          <Environment
            preset="park"
            background={false}
            environmentIntensity={level === "high" ? 0.92 : 0.55}
            environmentRotation={[0, Math.PI * 0.18, 0]}
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
