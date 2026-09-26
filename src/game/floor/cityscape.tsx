import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { DoubleSide } from "three";
import { Box } from "./kit";
import { useQuality } from "../quality";

/** Emerald / mist palette — Earth-Like Worlds paradise plate. */
const GREEN_DEEP = "#1f4a32";
const GREEN_MID = "#2f6a44";
const GREEN_LIT = "#4a8f58";
const ROCK = "#3a342e";
const ROCK_LIT = "#5a5046";
const TERRACE = "#3d7a4e";
const SPIRE = "#6a726c";
const FLOWER = "#c45a9a";

type Mass = {
  x: number;
  z: number;
  h: number;
  w: number;
  d: number;
  floatY: number;
  spires: number;
  terrace: boolean;
};

function ringMasses(count: number): Mass[] {
  const out: Mass[] = [];
  // Sparse far silhouettes only — immersion comes from the sky dome + fog, not props.
  const n = Math.max(6, Math.floor(count * 0.35));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + 0.11;
    const r = 62 + (i % 5) * 4.8;
    const h = 7 + ((i * 13) % 14);
    const w = 6.5 + (i % 4) * 1.2;
    out.push({
      x: Math.cos(a) * r,
      z: Math.sin(a) * r,
      h,
      w,
      d: w * (0.7 + (i % 3) * 0.2),
      floatY: i % 3 === 0 ? 5 + (i % 4) * 1.8 : 0,
      spires: i % 4 === 0 ? 2 : 0,
      terrace: i % 2 === 0,
    });
  }
  return out;
}

function MistBand({
  position,
  size,
  opacity,
}: {
  position: [number, number, number];
  size: [number, number];
  opacity: number;
}) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} frustumCulled={false}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        color="#7eb8b0"
        transparent
        opacity={opacity}
        depthWrite={false}
        side={DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

function FloatingMass({ m, shadows }: { m: Mass; shadows: boolean }) {
  const y = m.floatY + m.h / 2;
  const crownR = Math.min(m.w, m.d) * 0.55;
  return (
    <group position={[m.x, y, m.z]}>
      <mesh position={[0, -m.h * 0.12, 0]} castShadow={shadows} rotation={[0, 0.3, 0]}>
        <coneGeometry args={[crownR * 0.95, m.h * 0.7, 6]} />
        <meshStandardMaterial color={ROCK} roughness={0.92} metalness={0.04} />
      </mesh>
      <mesh position={[0.4, -m.h * 0.28, -0.3]} castShadow={shadows} rotation={[0.1, 0.8, 0]}>
        <coneGeometry args={[crownR * 0.55, m.h * 0.45, 5]} />
        <meshStandardMaterial color={ROCK_LIT} roughness={0.9} metalness={0.03} />
      </mesh>
      <mesh position={[0, m.h * 0.18, 0]} castShadow={shadows}>
        <sphereGeometry args={[crownR * 1.05, 10, 8]} />
        <meshStandardMaterial color={GREEN_MID} roughness={0.88} metalness={0.02} />
      </mesh>
      <mesh position={[-crownR * 0.35, m.h * 0.28, crownR * 0.2]}>
        <sphereGeometry args={[crownR * 0.55, 8, 6]} />
        <meshStandardMaterial color={GREEN_LIT} roughness={0.82} metalness={0.02} />
      </mesh>
      {m.terrace ? (
        <mesh position={[-m.w * 0.35, m.h * 0.02, m.d * 0.15]}>
          <boxGeometry args={[m.w * 0.5, 0.6, m.d * 0.6]} />
          <meshStandardMaterial color={TERRACE} roughness={0.88} metalness={0.02} />
        </mesh>
      ) : null}
      {Array.from({ length: m.spires }, (_, i) => (
        <mesh key={i} position={[(i - (m.spires - 1) / 2) * 0.9, m.h * 0.42 + 1.2 + i * 0.5, 0]}>
          <cylinderGeometry args={[0.12, 0.28, 2.2 + i * 0.8, 6]} />
          <meshStandardMaterial color={SPIRE} roughness={0.55} metalness={0.25} />
        </mesh>
      ))}
      {m.spires > 0 ? (
        <mesh position={[crownR * 0.3, m.h * 0.36, crownR * 0.25]}>
          <sphereGeometry args={[0.35, 6, 4]} />
          <meshStandardMaterial color={FLOWER} emissive={FLOWER} emissiveIntensity={0.28} roughness={0.7} />
        </mesh>
      ) : null}
    </group>
  );
}

function TerraceRidge({
  position,
  rotY,
  steps,
}: {
  position: [number, number, number];
  rotY: number;
  steps: number;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {Array.from({ length: steps }, (_, i) => (
        <mesh key={i} position={[0, 0.4 + i * 1.15, -i * 2.4]} castShadow={false}>
          <boxGeometry args={[18 - i * 1.2, 1.1, 3.2]} />
          <meshStandardMaterial
            color={i % 2 ? GREEN_MID : TERRACE}
            roughness={0.88}
            metalness={0.02}
          />
        </mesh>
      ))}
      <mesh position={[0, 3.2, -4]} rotation={[0.15, 0, 0]}>
        <planeGeometry args={[2.4, 8]} />
        <meshBasicMaterial color="#cfeef0" transparent opacity={0.35} depthWrite={false} side={DoubleSide} />
      </mesh>
    </group>
  );
}

function DriftCraft({ seed }: { seed: number }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * (0.06 + seed * 0.015) + seed * 4;
    const g = ref.current;
    if (!g) return;
    g.position.x = Math.cos(t) * (42 + seed * 3);
    g.position.y = 18 + seed * 2.2 + Math.sin(t * 1.2) * 1.1;
    g.position.z = Math.sin(t * 0.85) * (36 + seed * 2);
    g.rotation.y = -t + Math.PI / 2;
  });
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[1.6, 0.2, 0.5]} />
        <meshStandardMaterial color="#2a322c" metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[0.55, 0.1, 0]}>
        <sphereGeometry args={[0.14, 8, 6]} />
        <meshStandardMaterial color="#7ecf9a" emissive="#7ecf9a" emissiveIntensity={1.1} />
      </mesh>
    </group>
  );
}

