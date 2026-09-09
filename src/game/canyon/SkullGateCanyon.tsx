import { Canvas, useThree } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import { Link } from "@tanstack/react-router";
import { Suspense, useCallback, useEffect, useLayoutEffect, useState } from "react";
import * as THREE from "three";
import canyonJson from "@/data/skullGateCanyon.json";
import { useQuality } from "../quality";
import { BoneBridge } from "./BoneBridge";
import { BoneSpire } from "./BoneSpire";
import { CanyonBuggy } from "./CanyonBuggy";
import { CanyonGround } from "./CanyonGround";
import { CanyonLights } from "./CanyonLights";
import { FittedCanyonModel, preloadCanyonModel } from "./FittedCanyonModel";
import { FlyOrbitControls } from "./FlyOrbitControls";
import { SkullGate } from "./SkullGate";
import { Watchtower } from "./Watchtower";
import { VisionSkyDome } from "../visions/sky-dome";
import { canyonItem, type CanyonData, type Vec3 } from "./types";

const canyon = canyonJson as CanyonData;
const gate = canyonItem(canyon, "gate");
const spire = canyonItem(canyon, "spire");
const bridge = canyonItem(canyon, "bridge");
const cutout = canyonItem(canyon, "cutout");
const towerL = canyonItem(canyon, "tower-l");
const towerR = canyonItem(canyon, "tower-r");
const buggy = canyonItem(canyon, "buggy");

/** Native Meshy bounds from GLB JSON POSITION min/max. */
const GATE_NATIVE_H = 4;
const CUTOUT_NATIVE_H = 0.12;

preloadCanyonModel("/models/skull-gate.glb?v=1");
preloadCanyonModel("/models/sepia-cutout.glb?v=1");

function AimCamera({ target }: { target: Vec3 }) {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.lookAt(target[0], target[1], target[2]);
  }, [camera, target]);
  return null;
}

function CanyonWorld({ flying }: { flying: boolean }) {
  return (
    <>
      <AimCamera target={canyon.camera.target} />
      <Suspense fallback={null}>
        <group rotation={[0, Math.PI, 0]}>
          <VisionSkyDome src="/visions/skull-gate-canyon.jpg?v=7" radius={160} />
        </group>
      </Suspense>
      <CanyonLights fog={canyon.fog} />
      <CanyonGround />
      <Watchtower position={towerL.position} rotation={towerL.rotation} scale={towerL.scale} />
      <Watchtower position={towerR.position} rotation={towerR.rotation} scale={towerR.scale} />
      <CanyonBuggy position={buggy.position} rotation={buggy.rotation} scale={buggy.scale} />
      <SkullGate position={gate.position} rotation={gate.rotation} scale={1.15} />
      <Suspense fallback={null}>
        <FittedCanyonModel
          url="/models/skull-gate.glb?v=1"
          position={[14, 0, -56]}
          rotation={gate.rotation}
          nativeSize={GATE_NATIVE_H}
          scale={3.6}
        />
      </Suspense>
      <Suspense fallback={null}>
        <FittedCanyonModel
          url="/models/sepia-cutout.glb?v=1"
          position={cutout.position}
          rotation={cutout.rotation}
          nativeSize={CUTOUT_NATIVE_H}
          scale={cutout.scale ?? 70}
        />
      </Suspense>
      <Suspense fallback={null}>
        <BoneBridge position={bridge.position} rotation={bridge.rotation} scale={bridge.scale} />
      </Suspense>
      <Suspense fallback={null}>
        <BoneSpire position={spire.position} rotation={spire.rotation} scale={spire.scale} />
      </Suspense>
      <FlyOrbitControls
        target={canyon.camera.target}
        flying={flying}
        minDistance={10}
        maxDistance={140}
        maxPolarAngle={1.52}
      />
    </>
  );
}

export function SkullGateCanyon() {
  const { settings } = useQuality();
  const [flying, setFlying] = useState(false);
  const [wrap, setWrap] = useState<HTMLDivElement | null>(null);

  const canvasEl = wrap?.querySelector("canvas") ?? null;

  const enterFly = useCallback(() => {
    const canvas = wrap?.querySelector("canvas");
    if (!canvas) return;
    const lock = () => {
      try {
        const next = canvas.requestPointerLock();
        if (next && typeof (next as Promise<void>).catch === "function") {
          void (next as Promise<void>).catch(() => {});
        }
      } catch {
        /* pointer lock can fail in embedded previews */
      }
    };
    const req = canvas.requestPointerLock as typeof canvas.requestPointerLock & {
      (options?: PointerLockOptions): Promise<void> | void;
    };
    try {
      const next = req.call(canvas, { unadjustedMovement: true });
      if (next && typeof (next as Promise<void>).catch === "function") {
        void (next as Promise<void>).catch(() => lock());
        return;
      }
    } catch {
      lock();
      return;
    }
    lock();
  }, [wrap]);

  useEffect(() => {
    const onLock = () => {
      setFlying(document.pointerLockElement === canvasEl);
    };
    document.addEventListener("pointerlockchange", onLock);
    return () => document.removeEventListener("pointerlockchange", onLock);
  }, [canvasEl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "KeyF" && !e.repeat) enterFly();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enterFly]);

  return (
    <div ref={setWrap} className="relative h-dvh w-full bg-[#e2b86a]">
      <Canvas
        shadows={false}
        camera={{
          fov: canyon.camera.fov,
          position: canyon.camera.position,
          near: 0.2,
          far: canyon.camera.far,
        }}
        dpr={settings.dpr}
        gl={{
          antialias: settings.antialias,
          powerPreference: "high-performance",
          stencil: false,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.06,
        }}
        onPointerDown={(e) => {
          if (e.button === 0 && flying && document.pointerLockElement !== e.target) {
            enterFly();
          }
        }}
      >
        <AdaptiveDpr pixelated={false} />
        <CanyonWorld flying={flying} />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
        <Link
          to="/"
          className="pointer-events-auto rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-xs font-medium tracking-wide text-white/90 uppercase hover:bg-black/70"
        >
          Leave canyon
        </Link>
        <p className="rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-[10px] tracking-[0.16em] text-white/80 uppercase">
          {canyon.name}
        </p>
      </div>

      <div className="absolute right-3 bottom-3 left-3 flex flex-wrap items-end justify-between gap-2">
        <p className="max-w-md text-xs leading-snug text-white/75">
          {flying
            ? "WASD fly · A left · Space up · Q down · Shift sprint · Esc orbit"
            : "Drag to orbit · F or Fly for pointer-lock"}
        </p>
        <button
          type="button"
          onClick={enterFly}
          className="rounded-full border border-[#ff7a2a]/50 bg-black/60 px-3 py-1.5 text-xs font-medium tracking-wide text-[#ffb07a] uppercase hover:bg-black/75"
        >
          {flying ? "Flying" : "Fly"}
        </button>
      </div>
    </div>
  );
}
