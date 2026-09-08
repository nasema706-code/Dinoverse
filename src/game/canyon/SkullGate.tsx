import type { Vec3 } from "./types";

function Bone({ color = "#d8c4a0" }: { color?: string }) {
  return <meshStandardMaterial color={color} roughness={0.72} metalness={0.08} />;
}

function Wood() {
  return <meshStandardMaterial color="#2c1c14" roughness={0.9} metalness={0.04} />;
}

/** Procedural skull-mouth so the establishing shot matches the still; GLB sits as the rock-spire mass. */
export function SkullGate({
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
      <mesh position={[0, 12.4, -1.6]} scale={[1.28, 1.18, 1.22]}>
        <sphereGeometry args={[7.6, 22, 16]} />
        <Bone />
      </mesh>
      <mesh position={[0, 9.2, 1.1]} scale={[1.12, 0.78, 1.02]}>
        <sphereGeometry args={[6.4, 18, 14]} />
        <Bone color="#e2d0ae" />
      </mesh>
      <mesh position={[0, 6.8, 2.4]} scale={[1.05, 0.55, 0.85]}>
        <sphereGeometry args={[5.8, 14, 10]} />
        <Bone color="#d8c4a0" />
      </mesh>

      <mesh position={[2.85, 11.6, 6.15]} scale={[1, 1.15, 0.72]}>
        <sphereGeometry args={[2.05, 14, 10]} />
        <meshStandardMaterial color="#12080c" roughness={1} />
      </mesh>
      <mesh position={[-2.85, 11.6, 6.15]} scale={[1, 1.15, 0.72]}>
        <sphereGeometry args={[2.05, 14, 10]} />
        <meshStandardMaterial color="#12080c" roughness={1} />
      </mesh>

      <mesh position={[0, 8.7, 6.35]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[2.35, 1.25, 1.6]} />
        <Bone color="#cbb898" />
      </mesh>
      <mesh position={[0, 4.6, 4.2]} rotation={[0.08, 0, 0]}>
        <cylinderGeometry args={[3.15, 3.55, 7.2, 12]} />
        <meshStandardMaterial color="#10060a" roughness={1} />
      </mesh>

      {[-2.7, -1.35, 0, 1.35, 2.7].map((x) => (
        <mesh key={`ut-${x}`} position={[x, 7.85, 7.15]} rotation={[0.35, 0, 0]}>
          <coneGeometry args={[0.32, 1.35, 5]} />
          <Bone color="#f0e2c4" />
        </mesh>
      ))}
      {[-2.4, -0.8, 0.8, 2.4].map((x) => (
        <mesh key={`lt-${x}`} position={[x, 1.85, 7.05]} rotation={[Math.PI - 0.2, 0, 0]}>
          <coneGeometry args={[0.28, 1.1, 5]} />
          <Bone color="#f0e2c4" />
        </mesh>
      ))}

      <mesh position={[7.8, 17.6, -1.4]} rotation={[0.2, 0.05, -0.62]}>
        <coneGeometry args={[1.15, 10.4, 7]} />
        <Bone color="#e4d2b0" />
      </mesh>
      <mesh position={[-7.8, 17.6, -1.4]} rotation={[0.2, -0.05, 0.62]}>
        <coneGeometry args={[1.15, 10.4, 7]} />
        <Bone color="#e4d2b0" />
      </mesh>
      <mesh position={[9.2, 13.2, 0.6]} rotation={[0.45, 0.35, -1.12]}>
        <coneGeometry args={[0.58, 6.1, 6]} />
        <Bone />
      </mesh>
      <mesh position={[-9.2, 13.2, 0.6]} rotation={[0.45, -0.35, 1.12]}>
        <coneGeometry args={[0.58, 6.1, 6]} />
        <Bone />
      </mesh>

      {[-6.5, 6.5].map((x) => (
        <group key={`rib-${x}`}>
          <mesh position={[x, 10.2, -2.4]} rotation={[0.2, 0, x > 0 ? -0.42 : 0.42]}>
            <boxGeometry args={[0.58, 9.2, 0.42]} />
            <Bone color="#c8b490" />
          </mesh>
          <mesh position={[x * 1.08, 7.6, 2.1]} rotation={[0, 0, x > 0 ? 0.18 : -0.18]}>
            <boxGeometry args={[0.72, 6.6, 0.38]} />
            <Wood />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 19.6, -4.2]} rotation={[0.42, 0, 0]}>
        <boxGeometry args={[3.4, 0.48, 9]} />
        <Wood />
      </mesh>
      <pointLight color="#ffb07a" intensity={16} distance={18} position={[2.3, 5.2, 6.2]} />
      <pointLight color="#ffb07a" intensity={16} distance={18} position={[-2.3, 5.2, 6.2]} />
    </group>
  );
}
