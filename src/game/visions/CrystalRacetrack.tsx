import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { Crystal, HornedRunner, Rock, Scatter } from "./kit";

function Chariot() {
  return (
    <group>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[1.35, 0.28, 1.7]} />
        <meshStandardMaterial color="#d8c8b0" roughness={0.45} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.82, -0.15]}>
        <boxGeometry args={[0.7, 0.55, 0.7]} />
        <meshStandardMaterial color="#8a9aa8" metalness={0.82} roughness={0.22} />
      </mesh>
      <mesh position={[0.55, 0.7, 0.1]} rotation={[0, 0, 0.5]}>
        <torusGeometry args={[0.38, 0.06, 6, 12]} />
        <meshStandardMaterial color="#efe4ce" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[-0.55, 0.7, 0.1]} rotation={[0, 0, -0.5]}>
        <torusGeometry args={[0.38, 0.06, 6, 12]} />
        <meshStandardMaterial color="#efe4ce" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.05, -0.1]}>
        <boxGeometry args={[0.28, 0.42, 0.22]} />
        <meshStandardMaterial color="#1a1210" roughness={0.7} />
      </mesh>
      <group position={[0.5, 0, 1.35]} rotation={[0, Math.PI, 0]}>
        <HornedRunner scale={0.62} />
      </group>
      <group position={[-0.5, 0, 1.35]} rotation={[0, Math.PI, 0]}>
        <HornedRunner scale={0.62} />
      </group>
    </group>
  );
}

export function RaceFollow({ flying }: { flying: boolean }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3());

  useFrame((state) => {
    if (flying) return;
    const z = 8 - ((state.clock.elapsedTime * 9) % 64);
    const dest = look.current.set(0.35, 2.35, z + 7.2);
    camera.position.lerp(dest, 0.12);
    camera.lookAt(0.2, 1.15, z - 4);
  });
  return null;
}

export function CrystalRacetrack() {
  const lead = useRef<THREE.Group>(null);
  const chase = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const z = 8 - ((t * 9) % 64);
    if (lead.current) lead.current.position.set(0.35, 0, z);
    if (chase.current) chase.current.position.set(-1.15, 0, z + 6.4);
  });

  return (
    <group>
      <color attach="background" args={["#12081a"]} />
      <fog attach="fog" args={["#12081a", 12, 70]} />
      <ambientLight color="#241430" intensity={0.2} />
      <directionalLight color="#ffb060" intensity={2.3} position={[8, 22, 6]} />
      <directionalLight color="#7a3cff" intensity={0.7} position={[-10, 8, -4]} />
      <pointLight color="#2ec4b6" intensity={18} distance={22} position={[4, 4, 0]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 90]} />
        <Rock color="#3a2a1c" />
      </mesh>
      <mesh position={[-7.4, 10, 0]}>
        <boxGeometry args={[6, 22, 90]} />
        <Rock color="#1a1218" />
      </mesh>
      <mesh position={[7.4, 10, 0]}>
        <boxGeometry args={[6, 22, 90]} />
        <Rock color="#1a1218" />
      </mesh>

      <Scatter seed={88} count={42} area={{ minX: -6.6, maxX: -3.6, minZ: -40, maxZ: 30, y: 0.2 }}>
        {(pose, i) => (
          <Crystal
            color={i % 2 ? "#7a3cff" : "#2ec4b6"}
            emissive={i % 2 ? "#5a20e0" : "#1aa898"}
            scale={0.35 + pose.scale * 0.55}
          />
        )}
      </Scatter>
      <Scatter seed={91} count={42} area={{ minX: 3.6, maxX: 6.6, minZ: -40, maxZ: 30, y: 0.2 }}>
        {(pose, i) => (
          <Crystal
            color={i % 2 ? "#2ec4b6" : "#9a4cff"}
            emissive={i % 2 ? "#1aa898" : "#6a28e8"}
            scale={0.35 + pose.scale * 0.55}
          />
        )}
      </Scatter>

      <group ref={lead}>
        <Chariot />
      </group>
      <group ref={chase}>
        <Chariot />
      </group>
    </group>
  );
}
