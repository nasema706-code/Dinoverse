import type { ReactNode } from "react";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import type { Group, Texture } from "three";
import { DoubleSide } from "three";
import { usePhoto } from "../textures";
import { useQuality } from "../quality";
import type { FloorDesk } from "./layout";

const WOOD = "#4a4034";
const WOOD_TOP = "#5c5042";
const METAL = "#5a5e66";
const DARK = "#2a2d33";
const STONE = "#3a3d44";
const GLASS = "#9ec4d8";

export function CheapGlass({
  opacity = 0.22,
  color = "#d4eefc",
}: {
  opacity?: number;
  color?: string;
}) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={0.06}
      metalness={0.05}
      clearcoat={0.72}
      clearcoatRoughness={0.14}
      transparent
      opacity={opacity}
      side={DoubleSide}
      depthWrite={false}
      envMapIntensity={0.55}
    />
  );
}

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
  const { settings } = useQuality();
  return (
    <mesh position={position} castShadow={settings.shadows} receiveShadow={settings.shadows}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        metalness={metal}
        roughness={rough}
        emissive={eInt > 0 ? (emissive ?? color) : "#000000"}
        emissiveIntensity={eInt}
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
      <Box position={[0, 6.1, 0]} size={[0.48, 12.2, 0.48]} color="#2a2d33" metal={0.35} rough={0.4} />
      <Box position={[0, 0.08, 0]} size={[0.62, 0.16, 0.62]} color={STONE} />
      <Box position={[0, 6.05, 0]} size={[0.7, 0.1, 0.7]} color={STONE} />
      <Box position={[0, 12.05, 0]} size={[0.62, 0.12, 0.62]} color={STONE} />
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
  const { settings } = useQuality();
  return (
    <>
      <color attach="background" args={["#8ec4ea"]} />
      <fog attach="fog" args={["#b9d6ee", settings.fogNear, settings.fogFar]} />
      <hemisphereLight args={["#fff6dd", "#8aaeb8", 0.95]} />
      <ambientLight intensity={settings.extraLights ? 0.72 : 0.92} />
      <directionalLight
        position={[32, 48, 22]}
        intensity={settings.extraLights ? 3.6 : 2.85}
        color="#fff1c8"
        castShadow={settings.shadows}
        shadow-mapSize={settings.shadows ? [512, 512] : [256, 256]}
        shadow-camera-near={4}
        shadow-camera-far={90}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
      />
      <directionalLight position={[-24, 22, -16]} intensity={settings.extraLights ? 1.05 : 0.72} color="#c5dff2" />
      {settings.contactShadows ? (
        <ContactShadows frames={1} position={[0, 0.03, 2]} opacity={0.22} scale={40} blur={1.6} far={10} />
      ) : null}
    </>
  );
}

export function LampPost({ position }: { position: [number, number, number] }) {
  const { settings } = useQuality();
  return (
    <group position={position}>
      <mesh position={[0, 1.6, 0]} castShadow={settings.shadows}>
        <cylinderGeometry args={[0.06, 0.08, 3.2, 8]} />
        <meshStandardMaterial color="#1c2228" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 3.28, 0]}>
        <sphereGeometry args={[0.16, 10, 8]} />
        <meshStandardMaterial color="#ffe7b0" emissive="#ffe7b0" emissiveIntensity={2.2} />
      </mesh>
      {settings.extraLights ? (
        <pointLight position={[0, 3.1, 0]} intensity={1.1} distance={9} color="#ffd9a0" />
      ) : null}
    </group>
  );
}

export function GlassCurtain({
  position,
  size,
  rotY = 0,
}: {
  position: [number, number, number];
  size: [number, number];
  rotY?: number;
}) {
  const [w, h] = size;
  const { settings } = useQuality();
  const cols = Math.max(3, Math.round(w / (settings.extraProps ? 2.4 : 3.4)));
  const rows = Math.max(2, Math.round(h / (settings.extraProps ? 3.2 : 4.2)));
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <CheapGlass opacity={0.18} />
      </mesh>
      {cols > 0
        ? Array.from({ length: cols + 1 }, (_, i) => (
            <Box
              key={`mullion-${i}`}
              position={[-w / 2 + (i * w) / cols, 0, 0]}
              size={[0.07, h, 0.07]}
              color="#c9d4dc"
              metal={0.82}
              rough={0.22}
            />
          ))
        : null}
      {rows > 0
        ? Array.from({ length: rows + 1 }, (_, i) => (
            <Box
              key={`rail-${i}`}
              position={[0, -h / 2 + (i * h) / rows, 0]}
              size={[w, 0.06, 0.07]}
              color="#c9d4dc"
              metal={0.82}
              rough={0.22}
            />
          ))
        : null}
    </group>
  );
}

