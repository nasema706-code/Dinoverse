import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh, MeshBasicMaterial, Texture } from "three";
import { CanvasTexture, DoubleSide, SRGBColorSpace } from "three";
import { Box, CheapGlass } from "./kit";
import { useQuality } from "../quality";
import { useLoopingVideo } from "../textures";

const CHROME = "#c5ccd4";
const DARK = "#1c1e22";
const WOOD = "#c4a574";
const WOOD_LEG = "#1a1c1e";
const CYAN = "#5ec8ff";

/** Empty named mount for a later dinosaur mesh (slot-sec-desk, slot-ops-*, slot-dev-*, slot-rex-desk, slot-command, slot-briefing-lead). */
export function CharacterSlot({
  name,
  position,
}: {
  name: string;
  position: [number, number, number];
}) {
  return <group name={name} position={position} />;
}

export function LEDStrip({
  position,
  size,
  color = CYAN,
  rotY = 0,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
  rotY?: number;
}) {
  return (
    <mesh position={position} rotation={[0, rotY, 0]}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} />
    </mesh>
  );
}

export function ExecChair({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.04, 12]} />
        <meshStandardMaterial color={CHROME} metalness={0.82} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
        <meshStandardMaterial color={CHROME} metalness={0.8} roughness={0.22} />
      </mesh>
      <Box position={[0, 0.5, 0]} size={[0.48, 0.06, 0.48]} color={DARK} metal={0.2} rough={0.45} />
      <Box position={[0, 0.86, -0.2]} size={[0.48, 0.72, 0.07]} color={DARK} metal={0.18} rough={0.42} />
      <Box position={[0, 0.72, -0.2]} size={[0.4, 0.5, 0.03]} color="#2a2e34" metal={0.1} rough={0.55} />
      <Box position={[-0.26, 0.62, 0.02]} size={[0.05, 0.08, 0.28]} color={CHROME} metal={0.8} />
      <Box position={[0.26, 0.62, 0.02]} size={[0.05, 0.08, 0.28]} color={CHROME} metal={0.8} />
    </group>
  );
}

export function MeshChair({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.03, 10]} />
        <meshStandardMaterial color="#3a3d44" metalness={0.55} roughness={0.35} />
      </mesh>
      <Box position={[0, 0.48, 0]} size={[0.46, 0.05, 0.46]} color="#6b7078" metal={0.08} rough={0.7} />
      <Box position={[0, 0.82, -0.18]} size={[0.44, 0.62, 0.05]} color="#8a9098" metal={0.05} rough={0.72} />
    </group>
  );
}

export function HoloPanel({
  map,
  position,
  rotY = 0,
  w = 1.4,
  h = 0.9,
}: {
  map: Texture | null;
  position: [number, number, number];
  rotY?: number;
  w?: number;
  h?: number;
}) {
  const ref = useRef<Mesh>(null);
  const { settings } = useQuality();
  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh || !settings.atriumDetail) return;
    (mesh.material as MeshBasicMaterial).opacity = 0.7 + Math.sin(clock.elapsedTime * 1.5) * 0.08;
  });
  return (
    <mesh ref={ref} position={position} rotation={[0, rotY, 0]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial
        map={map ?? undefined}
        color={map ? "#ffffff" : CYAN}
        transparent
        opacity={0.74}
        toneMapped={false}
        side={DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

export function HoloKeyboard({
  map,
  position,
  rotY = 0,
}: {
  map: Texture | null;
  position: [number, number, number];
  rotY?: number;
}) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, rotY, 0]}>
      <planeGeometry args={[0.52, 0.22]} />
      <meshBasicMaterial
        map={map ?? undefined}
        color={CYAN}
        transparent
        opacity={0.55}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export function DeskProjector({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[0.05, 0.06, 0.08, 10]} />
      <meshStandardMaterial color={DARK} metalness={0.55} roughness={0.35} />
    </mesh>
  );
}

export function GlassDesk({
  position,
  rotY = 0,
  w = 1.7,
  d = 0.82,
}: {
  position: [number, number, number];
  rotY?: number;
  w?: number;
  d?: number;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {([-w / 2 + 0.08, w / 2 - 0.08] as const).map((x) =>
        ([-d / 2 + 0.08, d / 2 - 0.08] as const).map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.36, z]}>
            <cylinderGeometry args={[0.03, 0.035, 0.72, 8]} />
            <meshStandardMaterial color={CHROME} metalness={0.78} roughness={0.22} />
          </mesh>
        )),
      )}
      <mesh position={[0, 0.74, 0]}>
        <boxGeometry args={[w, 0.05, d]} />
        <CheapGlass opacity={0.28} color="#c8e6f6" />
      </mesh>
      <LEDStrip position={[0, 0.08, 0]} size={[w * 0.92, 0.02, d * 0.92]} />
    </group>
  );
}

