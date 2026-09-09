import type { Vec3 } from "./types";

const BODY = "#2a2c28";
const TRIM = "#3a3c38";
const CAGE = "#1c1e1c";
const TIRE = "#141414";
const RIM = "#5a5c58";

function Wheel({ position }: { position: Vec3 }) {
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <mesh>
        <cylinderGeometry args={[0.42, 0.42, 0.28, 10]} />
        <meshStandardMaterial color={TIRE} roughness={0.95} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.18, 0.18, 0.3, 8]} />
        <meshStandardMaterial color={RIM} roughness={0.45} metalness={0.4} />
      </mesh>
    </group>
  );
}

/** Armored 6-wheel path buggy from the still. Procedural — no buggy GLB, not the Floor heli. */
export function CanyonBuggy({
  position,
  rotation = [0, 0, 0],
  scale = 1,
}: {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 0.58, 0]}>
        <boxGeometry args={[2.55, 0.42, 1.22]} />
        <meshStandardMaterial color={BODY} roughness={0.82} metalness={0.18} />
      </mesh>
      <mesh position={[0.15, 1.05, 0]}>
        <boxGeometry args={[1.35, 0.62, 1.05]} />
        <meshStandardMaterial color={TRIM} roughness={0.78} metalness={0.12} />
      </mesh>
      <mesh position={[-0.85, 0.92, 0]}>
        <boxGeometry args={[0.7, 0.38, 1.12]} />
        <meshStandardMaterial color="#1a1c1a" roughness={0.7} metalness={0.25} />
      </mesh>
      <mesh position={[1.15, 0.55, 0]}>
        <boxGeometry args={[0.55, 0.22, 1.05]} />
        <meshStandardMaterial color="#222422" roughness={0.8} />
      </mesh>
      <mesh position={[1.38, 0.7, 0]}>
        <boxGeometry args={[0.12, 0.35, 0.95]} />
        <meshStandardMaterial color={CAGE} roughness={0.55} metalness={0.35} />
      </mesh>
      {[
        [0.55, 1.42, 0.46],
        [0.55, 1.42, -0.46],
        [-0.45, 1.42, 0.46],
        [-0.45, 1.42, -0.46],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <cylinderGeometry args={[0.035, 0.035, 0.72, 6]} />
          <meshStandardMaterial color={CAGE} roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
      <mesh position={[0.05, 1.76, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 1.15, 6]} />
        <meshStandardMaterial color={CAGE} roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0.05, 1.55, 0.46]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 1.05, 6]} />
        <meshStandardMaterial color={CAGE} roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0.05, 1.55, -0.46]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 1.05, 6]} />
        <meshStandardMaterial color={CAGE} roughness={0.5} metalness={0.4} />
      </mesh>
      {(
        [
          [0.95, 0.42, 0.68],
          [0, 0.42, 0.68],
          [-0.95, 0.42, 0.68],
          [0.95, 0.42, -0.68],
          [0, 0.42, -0.68],
          [-0.95, 0.42, -0.68],
        ] as Vec3[]
      ).map((p, i) => (
        <Wheel key={i} position={p} />
      ))}
    </group>
  );
}
