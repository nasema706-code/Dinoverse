import { useMemo } from "react";
import { Batched, type BatchLook } from "../batch";
import type { Vec3 } from "./types";

const R = 1.15;

export function CrystalCluster({
  position,
  color,
  emissive,
  scale = 1,
}: {
  position: Vec3;
  color: string;
  emissive: string;
  scale?: number;
}) {
  const looks = useMemo(() => {
    const base = { color, emissive, env: 1 };
    return {
      core: { ...base, eInt: 1.55, rough: 0.16, metal: 0.28, opacity: 0.94 } satisfies BatchLook,
      big: { ...base, eInt: 1.7, rough: 0.14, metal: 0.3 } satisfies BatchLook,
      small: { ...base, eInt: 1.65, rough: 0.14, metal: 0.3 } satisfies BatchLook,
    };
  }, [color, emissive]);

  return (
    <group position={position} scale={scale}>
      <Batched shape="octa" rotation={[0.35, 0.25, 0.12]} scale={R} look={looks.core} />
      <Batched shape="octa" position={[0.72, 0.42, 0.18]} rotation={[0.2, 0.9, -0.28]} scale={R * 0.58} look={looks.big} />
      <Batched shape="octa" position={[-0.55, 0.62, -0.2]} rotation={[0.55, -0.4, 0.22]} scale={R * 0.42} look={looks.small} />
    </group>
  );
}