export function WoodDesk({
  position,
  rotY = 0,
  w = 2.35,
  d = 0.86,
}: {
  position: [number, number, number];
  rotY?: number;
  w?: number;
  d?: number;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <Box position={[-w / 2 + 0.06, 0.36, 0]} size={[0.06, 0.72, d - 0.08]} color={WOOD_LEG} metal={0.4} />
      <Box position={[w / 2 - 0.06, 0.36, 0]} size={[0.06, 0.72, d - 0.08]} color={WOOD_LEG} metal={0.4} />
      <Box position={[0, 0.74, 0]} size={[w, 0.06, d]} color={WOOD} metal={0.08} rough={0.55} />
      <TroughPlanter position={[w / 2 - 0.28, 0.8, 0]} w={0.42} d={d - 0.12} />
      <Box position={[-0.15, 0.79, 0.08]} size={[0.32, 0.02, 0.22]} color={DARK} metal={0.35} />
      <mesh position={[0.22, 0.82, 0.18]}>
        <cylinderGeometry args={[0.035, 0.04, 0.1, 10]} />
        <meshStandardMaterial color="#1a1c1e" roughness={0.45} />
      </mesh>
      <Box position={[0.38, 0.8, -0.12]} size={[0.08, 0.02, 0.14]} color="#f2f4f6" />
    </group>
  );
}

export function PalmPlanter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Box position={[0, 0.22, 0]} size={[0.55, 0.44, 0.55]} color="#3a3d44" metal={0.15} rough={0.6} />
      <mesh position={[0, 0.82, 0]}>
        <sphereGeometry args={[0.28, 8, 6]} />
        <meshStandardMaterial color="#2f6a3e" roughness={0.78} />
      </mesh>
      <mesh position={[0, 1.28, 0]}>
        <sphereGeometry args={[0.22, 8, 6]} />
        <meshStandardMaterial color="#3a7a48" roughness={0.78} />
      </mesh>
      <mesh position={[0.12, 1.55, 0.04]}>
        <sphereGeometry args={[0.16, 8, 6]} />
        <meshStandardMaterial color="#2a6238" roughness={0.8} />
      </mesh>
    </group>
  );
}

const HQ_LETTERING = "/brand/dinoverse-lettering.mp4";
const HQ_BOARD_W = 5.12;
const HQ_BOARD_H = (HQ_BOARD_W * 9) / 16;

/** Animated DINOVERSE lettering on the plaza entrance marquee (16:9, gold bezel). */
export function HqLetteringBoard({
  fallback,
  position = [0, 9.55, 16.32],
}: {
  fallback: Texture | null;
  position?: [number, number, number];
}) {
  const { settings } = useQuality();
  const video = useLoopingVideo(HQ_LETTERING, settings.videoHero);
  const map = video ?? fallback;
  const plate = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 96;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#16181c";
    ctx.fillRect(0, 0, 1024, 96);
    ctx.fillStyle = "#d4af6a";
    ctx.textAlign = "center";
    ctx.font = "bold 42px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("GLOBAL HEADQUARTERS", 512, 62);
    const tex = new CanvasTexture(canvas);
    tex.colorSpace = SRGBColorSpace;
    return tex;
  }, []);
  return (
    <group position={position}>
      <Box
        position={[0, 0, -0.07]}
        size={[HQ_BOARD_W + 0.28, HQ_BOARD_H + 0.28, 0.12]}
        color="#c9a45a"
        metal={0.82}
        rough={0.24}
      />
      <Box
        position={[0, 0, -0.04]}
        size={[HQ_BOARD_W + 0.1, HQ_BOARD_H + 0.1, 0.08]}
        color="#0c0d10"
        metal={0.45}
        rough={0.38}
      />
      <LEDStrip position={[0, HQ_BOARD_H / 2 + 0.16, 0.01]} size={[HQ_BOARD_W + 0.22, 0.03, 0.03]} color="#d4af6a" />
      <LEDStrip position={[0, -HQ_BOARD_H / 2 - 0.16, 0.01]} size={[HQ_BOARD_W + 0.22, 0.03, 0.03]} color="#d4af6a" />
      {map ? (
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[HQ_BOARD_W, HQ_BOARD_H]} />
          <meshBasicMaterial map={map} toneMapped={false} />
        </mesh>
      ) : (
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[HQ_BOARD_W, HQ_BOARD_H]} />
          <meshBasicMaterial color="#0a0a0c" />
        </mesh>
      )}
      <Box
        position={[0, -HQ_BOARD_H / 2 - 0.34, -0.02]}
        size={[HQ_BOARD_W + 0.12, 0.32, 0.08]}
        color="#16181c"
        metal={0.4}
        rough={0.36}
      />
      {plate ? (
        <mesh position={[0, -HQ_BOARD_H / 2 - 0.34, 0.03]}>
          <planeGeometry args={[HQ_BOARD_W, 0.28]} />
          <meshBasicMaterial map={plate} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
}

export function TroughPlanter({
  position,
  w = 0.7,
  d = 0.32,
}: {
  position: [number, number, number];
  w?: number;
  d?: number;
}) {
  return (
    <group position={position}>
      <Box position={[0, 0.1, 0]} size={[w, 0.2, d]} color="#2a2d33" metal={0.2} rough={0.55} />
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[w - 0.08, 0.18, d - 0.08]} />
        <meshStandardMaterial color="#2f5a3a" roughness={0.82} />
      </mesh>
    </group>
  );
}

