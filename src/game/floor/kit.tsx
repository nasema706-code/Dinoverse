import type { ReactNode } from "react";
import { usePhoto } from "../textures";
import type { FloorDesk } from "./layout";

const WOOD = "#4a4034";
const WOOD_TOP = "#5c5042";
const METAL = "#5a5e66";
const DARK = "#2a2d33";
const STONE = "#3a3d44";
const GLASS = "#9ec4d8";

export function Box({
  position,
  size,
  color,
  metal = 0.12,
  rough = 0.62,
  emissive,
  eInt = 0,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  metal?: number;
  rough?: number;
  emissive?: string;
  eInt?: number;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        metalness={metal}
        roughness={rough}
        emissive={emissive ?? color}
        emissiveIntensity={eInt > 0 ? eInt : 0.28}
      />
    </mesh>
  );
}

export function Monitor({
  src,
  position,
  rotY = 0,
  w = 0.56,
  h = 0.34,
}: {
  src: string;
  position: [number, number, number];
  rotY?: number;
  w?: number;
  h?: number;
}) {
  const map = usePhoto(src);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0, -0.012]} rotation={[-0.08, 0, 0]}>
        <boxGeometry args={[w + 0.04, h + 0.04, 0.03]} />
        <meshStandardMaterial color={DARK} metalness={0.45} roughness={0.35} />
      </mesh>
      <mesh rotation={[-0.08, 0, 0]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={map ?? undefined} color={map ? "#fff" : "#111"} toneMapped={false} />
      </mesh>
      <Box position={[0, -h / 2 - 0.08, 0.01]} size={[0.08, 0.12, 0.06]} color={METAL} metal={0.6} />
      <Box position={[0, -h / 2 - 0.15, 0.02]} size={[0.22, 0.03, 0.14]} color={METAL} metal={0.55} />
    </group>
  );
}

export function Chair({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <Box position={[0, 0.46, 0]} size={[0.42, 0.05, 0.42]} color="#2a2c30" metal={0.25} />
      <Box position={[0, 0.78, -0.17]} size={[0.42, 0.46, 0.06]} color="#2a2c30" metal={0.25} />
      <mesh position={[0, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.36, 8]} />
        <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.03, 10]} />
        <meshStandardMaterial color={METAL} metalness={0.65} roughness={0.35} />
      </mesh>
    </group>
  );
}

export function Desk({ desk }: { desk: FloorDesk }) {
  const wide = desk.kind === "rex";
  const w = wide ? 2.15 : 1.58;
  const d = wide ? 1.05 : 0.74;
  const back = 0.78;
  const chairX = Math.sin(desk.rotY) * back;
  const chairZ = Math.cos(desk.rotY) * back;
  return (
    <group position={[desk.x, 0, desk.z]} rotation={[0, desk.rotY, 0]}>
      <Box position={[0, 0.35, 0]} size={[w - 0.12, 0.68, d - 0.1]} color={WOOD} />
      <Box position={[0, 0.72, 0]} size={[w, 0.05, d]} color={WOOD_TOP} metal={0.08} rough={0.45} />
      <Box position={[0, 0.745, 0]} size={[w - 0.04, 0.01, 0.03]} color="#3ecf8e" emissive="#3ecf8e" eInt={0.7} />
      <Monitor src={desk.screen} position={wide ? [-0.38, 1.08, -d / 2 + 0.16] : [-0.28, 1.04, -d / 2 + 0.14]} />
      <Monitor src={desk.kind === "rex" ? "/life/analysis.jpg" : desk.screen} position={wide ? [0.38, 1.08, -d / 2 + 0.16] : [0.28, 1.04, -d / 2 + 0.14]} />
      <Box position={[0, 0.76, 0.12]} size={[0.36, 0.02, 0.13]} color="#1a1b1e" metal={0.3} />
      <Box position={[0.28, 0.76, 0.16]} size={[0.06, 0.02, 0.09]} color="#1a1b1e" />
      <mesh position={[wide ? 0.82 : 0.62, 0.82, 0.08]}>
        <cylinderGeometry args={[0.035, 0.05, 0.16, 10]} />
        <meshStandardMaterial color="#d8c9a0" roughness={0.45} />
      </mesh>
    </group>
  );
}

export function DeskWithChair({ desk }: { desk: FloorDesk }) {
  const back = 0.78;
  return (
    <group>
      <Desk desk={desk} />
      <Chair
        position={[desk.x + Math.sin(desk.rotY) * back, 0, desk.z + Math.cos(desk.rotY) * back]}
        rotY={desk.rotY}
      />
    </group>
  );
}

export function Reception({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Box position={[0, 0.55, 0]} size={[3.6, 1.1, 1.05]} color={STONE} metal={0.2} />
      <Box position={[0, 1.12, 0]} size={[3.7, 0.06, 1.15]} color="#2a2c32" metal={0.35} />
      <Box position={[0, 1.16, -0.4]} size={[2.2, 0.02, 0.04]} color="#3ecf8e" emissive="#3ecf8e" eInt={0.85} />
      <Monitor src="/life/hq.jpg" position={[0.7, 1.48, -0.12]} w={0.48} h={0.28} />
      <Box position={[-1.1, 1.2, 0.1]} size={[0.7, 0.08, 0.5]} color="#1c1e22" />
    </group>
  );
}