/**
 * Horizon surround — verdant ground, distant silhouettes, teal mist bands.
 * Sky immersion is the VisionSkyDome (not vertical still billboards).
 */
export function Cityscape() {
  const { settings, level } = useQuality();
  const masses = useMemo(() => ringMasses(settings.towers), [settings.towers]);
  const misty = level !== "low";

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 4]} receiveShadow>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color="#2a5a3a" roughness={0.94} metalness={0.02} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 18]} receiveShadow>
        <circleGeometry args={[38, 48]} />
        <meshStandardMaterial color="#3a6e48" roughness={0.9} metalness={0.02} />
      </mesh>

      {masses.map((m) => (
        <FloatingMass key={`${m.x.toFixed(1)}-${m.z.toFixed(1)}`} m={m} shadows={settings.shadows} />
      ))}

      <TerraceRidge position={[-42, 0, 10]} rotY={0.4} steps={level === "low" ? 3 : 5} />
      <TerraceRidge position={[44, 0, -8]} rotY={-0.55} steps={level === "low" ? 3 : 5} />
      <TerraceRidge position={[6, 0, -48]} rotY={0.1} steps={level === "low" ? 3 : 4} />

      {misty ? (
        <>
          <MistBand position={[0, 0.6, 0]} size={[160, 160]} opacity={0.28} />
          <MistBand position={[0, 1.8, 0]} size={[150, 150]} opacity={0.22} />
          <MistBand position={[0, 3.2, -8]} size={[130, 110]} opacity={0.18} />
          <MistBand position={[-20, 4.0, 14]} size={[90, 70]} opacity={0.14} />
          <MistBand position={[22, 3.6, -20]} size={[90, 70]} opacity={0.14} />
        </>
      ) : (
        <MistBand position={[0, 1.2, 0]} size={[140, 140]} opacity={0.2} />
      )}

      {Array.from({ length: settings.crafts }, (_, n) => (
        <DriftCraft key={n} seed={n} />
      ))}
    </group>
  );
}

export function PlazaTiles() {
  const strips = useMemo(() => {
    const out: [number, number][] = [];
    const seen = new Set<string>();
    const add = (x: number, z: number) => {
      const k = `${x},${z}`;
      if (seen.has(k)) return;
      seen.add(k);
      out.push([x, z]);
    };
    for (let x = -20; x <= 20; x += 4) add(x, 22);
    for (let z = 18; z <= 32; z += 4) add(0, z);
    return out;
  }, []);
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 24]} receiveShadow>
        <planeGeometry args={[48, 22]} />
        <meshStandardMaterial color="#c9d0d8" roughness={0.38} metalness={0.22} envMapIntensity={0.7} />
      </mesh>
      {strips.map(([x, z]) => (
        <Box
          key={`${x}-${z}`}
          position={[x, 0.03, z]}
          size={[3.6, 0.02, 0.08]}
          color="#c4a45a"
          metal={0.45}
          rough={0.35}
        />
      ))}
    </>
  );
}
