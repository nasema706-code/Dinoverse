import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, CanvasTexture, SRGBColorSpace, LinearFilter } from "three";
import type { Mesh } from "three";
import { useCutoutTexture } from "../textures";
import { LANE_X } from "./run-state";

const tokenCache = new Map<string, CanvasTexture>();

function circlePortrait(img: HTMLImageElement) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, size, size);
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, 118, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  const scale = Math.max(size / img.width, size / img.height) * 1.15;
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (size - w) / 2, size * 0.08 - h * 0.12, w, h);
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  map.minFilter = LinearFilter;
  map.magFilter = LinearFilter;
  map.generateMipmaps = false;
  map.needsUpdate = true;
  return map;
}

export function useCirclePortrait(src: string) {
  const [tex, setTex] = useState<CanvasTexture | null>(() => tokenCache.get(src) ?? null);
  useEffect(() => {
    if (!src || typeof Image === "undefined") {
      setTex(null);
      return;
    }
    const hit = tokenCache.get(src);
    if (hit) {
      setTex(hit);
      return;
    }
    let alive = true;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const map = circlePortrait(img);
      if (!map || !alive) return;
      tokenCache.set(src, map);
      setTex(map);
    };
    img.src = src;
    return () => {
      alive = false;
    };
  }, [src]);
  return tex;
}

export function TokenBillboard({ src, z }: { src: string; z: number }) {
  const map = useCirclePortrait(src);
  const cut = useCutoutTexture(src);
  const tex = map ?? cut?.map ?? null;
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    m.position.y = 0.95 + Math.sin(state.clock.elapsedTime * 3 + z) * 0.12;
    m.rotation.y = state.clock.elapsedTime * 1.4;
  });
  return (
    <group>
      <mesh position={[0, 0.95, 0]}>
        <torusGeometry args={[0.42, 0.045, 8, 24]} />
        <meshStandardMaterial
          color="#d4b15a"
          emissive="#7dffb3"
          emissiveIntensity={0.35}
          metalness={0.55}
          roughness={0.28}
        />
      </mesh>
      <mesh ref={ref} position={[0, 0.95, 0]}>
        <circleGeometry args={[0.38, 28]} />
        {tex ? (
          <meshStandardMaterial
            map={tex}
            transparent
            alphaTest={0.12}
            roughness={0.45}
            metalness={0.08}
            side={DoubleSide}
          />
        ) : (
          <meshStandardMaterial color="#3ecf8e" emissive="#3ecf8e" emissiveIntensity={0.6} />
        )}
      </mesh>
    </group>
  );
}

export function EnergyOrb({
  z,
  color = "#7dffb3",
  emissive = "#3ecf8e",
}: {
  z: number;
  color?: string;
  emissive?: string;
}) {
  const ref = useRef<Mesh>(null);
  const glow = useRef<Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.position.y = 0.72 + Math.sin(t * 3.2 + z) * 0.1;
      ref.current.rotation.y = t * 2.2;
      ref.current.rotation.x = t * 1.1;
    }
    if (glow.current) {
      glow.current.position.y = 0.72 + Math.sin(t * 3.2 + z) * 0.1;
      const s = 1 + Math.sin(t * 5) * 0.08;
      glow.current.scale.setScalar(s);
    }
  });
  return (
    <group>
      <mesh ref={glow} position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.28, 12, 10]} />
        <meshBasicMaterial color={emissive} transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <mesh ref={ref} position={[0, 0.72, 0]}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={1.7}
          roughness={0.18}
          metalness={0.35}
        />
      </mesh>
    </group>
  );
}

export type MushroomLook = {
  cap: string;
  emissive: string;
  stem: string;
  spot: string;
  glow: string;
};

export const HAZARD_LOOK: MushroomLook = {
  cap: "#e85d2a",
  emissive: "#c43a10",
  stem: "#f3e4c0",
  spot: "#3a2214",
  glow: "#ffb07a",
};

