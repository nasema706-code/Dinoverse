/**
 * Shared helpers for scripts/opt-*.mjs — Meshopt + Draco compression and LOD1.
 * Keep opt scripts as the single pipeline; do not add a parallel compress tool.
 */
import { mkdirSync, statSync } from "node:fs";
import { dirname } from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  cloneDocument,
  compactPrimitive,
  draco,
  getGLPrimitiveCount,
  meshopt,
  prune,
  simplify,
  weld,
} from "@gltf-transform/functions";
import draco3d from "draco3d";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";
import { MeshoptSimplifier } from "meshoptimizer/simplifier";

/** Default: Draco for static scene props (best download size). Meshopt for animated / streaming. */
export const DEFAULT_COMPRESS = "draco";

export function triangleCount(document) {
  let n = 0;
  for (const mesh of document.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) n += getGLPrimitiveCount(prim);
  }
  return n;
}

export function mb(bytes) {
  return (bytes / 1e6).toFixed(2);
}

/**
 * NodeIO with Meshopt + Draco encoder/decoder registered so opt scripts can
 * read already-compressed GLBs and write either codec.
 */
export async function createGltfIO() {
  await MeshoptEncoder.ready;
  await MeshoptDecoder.ready;
  await MeshoptSimplifier.ready;
  const encoder = await draco3d.createEncoderModule();
  const decoder = await draco3d.createDecoderModule();
  return new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    "meshopt.encoder": MeshoptEncoder,
    "meshopt.decoder": MeshoptDecoder,
    "draco3d.encoder": encoder,
    "draco3d.decoder": decoder,
  });
}

/** Drop prior Meshopt/Draco extensions so we can re-encode cleanly. */
export function stripCompressionExtensions(document) {
  for (const ext of [...document.getRoot().listExtensionsUsed()]) {
    const name = ext.extensionName;
    if (name === "EXT_meshopt_compression" || name === "KHR_draco_mesh_compression") {
      ext.dispose();
    }
  }
}

/**
 * Apply geometry compression. Prefer Draco for opaque static props; Meshopt when
 * you need faster decode / animation-friendly buffers (characters).
 */
export async function applyCompression(document, method = DEFAULT_COMPRESS) {
  stripCompressionExtensions(document);
  if (method === "meshopt") {
    await document.transform(meshopt({ encoder: MeshoptEncoder, level: "medium" }));
    return;
  }
  if (method === "draco") {
    await document.transform(draco({ method: "edgebreaker" }));
    return;
  }
  throw new Error(`unknown compression method: ${method}`);
}

/**
 * Write a compressed GLB. Returns { bytes, tris }.
 */
export async function writeCompressed(io, document, dest, { method = DEFAULT_COMPRESS } = {}) {
  await applyCompression(document, method);
  mkdirSync(dirname(dest), { recursive: true });
  await io.write(dest, document);
  const bytes = statSync(dest).size;
  const tris = triangleCount(document);
  console.log("compress", method, dest, mb(bytes), "MB", `tris=${Math.round(tris)}`);
  return { bytes, tris, method };
}

/**
 * Write a far LOD sibling (`foo.glb` → `foo-lod1.glb`) from a decoded/quantized doc.
 * Further simplifies when the topology allows, then compresses with the same method.
 * Returns null if the LOD would not meaningfully reduce triangles (<15% cut).
 */
export async function writeLod1(
  io,
  sourceDocument,
  fullDest,
  {
    method = DEFAULT_COMPRESS,
    ratio = 0.35,
    error = 1,
    minReduction = 0.15,
  } = {},
) {
  const lodPath = fullDest.replace(/\.glb$/i, "-lod1.glb");
  const lodDoc = cloneDocument(sourceDocument);
  stripCompressionExtensions(lodDoc);
  const before = triangleCount(lodDoc);
  await lodDoc.transform(
    weld(),
    simplify({
      simplifier: MeshoptSimplifier,
      ratio,
      error,
    }),
    prune(),
  );
  const after = triangleCount(lodDoc);
  const reduction = before > 0 ? 1 - after / before : 0;
  if (reduction < minReduction) {
    console.log(
      "lod1 skip",
      lodPath,
      `(only ${(reduction * 100).toFixed(0)}% tris cut; topology floor)`,
    );
    return null;
  }
  await applyCompression(lodDoc, method);
  mkdirSync(dirname(lodPath), { recursive: true });
  await io.write(lodPath, lodDoc);
  console.log(
    "lod1",
    lodPath,
    mb(statSync(lodPath).size),
    "MB",
    `tris=${Math.round(after)}`,
    `(−${(reduction * 100).toFixed(0)}%)`,
  );
  return { path: lodPath, bytes: statSync(lodPath).size, tris: after };
}

/**
 * Simplify every primitive with meshopt's Permissive mode, which may collapse
 * across UV/normal seams. Plain `simplify()` stalls on scanned props whose UV
 * islands lock most vertices (skull-gate stopped at ~79% of its triangles).
 */
export async function simplifyAcrossSeams(document, { ratio, error }) {
  await MeshoptSimplifier.ready;
  const el = [0, 0, 0];
  for (const mesh of document.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute("POSITION");
      const idx = prim.getIndices();
      if (!pos || !idx) continue;
      const n = pos.getCount();
      const positions = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        pos.getElement(i, el);
        positions.set(el, i * 3);
      }
      const indices = new Uint32Array(idx.getArray());
      const target = Math.floor((indices.length / 3) * ratio) * 3;
      const [out] = MeshoptSimplifier.simplify(indices, positions, 3, target, error, ["Permissive", "Prune"]);
      idx.setArray(out.slice());
      compactPrimitive(prim);
    }
  }
  await document.transform(prune());
  return triangleCount(document);
}
