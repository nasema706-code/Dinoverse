import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { CharId } from "./run-state";

function Skin({ color, roughness = 0.48 }: { color: string; roughness?: number }) {
  return <meshStandardMaterial color={color} roughness={roughness} metalness={0.06} />;
}

function Eyes({ z, y, spread, size = 0.045 }: { z: number; y: number; spread: number; size?: number }) {
  return (
    <>
      {([-1, 1] as const).map((side) => (
        <group key={side} position={[side * spread, y, z]}>
          <mesh>
            <sphereGeometry args={[size, 8, 6]} />
            <meshStandardMaterial color="#f4ead0" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, -size * 0.45]}>
            <sphereGeometry args={[size * 0.45, 6, 5]} />
            <meshStandardMaterial color="#1a120c" roughness={0.22} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function QuadLegs({
  moving,
  hipY,
  stanceX,
  stanceZ,
  color,
  thick = 0.055,
  len = 0.28,
}: {
  moving: boolean;
  hipY: number;
  stanceX: number;
  stanceZ: [number, number];
  color: string;
  thick?: number;
  len?: number;
}) {
  const gait = useRef(0);
  const legs = useRef<(Group | null)[]>([null, null, null, null]);
  const layout = [
    { x: -stanceX, z: stanceZ[0], off: 0 },
    { x: stanceX, z: stanceZ[0], off: Math.PI },
    { x: -stanceX, z: stanceZ[1], off: Math.PI },
    { x: stanceX, z: stanceZ[1], off: 0 },
  ];
  useFrame((_, dt) => {
    gait.current += dt * (moving ? 10 : 1.55);
    const runAmt = moving ? 1 : 0.22;
    for (let i = 0; i < 4; i++) {
      const g = legs.current[i];
      if (!g) continue;
      const phase = gait.current + layout[i]!.off;
      g.position.y = hipY + Math.max(0, Math.sin(phase)) * 0.16 * runAmt;
      g.rotation.x = Math.sin(phase) * 0.24 * runAmt;
    }
  });
  return (
    <>
      {layout.map((leg, i) => (
        <group
          key={i}
          ref={(node) => {
            legs.current[i] = node;
          }}
          position={[leg.x, hipY, leg.z]}
        >
          <mesh position={[0, -len / 2, 0]}>
            <capsuleGeometry args={[thick, len, 4, 8]} />
            <Skin color={color} />
          </mesh>
          <mesh position={[0, -len - 0.02, 0.03]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[thick * 2.1, 0.045, thick * 2.6]} />
            <Skin color="#2a2218" roughness={0.55} />
          </mesh>
        </group>
      ))}
    </>
  );
}

export function StegoFigure({ moving = false }: { moving?: boolean }) {
  const hide = "#5f7a3c";
  const plate = "#efe3b4";
  return (
    <group>
      <mesh position={[0, 0.52, 0.06]} rotation={[0.08, 0, 0]} scale={[1, 0.85, 1.35]}>
        <sphereGeometry args={[0.32, 12, 10]} />
        <Skin color={hide} />
      </mesh>
      <mesh position={[0, 0.42, -0.32]} rotation={[0.35, 0, 0]}>
        <capsuleGeometry args={[0.12, 0.16, 4, 8]} />
        <Skin color={hide} />
      </mesh>
      <mesh position={[0, 0.48, -0.48]} rotation={[0.2, 0, 0]}>
        <sphereGeometry args={[0.13, 10, 8]} />
        <Skin color="#6a8644" />
      </mesh>
      <Eyes z={-0.58} y={0.52} spread={0.07} size={0.032} />
      {[-0.22, -0.08, 0.06, 0.2, 0.32].map((z, i) => (
        <mesh key={z} position={[0, 0.78 + (i % 2) * 0.04, z]} rotation={[0.15, 0, 0]}>
          <coneGeometry args={[0.09 - i * 0.008, 0.28 - i * 0.02, 5]} />
          <Skin color={i % 2 ? plate : "#e2d09a"} roughness={0.4} />
        </mesh>
      ))}
      <group position={[0, 0.4, 0.42]} rotation={[0.2, 0, 0]}>
        <mesh position={[0, 0, 0.18]}>
          <capsuleGeometry args={[0.08, 0.28, 4, 8]} />
          <Skin color={hide} />
        </mesh>
        <mesh position={[0, -0.02, 0.4]}>
          <sphereGeometry args={[0.05, 8, 6]} />
          <Skin color="#4a6230" />
        </mesh>
      </group>
      <QuadLegs moving={moving} hipY={0.38} stanceX={0.16} stanceZ={[-0.22, 0.22]} color="#4e6634" />
    </group>
  );
}

export function BrachioFigure({ moving = false }: { moving?: boolean }) {
  const hide = "#c4a06a";
  return (
    <group>
      <mesh position={[0, 0.72, 0.12]} scale={[0.9, 0.85, 1.15]}>
        <sphereGeometry args={[0.34, 12, 10]} />
        <Skin color={hide} />
      </mesh>
      <group position={[0, 0.95, -0.18]}>
        <mesh position={[0, 0.28, -0.04]} rotation={[0.15, 0, 0]}>
          <capsuleGeometry args={[0.1, 0.42, 5, 8]} />
          <Skin color={hide} />
        </mesh>
        <mesh position={[0, 0.62, -0.12]} rotation={[0.35, 0, 0]}>
          <capsuleGeometry args={[0.08, 0.38, 5, 8]} />
          <Skin color="#d4b27a" />
        </mesh>
        <mesh position={[0, 0.88, -0.28]} rotation={[0.55, 0, 0]}>
          <sphereGeometry args={[0.12, 10, 8]} />
          <Skin color="#c49a62" />
        </mesh>
        <Eyes z={-0.38} y={0.9} spread={0.055} size={0.028} />
      </group>
      <mesh position={[0, 0.58, 0.42]} rotation={[0.4, 0, 0]}>
        <capsuleGeometry args={[0.09, 0.28, 4, 8]} />
        <Skin color={hide} />
      </mesh>
      <QuadLegs
        moving={moving}
        hipY={0.5}
        stanceX={0.18}
        stanceZ={[-0.16, 0.24]}
        color="#a88858"
        thick={0.07}
        len={0.38}
      />
    </group>
  );
}

export function DiploFigure({ moving = false }: { moving?: boolean }) {
  const hide = "#6d7f90";
  return (
    <group>
      <mesh position={[0, 0.55, 0.08]} scale={[0.75, 0.7, 1.4]}>
        <sphereGeometry args={[0.28, 12, 10]} />
        <Skin color={hide} />
      </mesh>
      <group position={[0, 0.62, -0.28]} rotation={[0.85, 0, 0]}>
        <mesh position={[0, 0, -0.28]}>
          <capsuleGeometry args={[0.07, 0.5, 5, 8]} />
          <Skin color={hide} />
        </mesh>
        <mesh position={[0, 0.02, -0.62]}>
          <capsuleGeometry args={[0.055, 0.38, 4, 8]} />
          <Skin color="#7a8ca0" />
        </mesh>
        <mesh position={[0, 0.04, -0.86]}>
          <sphereGeometry args={[0.09, 10, 8]} />
          <Skin color="#627282" />
        </mesh>
        <Eyes z={-0.92} y={0.06} spread={0.045} size={0.024} />
      </group>
      <group position={[0, 0.5, 0.38]} rotation={[-0.2, 0, 0]}>
        <mesh position={[0, 0, 0.32]}>
          <capsuleGeometry args={[0.065, 0.5, 4, 8]} />
          <Skin color={hide} />
        </mesh>
        <mesh position={[0, -0.02, 0.66]}>
          <capsuleGeometry args={[0.04, 0.32, 4, 8]} />
          <Skin color="#5c6c7c" />
        </mesh>
      </group>
      <QuadLegs moving={moving} hipY={0.4} stanceX={0.14} stanceZ={[-0.2, 0.2]} color="#556878" len={0.3} />
    </group>
  );
}

export function AnkyFigure({ moving = false }: { moving?: boolean }) {
  const hide = "#6a5a42";
  const armor = "#8a7a60";
  return (
    <group>
      <mesh position={[0, 0.38, 0.04]} scale={[1.15, 0.7, 1.35]}>
        <sphereGeometry args={[0.32, 12, 10]} />
        <Skin color={hide} roughness={0.58} />
      </mesh>
      {[-0.16, 0, 0.16].map((z) =>
        [-0.14, 0.14].map((x) => (
          <mesh key={`${x}-${z}`} position={[x, 0.58, z]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <Skin color={armor} roughness={0.4} />
          </mesh>
        )),
      )}
      <mesh position={[0, 0.36, -0.38]} rotation={[0.25, 0, 0]}>
        <sphereGeometry args={[0.14, 10, 8]} />
        <Skin color="#5a4c38" />
      </mesh>
      <Eyes z={-0.5} y={0.4} spread={0.07} size={0.03} />
      <group position={[0, 0.32, 0.4]} rotation={[0.1, 0, 0]}>
        <mesh position={[0, 0, 0.16]}>
          <capsuleGeometry args={[0.08, 0.22, 4, 8]} />
          <Skin color={hide} />
        </mesh>
        <mesh position={[0, 0, 0.36]}>
          <sphereGeometry args={[0.13, 10, 8]} />
          <Skin color="#3a3228" roughness={0.5} />
        </mesh>
      </group>
      <QuadLegs
        moving={moving}
        hipY={0.3}
        stanceX={0.18}
        stanceZ={[-0.16, 0.18]}
        color="#4a4034"
        thick={0.065}
        len={0.22}
      />
    </group>
  );
}

export function TrikeFigure({ moving = false }: { moving?: boolean }) {
  const hide = "#c47848";
  const horn = "#f3e6c4";
  return (
    <group>
      <mesh position={[0, 0.5, 0.08]} scale={[1.05, 0.85, 1.2]}>
        <sphereGeometry args={[0.3, 12, 10]} />
        <Skin color={hide} />
      </mesh>
      <mesh position={[0, 0.58, -0.32]} rotation={[0.2, 0, 0]}>
        <sphereGeometry args={[0.2, 12, 10]} />
        <Skin color="#d48858" />
      </mesh>
      <mesh position={[0, 0.72, -0.38]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.22, 0.08, 12]} />
        <Skin color="#e8b070" roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.92, -0.42]} rotation={[0.15, 0, 0]}>
        <coneGeometry args={[0.035, 0.28, 6]} />
        <Skin color={horn} roughness={0.32} />
      </mesh>
      {([-1, 1] as const).map((side) => (
        <mesh key={side} position={[side * 0.12, 0.64, -0.5]} rotation={[1.05, side * 0.15, 0]}>
          <coneGeometry args={[0.028, 0.22, 6]} />
          <Skin color={horn} roughness={0.32} />
        </mesh>
      ))}
      <mesh position={[0, 0.5, -0.5]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.12, 0.06, 0.1]} />
        <Skin color="#2a2218" />
      </mesh>
      <Eyes z={-0.42} y={0.62} spread={0.09} size={0.034} />
      <mesh position={[0, 0.42, 0.38]} rotation={[0.25, 0, 0]}>
        <capsuleGeometry args={[0.08, 0.22, 4, 8]} />
        <Skin color={hide} />
      </mesh>
      <QuadLegs moving={moving} hipY={0.36} stanceX={0.16} stanceZ={[-0.18, 0.2]} color="#a06038" len={0.26} />
    </group>
  );
}

