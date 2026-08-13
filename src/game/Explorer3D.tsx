import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import * as THREE from "three";
import type { CharacterId } from "@/lib/characters";
import { CHARACTER_BY_ID } from "@/lib/characters";
import { COLLECT_LINES, CONSTRUCTION_LINE, INSPECT_COPY, NPC_LINES, WORLD_BY_ID, isDistrictOpen, type WorldId } from "@/lib/worlds";
import { useDinoverse } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  DISTRICTS_3D,
  collidersFor,
  hitAABB,
  type District3D,
  type ScreenWall,
} from "./districts3d";
import { FloorScene } from "./floor/FloorScene";
import { floorHeightAt } from "./floor/levels";
import { ShardOrb } from "./shard-orb";
import { usePhoto } from "./textures";

function groundY(district: District3D, x: number, z: number, prevY = 0) {
  return district.id === "forum" ? floorHeightAt(x, z, prevY) : 0;
}

type Prompt =
  | { kind: "npc" | "inspect" | "portal" | "sit" | "stand"; id: string; label: string }
  | null;

declare global {
  interface Window {
    __controlsTest?: {
      getX: () => number;
      getY: () => number;
      getSpeed: () => number;
      getTick?: () => number;
      getKeys?: () => string[];
      getCam?: () => Record<string, number>;
      setKeys: (codes: string[]) => void;
    };
  }
}

const EYE = 1.65;
const SIT_EYE = 1.18;
const RADIUS = 0.38;
const SPEED = 5.4;
const REST_PITCH = -0.16;

function Screen({ wall }: { wall: ScreenWall }) {
  const map = usePhoto(wall.src);
  return (
    <mesh position={wall.position} rotation={[0, wall.rotY, 0]}>
      <planeGeometry args={[wall.w, wall.h]} />
      <meshBasicMaterial map={map ?? undefined} color={map ? "#ffffff" : "#1c1e22"} toneMapped={false} />
    </mesh>
  );
}

function PhotoFrame({ wall }: { wall: ScreenWall }) {
  return (
    <group position={wall.position} rotation={[0, wall.rotY, 0]}>
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[wall.w + 0.16, wall.h + 0.16, 0.08]} />
        <meshStandardMaterial color="#16171b" metalness={0.4} roughness={0.4} />
      </mesh>
      <Screen wall={{ ...wall, position: [0, 0, 0], rotY: 0 }} />
    </group>
  );
}

