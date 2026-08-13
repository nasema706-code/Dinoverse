import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { DISTRICTS_3D } from "./districts3d";
import type { WorldId } from "@/lib/worlds";
import { DistrictScene } from "./Explorer3D";

export function WorldPreview({ district }: { district: WorldId }) {
  const d = DISTRICTS_3D[district];
  const forum = district === "forum";
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-[#0b1520]">
      <Canvas
        shadows
        camera={{
          fov: forum ? 52 : 50,
          position: forum ? [26, 12, 38] : [10, 6.2, 14],
          near: 0.1,
          far: forum ? 280 : 90,
        }}
        dpr={[1, 1.4]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
        }}
      >
        <DistrictScene district={d} collected={[]} preview />
        <OrbitControls
          enablePan={false}
          minDistance={forum ? 14 : 8}
          maxDistance={forum ? 64 : 26}
          maxPolarAngle={1.35}
          autoRotate
          autoRotateSpeed={0.4}
          target={forum ? [0, 3.2, 6] : [0, 1.4, -2]}
        />
      </Canvas>
      <p className="pointer-events-none absolute bottom-3 left-3 text-xs tracking-wide text-fg/80 uppercase">
        Live 3D
      </p>
    </div>
  );
}
