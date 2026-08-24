import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

const SKIN = "#2f8a42";
const SKIN_DARK = "#1f5a2c";
const JAW = "#8fbf62";
const SUIT = "#1a1d24";
const VEST = "#12141a";
const SHIRT = "#f4f1ea";
const TIE = "#6b1c32";
const TIE_GOLD = "#d4b15a";
const TIE_MINT = "#3ecf8e";
const SHOE = "#3a2418";
const CLAW = "#1a1612";

const TIE_COLOR = {
  default: TIE,
  gold: TIE_GOLD,
  mint: TIE_MINT,
} as const;

function expDamp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

function dampRot(
  g: Group | null,
  x: number,
  y: number,
  z: number,
  lambda: number,
  dt: number,
) {
  if (!g) return;
  g.rotation.x = expDamp(g.rotation.x, x, lambda, dt);
  g.rotation.y = expDamp(g.rotation.y, y, lambda, dt);
  g.rotation.z = expDamp(g.rotation.z, z, lambda, dt);
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function sat(n: number) {
  return clamp(n, 0, 1);
}

function SuitMat() {
  return <meshStandardMaterial color={SUIT} roughness={0.42} metalness={0.2} />;
}

function SkinMat({ color = SKIN }: { color?: string }) {
  return <meshStandardMaterial color={color} roughness={0.38} metalness={0.04} />;
}

function RexHead({
  eye,
  face,
  chain,
}: {
  eye: RefObject<Group | null>;
  face: "none" | "visor" | "shades";
  chain: boolean;
}) {
  return (
    <group position={[0, 0.07, -0.02]}>
      <mesh position={[0, 0.04, 0.04]} scale={[1.12, 0.94, 1.32]}>
        <sphereGeometry args={[0.175, 14, 12]} />
        <SkinMat />
      </mesh>
      <mesh position={[0, 0.02, -0.17]} rotation={[0.12, 0, 0]} scale={[0.96, 0.74, 1.38]}>
        <capsuleGeometry args={[0.09, 0.22, 5, 12]} />
        <SkinMat />
      </mesh>
      <mesh position={[0, -0.05, -0.3]} rotation={[0.22, 0, 0]} scale={[0.82, 0.5, 1]}>
        <capsuleGeometry args={[0.07, 0.18, 4, 10]} />
        <SkinMat />
      </mesh>
      <mesh position={[0, -0.09, -0.26]} rotation={[0.4, 0, 0]} scale={[0.76, 0.4, 1.08]}>
        <capsuleGeometry args={[0.055, 0.16, 4, 10]} />
        <SkinMat color={JAW} />
      </mesh>
      {[-0.03, 0.03].map((x) => (
        <mesh key={x} position={[x, 0.0, -0.4]} rotation={[0.4, 0, 0]}>
          <sphereGeometry args={[0.016, 8, 6]} />
          <SkinMat color={SKIN_DARK} />
        </mesh>
      ))}
      {[0.12, 0.06, 0, -0.06].map((z, i) => (
        <mesh key={z} position={[0, 0.17 - i * 0.012, z]} rotation={[0.35 + i * 0.12, 0, 0]}>
          <coneGeometry args={[0.03 - i * 0.003, 0.074 - i * 0.006, 6]} />
          <SkinMat color={SKIN_DARK} />
        </mesh>
      ))}
      <group ref={eye}>
        {([-1, 1] as const).map((side) => (
          <group key={side} position={[side * 0.105, 0.055, -0.11]}>
            <mesh>
              <sphereGeometry args={[0.046, 10, 8]} />
              <meshStandardMaterial
                color="#e8a030"
                emissive="#c47a12"
                emissiveIntensity={0.62}
                roughness={0.28}
              />
            </mesh>
            <mesh position={[side * 0.007, 0.004, -0.02]} scale={[0.3, 0.88, 0.52]}>
              <sphereGeometry args={[0.04, 8, 6]} />
              <meshStandardMaterial color="#120a04" roughness={0.22} />
            </mesh>
            <mesh position={[side * -0.01, 0.016, -0.028]}>
              <sphereGeometry args={[0.01, 6, 5]} />
              <meshStandardMaterial color="#fff6e8" roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>
      {[-0.2, -0.28, -0.35].map((z) => (
        <mesh key={z} position={[0, -0.05, z]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.1, 0.018, 0.012]} />
          <meshStandardMaterial color="#f4eee4" roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[-0.15, 0.07, 0.02]} rotation={[0.15, 0, 0.35]}>
        <torusGeometry args={[0.074, 0.017, 7, 14, Math.PI * 1.15]} />
        <meshStandardMaterial color="#0d0e12" metalness={0.72} roughness={0.2} />
      </mesh>
      <mesh position={[-0.195, 0.025, 0.01]} rotation={[0, 1.35, 0.15]}>
        <cylinderGeometry args={[0.048, 0.052, 0.042, 12]} />
        <meshStandardMaterial color="#111318" metalness={0.58} roughness={0.26} />
      </mesh>
      <mesh position={[-0.175, -0.04, -0.12]} rotation={[0.85, 0.4, -0.2]}>
        <capsuleGeometry args={[0.011, 0.17, 4, 8]} />
        <meshStandardMaterial color="#1a1c22" metalness={0.5} roughness={0.28} />
      </mesh>
      <mesh position={[-0.125, -0.085, -0.23]}>
        <sphereGeometry args={[0.02, 8, 6]} />
        <meshStandardMaterial color="#2a2e36" metalness={0.48} roughness={0.24} />
      </mesh>
      {face === "visor" ? (
        <mesh position={[0, 0.06, -0.16]} rotation={[0.18, 0, 0]}>
          <boxGeometry args={[0.26, 0.055, 0.04]} />
          <meshStandardMaterial
            color="#5ec8ff"
            emissive="#2aa8ff"
            emissiveIntensity={0.7}
            metalness={0.55}
            roughness={0.18}
            transparent
            opacity={0.72}
          />
        </mesh>
      ) : null}
      {face === "shades" ? (
        <group position={[0, 0.055, -0.14]}>
          {([-1, 1] as const).map((side) => (
            <mesh key={side} position={[side * 0.07, 0, 0]} rotation={[0.12, 0, 0]}>
              <boxGeometry args={[0.1, 0.042, 0.03]} />
              <meshStandardMaterial color="#0c0c10" metalness={0.7} roughness={0.16} />
            </mesh>
          ))}
          <mesh position={[0, 0.01, 0.01]}>
            <boxGeometry args={[0.06, 0.012, 0.018]} />
            <meshStandardMaterial color="#1a1a20" metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      ) : null}
      {chain ? (
        <mesh position={[0, -0.06, 0.02]} rotation={[0.55, 0, 0]}>
          <torusGeometry args={[0.12, 0.016, 8, 18]} />
          <meshStandardMaterial color="#e0c56a" metalness={0.82} roughness={0.22} />
        </mesh>
      ) : null}
    </group>
  );
}

function ClawHand({ side, curl }: { side: -1 | 1; curl: RefObject<Group | null> }) {
  return (
    <group ref={curl} position={[0, -0.02, 0.02]} rotation={[0.2, 0, side * 0.12]}>
      <mesh>
        <sphereGeometry args={[0.05, 9, 7]} />
        <SkinMat />
      </mesh>
      {[
        [side * 0.032, -0.018, -0.074],
        [0, -0.008, -0.086],
        [side * -0.032, -0.018, -0.064],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[1.05, 0, side * (i - 1) * 0.18]}>
          <coneGeometry args={[0.013, 0.078, 6]} />
          <meshStandardMaterial color={CLAW} roughness={0.36} />
        </mesh>
      ))}
    </group>
  );
}

export function RexRunner({
  getX,
  getY,
  getVy,
  running,
  getInvuln,
  loadout,
}: {
  getX: () => number;
  getY?: () => number;
  getVy?: () => number;
  running: boolean;
  getInvuln?: () => boolean;
  loadout?: {
    tie: "default" | "gold" | "mint";
    face: "none" | "visor" | "shades";
    chain: boolean;
    coffee: boolean;
  };
}) {
  const root = useRef<Group>(null);
  const bounce = useRef<Group>(null);
  const hip = useRef<Group>(null);
  const spine = useRef<Group>(null);
  const chest = useRef<Group>(null);
  const neck = useRef<Group>(null);
  const head = useRef<Group>(null);
  const eyes = useRef<Group>(null);
  const tie = useRef<Group>(null);
  const leftThigh = useRef<Group>(null);
  const rightThigh = useRef<Group>(null);
  const leftShin = useRef<Group>(null);
  const rightShin = useRef<Group>(null);
  const leftFoot = useRef<Group>(null);
  const rightFoot = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const leftFore = useRef<Group>(null);
  const rightFore = useRef<Group>(null);
  const leftClaw = useRef<Group>(null);
  const rightClaw = useRef<Group>(null);
  const tail1 = useRef<Group>(null);
  const tail2 = useRef<Group>(null);
  const tail3 = useRef<Group>(null);
  const tail4 = useRef<Group>(null);
  const xRef = useRef(0);
  const kit = loadout ?? { tie: "default" as const, face: "none" as const, chain: false, coffee: false };
  const prevX = useRef(0);
  const land = useRef(0);
  const wasAir = useRef(false);
  const gaitTime = useRef(0);
  const blinkT = useRef(2.6);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    const x = getX();
    const y = typeof getY === "function" ? getY() : 0;
    const vy = typeof getVy === "function" ? getVy() : 0;
    const invuln = typeof getInvuln === "function" ? getInvuln() : false;

    xRef.current = expDamp(xRef.current, x, 14, d);
    const vx = (xRef.current - prevX.current) / Math.max(d, 0.0001);
    prevX.current = xRef.current;

    const g = root.current;
    if (!g) return;
    g.position.x = xRef.current;
    g.position.y = y;
    const leanZ = clamp(-vx * 0.055, -0.34, 0.34);
    g.rotation.z = expDamp(g.rotation.z, leanZ, 10, d);
    g.rotation.y = expDamp(g.rotation.y, clamp(vx * 0.028, -0.22, 0.22), 9, d);
    g.visible = invuln ? Math.floor(performance.now() / 80) % 2 === 0 : true;

    const airborne = y > 0.08;
    if (wasAir.current && !airborne) land.current = 1;
    wasAir.current = airborne;
    land.current = expDamp(land.current, 0, 7.5, d);

    const air = sat((y - 0.05) / 0.28);
    const runAmt = running && !airborne ? 1 : 0;
    const idleAmt = 1 - sat(runAmt + air);
    const speed = mix(1.65, 10.6, runAmt);
    gaitTime.current += d * speed;
    const t = gaitTime.current;
    const walk = performance.now() / 1000;

    const stride = Math.sin(t);
    const strideOpp = Math.sin(t + Math.PI);
    const lift = Math.max(0, Math.cos(t));
    const liftOpp = Math.max(0, Math.cos(t + Math.PI));
    const plant = Math.pow(Math.max(0, Math.cos(t * 2)), 6);

    const bob = mix(
      Math.sin(walk * 2.1) * 0.012,
      Math.abs(Math.sin(t * 2)) * 0.07 + plant * 0.018,
      runAmt,
    );
    const squash = 1 - land.current * 0.2 - plant * runAmt * 0.045 + clamp(vy * 0.035, -0.1, 0.14);
    const stretch = 1 + land.current * 0.12 + plant * runAmt * 0.03 - clamp(vy * 0.02, -0.08, 0.1);
    g.scale.set(0.64 * stretch, 0.64 * squash, 0.64 * stretch);

    if (bounce.current) {
      bounce.current.position.y = bob * (1 - air);
      bounce.current.rotation.z = mix(Math.sin(walk * 1.55) * 0.045, stride * 0.08, runAmt);
    }

    dampRot(hip.current, mix(0.04, 0.12, runAmt) + air * -0.18, stride * 0.16 * runAmt, 0, 12, d);

    const chestPitch = mix(0.05, 0.2, runAmt) + air * mix(-0.28, 0.18, sat((-vy + 4) / 8));
    dampRot(spine.current, chestPitch, -stride * 0.12 * runAmt, -leanZ * 0.35, 11, d);
    dampRot(chest.current, Math.sin(walk * 2.1) * 0.03 * idleAmt, strideOpp * 0.1 * runAmt, 0, 10, d);

    blinkT.current -= d;
    if (blinkT.current < 0) blinkT.current = 2.4 + Math.random() * 2.2;
    const blink = blinkT.current < 0.12 ? sat(1 - Math.abs(blinkT.current - 0.06) / 0.06) : 0;
    if (eyes.current) {
      eyes.current.scale.y = expDamp(eyes.current.scale.y, 1 - blink * 0.88, 28, d);
    }

    const headYaw = mix(Math.sin(walk * 0.7) * 0.12, -stride * 0.1, runAmt) + leanZ * 0.4;
    const headPitch = mix(Math.sin(walk * 1.8) * 0.05, Math.abs(Math.sin(t * 2)) * 0.08, runAmt) + air * -0.15;
    dampRot(neck.current, headPitch * 0.45, headYaw * 0.55, -leanZ * 0.2, 8, d);
    dampRot(head.current, headPitch, headYaw, Math.sin(walk * 1.3) * 0.03 * idleAmt, 7, d);

    const thighSwing = mix(0.06, 0.95, runAmt);
    const leftThighX = mix(-0.08 + Math.sin(walk * 1.4) * 0.05, -0.22 + stride * thighSwing, runAmt) + air * -0.55;
    const rightThighX = mix(-0.08 - Math.sin(walk * 1.4) * 0.05, -0.22 + strideOpp * thighSwing, runAmt) + air * -0.35;
    dampRot(leftThigh.current, leftThighX, 0, -0.14 + leanZ * 0.2, 16, d);
    dampRot(rightThigh.current, rightThighX, 0, 0.14 + leanZ * 0.2, 16, d);

    const leftShinX = mix(0.18, 0.28 + lift * 1.15 + Math.max(0, stride) * 0.35, runAmt) + air * 1.15;
    const rightShinX = mix(0.18, 0.28 + liftOpp * 1.15 + Math.max(0, strideOpp) * 0.35, runAmt) + air * 0.95;
    dampRot(leftShin.current, leftShinX, 0, 0, 18, d);
    dampRot(rightShin.current, rightShinX, 0, 0, 18, d);

    dampRot(
      leftFoot.current,
      mix(-0.12, -0.08 - stride * 0.42 + lift * 0.55, runAmt) + air * 0.35,
      0,
      0,
      18,
      d,
    );
    dampRot(
      rightFoot.current,
      mix(-0.12, -0.08 - strideOpp * 0.42 + liftOpp * 0.55, runAmt) + air * 0.28,
      0,
      0,
      18,
      d,
    );

    const armSwing = mix(0.1, 0.78, runAmt);
    dampRot(
      leftArm.current,
      mix(0.22, -0.05 + strideOpp * armSwing, runAmt) + air * -0.85,
      0.12,
      mix(0.62, 0.78, runAmt) + air * 0.55,
      14,
      d,
    );
    dampRot(
      rightArm.current,
      mix(0.22, -0.05 + stride * armSwing, runAmt) + air * -0.7,
      -0.12,
      mix(-0.62, -0.78, runAmt) - air * 0.55,
      14,
      d,
    );
    dampRot(leftFore.current, mix(0.35, 0.85 + liftOpp * 0.35, runAmt) + air * 0.55, 0, 0, 16, d);
    dampRot(rightFore.current, mix(0.35, 0.85 + lift * 0.35, runAmt) + air * 0.45, 0, 0, 16, d);

    const clawCurl = mix(0.15, 0.45 + Math.abs(stride) * 0.2, runAmt) + air * 0.35;
    dampRot(leftClaw.current, clawCurl, 0, -0.12, 12, d);
    dampRot(rightClaw.current, clawCurl, 0, 0.12, 12, d);

    const wag = mix(Math.sin(walk * 2.4) * 0.16, stride * 0.38, runAmt);
    dampRot(tail1.current, mix(0.18, 0.26, runAmt) + air * -0.12, wag * 0.22, wag * 0.06, 8, d);
    dampRot(tail2.current, mix(0.08, 0.12, runAmt), wag * 0.38, 0, 7, d);
    dampRot(tail3.current, mix(0.06, 0.1, runAmt), wag * 0.55, 0, 6, d);
    dampRot(tail4.current, mix(0.04, 0.08, runAmt), wag * 0.72, 0, 5, d);

    if (tie.current) {
      tie.current.rotation.x = expDamp(tie.current.rotation.x, Math.sin(t * 2) * 0.12 * runAmt + air * 0.25, 8, d);
      tie.current.rotation.z = expDamp(tie.current.rotation.z, -leanZ * 0.6 + stride * 0.08 * runAmt, 8, d);
    }
  });

  return (
    <group ref={root} position={[0, 0, 0]} scale={0.64}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0.08]}>
        <circleGeometry args={[0.34, 18]} />
        <meshBasicMaterial color="#031006" transparent opacity={0.42} depthWrite={false} />
      </mesh>

      <group ref={bounce}>
        <group ref={leftThigh} position={[-0.12, 0.6, 0.02]}>
          <mesh position={[0, -0.15, 0]}>
            <capsuleGeometry args={[0.07, 0.22, 5, 9]} />
            <SuitMat />
          </mesh>
          <mesh position={[0, -0.28, 0]}>
            <sphereGeometry args={[0.055, 9, 7]} />
            <SuitMat />
          </mesh>
          <group ref={leftShin} position={[0, -0.28, 0]}>
            <mesh position={[0, -0.14, 0]}>
              <capsuleGeometry args={[0.055, 0.18, 5, 8]} />
              <SuitMat />
            </mesh>
            <group ref={leftFoot} position={[0, -0.24, 0.02]}>
              <mesh rotation={[0.12, 0, 0]} position={[0, 0.01, 0.05]}>
                <boxGeometry args={[0.13, 0.07, 0.24]} />
                <meshStandardMaterial color={SHOE} roughness={0.36} metalness={0.3} />
              </mesh>
            </group>
          </group>
        </group>

        <group ref={rightThigh} position={[0.12, 0.6, 0.02]}>
          <mesh position={[0, -0.15, 0]}>
            <capsuleGeometry args={[0.07, 0.22, 5, 9]} />
            <SuitMat />
          </mesh>
          <mesh position={[0, -0.28, 0]}>
            <sphereGeometry args={[0.055, 9, 7]} />
            <SuitMat />
          </mesh>
          <group ref={rightShin} position={[0, -0.28, 0]}>
            <mesh position={[0, -0.14, 0]}>
              <capsuleGeometry args={[0.055, 0.18, 5, 8]} />
              <SuitMat />
            </mesh>
            <group ref={rightFoot} position={[0, -0.24, 0.02]}>
              <mesh rotation={[0.12, 0, 0]} position={[0, 0.01, 0.05]}>
                <boxGeometry args={[0.13, 0.07, 0.24]} />
                <meshStandardMaterial color={SHOE} roughness={0.36} metalness={0.3} />
              </mesh>
            </group>
          </group>
        </group>

        <group ref={hip} position={[0, 0.5, 0]}>
          <mesh position={[0, 0.02, 0.03]} scale={[1.05, 0.55, 0.85]}>
            <sphereGeometry args={[0.16, 12, 10]} />
            <SuitMat />
          </mesh>
          <group ref={spine} position={[0, 0.06, 0]}>
            <group ref={chest} position={[0, 0.18, 0.02]}>
              <mesh position={[0, 0.12, 0.02]}>
                <capsuleGeometry args={[0.2, 0.28, 6, 12]} />
                <SuitMat />
              </mesh>
              <mesh position={[-0.2, 0.28, 0]} rotation={[0, 0, 0.42]}>
                <boxGeometry args={[0.17, 0.11, 0.22]} />
                <SuitMat />
              </mesh>
              <mesh position={[0.2, 0.28, 0]} rotation={[0, 0, -0.42]}>
                <boxGeometry args={[0.17, 0.11, 0.22]} />
                <SuitMat />
              </mesh>
              <mesh position={[0, 0.1, -0.08]}>
                <boxGeometry args={[0.27, 0.34, 0.08]} />
                <meshStandardMaterial color={VEST} roughness={0.4} metalness={0.24} />
              </mesh>
              <mesh position={[0, 0.32, -0.12]}>
                <boxGeometry args={[0.17, 0.06, 0.04]} />
                <meshStandardMaterial color={SHIRT} roughness={0.68} />
              </mesh>
              <mesh position={[0, 0.16, -0.13]}>
                <boxGeometry args={[0.055, 0.24, 0.02]} />
                <meshStandardMaterial color={SHIRT} roughness={0.68} />
              </mesh>
              <group ref={tie} position={[0, 0.12, -0.145]}>
                <mesh>
                  <boxGeometry args={[0.042, 0.22, 0.016]} />
                  <meshStandardMaterial color={TIE_COLOR[kit.tie]} roughness={0.4} metalness={kit.tie === "default" ? 0.05 : 0.45} />
                </mesh>
              </group>

              <group ref={leftArm} position={[-0.34, 0.26, 0.02]}>
                <mesh position={[0, -0.12, 0]}>
                  <capsuleGeometry args={[0.06, 0.2, 5, 8]} />
                  <SuitMat />
                </mesh>
                <mesh position={[0, -0.24, 0]}>
                  <sphereGeometry args={[0.05, 8, 7]} />
                  <SuitMat />
                </mesh>
                <group ref={leftFore} position={[0, -0.26, 0]}>
                  <mesh position={[0, -0.12, 0]}>
                    <capsuleGeometry args={[0.05, 0.16, 5, 8]} />
                    <SuitMat />
                  </mesh>
                  <group position={[0, -0.24, 0]}>
                    <ClawHand side={-1} curl={leftClaw} />
                    {kit.coffee ? (
                      <group position={[0.02, -0.06, -0.05]} rotation={[0.55, 0.2, 0.15]}>
                        <mesh position={[0, 0.02, 0]}>
                          <cylinderGeometry args={[0.032, 0.028, 0.07, 10]} />
                          <meshStandardMaterial color="#f4f1ea" roughness={0.42} />
                        </mesh>
                        <mesh position={[0, 0.055, 0]}>
                          <cylinderGeometry args={[0.034, 0.034, 0.012, 10]} />
                          <meshStandardMaterial color="#d8cbb8" roughness={0.45} />
                        </mesh>
                        <mesh position={[0, 0.04, 0]}>
                          <cylinderGeometry args={[0.022, 0.022, 0.02, 10]} />
                          <meshStandardMaterial color="#3a2418" roughness={0.55} />
                        </mesh>
                        <mesh position={[0.038, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
                          <torusGeometry args={[0.018, 0.006, 6, 10, Math.PI]} />
                          <meshStandardMaterial color="#f4f1ea" roughness={0.4} />
                        </mesh>
                      </group>
                    ) : null}
                  </group>
                </group>
              </group>
              <group ref={rightArm} position={[0.34, 0.26, 0.02]}>
                <mesh position={[0, -0.12, 0]}>
                  <capsuleGeometry args={[0.06, 0.2, 5, 8]} />
                  <SuitMat />
                </mesh>
                <mesh position={[0, -0.24, 0]}>
                  <sphereGeometry args={[0.05, 8, 7]} />
                  <SuitMat />
                </mesh>
                <group ref={rightFore} position={[0, -0.26, 0]}>
                  <mesh position={[0, -0.12, 0]}>
                    <capsuleGeometry args={[0.05, 0.16, 5, 8]} />
                    <SuitMat />
                  </mesh>
                  <group position={[0, -0.24, 0]}>
                    <ClawHand side={1} curl={rightClaw} />
                  </group>
                </group>
              </group>

              <group ref={neck} position={[0, 0.42, 0]}>
                <mesh>
                  <sphereGeometry args={[0.1, 12, 10]} />
                  <SkinMat />
                </mesh>
                <group ref={head} position={[0, 0.08, 0]} scale={1.08}>
                  <RexHead eye={eyes} face={kit.face} chain={kit.chain} />
                </group>
              </group>
            </group>
          </group>

          <mesh position={[0, 0.02, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.13, 0.1, 5, 12]} />
            <SkinMat />
          </mesh>
          <group ref={tail1} position={[0, 0.04, 0.18]}>
            <mesh position={[0, 0, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
              <capsuleGeometry args={[0.125, 0.3, 6, 12]} />
              <SkinMat />
            </mesh>
            <mesh position={[0, 0.13, 0.2]}>
              <coneGeometry args={[0.032, 0.09, 5]} />
              <SkinMat color={SKIN_DARK} />
            </mesh>
            <mesh position={[0, 0.12, 0.34]}>
              <coneGeometry args={[0.026, 0.08, 5]} />
              <SkinMat color={SKIN_DARK} />
            </mesh>
            <group ref={tail2} position={[0, -0.01, 0.52]}>
              <mesh position={[0, 0, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
                <capsuleGeometry args={[0.09, 0.32, 5, 11]} />
                <SkinMat />
              </mesh>
              <mesh position={[0, 0.1, 0.22]}>
                <coneGeometry args={[0.022, 0.07, 5]} />
                <SkinMat color={SKIN_DARK} />
              </mesh>
              <mesh position={[0, 0.09, 0.38]}>
                <coneGeometry args={[0.018, 0.065, 5]} />
                <SkinMat color={SKIN_DARK} />
              </mesh>
              <group ref={tail3} position={[0, -0.01, 0.52]}>
                <mesh position={[0, 0, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
                  <capsuleGeometry args={[0.058, 0.32, 5, 10]} />
                  <SkinMat />
                </mesh>
                <mesh position={[0, 0.07, 0.22]}>
                  <coneGeometry args={[0.016, 0.06, 5]} />
                  <SkinMat color={SKIN_DARK} />
                </mesh>
                <group ref={tail4} position={[0, -0.01, 0.5]}>
                  <mesh position={[0, 0, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
                    <capsuleGeometry args={[0.032, 0.3, 4, 9]} />
                    <SkinMat />
                  </mesh>
                  <mesh position={[0, 0, 0.48]} rotation={[Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[0.026, 0.2, 6]} />
                    <SkinMat color={SKIN_DARK} />
                  </mesh>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
