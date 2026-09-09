import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import * as THREE from "three";
import type { CharacterId } from "@/lib/characters";
import { CHARACTERS, CHARACTER_BY_ID } from "@/lib/characters";
import {
  COLLECT_LINES,
  CONSTRUCTION_LINE,
  INSPECT_COPY,
  NPC_LINES,
  VISITOR_BUILD,
  VISITOR_COLLECT,
  VISITOR_ENTER,
  inspectSpoken,
  npcSpokenLine,
  WORLD_BY_ID,
  isDistrictOpen,
  type WorldId,
} from "@/lib/worlds";
import { useDinoverse } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import type { FileRouteTypes } from "@/routeTree.gen";
import {
  DISTRICTS_3D,
  collidersFor,
  hitAABB,
  type District3D,
  type ScreenWall,
} from "./districts3d";
import { FloorScene } from "./floor/FloorScene";
import { floorHeightAt, L2_HEIGHT, onStairPath, stairGuideAt } from "./floor/levels";
import { pteraLive, pteraNpcPos } from "./floor/ptera-live";
import { enzoNpcPos } from "./floor/enzo-live";
import { entranceDoorHits } from "./floor/entrance-door";
import { MESHY_EMOTES, meshyLive, requestMeshyEmote } from "./floor/meshy-live";
import { heliLive, nearHeli, resetHeli } from "./floor/heli-live";
import { HELI_PAD } from "./floor/layout";
import { floorInteract, requestFloorLook, requestFloorTalk } from "./floor/floor-interact";
import { clampInCab, getLiftFloorY, inLiftCabin, liftBusy, liftPrompt, requestLift, tickLift } from "./floor/lift";
import { useQuality } from "./quality";
import { ShardOrb } from "./shard-orb";
import { usePhoto } from "./textures";
import { startLobbyBed, stopLobbyBed, isLobbyMuted, setLobbyMuted } from "./floor/lobby-audio";

const LOOK_NDC = new THREE.Vector2(0, 0);
const lookRay = new THREE.Raycaster();
const camRay = new THREE.Raycaster();
const camDir = new THREE.Vector3();
const SHOULDER = 0.46;

function pullChaseCam(scene: THREE.Scene, from: THREE.Vector3, to: THREE.Vector3) {
  camDir.copy(to).sub(from);
  const want = camDir.length();
  if (want < 0.25) return;
  camDir.multiplyScalar(1 / want);
  camRay.set(from, camDir);
  camRay.far = want;
  const hits = camRay.intersectObjects(scene.children, true);
  for (const hit of hits) {
    let node: THREE.Object3D | null = hit.object;
    let skip = false;
    while (node) {
      const data = node.userData as { floorMeshy?: boolean; floorHeli?: boolean };
      if (data.floorMeshy || data.floorHeli) {
        skip = true;
        break;
      }
      node = node.parent;
    }
    if (skip) continue;
    const mesh = hit.object as THREE.Mesh;
    const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as
      | THREE.MeshBasicMaterial
      | undefined;
    if (mat && mat.transparent && (mat.opacity ?? 1) < 0.14) continue;
    if (hit.distance < 0.2) continue;
    to.copy(from).addScaledVector(camDir, Math.max(0.55, hit.distance - 0.3));
    return;
  }
}

function resolveCenteredFloorClick(camera: THREE.Camera, scene: THREE.Scene) {
  lookRay.setFromCamera(LOOK_NDC, camera);
  lookRay.far = 28;
  const hits = lookRay.intersectObjects(scene.children, true);
  for (const hit of hits) {
    let node: THREE.Object3D | null = hit.object;
    while (node) {
      const data = node.userData as {
        floorTalk?: string;
        floorLook?: string;
        floorPtera?: boolean;
        floorMeshy?: boolean;
        floorHeli?: boolean;
      };
      if (data.floorHeli && hit.distance < 18) {
        heliLive.absorbClick = true;
        if (!heliLive.boarded) heliLive.boardRequest = true;
        return;
      }
      if (data.floorPtera && hit.distance < 28) {
        pteraLive.approach = true;
        floorInteract.absorbClick = true;
        return;
      }
      if (data.floorMeshy && hit.distance < 12) {
        meshyLive.absorbClick = true;
        meshyLive.openEmotes = true;
        requestMeshyEmote("Big_Wave_Hello");
        return;
      }
      if (typeof data.floorTalk === "string" && hit.distance < 7.5) {
        requestFloorTalk(data.floorTalk);
        return;
      }
      if (typeof data.floorLook === "string" && hit.distance < 5.8) {
        requestFloorLook(data.floorLook);
        return;
      }
      node = node.parent;
    }
  }
}

function groundY(district: District3D, x: number, z: number, prevY = 0) {
  if (district.id !== "forum") return 0;
  if (inLiftCabin(x, z)) return getLiftFloorY();
  return floorHeightAt(x, z, prevY);
}

function isTouchFloor() {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;
  const narrow = window.matchMedia("(max-width: 639px)").matches;
  // Phones and small windows always get sticks — even if a mouse is also attached.
  if (narrow) return true;
  // Windows precision trackpads report maxTouchPoints > 0 — that is not a tablet.
  if (fine && !coarse) return false;
  return coarse;
}

function FloorStick({
  label,
  onChange,
}: {
  label: string;
  onChange: (x: number, y: number) => void;
}) {
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const apply = (el: HTMLDivElement, clientX: number, clientY: number) => {
    const rect = el.getBoundingClientRect();
    let x = (clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    let y = (clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    if (len < 0.16) {
      x = 0;
      y = 0;
    }
    setKnob({ x, y });
    onChange(x, y);
  };

  const reset = () => {
    setKnob({ x: 0, y: 0 });
    onChange(0, 0);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-[10px] font-medium tracking-[0.16em] text-white/80 uppercase">{label}</p>
      <div
        className="relative size-[7.25rem] touch-none rounded-full border-2 border-white/40 bg-black/65 shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:size-[6.75rem]"
        onPointerDown={(e: PointerEvent<HTMLDivElement>) => {
          e.stopPropagation();
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          apply(e.currentTarget, e.clientX, e.clientY);
        }}
        onPointerMove={(e: PointerEvent<HTMLDivElement>) => {
          if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
          apply(e.currentTarget, e.clientX, e.clientY);
        }}
        onPointerUp={reset}
        onPointerCancel={reset}
      >
        <div
          className="pointer-events-none absolute inset-[18%] rounded-full border border-white/10"
        />
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 size-11 rounded-full border border-gold/50 bg-gold/85"
          style={{ transform: `translate(calc(-50% + ${knob.x * 28}px), calc(-50% + ${knob.y * 28}px))` }}
        />
      </div>
    </div>
  );
}

type Prompt =
  | { kind: "npc" | "inspect" | "portal" | "sit" | "stand" | "lift" | "stair" | "heli"; id: string; label: string }
  | null;

type StairGuide = { progress: number; title: string; hint: string } | null;

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
      setPose?: (x: number, z: number, yaw?: number, level?: "auto" | "ground" | "l2") => void;
      boardHeli?: () => void;
      getHeli?: () => { boarded: boolean; x: number; y: number; z: number; yaw: number };
    };
  }
}

