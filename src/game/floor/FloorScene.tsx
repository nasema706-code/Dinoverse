import { FLOOR_BOUNDS, FLOOR_DESKS } from "./layout";
import {
  CeilingLight,
  CoffeeBar,
  Column,
  ElevatorCore,
  Helicopter,
  GlassCurtain,
  GlassFacade,
  LampPost,
  Lights,
  TickerRail,
  Box,
  CheapGlass,
} from "./kit";
import { Atrium } from "./atrium";
import { Cityscape, PlazaTiles } from "./cityscape";
import { useHudTextures } from "./hud-tex";
import { ShardOrb } from "../shard-orb";
import { useQuality } from "../quality";
import { FloorCrew } from "./dinos";
import { PalmPlanter } from "./furniture";
import {
  Boardroom,
  CeilingLeds,
  CommandStation,
  DinoseHolo,
  OfficeGreens,
  OfficeStation,
  OpsStation,
  PlazaDressing,
  ReceptionDesk,
  RexStation,
} from "./zones";

export function FloorScene({ collected }: { collected: string[] }) {
  const hud = useHudTextures();
  const { settings } = useQuality();
  const { minX, maxX, minZ } = FLOOR_BOUNDS;

  return (
    <group>
      <Lights />
      <Cityscape />
      <PlazaTiles />
      <PlazaDressing hud={hud} />
      <FloorCrew />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -4]} receiveShadow={settings.shadows}>
        <planeGeometry args={[36, 40]} />
        <meshStandardMaterial
          color="#9aa3ad"
          roughness={0.16}
          metalness={0.3}
          map={hud?.marble ?? undefined}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4, 0.03, 2.4]}>
        <circleGeometry args={[5.2, 28]} />
        <meshStandardMaterial color="#7a828c" roughness={0.12} metalness={0.38} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 10.2]}>
        <planeGeometry args={[10, 7]} />
        <meshStandardMaterial color="#c5ccd4" roughness={0.1} metalness={0.42} />
      </mesh>
      <Box position={[0, 12.42, -1]} size={[36.4, 0.08, 32]} color="#d8e4ee" metal={0.15} rough={0.35} />
      {settings.atriumDetail ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 12.38, -1]}>
          <planeGeometry args={[36, 32]} />
          <CheapGlass opacity={0.2} color="#e8f4ff" />
        </mesh>
      ) : null}
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
          <mesh position={[-11.4, 4.4, 12.2]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[1.15, 5.2]} />
            <meshBasicMaterial map={hud.banner} toneMapped={false} />
          </mesh>
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
      <DinoseHolo hud={hud} />

      <ReceptionDesk hud={hud} />
      <CoffeeBar position={[-10.4, 0, 12.2]} />
      <CommandStation hud={hud} />

      <TickerRail position={[0, 3.4, 2.6]} w={10.4} />
      <group position={[-17.7, 3.6, -1]} rotation={[0, Math.PI / 2, 0]}>
        <TickerRail position={[0, 0, 0]} w={9} />
      </group>

      {FLOOR_DESKS.map((d) =>
        d.kind === "build" ? (
          <OfficeStation key={d.id} desk={d} hud={hud} />
        ) : d.kind === "rex" ? (
          <RexStation key={d.id} desk={d} hud={hud} />
        ) : (
          <OpsStation key={d.id} desk={d} hud={hud} />
        ),
      )}

      <OfficeGreens />
      <Boardroom hud={hud} />
      <CeilingLeds />

      <Helicopter position={[10.4, 0, 27.6]} />

      <LampPost position={[-16, 0, 20]} />
      <LampPost position={[16, 0, 20]} />
      <LampPost position={[-16, 0, 28]} />
      <LampPost position={[16, 0, 28]} />
      <LampPost position={[0, 0, 32]} />
      <LampPost position={[-8, 0, 24]} />

      <PalmPlanter position={[-3.4, 0, 14.2]} />
      <PalmPlanter position={[3.4, 0, 14.2]} />
      <PalmPlanter position={[-16.4, 0, 18.4]} />
      <PalmPlanter position={[16.4, 0, 18.4]} />

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

      {settings.extraLights ? (
        <>
          <pointLight position={[0, 4.2, 10]} intensity={1.2} distance={16} color="#f0ead8" />
          <pointLight position={[0, 4.2, -2]} intensity={1} distance={16} color="#e4eef8" />
          <pointLight position={[16, 3.6, -1]} intensity={1.4} distance={14} color="#3ecf8e" />
          <pointLight position={[10.4, 3.2, 27.6]} intensity={1.05} distance={14} color="#ffd9a0" />
        </>
      ) : null}

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
