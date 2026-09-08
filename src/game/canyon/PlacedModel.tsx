import { Clone, useGLTF } from "@react-three/drei";
import { Component, Suspense, useEffect, useState, type ReactNode } from "react";
import type { Placement } from "./types";

const existsCache = new Map<string, boolean>();
const inflight = new Map<string, Promise<boolean>>();

function probeGltf(url: string) {
  const cached = existsCache.get(url);
  if (cached !== undefined) return Promise.resolve(cached);
  const pending = inflight.get(url);
  if (pending) return pending;
  const next = fetch(url, { method: "HEAD" })
    .then((res) => {
      if (res.status === 405 || res.status === 501) return fetch(url, { method: "GET" });
      return res;
    })
    .then((res) => {
      const type = res.headers.get("content-type") ?? "";
      const fine = res.ok && !type.includes("text/html");
      existsCache.set(url, fine);
      return fine;
    })
    .catch(() => {
      existsCache.set(url, false);
      return false;
    })
    .finally(() => {
      inflight.delete(url);
    });
  inflight.set(url, next);
  return next;
}

export function useGltfAvailable(url: string) {
  const [ok, setOk] = useState(() => existsCache.get(url) === true);

  useEffect(() => {
    if (!url) {
      setOk(false);
      return;
    }
    let live = true;
    void probeGltf(url).then((fine) => {
      if (live) setOk(fine);
    });
    return () => {
      live = false;
    };
  }, [url]);

  return ok;
}

class SilentBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function GltfMesh({ url, position, rotation, scale }: Placement) {
  const { scene } = useGLTF(url);
  return <Clone object={scene} position={position} rotation={rotation} scale={scale ?? 1} />;
}

export function PlacedModel({ url, position, rotation = [0, 0, 0], scale = 1 }: Placement) {
  const ready = useGltfAvailable(url);
  if (!url || !ready) return null;
  return (
    <SilentBoundary>
      <Suspense fallback={null}>
        <GltfMesh url={url} position={position} rotation={rotation} scale={scale} />
      </Suspense>
    </SilentBoundary>
  );
}
