import { useFrame, useThree } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import type { Group } from "three";
import { requestFloorTalk } from "./floor-interact";

function yawToward(dx: number, dz: number, forward: "minusZ" | "plusZ") {
  if (dx * dx + dz * dz < 1e-6) return null;
  return forward === "plusZ" ? Math.atan2(dx, dz) : Math.atan2(-dx, -dz);
}

function shortest(from: number, to: number) {
  let d = to - from;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return from + d;
}

export function Talkable({
  id,
  position,
  rotY = 0,
  facePlayer = true,
  forward = "minusZ",
  preview = false,
  children,
}: {
  id: string;
  position: [number, number, number];
  rotY?: number;
  facePlayer?: boolean;
  forward?: "minusZ" | "plusZ";
  preview?: boolean;
  children: ReactNode;
}) {
  const root = useRef<Group>(null);
  const yaw = useRef(rotY);
  const camera = useThree((s) => s.camera);

  useFrame((_, raw) => {
    const node = root.current;
    if (!node) return;
    node.position.set(position[0], position[1], position[2]);
    if (!facePlayer || preview) {
      node.rotation.y = rotY;
      return;
    }
    const dx = camera.position.x - position[0];
    const dz = camera.position.z - position[2];
    const dist = Math.hypot(dx, dz);
    const want = dist < 3.4 ? yawToward(dx, dz, forward) : rotY;
    if (want == null) return;
    const dt = Math.min(raw, 0.05);
    const target = shortest(yaw.current, want);
    yaw.current += (target - yaw.current) * Math.min(1, dt * 6);
    node.rotation.y = yaw.current;
  });

  return (
    <group
      ref={root}
      position={position}
      rotation={[0, rotY, 0]}
      userData={{ floorTalk: id }}
      onPointerDown={
        preview
          ? undefined
          : (e) => {
              e.stopPropagation();
              requestFloorTalk(id);
            }
      }
      onPointerOver={
        preview
          ? undefined
          : () => {
              document.body.style.cursor = "pointer";
            }
      }
      onPointerOut={
        preview
          ? undefined
          : () => {
              document.body.style.cursor = "";
            }
      }
    >
      <mesh position={[0, 0.92, 0]} frustumCulled={false}>
        <capsuleGeometry args={[0.48, 1.12, 3, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {children}
    </group>
  );
}
