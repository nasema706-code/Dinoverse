/**
 * Shared GLTF loader for Dinoverse 3D assets.
 *
 * drei's useGLTF already defaults useDraco/useMeshopt to true, but we pin them
 * explicitly so Meshopt-compressed (EXT_meshopt_compression) and Draco GLBs
 * always decode correctly — including assets already shipping that way
 * (meshy-character, ptera-pilot) and the canyon props compressed by
 * scripts/compress-models.mjs.
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
