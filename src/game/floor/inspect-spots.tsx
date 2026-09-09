import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { requestFloorLook } from "./floor-interact";
import { FLOOR_INSPECT } from "./layout";

const FEATURED = new Set([
  "forum-heli",
  "forum-coffee",
  "forum-vend",
  "forum-drinks",
  "forum-lunch",
  "forum-ticker",
  "forum-reception",
  "forum-directory",
  "forum-hq-sign",
  "forum-window",
  "forum-pad",
  "forum-hintze",
  "forum-board",
  "forum-dinose",
]);

export function InspectSpots({ preview = false }: { preview?: boolean }) {
  const spots = useMemo(() => FLOOR_INSPECT.filter((i) => FEATURED.has(i.id)), []);
  const rings = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const pips = useRef<(THREE.Mesh | null)[]>([]);
  const camera = useThree((s) => s.camera);
  const clock = useRef(0);

  useFrame((_, raw) => {
    clock.current += raw;
    const pulse = 0.5 + 0.5 * Math.sin(clock.current * 2.3);
    for (let i = 0; i < spots.length; i += 1) {
      const spot = spots[i]!;
      const d = Math.hypot(camera.position.x - spot.x, camera.position.z - spot.z);
      const near = Math.max(0, 1 - d / 5.6);
      const ring = rings.current[i];
      if (ring) ring.opacity = 0.12 + near * 0.42;
      const pip = pips.current[i];
      if (pip) {
        pip.position.y = 1.04 + pulse * 0.07;
        pip.rotation.y += raw * 1.35;
        const mat = pip.material;
        if (mat instanceof THREE.MeshBasicMaterial) {
          mat.opacity = 0.32 + near * 0.55;
        }
      }
    }
  });

  return (
    <group>
      {spots.map((spot, i) => (
        <group key={spot.id} position={[spot.x, spot.y ?? 0, spot.z]} userData={{ floorLook: spot.id }}>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.045, 0]}
            onPointerDown={
              preview
                ? undefined
                : (e) => {
                    e.stopPropagation();
                    requestFloorLook(spot.id);
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
            <ringGeometry args={[0.4, 0.58, 24]} />
            <meshBasicMaterial
              ref={(m) => {
                rings.current[i] = m;
              }}
              color="#d4a017"
              transparent
              opacity={0.22}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
          <mesh
            ref={(m) => {
              pips.current[i] = m;
            }}
            position={[0, 1.05, 0]}
            onPointerDown={
              preview
                ? undefined
                : (e) => {
                    e.stopPropagation();
                    requestFloorLook(spot.id);
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
            <octahedronGeometry args={[0.085, 0]} />
            <meshBasicMaterial color="#e2b42a" transparent opacity={0.7} depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh
            position={[0, 0.72, 0]}
            frustumCulled={false}
            onPointerDown={
              preview
                ? undefined
                : (e) => {
                    e.stopPropagation();
                    requestFloorLook(spot.id);
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
            <cylinderGeometry args={[0.58, 0.58, 1.45, 12]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
