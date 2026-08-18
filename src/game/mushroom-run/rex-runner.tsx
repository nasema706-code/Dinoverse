import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

const SKIN = "#2f8a42";
const SKIN_DARK = "#1f5a2c";
const JAW = "#8fbf62";
const SUIT = "#1a1d24";
const VEST = "#12141a";
const SHIRT = "#f4f1ea";
const TIE = "#6b1c32";
const SHOE = "#3a2418";
const CLAW = "#1a1612";

function RexHead() {
  return (
    <group position={[0, 0.98, -0.04]}>
      <mesh position={[0, 0.04, 0.04]} scale={[1.05, 0.88, 1.28]}>
        <sphereGeometry args={[0.175, 12, 10]} />
        <meshStandardMaterial color={SKIN} roughness={0.52} />
      </mesh>
      <mesh position={[0, 0.02, -0.16]} rotation={[0.12, 0, 0]} scale={[0.92, 0.7, 1.35]}>
        <capsuleGeometry args={[0.09, 0.22, 4, 10]} />
        <meshStandardMaterial color={SKIN} roughness={0.52} />
      </mesh>
      <mesh position={[0, -0.05, -0.28]} rotation={[0.22, 0, 0]} scale={[0.78, 0.48, 1]}>
        <capsuleGeometry args={[0.07, 0.18, 3, 8]} />
        <meshStandardMaterial color={SKIN} roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.08, -0.24]} rotation={[0.38, 0, 0]} scale={[0.72, 0.38, 1.05]}>
        <capsuleGeometry args={[0.055, 0.16, 3, 8]} />
        <meshStandardMaterial color={JAW} roughness={0.62} />
      </mesh>
      {[-0.028, 0.028].map((x) => (
        <mesh key={x} position={[x, 0.0, -0.38]} rotation={[0.4, 0, 0]}>
          <sphereGeometry args={[0.016, 6, 5]} />
          <meshStandardMaterial color={SKIN_DARK} roughness={0.45} />
        </mesh>
      ))}
      {[0.12, 0.06, 0, -0.06].map((z, i) => (
        <mesh
          key={z}
          position={[0, 0.16 - i * 0.012, z]}
          rotation={[0.35 + i * 0.12, 0, 0]}
        >
          <coneGeometry args={[0.028 - i * 0.003, 0.07 - i * 0.006, 5]} />
          <meshStandardMaterial color={SKIN_DARK} roughness={0.48} />
        </mesh>
      ))}
      {([-1, 1] as const).map((side) => (
        <group key={side} position={[side * 0.1, 0.05, -0.1]}>
          <mesh>
            <sphereGeometry args={[0.042, 8, 6]} />
            <meshStandardMaterial color="#e8a030" emissive="#c47a12" emissiveIntensity={0.55} />
          </mesh>
          <mesh position={[side * 0.006, 0, -0.018]} scale={[0.28, 0.85, 0.55]}>
            <sphereGeometry args={[0.038, 6, 5]} />
            <meshStandardMaterial color="#140c04" roughness={0.35} />
          </mesh>
        </group>
      ))}
      {[-0.2, -0.28, -0.34].map((z) => (
        <mesh key={z} position={[0, -0.045, z]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.09, 0.018, 0.012]} />
          <meshStandardMaterial color="#f4eee4" roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[-0.14, 0.06, 0.02]} rotation={[0.15, 0, 0.35]}>
        <torusGeometry args={[0.07, 0.016, 6, 12, Math.PI * 1.15]} />
        <meshStandardMaterial color="#0d0e12" metalness={0.7} roughness={0.22} />
      </mesh>
      <mesh position={[-0.185, 0.02, 0.01]} rotation={[0, 1.35, 0.15]}>
        <cylinderGeometry args={[0.045, 0.05, 0.04, 10]} />
        <meshStandardMaterial color="#111318" metalness={0.55} roughness={0.28} />
      </mesh>
      <mesh position={[-0.17, -0.04, -0.12]} rotation={[0.85, 0.4, -0.2]}>
        <capsuleGeometry args={[0.01, 0.16, 3, 6]} />
        <meshStandardMaterial color="#1a1c22" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[-0.12, -0.08, -0.22]}>
        <sphereGeometry args={[0.018, 6, 5]} />
        <meshStandardMaterial color="#2a2e36" metalness={0.45} roughness={0.28} />
      </mesh>
    </group>
  );
}

