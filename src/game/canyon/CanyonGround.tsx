import { useMemo } from "react";
import { CrystalCluster } from "./CrystalCluster";
import { mulberry32, scatterPoses } from "./seeded";

const TERRACOTTA = "#A64B29";
const BURNT = "#D97745";
const GOLD_DIRT = "#c47840";
const PATH = "#d4894a";
const CREVICE = "#3a1c12";
const STRATA = ["#8a3a22", TERRACOTTA, BURNT, "#6b2c18", "#c45a32", "#F2B705", CREVICE];

function RockMat({ color, sunlit = false }: { color: string; sunlit?: boolean }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={sunlit ? 0.86 : 0.94}
      metalness={0.03}
      emissive={sunlit ? "#F2B705" : "#000000"}
      emissiveIntensity={sunlit ? 0.055 : 0}
    />
  );
}

function inKeepOut(x: number, z: number) {
  const onBridge = Math.abs(x) < 5.2 && z > -18 && z < 12;
  const onGate = Math.abs(x) < 10 && z < -32 && z > -52;
  const onPath = Math.abs(x) < 2.6 && z > -50 && z < 42;
  return onBridge || onGate || onPath;
}

function Boulder({ scale }: { scale: number }) {
  return (
    <mesh scale={scale}>
      <dodecahedronGeometry args={[0.72, 0]} />
      <RockMat color="#8a3a22" />
    </mesh>
  );
}

function DesertScrub({ scale }: { scale: number }) {
  return (
    <group scale={scale}>
      <mesh position={[0, 0.22, 0]}>
        <coneGeometry args={[0.28, 0.48, 5]} />
        <meshStandardMaterial color="#C9A227" roughness={0.92} />
      </mesh>
      <mesh position={[0.16, 0.16, 0.04]} rotation={[0.5, 0.4, 0]}>
        <coneGeometry args={[0.12, 0.32, 4]} />
        <meshStandardMaterial color="#E4C56A" roughness={0.9} />
      </mesh>
    </group>
  );
}

