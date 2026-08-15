import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import {
  CanvasTexture,
  CatmullRomCurve3,
  DoubleSide,
  ExtrudeGeometry,
  Path,
  Shape,
  SRGBColorSpace,
  TubeGeometry,
  Vector3,
} from "three";
import { Box, CheapGlass, Plant } from "./kit";
import { useHudTextures } from "./hud-tex";
import { useQuality } from "../quality";
import { L2_HEIGHT, MEZZ, SPIRAL, spiralPoint } from "./levels";
import { getLiftFloorY, LIFT, LIFT_GROUND_ANG, liftBusy, liftMezzAng } from "./lift";

const STEPS = 52;
const STEP_W = SPIRAL.r1 - SPIRAL.r0;
const METAL = "#c5d0d8";
const STONE = "#9aa3ad";

function steps() {
  return Array.from({ length: STEPS }, (_, i) => {
    const t = i / (STEPS - 1);
    return { i, t, ...spiralPoint(t) };
  });
}

function MezzWest() {
  const well = useMemo(() => {
    const s = SPIRAL.r1 + 0.14;
    const shape = new Shape();
    shape.moveTo(-s, -s);
    shape.lineTo(s, -s);
    shape.lineTo(s, s);
    shape.lineTo(-s, s);
    shape.closePath();
    const hole = new Path();
    hole.absarc(0, 0, SPIRAL.r1 + 0.1, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const g = new ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: false, curveSegments: 16 });
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);

  const s = SPIRAL.r1 + 0.14;
  const zMid = (MEZZ.deckMinZ + MEZZ.deckMaxZ) / 2;
  const zSpan = MEZZ.deckMaxZ - MEZZ.deckMinZ;
  const westW = SPIRAL.cx - s - MEZZ.deckMinX;
  const eastW = MEZZ.holeMinX - (SPIRAL.cx + s);
  const northD = MEZZ.deckMaxZ - (SPIRAL.cz + s);
  const southD = SPIRAL.cz - s - MEZZ.deckMinZ;

  return (
    <group>
      <mesh geometry={well} position={[SPIRAL.cx, L2_HEIGHT - 0.06, SPIRAL.cz]} receiveShadow>
        <meshStandardMaterial color={STONE} metalness={0.22} roughness={0.28} />
      </mesh>
      <Box
        position={[MEZZ.deckMinX + westW / 2, L2_HEIGHT, zMid]}
        size={[westW, 0.12, zSpan]}
        color={STONE}
        metal={0.22}
        rough={0.28}
      />
      <Box
        position={[SPIRAL.cx + s + eastW / 2, L2_HEIGHT, zMid]}
        size={[eastW, 0.12, zSpan]}
        color={STONE}
        metal={0.22}
        rough={0.28}
      />
      <Box
        position={[SPIRAL.cx, L2_HEIGHT, SPIRAL.cz + s + northD / 2]}
        size={[s * 2, 0.12, northD]}
        color={STONE}
        metal={0.22}
        rough={0.28}
      />
      <Box
        position={[SPIRAL.cx, L2_HEIGHT, SPIRAL.cz - s - southD / 2]}
        size={[s * 2, 0.12, southD]}
        color={STONE}
        metal={0.22}
        rough={0.28}
      />
    </group>
  );
}

function HelixRail({ radius, yOff }: { radius: number; yOff: number }) {
  const geom = useMemo(() => {
    const pts = Array.from({ length: 72 }, (_, i) => {
      const t = i / 71;
      const p = spiralPoint(t);
      return new Vector3(
        SPIRAL.cx + Math.sin(p.ang) * radius,
        p.y + yOff,
        SPIRAL.cz + Math.cos(p.ang) * radius,
      );
    });
    return new TubeGeometry(new CatmullRomCurve3(pts), 72, 0.032, 6, false);
  }, [radius, yOff]);

  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color={METAL} metalness={0.82} roughness={0.2} />
    </mesh>
  );
}

