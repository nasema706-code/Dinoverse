import test from "node:test";
import assert from "node:assert/strict";

// Lightweight mirrors of classify / capture helpers (keep in sync with floor-soft-fail.tsx)
const ASSET_RE =
  /glb|gltf|draco|meshopt|loadingmanager|failed to load|decode|arraybuffer|out of memory|oom|allocation|webgl|three/i;

function classifyFloorBootError(err) {
  const message =
    err instanceof Error
      ? err.message || err.name || "Unknown Floor boot error"
      : typeof err === "string"
        ? err
        : "Unknown Floor boot error";
  const source = /webgl|context/i.test(message)
    ? "webgl"
    : ASSET_RE.test(message)
      ? "asset"
      : "unknown";
  return { reason: message.slice(0, 240), source };
}

function shouldCaptureFloorRejection(reason) {
  if (!reason) return false;
  if (reason instanceof Error) return ASSET_RE.test(`${reason.name} ${reason.message}`);
  if (typeof reason === "string") return ASSET_RE.test(reason);
  try {
    return ASSET_RE.test(String(reason));
  } catch {
    return false;
  }
}

test("classifies webgl context loss", () => {
  const f = classifyFloorBootError(new Error("WebGL context lost"));
  assert.equal(f.source, "webgl");
});

test("classifies glb decode as asset", () => {
  const f = classifyFloorBootError(new Error("Failed to load GLB / decode arraybuffer"));
  assert.equal(f.source, "asset");
});

test("captures glb rejections and ignores unrelated", () => {
  assert.equal(shouldCaptureFloorRejection(new Error("THREE.GLTFLoader: Couldn't load")), true);
  assert.equal(shouldCaptureFloorRejection(new Error("Network offline for analytics")), false);
});