export function LandingPad({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <cylinderGeometry args={[3.6, 3.6, 0.08, 32]} />
        <meshStandardMaterial color="#2a2d33" metalness={0.45} roughness={0.38} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.09, 0]}>
        <ringGeometry args={[3.15, 3.55, 40]} />
        <meshStandardMaterial color="#d4af6a" emissive="#d4af6a" emissiveIntensity={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[1.05, 1.22, 28]} />
        <meshStandardMaterial color="#ffe7b0" emissive="#ffe7b0" emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
}

export function PlazaBench({
  position,
  rotY = 0,
}: {
  position: [number, number, number];
  rotY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <Box position={[0, 0.18, 0]} size={[1.35, 0.08, 0.42]} color="#2a2d33" metal={0.35} rough={0.4} />
      <Box position={[-0.62, 0.22, 0]} size={[0.06, 0.44, 0.4]} color={CHROME} metal={0.8} />
      <Box position={[0.62, 0.22, 0]} size={[0.06, 0.44, 0.4]} color={CHROME} metal={0.8} />
      <Box position={[0, 0.42, -0.16]} size={[1.35, 0.38, 0.06]} color="#2a2d33" metal={0.3} />
    </group>
  );
}

export function Stanchion({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.035, 0.04, 0.96, 8]} />
        <meshStandardMaterial color="#c9a45a" metalness={0.82} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0.96, 0]}>
        <sphereGeometry args={[0.055, 8, 6]} />
        <meshStandardMaterial color="#d4af6a" metalness={0.85} roughness={0.2} />
      </mesh>
    </group>
  );
}

export function Rope({
  from,
  to,
}: {
  from: [number, number, number];
  to: [number, number, number];
}) {
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const len = Math.hypot(dx, dz);
  const mid: [number, number, number] = [(from[0] + to[0]) / 2, 0.88, (from[2] + to[2]) / 2];
  const rotY = Math.atan2(dx, dz);
  return (
    <mesh position={mid} rotation={[Math.PI / 2, rotY, 0]}>
      <cylinderGeometry args={[0.018, 0.018, len, 6]} />
      <meshStandardMaterial color="#6b1c32" roughness={0.55} />
    </mesh>
  );
}

export function DirectoryTotem({
  map,
  position,
}: {
  map: Texture | null;
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <Box position={[0, 0.08, 0]} size={[0.7, 0.12, 0.5]} color="#2a2d33" metal={0.4} />
      <Box position={[0, 1.05, 0]} size={[0.12, 1.9, 0.12]} color={CHROME} metal={0.78} />
      <Box position={[0, 1.55, 0.08]} size={[0.85, 1.15, 0.06]} color="#121418" metal={0.35} />
      {map ? (
        <mesh position={[0, 1.55, 0.12]}>
          <planeGeometry args={[0.78, 1.05]} />
          <meshBasicMaterial map={map} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
}

export function Bollard({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={[position[0], 0.28, position[2]]}>
      <cylinderGeometry args={[0.08, 0.1, 0.56, 8]} />
      <meshStandardMaterial color="#c9a45a" metalness={0.7} roughness={0.32} />
    </mesh>
  );
}

export function WasteBin({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.64, 10]} />
        <meshStandardMaterial color="#2a2d33" metalness={0.45} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.64, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.04, 10]} />
        <meshStandardMaterial color="#3ecf8e" metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  );
}

export function LoungeSeat({
  position,
  rotY = 0,
}: {
  position: [number, number, number];
  rotY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <Box position={[0, 0.28, 0]} size={[0.72, 0.12, 0.7]} color="#1c1e22" metal={0.12} rough={0.55} />
      <Box position={[0, 0.52, -0.28]} size={[0.72, 0.48, 0.1]} color="#1c1e22" metal={0.12} rough={0.55} />
      <Box position={[0, 0.18, 0]} size={[0.68, 0.08, 0.66]} color="#3a2418" metal={0.08} rough={0.7} />
    </group>
  );
}

export function MarkSculpture({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Box position={[0, 0.08, 0]} size={[0.7, 0.16, 0.7]} color="#2a2d33" metal={0.45} />
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.12, 0.22, 1.1, 8]} />
        <meshStandardMaterial color="#c9a45a" metalness={0.8} roughness={0.26} />
      </mesh>
      <mesh position={[0, 1.32, -0.06]}>
        <sphereGeometry args={[0.16, 8, 6]} />
        <meshStandardMaterial color="#3a7a48" roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.28, -0.22]} rotation={[0.4, 0, 0]}>
        <coneGeometry args={[0.07, 0.22, 7]} />
        <meshStandardMaterial color="#3a7a48" roughness={0.55} />
      </mesh>
    </group>
  );
}