export function Atrium() {
  const hud = useHudTextures();
  const { settings } = useQuality();
  const stair = useMemo(() => steps(), []);
  const top = spiralPoint(1);
  const landRadial: [number, number, number] = [
    top.x + Math.sin(top.ang) * 0.85,
    L2_HEIGHT,
    top.z + Math.cos(top.ang) * 0.85,
  ];

  return (
    <group>
      <AtriumLift />
      <mesh position={[SPIRAL.cx, 0.04, SPIRAL.cz]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[SPIRAL.r0 - 0.15, 24]} />
        <meshStandardMaterial color="#8b949e" metalness={0.25} roughness={0.3} />
      </mesh>
      <mesh position={[SPIRAL.cx, 0.05, SPIRAL.cz]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[SPIRAL.r0 - 0.12, SPIRAL.r1 + 0.18, 40]} />
        <meshStandardMaterial color="#7f8892" metalness={0.2} roughness={0.38} />
      </mesh>

      {stair.map((s) => (
        <group key={s.i} position={[s.x, s.y + 0.07, s.z]} rotation={[0, s.ang, 0]}>
          <mesh castShadow={settings.shadows} receiveShadow={settings.shadows}>
            <boxGeometry args={[STEP_W, 0.16, 0.5]} />
            <meshStandardMaterial color={STONE} metalness={0.22} roughness={0.28} />
          </mesh>
          {settings.atriumDetail ? (
            <>
              <mesh position={[0, 0.52, -0.2]}>
                <boxGeometry args={[STEP_W + 0.04, 0.92, 0.04]} />
                <CheapGlass opacity={0.22} />
              </mesh>
              <mesh position={[-STEP_W / 2, 0.52, -0.2]}>
                <boxGeometry args={[0.05, 1.04, 0.05]} />
                <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.22} />
              </mesh>
              <mesh position={[STEP_W / 2, 0.52, -0.2]}>
                <boxGeometry args={[0.05, 1.04, 0.05]} />
                <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.22} />
              </mesh>
            </>
          ) : null}
        </group>
      ))}

      {settings.atriumDetail ? (
        <>
          <HelixRail radius={SPIRAL.r1 - 0.04} yOff={1.04} />
          <HelixRail radius={SPIRAL.r0 + 0.04} yOff={1.04} />
          {Array.from({ length: 18 }, (_, i) => {
            const t = i / 17;
            const p = spiralPoint(t);
            const r = SPIRAL.r0 - 0.08;
            return (
              <mesh
                key={`inner-${i}`}
                position={[SPIRAL.cx + Math.sin(p.ang) * r, p.y + 0.55, SPIRAL.cz + Math.cos(p.ang) * r]}
              >
                <cylinderGeometry args={[0.035, 0.035, 1.05, 6]} />
                <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.22} />
              </mesh>
            );
          })}
        </>
      ) : null}

      <MezzWest />

      <Box
        position={[(MEZZ.holeMaxX + 17.5) / 2, L2_HEIGHT, (MEZZ.deckMinZ + MEZZ.deckMaxZ) / 2]}
        size={[17.5 - MEZZ.holeMaxX, 0.12, MEZZ.deckMaxZ - MEZZ.deckMinZ]}
        color={STONE}
        metal={0.22}
        rough={0.28}
      />
      <Box
        position={[0, L2_HEIGHT, (MEZZ.holeMaxZ + MEZZ.deckMaxZ) / 2]}
        size={[MEZZ.holeMaxX - MEZZ.holeMinX, 0.12, MEZZ.deckMaxZ - MEZZ.holeMaxZ]}
        color={STONE}
        metal={0.22}
        rough={0.28}
      />
      <Box
        position={[0, L2_HEIGHT, (MEZZ.holeMinZ + MEZZ.deckMinZ) / 2]}
        size={[MEZZ.holeMaxX - MEZZ.holeMinX, 0.12, MEZZ.holeMinZ - MEZZ.deckMinZ]}
        color={STONE}
        metal={0.22}
        rough={0.28}
      />

      <GlassRail x={0} z={MEZZ.holeMaxZ} w={14.5} d={0.08} />
      <GlassRail x={0} z={MEZZ.holeMinZ} w={14.5} d={0.08} />
      <GlassRail x={MEZZ.holeMinX} z={1.1} w={0.08} d={15.2} />
      <GlassRail x={MEZZ.holeMaxX} z={1.1} w={0.08} d={15.2} />

      {settings.atriumDetail
        ? Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const x = SPIRAL.cx + Math.sin(a) * (SPIRAL.r1 + 0.14);
            const z = SPIRAL.cz + Math.cos(a) * (SPIRAL.r1 + 0.14);
            if (Math.hypot(x - top.x, z - top.z) < 1.7) return null;
            return (
              <group key={`well-${i}`} position={[x, L2_HEIGHT + 0.52, z]}>
                <mesh>
                  <boxGeometry args={[0.55, 1.02, 0.06]} />
                  <CheapGlass opacity={0.2} />
                </mesh>
                <mesh position={[0, 0.54, 0]}>
                  <boxGeometry args={[0.58, 0.05, 0.07]} />
                  <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.2} />
                </mesh>
              </group>
            );
          })
        : null}

      <mesh position={landRadial} rotation={[0, top.ang, 0]}>
        <boxGeometry args={[STEP_W + 0.55, 0.12, 2.15]} />
        <meshStandardMaterial color={STONE} metalness={0.22} roughness={0.28} />
      </mesh>
      <LiftBridge ang={top.ang} />

      <mesh position={[0, L2_HEIGHT + 0.02, 3]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.05, 7.05, 40]} />
        <meshStandardMaterial color="#c5ccd4" metalness={0.35} roughness={0.32} />
      </mesh>

      <Plant position={[-14.6, L2_HEIGHT, 12.2]} />
      <Plant position={[14.6, L2_HEIGHT, 12.2]} />
      <Plant position={[-14.4, L2_HEIGHT, -7.4]} />
      <Plant position={[14.4, L2_HEIGHT, -7.4]} />
      <Plant position={[-9.2, L2_HEIGHT, 13.2]} />
      <Plant position={[9.2, L2_HEIGHT, 13.2]} />

      {hud ? (
        <mesh position={[0, L2_HEIGHT + 2.1, 8.35]}>
          <planeGeometry args={[4.2, 1.5]} />
          <meshBasicMaterial map={hud.ticker} toneMapped={false} transparent opacity={0.88} />
        </mesh>
      ) : null}

      <pointLight
        position={[SPIRAL.cx, 4.2, SPIRAL.cz]}
        intensity={settings.extraLights ? 1.15 : 0.85}
        distance={11}
        color="#e8f4ff"
      />
      {settings.extraLights ? (
        <pointLight position={[0, L2_HEIGHT + 2.4, 4]} intensity={0.7} distance={14} color="#d7eefc" />
      ) : null}
    </group>
  );
}

