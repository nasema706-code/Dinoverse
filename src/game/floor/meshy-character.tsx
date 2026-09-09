import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { useDinoverse } from "@/lib/store";
import { FLOOR_SPAWN } from "./layout";
import { applyCrewLook, CREW_LOOK } from "./crew-look";
import { meshyLive, requestMeshyEmote, type MeshyEmote } from "./meshy-live";

/** Optimized Meshopt + WebP build (~1.3 MB; full source in tmp/). */
const SRC = "/models/meshy-character.glb?v=opt2";
/** Mixamo-style meshes face +Z; player yaw 0 looks −Z. */
const FACE_YAW = Math.PI;

useGLTF.preload(SRC);

const CLIPS = {
  idle: "Alert",
  walk: "Walking",
  run: "Running",
  wave: "Big_Wave_Hello",
  listen: "Listening_Gesture",
  look: "Walk_Slowly_and_Look_Around",
} as const;

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
    if (!track.name.endsWith(".position")) continue;
    if (!/hips/i.test(track.name)) continue;
    const values = track.values as Float32Array;
    const x0 = values[0];
    const z0 = values[2];
    for (let i = 0; i < values.length; i += 3) {
      values[i] = x0;
      values[i + 2] = z0;
    }
  }
}

function fadeTo(
  actions: Record<string, THREE.AnimationAction | null | undefined>,
  next: string | undefined,
  fade = 0.2,
) {
  if (!next || !actions[next]) return;
  for (const [name, action] of Object.entries(actions)) {
    if (!action) continue;
    if (name === next) {
      if (!action.isRunning()) action.reset().fadeIn(fade).play();
      else action.fadeIn(fade);
    } else if (action.isRunning()) {
      action.fadeOut(fade);
    }
  }
}

/**
 * Playable Meshy avatar — follows the explorer pose, plays walk/run/idle,
 * and one-shot emotes from the HUD or a body click.
 */
