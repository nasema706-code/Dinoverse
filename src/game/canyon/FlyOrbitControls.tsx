import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Vec3 } from "./types";

const lookEuler = new THREE.Euler(0, 0, 0, "YXZ");
const forward = new THREE.Vector3();
const right = new THREE.Vector3();

export function FlyOrbitControls({
  target,
  flying,
  minDistance = 4,
  maxDistance = 72,
  maxPolarAngle = 1.42,
  enableOrbit = true,
}: {
  target: Vec3;
  flying: boolean;
  minDistance?: number;
  maxDistance?: number;
  maxPolarAngle?: number;
  enableOrbit?: boolean;
}) {
  const { camera, gl } = useThree();
  const keys = useRef(new Set<string>());

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current.add(e.code);
    };
    const up = (e: KeyboardEvent) => {
      keys.current.delete(e.code);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    if (!flying) return;
    lookEuler.setFromQuaternion(camera.quaternion);
    const onMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement) return;
      lookEuler.y -= e.movementX * 0.0022;
      lookEuler.x -= e.movementY * 0.0022;
      lookEuler.x = Math.max(-1.45, Math.min(1.45, lookEuler.x));
      camera.quaternion.setFromEuler(lookEuler);
    };
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, [flying, camera, gl]);

  useFrame((_, dt) => {
    if (!flying) return;
    const sprint = keys.current.has("ShiftLeft") || keys.current.has("ShiftRight");
    const speed = (sprint ? 26 : 12) * dt;
    camera.getWorldDirection(forward);
    forward.normalize();
    right.crossVectors(forward, camera.up).normalize();
    if (keys.current.has("KeyW")) camera.position.addScaledVector(forward, speed);
    if (keys.current.has("KeyS")) camera.position.addScaledVector(forward, -speed);
    if (keys.current.has("KeyA")) camera.position.addScaledVector(right, -speed);
    if (keys.current.has("KeyD")) camera.position.addScaledVector(right, speed);
    if (keys.current.has("Space")) camera.position.y += speed;
    if (keys.current.has("KeyQ") || keys.current.has("ControlLeft")) camera.position.y -= speed;
  });

  if (flying || !enableOrbit) return null;

  return (
    <OrbitControls
      makeDefault
      enableDamping
      dampingFactor={0.08}
      target={target}
      minDistance={minDistance}
      maxDistance={maxDistance}
      maxPolarAngle={maxPolarAngle}
    />
  );
}
