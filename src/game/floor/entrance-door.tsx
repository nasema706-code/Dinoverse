import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, MeshStandardMaterial } from "three";
import type { Collider } from "../districts3d";
import { Box, CheapGlass, TransmissionGlass } from "./kit";

/** Live open amount 0–1, read by the explorer for collision. */
export const entranceDoor = { openAmt: 0 };

const DOOR_Z = 16.18;
const PANEL_W = 2.62;
const PANEL_H = 3.12;
const CLOSED_GAP = 0.05;
const OPEN_SLIDE = 2.58;
const SENSOR_R = 5.6;
const FRAME_X = 2.78;

function panelX(side: -1 | 1, openAmt: number) {
  return side * (PANEL_W / 2 + CLOSED_GAP / 2 + openAmt * OPEN_SLIDE);
}

/** Sliding glass colliders that part with the door. Jambs stay in layout. */
export function entranceDoorHits(): Collider[] {
  const a = entranceDoor.openAmt;
  return [
    { x: panelX(-1, a), z: DOOR_Z, w: PANEL_W, d: 0.28, maxY: 3.4 },
    { x: panelX(1, a), z: DOOR_Z, w: PANEL_W, d: 0.28, maxY: 3.4 },
  ];
}

/**
 * Wide automatic sliding glass doors at the plaza entrance.
 * Panels part when the player approaches on the ground floor.
 */
export function AutoSlidingDoor({ preview = false }: { preview?: boolean }) {
  const left = useRef<Group>(null);
  const right = useRef<Group>(null);
  const sensor = useRef<MeshStandardMaterial>(null);
  const ledL = useRef<MeshStandardMaterial>(null);
  const ledR = useRef<MeshStandardMaterial>(null);
  const open = useRef(preview ? 0.82 : 0);
  const camera = useThree((s) => s.camera);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    let want = preview ? 0.82 : 0;
    if (!preview) {
      const dx = camera.position.x;
      const dz = camera.position.z - DOOR_Z;
      const near = Math.hypot(dx, dz) < SENSOR_R && camera.position.y < 4.2;
      want = near ? 1 : 0;
    }
    const k = 1 - Math.exp(-(want > open.current ? 5.8 : 3.4) * dt);
    open.current += (want - open.current) * k;
    entranceDoor.openAmt = open.current;

    if (left.current) left.current.position.x = panelX(-1, open.current);
    if (right.current) right.current.position.x = panelX(1, open.current);

    const live = open.current > 0.12;
    const glow = live ? "#3ecf8e" : "#d4af6a";
    const intensity = 0.45 + open.current * 1.15;
    if (sensor.current) {
      sensor.current.emissiveIntensity = intensity;
      sensor.current.color.set(glow);
      sensor.current.emissive.set(glow);
    }
    for (const mat of [ledL.current, ledR.current]) {
      if (!mat) continue;
      mat.color.set(glow);
      mat.emissive.set(glow);
      mat.emissiveIntensity = live ? 1.35 : 0.55;
    }
  });

  return (
    <group position={[0, 0, DOOR_Z]}>
      <Box position={[-FRAME_X, 1.58, 0]} size={[0.18, 3.22, 0.32]} color="#c5d0d8" metal={0.74} rough={0.2} />
      <Box position={[FRAME_X, 1.58, 0]} size={[0.18, 3.22, 0.32]} color="#c5d0d8" metal={0.74} rough={0.2} />
      <Box position={[0, 3.22, 0]} size={[5.78, 0.26, 0.42]} color="#c5d0d8" metal={0.78} rough={0.18} />
      <Box position={[0, 3.08, 0.16]} size={[5.5, 0.08, 0.14]} color="#1c1e22" metal={0.45} />
      <Box position={[0, 0.03, 0]} size={[5.52, 0.06, 0.22]} color="#3a3e46" metal={0.62} rough={0.35} />

      <mesh position={[0, 3.05, 0.24]}>
        <boxGeometry args={[2.05, 0.045, 0.06]} />
        <meshStandardMaterial ref={sensor} color="#d4af6a" emissive="#d4af6a" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-1.18, 3.05, 0.28]}>
        <sphereGeometry args={[0.038, 10, 8]} />
        <meshStandardMaterial ref={ledL} color="#d4af6a" emissive="#d4af6a" emissiveIntensity={0.55} />
      </mesh>
      <mesh position={[1.18, 3.05, 0.28]}>
        <sphereGeometry args={[0.038, 10, 8]} />
        <meshStandardMaterial ref={ledR} color="#d4af6a" emissive="#d4af6a" emissiveIntensity={0.55} />
      </mesh>

      <group ref={left} position={[panelX(-1, preview ? 0.82 : 0), 0, 0]}>
        <DoorPanel />
      </group>
      <group ref={right} position={[panelX(1, preview ? 0.82 : 0), 0, 0]}>
        <DoorPanel />
      </group>
    </group>
  );
}

function DoorPanel() {
  const glassW = PANEL_W - 0.1;
  const glassH = PANEL_H - 0.12;
  return (
    <group position={[0, PANEL_H / 2, 0]}>
      <mesh>
        <boxGeometry args={[glassW, glassH, 0.06]} />
        <TransmissionGlass color="#c5e4f4" />
      </mesh>
      <mesh position={[0, -0.18, 0.042]}>
        <planeGeometry args={[glassW - 0.08, 0.38]} />
        <CheapGlass opacity={0.42} color="#9ec4d6" />
      </mesh>
      <Box position={[-PANEL_W / 2 + 0.03, 0, 0.02]} size={[0.06, PANEL_H, 0.08]} color="#c5d0d8" metal={0.78} rough={0.18} />
      <Box position={[PANEL_W / 2 - 0.03, 0, 0.02]} size={[0.06, PANEL_H, 0.08]} color="#c5d0d8" metal={0.78} rough={0.18} />
      <Box position={[0, PANEL_H / 2 - 0.04, 0.02]} size={[PANEL_W, 0.08, 0.08]} color="#c5d0d8" metal={0.78} rough={0.18} />
      <Box position={[0, -PANEL_H / 2 + 0.04, 0.02]} size={[PANEL_W, 0.08, 0.08]} color="#c5d0d8" metal={0.78} rough={0.18} />
      <Box position={[0, 0.02, 0.05]} size={[0.04, glassH - 0.2, 0.02]} color="#d4af6a" metal={0.55} rough={0.28} />
    </group>
  );
}
