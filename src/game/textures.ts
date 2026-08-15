import { useEffect, useState } from "react";
import * as THREE from "three";

const cache = new Map<string, THREE.Texture>();

export function useLoopingVideo(src: string, enabled: boolean) {
  const [tex, setTex] = useState<THREE.VideoTexture | null>(null);
  useEffect(() => {
    if (!enabled || !src || typeof document === "undefined") {
      setTex(null);
      return;
    }
    const video = document.createElement("video");
    video.src = src;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    let alive = true;
    const start = () => {
      if (!alive) return;
      video.play().catch(() => {});
      setTex(texture);
    };
    video.addEventListener("canplay", start);
    video.load();
    return () => {
      alive = false;
      video.removeEventListener("canplay", start);
      video.pause();
      video.removeAttribute("src");
      video.load();
      texture.dispose();
      setTex(null);
    };
  }, [src, enabled]);
  return tex;
}

const cutoutCache = new Map<string, { map: THREE.CanvasTexture; aspect: number }>();

function floodCutout(img: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0);
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = image.data;
  const w = canvas.width;
  const h = canvas.height;
  const seen = new Uint8Array(w * h);
  const stack: number[] = [];
  const push = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (seen[p]) return;
    seen[p] = 1;
    stack.push(p);
  };
  const dark = (i: number) => px[i] < 20 && px[i + 1] < 20 && px[i + 2] < 20;
  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }
  while (stack.length) {
    const p = stack.pop()!;
    const i = p * 4;
    if (!dark(i)) continue;
    px[i + 3] = 0;
    const x = p % w;
    const y = (p / w) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
  ctx.putImageData(image, 0, 0);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.minFilter = THREE.LinearFilter;
  map.magFilter = THREE.LinearFilter;
  map.generateMipmaps = false;
  map.needsUpdate = true;
  return { map, aspect: w / h };
}

export function useCutoutTexture(src: string) {
  const [tex, setTex] = useState<{ map: THREE.CanvasTexture; aspect: number } | null>(
    () => cutoutCache.get(src) ?? null,
  );
  useEffect(() => {
    if (!src || typeof Image === "undefined") {
      setTex(null);
      return;
    }
    const hit = cutoutCache.get(src);
    if (hit) {
      setTex(hit);
      return;
    }
    let alive = true;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const cut = floodCutout(img);
      if (!cut || !alive) return;
      cutoutCache.set(src, cut);
      setTex(cut);
    };
    img.src = src;
    return () => {
      alive = false;
    };
  }, [src]);
  return tex;
}

export function usePhoto(src: string) {
  const [tex, setTex] = useState<THREE.Texture | null>(() => (src ? cache.get(src) ?? null : null));
  useEffect(() => {
    if (!src) {
      setTex(null);
      return;
    }
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
