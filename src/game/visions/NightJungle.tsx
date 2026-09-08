import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { FernClump, Rock, Scatter, Theropod } from "./kit";

function Pitcher({ scale = 1, color = "#e23a8a" }: { scale?: number; color?: string }) {
  return (
    <group scale={scale}>
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.95, 12, 10]} />
        <meshStandardMaterial color="#142018" emissive={color} emissiveIntensity={2.4} roughness={0.45} />
      </mesh>
      <mesh position={[0, 2.05, 0]}>
        <coneGeometry args={[0.55, 0.9, 8]} />
        <meshStandardMaterial color="#1a281c" emissive={color} emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
}

export function NightJungle() {
  const spino = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!spino.current) return;
    spino.current.position.set(Math.sin(t * 0.18) * 6, 0, Math.cos(t * 0.18) * 3);
    spino.current.rotation.y = t * 0.18 + Math.PI / 2;
  });

  return (
    <group>
      <color attach="background" args={["#061018"]} />
      <fog attach="fog" args={["#061018", 22, 78]} />
      <ambientLight color="#0a2838" intensity={0.32} />
      <directionalLight color="#c8e4ff" intensity={1.05} position={[-16, 28, 10]} />
      <pointLight color="#3ec4ff" intensity={28} distance={26} position={[-4, 3, 2]} />
      <pointLight color="#e23a8a" intensity={30} distance={24} position={[6, 3, -3]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[70, 70]} />
        <Rock color="#0c1612" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <planeGeometry args={[14, 40]} />
        <meshStandardMaterial color="#061018" roughness={0.2} metalness={0.35} emissive="#0a2030" emissiveIntensity={0.25} />
      </mesh>

      <Scatter seed={3} count={50} area={{ minX: -22, maxX: 22, minZ: -22, maxZ: 22 }}>
        {(pose, i) =>
          Math.hypot(pose.position[0], pose.position[2]) < 5 ? null : (
            <FernClump
              scale={pose.scale}
              color="#0e2a18"
              glow={i % 3 === 0 ? "#e23a8a" : "#3ec4ff"}
            />
          )
        }
      </Scatter>

      <group position={[-8, 0, 8]}>
        <Pitcher scale={2.4} />
      </group>
      <group position={[9, 0, 6]}>
        <Pitcher scale={2.1} color="#ff4aa8" />
      </group>
      <group position={[7, 0, -9]}>
        <Pitcher scale={1.8} />
      </group>
      <group position={[-10, 0, -6]}>
        <Pitcher scale={2} color="#ff4aa8" />
      </group>

      <group ref={spino}>
        <Theropod scale={2.4} sail color="#243038" />
      </group>
    </group>
  );
}