function PortalGate({ p }: { p: District3D["portals"][number] }) {
  const open = isDistrictOpen(p.to);
  const color = open ? "#3ecf8e" : "#d4af6a";
  const world = WORLD_BY_ID[p.to];
  const fx = Math.sin(p.yaw);
  const fz = Math.cos(p.yaw);
  return (
    <group>
      <mesh position={[p.x, 1.4, p.z]}>
        <boxGeometry args={[p.w, 2.6, p.d]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={open ? 0.55 : 0.28}
          transparent
          opacity={open ? 0.28 : 0.2}
        />
      </mesh>
      {!open ? (
        <PhotoFrame
          wall={{
            src: world.cinematic,
            position: [p.x + fx * 0.95, 2.85, p.z + fz * 0.95],
            rotY: p.yaw,
            w: 2.6,
            h: 1.55,
          }}
        />
      ) : null}
    </group>
  );
}

function Headlamp() {
  const ref = useRef<THREE.SpotLight>(null);
  const { camera } = useThree();
  useFrame(() => {
    const light = ref.current;
    if (!light) return;
    const d = new THREE.Vector3();
    camera.getWorldDirection(d);
    light.position.copy(camera.position);
    light.target.position.copy(camera.position).add(d);
    light.target.updateMatrixWorld();
  });
  return (
    <spotLight
      ref={ref}
      intensity={2.6}
      distance={24}
      angle={0.72}
      penumbra={0.45}
      color="#fff6ea"
    />
  );
}

export function DistrictScene({
  district,
  collected,
  preview = false,
}: {
  district: District3D;
  collected: string[];
  preview?: boolean;
}) {
  if (district.id === "forum") {
    return (
      <>
        <FloorScene collected={collected} />
        {preview ? null : <Headlamp />}
        {district.portals.map((p) => (
          <PortalGate key={p.to} p={p} />
        ))}
      </>
    );
  }

  return (
    <>
      <color attach="background" args={[district.sky]} />
      <fog attach="fog" args={[district.fog, 22, district.fogFar]} />
      <hemisphereLight args={[district.ambient, "#1a1a1c", 0.85]} />
      <directionalLight position={[8, 14, 6]} intensity={district.indoor ? 0.7 : 1.15} />
      <ambientLight intensity={0.25} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[48, 42]} />
        <meshStandardMaterial color={district.ground} roughness={0.82} metalness={0.08} />
      </mesh>

      <PhotoFrame wall={district.backdrop} />
      {district.screens.map((s) => (
        <PhotoFrame key={s.src + s.position.join()} wall={s} />
      ))}

      {district.props.map((p, i) => (
        <mesh key={i} position={p.position}>
          <boxGeometry args={p.size} />
          <meshStandardMaterial
            color={p.color}
            metalness={p.metal ?? 0.1}
            roughness={0.55}
          />
        </mesh>
      ))}

      {district.portals.map((p) => (
        <PortalGate key={p.to} p={p} />
      ))}

      {district.shards.map((s) => (
        <ShardOrb key={s.id} position={s.position} taken={collected.includes(s.id)} />
      ))}

      {district.npcs.map((n) => (
        <group key={n.id} position={n.position}>
          <mesh position={[0, 0.9, 0]}>
            <capsuleGeometry args={[0.28, 1.1, 4, 8]} />
            <meshStandardMaterial color="#3a3d36" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </>
  );
}

type Look = { dx: number; dy: number };
type Stick = { x: number; y: number };

function Player({
  district,
  blocked,
  look,
  stick,
  keysRef,
  session,
  onHud,
  onPortal,
  onDialog,
}: {
  district: District3D;
  blocked: boolean;
  look: React.MutableRefObject<Look>;
  stick: React.MutableRefObject<Stick>;
  keysRef: React.MutableRefObject<Set<string>>;
  session: number;
  onHud: (line: string, prompt: Prompt) => void;
  onPortal: (to: WorldId) => void;
  onDialog: (title: string, body: string, image?: string) => void;
}) {
  const { camera } = useThree();
  const pos = useRef(new THREE.Vector3(district.spawn.x, EYE, district.spawn.z));
  const yaw = useRef(district.spawn.yaw);
  const pitch = useRef(REST_PITCH);
  const speedRef = useRef(0);
  const tickRef = useRef(0);
  const blockedRef = useRef(blocked);
  blockedRef.current = blocked;
  const colliders = useMemo(() => collidersFor(district), [district]);
  const characterId = useDinoverse((s) => s.characterId);
  const collectShard = useDinoverse((s) => s.collectShard);
  const collected = useDinoverse((s) => s.collected);
  const visitWorld = useDinoverse((s) => s.visitWorld);
  const completeQuest = useDinoverse((s) => s.completeQuest);
  const collectedRef = useRef(collected);
  collectedRef.current = collected;
  const promptRef = useRef<Prompt>(null);
  const hudKey = useRef("");
  const interact = useRef<() => void>(() => {});
  const seated = useRef<{ x: number; z: number; yaw: number } | null>(null);
  const lookGrace = useRef(0);

  useEffect(() => {
    pos.current.set(district.spawn.x, groundY(district, district.spawn.x, district.spawn.z) + EYE, district.spawn.z);
    yaw.current = district.spawn.yaw;
    pitch.current = REST_PITCH;
    seated.current = null;
    lookGrace.current = 20;
    visitWorld(district.id);
  }, [district, visitWorld, session]);

  useEffect(() => {
    window.__controlsTest = {
      getX: () => pos.current.x,
      getY: () => pos.current.z,
      getSpeed: () => speedRef.current,
      getTick: () => tickRef.current,
      getKeys: () => [...keysRef.current],
      getCam: () => {
        const d = new THREE.Vector3();
        camera.getWorldDirection(d);
        return {
          px: +camera.position.x.toFixed(2),
          py: +camera.position.y.toFixed(2),
          pz: +camera.position.z.toFixed(2),
          dx: +d.x.toFixed(2),
          dy: +d.y.toFixed(2),
          dz: +d.z.toFixed(2),
          yaw: +yaw.current.toFixed(2),
          pitch: +pitch.current.toFixed(2),
        };
      },
      setKeys: (codes) => {
        keysRef.current.clear();
        for (const c of codes) keysRef.current.add(c);
      },
    };
    return () => {
      delete window.__controlsTest;
    };
  }, [keysRef]);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.1);
    tickRef.current += 1;
    if (lookGrace.current > 0) {
      lookGrace.current -= 1;
      look.current.dx = 0;
      look.current.dy = 0;
    }
    if (blockedRef.current) {
      const y = pos.current.y;
      camera.position.set(pos.current.x, y, pos.current.z);
      camera.up.set(0, 1, 0);
      camera.lookAt(
        pos.current.x - Math.sin(yaw.current) * 6,
        y,
        pos.current.z - Math.cos(yaw.current) * 6,
      );
      return;
    }

    if (Math.abs(look.current.dx) > 28 || Math.abs(look.current.dy) > 28) {
      look.current.dx = 0;
      look.current.dy = 0;
    }
    yaw.current -= look.current.dx * 0.0022;
    pitch.current = THREE.MathUtils.clamp(pitch.current - look.current.dy * 0.0022, -1.2, 1.2);
    look.current.dx = 0;
    look.current.dy = 0;

    const fx = -Math.sin(yaw.current);
    const fz = -Math.cos(yaw.current);
    const rx = Math.cos(yaw.current);
    const rz = -Math.sin(yaw.current);

    const keys = keysRef.current;
    let mx = 0;
    let mz = 0;
    if (keys.has("KeyW") || keys.has("ArrowUp")) {
      mx += fx;
      mz += fz;
    }
    if (keys.has("KeyS") || keys.has("ArrowDown")) {
      mx -= fx;
      mz -= fz;
    }
    if (keys.has("KeyD") || keys.has("ArrowRight")) {
      mx += rx;
      mz += rz;
    }
    if (keys.has("KeyA") || keys.has("ArrowLeft")) {
      mx -= rx;
      mz -= rz;
    }
    mx += rx * stick.current.x + fx * -stick.current.y;
    mz += rz * stick.current.x + fz * -stick.current.y;

    const len = Math.hypot(mx, mz);
    if (len > 1) {
      mx /= len;
      mz /= len;
    }
    const sprint = keys.has("ShiftLeft") || keys.has("ShiftRight") ? 1.35 : 1;
    const seatedNow = seated.current;
    if (seatedNow && (mx !== 0 || mz !== 0)) {
      seated.current = null;
    }

    if (seated.current) {
      pos.current.x = seated.current.x;
      pos.current.z = seated.current.z;
      speedRef.current = 0;
    } else {
      const vx = mx * SPEED * sprint;
      const vz = mz * SPEED * sprint;
      speedRef.current = Math.hypot(vx, vz);

      const tryMove = (nx: number, nz: number) => {
        if (nx < district.bounds.minX + RADIUS || nx > district.bounds.maxX - RADIUS) return false;
        if (nz < district.bounds.minZ + RADIUS || nz > district.bounds.maxZ - RADIUS) return false;
        const foot = pos.current.y - (seated.current ? SIT_EYE : EYE);
        const oldH = groundY(district, pos.current.x, pos.current.z, foot);
        const newH = groundY(district, nx, nz, foot);
        if (newH - oldH > 0.55) return false;
        if (oldH - newH > 0.7) return false;
        for (const c of colliders) {
          if (hitAABB(nx, nz, RADIUS, c, newH)) return false;
        }
        return true;
      };

      const nx = pos.current.x + vx * dt;
      const nz = pos.current.z + vz * dt;
      if (tryMove(nx, pos.current.z)) pos.current.x = nx;
      if (tryMove(pos.current.x, nz)) pos.current.z = nz;
    }

    const eye = seated.current ? SIT_EYE : EYE;
    const ground = groundY(district, pos.current.x, pos.current.z, pos.current.y - eye);
    pos.current.y = ground + eye;
    const bob = !seated.current && speedRef.current > 0.4 ? Math.sin(performance.now() * 0.012) * 0.035 : 0;
    const camY = pos.current.y + bob;
    camera.position.set(pos.current.x, camY, pos.current.z);
    const lookX = pos.current.x + fx * 6;
    const lookZ = pos.current.z + fz * 6;
    camera.up.set(0, 1, 0);
    camera.lookAt(lookX, camY + Math.tan(pitch.current) * 6, lookZ);

    const px = pos.current.x;
    const pz = pos.current.z;

    for (const s of district.shards) {
      if (collectedRef.current.includes(s.id)) continue;
      if (Math.hypot(px - s.position[0], pz - s.position[2]) < 1.1) {
        collectShard(s.id);
        const lines = COLLECT_LINES[characterId];
        onHud(lines[Math.floor(Math.random() * lines.length)] ?? lines[0], promptRef.current);
      }
    }

    let next: Prompt = null;
    if (seated.current) {
      next = { kind: "stand", id: "stand", label: "Stand" };
    } else {
      for (const seat of district.seats) {
        if (ground > 2.8) break;
        if (hitAABB(px, pz, 0.45, seat)) {
          next = { kind: "sit", id: seat.id, label: seat.label };
          break;
        }
      }
      for (const i of district.inspect) {
        if (ground > 3.5 && i.id !== "forum-window" && i.id !== "forum-ticker" && i.id !== "forum-mezz") {
          continue;
        }
        if (ground < 4 && i.id === "forum-mezz") continue;
        if (hitAABB(px, pz, 0.5, i)) {
          const copy = INSPECT_COPY[i.id];
          next = { kind: "inspect", id: i.id, label: copy?.action ?? `Look · ${copy?.title ?? "look"}` };
        }
      }
      for (const n of district.npcs) {
        if (Math.hypot(px - n.position[0], pz - n.position[2]) < 1.6) {
          next = { kind: "npc", id: n.id, label: `Talk to ${NPC_LINES[n.id]?.name ?? "local"}` };
        }
      }
      for (const p of district.portals) {
        if (hitAABB(px, pz, 0.55, { x: p.x, z: p.z, w: p.w + 0.6, d: p.d + 0.6 })) {
          next = {
            kind: "portal",
            id: p.to,
            label: isDistrictOpen(p.to) ? `Enter ${p.label}` : `${p.label} · under construction`,
          };
        }
      }
    }
    promptRef.current = next;
    const key = next ? `${next.kind}:${next.id}` : "";
    if (hudKey.current !== key) {
      hudKey.current = key;
      onHud("", next);
    }

    const bag = useDinoverse.getState();
    if (bag.collected.length >= 8 && bag.visited.length >= 4 && !bag.questDone) {
      completeQuest();
    }

    interact.current = () => {
      const p = promptRef.current;
      if (!p) return;
      if (p.kind === "stand") {
        seated.current = null;
        return;
      }
      if (p.kind === "sit") {
        const seat = district.seats.find((s) => s.id === p.id);
        if (!seat) return;
        seated.current = { x: seat.sitX, z: seat.sitZ, yaw: seat.sitYaw };
        pos.current.x = seat.sitX;
        pos.current.z = seat.sitZ;
        yaw.current = seat.sitYaw;
        return;
      }
      if (p.kind === "portal" && (p.id === "mart" || p.id === "canopy" || p.id === "crater" || p.id === "forum")) {
        if (!isDistrictOpen(p.id)) {
          const world = WORLD_BY_ID[p.id];
          const line = CONSTRUCTION_LINE[p.id][characterId];
          visitWorld(p.id);
          onDialog(`${world.name} · under construction`, line, world.cinematic);
          return;
        }
        onPortal(p.id);
        return;
      }
      if (p.kind === "npc") {
        const npc = NPC_LINES[p.id];
        if (npc) onDialog(npc.name, npc.body[characterId]);
        return;
      }
      if (p.kind === "inspect") {
        const copy = INSPECT_COPY[p.id];
        if (copy) onDialog(copy.title, copy.body[characterId], copy.image);
      }
    };
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "KeyE") interact.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    (window as Window & { __exploreInteract?: () => void }).__exploreInteract = () =>
      interact.current();
  });

  return null;
}