function ClawHand({ side }: { side: -1 | 1 }) {
  return (
    <group position={[0, -0.36, 0.02]} rotation={[0.35, 0, side * 0.15]}>
      <mesh>
        <sphereGeometry args={[0.045, 7, 6]} />
        <meshStandardMaterial color={SKIN} roughness={0.55} />
      </mesh>
      {[
        [side * 0.03, -0.02, -0.07],
        [0, -0.01, -0.08],
        [side * -0.03, -0.02, -0.06],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0.9, 0, 0]}>
          <coneGeometry args={[0.012, 0.07, 5]} />
          <meshStandardMaterial color={CLAW} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

export function RexRunner({
  getX,
  getY,
  running,
  getInvuln,
}: {
  getX: () => number;
  getY: () => number;
  running: boolean;
  getInvuln: () => boolean;
}) {
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const leftLeg = useRef<Group>(null);
  const rightLeg = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const tail = useRef<Group>(null);
  const xRef = useRef(0);
  const prevX = useRef(0);

  useFrame((_, dt) => {
    const x = getX();
    const y = getY();
    xRef.current += (x - xRef.current) * Math.min(1, dt * 12);
    const vx = (xRef.current - prevX.current) / Math.max(dt, 0.0001);
    prevX.current = xRef.current;

    const g = root.current;
    if (!g) return;
    g.position.x = xRef.current;
    g.position.y = y;
    g.rotation.z = -Math.max(-0.28, Math.min(0.28, vx * 0.045));
    g.rotation.y = vx * 0.02;
    g.visible = getInvuln() ? Math.floor(performance.now() / 80) % 2 === 0 : true;

    const airborne = y > 0.08;
    const t = performance.now() / 1000;
    const gait = running && !airborne ? t * 11 : t * 2.2;
    const stride = running && !airborne ? 0.72 : 0.08;
    const bob = running && !airborne ? Math.abs(Math.sin(gait * 2)) * 0.055 : 0;

    if (body.current) {
      body.current.position.y = 0.58 + bob;
      body.current.rotation.x = airborne ? -0.22 : running ? 0.16 : 0.06;
    }
    if (leftLeg.current) leftLeg.current.rotation.x = airborne ? -0.85 : Math.sin(gait) * stride;
    if (rightLeg.current) rightLeg.current.rotation.x = airborne ? -0.55 : Math.sin(gait + Math.PI) * stride;
    if (leftArm.current) {
      leftArm.current.rotation.x = airborne ? -0.9 : Math.sin(gait + Math.PI) * (running ? 0.55 : 0.08);
    }
    if (rightArm.current) {
      rightArm.current.rotation.x = airborne ? -0.7 : Math.sin(gait) * (running ? 0.55 : 0.08);
    }
    if (tail.current) tail.current.rotation.x = airborne ? 0.2 : 0.55 + Math.sin(gait) * (running ? 0.22 : 0.06);
  });

  return (
    <group ref={root} position={[0, 0, 0]} scale={0.64}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0.08]}>
        <circleGeometry args={[0.32, 16]} />
        <meshBasicMaterial color="#031006" transparent opacity={0.42} depthWrite={false} />
      </mesh>

      <group ref={leftLeg}>
        <mesh position={[-0.11, 0.32, 0.02]}>
          <capsuleGeometry args={[0.065, 0.36, 3, 7]} />
          <meshStandardMaterial color={SUIT} roughness={0.48} metalness={0.16} />
        </mesh>
        <mesh position={[-0.11, 0.08, 0.05]} rotation={[0.18, 0, 0]}>
          <boxGeometry args={[0.12, 0.07, 0.22]} />
          <meshStandardMaterial color={SHOE} roughness={0.4} metalness={0.28} />
        </mesh>
      </group>
      <group ref={rightLeg}>
        <mesh position={[0.11, 0.32, 0.02]}>
          <capsuleGeometry args={[0.065, 0.36, 3, 7]} />
          <meshStandardMaterial color={SUIT} roughness={0.48} metalness={0.16} />
        </mesh>
        <mesh position={[0.11, 0.08, 0.05]} rotation={[0.18, 0, 0]}>
          <boxGeometry args={[0.12, 0.07, 0.22]} />
          <meshStandardMaterial color={SHOE} roughness={0.4} metalness={0.28} />
        </mesh>
      </group>

      <group ref={body}>
        <mesh position={[0, 0.38, 0.04]}>
          <capsuleGeometry args={[0.2, 0.42, 4, 10]} />
          <meshStandardMaterial color={SUIT} roughness={0.46} metalness={0.18} />
        </mesh>
        <mesh position={[-0.2, 0.52, 0.02]} rotation={[0, 0, 0.45]}>
          <boxGeometry args={[0.16, 0.1, 0.22]} />
          <meshStandardMaterial color={SUIT} roughness={0.46} metalness={0.18} />
        </mesh>
        <mesh position={[0.2, 0.52, 0.02]} rotation={[0, 0, -0.45]}>
          <boxGeometry args={[0.16, 0.1, 0.22]} />
          <meshStandardMaterial color={SUIT} roughness={0.46} metalness={0.18} />
        </mesh>
        <mesh position={[0, 0.36, -0.06]}>
          <boxGeometry args={[0.26, 0.38, 0.08]} />
          <meshStandardMaterial color={VEST} roughness={0.44} metalness={0.22} />
        </mesh>
        <mesh position={[0, 0.58, -0.1]}>
          <boxGeometry args={[0.16, 0.06, 0.04]} />
          <meshStandardMaterial color={SHIRT} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.42, -0.12]}>
          <boxGeometry args={[0.055, 0.26, 0.02]} />
          <meshStandardMaterial color={SHIRT} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.38, -0.135]}>
          <boxGeometry args={[0.04, 0.22, 0.016]} />
          <meshStandardMaterial color={TIE} roughness={0.42} />
        </mesh>

        <group ref={leftArm} position={[-0.28, 0.5, -0.02]}>
          <mesh position={[0, -0.14, 0]} rotation={[0.18, 0, 0.32]}>
            <capsuleGeometry args={[0.058, 0.3, 3, 7]} />
            <meshStandardMaterial color={SUIT} roughness={0.48} />
          </mesh>
          <ClawHand side={-1} />
        </group>
        <group ref={rightArm} position={[0.28, 0.5, -0.02]}>
          <mesh position={[0, -0.14, 0]} rotation={[0.18, 0, -0.32]}>
            <capsuleGeometry args={[0.058, 0.3, 3, 7]} />
            <meshStandardMaterial color={SUIT} roughness={0.48} />
          </mesh>
          <ClawHand side={1} />
        </group>

        <mesh position={[0, 0.76, 0]}>
          <sphereGeometry args={[0.11, 10, 8]} />
          <meshStandardMaterial color={SKIN} roughness={0.55} />
        </mesh>
        <RexHead />

        <group ref={tail} position={[0, 0.2, 0.2]}>
          <mesh position={[0, -0.02, 0.18]} rotation={[0.35, 0, 0]}>
            <capsuleGeometry args={[0.085, 0.28, 3, 8]} />
            <meshStandardMaterial color={SKIN} roughness={0.55} />
          </mesh>
          <mesh position={[0, -0.08, 0.46]} rotation={[0.5, 0, 0]}>
            <capsuleGeometry args={[0.058, 0.3, 3, 7]} />
            <meshStandardMaterial color={SKIN} roughness={0.55} />
          </mesh>
          <mesh position={[0, -0.16, 0.74]} rotation={[0.62, 0, 0]}>
            <capsuleGeometry args={[0.032, 0.26, 3, 6]} />
            <meshStandardMaterial color={SKIN} roughness={0.55} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
