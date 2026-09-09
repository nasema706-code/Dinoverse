import type { CharacterId } from "@/lib/characters";
import * as THREE from "three";

export const CREW_LOOK: Record<
  CharacterId,
  { height: number; scaleXZ: number; tint: string; emissive: string }
> = {
  rex: { height: 1.78, scaleXZ: 1, tint: "#a03c48", emissive: "#4a141c" },
  vex: { height: 1.66, scaleXZ: 0.92, tint: "#4a58d0", emissive: "#241848" },
  tria: { height: 1.86, scaleXZ: 1.22, tint: "#e0b42a", emissive: "#5a4208" },
  ptera: { height: 1.7, scaleXZ: 0.96, tint: "#c87830", emissive: "#4a280c" },
};

/** Recolor the shared Meshy GLB so Rex / Vex / Tria / Ptera read as different crew. */
export function applyCrewLook(root: THREE.Object3D, id: CharacterId) {
  const look = CREW_LOOK[id];
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const next = list.map((raw) => {
      if (!raw || !("color" in raw)) return raw;
      const src = raw as THREE.MeshStandardMaterial;
      const mat = src.userData.crewClone ? src : src.clone();
      mat.userData.crewClone = true;
      if (!mat.userData.baseMap && mat.map && !(mat.map instanceof THREE.CanvasTexture)) {
        mat.userData.baseMap = mat.map;
      }
      if (mat.userData.baseMap) mat.map = mat.userData.baseMap as THREE.Texture;
      mat.color.set(look.tint);
      mat.emissive.set(look.emissive);
      mat.emissiveIntensity = 0.14;
      mat.needsUpdate = true;
      return mat;
    });
    mesh.material = Array.isArray(mesh.material) ? next : next[0]!;
  });
}