export const GROVE_LOOKS: MushroomLook[] = [
  { cap: "#ff6ea8", emissive: "#ff3d88", stem: "#f7ead0", spot: "#fff6ea", glow: "#ff9ec8" },
  { cap: "#7c6bff", emissive: "#5a48ff", stem: "#f3e6c8", spot: "#e8deff", glow: "#b8a8ff" },
  { cap: "#ffd24a", emissive: "#f0b400", stem: "#f6e8c4", spot: "#fff6d8", glow: "#ffe08a" },
  { cap: "#3ecf8e", emissive: "#1db87a", stem: "#efe6c8", spot: "#e8fff4", glow: "#7dffb3" },
  { cap: "#5ec8ff", emissive: "#2aa8ff", stem: "#f0e6cc", spot: "#e8f6ff", glow: "#9adfff" },
];

export function HazardMushroom({ look = HAZARD_LOOK }: { look?: MushroomLook }) {
  const spots = useMemo(
    () =>
      [
        [-0.18, 0.08],
        [0.2, 0.04],
        [0.02, -0.16],
        [-0.08, 0.2],
      ] as const,
    [],
  );
  return (
    <group>
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 0.72, 8]} />
        <meshStandardMaterial color={look.stem} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <sphereGeometry args={[0.48, 16, 12, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
        <meshStandardMaterial
          color={look.cap}
          emissive={look.emissive}
          emissiveIntensity={0.55}
          roughness={0.42}
        />
      </mesh>
      <mesh position={[0, 0.7, 0]} rotation={[Math.PI, 0, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 0.06, 16]} />
        <meshStandardMaterial color="#f7eccf" roughness={0.65} />
      </mesh>
      {spots.map(([x, z], i) => (
        <mesh key={i} position={[x, 1.02, z]}>
          <sphereGeometry args={[0.08, 8, 6]} />
          <meshStandardMaterial color={look.spot} roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[0, 1.08, 0]}>
        <sphereGeometry args={[0.14, 8, 6]} />
        <meshBasicMaterial color={look.glow} transparent opacity={0.32} />
      </mesh>
    </group>
  );
}

const ROCK = "#6a5a4a";
const ROCK_MOSS = "#3a6a3a";
const STONE = "#7a7068";
const BONE = "#efe4c8";
const BONE_DARK = "#c8b894";

export function RockBoulder() {
  return (
    <group>
      <mesh position={[0, 0.42, 0]} rotation={[0.2, 0.4, 0.1]} scale={[1, 0.82, 1.05]}>
        <dodecahedronGeometry args={[0.62, 0]} />
        <meshStandardMaterial color={ROCK} roughness={0.82} metalness={0.08} />
      </mesh>
      <mesh position={[0.18, 0.7, -0.08]} rotation={[0.5, -0.3, 0.2]} scale={[0.55, 0.4, 0.5]}>
        <dodecahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial color="#5a4c40" roughness={0.78} />
      </mesh>
      <mesh position={[-0.22, 0.55, 0.12]} rotation={[0.2, 0.8, 0]} scale={[0.4, 0.32, 0.38]}>
        <icosahedronGeometry args={[0.38, 0]} />
        <meshStandardMaterial color="#4a4036" roughness={0.85} />
      </mesh>
      <mesh position={[0.1, 0.88, 0.05]}>
        <sphereGeometry args={[0.16, 7, 6]} />
        <meshStandardMaterial color={ROCK_MOSS} roughness={0.9} />
      </mesh>
      <mesh position={[-0.16, 0.78, -0.1]}>
        <sphereGeometry args={[0.1, 6, 5]} />
        <meshStandardMaterial color={ROCK_MOSS} roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.55, 12]} />
        <meshBasicMaterial color="#031006" transparent opacity={0.35} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function StoneTunnel({ openLane }: { openLane: number }) {
  const openX = LANE_X[openLane] ?? 0;
  return (
    <group>
      {LANE_X.map((x, i) =>
        i === openLane ? null : (
          <group key={x}>
            <mesh position={[x, 0.78, 0]}>
              <boxGeometry args={[1.28, 1.56, 1.7]} />
              <meshStandardMaterial color={i % 2 ? "#6c645c" : STONE} roughness={0.72} />
            </mesh>
            <mesh position={[x, 1.52, 0]}>
              <boxGeometry args={[1.32, 0.22, 1.75]} />
              <meshStandardMaterial color="#5c544c" roughness={0.7} />
            </mesh>
          </group>
        ),
      )}
      <mesh position={[openX - 0.62, 0.7, 0]}>
        <boxGeometry args={[0.22, 1.4, 1.65]} />
        <meshStandardMaterial color={STONE} roughness={0.72} />
      </mesh>
      <mesh position={[openX + 0.62, 0.7, 0]}>
        <boxGeometry args={[0.22, 1.4, 1.65]} />
        <meshStandardMaterial color="#6c645c" roughness={0.72} />
      </mesh>
      <mesh position={[openX, 1.48, 0]}>
        <boxGeometry args={[1.5, 0.28, 1.7]} />
        <meshStandardMaterial color="#8a8076" roughness={0.62} />
      </mesh>
      <mesh position={[0, 1.62, 0]}>
        <boxGeometry args={[4.6, 0.18, 1.75]} />
        <meshStandardMaterial color="#4a443c" roughness={0.75} />
      </mesh>
      <mesh position={[openX, 1.12, 0.02]}>
        <boxGeometry args={[1.05, 0.07, 1.55]} />
        <meshStandardMaterial
          color="#3ecf8e"
          emissive="#3ecf8e"
          emissiveIntensity={0.6}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[openX, 0.7, -0.12]}>
        <boxGeometry args={[1.08, 1.28, 0.04]} />
        <meshBasicMaterial color="#0a0806" transparent opacity={0.38} />
      </mesh>
    </group>
  );
}

export function ParachuteBone({ z }: { z: number }) {
  const ref = useRef<Mesh>(null);
  const chute = useRef<Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) ref.current.rotation.y = t * 0.8 + z;
    if (chute.current) chute.current.rotation.y = Math.sin(t * 2 + z) * 0.12;
  });
  return (
    <group>
      <mesh ref={chute} position={[0, 0.55, 0]}>
        <coneGeometry args={[0.42, 0.28, 8, 1, true]} />
        <meshStandardMaterial
          color="#e24b4b"
          emissive="#8a1c1c"
          emissiveIntensity={0.25}
          side={DoubleSide}
          roughness={0.55}
        />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <coneGeometry args={[0.12, 0.08, 8]} />
        <meshStandardMaterial color="#f2f4f6" roughness={0.5} />
      </mesh>
      {[-0.22, 0, 0.22].map((x) => (
        <mesh key={x} position={[x * 0.7, 0.22, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.42, 4]} />
          <meshStandardMaterial color="#d8c8a0" roughness={0.6} />
        </mesh>
      ))}
      <group ref={ref} position={[0, 0.02, 0]}>
        <mesh rotation={[0, 0, 0.35]}>
          <capsuleGeometry args={[0.055, 0.32, 4, 8]} />
          <meshStandardMaterial color={BONE} roughness={0.45} />
        </mesh>
        <mesh position={[-0.14, 0.08, 0]}>
          <sphereGeometry args={[0.07, 8, 6]} />
          <meshStandardMaterial color={BONE} roughness={0.42} />
        </mesh>
        <mesh position={[0.16, -0.1, 0]} rotation={[0.4, 0, 0.6]}>
          <boxGeometry args={[0.12, 0.05, 0.08]} />
          <meshStandardMaterial color={BONE_DARK} roughness={0.5} />
        </mesh>
      </group>
      <mesh position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.22, 8, 6]} />
        <meshBasicMaterial color="#ffe08a" transparent opacity={0.16} depthWrite={false} />
      </mesh>
    </group>
  );
}
