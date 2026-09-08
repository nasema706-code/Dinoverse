import * as THREE from "three";

function GodRays() {
  return (
    <group>
      <mesh position={[-26, 13, -22]}>
        <sphereGeometry args={[2.8, 16, 12]} />
        <meshBasicMaterial color="#fff4c0" fog={false} toneMapped={false} />
      </mesh>
      <mesh position={[-24, 12.4, -20]}>
        <sphereGeometry args={[7.2, 16, 12]} />
        <meshBasicMaterial color="#F2B705" transparent opacity={0.26} depthWrite={false} fog={false} toneMapped={false} />
      </mesh>
      {[-0.08, 0.05, 0.16].map((pitch, i) => (
        <mesh key={i} position={[-18, 10, -12]} rotation={[pitch, 0.55, 0.08]}>
          <planeGeometry args={[22, 8]} />
          <meshBasicMaterial
            color="#F2B705"
            transparent
            opacity={0.05 + i * 0.012}
            depthWrite={false}
            side={THREE.DoubleSide}
            fog={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function GoldenHaze() {
  return (
    <group>
      {[
        [0, 2.8, -8, 40, 22, 0.06],
        [0, 4.4, -28, 56, 30, 0.075],
        [0, 6.2, -50, 72, 38, 0.09],
      ].map(([x, y, z, w, d, op], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[w, d]} />
          <meshBasicMaterial
            color="#e8c878"
            transparent
            opacity={op}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

export function CanyonLights({
  fog,
}: {
  fog: { color: string; near: number; far: number };
}) {
  return (
    <>
      <color attach="background" args={[fog.color]} />
      <fog attach="fog" args={[fog.color, fog.near, fog.far]} />
      <hemisphereLight args={["#f3d08a", "#8a3a22", 0.48]} />
      <ambientLight color="#d4924a" intensity={0.2} />
      <directionalLight color="#F2B705" intensity={2.7} position={[-26, 13, -22]} />
      <directionalLight color="#ffb060" intensity={1.05} position={[-20, 11, -8]} />
      <directionalLight color="#9bb4c6" intensity={0.22} position={[36, 20, 4]} />
      <GodRays />
      <GoldenHaze />
    </>
  );
}
