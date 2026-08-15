import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { DISTRICTS_3D } from "./districts3d";
import { isDistrictWalkable, type WorldId } from "@/lib/worlds";
import { DistrictScene } from "./Explorer3D";
import { useQuality } from "./quality";
import { cn } from "@/lib/utils";

export function WorldPreview({
  district,
  variant = "embed",
}: {
  district: WorldId;
  variant?: "embed" | "stage";
}) {
  const d = DISTRICTS_3D[district];
  const forum = district === "forum";
  const walkable = isDistrictWalkable(district);
  const { settings } = useQuality();
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-[#0b1520]",
        variant === "stage" ? "h-[min(78dvh,44rem)] min-h-[22rem]" : "aspect-video",
      )}
    >
      <Canvas
        shadows={false}
        camera={{
          fov: forum ? 52 : 50,
          position: forum ? [26, 12, 38] : [10, 6.2, 14],
          near: 0.1,
          far: Math.min(settings.far + 40, forum ? 240 : 90),
        }}
        dpr={settings.dpr}
        performance={{ min: 0.7 }}
        gl={{
          antialias: settings.antialias,
          powerPreference: "high-performance",
          stencil: false,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.12,
        }}
      >
        <AdaptiveDpr pixelated={false} />
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
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
        <span className="rounded-full border border-accent/40 bg-bg/80 px-2.5 py-1 text-[10px] font-medium tracking-wide text-accent uppercase">
          {walkable ? "Live 3D" : "3D preview · under construction"}
        </span>
      </div>
      <p className="pointer-events-none absolute bottom-3 left-3 max-w-[min(100%-1.5rem,28rem)] text-xs tracking-wide text-fg/85 uppercase">
        {walkable ? "Live 3D · drag to orbit" : "Look only · drag to orbit · walking locked"}
      </p>
    </div>
  );
}
