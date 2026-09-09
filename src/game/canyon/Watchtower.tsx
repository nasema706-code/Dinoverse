import * as THREE from "three";
import type { Vec3 } from "./types";

const WOOD = "#2a1c14";
const PLANK = "#3a281c";
const ROOF = "#1a120e";
const RAIL = "#241610";

function Wood({ color = WOOD }: { color?: string }) {
  return <meshStandardMaterial color={color} roughness={0.9} metalness={0.04} />;
}

function RoofMat() {
  return <meshStandardMaterial color={ROOF} roughness={0.86} metalness={0.06} />;
}

function Posts({ span, height, y }: { span: number; height: number; y: number }) {
  const h = span * 0.5;
  const posts: Vec3[] = [
    [-h, y, -h],
    [h, y, -h],
    [-h, y, h],
    [h, y, h],
  ];
  return (
    <>
      {posts.map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.34, height, 0.34]} />
          <Wood />
        </mesh>
      ))}
    </>
  );
}

function Deck({ y, size }: { y: number; size: number }) {
  return (
    <group>
      <mesh position={[0, y, 0]}>
        <boxGeometry args={[size, 0.2, size]} />
        <Wood color={PLANK} />
      </mesh>
      {[
        [0, y + 0.55, size * 0.48, size, 0],
        [0, y + 0.55, -size * 0.48, size, 0],
        [size * 0.48, y + 0.55, 0, size, Math.PI / 2],
        [-size * 0.48, y + 0.55, 0, size, Math.PI / 2],
      ].map(([x, py, z, len, rot], i) => (
        <mesh key={i} position={[x, py, z]} rotation={[0, rot, 0]}>
          <boxGeometry args={[len, 0.12, 0.12]} />
          <Wood color={RAIL} />
        </mesh>
      ))}
    </group>
  );
}

function TierRoof({ y, radius, height }: { y: number; radius: number; height: number }) {
  return (
    <group position={[0, y, 0]} rotation={[0, Math.PI / 4, 0]}>
      <mesh>
        <coneGeometry args={[radius, height, 4]} />
        <RoofMat />
      </mesh>
      <mesh position={[0, -height * 0.42, 0]}>
        <cylinderGeometry args={[radius * 0.92, radius * 1.08, 0.18, 4]} />
        <RoofMat />
      </mesh>
    </group>
  );
}

/** Multi-tier log watchtower — pagoda silhouette matching the still. No GLB. */
export function Watchtower({
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
      <mesh position={[0, 1.7, 0]}>
        <boxGeometry args={[3.6, 3.4, 3.6]} />
        <Wood />
      </mesh>
      <Posts span={3.5} height={3.4} y={1.7} />
      <mesh position={[0, 0.2, 1.95]}>
        <boxGeometry args={[1.1, 1.8, 0.16]} />
        <Wood color="#2a1c14" />
      </mesh>

      <Deck y={3.55} size={4.1} />
      <TierRoof y={4.85} radius={3.15} height={1.7} />

      <Posts span={2.7} height={2.7} y={5.9} />
      <mesh position={[0, 5.85, 0]}>
        <boxGeometry args={[2.7, 2.5, 2.7]} />
        <Wood color="#423024" />
      </mesh>
      <Deck y={7.2} size={3.35} />
      <TierRoof y={8.45} radius={2.55} height={1.45} />

      <Posts span={2.05} height={2.2} y={9.4} />
      <Deck y={10.45} size={2.55} />
      <TierRoof y={12.05} radius={2.15} height={2.35} />

      <mesh position={[2.15, 6.2, 0.2]} rotation={[0.08, 0, 0.16]}>
        <planeGeometry args={[1.35, 4.6]} />
        <meshStandardMaterial color="#6b4226" roughness={0.96} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-2.05, 7.8, 0.25]} rotation={[0.1, 0.12, -0.2]}>
        <planeGeometry args={[1.05, 3.8]} />
        <meshStandardMaterial color="#8a5a32" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[1.7, 9.4, -0.15]} rotation={[0.04, -0.18, 0.26]}>
        <planeGeometry args={[0.55, 2.2]} />
        <meshStandardMaterial color="#5a341c" roughness={0.97} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
