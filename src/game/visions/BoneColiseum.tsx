import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { Magma, Rock, SkullMark, Theropod } from "./kit";

export function BoneColiseum() {
  const a = useRef<Group>(null);
  const b = useRef<Group>(null);
  const embers = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const r = 5.2;
    if (a.current) {
      a.current.position.set(Math.cos(t * 0.55) * r, 0, Math.sin(t * 0.55) * r);
      a.current.rotation.y = t * 0.55 + Math.PI / 2;
    }
    if (b.current) {
      b.current.position.set(Math.cos(t * 0.55 + Math.PI) * r, 0, Math.sin(t * 0.55 + Math.PI) * r);
      b.current.rotation.y = t * 0.55 + Math.PI * 1.5;
    }
    if (embers.current) embers.current.rotation.y = t * 0.08;
  });

  return (
    <group>
      <color attach="background" args={["#140808"]} />
      <fog attach="fog" args={["#140808", 24, 80]} />
      <ambientLight color="#3a1810" intensity={0.32} />
      <directionalLight color="#ff6a2a" intensity={2.8} position={[6, 22, -16]} />
      <pointLight color="#ff4a12" intensity={38} distance={32} position={[0, 2, 0]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[12, 40]} />
        <meshStandardMaterial color="#121214" roughness={0.35} metalness={0.45} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, i * 0.5]} position={[0, 0.03, 0]}>
          <planeGeometry args={[0.18, 16]} />
          <Magma />
        </mesh>
      ))}

      {Array.from({ length: 22 }, (_, i) => {
        const a0 = (i / 22) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(a0) * 14.5, 0, Math.sin(a0) * 14.5]} rotation={[0, -a0 + Math.PI, 0]}>
            <SkullMark scale={2.1} />
            <group position={[0, 1.7, -0.8]}>
              <SkullMark scale={1.7} />
            </group>
            <group position={[0, 3.1, -1.5]}>
              <SkullMark scale={1.4} />
            </group>
          </group>
        );
      })}

      <mesh position={[0, 8, -22]}>
        <boxGeometry args={[36, 22, 8]} />
        <Rock color="#2a1610" />
      </mesh>
      {[-10, -4, 2, 8].map((x) => (
        <mesh key={x} position={[x, 7, -17]}>
          <planeGeometry args={[4.2, 16]} />
          <Magma />
        </mesh>
      ))}

      <group ref={embers}>
        {Array.from({ length: 28 }, (_, i) => (
          <mesh key={i} position={[(i % 7) * 2.2 - 7, 2 + (i % 5) * 1.4, ((i * 3) % 11) - 5]}>
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshStandardMaterial color="#ff8a3a" emissive="#ff6a1c" emissiveIntensity={2} />
          </mesh>
        ))}
      </group>

      <group ref={a}>
        <Theropod scale={1.7} armor color="#3a2c28" />
      </group>
      <group ref={b}>
        <Theropod scale={1.85} color="#5a4034" />
      </group>
    </group>
  );
}