function LiftBridge({ ang }: { ang: number }) {
  const r0 = LIFT.r + 0.06;
  const r1 = SPIRAL.r0 + 0.22;
  const mid = (r0 + r1) / 2;
  const len = r1 - r0;
  return (
    <group position={[SPIRAL.cx + Math.sin(ang) * mid, L2_HEIGHT, SPIRAL.cz + Math.cos(ang) * mid]} rotation={[0, ang, 0]}>
      <mesh>
        <boxGeometry args={[1.72, 0.1, len]} />
        <meshStandardMaterial color="#1c222a" metalness={0.45} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.52, len - 0.08]} />
        <meshBasicMaterial color="#5ec8ff" transparent opacity={0.22} toneMapped={false} />
      </mesh>
      <Box position={[-0.82, 0.08, 0]} size={[0.08, 0.06, len]} color="#c9a45a" metal={0.82} eInt={0.7} emissive="#c9a45a" />
      <Box position={[0.82, 0.08, 0]} size={[0.08, 0.06, len]} color="#c9a45a" metal={0.82} eInt={0.7} emissive="#c9a45a" />
      {[-0.35, 0.05, 0.45].map((z) => (
        <mesh key={z} position={[0, 0.08, z]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.14, 0.28, 3]} />
          <meshBasicMaterial color="#7ee0ff" toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[-0.82, 0.55, 0]}>
        <boxGeometry args={[0.05, 1.05, len]} />
        <CheapGlass opacity={0.2} />
      </mesh>
      <mesh position={[0.82, 0.55, 0]}>
        <boxGeometry args={[0.05, 1.05, len]} />
        <CheapGlass opacity={0.2} />
      </mesh>
    </group>
  );
}

function liftLabel(text: string, w = 512, h = 160) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#0c1016";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#d4af6a";
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, w - 16, h - 16);
  ctx.fillStyle = "#5ec8ff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${h * 0.42}px ui-sans-serif, system-ui, sans-serif`;
  ctx.fillText(text, w / 2, h / 2 + 4);
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  map.needsUpdate = true;
  return map;
}