const EYE = 1.65;
const SIT_EYE = 1.18;
const RADIUS = 0.38;
const SPEED = 9.4;
const SPRINT_MUL = 1.48;
const ACCEL = 42;
const DECEL = 28;
const LOOK_SENS = 0.00205;
const LOOK_STICK = 2.05;
const KEY_LOOK = 2.05;
const HEIGHT_DAMP = 28;
const CAM_FOLLOW = 18;
const _camWant = new THREE.Vector3();
const _camAim = new THREE.Vector3();
const REST_PITCH = -0.06;
const CHASE_BACK = 3.85;
const CHASE_MIN = 1.55;
const CHASE_MAX = 9.2;
const CHASE_LOOK = 1.22;
const CHASE_HELI = 11.2;
const FLY_SPEED = 28;
const FLY_CLIMB = 14;
const FLY_ACCEL = 14;
const FLY_MAX_Y = 44;
const FLY_BOUNDS = { minX: -72, maxX: 72, minZ: -72, maxZ: 72 };
const PITCH_TP_MIN = -1.12;
const PITCH_TP_MAX = 0.48;
const PITCH_FP_MIN = -1.15;
const PITCH_FP_MAX = 1.15;
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

function shortestYaw(from: number, to: number) {
  let d = to - from;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return from + d;
}

