import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AdaptiveDpr } from "@react-three/drei";
import { useQuality } from "../quality";
import { RexRunner } from "./rex-runner";
import { EnergyOrb, HazardMushroom, ParachuteBone, RockBoulder, StoneTunnel, TokenBillboard } from "./props";
import { STAGES, type StageId, type StageTheme } from "./levels";
import {
  CHARACTERS,
  LANE_X,
  type CharId,
  type Collected,
  type RunObj,
  type RunState,
  stepRun,
} from "./run-state";

function SkyGrove({ theme }: { theme: StageTheme }) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[48, 16, 12]} />
        <meshBasicMaterial color={theme.sky} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh position={[10, 11, -22]}>
        <sphereGeometry args={[theme.id === 3 ? 1.6 : 2.4, 12, 10]} />
        <meshBasicMaterial color={theme.sun} />
      </mesh>
      <mesh position={[10, 11, -22]}>
        <sphereGeometry args={[theme.id === 3 ? 2.6 : 3.6, 12, 10]} />
        <meshBasicMaterial color={theme.sunGlow} transparent opacity={0.28} depthWrite={false} />
      </mesh>
      {[
        { x: -8.2, z: -10, s: 3.2, c: theme.hills[0] },
        { x: 8.6, z: -14, s: 3.8, c: theme.hills[1] },
        { x: -9.4, z: -22, s: 4.1, c: theme.hills[1] },
        { x: 9.8, z: -26, s: 3.5, c: theme.hills[0] },
        { x: -7.6, z: -32, s: 3.6, c: theme.hills[0] },
        { x: 8.2, z: -34, s: 4.4, c: theme.hills[1] },
      ].map((h) => (
        <mesh key={`${h.x}-${h.z}`} position={[h.x, -0.4, h.z]} scale={[h.s, 1.15, h.s * 1.4]}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color={h.c} roughness={0.88} />
        </mesh>
      ))}
    </group>
  );
}

function LaneField({
  scroll,
  theme,
}: {
  scroll: React.MutableRefObject<number>;
  theme: StageTheme;
}) {
  const stripes = useRef<THREE.Group>(null);
  useFrame(() => {
    if (stripes.current) stripes.current.position.z = (scroll.current * 0.08) % 6;
  });
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -18]} receiveShadow={false}>
        <planeGeometry args={[22, 72]} />
        <meshStandardMaterial color={theme.ground} roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.4, 0.008, -18]}>
        <planeGeometry args={[4.2, 72]} />
        <meshStandardMaterial color={theme.grass} roughness={0.86} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5.4, 0.008, -18]}>
        <planeGeometry args={[4.2, 72]} />
        <meshStandardMaterial color={theme.grass} roughness={0.86} />
      </mesh>
      {LANE_X.map((x, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, -18]}>
          <planeGeometry args={[1.22, 64]} />
          <meshStandardMaterial
            color={i === 1 ? theme.laneMid : theme.lane}
            emissive={theme.lane}
            emissiveIntensity={0.16}
            roughness={0.72}
          />
        </mesh>
      ))}
      <group ref={stripes}>
        {[-0.74, 0.74].map((x) => (
          <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.028, -18]}>
            <planeGeometry args={[0.08, 64]} />
            <meshStandardMaterial
              color={theme.stripe}
              emissive={theme.stripeEmissive}
              emissiveIntensity={0.7}
              roughness={0.32}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function GroveDecor({
  scroll,
  dense,
  theme,
}: {
  scroll: React.MutableRefObject<number>;
  dense: boolean;
  theme: StageTheme;
}) {
  const group = useRef<THREE.Group>(null);
  const looks = theme.grove;
  const items = useMemo(() => {
    const count = dense ? 18 : 8;
    const list: { x: number; z: number; s: number; look: number }[] = [];
    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      list.push({
        x: side * (2.6 + (i % 5) * 0.42),
        z: -3.2 - i * 2.2,
        s: 0.48 + (i % 4) * 0.18,
        look: i % looks.length,
      });
    }
    return list;
  }, [dense, looks.length]);
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    g.position.z = (scroll.current * 0.12) % 4.4;
  });
  return (
    <group ref={group}>
      {items.map((m, i) => (
        <group key={i} position={[m.x, 0, m.z]} scale={m.s}>
          <HazardMushroom look={looks[m.look] ?? looks[0]} />
        </group>
      ))}
    </group>
  );
}

