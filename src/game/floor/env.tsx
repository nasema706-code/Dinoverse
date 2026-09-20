import { Suspense } from "react";
import { Environment, MeshReflectorMaterial, Sky } from "@react-three/drei";
import type { Texture } from "three";
import { VisionSkyDome } from "../visions/sky-dome";
import { useQuality } from "../quality";

/**
 * Paradise Floor sun — low golden-hour disc from the right so rim light
 * reads on glass/foliage and god-rays can fan across the plate.
 * Shared by Sky fill, directional lights, and atrium shadow casters.
 */
export const SUN_POS: [number, number, number] = [68, 26, 22];

/** Soft cream moon — giant pale disc matching Earth-Like Worlds plate. */
const MOON_POS: [number, number, number] = [-12, 42, -48];

function PaleMoon({ detailed }: { detailed: boolean }) {
  return (
    <group position={MOON_POS}>
      <mesh frustumCulled={false}>
        <sphereGeometry args={[22, detailed ? 32 : 16, detailed ? 24 : 12]} />
        <meshBasicMaterial color="#f7f0dc" fog={false} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh frustumCulled={false}>
        <sphereGeometry args={[26, detailed ? 24 : 12, detailed ? 16 : 10]} />
        <meshBasicMaterial
          color="#ffe9c2"
          transparent
          opacity={detailed ? 0.35 : 0.22}
          fog={false}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** Soft volumetric shafts — lightweight planes, skipped on low tier. */
export function ParadiseGodRays({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return (
    <group position={[36, 16, 6]}>
      {[
        [0.1, -0.52, 0.06, 0.09],
        [0.0, -0.45, 0.12, 0.07],
        [-0.1, -0.58, 0.04, 0.05],
      ].map(([pitch, yaw, roll, opacity], i) => (
        <mesh key={i} rotation={[pitch, yaw, roll]} frustumCulled={false}>
          <planeGeometry args={[60, 12 + i * 2]} />
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
 * Golden-hour plate + soft moon + park HDRI for glass.
 * Mid/high: equirect sky dome baked from the official still
 * (`scripts/make-paradise-sky.mjs`) — moon/islands come from the art.
 * Low: cheap drei Sky + moon mesh (no texture fetch).
 */
export function HqEnvironment() {
  const { level } = useQuality();
  const detailed = level !== "low";
  return (
    <>
      {detailed ? (
        <Suspense
          fallback={
            <Sky sunPosition={SUN_POS} turbidity={6} rayleigh={0.8} mieCoefficient={0.005} mieDirectionalG={0.85} />
          }
        >
          <VisionSkyDome src="/worlds/forum/paradise-sky.jpg" radius={170} />
        </Suspense>
      ) : (
        <>
          <Sky
            sunPosition={SUN_POS}
            turbidity={7}
            rayleigh={0.7}
            mieCoefficient={0.006}
            mieDirectionalG={0.88}
          />
          <PaleMoon detailed={false} />
        </>
      )}
      {level === "low" ? null : (
        <Suspense fallback={null}>
          <Environment
            preset="park"
            background={false}
            environmentIntensity={level === "high" ? 0.75 : 0.45}
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
