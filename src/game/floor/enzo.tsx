import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { ENZO_COLLIDER, ENZO_PLAZA } from "./layout";
import { resetEnzoLive } from "./enzo-live";

const SRC = "/models/enzo.glb?v=1";
const HEIGHT = 1.56;
const FACE_YAW = Math.PI;

useGLTF.preload(SRC);

function fitToGround(root: THREE.Object3D, height: number) {
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

/** Enzo on the north plaza — bind pose only, no locomotion. */
export function EnzoPlaza({ preview = false }: { preview?: boolean }) {
  const rigGroup = useRef<THREE.Group>(null);
  const { scene } = useGLTF(SRC);

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
        mat.side = THREE.FrontSide;
        mat.transparent = false;
        mat.opacity = 1;
        mat.depthWrite = true;
        mat.needsUpdate = true;
      }
    });
    if (rigGroup.current) fitToGround(rigGroup.current, HEIGHT);
    ENZO_COLLIDER.x = ENZO_PLAZA.x;
    ENZO_COLLIDER.z = ENZO_PLAZA.z;
    return () => {
      resetEnzoLive();
    };
  }, [scene]);

  return (
    <group
      position={[ENZO_PLAZA.x, 0, ENZO_PLAZA.z]}
      rotation={[0, ENZO_PLAZA.rotY, 0]}
      userData={{ floorTalk: "enzo" }}
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
      <mesh position={[0, 0.85, 0]} frustumCulled={false}>
        <capsuleGeometry args={[0.62, 1.05, 3, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <group ref={rigGroup} rotation={[0, FACE_YAW, 0]}>
        <primitive object={scene} />
      </group>
    </group>
  );
}
