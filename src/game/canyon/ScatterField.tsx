import { useMemo } from "react";
import { PlacedModel, useGltfAvailable } from "./PlacedModel";
import { scatterPoses } from "./seeded";
import type { ScatterSpec } from "./types";

export function ScatterField({
  spec,
  area,
}: {
  spec: ScatterSpec;
  area: { minX: number; maxX: number; minZ: number; maxZ: number; y: number };
}) {
  const ready = useGltfAvailable(spec.url);
  const poses = useMemo(
    () => scatterPoses(spec.count, spec.seed, area, spec.scale ?? [0.7, 1.2]),
    [spec.count, spec.seed, spec.scale, area],
  );

  if (!ready) return null;

  return (
    <group>
      {poses.map((pose, i) => (
        <PlacedModel
          key={`${spec.url}-${i}`}
          url={spec.url}
          position={pose.position}
          rotation={pose.rotation}
          scale={pose.scale}
        />
      ))}
    </group>
  );
}
