import type { Texture } from "three";
import type { FloorDesk } from "./layout";
import { L2_HEIGHT } from "./levels";
import { Box, CheapGlass, TransmissionGlass } from "./kit";
import { useQuality } from "../quality";
import {
  CharacterSlot,
  DeskProjector,
  ExecChair,
  GlassDesk,
  HoloKeyboard,
  HoloPanel,
  HqLetteringBoard,
  LEDStrip,
  LandingPad,
  LoungeSeat,
  MarkSculpture,
  MeshChair,
  PalmPlanter,
  PlazaBench,
  Rope,
  Stanchion,
  TroughPlanter,
  WasteBin,
  WoodDesk,
  DirectoryTotem,
  Bollard,
} from "./furniture";

type Hud = {
  dinose: Texture;
  ticker: Texture;
  q2: Texture;
  ops: Texture;
  portfolio: Texture;
  species: Texture;
  code: Texture;
  checkin: Texture;
  visitors: Texture;
  plaque: Texture;
  hqSign: Texture;
  banner: Texture;
  grid: Texture;
} | null;

export function PlazaDressing({ hud }: { hud: Hud }) {
  return (
    <group>
      <LandingPad position={[10.4, 0, 27.6]} />
      <PalmPlanter position={[-4.2, 0, 18.2]} />
      <PalmPlanter position={[4.2, 0, 18.2]} />
      <TroughPlanter position={[-7.2, 0, 17.4]} w={1.6} d={0.42} />
      <TroughPlanter position={[7.2, 0, 17.4]} w={1.6} d={0.42} />
      <HqLetteringBoard fallback={hud?.hqSign ?? null} />
      <DirectoryTotem map={hud?.banner ?? null} position={[-6.5, 0, 18.6]} />
      <MarkSculpture position={[-6.6, 0, 21.2]} />
      <PlazaBench position={[-10.2, 0, 22.4]} rotY={0.4} />
      <PlazaBench position={[6.6, 0, 21.8]} rotY={-0.35} />
      <PlazaBench position={[-1.8, 0, 30.2]} rotY={Math.PI} />
      <Stanchion position={[-1.85, 0, 16.55]} />
      <Stanchion position={[1.85, 0, 16.55]} />
      <Stanchion position={[-1.85, 0, 15.15]} />
      <Stanchion position={[1.85, 0, 15.15]} />
      <Rope from={[-1.85, 0, 16.55]} to={[-1.85, 0, 15.15]} />
      <Rope from={[1.85, 0, 16.55]} to={[1.85, 0, 15.15]} />
      <Bollard position={[-2.8, 0, 19.4]} />
      <Bollard position={[2.8, 0, 19.4]} />
      <Bollard position={[-2.8, 0, 23.2]} />
      <Bollard position={[2.8, 0, 23.2]} />
      <WasteBin position={[-9.4, 0, 17.8]} />
      <WasteBin position={[8.8, 0, 17.8]} />
      <LoungeSeat position={[-8.6, 0, 13.55]} rotY={0.35} />
      <LoungeSeat position={[-7.4, 0, 12.6]} rotY={-0.9} />
      <Box position={[-8.1, 0.28, 13.05]} size={[0.55, 0.08, 0.55]} color="#2a2d33" metal={0.35} />
    </group>
  );
}

export function ReceptionDesk({ hud }: { hud: Hud }) {
  const segs = [-1.55, -0.95, -0.35, 0.35, 0.95, 1.55];
  return (
    <group position={[0, 0, 10.15]}>
      {segs.map((x, i) => (
        <Box
          key={i}
          position={[x, 0.52, 0.22 * (x * x) / 2.4]}
          size={[0.68, 1.04, 1.08]}
          color="#8a9098"
          metal={0.18}
          rough={0.48}
        />
      ))}
      <Box position={[0, 1.08, 0.12]} size={[3.85, 0.06, 1.18]} color="#4a4e56" metal={0.28} rough={0.38} />
      <LEDStrip position={[0, 0.18, 0.58]} size={[3.6, 0.03, 0.04]} />
      <LEDStrip position={[0, 0.62, 0.58]} size={[3.4, 0.02, 0.03]} />
      {hud ? (
        <mesh position={[0, 0.72, 0.6]}>
          <planeGeometry args={[2.4, 0.42]} />
          <meshBasicMaterial map={hud.plaque} toneMapped={false} />
        </mesh>
      ) : null}
      <Box position={[-0.55, 1.12, 0.05]} size={[0.7, 0.02, 0.42]} color="#121418" metal={0.4} />
      <Box position={[0.55, 1.12, 0.05]} size={[0.7, 0.02, 0.42]} color="#121418" metal={0.4} />
      <Box position={[1.35, 1.22, -0.05]} size={[0.42, 0.28, 0.32]} color="#2a2d33" metal={0.35} />
      {hud ? (
        <>
          <HoloPanel map={hud.checkin} position={[-0.85, 1.85, 0.15]} w={1.25} h={0.82} />
          <HoloPanel map={hud.visitors} position={[0.95, 1.85, 0.15]} w={1.25} h={0.82} />
        </>
      ) : null}
      <ExecChair position={[0, 0, -0.85]} rotY={Math.PI} />
      <CharacterSlot name="slot-sec-desk" position={[0, 0, -0.85]} />
    </group>
  );
}

