import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { PTERA_PAD } from "./layout";
import { floorInteract } from "./floor-interact";
import { pteraLive } from "./ptera-live";

const SRC = "/models/ptera-pilot.glb?v=walk";
const HEIGHT = 1.82;
const WALK_SPEED = 1.32;
const NOTICE_R = 2.35;
const TALK_R = 1.65;
const PATROL: [number, number][] = [
  [7.5, 25.5],
  [8.6, 23.4],
  [5.8, 26.6],
  [8.3, 30.0],
  [9.0, 27.2],
];

useGLTF.preload(SRC);

function fitStanding(root: THREE.Object3D, height: number) {
  root.scale.set(1, 1, 1);
  root.position.set(0, 0, 0);
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  if (size.y < 1e-5) return;
  root.scale.multiplyScalar(height / size.y);
  root.updateMatrixWorld(true);
  box.setFromObject(root);
  root.position.y -= box.min.y;
}

function stripRootMotion(clip: THREE.AnimationClip) {
  for (const track of clip.tracks) {
    if (!track.name.endsWith(".position") || !track.name.includes("Hips")) continue;
    const values = track.values;
    const x0 = values[0];
    const z0 = values[2];
    for (let i = 0; i < values.length; i += 3) {
      values[i] = x0;
      values[i + 2] = z0;
    }
  }
}

function pickClip(names: string[], ...hints: string[]) {
  for (const hint of hints) {
    const hit = names.find((n) => n.toLowerCase().includes(hint));
    if (hit) return hit;
  }
}

function yawToward(dx: number, dz: number) {
  if (dx * dx + dz * dz < 1e-8) return null;
  return Math.atan2(-dx, -dz);
}

function shortestYaw(from: number, to: number) {
  let d = to - from;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return from + d;
}

export function PteraPilot({
  preview = false,
}: {
  preview?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const root = useRef<THREE.Group>(null);
  const mode = useRef<"walk" | "wave">("walk");
  const waypoint = useRef(1);
  const yaw = useRef(PTERA_PAD.rotY);
  const { scene, animations } = useGLTF(SRC);
  const { actions, names } = useAnimations(animations, group);
  const camera = useThree((s) => s.camera);

  useLayoutEffect(() => {
    scene.traverse((obj) => {
      obj.castShadow = true;
      obj.receiveShadow = true;
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.frustumCulled = false;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of mats) {
        if (mat) mat.side = THREE.DoubleSide;
      }
    });
    fitStanding(scene, HEIGHT);
    for (const clip of animations) stripRootMotion(clip);
  }, [scene, animations]);

  useLayoutEffect(() => {
    const walkName = pickClip(names, "walk");
    const waveName = pickClip(names, "wave", "hello");
    const walk = walkName ? actions[walkName] : undefined;
    const wave = waveName && waveName !== walkName ? actions[waveName] : undefined;
    if (!walk && !wave) return;
    walk?.reset().setLoop(THREE.LoopRepeat, Infinity);
    wave?.reset().setLoop(THREE.LoopRepeat, Infinity);
    if (walk) {
      walk.timeScale = 1.12;
      walk.fadeIn(0.15).play();
      mode.current = "walk";
    } else {
      wave?.fadeIn(0.15).play();
      mode.current = "wave";
    }
    return () => {
      walk?.fadeOut(0.05).stop();
      wave?.fadeOut(0.05).stop();
    };
  }, [actions, names]);

  useFrame((_, raw) => {
    const node = root.current;
    if (!node) return;
    const dt = Math.min(raw, 0.05);
    const px = node.position.x;
    const pz = node.position.z;
    const dist = Math.hypot(camera.position.x - px, camera.position.z - pz);
    const onRoof = camera.position.y > PTERA_PAD.y - 1.05;
    const notice = !preview && onRoof && (dist < NOTICE_R || pteraLive.approach);
    const walkName = pickClip(names, "walk");
    const waveName = pickClip(names, "wave", "hello");
    const walk = walkName ? actions[walkName] : undefined;
    const wave = waveName && waveName !== walkName ? actions[waveName] : undefined;

    const setMode = (next: "walk" | "wave") => {
      if (mode.current === next) return;
      mode.current = next;
      if (next === "wave") {
        walk?.fadeOut(0.18);
        wave?.reset().fadeIn(0.18).play();
      } else {
        wave?.fadeOut(0.18);
        walk?.reset().fadeIn(0.18).play();
      }
    };

    let lookX = 0;
    let lookZ = 0;
    let moving = false;

    if (notice) {
      lookX = camera.position.x - px;
      lookZ = camera.position.z - pz;
      if (pteraLive.approach && dist > TALK_R) {
        const len = Math.hypot(lookX, lookZ) || 1;
        node.position.x += (lookX / len) * WALK_SPEED * 1.15 * dt;
        node.position.z += (lookZ / len) * WALK_SPEED * 1.15 * dt;
        moving = true;
      } else if (pteraLive.approach && dist <= TALK_R) {
        pteraLive.approach = false;
        if (onRoof) {
          pteraLive.pendingTalk = true;
          floorInteract.talkId = "ptera";
        }
      }
      setMode(moving ? "walk" : "wave");
    } else {
      const [tx, tz] = PATROL[waypoint.current] ?? PATROL[0];
      lookX = tx - px;
      lookZ = tz - pz;
      const remain = Math.hypot(lookX, lookZ);
      if (remain < 0.28) {
        waypoint.current = (waypoint.current + 1) % PATROL.length;
        const next = PATROL[waypoint.current] ?? PATROL[0];
        lookX = next[0] - px;
        lookZ = next[1] - pz;
      } else {
        node.position.x += (lookX / remain) * WALK_SPEED * dt;
        node.position.z += (lookZ / remain) * WALK_SPEED * dt;
        moving = true;
      }
      setMode("walk");
    }

    const nextYaw = yawToward(lookX, lookZ);
    if (nextYaw != null) {
      const target = shortestYaw(yaw.current, nextYaw);
      yaw.current += (target - yaw.current) * Math.min(1, dt * 6.5);
      node.rotation.y = yaw.current;
    }

    pteraLive.x = node.position.x;
    pteraLive.z = node.position.z;
  });

  return (
    <group
      ref={root}
      position={[PTERA_PAD.x, PTERA_PAD.y, PTERA_PAD.z]}
      rotation={[0, PTERA_PAD.rotY, 0]}
      userData={{ floorPtera: true }}
      onPointerDown={
        preview
          ? undefined
          : (e) => {
              e.stopPropagation();
              floorInteract.absorbClick = true;
              pteraLive.approach = true;
            }
      }
      onPointerOver={preview ? undefined : () => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={preview ? undefined : () => {
        document.body.style.cursor = "";
      }}
    >
      <group ref={group}>
        <primitive object={scene} />
      </group>
    </group>
  );
}
