import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useCallback, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { detectQuality, readQualityOverride, useQuality } from "../quality";
import { useGameGLTF } from "../use-game-gltf";
import { fitAndSit } from "./fit";
import type { Vec3 } from "./types";

const ZERO: Vec3 = [0, 0, 0];
/** Swap back to the near model only once the camera is this much closer than lodDistance. */
const HYSTERESIS = 0.85;

const prepared = new WeakSet<THREE.Object3D>();
const anchor = new THREE.Vector3();

function prepScene(scene: THREE.Object3D, envMapIntensity: number) {
  if (prepared.has(scene)) return;
  prepared.add(scene);
  scene.traverse((obj) => {
    obj.castShadow = false;
    obj.receiveShadow = true;
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.frustumCulled = true;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const raw of mats) {
      if (!raw) continue;
      const mat = raw as THREE.MeshStandardMaterial;
      mat.side = THREE.FrontSide;
      mat.envMapIntensity = envMapIntensity;
    }
  });
}

type FitProps = {
  rotation: Vec3;
  nativeSize: number;
  scale: number;
  fitAxis: "x" | "y" | "z";
  envMapIntensity: number;
};

function FittedMesh({ url, rotation, nativeSize, scale, fitAxis, envMapIntensity, onReady }: FitProps & { url: string; onReady?: () => void }) {
  const rig = useRef<THREE.Group>(null);
  const { scene } = useGameGLTF(url);
  const [rx, ry, rz] = rotation;

  useLayoutEffect(() => {
    prepScene(scene, envMapIntensity);
    if (rig.current) {
      fitAndSit(rig.current, fitAxis, nativeSize * scale);
      onReady?.();
    }
  }, [scene, envMapIntensity, nativeSize, scale, fitAxis, rx, ry, rz, onReady]);

  return (
    <group ref={rig} rotation={[rx, ry, rz]}>
      <primitive object={scene} />
    </group>
  );
}

function isFar(from: THREE.Vector3 | Vec3, position: Vec3, lodDistance: number) {
  const [x, y, z] = Array.isArray(from) ? from : [from.x, from.y, from.z];
  return Math.hypot(x - position[0], y - position[1], z - position[2]) > lodDistance;
}

const bootLow = typeof window !== "undefined" && (readQualityOverride() ?? detectQuality()) === "low";

/** Warm only the level the opening camera will actually show. */
export function preloadCanyonModel(
  url: string,
  lod?: { lodUrl: string; position: Vec3; lodDistance: number; camera: Vec3 },
) {
  if (typeof window === "undefined") return;
  if (!lod) {
    useGameGLTF.preload(url);
    return;
  }
  const far = bootLow || isFar(lod.camera, lod.position, lod.lodDistance);
  useGameGLTF.preload(far ? lod.lodUrl : url);
}

/**
 * Sit a canyon GLB on the dirt and fit one axis to nativeSize * scale.
 * With lodUrl, only one level is loaded at a time: the far model beyond
 * lodDistance (always on low quality), the near one inside it.
 */
export function FittedCanyonModel({
  url,
  lodUrl,
  position,
  rotation = ZERO,
  nativeSize,
  scale = 1,
  fitAxis = "y",
  lodDistance = 52,
  envMapIntensity = 0.5,
  onReady,
}: {
  url: string;
  lodUrl?: string;
  position: Vec3;
  rotation?: Vec3;
  nativeSize: number;
  scale?: number;
  fitAxis?: "x" | "y" | "z";
  lodDistance?: number;
  envMapIntensity?: number;
  onReady?: () => void;
}) {
  const { level } = useQuality();
  const camera = useThree((s) => s.camera);
  const [far, setFar] = useState(() => isFar(camera.position, position, lodDistance));
  const farRef = useRef(far);

  useFrame(() => {
    if (!lodUrl || level === "low") return;
    const d = camera.position.distanceTo(anchor.set(position[0], position[1], position[2]));
    const next = farRef.current ? d > lodDistance * HYSTERESIS : d > lodDistance;
    if (next !== farRef.current) {
      farRef.current = next;
      setFar(next);
    }
  });

  const want = lodUrl && (level === "low" || far) ? lodUrl : url;
  const [shown, setShown] = useState<string | null>(null);
  const handleReady = useCallback(() => {
    setShown(want);
    onReady?.();
  }, [want, onReady]);

  const fit: FitProps = { rotation, nativeSize, scale, fitAxis, envMapIntensity };

  return (
    <group position={position}>
      <Suspense fallback={shown && shown !== want ? <FittedMesh url={shown} {...fit} /> : null}>
        <FittedMesh url={want} {...fit} onReady={handleReady} />
      </Suspense>
    </group>
  );
}