export function CommandStation({ hud }: { hud: Hud }) {
  return (
    <group position={[8.4, 0, 6.4]}>
      <Box position={[0, 0.42, 0]} size={[2.4, 0.84, 1.15]} color="#2a2e34" metal={0.35} rough={0.4} />
      <LEDStrip position={[0, 0.08, 0.58]} size={[2.2, 0.03, 0.04]} />
      <mesh position={[0, 0.86, 0]}>
        <boxGeometry args={[2.5, 0.05, 1.2]} />
        <CheapGlassTop />
      </mesh>
      {hud ? (
        <>
          <HoloPanel map={hud.ops} position={[-0.55, 1.55, -0.12]} w={1.05} h={0.7} />
          <HoloPanel map={hud.portfolio} position={[0.55, 1.58, -0.08]} w={1.05} h={0.72} />
          <HoloPanel map={hud.ticker} position={[0, 1.95, -0.22]} w={1.7} h={0.55} />
        </>
      ) : null}
      <ExecChair position={[0, 0, 0.95]} rotY={Math.PI} />
      <CharacterSlot name="slot-command" position={[0, 0, 0.95]} />
    </group>
  );
}

function CheapGlassTop() {
  return <TransmissionGlass color="#9ec8dc" />;
}

export function DinoseHolo({ hud }: { hud: Hud }) {
  const { settings } = useQuality();
  if (!hud) return null;
  return (
    <group>
      <HoloPanel map={hud.dinose} position={[-4.2, 3.55, 2.4]} w={3.4} h={2.1} />
      {settings.atriumDetail ? (
        <>
          <HoloPanel map={hud.ticker} position={[0, L2_HEIGHT + 1.85, 8.2]} w={4.4} h={0.85} />
          <HoloPanel map={hud.ticker} position={[-6.4, L2_HEIGHT + 1.7, 1.1]} rotY={Math.PI / 2} w={3.6} h={0.7} />
          <HoloPanel map={hud.ticker} position={[6.4, L2_HEIGHT + 1.7, 1.1]} rotY={-Math.PI / 2} w={3.6} h={0.7} />
        </>
      ) : null}
    </group>
  );
}

export function OpsStation({ desk, hud }: { desk: FloorDesk; hud: Hud }) {
  const back = 0.82;
  const chair: [number, number, number] = [
    desk.x + Math.sin(desk.rotY) * back,
    0,
    desk.z + Math.cos(desk.rotY) * back,
  ];
  return (
    <group>
      <GlassDesk position={[desk.x, 0, desk.z]} rotY={desk.rotY} />
      <group position={[desk.x, 0, desk.z]} rotation={[0, desk.rotY, 0]}>
        <HoloKeyboard map={hud?.grid ?? null} position={[0, 0.78, 0.12]} />
        <DeskProjector position={[0, 0.8, -0.18]} />
        <mesh position={[0, 0.765, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.16, 20]} />
          <meshBasicMaterial color="#5ec8ff" transparent opacity={0.28} depthWrite={false} />
        </mesh>
        {hud ? (
          <>
            <HoloPanel map={hud.ops} position={[-0.42, 1.42, -0.18]} w={0.95} h={0.62} />
            <HoloPanel map={hud.portfolio} position={[0.42, 1.48, -0.12]} w={0.9} h={0.68} />
            <HoloPanel map={hud.species} position={[0, 1.72, -0.28]} w={1.05} h={0.48} />
          </>
        ) : null}
      </group>
      <ExecChair position={chair} rotY={desk.rotY} />
      <CharacterSlot name={`slot-ops-${desk.id}`} position={chair} />
    </group>
  );
}

