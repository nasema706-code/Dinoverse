import {
  Component,
  useCallback,
  useEffect,
  useRef,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { useThree } from "@react-three/fiber";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import type { Quality } from "./quality";

export type FloorBootSource = "react" | "webgl" | "asset" | "unknown";

export type FloorBootFailure = {
  reason: string;
  source: FloorBootSource;
};

export type FloorBootMode = "3d" | "failed" | "2d";

const ASSET_RE =
  /glb|gltf|draco|meshopt|loadingmanager|failed to load|decode|arraybuffer|out of memory|oom|allocation|webgl|three/i;

export function classifyFloorBootError(err: unknown): FloorBootFailure {
  const message =
    err instanceof Error
      ? err.message || err.name || "Unknown Floor boot error"
      : typeof err === "string"
        ? err
        : "Unknown Floor boot error";
  const source: FloorBootSource = /webgl|context/i.test(message)
    ? "webgl"
    : ASSET_RE.test(message)
      ? "asset"
      : "unknown";
  return { reason: message.slice(0, 240), source };
}

export function shouldCaptureFloorRejection(reason: unknown): boolean {
  if (!reason) return false;
  if (reason instanceof Error) return ASSET_RE.test(`${reason.name} ${reason.message}`);
  if (typeof reason === "string") return ASSET_RE.test(reason);
  try {
    return ASSET_RE.test(String(reason));
  } catch {
    return false;
  }
}

/** Debug: `/explore?floorFail=1` forces a soft-fail after WebGL comes up. */
export function floorFailSimRequested(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("floorFail") === "1";
  } catch {
    return false;
  }
}

type BoundaryProps = {
  resetKey: number;
  onFail: (failure: FloorBootFailure) => void;
  children: ReactNode;
};

type BoundaryState = { broken: boolean };

/** Catches R3F/React render errors during Floor boot so the tab stays alive. */
export class FloorBootBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { broken: false };
  private reporting = false;

  static getDerivedStateFromError(): BoundaryState {
    return { broken: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    if (this.reporting) return;
    this.reporting = true;
    this.props.onFail(classifyFloorBootError(error));
  }

  componentDidUpdate(prev: BoundaryProps) {
    if (prev.resetKey !== this.props.resetKey && this.state.broken) {
      this.reporting = false;
      this.setState({ broken: false });
    }
  }

  render() {
    if (this.state.broken) return null;
    return this.props.children;
  }
}

/** Listens for WebGL context loss + optional `?floorFail=1` simulation (inside Canvas). */
export function FloorGlGuard({ onFail }: { onFail: (failure: FloorBootFailure) => void }) {
  const gl = useThree((s) => s.gl);
  const onFailRef = useRef(onFail);
  onFailRef.current = onFail;
  const fired = useRef(false);

  const report = useCallback((failure: FloorBootFailure) => {
    if (fired.current) return;
    fired.current = true;
    onFailRef.current(failure);
  }, []);

  useEffect(() => {
    fired.current = false;
    const canvas = gl.domElement;
    const onLost = (event: Event) => {
      event.preventDefault();
      report({ reason: "WebGL context lost while opening The Floor", source: "webgl" });
    };
    canvas.addEventListener("webglcontextlost", onLost, false);

    let simTimer = 0;
    if (floorFailSimRequested()) {
      simTimer = window.setTimeout(() => {
        report({
          reason: "Simulated Floor boot failure (?floorFail=1)",
          source: "unknown",
        });
      }, 120);
    }

    return () => {
      canvas.removeEventListener("webglcontextlost", onLost, false);
      if (simTimer) window.clearTimeout(simTimer);
    };
  }, [gl, report]);

  return null;
}

/** Captures escaped GLB/decode rejections while Floor 3D is mounting. */
export function useFloorRejectionGuard(
  active: boolean,
  onFail: (failure: FloorBootFailure) => void,
) {
  const onFailRef = useRef(onFail);
  onFailRef.current = onFail;

  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    const onRejection = (event: PromiseRejectionEvent) => {
      if (!shouldCaptureFloorRejection(event.reason)) return;
      event.preventDefault();
      onFailRef.current(classifyFloorBootError(event.reason));
    };
    const onError = (event: ErrorEvent) => {
      const msg = event.message || String(event.error ?? "");
      if (!ASSET_RE.test(msg)) return;
      event.preventDefault();
      onFailRef.current(classifyFloorBootError(event.error ?? msg));
    };

    window.addEventListener("unhandledrejection", onRejection);
    window.addEventListener("error", onError);
    return () => {
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("error", onError);
    };
  }, [active]);
}

export function FloorSoftFailPanel({
  failure,
  level,
  onRetry,
  onRetryLow,
  onFlat,
}: {
  failure: FloorBootFailure | null;
  level: Quality;
  onRetry: () => void;
  onRetryLow: () => void;
  onFlat: () => void;
}) {
  const detail =
    failure?.reason?.trim() ||
    "The 3D Floor hit a graphics or memory limit in this browser session.";

  return (
    <div className="absolute inset-0 z-30 grid place-items-center overflow-y-auto bg-bg/92 p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-5 shadow-xl sm:p-6">
        <p className="text-xs font-medium tracking-[0.16em] text-gold uppercase">Floor soft-fail</p>
        <h1 className="mt-2 font-display text-2xl font-medium">The Floor couldn&apos;t stay open</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Your tab is fine — we stopped the 3D boot instead of letting it take the session down.
          Retry, drop to Low quality (same tiers as the rest of the city), or walk the 2D Floor map.
        </p>
        <p className="mt-3 rounded-lg border border-border bg-bg/80 px-3 py-2 font-mono text-[11px] leading-relaxed text-muted break-words">
          {failure?.source ? `[${failure.source}] ` : null}
          {detail}
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button type="button" className="min-h-11 flex-1" onClick={onRetry}>
            Retry
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="min-h-11 flex-1"
            onClick={onRetryLow}
            disabled={level === "low"}
          >
            {level === "low" ? "Already on Low" : "Retry on Low"}
          </Button>
          <Button type="button" variant="secondary" className="min-h-11 flex-1" onClick={onFlat}>
            Explore in 2D
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild type="button" variant="ghost" className="min-h-10">
            <Link to="/">Back to city</Link>
          </Button>
          <Button asChild type="button" variant="ghost" className="min-h-10">
            <Link to="/worlds" search={{ district: "forum" }}>
              City plates
            </Link>
          </Button>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Critic check: Enter The Floor should never kill the tab. After a fault you should always see
          Retry / Low / 2D. Simulate with <span className="font-mono text-fg/80">?floorFail=1</span>.
        </p>
      </div>
    </div>
  );
}

export function WorldPreviewSoftFail({
  onRetry,
  onRetryLow,
  level,
}: {
  onRetry: () => void;
  onRetryLow: () => void;
  level: Quality;
}) {
  return (
    <div className="grid h-full min-h-[16rem] place-items-center bg-[#0b1520] px-4 py-8">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface/95 p-5 text-center">
        <p className="text-xs font-medium tracking-[0.16em] text-gold uppercase">3D preview paused</p>
        <p className="mt-2 text-sm text-muted">
          This orbit view failed to boot. Retry, or switch to Low quality and try again.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button type="button" className="min-h-10 flex-1" onClick={onRetry}>
            Retry
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="min-h-10 flex-1"
            onClick={onRetryLow}
            disabled={level === "low"}
          >
            {level === "low" ? "Already on Low" : "Retry on Low"}
          </Button>
        </div>
      </div>
    </div>
  );
}
