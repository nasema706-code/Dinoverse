import { FLOOR_BOUNDS, FLOOR_DESKS } from "./layout";
import {
  BoardScreen,
  CeilingLight,
  CoffeeBar,
  Column,
  ConferenceTable,
  DeskWithChair,
  ElevatorCore,
  Evtol,
  GlassCurtain,
  GlassFacade,
  HoloPlate,
  LampPost,
  Lights,
  Plant,
  Reception,
  SuitNpc,
  TickerRail,
  Box,
} from "./kit";
import { Atrium } from "./atrium";
import { Cityscape, PlazaTiles } from "./cityscape";
import { useHudTextures } from "./hud-tex";
import { ShardOrb } from "../shard-orb";

export function FloorScene({ collected }: { collected: string[] }) {
  const hud = useHudTextures();
  const { minX, maxX, minZ } = FLOOR_BOUNDS;

  return (
    <group>
      <Lights />
      <Cityscape />
      <PlazaTiles />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -4]} receiveShadow>
        <planeGeometry args={[36, 40]} />
        <meshPhysicalMaterial
          color="#9aa3ad"
          roughness={0.16}
          metalness={0.28}
          clearcoat={0.45}
          clearcoatRoughness={0.22}
          envMapIntensity={1.35}
          map={hud?.marble ?? undefined}
        />
      </mesh>
      <Box position={[0, 12.42, -1]} size={[36.4, 0.08, 32]} color="#d8e4ee" metal={0.15} rough={0.35} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 12.38, -1]}>
        <planeGeometry args={[36, 32]} />
        <meshPhysicalMaterial
          color="#e8f4ff"
          transmission={0.78}
          thickness={0.12}
          roughness={0.08}
          transparent
          opacity={0.22}
          envMapIntensity={1.4}
          side={2}
        />
      </mesh>
      <Box position={[-9, 12.4, -1]} size={[0.16, 0.18, 32]} color="#c9d4dc" metal={0.75} />
      <Box position={[9, 12.4, -1]} size={[0.16, 0.18, 32]} color="#c9d4dc" metal={0.75} />
      <Box position={[0, 12.4, 8]} size={[36, 0.18, 0.16]} color="#c9d4dc" metal={0.75} />
      <Box position={[0, 12.4, -12]} size={[36, 0.18, 0.16]} color="#c9d4dc" metal={0.75} />

      <GlassCurtain position={[0, 19, 15]} size={[28, 22]} />
      <GlassCurtain position={[0, 19, -11]} size={[28, 22]} />
      <GlassCurtain position={[-14, 19, 2]} size={[26, 22]} rotY={Math.PI / 2} />
      <GlassCurtain position={[14, 19, 2]} size={[26, 22]} rotY={Math.PI / 2} />

      <GlassFacade position={[-8.4, 6.1, 16]} size={[11.2, 12.2, 0.12]} />
      <GlassFacade position={[8.4, 6.1, 16]} size={[11.2, 12.2, 0.12]} />
      <Box position={[0, 12.15, 16]} size={[5.2, 0.28, 0.18]} color="#c9d4dc" metal={0.75} />
      <GlassFacade position={[-14.1, 6.1, 11]} size={[0.12, 12.2, 10.2]} />
      <GlassFacade position={[14.1, 6.1, 11]} size={[0.12, 12.2, 10.2]} />

      {hud ? (
        <mesh position={[0, 6.6, 16.24]}>
          <planeGeometry args={[4.6, 1.7]} />
          <meshBasicMaterial map={hud.sign} toneMapped={false} />
        </mesh>
      ) : null}

      <GlassCurtain position={[-18.2, 6.1, -1]} size={[14, 12.2]} rotY={Math.PI / 2} />
      <GlassCurtain position={[18.2, 6.1, -1]} size={[14, 12.2]} rotY={Math.PI / 2} />

      <GlassFacade position={[-14, 6.1, -10.2]} size={[12, 12.2, 0.12]} />
      <GlassFacade position={[3.2, 6.1, -10.2]} size={[8.4, 12.2, 0.12]} />
      <GlassFacade position={[20, 6.1, -10.2]} size={[6, 12.2, 0.12]} />
      <GlassFacade position={[-2.2, 6.1, -20]} size={[0.12, 12.2, 20]} />
      <GlassFacade position={[6.2, 6.1, -20]} size={[0.12, 12.2, 20]} />
      <GlassFacade position={[0, 6.1, minZ]} size={[maxX - minX, 12.2, 0.12]} />
      <GlassFacade position={[minX, 6.1, -20]} size={[0.12, 12.2, 24]} />
      <GlassFacade position={[maxX, 6.1, -20]} size={[0.12, 12.2, 24]} />

      <GlassCurtain position={[0, 6.1, 16.12]} size={[5.2, 11.4]} />

      {hud ? (
        <>
          <mesh position={[16.6, 4.1, -1.2]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[8.4, 4.6]} />
            <meshBasicMaterial map={hud.ticker} toneMapped={false} transparent opacity={0.82} />
          </mesh>
          <mesh position={[16.6, 4.1, 5.4]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[1.4, 6.2]} />
            <meshBasicMaterial map={hud.dnvr} toneMapped={false} transparent opacity={0.82} />
          </mesh>
          <HoloPlate map={hud.q2} position={[16.4, 2.6, -22.6]} rotY={-Math.PI / 2} w={3.6} h={2.2} />
          <HoloPlate map={hud.ops} position={[-14.2, 1.55, -19.6]} w={1.4} h={0.9} />
          <HoloPlate map={hud.ops} position={[-9.4, 1.55, -19.6]} w={1.4} h={0.9} />
          <HoloPlate map={hud.code} position={[-14.2, 1.55, -14.4]} w={1.35} h={0.85} />
          <HoloPlate map={hud.checkin} position={[-0.7, 1.85, 9.55]} w={1.15} h={0.72} />
          <HoloPlate map={hud.visitors} position={[0.85, 1.85, 9.55]} w={1.15} h={0.72} />
        </>
      ) : null}

      <Column position={[-8.6, 0, 12.8]} />
      <Column position={[8.6, 0, 4.2]} />
      <Column position={[-8.6, 0, -6.2]} />
      <Column position={[8.6, 0, -6.2]} />
      <Column position={[-16.4, 0, -6.2]} />
      <Column position={[16.4, 0, 4.2]} />

      <ElevatorCore position={[-5.2, 0, 8.4]} />
      <ElevatorCore position={[5.2, 0, 8.4]} />

      <Atrium />

      <Reception position={[0, 0, 10.15]} />
      <CoffeeBar position={[-10.4, 0, 12.2]} />
      <Box position={[8.4, 0.55, 12.4]} size={[1.1, 1.1, 0.85]} color="#2a2c32" metal={0.25} />

      <TickerRail position={[0, 3.4, 2.6]} w={10.4} />
      <group position={[-17.7, 3.6, -1]} rotation={[0, Math.PI / 2, 0]}>
        <TickerRail position={[0, 0, 0]} w={9} />
      </group>
      <mesh position={[-4.2, 3.8, 1.2]} rotation={[0.55, 0.4, 0.1]}>
        <ringGeometry args={[0.42, 0.52, 24]} />
        <meshBasicMaterial color="#7fe3ff" transparent opacity={0.55} />
      </mesh>
      <mesh position={[5.1, 4.6, -2.4]} rotation={[1.2, -0.3, 0.2]}>
        <ringGeometry args={[0.28, 0.36, 20]} />
        <meshBasicMaterial color="#7fe3ff" transparent opacity={0.5} />
      </mesh>
      <mesh position={[3.4, 5.4, 6.2]} rotation={[0.2, 0.8, 0.4]}>
        <ringGeometry args={[0.34, 0.44, 22]} />
        <meshBasicMaterial color="#9ee8c8" transparent opacity={0.45} />
      </mesh>

      {FLOOR_DESKS.map((d) => (
        <DeskWithChair key={d.id} desk={d} />
      ))}

      <group position={[5.25, 0, -13.6]}>
        <ConferenceTable />
      </group>
      <BoardScreen src="/life/finance.jpg" position={[16.8, 2.35, -22.4]} rotY={-Math.PI / 2} />

      <Evtol position={[-8, 0, 26.2]} />

      <LampPost position={[-16, 0, 20]} />
      <LampPost position={[16, 0, 20]} />
      <LampPost position={[-16, 0, 28]} />
      <LampPost position={[16, 0, 28]} />

      <Plant position={[-3.4, 0, 14.2]} />
      <Plant position={[3.4, 0, 14.2]} />
      <Plant position={[-16.4, 0, 18.4]} />
      <Plant position={[16.4, 0, 18.4]} />
      <Plant position={[-16, 0, -28]} />
      <Plant position={[16, 0, -28]} />

      <CeilingLight position={[0, 12.1, 12]} />
      <CeilingLight position={[0, 12.1, 6]} />
      <CeilingLight position={[-8, 12.1, 0]} />
      <CeilingLight position={[8, 12.1, 0]} />
      <CeilingLight position={[0, 12.1, -6]} />
      <CeilingLight position={[-12, 12.1, -20]} />
      <CeilingLight position={[14, 12.1, -20]} />
      <CeilingLight position={[-8, 12.1, 24]} />
      <CeilingLight position={[-6, 12.1, -12]} />
      <CeilingLight position={[6, 12.1, -12]} />
      <CeilingLight position={[0, 12.1, -22]} />
      <CeilingLight position={[12, 12.1, 6]} />
      <CeilingLight position={[-12, 12.1, 10]} />
      <CeilingLight position={[12, 12.1, 10]} />

      <pointLight position={[0, 4.2, 10]} intensity={1.2} distance={16} color="#f0ead8" />
      <pointLight position={[0, 4.2, -2]} intensity={1} distance={16} color="#e4eef8" />
      <pointLight position={[16, 3.6, -1]} intensity={1.4} distance={14} color="#3ecf8e" />
      <pointLight position={[-8, 3, 26]} intensity={0.9} distance={12} color="#ffd9a0" />

      <SuitNpc position={[2.4, 0, 6.2]} color="#243044" />
      <SuitNpc position={[-3.1, 0, 3.4]} color="#3a3d46" />
      <SuitNpc position={[10.2, 0, -2.2]} color="#2a303c" />
      <SuitNpc position={[-11.4, 0, -18.6]} color="#4a4038" />
      <SuitNpc position={[12.8, 0, -16.4]} color="#2c3340" />
      <SuitNpc position={[-6.4, 0, 20.6]} color="#3b414c" scale={1.15} />
      <SuitNpc position={[4.2, 0, 22.4]} color="#2a3340" />
      <SuitNpc position={[-10.6, 0, 25.2]} color="#1e2a44" />

      <ShardOrb position={[-16.6, 1.15, -26.4]} taken={collected.includes("forum-a")} />
      <ShardOrb position={[9.8, 1.15, -6.2]} taken={collected.includes("forum-b")} />
      <ShardOrb position={[17.2, 1.15, 20.6]} taken={collected.includes("mart-a")} />
      <ShardOrb position={[-17.2, 1.15, 20.6]} taken={collected.includes("mart-b")} />
      <ShardOrb position={[2.8, 1.15, 30.4]} taken={collected.includes("canopy-a")} />
      <ShardOrb position={[-12.4, 1.15, 22.2]} taken={collected.includes("canopy-b")} />
      <ShardOrb position={[12.6, 1.15, 8.4]} taken={collected.includes("crater-a")} />
      <ShardOrb position={[-2.2, 1.15, -8.4]} taken={collected.includes("crater-b")} />
    </group>
  );
}