export function MeshyAvatar({ preview = false }: { preview?: boolean }) {
  const characterId = useDinoverse((s) => s.characterId);
  const root = useRef<THREE.Group>(null);
  const rig = useRef<THREE.Group>(null);
  const loco = useRef<"idle" | "walk" | "run">("idle");
  const emoting = useRef<MeshyEmote | null>(null);
  const { scene, animations } = useGLTF(SRC);
  const { actions, names } = useAnimations(animations, rig);
  const cloned = useRef<THREE.Object3D | null>(null);

  useLayoutEffect(() => {
    const model = scene;
    model.traverse((obj) => {
      obj.castShadow = true;
      obj.receiveShadow = true;
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.frustumCulled = false;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const raw of mats) {
        if (!raw) continue;
        // Meshy marks the whole body alpha-blend + double-sided, so eyes punch
        // through the skull from behind and the tail reads as hollow.
        const mat = raw as THREE.MeshStandardMaterial;
        mat.side = THREE.FrontSide;
        mat.transparent = false;
        mat.opacity = 1;
        mat.depthWrite = true;
        mat.depthTest = true;
        mat.alphaTest = 0;
        if ("transmission" in mat) {
          (mat as THREE.MeshPhysicalMaterial).transmission = 0;
        }
        mat.needsUpdate = true;
      }
    });
    const look = CREW_LOOK[characterId];
    fitStanding(model, look.height);
    model.scale.x *= look.scaleXZ;
    model.scale.z *= look.scaleXZ;
    applyCrewLook(model, characterId);
    for (const clip of animations) stripRootMotion(clip);
    cloned.current = model;
    meshyLive.ready = true;
    return () => {
      meshyLive.ready = false;
    };
  }, [scene, animations, characterId]);

  useLayoutEffect(() => {
    if (preview) {
      fadeTo(actions, CLIPS.idle, 0.1);
      const idle = actions[CLIPS.idle];
      idle?.setLoop(THREE.LoopRepeat, Infinity);
      return;
    }
    for (const name of names) {
      const action = actions[name];
      if (!action) continue;
      const loop =
        name === CLIPS.walk || name === CLIPS.run || name === CLIPS.idle
          ? THREE.LoopRepeat
          : THREE.LoopOnce;
      action.setLoop(loop, loop === THREE.LoopOnce ? 1 : Infinity);
      action.clampWhenFinished = loop === THREE.LoopOnce;
    }
    fadeTo(actions, CLIPS.idle, 0.12);
    loco.current = "idle";
  }, [actions, names, preview]);

  useFrame((_, raw) => {
    const node = root.current;
    if (!node) return;
    const dt = Math.min(raw, 0.05);

    if (preview) {
      node.position.set(FLOOR_SPAWN.x + 2.4, 0, FLOOR_SPAWN.z - 3.2);
      node.rotation.y = FLOOR_SPAWN.yaw + FACE_YAW + 0.35;
      node.visible = true;
      return;
    }

    if (!meshyLive.visible) {
      node.visible = false;
      return;
    }
    node.visible = true;
    node.position.set(meshyLive.x, meshyLive.y, meshyLive.z);
    const face = meshyLive.yaw + FACE_YAW;
    let d = face - node.rotation.y;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    node.rotation.y += d * Math.min(1, dt * 22);

    // Emote request from UI / body click.
    if (meshyLive.emote && meshyLive.emote !== emoting.current) {
      const clip = meshyLive.emote;
      emoting.current = clip;
      meshyLive.emote = null;
      const action = actions[clip];
      if (action) {
        for (const a of Object.values(actions)) {
          if (a?.isRunning()) a.fadeOut(0.12);
        }
        action.reset().setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        action.fadeIn(0.12).play();
        const mixer = action.getMixer();
        const onDone = (ev: { action?: THREE.AnimationAction }) => {
          if (ev.action && ev.action !== action) return;
          mixer.removeEventListener("finished", onDone);
          if (emoting.current !== clip) return;
          emoting.current = null;
          loco.current = "idle";
          fadeTo(actions, CLIPS.idle, 0.18);
        };
        mixer.addEventListener("finished", onDone);
      } else {
        emoting.current = null;
      }
    }

    if (emoting.current) return;

    let next: "idle" | "walk" | "run" = "idle";
    if (!meshyLive.seated && meshyLive.speed > 0.4) {
      const wantRun = meshyLive.sprint || meshyLive.drive > 0.7 || meshyLive.speed > SPEED_RUN;
      if (loco.current === "run") {
        next = meshyLive.speed > 4.6 ? "run" : "walk";
      } else {
        next = wantRun && meshyLive.speed > 5.2 ? "run" : "walk";
      }
    }
    if (next !== loco.current) {
      loco.current = next;
      const clip = next === "run" ? CLIPS.run : next === "walk" ? CLIPS.walk : CLIPS.idle;
      fadeTo(actions, clip, 0.08);
    }

    const clipName = next === "run" ? CLIPS.run : next === "walk" ? CLIPS.walk : CLIPS.idle;
    const playing = actions[clipName];
    if (playing) {
      if (next === "walk") {
        playing.timeScale = THREE.MathUtils.clamp(meshyLive.speed / 3.6, 0.95, 1.9);
      } else if (next === "run") {
        playing.timeScale = THREE.MathUtils.clamp(meshyLive.speed / 7.4, 1.05, 1.55);
      } else {
        playing.timeScale = 1;
      }
    }
  });

  return (
    <group
      ref={root}
      position={[FLOOR_SPAWN.x + 2.4, 0, FLOOR_SPAWN.z - 3.2]}
      userData={{ floorMeshy: true }}
      onPointerDown={
        preview
          ? undefined
          : (e) => {
              e.stopPropagation();
              meshyLive.absorbClick = true;
              meshyLive.openEmotes = true;
              requestMeshyEmote("Big_Wave_Hello");
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
      <group ref={rig}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

const SPEED_RUN = 7.2;