function StratifiedCliffs({ side }: { side: -1 | 1 }) {
  const stacks = useMemo(() => {
    const rand = mulberry32(side === -1 ? 91 : 407);
    return Array.from({ length: 16 }, (_, i) => {
      const z = -56 + i * 6.2 + (rand() - 0.5) * 1.6;
      const far = z < -22 ? 5 : 0;
      const x = side * (21.5 + far + rand() * 4.2);
      const layers = 6 + Math.floor(rand() * 3);
      return {
        x,
        z,
        layers: Array.from({ length: layers }, (_, li) => ({
          y: -1.2 + li * 3.15 + rand() * 0.35,
          w: 6.2 + rand() * 6.5,
          h: 2.1 + rand() * 1.5,
          d: 5.2 + rand() * 5.5,
          color: STRATA[(li + i) % STRATA.length],
          tilt: side * (0.07 + rand() * 0.1),
          sunlit: side === 1 && li > 2,
        })),
      };
    });
  }, [side]);

  return (
    <group>
      {stacks.map((stack, i) => (
        <group key={i} position={[stack.x, 0, stack.z]}>
          {stack.layers.map((layer, li) => (
            <group key={li}>
              <mesh position={[0, layer.y, 0]} rotation={[0, 0, layer.tilt]}>
                <boxGeometry args={[layer.w, layer.h, layer.d]} />
                <RockMat color={layer.color} sunlit={layer.sunlit} />
              </mesh>
              {li % 3 === 0 ? (
                <mesh
                  position={[stack.x > 0 ? 1.2 : -1.2, layer.y + layer.h * 0.35, 0.8]}
                  rotation={[0.2, 0.4, layer.tilt]}
                >
                  <dodecahedronGeometry args={[Math.min(layer.w, layer.h) * 0.38, 0]} />
                  <RockMat color={layer.color} sunlit={layer.sunlit} />
                </mesh>
              ) : null}
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

function ChasmWalls() {
  const faces = useMemo(() => {
    const rand = mulberry32(1204);
    return Array.from({ length: 14 }, (_, i) => {
      const along = -16 + i * 2.05;
      const jitter = (rand() - 0.5) * 1.2;
      return {
        left: [-12.4 + jitter * 0.3, -8, along] as [number, number, number],
        right: [12.4 - jitter * 0.3, -8, along + 0.4] as [number, number, number],
        rot: (rand() - 0.5) * 0.18,
        h: 14 + rand() * 8,
        w: 3.2 + rand() * 2.4,
        color: STRATA[i % STRATA.length],
      };
    });
  }, []);

  return (
    <group>
      {faces.map((f, i) => (
        <group key={i}>
          <mesh position={f.left} rotation={[0, 0, 0.18 + f.rot]}>
            <boxGeometry args={[f.w, f.h, 2.4]} />
            <RockMat color={f.color} />
          </mesh>
          <mesh position={f.right} rotation={[0, 0, -0.18 - f.rot]}>
            <boxGeometry args={[f.w, f.h, 2.4]} />
            <RockMat color={CREVICE} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const PATH_SEGMENTS: { pos: [number, number, number]; rot: number; size: [number, number, number] }[] = [
  { pos: [-8.2, 0.05, 38], rot: 0.38, size: [4.2, 0.1, 14] },
  { pos: [-4.4, 0.05, 24], rot: 0.22, size: [3.8, 0.1, 14] },
  { pos: [-1.2, 0.05, 14], rot: 0.08, size: [3.4, 0.1, 10] },
  { pos: [0, 0.05, -22], rot: 0, size: [3.5, 0.1, 14] },
  { pos: [0, 0.05, -34], rot: 0, size: [3.3, 0.1, 12] },
  { pos: [0, 0.05, -46], rot: 0, size: [3.1, 0.1, 12] },
];

const PURPLE: [number, number, number][] = [
  [-16.4, 6.8, 16],
  [-16.8, 11.2, 4],
  [-15.9, 8.4, -8],
  [-16.6, 13.5, -20],
  [-17.2, 7.2, -30],
  [-16.2, 12.2, -40],
  [-16.9, 9.4, 26],
  [-15.6, 5.4, -14],
  [-17.4, 15.2, -4],
  [-16.5, 10.2, 34],
  [16.2, 8.4, 8],
  [16.8, 12.2, -6],
  [15.8, 6.6, -22],
  [16.4, 10.6, 22],
];

const CYAN_CHASM: [number, number, number][] = [
  [-4.2, -9.5, -2],
  [3.6, -11, 4],
  [0.4, -13, -8],
  [-6.5, -8.2, 6],
  [5.8, -10.4, -6],
];

/** Terracotta strata, gold dust path, purple wall crystals, cyan in the chasm. */
export function CanyonGround() {
  const rocks = useMemo(
    () =>
      scatterPoses(12, 229, { minX: -16, maxX: 16, minZ: -50, maxZ: 46, y: 0.35 }, [2, 5]).filter(
        (p) => !inKeepOut(p.position[0], p.position[2]),
      ),
    [],
  );
  const scrub = useMemo(
    () =>
      scatterPoses(22, 7741, { minX: -15, maxX: 15, minZ: -48, maxZ: 44, y: 0 }, [0.8, 1.8]).filter(
        (p) => !inKeepOut(p.position[0], p.position[2]),
      ),
    [],
  );

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 32]} receiveShadow>
        <planeGeometry args={[52, 48]} />
        <meshStandardMaterial color={GOLD_DIRT} roughness={0.97} metalness={0.02} />
      </mesh>
      {[
        [8, 0.06, 28, 0.2],
        [-6, 0.06, 22, -0.4],
        [4, 0.06, 16, 0.55],
        [-10, 0.06, 34, 0.1],
      ].map(([x, y, z, rot], i) => (
        <mesh key={`crack-${i}`} position={[x, y, z]} rotation={[-Math.PI / 2, 0, rot]}>
          <planeGeometry args={[0.18, 7.5]} />
          <meshStandardMaterial color="#6b2c18" roughness={1} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -38]} receiveShadow>
        <planeGeometry args={[52, 44]} />
        <meshStandardMaterial color={GOLD_DIRT} roughness={0.97} metalness={0.02} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -32, -3]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#1a1410" roughness={1} />
      </mesh>
      <mesh position={[0, -10, -3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 34]} />
        <meshBasicMaterial color="#1ec8c8" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <mesh position={[0, -4, -3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 22]} />
        <meshBasicMaterial color="#3ee0d0" transparent opacity={0.12} depthWrite={false} />
      </mesh>
      <pointLight color="#3ee0d0" intensity={12} distance={28} position={[0, -12, -3]} />

      <StratifiedCliffs side={-1} />
      <StratifiedCliffs side={1} />
      <ChasmWalls />

      <mesh position={[-14, 7, 8]} rotation={[0, 0.35, 0.12]}>
        <boxGeometry args={[8, 18, 7]} />
        <RockMat color="#8a3a22" />
      </mesh>
      <mesh position={[-16, 11, 4]} rotation={[0.04, 0.22, 0.16]}>
        <boxGeometry args={[6, 12, 5]} />
        <RockMat color="#A64B29" />
      </mesh>
      <mesh position={[-42, 9, 18]} rotation={[0, 0.48, 0.1]}>
        <boxGeometry args={[18, 26, 12]} />
        <RockMat color="#8a3a22" />
      </mesh>
      <mesh position={[-36, 14, 10]} rotation={[0.05, 0.32, 0.12]}>
        <boxGeometry args={[10, 16, 8]} />
        <RockMat color="#A64B29" />
      </mesh>
      <mesh position={[-48, 7, 22]} rotation={[0, 0.55, 0.06]}>
        <boxGeometry args={[14, 18, 9]} />
        <RockMat color="#6b2c18" />
      </mesh>

      <mesh position={[-11.2, 0.7, -28]}>
        <dodecahedronGeometry args={[2.2, 0]} />
        <RockMat color={TERRACOTTA} />
      </mesh>
      <mesh position={[11.2, 0.75, -28]}>
        <dodecahedronGeometry args={[2.3, 0]} />
        <RockMat color={BURNT} />
      </mesh>

      {PATH_SEGMENTS.map((seg, i) => (
        <mesh key={i} position={seg.pos} rotation={[-Math.PI / 2, 0, seg.rot]}>
          <planeGeometry args={[seg.size[0], seg.size[2]]} />
          <meshStandardMaterial color={PATH} roughness={0.98} />
        </mesh>
      ))}

      {PURPLE.map((p, i) => (
        <CrystalCluster
          key={`p-${i}`}
          position={p}
          color="#7a3cff"
          emissive="#b14bff"
          scale={1.15 + (i % 3) * 0.25}
          light={8 + (i % 3)}
        />
      ))}
      {CYAN_CHASM.map((p, i) => (
        <CrystalCluster
          key={`c-${i}`}
          position={p}
          color="#1ec8c8"
          emissive="#3ee0d0"
          scale={0.85 + (i % 2) * 0.2}
          light={6}
        />
      ))}

      {rocks.map((pose, i) => (
        <group key={`r-${i}`} position={pose.position} rotation={pose.rotation}>
          <Boulder scale={pose.scale} />
        </group>
      ))}
      {scrub.map((pose, i) => (
        <group key={`s-${i}`} position={pose.position} rotation={pose.rotation}>
          <DesertScrub scale={pose.scale} />
        </group>
      ))}
    </group>
  );
}