function clampPitch(value: number, thirdPerson: boolean) {
  return THREE.MathUtils.clamp(
    value,
    thirdPerson ? PITCH_TP_MIN : PITCH_FP_MIN,
    thirdPerson ? PITCH_TP_MAX : PITCH_FP_MAX,
  );
}

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
        <FloorScene collected={collected} preview={preview} />
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
  lookStick,
  zoom,
  keysRef,
  session,
  onHud,
  onStairGuide,
  onPortal,
  onDialog,
}: {
  district: District3D;
  blocked: boolean;
  look: React.MutableRefObject<Look>;
  stick: React.MutableRefObject<Stick>;
  lookStick: React.MutableRefObject<Stick>;
  zoom: React.MutableRefObject<Zoom>;
  keysRef: React.MutableRefObject<Set<string>>;
  session: number;
  onHud: (line: string, prompt: Prompt) => void;
  onStairGuide: (guide: StairGuide) => void;
  onPortal: (to: WorldId) => void;
  onDialog: (title: string, body: string, image?: string, href?: string, hrefLabel?: string) => void;
}) {
  const { camera, scene } = useThree();
  const pos = useRef(new THREE.Vector3(district.spawn.x, EYE, district.spawn.z));
  const yaw = useRef(district.spawn.yaw);
  const bodyYaw = useRef(district.spawn.yaw);
  const pitch = useRef(REST_PITCH);
  const chaseDist = useRef(CHASE_BACK);
  const wasThird = useRef(meshyLive.thirdPerson);
  const speedRef = useRef(0);
  const tickRef = useRef(0);
  const blockedRef = useRef(blocked);
  blockedRef.current = blocked;
  const colliders = useMemo(() => collidersFor(district), [district]);
  const characterId = useDinoverse((s) => s.characterId);
  const walkAsSelf = useDinoverse((s) => s.walkAsSelf);
  const collectShard = useDinoverse((s) => s.collectShard);
  const collected = useDinoverse((s) => s.collected);
  const visitWorld = useDinoverse((s) => s.visitWorld);
  const completeQuest = useDinoverse((s) => s.completeQuest);
  const collectedRef = useRef(collected);
  collectedRef.current = collected;
  const promptRef = useRef<Prompt>(null);
  const hudKey = useRef("");
  const stairKey = useRef("");
  const interact = useRef<() => void>(() => {});
  const seated = useRef<{ x: number; z: number; yaw: number } | null>(null);
  const vel = useRef(new THREE.Vector2(0, 0));
  const heliVy = useRef(0);
  const bobT = useRef(0);
  const lookGrace = useRef(0);
  const fov = useRef(FOV_DEFAULT);
  const fovTarget = useRef(FOV_DEFAULT);
  const camPos = useRef(new THREE.Vector3());
  const camAim = useRef(new THREE.Vector3());
  const camReady = useRef(false);

  useEffect(() => {
    pos.current.set(district.spawn.x, groundY(district, district.spawn.x, district.spawn.z) + EYE, district.spawn.z);
    yaw.current = district.spawn.yaw;
    bodyYaw.current = district.spawn.yaw;
    pitch.current = REST_PITCH;
    chaseDist.current = CHASE_BACK;
    vel.current.set(0, 0);
    heliVy.current = 0;
    bobT.current = 0;
    fov.current = FOV_DEFAULT;
    fovTarget.current = FOV_DEFAULT;
    seated.current = null;
    lookGrace.current = 2;
    camReady.current = false;
    resetHeli();
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
      setPose: (x, z, nextYaw, level = "auto") => {
        const hint =
          level === "l2" ? L2_HEIGHT : level === "ground" ? 0 : pos.current.y > 3.2 ? L2_HEIGHT : 0;
        const foot = groundY(district, x, z, hint);
        pos.current.set(x, foot + EYE, z);
        if (typeof nextYaw === "number") yaw.current = nextYaw;
        seated.current = null;
        if (heliLive.boarded) {
          heliLive.boarded = false;
          heliLive.flying = false;
          heliLive.climbStick = 0;
        }
      },
      boardHeli: () => {
        heliLive.x = HELI_PAD.x;
        heliLive.y = HELI_PAD.y;
        heliLive.z = HELI_PAD.z;
        heliLive.yaw = yaw.current;
        pos.current.set(HELI_PAD.x - 2.1, HELI_PAD.y + EYE, HELI_PAD.z);
        seated.current = null;
        heliLive.boardRequest = true;
      },
      getHeli: () => ({
        boarded: heliLive.boarded,
        x: +heliLive.x.toFixed(2),
        y: +heliLive.y.toFixed(2),
        z: +heliLive.z.toFixed(2),
        yaw: +heliLive.yaw.toFixed(2),
      }),
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
      let aimX = pos.current.x;
      let aimY = y;
      let aimZ = pos.current.z;
      let useLookAt = false;

      if (heliLive.boarded) {
        aimX = heliLive.x;
        aimY = heliLive.y + 1.35;
        aimZ = heliLive.z;
        if (meshyLive.thirdPerson) {
          const dist = THREE.MathUtils.clamp(chaseDist.current, 6.5, 22);
          const cp = Math.cos(pitch.current);
          const sp = Math.sin(pitch.current);
          _camWant.set(
            heliLive.x + Math.sin(yaw.current) * dist * cp,
            aimY - sp * dist,
            heliLive.z + Math.cos(yaw.current) * dist * cp,
          );
          if (_camWant.y < heliLive.y + 0.55) _camWant.y = heliLive.y + 0.55;
          _camWant.x += Math.cos(yaw.current) * SHOULDER;
          _camWant.z += -Math.sin(yaw.current) * SHOULDER;
          useLookAt = true;
        } else {
          const noseX = -Math.sin(yaw.current);
          const noseZ = -Math.cos(yaw.current);
          _camWant.set(heliLive.x + noseX * 0.45, heliLive.y + 1.28, heliLive.z + noseZ * 0.45);
        }
      } else if (meshyLive.thirdPerson && !seated.current) {
        const feetY = y - EYE;
        aimY = feetY + CHASE_LOOK;
        const dist = chaseDist.current;
        const cp = Math.cos(pitch.current);
        const sp = Math.sin(pitch.current);
        _camWant.set(
          pos.current.x + Math.sin(yaw.current) * dist * cp,
          aimY - sp * dist,
          pos.current.z + Math.cos(yaw.current) * dist * cp,
        );
        if (_camWant.y < feetY + 0.22) _camWant.y = feetY + 0.22;
        _camWant.x += Math.cos(yaw.current) * SHOULDER;
        _camWant.z += -Math.sin(yaw.current) * SHOULDER;
        useLookAt = true;
      } else {
        _camWant.set(pos.current.x, y, pos.current.z);
      }

      _camAim.set(aimX, aimY, aimZ);
      if (useLookAt) pullChaseCam(scene, _camAim, _camWant);
      const follow = useLookAt ? CAM_FOLLOW : CAM_FOLLOW * 1.55;
      const k = 1 - Math.exp(-follow * dt);
      if (!camReady.current) {
        camPos.current.copy(_camWant);
        camAim.current.copy(_camAim);
        camReady.current = true;
      } else {
        camPos.current.lerp(_camWant, k);
        camAim.current.lerp(_camAim, k);
      }
      camera.position.copy(camPos.current);
      if (useLookAt) {
        camera.up.set(0, 1, 0);
        camera.lookAt(camAim.current);
      } else {
        camera.rotation.x = -pitch.current;
        camera.rotation.y = yaw.current;
        camera.rotation.z = 0;
      }
      if ("fov" in camera) {
        const persp = camera as THREE.PerspectiveCamera;
        if (Math.abs(persp.fov - fov.current) > 0.02) {
          persp.fov = fov.current;
          persp.updateProjectionMatrix();
        }
      }
    };

    if (district.id === "forum") {
      if (floorInteract.lookClick) {
        floorInteract.lookClick = false;
        if (!blockedRef.current) resolveCenteredFloorClick(camera, scene);
      }
      if (floorInteract.talkId && !blockedRef.current) {
        const spoken = npcSpokenLine(floorInteract.talkId, characterId, walkAsSelf);
        floorInteract.talkId = null;
        if (spoken) onDialog(spoken.name, spoken.body);
      } else if (floorInteract.talkId && blockedRef.current) {
        floorInteract.talkId = null;
      }
      if (floorInteract.inspectId && !blockedRef.current) {
        const seen = inspectSpoken(floorInteract.inspectId, characterId, walkAsSelf);
        floorInteract.inspectId = null;
        if (seen) onDialog(seen.title, seen.body, seen.image, seen.href, seen.hrefLabel);
      } else if (floorInteract.inspectId && blockedRef.current) {
        floorInteract.inspectId = null;
      }
    }

    if (pteraLive.pendingTalk) {
      pteraLive.pendingTalk = false;
    }

    const keys = keysRef.current;
    const flying = heliLive.boarded;
    const orbit = (meshyLive.thirdPerson && !seated.current) || flying;
    if (orbit && !wasThird.current) bodyYaw.current = yaw.current;
    wasThird.current = meshyLive.thirdPerson;

    if (blockedRef.current) {
      vel.current.set(0, 0);
      applyCamera(pos.current.y);
      const eyeBlocked = seated.current ? SIT_EYE : EYE;
      meshyLive.x = pos.current.x;
      meshyLive.z = pos.current.z;
      meshyLive.y = pos.current.y - eyeBlocked;
      meshyLive.yaw = orbit ? bodyYaw.current : yaw.current;
      meshyLive.speed = 0;
      meshyLive.drive = 0;
      meshyLive.seated = !!seated.current;
      meshyLive.visible = meshyLive.thirdPerson && !flying && !walkAsSelf;
      return;
    }

    const lookDx = THREE.MathUtils.clamp(look.current.dx, -96, 96);
    const lookDy = THREE.MathUtils.clamp(look.current.dy, -96, 96);
    look.current.dx = 0;
    look.current.dy = 0;
    yaw.current -= lookDx * LOOK_SENS;
    pitch.current = clampPitch(pitch.current - lookDy * LOOK_SENS, orbit);
    yaw.current -= lookStick.current.x * LOOK_STICK * dt;
    pitch.current = clampPitch(pitch.current - lookStick.current.y * LOOK_STICK * dt, orbit);

    let keyYaw = 0;
    let keyPitch = 0;
    if (keyHeld(keys, LOOK_LEFT)) keyYaw += 1;
    if (keyHeld(keys, LOOK_RIGHT)) keyYaw -= 1;
    if (keyHeld(keys, LOOK_UP)) keyPitch += 1;
    if (keyHeld(keys, LOOK_DOWN)) keyPitch -= 1;
    yaw.current += keyYaw * KEY_LOOK * dt;
    pitch.current = clampPitch(pitch.current + keyPitch * KEY_LOOK * 0.82 * dt, orbit);

    if (orbit) {
      let zoomDelta = zoom.current.wheel * 0.11;
      if (keyHeld(keys, ZOOM_IN)) zoomDelta -= ZOOM_RATE * 0.045 * dt;
      if (keyHeld(keys, ZOOM_OUT)) zoomDelta += ZOOM_RATE * 0.045 * dt;
      const zMin = flying ? 6.5 : CHASE_MIN;
      const zMax = flying ? 22 : CHASE_MAX;
      chaseDist.current = THREE.MathUtils.clamp(chaseDist.current + zoomDelta, zMin, zMax);
    } else {
      if (keyHeld(keys, ZOOM_IN)) fovTarget.current -= ZOOM_RATE * dt;
      if (keyHeld(keys, ZOOM_OUT)) fovTarget.current += ZOOM_RATE * dt;
      fovTarget.current += zoom.current.wheel;
    }
    zoom.current.wheel = 0;
    if (keyHeld(keys, VIEW_RESET)) {
      fovTarget.current = FOV_DEFAULT;
      const restDist = flying ? CHASE_HELI : CHASE_BACK;
      chaseDist.current += (restDist - chaseDist.current) * (1 - Math.exp(-10 * dt));
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
    const sprint = !flying && (keys.has("ShiftLeft") || keys.has("ShiftRight")) ? SPRINT_MUL : 1;
    if (seated.current && analog > 0.08) seated.current = null;

    const leaveHeli = () => {
      if (!heliLive.boarded) return;
      heliLive.boarded = false;
      heliLive.flying = false;
      heliLive.roll = 0;
      heliLive.pitch = 0;
      heliLive.climbStick = 0;
      const inside =
        heliLive.x > district.bounds.minX + RADIUS &&
        heliLive.x < district.bounds.maxX - RADIUS &&
        heliLive.z > district.bounds.minZ + RADIUS &&
        heliLive.z < district.bounds.maxZ - RADIUS;
      if (!inside) {
        heliLive.x = HELI_PAD.x;
        heliLive.y = HELI_PAD.y;
        heliLive.z = HELI_PAD.z;
      } else {
        heliLive.y = groundY(district, heliLive.x, heliLive.z, heliLive.y) + 0.12;
      }
      const sideX = THREE.MathUtils.clamp(
        heliLive.x + Math.cos(heliLive.yaw) * 2.85,
        district.bounds.minX + RADIUS,
        district.bounds.maxX - RADIUS,
      );
      const sideZ = THREE.MathUtils.clamp(
        heliLive.z - Math.sin(heliLive.yaw) * 2.85,
        district.bounds.minZ + RADIUS,
        district.bounds.maxZ - RADIUS,
      );
      const foot = groundY(district, sideX, sideZ, heliLive.y);
      pos.current.set(sideX, foot + EYE, sideZ);
      chaseDist.current = CHASE_BACK;
      heliVy.current = 0;
      vel.current.set(0, 0);
    };

    if (heliLive.boardRequest) {
      heliLive.boardRequest = false;
      const foot = pos.current.y - (seated.current ? SIT_EYE : EYE);
      const dx = pos.current.x - heliLive.x;
      const dz = pos.current.z - heliLive.z;
      const close =
        district.id === "forum" &&
        !heliLive.boarded &&
        (nearHeli(pos.current.x, pos.current.z, foot) || (dx * dx + dz * dz < 10 * 10 && Math.abs(foot - heliLive.y) < 3.4));
      if (close) {
        seated.current = null;
        heliLive.boarded = true;
        heliLive.flying = true;
        heliLive.yaw = yaw.current;
        heliVy.current = 0;
        vel.current.set(0, 0);
        chaseDist.current = CHASE_HELI;
        pos.current.set(heliLive.x, heliLive.y + EYE, heliLive.z);
        onHud("You're flying. Space climbs, Shift drops, E hops out.", {
          kind: "heli",
          id: "exit",
          label: "Exit helicopter",
        });
      }
    }

    if (heliLive.boarded) {
      const targetVx = mx * FLY_SPEED;
      const targetVz = mz * FLY_SPEED;
      const k = 1 - Math.exp(-FLY_ACCEL * dt);
      vel.current.x += (targetVx - vel.current.x) * k;
      vel.current.y += (targetVz - vel.current.y) * k;
      if (analog < 0.001 && vel.current.length() < 0.08) vel.current.set(0, 0);

      let climb = heliLive.climbStick;
      if (keys.has("Space")) climb += 1;
      if (keys.has("ShiftLeft") || keys.has("ShiftRight") || keys.has("ControlLeft") || keys.has("ControlRight")) {
        climb -= 1;
      }
      climb = THREE.MathUtils.clamp(climb, -1, 1);
      const targetVy = climb * FLY_CLIMB;
      heliVy.current += (targetVy - heliVy.current) * k;
      if (Math.abs(climb) < 0.02 && Math.abs(heliVy.current) < 0.06) heliVy.current = 0;

      let nx = THREE.MathUtils.clamp(heliLive.x + vel.current.x * dt, FLY_BOUNDS.minX, FLY_BOUNDS.maxX);
      let nz = THREE.MathUtils.clamp(heliLive.z + vel.current.y * dt, FLY_BOUNDS.minZ, FLY_BOUNDS.maxZ);
      let ny = heliLive.y + heliVy.current * dt;
      const floor = groundY(district, nx, nz, heliLive.y) + 0.12;
      if (ny < floor) {
        ny = floor;
        heliVy.current = Math.max(0, heliVy.current);
      }
      if (ny > FLY_MAX_Y) {
        ny = FLY_MAX_Y;
        heliVy.current = Math.min(0, heliVy.current);
      }

      heliLive.x = nx;
      heliLive.y = ny;
      heliLive.z = nz;
      heliLive.yaw = yaw.current;
      heliLive.flying = ny > floor + 0.28;

      const fwd = mx * fx + mz * fz;
      const str = mx * rx + mz * rz;
      const tiltK = 1 - Math.exp(-7 * dt);
      heliLive.pitch += (-fwd * 0.18 - heliLive.pitch) * tiltK;
      heliLive.roll += (-str * 0.24 - heliLive.roll) * tiltK;

      pos.current.set(nx, ny + EYE, nz);
      speedRef.current = Math.hypot(vel.current.x, vel.current.y, heliVy.current);
      bobT.current = 0;
    } else if (seated.current) {
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
        const onStairs =
          district.id === "forum" && (onStairPath(pos.current.x, pos.current.z) || onStairPath(nx, nz));
        // Stairs need a looser step-up so a wide spiral stays walkable.
        if (newH - oldH > (onStairs ? 1.25 : 0.55)) return false;
        if (oldH - newH > (onStairs ? 1.35 : 0.7)) return false;
        for (const c of colliders) {
          if (hitAABB(nx, nz, RADIUS, c, newH)) return false;
        }
        if (district.id === "forum") {
          for (const c of entranceDoorHits()) {
            if (hitAABB(nx, nz, RADIUS, c, newH)) return false;
          }
        }
        return true;
      };

      const travel = Math.hypot(vel.current.x, vel.current.y) * dt;
      const steps = travel > 0.22 ? 3 : travel > 0.1 ? 2 : 1;
      const sdt = dt / steps;
      for (let i = 0; i < steps; i += 1) {
        const nx = pos.current.x + vel.current.x * sdt;
        const nz = pos.current.z + vel.current.y * sdt;
        if (tryMove(nx, pos.current.z)) pos.current.x = nx;
        else vel.current.x = 0;
        if (tryMove(pos.current.x, nz)) pos.current.z = nz;
        else vel.current.y = 0;
      }
      if (speedRef.current > 0.45) {
        const target = Math.atan2(-vel.current.x, -vel.current.y);
        const turned = shortestYaw(bodyYaw.current, target);
        bodyYaw.current += (turned - bodyYaw.current) * Math.min(1, dt * 20);
      }
      if (district.id === "forum" && liftBusy() && inLiftCabin(pos.current.x, pos.current.z)) {
        const kept = clampInCab(pos.current.x, pos.current.z);
        pos.current.x = kept.x;
        pos.current.z = kept.z;
      }
    }

    const eye = seated.current ? SIT_EYE : EYE;
    const ground = groundY(district, pos.current.x, pos.current.z, pos.current.y - eye);
    if (!heliLive.boarded) {
      const targetY = ground + eye;
      pos.current.y += (targetY - pos.current.y) * (1 - Math.exp(-HEIGHT_DAMP * dt));
      if (Math.abs(targetY - pos.current.y) < 0.002) pos.current.y = targetY;
    }

    if (!heliLive.boarded && !seated.current && speedRef.current > 0.35) {
      bobT.current += dt * (8.4 + speedRef.current * 0.55);
    } else if (!heliLive.boarded) {
      bobT.current = 0;
    }
    const bob =
      !heliLive.boarded && !seated.current && speedRef.current > 0.35 && !meshyLive.thirdPerson
        ? Math.sin(bobT.current) * 0.028 * Math.min(1, speedRef.current / SPEED)
        : 0;
    applyCamera(pos.current.y + bob);

    const eyeNow = seated.current ? SIT_EYE : EYE;
    meshyLive.x = pos.current.x;
    meshyLive.z = pos.current.z;
    meshyLive.y = pos.current.y - eyeNow;
    meshyLive.yaw = orbit ? bodyYaw.current : yaw.current;
    meshyLive.speed = heliLive.boarded ? 0 : speedRef.current;
    meshyLive.drive = heliLive.boarded ? 0 : analog;
    meshyLive.sprint = !heliLive.boarded && (keys.has("ShiftLeft") || keys.has("ShiftRight"));
    meshyLive.seated = !!seated.current;
    meshyLive.visible = meshyLive.thirdPerson && !heliLive.boarded && !walkAsSelf;

    const px = pos.current.x;
    const pz = pos.current.z;

    for (const s of heliLive.boarded ? [] : district.shards) {
      if (collectedRef.current.includes(s.id)) continue;
      if (Math.hypot(px - s.position[0], pz - s.position[2]) < 1.1) {
        collectShard(s.id);
        const lines = walkAsSelf ? VISITOR_COLLECT : COLLECT_LINES[characterId];
        onHud(lines[Math.floor(Math.random() * lines.length)] ?? lines[0], promptRef.current);
      }
    }

    let next: Prompt = null;
    let stairGuide: StairGuide = null;
    let stairPrompt: Prompt = null;
    if (heliLive.boarded) {
      next = { kind: "heli", id: "exit", label: "Exit helicopter" };
    } else if (seated.current) {
      next = { kind: "stand", id: "stand", label: "Stand" };
    } else {
      if (district.id === "forum" && nearHeli(px, pz, ground)) {
        next = { kind: "heli", id: "board", label: "Board helicopter" };
      }
      if (district.id === "forum") {
        const guide = stairGuideAt(px, pz, ground);
        if (guide) {
          stairGuide = { progress: guide.progress, title: guide.title, hint: guide.hint };
          stairPrompt = { kind: "stair", id: "forum-stairs", label: guide.prompt };
        }
        const ride = liftPrompt(px, pz, ground);
        if (ride && !next) next = { kind: "lift", id: "forum-lift", label: ride };
      }
      if (!next) {
        for (const seat of district.seats) {
          if (ground > 2.8) break;
          if (hitAABB(px, pz, 0.45, seat)) {
            next = { kind: "sit", id: seat.id, label: seat.label };
            break;
          }
        }
      }
      if (!next) {
        for (const n of district.npcs) {
          if (n.id === "ptera" && ground < 4) continue;
          const at =
            n.id === "ptera"
              ? pteraNpcPos(n.position)
              : n.id === "enzo"
                ? enzoNpcPos(n.position)
                : { x: n.position[0], z: n.position[2] };
          if (Math.hypot(px - at.x, pz - at.z) < (n.id === "enzo" ? 2.6 : 1.7)) {
            next = { kind: "npc", id: n.id, label: `Talk to ${NPC_LINES[n.id]?.name ?? "local"}` };
          }
        }
      }
      if (!next) {
        for (const p of district.portals) {
          if (district.id === "forum" && ground > 3.5) continue;
          if (hitAABB(px, pz, 0.55, { x: p.x, z: p.z, w: p.w + 0.6, d: p.d + 0.6 })) {
            next = {
              kind: "portal",
              id: p.to,
              label: isDistrictOpen(p.to) ? `Enter ${p.label}` : `${p.label} · under construction`,
            };
          }
        }
      }
      if (!next && stairPrompt) next = stairPrompt;
      if (!next) {
        for (const i of district.inspect) {
          if (i.id === "forum-stairs" && (stairGuide || onStairPath(px, pz))) continue;
          const roofPad = i.id === "forum-heli" || i.id === "forum-pad" || i.id === "forum-hintze";
          if (roofPad && ground < 4) continue;
          if (
            ground > 3.5 &&
            i.id !== "forum-window" &&
            i.id !== "forum-ticker" &&
            i.id !== "forum-mezz" &&
            !roofPad
          ) {
            continue;
          }
          if (ground < 4 && i.id === "forum-mezz") continue;
          if (hitAABB(px, pz, 0.5, i)) {
            const copy = INSPECT_COPY[i.id];
            next = { kind: "inspect", id: i.id, label: copy?.action ?? `Look · ${copy?.title ?? "look"}` };
          }
        }
      }
    }
    promptRef.current = next;
    const key = next ? `${next.kind}:${next.id}:${next.label}` : "";
    if (hudKey.current !== key) {
      hudKey.current = key;
      onHud("", next);
    }
    const sKey = stairGuide
      ? `${stairGuide.title}:${Math.round(stairGuide.progress * 8)}:${stairGuide.hint}`
      : "";
    if (stairKey.current !== sKey) {
      stairKey.current = sKey;
      onStairGuide(stairGuide);
    }

    const bag = useDinoverse.getState();
    if (bag.collected.length >= 8 && bag.visited.length >= 4 && !bag.questDone) {
      completeQuest();
    }

    interact.current = () => {
      const p = promptRef.current;
      if (!p) return;
      if (p.kind === "heli") {
        if (heliLive.boarded) leaveHeli();
        else heliLive.boardRequest = true;
        return;
      }
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
      if (p.kind === "stair") {
        // Walk-only guidance — E just confirms the tip.
        onHud(
          p.label.includes("Descend")
            ? "Follow the gold arrows down to the lobby."
            : "Follow the gold arrows up — mezzanine at the top.",
          p,
        );
        return;
      }
      if (p.kind === "lift") {
        requestLift(pos.current.x, pos.current.z, pos.current.y - (seated.current ? SIT_EYE : EYE));
        return;
      }
      if (p.kind === "portal" && (p.id === "mart" || p.id === "canopy" || p.id === "crater" || p.id === "forum")) {
        if (!isDistrictOpen(p.id)) {
          const world = WORLD_BY_ID[p.id];
          const line = walkAsSelf ? VISITOR_BUILD[p.id] : CONSTRUCTION_LINE[p.id][characterId];
          visitWorld(p.id);
          onDialog(`${world.name} · under construction`, line, world.cinematic);
          return;
        }
        onPortal(p.id);
        return;
      }
      if (p.kind === "npc") {
        const spoken = npcSpokenLine(p.id, characterId, walkAsSelf);
        if (spoken) onDialog(spoken.name, spoken.body);
        return;
      }
      if (p.kind === "inspect") {
        const seen = inspectSpoken(p.id, characterId, walkAsSelf);
        if (seen) onDialog(seen.title, seen.body, seen.image, seen.href, seen.hrefLabel);
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
  const walkAsSelf = useDinoverse((s) => s.walkAsSelf);
  const setWalkAsSelf = useDinoverse((s) => s.setWalkAsSelf);
  const setCharacter = useDinoverse((s) => s.setCharacter);
  const [districtId, setDistrictId] = useState<WorldId>(startDistrict);
  const district = DISTRICTS_3D[districtId];
  const world = WORLD_BY_ID[districtId];
  const [started, setStarted] = useState(false);
  const [session, setSession] = useState(0);
  const [locked, setLocked] = useState(false);
  const [dialog, setDialog] = useState<{
    title: string;
    body: string;
    image?: string;
    href?: string;
    hrefLabel?: string;
  } | null>(null);
  const [prompt, setPrompt] = useState<Prompt>(null);
  const [stairGuide, setStairGuide] = useState<StairGuide>(null);
  const [line, setLine] = useState(walkAsSelf ? VISITOR_ENTER[world.id] : world.enterLine[characterId]);
  const [fade, setFade] = useState(0);
  const [help, setHelp] = useState(false);
  const [thirdPerson, setThirdPerson] = useState(!walkAsSelf && meshyLive.thirdPerson);
  const [emoteOpen, setEmoteOpen] = useState(false);
  const [touchUi, setTouchUi] = useState(false);
  const collected = useDinoverse((s) => s.collected);
  const visited = useDinoverse((s) => s.visited);
  const questDone = useDinoverse((s) => s.questDone);
  const { settings, level, setLevel } = useQuality();
  const [lobbyQuiet, setLobbyQuiet] = useState(() => (typeof window === "undefined" ? false : isLobbyMuted()));

  const look = useRef<Look>({ dx: 0, dy: 0 });
  const stick = useRef<Stick>({ x: 0, y: 0 });
  const lookStick = useRef<Stick>({ x: 0, y: 0 });
  const zoom = useRef<Zoom>({ wheel: 0 });
  const keysRef = useRef(new Set<string>());
  const wrapRef = useRef<HTMLDivElement>(null);
  const lookDrag = useRef({ on: false, x: 0, y: 0, moved: 0 });
  const lineTimer = useRef(0);

  const applyWalkMode = (asSelf: boolean) => {
    setWalkAsSelf(asSelf);
    meshyLive.thirdPerson = !asSelf;
    setThirdPerson(!asSelf);
    setEmoteOpen(false);
    setLine(asSelf ? VISITOR_ENTER[world.id] : world.enterLine[characterId]);
  };

  const pickCharacter = (id: CharacterId) => {
    setCharacter(id);
    meshyLive.thirdPerson = true;
    setThirdPerson(true);
    setEmoteOpen(false);
    setLine(world.enterLine[id]);
  };

  const startExplore = () => {
    meshyLive.thirdPerson = !walkAsSelf;
    setThirdPerson(!walkAsSelf);
    setLine(walkAsSelf ? VISITOR_ENTER[world.id] : world.enterLine[characterId]);
    setStarted(true);
    void startLobbyBed();
    window.setTimeout(() => {
      wrapRef.current?.focus();
      if (!isTouchFloor()) requestLock();
    }, 0);
  };

  useEffect(() => {
    document.documentElement.classList.add("floor-lock");
    return () => {
      document.documentElement.classList.remove("floor-lock");
      stopLobbyBed();
    };
  }, []);

  useEffect(() => {
    const sync = () => setTouchUi(isTouchFloor());
    sync();
    const coarse = window.matchMedia("(pointer: coarse)");
    const narrow = window.matchMedia("(max-width: 639px)");
    coarse.addEventListener("change", sync);
    narrow.addEventListener("change", sync);
    return () => {
      coarse.removeEventListener("change", sync);
      narrow.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (meshyLive.openEmotes) {
        meshyLive.openEmotes = false;
        setEmoteOpen(true);
      }
    }, 80);
    return () => window.clearInterval(id);
  }, []);

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
      setLine(walkAsSelf ? VISITOR_ENTER[to] : WORLD_BY_ID[to].enterLine[characterId]);
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
        e.code === "KeyV" ||
        e.code === "KeyC" ||
        e.code === "Slash" ||
        e.code === "Space" ||
        e.code === "Digit1" ||
        e.code === "Digit2" ||
        e.code === "Digit3" ||
        e.code === "Digit4"
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
        if (emoteOpen) {
          setEmoteOpen(false);
          return;
        }
        if (document.pointerLockElement) document.exitPointerLock();
        return;
      }

      if (!e.repeat && e.code === "KeyV") {
        if (walkAsSelf) {
          applyWalkMode(false);
          return;
        }
        meshyLive.thirdPerson = !meshyLive.thirdPerson;
        setThirdPerson(meshyLive.thirdPerson);
        return;
      }

      if (!e.repeat && e.code === "KeyC") {
        if (walkAsSelf) return;
        setEmoteOpen((open) => !open);
        return;
      }

      if (!e.repeat) {
        const emoteHot: Record<string, (typeof MESHY_EMOTES)[number]["id"]> = {
          Digit1: "Big_Wave_Hello",
          Digit2: "Listening_Gesture",
          Digit3: "Alert",
          Digit4: "Walk_Slowly_and_Look_Around",
        };
        const emoteId = emoteHot[e.code];
        if (emoteId && !walkAsSelf) {
          requestMeshyEmote(emoteId);
          setEmoteOpen(true);
          return;
        }
      }

      if (!e.repeat && (e.code === "KeyE" || e.code === "Enter" || (e.code === "Space" && !heliLive.boarded))) {
        (window as Window & { __exploreInteract?: () => void }).__exploreInteract?.();
      }

      keysRef.current.add(e.code);
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.code);
    const hide = () => {
      if (document.hidden) keysRef.current.clear();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    document.addEventListener("visibilitychange", hide);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [started, dialog, help, emoteOpen, walkAsSelf, characterId, world.id]);

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
    if (isTouchFloor()) return;
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

  return (
    <div className="relative isolate h-full w-full min-h-0 bg-bg">
      <div
        ref={wrapRef}
        tabIndex={0}
        aria-label="The Floor. Walk with WASD or the left stick. Drag to look. E or Use to talk."
        className="absolute inset-0 h-full w-full overflow-hidden touch-none outline-none"
        onPointerDown={(e) => {
          if (e.button !== 0 || !started || dialog) return;
          lookDrag.current = { on: true, x: e.clientX, y: e.clientY, moved: 0 };
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            /* older browsers */
          }
        }}
        onPointerMove={(e) => {
          if (!lookDrag.current.on) return;
          const dx = e.clientX - lookDrag.current.x;
          const dy = e.clientY - lookDrag.current.y;
          lookDrag.current.x = e.clientX;
          lookDrag.current.y = e.clientY;
          lookDrag.current.moved += Math.abs(dx) + Math.abs(dy);
          if (document.pointerLockElement === wrapRef.current) return;
          look.current.dx += dx;
          look.current.dy += dy;
        }}
        onPointerUp={() => {
          if (!lookDrag.current.on) return;
          const moved = lookDrag.current.moved;
          lookDrag.current.on = false;
          if (
            floorInteract.absorbClick ||
            pteraLive.absorbClick ||
            meshyLive.absorbClick ||
            heliLive.absorbClick
          ) {
            floorInteract.absorbClick = false;
            pteraLive.absorbClick = false;
            meshyLive.absorbClick = false;
            heliLive.absorbClick = false;
            if (meshyLive.openEmotes) {
              meshyLive.openEmotes = false;
              setEmoteOpen(true);
            }
            return;
          }
          if (moved > 8) return;
          if (started && !dialog && (locked || touchUi)) {
            floorInteract.lookClick = true;
            return;
          }
          if (started && !locked && !dialog && !touchUi) requestLock();
        }}
        onPointerCancel={() => {
          lookDrag.current.on = false;
        }}
      >
        <Canvas
          shadows={settings.shadows}
          style={{ width: "100%", height: "100%", display: "block" }}
          camera={{ fov: FOV_DEFAULT, position: [0, EYE, 24], near: 0.08, far: settings.far }}
          frameloop="always"
          dpr={settings.dpr}
          performance={{ min: 0.85 }}
          gl={{
            antialias: settings.antialias,
            powerPreference: "high-performance",
            stencil: false,
            alpha: false,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.12,
          }}
        >
          <Suspense fallback={null}>
            <DistrictScene district={district} collected={collected} />
          </Suspense>
          <AdaptiveDpr pixelated={false} />
          <Player
            district={district}
            blocked={!!dialog}
            look={look}
            stick={stick}
            lookStick={lookStick}
            zoom={zoom}
            keysRef={keysRef}
            session={session}
            onHud={onHud}
            onStairGuide={setStairGuide}
            onPortal={goPortal}
            onDialog={(title, body, image, href, hrefLabel) =>
              setDialog({ title, body, image, href, hrefLabel })
            }
          />
        </Canvas>
        <div
          className="pointer-events-none absolute inset-0 bg-bg transition-opacity duration-500"
          style={{ opacity: fade }}
        />
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg/80" />

      {stairGuide ? (
        <div className="pointer-events-none absolute inset-x-0 top-[4.75rem] z-10 flex justify-center px-3 sm:top-[5.25rem]">
          <div className="w-full max-w-sm rounded-xl border border-gold/50 bg-bg/90 px-3 py-2.5 shadow-lg backdrop-blur-md sm:px-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-medium tracking-[0.16em] text-gold uppercase">
                {stairGuide.title}
              </p>
              <p className="font-mono text-[10px] tabular-nums text-muted">
                {Math.round(stairGuide.progress * 100)}%
              </p>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border/80">
              <div
                className="h-full rounded-full bg-gold transition-[width] duration-200"
                style={{ width: `${Math.max(6, Math.round(stairGuide.progress * 100))}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs leading-snug text-fg/90">{stairGuide.hint}</p>
          </div>
        </div>
      ) : null}

      {started && !walkAsSelf && thirdPerson ? (
        <div className="pointer-events-none absolute right-3 bottom-[max(8.5rem,env(safe-area-inset-bottom))] z-10 flex flex-col items-end gap-2 sm:bottom-6 sm:right-5">
          <div className="pointer-events-auto flex flex-wrap justify-end gap-1.5">
            <Button
              type="button"
              variant="secondary"
              className="min-h-10 px-3 text-xs"
              onClick={() => {
                meshyLive.thirdPerson = false;
                setThirdPerson(false);
              }}
            >
              First person
            </Button>
            <Button
              type="button"
              variant={emoteOpen ? "default" : "secondary"}
              className="min-h-10 px-3 text-xs"
              onClick={() => setEmoteOpen((o) => !o)}
            >
              Wave
            </Button>
          </div>
          {emoteOpen ? (
            <div className="pointer-events-auto grid w-[min(100vw-1.5rem,16rem)] grid-cols-2 gap-1.5 rounded-xl border border-border bg-bg/92 p-2 shadow-lg backdrop-blur-md">
              {MESHY_EMOTES.map((emote, i) => (
                <button
                  key={emote.id}
                  type="button"
                  className="min-h-11 rounded-lg border border-border bg-surface px-2 py-2 text-left text-xs hover:border-gold/60"
                  onClick={() => requestMeshyEmote(emote.id)}
                >
                  <span className="font-mono text-[10px] text-muted">{i + 1}</span>
                  <span className="mt-0.5 block font-medium">{emote.label}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : started && !walkAsSelf ? (
        <div className="pointer-events-none absolute right-3 bottom-[max(8.5rem,env(safe-area-inset-bottom))] z-10 sm:bottom-6 sm:right-5">
          <Button
            type="button"
            variant="secondary"
            className="pointer-events-auto min-h-10 px-3 text-xs"
            onClick={() => {
              meshyLive.thirdPerson = true;
              setThirdPerson(true);
            }}
          >
            Show {character.name}
          </Button>
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-5">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="pointer-events-auto rounded-lg border border-border bg-bg/80 px-3 py-2 backdrop-blur-sm">
              <p className="text-xs tracking-wide text-gold uppercase">Still being built</p>
              <p className="font-display text-sm">{world.name}</p>
              <p className="text-xs tabular-nums text-muted">
                {collected.length}/8 shards · {visited.length}/4 districts
              </p>
            </div>
            {started ? (
              <div className="pointer-events-auto flex flex-col items-end gap-2">
                <div className="flex items-center gap-1">
                  <div className="flex rounded-lg border border-border bg-bg/80 p-0.5 backdrop-blur-sm">
                    <button
                      type="button"
                      className={`min-h-10 rounded-md px-3 text-xs font-medium ${
                        walkAsSelf ? "bg-gold text-gold-fg" : "text-muted hover:text-fg"
                      }`}
                      onClick={() => applyWalkMode(true)}
                    >
                      You
                    </button>
                    <button
                      type="button"
                      className={`min-h-10 rounded-md px-3 text-xs font-medium ${
                        !walkAsSelf ? "bg-gold text-gold-fg" : "text-muted hover:text-fg"
                      }`}
                      onClick={() => applyWalkMode(false)}
                    >
                      Character
                    </button>
                  </div>
                  <button
                    type="button"
                    className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-border bg-bg/80 text-xs font-medium text-muted backdrop-blur-sm hover:text-fg"
                    aria-label={help ? "Close how to walk" : "How to walk"}
                    onClick={() => setHelp((open) => !open)}
                  >
                    ?
                  </button>
                </div>
                <div className="hidden rounded-lg border border-border bg-bg/80 p-0.5 backdrop-blur-sm sm:flex">
                  {(["low", "mid", "high"] as const).map((q) => (
                    <button
                      key={q}
                      type="button"
                      className={`min-h-9 rounded-md px-2 text-[10px] font-medium uppercase ${
                        level === q ? "bg-gold text-gold-fg" : "text-muted hover:text-fg"
                      }`}
                      onClick={() => setLevel(q)}
                    >
                      {q === "low" ? "Lo" : q === "mid" ? "Mid" : "Hi"}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="hidden min-h-9 rounded-lg border border-border bg-bg/80 px-2.5 text-[10px] font-medium tracking-wide text-muted uppercase backdrop-blur-sm hover:text-fg sm:inline-flex"
                  onClick={() => {
                    const next = !lobbyQuiet;
                    setLobbyQuiet(next);
                    setLobbyMuted(next);
                    if (next) stopLobbyBed();
                    else void startLobbyBed();
                  }}
                >
                  {lobbyQuiet ? "Sound off" : "Sound on"}
                </button>
                {!walkAsSelf ? (
                  <div className="flex gap-1 rounded-lg border border-border bg-bg/80 p-1 backdrop-blur-sm">
                    {CHARACTERS.map((crew) => (
                      <button
                        key={crew.id}
                        type="button"
                        title={crew.name}
                        className={`size-10 overflow-hidden rounded-md border ${
                          crew.id === characterId ? "border-gold" : "border-transparent opacity-70"
                        }`}
                        onClick={() => pickCharacter(crew.id)}
                      >
                        <img
                          src={crew.portrait}
                          alt={crew.name}
                          className="size-full object-cover object-[center_18%]"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="hidden max-w-[15rem] rounded-lg border border-border bg-bg/80 px-3 py-2 text-xs text-muted sm:block">
                  {prompt?.kind === "heli" && prompt.id === "exit"
                    ? touchUi
                      ? "Sticks fly · Up / Down · Use exits"
                      : "WASD fly · Space up · Shift down · E exit"
                    : touchUi
                      ? "Left walks · drag looks · Use talks"
                      : "WASD walk · drag to look · E use"}
                </div>
              </div>
            ) : null}
          </div>
          {started && line ? (
            <div className="pointer-events-auto flex max-w-md items-start gap-3 rounded-xl border border-border bg-bg/85 p-2.5 backdrop-blur-sm max-sm:max-w-[min(100%,20rem)] sm:p-3">
              {walkAsSelf ? (
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-gold/20 text-[10px] font-medium tracking-wide text-gold uppercase sm:size-10">
                  You
                </span>
              ) : (
                <img
                  src={character.portrait}
                  alt=""
                  className="size-9 rounded-md object-cover object-[center_18%] sm:size-10"
                />
              )}
              <p className="text-xs leading-relaxed sm:text-sm">{line}</p>
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
              <span className="ml-1 text-[10px] tracking-wide text-accent-fg/70 uppercase">
                {prompt.kind === "stair" ? "Walk" : "E"}
              </span>
            </Button>
          ) : null}
        </div>
      </div>

      {started && touchUi ? (
      <div className="pointer-events-none absolute inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-10 flex items-end justify-between gap-3 px-3">
        <div className="pointer-events-auto">
          <FloorStick
            label="Walk"
            onChange={(x, y) => {
              stick.current = { x, y };
            }}
          />
        </div>
        <div className="pointer-events-auto flex flex-col items-center gap-2">
          {prompt?.kind === "heli" && prompt.id === "exit" ? (
            <div className="flex gap-2">
              <button
                type="button"
                className="grid min-h-10 min-w-12 place-items-center rounded-full border border-border bg-bg/90 px-3 font-display text-xs"
                onPointerDown={() => {
                  heliLive.climbStick = 1;
                }}
                onPointerUp={() => {
                  if (heliLive.climbStick > 0) heliLive.climbStick = 0;
                }}
                onPointerCancel={() => {
                  if (heliLive.climbStick > 0) heliLive.climbStick = 0;
                }}
              >
                Up
              </button>
              <button
                type="button"
                className="grid min-h-10 min-w-12 place-items-center rounded-full border border-border bg-bg/90 px-3 font-display text-xs"
                onPointerDown={() => {
                  heliLive.climbStick = -1;
                }}
                onPointerUp={() => {
                  if (heliLive.climbStick < 0) heliLive.climbStick = 0;
                }}
                onPointerCancel={() => {
                  if (heliLive.climbStick < 0) heliLive.climbStick = 0;
                }}
              >
                Down
              </button>
            </div>
          ) : null}
          <button
            type="button"
            disabled={!prompt}
            className="grid min-h-12 min-w-[4.75rem] place-items-center rounded-full border-2 border-gold/70 bg-gold px-3 py-2 font-display text-xs text-gold-fg disabled:opacity-40"
            onClick={() =>
              (window as Window & { __exploreInteract?: () => void }).__exploreInteract?.()
            }
          >
            {prompt?.label ?? "Use"}
          </button>
          <FloorStick
            label="Look"
            onChange={(x, y) => {
              lookStick.current = { x, y };
            }}
          />
        </div>
      </div>
      ) : null}

      {!started ? (
        <div className="absolute inset-0 z-10 overflow-y-auto bg-bg/85 p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6">
          <div className="mx-auto flex min-h-full max-w-lg items-center py-4">
            <div className="w-full rounded-xl border border-border bg-surface p-5 sm:p-6">
              <p className="text-xs font-medium tracking-[0.16em] text-gold uppercase">
                Still being built
              </p>
              <h1 className="mt-2 font-display text-2xl font-medium">Walk The Floor</h1>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Walk as yourself — first person, no costume — or pick a character and see them on
                the Floor. HQ is open. The rest of the city is still pouring.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`min-h-[4.5rem] rounded-xl border px-3 py-3 text-left ${
                    walkAsSelf ? "border-gold bg-gold/15" : "border-border bg-bg hover:border-muted"
                  }`}
                  onClick={() => applyWalkMode(true)}
                >
                  <span className="block text-sm font-medium">Walk as you</span>
                  <span className="mt-1 block text-xs leading-snug text-muted">
                    First person. Guest badge.
                  </span>
                </button>
                <button
                  type="button"
                  className={`min-h-[4.5rem] rounded-xl border px-3 py-3 text-left ${
                    !walkAsSelf ? "border-gold bg-gold/15" : "border-border bg-bg hover:border-muted"
                  }`}
                  onClick={() => applyWalkMode(false)}
                >
                  <span className="block text-sm font-medium">Use a character</span>
                  <span className="mt-1 block text-xs leading-snug text-muted">
                    Rex, Vex, Tria, or Ptera.
                  </span>
                </button>
              </div>

              {!walkAsSelf ? (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {CHARACTERS.map((crew) => (
                    <button
                      key={crew.id}
                      type="button"
                      className={`min-h-20 rounded-xl border p-2 text-left ${
                        characterId === crew.id
                          ? "border-gold bg-gold/15"
                          : "border-border bg-bg hover:border-muted"
                      }`}
                      onClick={() => pickCharacter(crew.id)}
                    >
                      <img
                        src={crew.portrait}
                        alt=""
                        className="aspect-[3/4] w-full rounded-md object-cover object-[center_18%]"
                      />
                      <span className="mt-1.5 block text-xs font-medium">{crew.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              ) : null}

              <p className="mt-4 text-sm leading-relaxed text-muted sm:hidden">
                Left stick walks. Drag the Floor or use the right stick to look. Tap Use when
                something glows. Menu in the header takes you back out.
              </p>
              <p className="mt-4 hidden text-sm leading-relaxed text-muted sm:block">
                Click the Floor, then WASD to walk and drag to look. E talks. Shift sprints. Switch
                You / Character any time. ? or H opens this list.
              </p>

              <Button id="enter-3d" size="lg" className="mt-6 w-full" onClick={startExplore}>
                Enter {world.name}
                <span className="text-[10px] tracking-wide uppercase opacity-70">Enter</span>
              </Button>
            </div>
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
            {dialog.href ? (
              <Button asChild className="mt-4 w-full">
                <Link to={dialog.href as FileRouteTypes["to"]} onClick={() => setDialog(null)}>
                  {dialog.hrefLabel ?? "Open"}
                </Link>
              </Button>
            ) : (
              <Button className="mt-4" onClick={() => setDialog(null)}>
                Continue
                <span className="text-[10px] tracking-wide uppercase opacity-70">Enter</span>
              </Button>
            )}
          </div>
        </div>
      ) : null}

      {help ? (
        <div className="absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-20 mx-auto w-[min(100%-1.5rem,28rem)] rounded-xl border border-border bg-bg/94 p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs tracking-wide text-muted uppercase">How to walk</p>
            <button
              type="button"
              className="min-h-9 rounded-md px-2 text-xs text-muted hover:text-fg"
              onClick={() => setHelp(false)}
            >
              Close
            </button>
          </div>
          {touchUi ? (
            <ul className="mt-3 space-y-1.5 text-sm">
              <li>Left stick — walk</li>
              <li>Drag the Floor or right stick — look</li>
              <li>Use — talk, look, board, lift</li>
              <li>You / Character — guest walk or crew body</li>
              <li>Header — leave The Floor</li>
            </ul>
          ) : (
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <li>WASD — walk</li>
              <li>Drag / mouse — look</li>
              <li>E — talk or use</li>
              <li>Shift — sprint</li>
              <li>Wheel — zoom</li>
              {walkAsSelf ? <li>V — switch to a character</li> : <li>V — first / third person</li>}
              {walkAsSelf ? null : <li>C / 1–4 — wave</li>}
              <li>Esc — free mouse</li>
            </ul>
          )}
          <p className="mt-3 text-xs text-muted">
            {walkAsSelf
              ? "You are walking as a guest. Switch to Character to show a crew body."
              : `You are walking as ${character.name}. Switch to You for a first-person guest walk.`}
          </p>
        </div>
      ) : null}

      {questDone ? (
        <div className="absolute inset-x-0 top-20 z-10 mx-auto w-[min(100%-1.5rem,28rem)] rounded-xl border border-accent/40 bg-surface p-4">
          <p className="font-display text-lg">Bag secured</p>
          <p className="mt-1 text-sm text-muted">
            {walkAsSelf
              ? "You walked The Floor as a guest and checked the other three. The Floor is still open. The other districts are still pouring."
              : `You walked The Floor as ${character.name} and checked the other three. The Floor is still open. The other districts are still pouring.`}
          </p>
        </div>
      ) : null}
    </div>
  );
}
