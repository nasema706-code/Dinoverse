/**
 * Shared GLTF loader for Dinoverse 3D assets.
 *
 * Pins Draco + Meshopt decode on every load so assets from scripts/opt-*.mjs
 * (KHR_draco_mesh_compression and/or EXT_meshopt_compression) and already-shipping
 * Meshopt characters (meshy-character, ptera-pilot) decode correctly.
 * See scripts/lib/gltf-opt-shared.mjs.
 */
import { useGLTF as useDreiGLTF } from "@react-three/drei";
import type { ObjectMap } from "@react-three/fiber";
import type { GLTF } from "three-stdlib";

/** Keep Draco + Meshopt on for every game model load. */
const USE_DRACO = true;
const USE_MESHOPT = true;

export function useGameGLTF(path: string): GLTF & ObjectMap {
  return useDreiGLTF(path, USE_DRACO, USE_MESHOPT);
}

useGameGLTF.preload = (path: string) => {
  useDreiGLTF.preload(path, USE_DRACO, USE_MESHOPT);
};

useGameGLTF.clear = (path: string) => {
  useDreiGLTF.clear(path);
};