function LiftSign({
  text,
  position,
  rotY = 0,
  w = 1.15,
  h = 0.36,
}: {
  text: string;
  position: [number, number, number];
  rotY?: number;
  w?: number;
  h?: number;
}) {
  const map = useMemo(() => (typeof document === "undefined" ? null : liftLabel(text)), [text]);
  if (!map) return null;
  return (
    <mesh position={position} rotation={[0, rotY, 0]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={map} toneMapped={false} side={DoubleSide} />
    </mesh>
  );
}

function GroundApron() {
  const ang = LIFT_GROUND_ANG;
  const r0 = LIFT.r + 0.08;
  const r1 = 2.65;
  const mid = (r0 + r1) / 2;
  const len = r1 - r0;
  return (
    <group position={[LIFT.cx + Math.sin(ang) * mid, 0, LIFT.cz + Math.cos(ang) * mid]} rotation={[0, ang, 0]}>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[1.7, 0.08, len]} />
        <meshStandardMaterial color="#1a1e24" metalness={0.4} roughness={0.32} />
      </mesh>
      <Box position={[-0.82, 0.07, 0]} size={[0.08, 0.06, len]} color="#c9a45a" metal={0.8} eInt={0.65} emissive="#c9a45a" />
      <Box position={[0.82, 0.07, 0]} size={[0.08, 0.06, len]} color="#c9a45a" metal={0.8} eInt={0.65} emissive="#c9a45a" />
      {[-0.45, 0, 0.45].map((z) => (
        <mesh key={z} position={[0, 0.09, z]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.15, 0.3, 3]} />
          <meshBasicMaterial color="#7ee0ff" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function AtriumLift() {
  const cab = useRef<Group>(null);
  const { settings } = useQuality();
  useFrame(() => {
    if (cab.current) cab.current.position.y = getLiftFloorY();
  });
  const R = LIFT.r;
  const mezzAng = liftMezzAng();
  return (
    <group>
      <group position={[LIFT.cx, 0, LIFT.cz]}>
        <mesh position={[0, 6.1, 0]}>
          <cylinderGeometry args={[R + 0.08, R + 0.08, 12.2, 28, 1, true]} />
          <CheapGlass opacity={0.14} color="#c8e8ff" />
        </mesh>
        {[0.08, 3, 6, 9, 11.7].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <torusGeometry args={[R + 0.09, 0.035, 8, 28]} />
            <meshStandardMaterial color="#c5d0d8" metalness={0.82} roughness={0.2} />
          </mesh>
        ))}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * (R + 0.09), 6.1, 0]}>
            <boxGeometry args={[0.04, 12.2, 0.04]} />
            <meshStandardMaterial color="#5ec8ff" emissive="#5ec8ff" emissiveIntensity={1.15} />
          </mesh>
        ))}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[R - 0.02, R + 0.16, 28]} />
          <meshStandardMaterial color="#2a2d33" metalness={0.55} roughness={0.32} />
        </mesh>
        <mesh position={[0, L2_HEIGHT + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[R - 0.02, R + 0.16, 28]} />
          <meshStandardMaterial color="#c5ccd4" metalness={0.45} roughness={0.28} />
        </mesh>

        <group ref={cab}>
          <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[R - 0.04, 28]} />
            <meshStandardMaterial color="#1c222a" metalness={0.55} roughness={0.28} />
          </mesh>
          <mesh position={[0, 0.055, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[R - 0.22, R - 0.06, 28]} />
            <meshStandardMaterial color="#5ec8ff" emissive="#5ec8ff" emissiveIntensity={0.85} />
          </mesh>
          <mesh position={[0, LIFT.cabH / 2, 0]}>
            <cylinderGeometry args={[R - 0.05, R - 0.05, LIFT.cabH, 28, 1, true]} />
            <CheapGlass opacity={0.22} color="#d7f2ff" />
          </mesh>
          <mesh position={[0, LIFT.cabH, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[R - 0.04, 28]} />
            <meshStandardMaterial color="#2a3038" metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <torusGeometry args={[R - 0.06, 0.03, 8, 24]} />
            <meshStandardMaterial color="#c9a45a" metalness={0.8} roughness={0.22} />
          </mesh>
          <mesh position={[0, LIFT.cabH - 0.08, 0]}>
            <torusGeometry args={[R - 0.06, 0.03, 8, 24]} />
            <meshStandardMaterial color="#c9a45a" metalness={0.8} roughness={0.22} />
          </mesh>
          {settings.extraLights ? (
            <pointLight position={[0, 1.8, 0]} intensity={0.85} distance={5.5} color="#d8f4ff" />
          ) : null}
        </group>
      </group>

      <GroundApron />
      <DoorPortal ang={LIFT_GROUND_ANG} y={0} title="LIFT" subtitle="ENTER" floor="g" />
      <DoorPortal ang={mezzAng} y={L2_HEIGHT} title="LIFT" subtitle="EXIT Â· L2" floor="m" />
      <LiftSign text="LIFT" position={[LIFT.cx + 2.55, 2.72, LIFT.cz]} rotY={Math.PI / 2} w={1.7} h={0.5} />
    </group>
  );
}

