import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
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
import { clampInCab, getLiftFloorY, inLiftCabin, liftBusy, liftPrompt, requestLift, tickLift } from "./floor/lift";
import { useQuality } from "./quality";
import { ShardOrb } from "./shard-orb";
import { usePhoto } from "./textures";

function groundY(district: District3D, x: number, z: number, prevY = 0) {
  if (district.id !== "forum") return 0;
  if (inLiftCabin(x, z)) return getLiftFloorY();
  return floorHeightAt(x, z, prevY);
}

type Prompt =
  | { kind: "npc" | "inspect" | "portal" | "sit" | "stand" | "lift"; id: string; label: string }
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
const SPEED = 6.35;
const SPRINT_MUL = 1.42;
const ACCEL = 26;
const DECEL = 18;
const LOOK_SENS = 0.00205;
const KEY_LOOK = 2.05;
const HEIGHT_DAMP = 20;
const REST_PITCH = -0.06;
const FOV_DEFAULT = 68;
const FOV_MIN = 36;
const FOV_MAX = 94;
const FOV_DAMP = 11;
const ZOOM_RATE = 38;
const MOVE_CODES = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "KeyQ",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ShiftLeft",
  "ShiftRight",
  "Minus",
  "Equal",
  "NumpadSubtract",
  "NumpadAdd",
  "Numpad4",
  "Numpad6",
  "Numpad8",
  "Numpad2",
  "PageUp",
  "PageDown",
  "BracketLeft",
  "BracketRight",
  "Digit0",
  "Numpad0",
  "Home",
  "KeyR",
  "Space",
]);
const LOOK_LEFT = new Set(["ArrowLeft", "KeyQ", "Numpad4"]);
const LOOK_RIGHT = new Set(["ArrowRight", "Numpad6"]);
const LOOK_UP = new Set(["ArrowUp", "Numpad8"]);
const LOOK_DOWN = new Set(["ArrowDown", "Numpad2"]);
const ZOOM_IN = new Set(["Equal", "NumpadAdd", "PageUp", "BracketRight"]);
const ZOOM_OUT = new Set(["Minus", "NumpadSubtract", "PageDown", "BracketLeft"]);
const VIEW_RESET = new Set(["Digit0", "Numpad0", "Home", "KeyR"]);

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
  const dir = useRef(new THREE.Vector3());
  const { camera } = useThree();
  useFrame(() => {
    const light = ref.current;
    if (!light) return;
    camera.getWorldDirection(dir.current);
    light.position.copy(camera.position);
    light.target.position.copy(camera.position).add(dir.current);
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
  const { settings } = useQuality();
  if (district.id === "forum") {
    return (
      <>
        <FloorScene collected={collected} />
        {preview || !settings.headlamp ? null : <Headlamp />}
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
type Zoom = { wheel: number };

function keyHeld(keys: Set<string>, codes: Set<string>) {
  for (const code of codes) if (keys.has(code)) return true;
  return false;
}

function Player({
  district,
  blocked,
  look,
  stick,
  zoom,
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
  zoom: React.MutableRefObject<Zoom>;
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
  const vel = useRef(new THREE.Vector2(0, 0));
  const bobT = useRef(0);
  const lookGrace = useRef(0);
  const fov = useRef(FOV_DEFAULT);
  const fovTarget = useRef(FOV_DEFAULT);

  useEffect(() => {
    pos.current.set(district.spawn.x, groundY(district, district.spawn.x, district.spawn.z) + EYE, district.spawn.z);
    yaw.current = district.spawn.yaw;
    pitch.current = REST_PITCH;
    vel.current.set(0, 0);
    bobT.current = 0;
    fov.current = FOV_DEFAULT;
    fovTarget.current = FOV_DEFAULT;
    seated.current = null;
    lookGrace.current = 2;
    visitWorld(district.id);
  }, [district, visitWorld, session]);

  useEffect(() => {
    camera.rotation.order = "YXZ";
  }, [camera]);

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
          fov: +fov.current.toFixed(1),
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
    const dt = Math.min(Math.max(raw, 0), 0.05);
    tickRef.current += 1;
    if (district.id === "forum") tickLift(dt);
    camera.rotation.order = "YXZ";

    if (lookGrace.current > 0) {
      lookGrace.current -= 1;
      look.current.dx = 0;
      look.current.dy = 0;
    }

    const applyCamera = (y: number) => {
      camera.position.set(pos.current.x, y, pos.current.z);
      camera.rotation.x = -pitch.current;
      camera.rotation.y = yaw.current;
      camera.rotation.z = 0;
      if ("fov" in camera) {
        const persp = camera as THREE.PerspectiveCamera;
        if (Math.abs(persp.fov - fov.current) > 0.02) {
          persp.fov = fov.current;
          persp.updateProjectionMatrix();
        }
      }
    };

    if (blockedRef.current) {
      vel.current.set(0, 0);
      applyCamera(pos.current.y);
      return;
    }

    const keys = keysRef.current;
    const lookDx = THREE.MathUtils.clamp(look.current.dx, -96, 96);
    const lookDy = THREE.MathUtils.clamp(look.current.dy, -96, 96);
    look.current.dx = 0;
    look.current.dy = 0;
    yaw.current -= lookDx * LOOK_SENS;
    pitch.current = THREE.MathUtils.clamp(pitch.current - lookDy * LOOK_SENS, -1.15, 1.15);

    let keyYaw = 0;
    let keyPitch = 0;
    if (keyHeld(keys, LOOK_LEFT)) keyYaw += 1;
    if (keyHeld(keys, LOOK_RIGHT)) keyYaw -= 1;
    if (keyHeld(keys, LOOK_UP)) keyPitch += 1;
    if (keyHeld(keys, LOOK_DOWN)) keyPitch -= 1;
    yaw.current += keyYaw * KEY_LOOK * dt;
    pitch.current = THREE.MathUtils.clamp(pitch.current + keyPitch * KEY_LOOK * 0.82 * dt, -1.15, 1.15);

    if (keyHeld(keys, ZOOM_IN)) fovTarget.current -= ZOOM_RATE * dt;
    if (keyHeld(keys, ZOOM_OUT)) fovTarget.current += ZOOM_RATE * dt;
    fovTarget.current += zoom.current.wheel;
    zoom.current.wheel = 0;
    if (keyHeld(keys, VIEW_RESET)) {
      fovTarget.current = FOV_DEFAULT;
      pitch.current += (REST_PITCH - pitch.current) * (1 - Math.exp(-10 * dt));
    }
    fovTarget.current = THREE.MathUtils.clamp(fovTarget.current, FOV_MIN, FOV_MAX);
    fov.current += (fovTarget.current - fov.current) * (1 - Math.exp(-FOV_DAMP * dt));

    const fx = -Math.sin(yaw.current);
    const fz = -Math.cos(yaw.current);
    const rx = Math.cos(yaw.current);
    const rz = -Math.sin(yaw.current);

    let mx = 0;
    let mz = 0;
    if (keys.has("KeyW")) {
      mx += fx;
      mz += fz;
    }
    if (keys.has("KeyS")) {
      mx -= fx;
      mz -= fz;
    }
    if (keys.has("KeyD")) {
      mx += rx;
      mz += rz;
    }
    if (keys.has("KeyA")) {
      mx -= rx;
      mz -= rz;
    }
    mx += rx * stick.current.x + fx * -stick.current.y;
    mz += rz * stick.current.x + fz * -stick.current.y;

    const inputLen = Math.hypot(mx, mz);
    let analog = 0;
    if (inputLen > 0.0001) {
      analog = Math.min(1, inputLen);
      mx = (mx / inputLen) * analog;
      mz = (mz / inputLen) * analog;
    }
    const sprint = keys.has("ShiftLeft") || keys.has("ShiftRight") ? SPRINT_MUL : 1;
    if (seated.current && analog > 0.08) seated.current = null;

    if (seated.current) {
      pos.current.x = seated.current.x;
      pos.current.z = seated.current.z;
      vel.current.set(0, 0);
      speedRef.current = 0;
    } else {
      const targetVx = mx * SPEED * sprint;
      const targetVz = mz * SPEED * sprint;
      const rate = analog > 0.001 ? ACCEL : DECEL;
      const k = 1 - Math.exp(-rate * dt);
      vel.current.x += (targetVx - vel.current.x) * k;
      vel.current.y += (targetVz - vel.current.y) * k;
      if (analog < 0.001 && vel.current.length() < 0.04) vel.current.set(0, 0);
      speedRef.current = vel.current.length();

      const tryMove = (nx: number, nz: number) => {
        if (nx < district.bounds.minX + RADIUS || nx > district.bounds.maxX - RADIUS) return false;
        if (nz < district.bounds.minZ + RADIUS || nz > district.bounds.maxZ - RADIUS) return false;
        const eyeNow = seated.current ? SIT_EYE : EYE;
        const foot = pos.current.y - eyeNow;
        const oldH = groundY(district, pos.current.x, pos.current.z, foot);
        const newH = groundY(district, nx, nz, foot);
        if (newH - oldH > 0.55) return false;
        if (oldH - newH > 0.7) return false;
        for (const c of colliders) {
          if (hitAABB(nx, nz, RADIUS, c, newH)) return false;
        }
        return true;
      };

      const nx = pos.current.x + vel.current.x * dt;
      const nz = pos.current.z + vel.current.y * dt;
      if (tryMove(nx, pos.current.z)) pos.current.x = nx;
      else vel.current.x = 0;
      if (tryMove(pos.current.x, nz)) pos.current.z = nz;
      else vel.current.y = 0;
      if (district.id === "forum" && liftBusy() && inLiftCabin(pos.current.x, pos.current.z)) {
        const kept = clampInCab(pos.current.x, pos.current.z);
        pos.current.x = kept.x;
        pos.current.z = kept.z;
      }
    }

    const eye = seated.current ? SIT_EYE : EYE;
    const ground = groundY(district, pos.current.x, pos.current.z, pos.current.y - eye);
    const targetY = ground + eye;
    pos.current.y += (targetY - pos.current.y) * (1 - Math.exp(-HEIGHT_DAMP * dt));
    if (Math.abs(targetY - pos.current.y) < 0.002) pos.current.y = targetY;

    if (!seated.current && speedRef.current > 0.35) {
      bobT.current += dt * (8.4 + speedRef.current * 0.55);
    } else {
      bobT.current = 0;
    }
    const bob =
      !seated.current && speedRef.current > 0.35
        ? Math.sin(bobT.current) * 0.028 * Math.min(1, speedRef.current / SPEED)
        : 0;
    applyCamera(pos.current.y + bob);

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
      if (district.id === "forum") {
        const ride = liftPrompt(px, pz, ground);
        if (ride) next = { kind: "lift", id: "forum-lift", label: ride };
      }
      if (!next) {
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
      if (p.kind === "lift") {
        requestLift(pos.current.x, pos.current.z, pos.current.y - (seated.current ? SIT_EYE : EYE));
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
  const [help, setHelp] = useState(false);
  const collected = useDinoverse((s) => s.collected);
  const visited = useDinoverse((s) => s.visited);
  const questDone = useDinoverse((s) => s.questDone);
  const { settings } = useQuality();

  const look = useRef<Look>({ dx: 0, dy: 0 });
  const stick = useRef<Stick>({ x: 0, y: 0 });
  const zoom = useRef<Zoom>({ wheel: 0 });
  const keysRef = useRef(new Set<string>());
  const wrapRef = useRef<HTMLDivElement>(null);
  const lineTimer = useRef(0);

  const startExplore = () => {
    setStarted(true);
    window.setTimeout(() => {
      wrapRef.current?.focus();
      requestLock();
    }, 0);
  };

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
    }, 420);
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;

      if (
        MOVE_CODES.has(e.code) ||
        e.code === "KeyE" ||
        e.code === "Enter" ||
        e.code === "Escape" ||
        e.code === "KeyH" ||
        e.code === "Slash" ||
        e.code === "Space"
      ) {
        e.preventDefault();
      }

      if (!started) {
        if (!e.repeat && (e.code === "Enter" || e.code === "Space" || e.code === "KeyE")) startExplore();
        return;
      }

      if (!e.repeat && (e.code === "KeyH" || e.code === "Slash")) {
        setHelp((open) => !open);
        return;
      }

      if (help && e.code === "Escape") {
        setHelp(false);
        return;
      }

      if (dialog) {
        if (!e.repeat && (e.code === "Enter" || e.code === "Escape" || e.code === "Space" || e.code === "KeyE")) {
          setDialog(null);
        }
        return;
      }

      if (e.code === "Escape") {
        if (document.pointerLockElement) document.exitPointerLock();
        return;
      }

      if (!e.repeat && (e.code === "KeyE" || e.code === "Enter" || e.code === "Space")) {
        (window as Window & { __exploreInteract?: () => void }).__exploreInteract?.();
      }

      keysRef.current.add(e.code);
    };
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
  }, [started, dialog, help]);

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

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!started || dialog) return;
      e.preventDefault();
      zoom.current.wheel += Math.sign(e.deltaY) * 3.6;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [started, dialog]);

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
        tabIndex={0}
        aria-label="The Floor explorer. WASD to walk, arrows to look, plus and minus to zoom."
        className="absolute inset-0 overflow-hidden touch-none outline-none"
        onClick={() => {
          if (started && !locked && !dialog) requestLock();
        }}
      >
        <Canvas
          shadows={settings.shadows}
          camera={{ fov: FOV_DEFAULT, position: [0, EYE, 24], near: 0.08, far: settings.far }}
          frameloop="always"
          dpr={settings.dpr}
          performance={{ min: 0.7 }}
          gl={{
            antialias: settings.antialias,
            powerPreference: "high-performance",
            stencil: false,
            alpha: false,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.12,
          }}
        >
          <AdaptiveDpr pixelated={false} />
          <Suspense fallback={null}>
            <DistrictScene district={district} collected={collected} />
          </Suspense>
          <Player
            district={district}
            blocked={!!dialog}
            look={look}
            stick={stick}
            zoom={zoom}
            keysRef={keysRef}
            session={session}
            onHud={onHud}
            onPortal={goPortal}
            onDialog={(title, body, image) => setDialog({ title, body, image })}
          />
        </Canvas>
        <div
          className="pointer-events-none absolute inset-0 bg-bg transition-opacity duration-500"
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
            <div className="pointer-events-auto hidden max-w-[16rem] rounded-lg border border-border bg-bg/80 px-3 py-2 text-xs text-muted sm:block">
              WASD walk · arrows look · +/− zoom · E use · H keys
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
              <span className="ml-1 text-[10px] tracking-wide text-accent-fg/70 uppercase">E</span>
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
              Full keyboard: WASD walk, arrows (or Q) to look, +/− or Page Up/Down to zoom, Shift
              sprint, E / Enter / Space to use, R to reset the view, H for the key list. Mouse look
              still works after you click in.
            </p>
            <Button
              id="enter-3d"
              className="mt-6 w-full"
              onClick={startExplore}
            >
              Enter {world.name}
              <span className="text-[10px] tracking-wide uppercase opacity-70">Enter</span>
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
              <span className="text-[10px] tracking-wide uppercase opacity-70">Enter</span>
            </Button>
          </div>
        </div>
      ) : null}

      {help ? (
        <div className="absolute inset-x-0 bottom-4 z-10 mx-auto w-[min(100%-1.5rem,28rem)] rounded-xl border border-border bg-bg/92 p-4 backdrop-blur-sm">
          <p className="text-xs tracking-wide text-muted uppercase">Keyboard</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <li>WASD — walk</li>
            <li>Arrows / Q — look</li>
            <li>+ / − / PgUp / PgDn — zoom</li>
            <li>Mouse wheel — zoom</li>
            <li>Shift — sprint</li>
            <li>E / Enter / Space — use</li>
            <li>R / Home / 0 — reset view</li>
            <li>Esc — free mouse</li>
          </ul>
          <p className="mt-3 text-xs text-muted">H or Esc closes this list.</p>
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
