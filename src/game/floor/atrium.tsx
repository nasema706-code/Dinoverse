import { useMemo } from "react";
import {
  CatmullRomCurve3,
  DoubleSide,
  ExtrudeGeometry,
  Path,
  Shape,
  TubeGeometry,
  Vector3,
} from "three";
import { Box, Plant, SuitNpc } from "./kit";
import { useHudTextures } from "./hud-tex";
import { L2_HEIGHT, MEZZ, SPIRAL, spiralPoint } from "./levels";

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
    const g = new ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: false, curveSegments: 40 });
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
  const stair = steps();
  const top = spiralPoint(1);
  const landRadial: [number, number, number] = [
    top.x + Math.sin(top.ang) * 0.85,
    L2_HEIGHT,
    top.z + Math.cos(top.ang) * 0.85,
  ];

  return (
    <group>
      <mesh position={[SPIRAL.cx, 6.2, SPIRAL.cz]}>
        <cylinderGeometry args={[SPIRAL.r0 - 0.22, SPIRAL.r0 - 0.22, 12.4, 24]} />
        <meshPhysicalMaterial
          color="#d7eefc"
          transmission={0.88}
          roughness={0.04}
          transparent
          opacity={0.18}
          thickness={0.2}
          side={DoubleSide}
        />
      </mesh>
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
          <mesh castShadow receiveShadow>
            <boxGeometry args={[STEP_W, 0.16, 0.5]} />
            <meshStandardMaterial color={STONE} metalness={0.22} roughness={0.28} />
          </mesh>
          <mesh position={[0, 0.52, -0.2]}>
            <boxGeometry args={[STEP_W + 0.04, 0.92, 0.04]} />
            <meshPhysicalMaterial
              color="#d7eefc"
              transmission={0.7}
              transparent
              opacity={0.22}
              roughness={0.06}
              side={DoubleSide}
            />
          </mesh>
          <mesh position={[-STEP_W / 2, 0.52, -0.2]}>
            <boxGeometry args={[0.05, 1.04, 0.05]} />
            <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.22} />
          </mesh>
          <mesh position={[STEP_W / 2, 0.52, -0.2]}>
            <boxGeometry args={[0.05, 1.04, 0.05]} />
            <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.22} />
          </mesh>
        </group>
      ))}

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

      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const x = SPIRAL.cx + Math.sin(a) * (SPIRAL.r1 + 0.14);
        const z = SPIRAL.cz + Math.cos(a) * (SPIRAL.r1 + 0.14);
        if (Math.hypot(x - top.x, z - top.z) < 1.7) return null;
        return (
          <group key={`well-${i}`} position={[x, L2_HEIGHT + 0.52, z]}>
            <mesh>
              <boxGeometry args={[0.55, 1.02, 0.06]} />
              <meshPhysicalMaterial
                color="#d7eefc"
                transmission={0.8}
                transparent
                opacity={0.2}
                roughness={0.05}
                side={DoubleSide}
              />
            </mesh>
            <mesh position={[0, 0.54, 0]}>
              <boxGeometry args={[0.58, 0.05, 0.07]} />
              <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        );
      })}

      <mesh position={landRadial} rotation={[0, top.ang, 0]}>
        <boxGeometry args={[STEP_W + 0.55, 0.12, 2.15]} />
        <meshStandardMaterial color={STONE} metalness={0.22} roughness={0.28} />
      </mesh>

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

      <SuitNpc position={[-13.4, L2_HEIGHT, 11.2]} color="#243044" />
      <SuitNpc position={[13.2, L2_HEIGHT, 10.6]} color="#2c3340" />
      <SuitNpc position={[0.8, L2_HEIGHT, 12.8]} color="#3a3d46" />

      {hud ? (
        <mesh position={[0, L2_HEIGHT + 2.1, 8.35]}>
          <planeGeometry args={[4.2, 1.5]} />
          <meshBasicMaterial map={hud.ticker} toneMapped={false} transparent opacity={0.88} />
        </mesh>
      ) : null}

      <pointLight position={[SPIRAL.cx, 4.2, SPIRAL.cz]} intensity={1.15} distance={11} color="#e8f4ff" />
      <pointLight position={[0, L2_HEIGHT + 2.4, 4]} intensity={0.7} distance={14} color="#d7eefc" />
    </group>
  );
}

function GlassRail({ x, z, w, d }: { x: number; z: number; w: number; d: number }) {
  const alongX = w >= d;
  return (
    <group position={[x, L2_HEIGHT + 0.55, z]}>
      <mesh>
        <boxGeometry args={[alongX ? w : 0.06, 1.05, alongX ? 0.06 : d]} />
        <meshPhysicalMaterial
          color="#d7eefc"
          transmission={0.82}
          transparent
          opacity={0.2}
          roughness={0.05}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.54, 0]}>
        <boxGeometry args={[alongX ? w : 0.07, 0.05, alongX ? 0.07 : d]} />
        <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}
