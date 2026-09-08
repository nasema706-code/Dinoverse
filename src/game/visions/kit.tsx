import { useMemo, type ReactNode } from "react";
import { mulberry32 } from "../canyon/seeded";

export function Bone({ color = "#c9b498" }: { color?: string }) {
  return <meshStandardMaterial color={color} roughness={0.78} metalness={0.12} />;
}

export function Rock({ color = "#2a201c" }: { color?: string }) {
  return <meshStandardMaterial color={color} roughness={0.94} metalness={0.04} />;
}

export function Magma() {
  return <meshStandardMaterial color="#ff5318" emissive="#ff6a1c" emissiveIntensity={2.4} />;
}

export function Theropod({
  scale = 1,
  color = "#4a3a32",
  sail = false,
  armor = false,
}: {
  scale?: number;
  color?: string;
  sail?: boolean;
  armor?: boolean;
}) {
  return (
    <group scale={scale}>
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[0.46, 0.72, 1.45]} />
        <meshStandardMaterial color={color} roughness={0.68} />
      </mesh>
      <mesh position={[0, 1.08, 0.78]}>
        <boxGeometry args={[0.4, 0.4, 0.52]} />
        <meshStandardMaterial color={color} roughness={0.68} />
      </mesh>
      <mesh position={[0.16, 0.3, 0.32]}>
        <boxGeometry args={[0.14, 0.58, 0.2]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[-0.16, 0.3, 0.32]}>
        <boxGeometry args={[0.14, 0.58, 0.2]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.85, -0.82]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.12, 0.12, 0.7]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {armor ? (
        <mesh position={[0, 1.12, 0.05]}>
          <boxGeometry args={[0.55, 0.12, 1.1]} />
          <meshStandardMaterial color="#6a5a4a" metalness={0.45} roughness={0.4} />
        </mesh>
      ) : null}
      {sail ? (
        <mesh position={[0, 1.55, 0.05]}>
          <boxGeometry args={[0.07, 1.25, 1.35]} />
          <meshStandardMaterial color="#12202c" emissive="#3ec4ff" emissiveIntensity={1.6} />
        </mesh>
      ) : null}
    </group>
  );
}

export function HornedRunner({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      <Theropod color="#5a4034" />
      <mesh position={[0.16, 1.32, 0.92]}>
        <coneGeometry args={[0.06, 0.28, 5]} />
        <meshStandardMaterial color="#d8c4a4" roughness={0.5} />
      </mesh>
      <mesh position={[-0.16, 1.32, 0.92]}>
        <coneGeometry args={[0.06, 0.28, 5]} />
        <meshStandardMaterial color="#d8c4a4" roughness={0.5} />
      </mesh>
    </group>
  );
}

export function FernClump({
  glow,
  color = "#163820",
  scale = 1,
}: {
  glow?: string;
  color?: string;
  scale?: number;
}) {
  return (
    <group scale={scale}>
      <mesh position={[0, 0.55, 0]}>
        <coneGeometry args={[0.48, 1.15, 5]} />
        <meshStandardMaterial
          color={color}
          emissive={glow ?? "#000000"}
          emissiveIntensity={glow ? 2.2 : 0}
          roughness={0.85}
        />
      </mesh>
    </group>
  );
}

export function Crystal({
  color,
  emissive,
  scale = 1,
}: {
  color: string;
  emissive: string;
  scale?: number;
}) {
  return (
    <mesh scale={scale} rotation={[0.3, 0.4, 0.15]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={1.15}
        roughness={0.18}
        metalness={0.22}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}

export function Scatter({
  seed,
  count,
  area,
  children,
}: {
  seed: number;
  count: number;
  area: { minX: number; maxX: number; minZ: number; maxZ: number; y?: number };
  children: (pose: { position: [number, number, number]; rotation: [number, number, number]; scale: number }, i: number) => ReactNode;
}) {
  const poses = useMemo(() => {
    const rand = mulberry32(seed);
    return Array.from({ length: count }, () => ({
      position: [
        area.minX + rand() * (area.maxX - area.minX),
        area.y ?? 0,
        area.minZ + rand() * (area.maxZ - area.minZ),
      ] as [number, number, number],
      rotation: [0, rand() * Math.PI * 2, 0] as [number, number, number],
      scale: 0.65 + rand() * 1.1,
    }));
  }, [seed, count, area.minX, area.maxX, area.minZ, area.maxZ, area.y]);

  return (
    <group>
      {poses.map((pose, i) => (
        <group key={i} position={pose.position} rotation={pose.rotation}>
          {children(pose, i)}
        </group>
      ))}
    </group>
  );
}

export function SkullMark({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.55, 10, 8]} />
        <Bone />
      </mesh>
      <mesh position={[0.2, 0.58, 0.38]}>
        <sphereGeometry args={[0.14, 8, 6]} />
        <meshStandardMaterial color="#1a0b10" />
      </mesh>
      <mesh position={[-0.2, 0.58, 0.38]}>
        <sphereGeometry args={[0.14, 8, 6]} />
        <meshStandardMaterial color="#1a0b10" />
      </mesh>
    </group>
  );
}