export function HerdFigure({ id, moving = false }: { id: CharId; moving?: boolean }) {
  if (id === "brachio") return <BrachioFigure moving={moving} />;
  if (id === "diplo") return <DiploFigure moving={moving} />;
  if (id === "anky") return <AnkyFigure moving={moving} />;
  if (id === "trike") return <TrikeFigure moving={moving} />;
  return <StegoFigure moving={moving} />;
}

function expDamp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

const RUN_SCALE: Record<CharId, number> = {
  stego: 0.78,
  brachio: 0.52,
  diplo: 0.7,
  anky: 0.82,
  trike: 0.76,
};

export function HerdRunner({
  id,
  getX,
  getY,
  running,
  getInvuln,
}: {
  id: CharId;
  getX: () => number;
  getY?: () => number;
  running: boolean;
  getInvuln?: () => boolean;
}) {
  const root = useRef<Group>(null);
  const bob = useRef<Group>(null);
  const xRef = useRef(0);
  const prevX = useRef(0);
  const gait = useRef(0);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    const x = getX();
    const y = typeof getY === "function" ? getY() : 0;
    const invuln = typeof getInvuln === "function" ? getInvuln() : false;
    xRef.current = expDamp(xRef.current, x, 14, d);
    const vx = (xRef.current - prevX.current) / Math.max(d, 0.0001);
    prevX.current = xRef.current;
    const g = root.current;
    if (!g) return;
    g.position.x = xRef.current;
    g.position.y = y;
    g.rotation.z = expDamp(g.rotation.z, Math.max(-0.3, Math.min(0.3, -vx * 0.05)), 10, d);
    g.visible = invuln ? Math.floor(performance.now() / 80) % 2 === 0 : true;
    const airborne = y > 0.08;
    const runAmt = running && !airborne ? 1 : 0;
    gait.current += d * (runAmt ? 9.5 : 1.4);
    if (bob.current) {
      bob.current.position.y = Math.abs(Math.sin(gait.current)) * 0.05 * (runAmt || 0.35);
      bob.current.rotation.x = airborne ? -0.18 : Math.sin(gait.current) * 0.04 * runAmt;
    }
  });

  return (
    <group ref={root} scale={RUN_SCALE[id]}>
      <group ref={bob}>
        <HerdFigure id={id} moving={running} />
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0.08]}>
        <circleGeometry args={[0.38, 16]} />
        <meshBasicMaterial color="#031006" transparent opacity={0.4} depthWrite={false} />
      </mesh>
    </group>
  );
}
