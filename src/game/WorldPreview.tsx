import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { DISTRICTS_3D } from "./districts3d";
import type { WorldId } from "@/lib/worlds";
import { DistrictScene } from "./Explorer3D";

export function WorldPreview({ district }: { district: WorldId }) {
  const d = DISTRICTS_3D[district];
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-bg">
      <Canvas
        camera={{
          fov: 50,
          position: district === "forum" ? [9, 4.8, 11] : [10, 6.2, 14],
          near: 0.1,
          far: 90,
        }}
        dpr={[1, 1.4]}
        gl={{ antialias: true }}
      >
        <DistrictScene district={d} collected={[]} />
        <OrbitControls
          enablePan={false}
          minDistance={8}
          maxDistance={26}
          maxPolarAngle={1.35}
          autoRotate
          autoRotateSpeed={0.45}
          target={district === "forum" ? [0, 1.2, 1] : [0, 1.4, -2]}
        />
      </Canvas>
      <p className="pointer-events-none absolute bottom-3 left-3 text-xs tracking-wide text-fg/80 uppercase">
        3D walk
      </p>
    </div>
  );
}
