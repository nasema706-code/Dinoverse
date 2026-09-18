import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, OrbitControls } from "@react-three/drei";
import { Component, useCallback, useState, type ErrorInfo, type ReactNode } from "react";
import * as THREE from "three";
import { DISTRICTS_3D } from "./districts3d";
import { isDistrictWalkable, type WorldId } from "@/lib/worlds";
import { DistrictScene } from "./Explorer3D";
import { useQuality } from "./quality";
import { WorldPreviewSoftFail } from "./floor-soft-fail";
import { cn } from "@/lib/utils";

class PreviewBoundary extends Component<
  { resetKey: number; onFail: () => void; children: ReactNode },
  { broken: boolean }
> {
  state = { broken: false };
  static getDerivedStateFromError() {
    return { broken: true };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onFail();
  }
  componentDidUpdate(prev: { resetKey: number }) {
    if (prev.resetKey !== this.props.resetKey && this.state.broken) {
      this.setState({ broken: false });
    }
  }
  render() {
    if (this.state.broken) return null;
    return this.props.children;
  }
}

export function WorldPreview({
  district,
  variant = "embed",
  className,
}: {
  district: WorldId;
  variant?: "embed" | "stage";
  className?: string;
}) {
  const d = DISTRICTS_3D[district];
  const forum = district === "forum";
  const walkable = isDistrictWalkable(district);
  const { settings, level, setLevel } = useQuality();
  const [failed, setFailed] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const retry = useCallback((forceLow: boolean) => {
    if (forceLow) setLevel("low");
    setFailed(false);
    setResetKey((k) => k + 1);
  }, [setLevel]);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-[#0b1520]",
        variant === "stage"
          ? "h-[min(62dvh,44rem)] min-h-[16rem] sm:h-[min(78dvh,44rem)] sm:min-h-[22rem]"
          : "aspect-video",
        className,
      )}
    >
      {failed ? (
        <WorldPreviewSoftFail
          level={level}
          onRetry={() => retry(false)}
          onRetryLow={() => retry(true)}
        />
      ) : (
        <PreviewBoundary resetKey={resetKey} onFail={() => setFailed(true)}>
          <Canvas
            key={resetKey}
            style={{ width: "100%", height: "100%", display: "block" }}
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
            onCreated={({ gl }) => {
              const el = gl.domElement;
              const onLost = (event: Event) => {
                event.preventDefault();
                setFailed(true);
              };
              el.addEventListener("webglcontextlost", onLost, false);
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
        </PreviewBoundary>
      )}
      {!failed ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
            <span className="max-w-[min(100%,18rem)] rounded-full border border-accent/40 bg-bg/80 px-2.5 py-1 text-[10px] leading-snug font-medium tracking-wide text-accent uppercase">
              {walkable ? "Walkable · still being built" : "3D preview · under construction"}
            </span>
          </div>
          <p className="pointer-events-none absolute right-3 bottom-3 left-3 max-w-[min(100%-1.5rem,28rem)] text-xs leading-snug tracking-wide text-fg/85 uppercase">
            {walkable
              ? "Live 3D · walk open · city still pouring"
              : "Look only · drag to orbit · walking locked"}
          </p>
        </>
      ) : null}
    </div>
  );
}