export function Explorer3D({
  characterId,
  startDistrict,
}: {
  characterId: CharacterId;
  startDistrict: WorldId;
}) {
  const character = CHARACTER_BY_ID[characterId];
  const [districtId, setDistrictId] = useState<WorldId>(startDistrict);
  const district = DISTRICTS_3D[districtId];
  const world = WORLD_BY_ID[districtId];
  const [started, setStarted] = useState(false);
  const [session, setSession] = useState(0);
  const [locked, setLocked] = useState(false);
  const [dialog, setDialog] = useState<{ title: string; body: string; image?: string } | null>(null);
  const [prompt, setPrompt] = useState<Prompt>(null);
  const [line, setLine] = useState(world.enterLine[characterId]);
  const [fade, setFade] = useState(0);
  const collected = useDinoverse((s) => s.collected);
  const visited = useDinoverse((s) => s.visited);
  const questDone = useDinoverse((s) => s.questDone);

  const look = useRef<Look>({ dx: 0, dy: 0 });
  const stick = useRef<Stick>({ x: 0, y: 0 });
  const keysRef = useRef(new Set<string>());
  const wrapRef = useRef<HTMLDivElement>(null);
  const lineTimer = useRef(0);

  const onHud = (nextLine: string, nextPrompt: Prompt) => {
    if (nextLine) {
      setLine(nextLine);
      window.clearTimeout(lineTimer.current);
      lineTimer.current = window.setTimeout(() => setLine(""), 3200);
    }
    setPrompt(nextPrompt);
  };

  const goPortal = (to: WorldId) => {
    if (!isDistrictOpen(to)) return;
    setFade(1);
    window.setTimeout(() => {
      setDistrictId(to);
      setLine(WORLD_BY_ID[to].enterLine[characterId]);
      setFade(0);
    }, 280);
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => keysRef.current.add(e.code);
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.code);
    const blur = () => keysRef.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      if (document.pointerLockElement !== el) return;
      look.current.dx += e.movementX;
      look.current.dy += e.movementY;
    };
    const change = () => setLocked(document.pointerLockElement === el);
    document.addEventListener("mousemove", move);
    document.addEventListener("pointerlockchange", change);
    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("pointerlockchange", change);
    };
  }, []);

  const requestLock = () => {
    const el = wrapRef.current;
    if (!el) return;
    const req = el.requestPointerLock as typeof el.requestPointerLock & {
      (opts?: { unadjustedMovement?: boolean }): Promise<void> | void;
    };
    try {
      const p = req.call(el, { unadjustedMovement: true });
      if (p && typeof (p as Promise<void>).catch === "function") {
        void (p as Promise<void>).catch(() => el.requestPointerLock());
      }
    } catch {
      el.requestPointerLock();
    }
  };

  const onStickStart = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    moveStick(e);
  };
  const moveStick = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    let y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    if (len < 0.18) {
      x = 0;
      y = 0;
    }
    stick.current = { x, y };
  };
  const onStickEnd = () => {
    stick.current = { x: 0, y: 0 };
  };

  const lookPad = useRef({ id: -1, x: 0, y: 0 });
  const onLookStart = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    lookPad.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  };
  const onLookMove = (e: PointerEvent<HTMLDivElement>) => {
    if (lookPad.current.id !== e.pointerId) return;
    look.current.dx += e.clientX - lookPad.current.x;
    look.current.dy += e.clientY - lookPad.current.y;
    lookPad.current.x = e.clientX;
    lookPad.current.y = e.clientY;
  };
  const onLookEnd = () => {
    lookPad.current.id = -1;
  };

  return (
    <div className="relative isolate min-h-[calc(100dvh-4rem)] bg-bg">
      <div
        ref={wrapRef}
        className="absolute inset-0 overflow-hidden touch-none"
        onClick={() => {
          if (started && !locked && !dialog) requestLock();
        }}
      >
        <Canvas
          shadows
          camera={{ fov: 68, position: [0, EYE, 24], near: 0.08, far: 280 }}
          frameloop="always"
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.08,
          }}
        >
          <DistrictScene district={district} collected={collected} />
          <Player
            district={district}
            blocked={!!dialog}
            look={look}
            stick={stick}
            keysRef={keysRef}
            session={session}
            onHud={onHud}
            onPortal={goPortal}
            onDialog={(title, body, image) => setDialog({ title, body, image })}
          />
        </Canvas>
        <div
          className="pointer-events-none absolute inset-0 bg-bg transition-opacity duration-200"
          style={{ opacity: fade }}
        />
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg/80" />

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-5">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="pointer-events-auto rounded-lg border border-border bg-bg/80 px-3 py-2 backdrop-blur-sm">
              <p className="text-xs tracking-wide text-muted uppercase">{world.name}</p>
              <p className="font-display text-sm tabular-nums">
                {collected.length}/8 shards · {visited.length}/4 districts
              </p>
            </div>
            <div className="pointer-events-auto hidden rounded-lg border border-border bg-bg/80 px-3 py-2 text-xs text-muted sm:block">
              WASD walk · mouse look · E
            </div>
          </div>
          {line ? (
            <div className="pointer-events-auto flex max-w-md items-start gap-3 rounded-xl border border-border bg-bg/85 p-3 backdrop-blur-sm">
              <img
                src={character.portrait}
                alt=""
                className="size-10 rounded-md object-cover object-[center_18%]"
              />
              <p className="text-sm leading-relaxed">{line}</p>
            </div>
          ) : null}
        </div>
        <div className="hidden justify-end sm:flex">
          {prompt ? (
            <Button
              type="button"
              className="pointer-events-auto"
              onClick={() =>
                (window as Window & { __exploreInteract?: () => void }).__exploreInteract?.()
              }
            >
              {prompt.label}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="absolute bottom-24 left-4 sm:hidden">
        <div
          className="relative size-28 rounded-full border border-border bg-bg/50 touch-none"
          onPointerDown={onStickStart}
          onPointerMove={moveStick}
          onPointerUp={onStickEnd}
          onPointerCancel={onStickEnd}
        >
          <div className="pointer-events-none absolute inset-8 rounded-full bg-surface-2" />
        </div>
      </div>
      <div
        className="absolute right-4 bottom-24 h-36 w-36 touch-none sm:hidden"
        onPointerDown={onLookStart}
        onPointerMove={onLookMove}
        onPointerUp={onLookEnd}
        onPointerCancel={onLookEnd}
      />
      <button
        type="button"
        className="absolute right-4 bottom-24 grid size-16 place-items-center rounded-full border border-border bg-accent text-accent-fg font-display text-sm sm:hidden"
        onClick={() =>
          (window as Window & { __exploreInteract?: () => void }).__exploreInteract?.()
        }
      >
        E
      </button>

      {!started ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-bg/80 p-6">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6">
            <p className="text-xs tracking-wide text-muted uppercase">{character.name}</p>
            <h1 className="mt-2 font-display text-2xl font-medium">The Floor is open</h1>
            <p className="mt-3 text-sm text-muted">
              Walk the lobby, sit at a terminal, look out the glass. Dino Mart, the Mall, and the
              Arena are still under construction. WASD to walk, mouse to look, E to sit and use
              things.
            </p>
            <Button
              id="enter-3d"
              className="mt-6 w-full"
              onClick={() => {
                setStarted(true);
                setSession((n) => n + 1);
                requestLock();
              }}
            >
              Enter {world.name}
            </Button>
          </div>
        </div>
      ) : null}

      {dialog ? (
        <div className="absolute inset-0 z-20 grid place-items-end bg-bg/40 p-4 sm:place-items-center">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-5">
            <p className="text-xs tracking-wide text-muted uppercase">{dialog.title}</p>
            {dialog.image ? (
              <img
                src={dialog.image}
                alt=""
                className="mt-3 aspect-video w-full rounded-lg object-cover"
              />
            ) : null}
            <p className="mt-3 text-sm leading-relaxed">{dialog.body}</p>
            <Button className="mt-4" onClick={() => setDialog(null)}>
              Continue
            </Button>
          </div>
        </div>
      ) : null}

      {questDone ? (
        <div className="absolute inset-x-0 top-20 z-10 mx-auto w-[min(100%-1.5rem,28rem)] rounded-xl border border-accent/40 bg-surface p-4">
          <p className="font-display text-lg">Bag secured</p>
          <p className="mt-1 text-sm text-muted">
            You walked The Floor as {character.name} and checked the other three. The listing window is watching.
          </p>
        </div>
      ) : null}
    </div>
  );
}
