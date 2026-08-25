import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import { RexRunner } from "./rex-runner";
import type { Loadout } from "./shop";

const FRAME = { cam: [1.65, 1.42, 2.35] as [number, number, number], look: [0, 0.82, 0] as [number, number, number], scale: 1.18 };

function FitCamera() {
  const { camera } = useThree();
  const frame = FRAME;
  useFrame(() => {
    camera.position.set(frame.cam[0], frame.cam[1], frame.cam[2]);
    camera.lookAt(frame.look[0], frame.look[1], frame.look[2]);
  });
  return null;
}

function StudioRig({
  loadout,
}: {
  loadout: Loadout;
}) {
  const spin = useRef<Group>(null);
  const yaw = useRef(0.55);
  const pitch = useRef(0.08);
  const auto = useRef(true);
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);

  const resume = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resume.current) clearTimeout(resume.current);
    };
  }, []);

  useFrame((_, dt) => {
    if (auto.current) yaw.current += dt * 0.62;
    const g = spin.current;
    if (!g) return;
    g.rotation.y = yaw.current;
    g.rotation.x = pitch.current;
  });

  const grab = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (resume.current) clearTimeout(resume.current);
    (e.nativeEvent.target as Element | null)?.setPointerCapture?.(e.pointerId);
    drag.current = {
      x: e.nativeEvent.clientX,
      y: e.nativeEvent.clientY,
      yaw: yaw.current,
      pitch: pitch.current,
    };
    auto.current = false;
  };

  const spinDrag = (e: ThreeEvent<PointerEvent>) => {
    if (!drag.current) return;
    yaw.current = drag.current.yaw + (e.nativeEvent.clientX - drag.current.x) * 0.012;
    pitch.current = Math.max(
      -0.32,
      Math.min(0.42, drag.current.pitch + (e.nativeEvent.clientY - drag.current.y) * 0.008),
    );
  };

  const release = () => {
    if (!drag.current) return;
    drag.current = null;
    resume.current = setTimeout(() => {
      auto.current = true;
    }, 1400);
  };

  return (
    <group>
      <FitCamera />
      <mesh
        position={[0, 0.7, 0]}
        onPointerDown={grab}
        onPointerMove={spinDrag}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <sphereGeometry args={[2.6, 16, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <group ref={spin} scale={FRAME.scale}>
        <group rotation={[0, Math.PI, 0]}>
          <RexRunner
            key={`${loadout.tie}-${loadout.face}-${loadout.chain}-${loadout.coffee}`}
            getX={() => 0}
            getY={() => 0}
            running={false}
            loadout={loadout}
          />
        </group>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.85, 32]} />
        <meshStandardMaterial color="#121418" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[0.86, 1.12, 48]} />
        <meshBasicMaterial color="#3ecf8e" transparent opacity={0.22} />
      </mesh>
    </group>
  );
}

export function CharacterTurntable({ loadout }: { loadout: Loadout }) {
  return (
    <Canvas
      className="absolute inset-0 touch-none"
      camera={{ fov: 36, position: FRAME.cam, near: 0.1, far: 24 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      onCreated={({ gl }) => {
        gl.domElement.style.touchAction = "none";
      }}
    >
      <color attach="background" args={["#07080b"]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight color="#fff4e0" groundColor="#1a2018" intensity={0.7} />
      <directionalLight position={[4, 6, 3]} intensity={1.35} color="#fff6e8" />
      <pointLight position={[-3, 2.4, -2]} intensity={0.85} color="#3ecf8e" />
      <pointLight position={[2.5, 1.6, 3]} intensity={0.55} color="#5ec8ff" />
      <StudioRig loadout={loadout} />
    </Canvas>
  );
}