function Spores({ theme }: { theme: StageTheme }) {
  const group = useRef<THREE.Group>(null);
  const motes = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        x: ((i * 1.7) % 7) - 3.5,
        y: 0.5 + (i % 5) * 0.28,
        z: -4 - (i % 8) * 3.2,
        c: theme.spores[i % 4]!,
      })),
    [theme],
  );
  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    g.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.12;
    g.rotation.y = state.clock.elapsedTime * 0.08;
  });
  return (
    <group ref={group}>
      {motes.map((m, i) => (
        <mesh key={i} position={[m.x, m.y, m.z]}>
          <sphereGeometry args={[0.04, 6, 5]} />
          <meshBasicMaterial color={m.c} transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function laneX(lane: number) {
  return LANE_X[lane] ?? 0;
}

function TrackItem({ obj, theme }: { obj: RunObj; theme: StageTheme }) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    g.position.x = obj.type === "tunnel" ? 0 : laneX(obj.lane);
    g.position.z = obj.z;
    if (obj.type === "bone") g.position.y = obj.y;
  });
  const x = laneX(obj.lane);
  if (obj.type === "mushroom") {
    return (
      <group ref={group} position={[x, 0, obj.z]}>
        <HazardMushroom look={theme.hazard} />
      </group>
    );
  }
  if (obj.type === "rock") {
    return (
      <group ref={group} position={[x, 0, obj.z]}>
        <RockBoulder />
      </group>
    );
  }
  if (obj.type === "tunnel") {
    return (
      <group ref={group} position={[0, 0, obj.z]}>
        <StoneTunnel openLane={obj.lane} />
      </group>
    );
  }
  if (obj.type === "bone") {
    return (
      <group ref={group} position={[x, obj.y, obj.z]}>
        <ParachuteBone z={obj.z} />
      </group>
    );
  }
  if (obj.type === "orb") {
    return (
      <group ref={group} position={[x, 0, obj.z]}>
        <EnergyOrb z={obj.z} />
      </group>
    );
  }
  const char = CHARACTERS.find((c) => c.id === obj.charId);
  return (
    <group ref={group} position={[x, 0, obj.z]}>
      <TokenBillboard src={char?.img ?? "/game/zen-stego.jpg"} z={obj.z} />
    </group>
  );
}

export function RunScene({
  run,
  collected,
  playing,
  stage,
  onHud,
  onCrash,
  onUnlock,
}: {
  run: React.MutableRefObject<RunState>;
  collected: React.MutableRefObject<Collected>;
  playing: boolean;
  stage: StageId;
  onHud: (score: number, energy: number, lives: number) => void;
  onCrash: () => void;
  onUnlock: (id: CharId) => void;
}) {
  const { level: quality } = useQuality();
  const theme = STAGES[stage];
  const scroll = useRef(0);
  const hudTick = useRef(0);
  const sig = useRef("");
  const keyLight = useRef<THREE.PointLight>(null);
  const [items, setItems] = useState<RunObj[]>([]);

  useFrame((state, dt) => {
    const clamped = Math.min(dt, 0.05);
    if (playing && run.current.active) {
      const result = stepRun(run.current, clamped, collected.current);
      scroll.current = run.current.distance;
      hudTick.current += clamped;
      if (hudTick.current > 0.08) {
        hudTick.current = 0;
        onHud(run.current.score, run.current.energy, run.current.lives);
      }
      if (result.collectedId) {
        const id = result.collectedId;
        queueMicrotask(() => onUnlock(id));
      }
      if (result.fatal) {
        queueMicrotask(onCrash);
        return;
      }
    } else {
      scroll.current += clamped * 8;
    }

    const next = run.current.objects;
    const nextSig = next.map((o) => o.id).join(",");
    if (nextSig !== sig.current) {
      sig.current = nextSig;
      const snapshot = next.slice();
      queueMicrotask(() => setItems(snapshot));
    }

    const lx = run.current.laneX;
    const ly = run.current.y;
    state.camera.position.x += (lx * 0.42 - state.camera.position.x) * 0.1;
    state.camera.position.y = 1.72 + ly * 0.38;
    state.camera.position.z = 4.15;
    state.camera.lookAt(lx * 0.18, 0.72 + ly * 0.28, -5);
    if (keyLight.current) {
      keyLight.current.position.set(lx, 2.15 + ly, 1.35);
    }
  });

  return (
    <>
      <AdaptiveDpr pixelated={false} />
      <color attach="background" args={[theme.sky]} />
      <fog attach="fog" args={[theme.fog, 14, 44]} />
      <ambientLight intensity={theme.id === 1 ? 0.72 : 0.42} />
      <hemisphereLight color={theme.hemiSky} groundColor={theme.hemiGround} intensity={0.8} />
      <directionalLight position={[8, 14, 4]} intensity={theme.id === 3 ? 1.15 : 1.5} color={theme.dirLight} />
      <pointLight ref={keyLight} intensity={1.5} distance={10} color="#fff4d6" />
      <pointLight position={[-4, 3, -6]} intensity={0.85} distance={16} color={theme.accentA} />
      <pointLight position={[4, 2.6, -8]} intensity={0.8} distance={16} color={theme.accentB} />
      <SkyGrove theme={theme} />
      <LaneField scroll={scroll} theme={theme} />
      <GroveDecor scroll={scroll} dense={quality !== "low"} theme={theme} />
      {quality !== "low" ? <Spores theme={theme} /> : null}
      {items.map((obj) => (
        <TrackItem key={obj.id} obj={obj} theme={theme} />
      ))}
      <RexRunner
        getX={() => run.current.laneX}
        getY={() => run.current.y}
        running={playing}
        getInvuln={() => run.current.invuln > 0}
      />
    </>
  );
}
