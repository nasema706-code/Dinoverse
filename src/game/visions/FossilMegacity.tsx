import { Bone, FernClump, Magma, Rock, Scatter, Theropod } from "./kit";

function CityStack({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[(i % 2) * 0.8 - 0.4, 0.7 + i * 1.55, (i % 3) * 0.4 - 0.4]}>
          <boxGeometry args={[2.2 - i * 0.12, 1.35, 1.8]} />
          <Bone color="#b8a484" />
        </mesh>
      ))}
    </group>
  );
}

export function FossilMegacity() {
  return (
    <group>
      <color attach="background" args={["#1a0b18"]} />
      <fog attach="fog" args={["#1a0b18", 28, 120]} />
      <ambientLight color="#2a1420" intensity={0.22} />
      <directionalLight color="#ff8a3a" intensity={2.4} position={[22, 28, 18]} />
      <directionalLight color="#e23a8a" intensity={0.9} position={[-8, 16, -24]} />
      <pointLight color="#ff6a1c" intensity={22} distance={28} position={[-4.2, 21, 4]} />
      <pointLight color="#ff6a1c" intensity={22} distance={28} position={[4.2, 21, 4]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 8]}>
        <planeGeometry args={[70, 80]} />
        <Rock color="#2c1c14" />
      </mesh>
      <mesh position={[-24, 12, -4]} rotation={[0, 0.2, 0.1]}>
        <boxGeometry args={[14, 28, 70]} />
        <Rock color="#1c1614" />
      </mesh>
      <mesh position={[24, 12, -4]} rotation={[0, -0.2, -0.1]}>
        <boxGeometry args={[14, 28, 70]} />
        <Rock color="#1c1614" />
      </mesh>

      <group position={[0, 8, -10]}>
        <mesh position={[-3.6, 14, 0]}>
          <sphereGeometry args={[11.5, 18, 14]} />
          <Bone color="#d2c2a6" />
        </mesh>
        <mesh position={[3.6, 14, 0]}>
          <sphereGeometry args={[11.5, 18, 14]} />
          <Bone color="#c8b696" />
        </mesh>
        <mesh position={[0, 6.5, 7.4]}>
          <boxGeometry args={[14, 3.2, 8]} />
          <Bone color="#c4b090" />
        </mesh>
        {[-5, -2.5, 0, 2.5, 5].map((x) => (
          <mesh key={x} position={[x, 4.6, 11.2]}>
            <boxGeometry args={[1.1, 2.4, 0.7]} />
            <Bone color="#efe4ce" />
          </mesh>
        ))}
        <mesh position={[-4.4, 15.6, 8.4]}>
          <sphereGeometry args={[2.1, 10, 8]} />
          <meshStandardMaterial color="#14080a" />
        </mesh>
        <mesh position={[4.4, 15.6, 8.4]}>
          <sphereGeometry args={[2.1, 10, 8]} />
          <meshStandardMaterial color="#14080a" />
        </mesh>
        <mesh position={[-4.4, 12.2, 8.6]} rotation={[0.9, 0, 0]}>
          <planeGeometry args={[1.6, 9]} />
          <Magma />
        </mesh>
        <mesh position={[4.4, 12.2, 8.6]} rotation={[0.9, 0, 0]}>
          <planeGeometry args={[1.6, 9]} />
          <Magma />
        </mesh>
        <CityStack position={[-1.2, 7.2, 1]} />
        <CityStack position={[2.4, 8.6, -2.2]} />
      </group>

      <mesh position={[0, 5.2, 12]} rotation={[0, 0, 0.18]}>
        <torusGeometry args={[16, 0.55, 6, 22, Math.PI]} />
        <Bone color="#bca888" />
      </mesh>
      <mesh position={[0, 4.4, 12]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 28, 8]} />
        <Bone />
      </mesh>

      {[-8, -4, 0, 4, 8].map((x) => (
        <group key={x} position={[x, 4.55, 12]}>
          <Theropod scale={0.85} armor color="#3d332c" />
        </group>
      ))}

      <Scatter seed={19} count={36} area={{ minX: -16, maxX: 16, minZ: 18, maxZ: 42 }}>
        {(pose) => <FernClump scale={pose.scale} color="#14351c" />}
      </Scatter>
    </group>
  );
}
