import { Canvas, useThree } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import * as THREE from "three";
import { VISIONS, VISION_BY_ID, type Vision, type VisionId } from "@/lib/visions";
import { useQuality } from "../quality";
import { FlyOrbitControls } from "../canyon/FlyOrbitControls";
import { BoneColiseum } from "./BoneColiseum";
import { CrystalRacetrack, RaceFollow } from "./CrystalRacetrack";
import { FossilMegacity } from "./FossilMegacity";
import { NightJungle } from "./NightJungle";
import { VisionSkyDome } from "./sky-dome";

function CameraReset({ shot }: { shot: Vision }) {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(...shot.camera.position);
    camera.lookAt(...shot.camera.target);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = shot.camera.fov;
      camera.updateProjectionMatrix();
    }
  }, [camera, shot]);
  return null;
}

function VisionWorld({ id, flying }: { id: VisionId; flying: boolean }) {
  const shot = VISION_BY_ID[id];
  return (
    <>
      <VisionSkyDome src={shot.still} />
      {id === "megacity" ? <FossilMegacity /> : null}
      {id === "racetrack" ? <CrystalRacetrack /> : null}
      {id === "jungle" ? <NightJungle /> : null}
      {id === "coliseum" ? <BoneColiseum /> : null}
      <CameraReset shot={shot} />
      {shot.follow && !flying ? <RaceFollow flying={flying} /> : null}
      <FlyOrbitControls
        target={shot.camera.target}
        flying={flying}
        enableOrbit={!shot.follow}
        minDistance={shot.camera.minDistance}
        maxDistance={shot.camera.maxDistance}
        maxPolarAngle={shot.camera.maxPolarAngle}
      />
    </>
  );
}

export function VisionsTour({ shotId }: { shotId: VisionId }) {
  const shot = VISION_BY_ID[shotId];
  const navigate = useNavigate();
  const { settings } = useQuality();
  const [flying, setFlying] = useState(false);
  const [wrap, setWrap] = useState<HTMLDivElement | null>(null);
  const canvasEl = wrap?.querySelector("canvas") ?? null;

  const enterFly = useCallback(() => {
    const canvas = wrap?.querySelector("canvas");
    if (!canvas) return;
    try {
      const next = canvas.requestPointerLock();
      if (next && typeof (next as Promise<void>).catch === "function") {
        void (next as Promise<void>).catch(() => {});
      }
    } catch {
      /* embedded preview */
    }
  }, [wrap]);

  useEffect(() => {
    const onLock = () => setFlying(document.pointerLockElement === canvasEl);
    document.addEventListener("pointerlockchange", onLock);
    return () => document.removeEventListener("pointerlockchange", onLock);
  }, [canvasEl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "KeyF" && !e.repeat) enterFly();
      if (e.code === "Digit1") void navigate({ to: "/visions", search: { shot: "megacity" } });
      if (e.code === "Digit2") void navigate({ to: "/visions", search: { shot: "racetrack" } });
      if (e.code === "Digit3") void navigate({ to: "/visions", search: { shot: "jungle" } });
      if (e.code === "Digit4") void navigate({ to: "/visions", search: { shot: "coliseum" } });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enterFly, navigate]);

  return (
    <div ref={setWrap} className="relative h-dvh w-full overflow-hidden" style={{ background: shot.fog }}>
      <Canvas
        shadows={false}
        style={{ width: "100%", height: "100%" }}
        camera={{
          fov: shot.camera.fov,
          position: shot.camera.position,
          near: 0.1,
          far: 180,
        }}
        dpr={settings.dpr}
        gl={{
          antialias: settings.antialias,
          powerPreference: "high-performance",
          stencil: false,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.45,
        }}
      >
        <AdaptiveDpr pixelated={false} />
        <VisionWorld id={shotId} flying={flying} />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
        <Link
          to="/"
          className="pointer-events-auto rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-xs font-medium tracking-wide text-white/90 uppercase hover:bg-black/70"
        >
          Leave
        </Link>
        <div className="max-w-md text-right">
          <p className="rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-[10px] tracking-[0.16em] text-white/80 uppercase">
            {shot.kicker}
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute top-14 right-3 left-3 sm:top-16">
        <h1 className="font-display text-2xl font-medium tracking-tight text-white drop-shadow sm:text-4xl">
          {shot.title}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-white/75">{shot.body}</p>
      </div>

      <div className="pointer-events-none absolute right-3 bottom-3 left-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="pointer-events-auto flex flex-wrap gap-1.5">
          {VISIONS.map((v, i) => (
            <button
              key={v.id}
              type="button"
              onClick={() => void navigate({ to: "/visions", search: { shot: v.id } })}
              className={
                v.id === shotId
                  ? "rounded-full border border-[#ff7a2a]/60 bg-black/70 px-2.5 py-1 text-[10px] tracking-wide text-[#ffb07a] uppercase"
                  : "rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] tracking-wide text-white/75 uppercase hover:text-white"
              }
            >
              {i + 1} · {v.title.split(" ")[0]}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <p className="text-xs text-white/70">
            {flying
              ? "WASD fly · Esc orbit"
              : shot.follow
                ? "Tracking · F to fly · 1–4 shots"
                : "Drag to orbit · F fly · 1–4 shots"}
          </p>
          <button
            type="button"
            onClick={enterFly}
            className="pointer-events-auto rounded-full border border-[#ff7a2a]/50 bg-black/60 px-3 py-1.5 text-xs font-medium tracking-wide text-[#ffb07a] uppercase hover:bg-black/75"
          >
            {flying ? "Flying" : "Fly"}
          </button>
        </div>
      </div>
    </div>
  );
}
