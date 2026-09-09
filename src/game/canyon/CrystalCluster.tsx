import type { Vec3 } from "./types";

export function CrystalCluster({
  position,
  color,
  emissive,
  scale = 1,
  light = 9,
}: {
  position: Vec3;
  color: string;
  emissive: string;
  scale?: number;
  light?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <pointLight color={emissive} intensity={light} distance={16} decay={2} />
      <mesh rotation={[0.35, 0.25, 0.12]}>
        <octahedronGeometry args={[1.15, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={1.55}
          roughness={0.16}
          metalness={0.28}
          transparent
          opacity={0.94}
        />
      </mesh>
      <mesh position={[0.72, 0.42, 0.18]} rotation={[0.2, 0.9, -0.28]} scale={0.58}>
        <octahedronGeometry args={[1.15, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={1.7}
          roughness={0.14}
          metalness={0.3}
        />
      </mesh>
      <mesh position={[-0.55, 0.62, -0.2]} rotation={[0.55, -0.4, 0.22]} scale={0.42}>
        <octahedronGeometry args={[1.15, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={1.65}
          roughness={0.14}
          metalness={0.3}
        />
      </mesh>
    </group>
  );
}
