import { useEffect, useState } from "react";
import * as THREE from "three";

const cache = new Map<string, THREE.Texture>();

export function usePhoto(src: string) {
  const [tex, setTex] = useState<THREE.Texture | null>(() => cache.get(src) ?? null);
  useEffect(() => {
    const hit = cache.get(src);
    if (hit) {
      setTex(hit);
      return;
    }
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    let alive = true;
    loader.load(src, (map) => {
      map.colorSpace = THREE.SRGBColorSpace;
      cache.set(src, map);
      if (alive) setTex(map);
    });
    return () => {
      alive = false;
    };
  }, [src]);
  return tex;
}