export function ConferenceTable() {
  return (
    <group position={[9.35, 0, -6.6]}>
      <Box position={[0, 0.72, 0]} size={[1.9, 0.06, 4.2]} color={WOOD_TOP} />
      <Box position={[0, 0.36, 0]} size={[0.16, 0.72, 3.6]} color={WOOD} />
      <Chair position={[-0.2, 0, 1.1]} rotY={Math.PI / 2} />
      <Chair position={[-0.2, 0, 0]} rotY={Math.PI / 2} />
      <Chair position={[-0.2, 0, -1.1]} rotY={Math.PI / 2} />
      <Chair position={[0.2, 0, 0.55]} rotY={-Math.PI / 2} />
      <Chair position={[0.2, 0, -0.55]} rotY={-Math.PI / 2} />
    </group>
  );
}

export function CoffeeBar({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Box position={[0, 0.5, 0]} size={[1.4, 1, 0.7]} color={WOOD} />
      <Box position={[0, 1.02, 0]} size={[1.45, 0.05, 0.74]} color="#2a2c30" metal={0.4} />
      <mesh position={[-0.32, 1.18, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.22, 12]} />
        <meshStandardMaterial color="#1c1e22" metalness={0.55} roughness={0.3} />
      </mesh>
      <mesh position={[0.22, 1.16, 0.08]}>
        <cylinderGeometry args={[0.04, 0.05, 0.14, 10]} />
        <meshStandardMaterial color="#d8c9a0" roughness={0.4} />
      </mesh>
    </group>
  );
}

export function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.16, 0.13, 0.36, 10]} />
        <meshStandardMaterial color="#3a322c" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.28, 10, 8]} />
        <meshStandardMaterial color="#2f5a3a" roughness={0.8} />
      </mesh>
    </group>
  );
}

export function Column({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Box position={[0, 2.1, 0]} size={[0.48, 4.2, 0.48]} color="#2a2d33" metal={0.35} rough={0.4} />
      <Box position={[0, 0.08, 0]} size={[0.62, 0.16, 0.62]} color={STONE} />
      <Box position={[0, 4.12, 0]} size={[0.62, 0.12, 0.62]} color={STONE} />
    </group>
  );
}

export function TickerRail({ position, w = 6 }: { position: [number, number, number]; w?: number }) {
  return (
    <group position={position}>
      <Box position={[0, 0, 0]} size={[w, 0.22, 0.08]} color={DARK} metal={0.5} />
      <Box position={[0, 0, 0.02]} size={[w - 0.1, 0.12, 0.02]} color="#3ecf8e" emissive="#3ecf8e" eInt={1.1} />
    </group>
  );
}

export function WindowPane({
  position,
  size,
  rotY = 0,
}: {
  position: [number, number, number];
  size: [number, number];
  rotY?: number;
}) {
  return (
    <mesh position={position} rotation={[0, rotY, 0]}>
      <planeGeometry args={size} />
      <meshStandardMaterial
        color={GLASS}
        transparent
        opacity={0.16}
        roughness={0.05}
        metalness={0.25}
      />
    </mesh>
  );
}

export function CityView({
  src,
  position,
  size,
  rotY = 0,
}: {
  src: string;
  position: [number, number, number];
  size: [number, number];
  rotY?: number;
}) {
  const map = usePhoto(src);
  return (
    <mesh position={position} rotation={[0, rotY, 0]}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={map ?? undefined} color={map ? "#fff" : "#0a0c10"} toneMapped={false} />
    </mesh>
  );
}

export function Wall({
  position,
  size,
}: {
  position: [number, number, number];
  size: [number, number, number];
}) {
  return <Box position={position} size={size} color="#1e2025" metal={0.08} rough={0.78} />;
}

export function CeilingLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Box position={[0, 0, 0]} size={[1.4, 0.06, 0.28]} color="#2a2c30" metal={0.4} />
      <Box position={[0, -0.03, 0]} size={[1.28, 0.02, 0.18]} color="#f2eee4" emissive="#f2eee4" eInt={1.2} />
    </group>
  );
}

export function BoardScreen({
  src,
  position,
  rotY = 0,
}: {
  src: string;
  position: [number, number, number];
  rotY?: number;
}) {
  const map = usePhoto(src);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <Box position={[0, 0, -0.04]} size={[3.4, 2.05, 0.08]} color={DARK} metal={0.4} />
      <mesh>
        <planeGeometry args={[3.2, 1.85]} />
        <meshBasicMaterial map={map ?? undefined} color={map ? "#fff" : "#111"} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function Lights(): ReactNode {
  return (
    <>
      <color attach="background" args={["#0a0c10"]} />
      <fog attach="fog" args={["#1a1d24", 40, 80]} />
      <hemisphereLight args={["#e8eef6", "#4a4d52", 1.15]} />
      <ambientLight intensity={0.72} />
      <directionalLight position={[-2, 12, -14]} intensity={1.6} color="#f2f6fb" />
      <directionalLight position={[4, 7, 10]} intensity={0.7} color="#d5e0d8" />
    </>
  );
}
