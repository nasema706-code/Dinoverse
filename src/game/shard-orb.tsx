import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";

export function ShardOrb({
  position,
  taken,
}: {
  position: [number, number, number];
  taken: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current || taken) return;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2.4) * 0.12;
    ref.current.rotation.y = state.clock.elapsedTime;
  });
  if (taken) return null;
  return (
    <mesh ref={ref} position={position}>
      <octahedronGeometry args={[0.22, 0]} />
      <meshStandardMaterial
        color="#3ecf8e"
        emissive="#3ecf8e"
        emissiveIntensity={1.4}
        roughness={0.2}
        metalness={0.3}
      />
    </mesh>
  );
}
