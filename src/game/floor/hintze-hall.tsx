import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { HINTZE_HALL, HINTZE_LENGTH, L2_HEIGHT } from "./levels";
import { Box, CheapGlass } from "./kit";
import { useQuality } from "../quality";

const SRC = "/models/hintze-hall.glb?v=1";

useGLTF.preload(SRC);

function localBox(obj: THREE.Object3D) {
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj);
  if (obj.parent) {
    box.applyMatrix4(obj.parent.matrixWorld.clone().invert());
  }
  return box;
}

function fitLengthAndSit(root: THREE.Object3D, length: number) {
  root.scale.set(1, 1, 1);
  root.position.set(0, 0, 0);
  const box = localBox(root);
  const size = box.getSize(new THREE.Vector3());
  if (size.x < 1e-5) return;
  root.scale.multiplyScalar(length / size.x);
  const fitted = localBox(root);
  const center = fitted.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y -= fitted.min.y;
}

function RoofRail({ x, z, w, d }: { x: number; z: number; w: number; d: number }) {
  return (
    <group position={[x, L2_HEIGHT + 0.52, z]}>
      <mesh>
        <boxGeometry args={[Math.max(w, 0.08), 1.02, Math.max(d, 0.08)]} />
        <CheapGlass opacity={0.2} />
      </mesh>
      <Box position={[0, 0.52, 0]} size={[Math.max(w, 0.1), 0.05, Math.max(d, 0.1)]} color="#c5d0d8" metal={0.7} />
    </group>
  );
}

/** NHM Hintze Hall wing on the east roof terrace. */
export function HintzeHall() {
  const rig = useRef<THREE.Group>(null);
  const { scene } = useGLTF(SRC);
  const { settings } = useQuality();
  const { x, z, y, rotY } = HINTZE_HALL;

  useLayoutEffect(() => {
    scene.traverse((obj) => {
      obj.castShadow = true;
      obj.receiveShadow = true;
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.frustumCulled = false;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const raw of mats) {
        if (!raw) continue;
        const mat = raw as THREE.MeshStandardMaterial;
        mat.side = THREE.DoubleSide;
        mat.transparent = false;
        mat.opacity = 1;
        mat.depthWrite = true;
        if ("envMapIntensity" in mat) mat.envMapIntensity = 0.72;
        mat.needsUpdate = true;
      }
    });
    if (rig.current) fitLengthAndSit(rig.current, HINTZE_LENGTH);
  }, [scene]);

  return (
    <group>
      <Box position={[x, y, z]} size={[8.2, 0.14, 14.2]} color="#8a929c" metal={0.24} rough={0.3} />
      <Box position={[x, y - 0.42, z]} size={[7.6, 0.7, 13.6]} color="#1e2228" metal={0.42} rough={0.48} />
      {([18.2, 23.5, 28.8] as const).map((cz) => (
        <group key={cz}>
          <Box position={[15.35, 3, cz]} size={[0.38, 6, 0.38]} color="#2a2d33" metal={0.45} rough={0.4} />
          <Box position={[21.35, 3, cz]} size={[0.38, 6, 0.38]} color="#2a2d33" metal={0.45} rough={0.4} />
        </group>
      ))}
      <RoofRail x={22.15} z={z} w={0.08} d={13.4} />
      <RoofRail x={x} z={16.85} w={7.8} d={0.08} />
      <RoofRail x={x} z={30.25} w={7.8} d={0.08} />

      <group position={[x, y, z]} rotation={[0, rotY, 0]} userData={{ floorLook: "forum-hintze" }}>
        <group ref={rig}>
          <primitive object={scene} />
        </group>
      </group>

      {settings.extraLights ? (
        <pointLight position={[x, y + 3.15, z]} intensity={1.05} distance={14} color="#f3ead2" />
      ) : null}

      <Box position={[14.55, y + 1.18, 21.6]} size={[0.08, 0.72, 0.52]} color="#6b5340" metal={0.35} rough={0.42} />
    </group>
  );
}