function DoorPortal({
  ang,
  y,
  title,
  subtitle,
  floor,
}: {
  ang: number;
  y: number;
  title: string;
  subtitle: string;
  floor: "g" | "m";
}) {
  const r = LIFT.r + 0.22;
  const bars = useRef<Mesh[]>([]);
  const pad = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const cab = getLiftFloorY();
    const on = !liftBusy() && (floor === "g" ? cab < 0.25 : cab > L2_HEIGHT - 0.25);
    const pulse = on ? 1.25 + Math.sin(clock.elapsedTime * 3.2) * 0.7 : 0.22;
    for (const mesh of bars.current) {
      if (mesh) (mesh.material as { emissiveIntensity: number }).emissiveIntensity = pulse;
    }
    if (pad.current) {
      (pad.current.material as { opacity: number }).opacity = on ? 0.42 : 0.16;
    }
  });
  const setBar = (i: number) => (el: Mesh | null) => {
    if (el) bars.current[i] = el;
  };
  return (
    <group position={[LIFT.cx + Math.sin(ang) * r, y, LIFT.cz + Math.cos(ang) * r]} rotation={[0, ang, 0]}>
      <Box position={[-0.82, 1.15, 0]} size={[0.14, 2.3, 0.14]} color="#c9a45a" metal={0.84} rough={0.2} />
      <Box position={[0.82, 1.15, 0]} size={[0.14, 2.3, 0.14]} color="#c9a45a" metal={0.84} rough={0.2} />
      <Box position={[0, 2.34, 0]} size={[1.82, 0.16, 0.18]} color="#c9a45a" metal={0.84} rough={0.2} />
      <mesh ref={setBar(0)} position={[-0.82, 1.15, 0.08]}>
        <boxGeometry args={[0.045, 2.16, 0.045]} />
        <meshStandardMaterial color="#5ec8ff" emissive="#5ec8ff" emissiveIntensity={1.2} />
      </mesh>
      <mesh ref={setBar(1)} position={[0.82, 1.15, 0.08]}>
        <boxGeometry args={[0.045, 2.16, 0.045]} />
        <meshStandardMaterial color="#5ec8ff" emissive="#5ec8ff" emissiveIntensity={1.2} />
      </mesh>
      <mesh ref={setBar(2)} position={[0, 2.34, 0.1]}>
        <boxGeometry args={[1.62, 0.055, 0.055]} />
        <meshStandardMaterial color="#5ec8ff" emissive="#5ec8ff" emissiveIntensity={1.2} />
      </mesh>
      <LiftSign text={title} position={[0, 2.68, 0.12]} w={1.45} h={0.42} />
      <LiftSign text={subtitle} position={[0, 2.24, 0.13]} w={1.15} h={0.24} />
      <mesh ref={pad} position={[0, 0.035, 0.42]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.65, 0.95]} />
        <meshBasicMaterial color="#5ec8ff" transparent opacity={0.35} toneMapped={false} depthWrite={false} />
      </mesh>
      {[-0.18, 0.16, 0.5].map((z) => (
        <mesh key={z} position={[0, 0.055, z]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.14, 0.28, 3]} />
          <meshBasicMaterial color="#9aeeff" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function GlassRail({ x, z, w, d }: { x: number; z: number; w: number; d: number }) {
  const alongX = w >= d;
  return (
    <group position={[x, L2_HEIGHT + 0.55, z]}>
      <mesh>
        <boxGeometry args={[alongX ? w : 0.06, 1.05, alongX ? 0.06 : d]} />
        <CheapGlass opacity={0.2} />
      </mesh>
      <mesh position={[0, 0.54, 0]}>
        <boxGeometry args={[alongX ? w : 0.07, 0.05, alongX ? 0.07 : d]} />
        <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

