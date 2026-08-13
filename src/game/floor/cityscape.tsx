import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { Box } from "./kit";
import { useHudTextures } from "./hud-tex";

function ringTowers() {
  const out: { x: number; z: number; h: number; w: number; d: number }[] = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2 + 0.08;
    const r = 40 + (i % 7) * 3.2;
    const h = 22 + ((i * 17) % 38);
    const w = 2.6 + (i % 4) * 0.7;
    out.push({
      x: Math.cos(a) * r,
      z: Math.sin(a) * r,
      h,
      w,
      d: w * (0.75 + (i % 3) * 0.18),
    });
  }
  return out;
}

function Craft({ seed }: { seed: number }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * (0.08 + seed * 0.02) + seed * 4;
    const g = ref.current;
    if (!g) return;
    g.position.x = Math.cos(t) * (34 + seed * 3);
    g.position.y = 14 + seed * 2.4 + Math.sin(t * 1.4) * 1.2;
    g.position.z = Math.sin(t * 0.85) * (28 + seed * 2);
    g.rotation.y = -t + Math.PI / 2;
  });
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[1.8, 0.22, 0.55]} />
        <meshStandardMaterial color="#1c222a" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0.7, 0.12, 0]}>
        <sphereGeometry args={[0.16, 8, 6]} />
        <meshStandardMaterial color="#3ecf8e" emissive="#3ecf8e" emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}

export function Cityscape() {
  const hud = useHudTextures();
  const towers = useMemo(ringTowers, []);

  return (
    <group>
      {towers.map((t) => (
        <group key={`${t.x.toFixed(1)}-${t.z.toFixed(1)}`} position={[t.x, t.h / 2, t.z]}>
          <mesh castShadow>
            <boxGeometry args={[t.w, t.h, t.d]} />
            <meshStandardMaterial
              color="#1c2834"
              metalness={0.62}
              roughness={0.22}
              map={hud?.windows ?? undefined}
              emissive="#243044"
              emissiveIntensity={0.55}
            />
          </mesh>
          <mesh position={[0, t.h / 2 + 0.55, 0]}>
            <boxGeometry args={[t.w * 0.28, 1.1, t.d * 0.28]} />
            <meshStandardMaterial color="#0e141c" metalness={0.75} roughness={0.2} />
          </mesh>
          <mesh position={[0, t.h / 2 + 1.4, 0]}>
            <sphereGeometry args={[0.12, 8, 6]} />
            <meshStandardMaterial
              color={t.h % 2 ? "#3ecf8e" : "#d4af6a"}
              emissive={t.h % 2 ? "#3ecf8e" : "#d4af6a"}
              emissiveIntensity={1.6}
            />
          </mesh>
        </group>
      ))}

      {[0, 1, 2, 3, 4].map((n) => (
        <Craft key={n} seed={n} />
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 4]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial
          color="#12181f"
          roughness={0.92}
          metalness={0.08}
          map={hud?.asphalt ?? undefined}
        />
      </mesh>
    </group>
  );
}

export function PlazaTiles() {
  const strips = useMemo(() => {
    const out: [number, number][] = [];
    for (let x = -20; x <= 20; x += 4) out.push([x, 22]);
    for (let z = 18; z <= 32; z += 4) out.push([0, z]);
    return out;
  }, []);
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 24]} receiveShadow>
        <planeGeometry args={[48, 22]} />
        <meshStandardMaterial color="#1a1d22" roughness={0.38} metalness={0.28} />
      </mesh>
      {strips.map(([x, z]) => (
        <Box
          key={`${x}-${z}`}
          position={[x, 0.03, z]}
          size={[3.6, 0.02, 0.08]}
          color="#d4af6a"
          emissive="#d4af6a"
          eInt={0.85}
        />
      ))}
    </>
  );
}