export function GlassFacade({
  position,
  size,
}: {
  position: [number, number, number];
  size: [number, number, number];
}) {
  const [sx, sy, sz] = size;
  const alongX = sx >= sz;
  return (
    <GlassCurtain
      position={position}
      size={alongX ? [sx, sy] : [sz, sy]}
      rotY={alongX ? 0 : Math.PI / 2}
    />
  );
}

export function HoloPlate({
  map,
  position,
  rotY = 0,
  w = 2.4,
  h = 1.5,
}: {
  map: Texture | null;
  position: [number, number, number];
  rotY?: number;
  w?: number;
  h?: number;
}) {
  return (
    <mesh position={position} rotation={[0, rotY, 0]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial
        map={map ?? undefined}
        color={map ? "#ffffff" : "#7ec8ff"}
        transparent
        opacity={0.78}
        toneMapped={false}
        side={2}
      />
    </mesh>
  );
}

export function ElevatorCore({ position }: { position: [number, number, number] }) {
  const { settings } = useQuality();
  return (
    <group position={position}>
      <mesh position={[0, 6, 0]}>
        <cylinderGeometry args={[0.72, 0.72, 12, 16]} />
        <CheapGlass opacity={0.28} color="#9ec8dc" />
      </mesh>
      {settings.extraProps ? (
        <mesh position={[0, 6, 0]}>
          <cylinderGeometry args={[0.78, 0.78, 12, 8, 1, true]} />
          <meshStandardMaterial color="#4a5560" metalness={0.7} roughness={0.3} wireframe />
        </mesh>
      ) : null}
    </group>
  );
}

function RotorDisc() {
  const { settings } = useQuality();
  if (!settings.extraProps) return null;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[3.5, 24]} />
      <meshBasicMaterial color="#9aa3ad" transparent opacity={0.07} depthWrite={false} />
    </mesh>
  );
}

function MainRotor() {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 14;
  });
  return (
    <group position={[0, 2.22, 0.15]}>
      <mesh>
        <cylinderGeometry args={[0.12, 0.16, 0.55, 10]} />
        <meshStandardMaterial color="#1a1c20" metalness={0.7} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.1, 12]} />
        <meshStandardMaterial color="#2a2d33" metalness={0.75} roughness={0.25} />
      </mesh>
      <group ref={ref} position={[0, 0.38, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} rotation={[0.03, (i * Math.PI) / 2, 0]}>
            <mesh position={[1.72, 0, 0]} castShadow>
              <boxGeometry args={[3.44, 0.035, 0.18]} />
              <meshStandardMaterial color="#c5ccd4" metalness={0.55} roughness={0.28} />
            </mesh>
          </group>
        ))}
        <RotorDisc />
      </group>
    </group>
  );
}

