import { FLOOR_BOUNDS, FLOOR_DESKS } from "./layout";
import {
  BoardScreen,
  CeilingLight,
  CityView,
  CoffeeBar,
  Column,
  ConferenceTable,
  DeskWithChair,
  Lights,
  Plant,
  Reception,
  TickerRail,
  Wall,
  WindowPane,
  Box,
} from "./kit";
import { ShardOrb } from "../shard-orb";

export function FloorScene({ collected }: { collected: string[] }) {
  const { minX, maxX, minZ, maxZ } = FLOOR_BOUNDS;
  const W = maxX - minX;
  const D = maxZ - minZ;

  return (
    <group>
      <Lights />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[W + 8, D + 8]} />
        <meshStandardMaterial color="#8a8e96" emissive="#5c6068" emissiveIntensity={0.45} roughness={0.5} metalness={0.08} />
      </mesh>
      <Box position={[0, 4.25, 0]} size={[W + 0.4, 0.16, D + 0.4]} color="#141518" metal={0.15} />

      <Wall position={[0, 2.1, minZ]} size={[W + 0.4, 4.2, 0.28]} />
      <Wall position={[0, 2.1, maxZ]} size={[W + 0.4, 4.2, 0.28]} />
      <Wall position={[minX, 2.1, 0]} size={[0.28, 4.2, D + 0.4]} />
      <Wall position={[maxX, 2.1, 0]} size={[0.28, 4.2, D + 0.4]} />

      <Wall position={[-7.25, 2.1, -10.2]} size={[0.2, 4.2, 5.2]} />
      <Wall position={[-7.25, 2.1, 1.6]} size={[0.2, 4.2, 5.4]} />
      <Wall position={[7.25, 2.1, -10.2]} size={[0.2, 4.2, 5.2]} />
      <Wall position={[7.25, 2.1, 1.6]} size={[0.2, 4.2, 5.4]} />
      <Box position={[-7.25, 3.55, -4.1]} size={[0.2, 1.3, 2.2]} color="#1e2025" />
      <Box position={[7.25, 3.55, -4.1]} size={[0.2, 1.3, 2.2]} color="#1e2025" />

      <WindowPane position={[0, 2.15, minZ + 0.16]} size={[10.4, 2.7]} />
      <WindowPane position={[-9.4, 2.15, minZ + 0.16]} size={[3.4, 2.7]} />
      <WindowPane position={[9.4, 2.15, minZ + 0.16]} size={[3.4, 2.7]} />
      <WindowPane position={[0, 2.05, maxZ - 0.16]} size={[6.4, 2.5]} rotY={Math.PI} />

      <CityView src="/life/hq.jpg" position={[0, 2.3, minZ - 4.2]} size={[22, 8]} />
      <CityView src="/life/mall-sunset.jpg" position={[0, 2.2, maxZ + 4.4]} size={[20, 7.2]} rotY={Math.PI} />
      <CityView src="/life/corporate.jpg" position={[minX - 4.2, 2.3, -2]} size={[16, 7.5]} rotY={Math.PI / 2} />
      <CityView src="/life/mega-mall.jpg" position={[maxX + 4.2, 2.3, -2]} size={[16, 7.5]} rotY={-Math.PI / 2} />

      <Column position={[-6.4, 0, 5.6]} />
      <Column position={[6.4, 0, 5.6]} />
      <Column position={[-6.4, 0, -2.2]} />
      <Column position={[6.4, 0, -2.2]} />

      <Reception position={[0, 0, 8.15]} />
      <CoffeeBar position={[-8.6, 0, 8.5]} />
      <Box position={[6.1, 0.55, 8.5]} size={[1.05, 1.1, 0.85]} color="#2a2c32" metal={0.25} />

      <TickerRail position={[0, 2.85, 5.7]} w={8.4} />
      <group position={[-11.35, 2.7, 3.2]} rotation={[0, Math.PI / 2, 0]}>
        <TickerRail position={[0, 0, 0]} w={7} />
      </group>
      <group position={[11.35, 2.7, 3.2]} rotation={[0, -Math.PI / 2, 0]}>
        <TickerRail position={[0, 0, 0]} w={7} />
      </group>

      {FLOOR_DESKS.map((d) => (
        <DeskWithChair key={d.id} desk={d} />
      ))}

      <ConferenceTable />
      <BoardScreen src="/life/finance.jpg" position={[11.28, 2.15, -7.2]} rotY={-Math.PI / 2} />

      <Plant position={[-3.2, 0, 9.6]} />
      <Plant position={[3.2, 0, 9.6]} />
      <Plant position={[-10.4, 0, -11.6]} />
      <Plant position={[10.4, 0, -11.6]} />

      <CeilingLight position={[0, 4.08, 10]} />
      <CeilingLight position={[0, 4.08, 8]} />
      <CeilingLight position={[-4.8, 4.08, 1.8]} />
      <CeilingLight position={[4.8, 4.08, 1.8]} />
      <CeilingLight position={[0, 4.08, -6]} />
      <CeilingLight position={[-9.2, 4.08, -6.5]} />
      <CeilingLight position={[9.2, 4.08, -6.5]} />

      <pointLight position={[0, 3.4, 6]} intensity={1.1} distance={14} color="#f0ead8" />
      <pointLight position={[0, 3.4, -4]} intensity={0.9} distance={14} color="#e4eef8" />
      <pointLight position={[-9, 3.2, -7]} intensity={0.7} distance={10} color="#f0ead8" />
      <pointLight position={[9, 3.2, -7]} intensity={0.7} distance={10} color="#f0ead8" />

      <ShardOrb position={[-9.6, 1.15, -10.4]} taken={collected.includes("forum-a")} />
      <ShardOrb position={[9.4, 1.15, -3.2]} taken={collected.includes("forum-b")} />
    </group>
  );
}