export function OfficeStation({ desk, hud }: { desk: FloorDesk; hud: Hud }) {
  const back = 0.82;
  const chair: [number, number, number] = [
    desk.x + Math.sin(desk.rotY) * back,
    0,
    desk.z + Math.cos(desk.rotY) * back,
  ];
  return (
    <group>
      <WoodDesk position={[desk.x, 0, desk.z]} rotY={desk.rotY} />
      <group position={[desk.x, 0, desk.z]} rotation={[0, desk.rotY, 0]}>
        <DeskProjector position={[-0.35, 0.82, -0.12]} />
        {hud ? <HoloPanel map={hud.code} position={[-0.2, 1.42, -0.16]} w={1.15} h={0.72} /> : null}
      </group>
      <MeshChair position={chair} rotY={desk.rotY} />
      <CharacterSlot name={`slot-dev-${desk.id}`} position={chair} />
    </group>
  );
}

export function RexStation({ desk, hud }: { desk: FloorDesk; hud: Hud }) {
  const back = 0.9;
  const chair: [number, number, number] = [
    desk.x + Math.sin(desk.rotY) * back,
    0,
    desk.z + Math.cos(desk.rotY) * back,
  ];
  return (
    <group>
      <GlassDesk position={[desk.x, 0, desk.z]} rotY={desk.rotY} w={2.15} d={1.05} />
      <group position={[desk.x, 0, desk.z]} rotation={[0, desk.rotY, 0]}>
        {hud ? (
          <>
            <HoloPanel map={hud.ops} position={[-0.48, 1.48, -0.22]} w={1.05} h={0.7} />
            <HoloPanel map={hud.q2} position={[0.48, 1.48, -0.22]} w={1.05} h={0.7} />
          </>
        ) : null}
      </group>
      <ExecChair position={chair} rotY={desk.rotY} />
      <CharacterSlot name="slot-rex-desk" position={chair} />
    </group>
  );
}

export function Boardroom({ hud }: { hud: Hud }) {
  const seats: [number, number, number, number][] = [
    [11.35, 0, -16.4, Math.PI / 2],
    [11.35, 0, -18.6, Math.PI / 2],
    [13.45, 0, -16.4, -Math.PI / 2],
    [13.45, 0, -18.6, -Math.PI / 2],
  ];
  return (
    <group>
      <mesh position={[12.4, 0.74, -18]}>
        <boxGeometry args={[1.85, 0.06, 4.4]} />
        <CheapGlass opacity={0.32} color="#1a2834" />
      </mesh>
      <mesh position={[12.4, 0.775, -18]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.7, 4.2]} />
        <meshBasicMaterial
          map={hud?.grid ?? undefined}
          color="#5ec8ff"
          transparent
          opacity={0.28}
          depthWrite={false}
        />
      </mesh>
      <Box position={[12.4, 0.36, -18]} size={[0.12, 0.72, 3.8]} color="#2a2d33" metal={0.5} />
      {hud ? <HoloPanel map={hud.q2} position={[12.4, 1.85, -20.55]} w={2.4} h={1.45} /> : null}
      {seats.map(([x, y, z, rot], i) => (
        <group key={i}>
          <ExecChair position={[x, y, z]} rotY={rot} />
          <group position={[12.4 + (i < 2 ? -0.38 : 0.38), 0.8, z]} rotation={[0, rot, 0]}>
            <mesh>
              <boxGeometry args={[0.24, 0.02, 0.34]} />
              <meshStandardMaterial color="#121418" metalness={0.45} roughness={0.32} />
            </mesh>
            {hud ? (
              <mesh position={[0, 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.2, 0.3]} />
                <meshBasicMaterial
                  map={i % 2 ? hud.code : hud.ops}
                  toneMapped={false}
                  transparent
                  opacity={0.92}
                />
              </mesh>
            ) : null}
          </group>
        </group>
      ))}
      <CharacterSlot name="slot-briefing-lead" position={[12.4, 0, -20.2]} />
      <PalmPlanter position={[16.2, 0, -14.2]} />
      <PalmPlanter position={[16.2, 0, -22.2]} />
    </group>
  );
}

export function OfficeGreens() {
  return (
    <>
      <PalmPlanter position={[-17.2, 0, -12.6]} />
      <PalmPlanter position={[-6.6, 0, -12.6]} />
      <PalmPlanter position={[-17.2, 0, -22.8]} />
      <TroughPlanter position={[-11.8, 0, -17.8]} w={1.8} d={0.38} />
    </>
  );
}

export function CeilingLeds() {
  return (
    <>
      <LEDStrip position={[0, 12.05, -2]} size={[14, 0.04, 0.08]} color="#e8f4ff" />
      <LEDStrip position={[0, 12.05, -5]} size={[10, 0.04, 0.08]} color="#e8f4ff" />
      <LEDStrip position={[-12, 12.05, -17]} size={[6, 0.04, 0.08]} color="#e8f4ff" />
      <LEDStrip position={[12.4, 12.05, -18]} size={[5, 0.04, 0.08]} color="#e8f4ff" />
    </>
  );
}