function TailRotor() {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.x += dt * 28;
  });
  return (
    <group position={[0.08, 1.55, 3.62]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.28, 8]} />
        <meshStandardMaterial color="#1a1c20" metalness={0.7} roughness={0.28} />
      </mesh>
      <group ref={ref} position={[0.16, 0, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} rotation={[(i * Math.PI) / 2, 0, 0]}>
            <mesh position={[0, 0.42, 0]}>
              <boxGeometry args={[0.03, 0.84, 0.1]} />
              <meshStandardMaterial color="#c5ccd4" metalness={0.55} roughness={0.28} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

export function Helicopter({ position }: { position: [number, number, number] }) {
  const { settings } = useQuality();
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0.2]} receiveShadow>
        <circleGeometry args={[4.4, 40]} />
        <meshStandardMaterial color="#14161a" metalness={0.35} roughness={0.48} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0.2]}>
        <ringGeometry args={[3.85, 4.2, 48]} />
        <meshStandardMaterial color="#3ecf8e" emissive="#3ecf8e" emissiveIntensity={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0.2]}>
        <ringGeometry args={[1.15, 1.35, 28]} />
        <meshStandardMaterial color="#d4af6a" emissive="#d4af6a" emissiveIntensity={0.7} />
      </mesh>
      <Box position={[0, 0.05, 0.2]} size={[0.28, 0.02, 1.7]} color="#d4af6a" emissive="#d4af6a" eInt={0.8} />
      <Box position={[0, 0.05, 0.2]} size={[1.7, 0.02, 0.28]} color="#d4af6a" emissive="#d4af6a" eInt={0.8} />

      {([-0.62, 0.62] as const).map((x) => (
        <group key={x}>
          <Box position={[x, 0.12, 0.05]} size={[0.08, 0.08, 3.35]} color="#1a1c20" metal={0.65} />
          <Box position={[x, 0.42, -0.55]} size={[0.06, 0.55, 0.06]} color="#2a2d33" metal={0.6} />
          <Box position={[x, 0.42, 0.85]} size={[0.06, 0.55, 0.06]} color="#2a2d33" metal={0.6} />
        </group>
      ))}

      <mesh position={[0, 0.92, 0.12]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.62, 2.15, 8, 16]} />
        <meshStandardMaterial color="#1c222a" metalness={0.62} roughness={0.28} />
      </mesh>
      <Box position={[0, 0.78, 0.12]} size={[1.18, 0.08, 3.05]} color="#3ecf8e" emissive="#3ecf8e" eInt={0.35} />
      <Box position={[0, 0.72, 1.55]} size={[0.42, 0.22, 0.7]} color="#15181e" metal={0.55} />

      <mesh position={[0, 1.18, -1.35]} castShadow={false}>
        <sphereGeometry args={[0.58, 16, 12, 0, Math.PI * 2, 0, 1.85]} />
        <CheapGlass opacity={0.32} color="#8ecae8" />
      </mesh>
      <mesh position={[0, 1.05, -0.15]}>
        <boxGeometry args={[1.12, 0.42, 1.15]} />
        <CheapGlass opacity={0.24} color="#7fb7d4" />
      </mesh>
      <mesh position={[0, 1.12, -1.55]}>
        <boxGeometry args={[0.22, 0.16, 0.08]} />
        <meshStandardMaterial color="#1a1c20" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[-0.18, 1.05, -1.42]}>
        <capsuleGeometry args={[0.12, 0.22, 4, 8]} />
        <meshStandardMaterial color="#243044" roughness={0.65} />
      </mesh>

      <mesh position={[0, 1.05, 2.35]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.2, 2.35, 10]} />
        <meshStandardMaterial color="#1c222a" metalness={0.62} roughness={0.28} />
      </mesh>
      <Box position={[0, 1.48, 3.45]} size={[0.06, 0.95, 0.55]} color="#1c222a" metal={0.6} />
      <Box position={[0, 1.72, 3.55]} size={[0.05, 0.08, 0.72]} color="#3ecf8e" emissive="#3ecf8e" eInt={0.7} />

      <mesh position={[0, 0.55, -2.05]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.55, 0.08, 0.22]} />
        <meshStandardMaterial color="#ffe7b0" emissive="#ffe7b0" emissiveIntensity={1.6} />
      </mesh>
      {settings.extraLights ? (
        <pointLight position={[0, 0.7, -2.1]} intensity={0.55} distance={6} color="#ffe7b0" />
      ) : null}

      <MainRotor />
      <TailRotor />
    </group>
  );
}

export function Evtol({ position }: { position: [number, number, number] }) {
  return <Helicopter position={position} />;
}

export function SuitNpc({
  position,
  color = "#2c3340",
  scale = 1,
}: {
  position: [number, number, number];
  color?: string;
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.95, 0]}>
        <capsuleGeometry args={[0.28, 1.05, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.65} />
      </mesh>
      <mesh position={[0, 1.72, 0.02]}>
        <sphereGeometry args={[0.22, 10, 8]} />
        <meshStandardMaterial color="#6b5a48" roughness={0.7} />
      </mesh>
    </group>
  );
}
