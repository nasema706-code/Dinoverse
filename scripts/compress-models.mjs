#!/usr/bin/env node
/**
 * Meshopt-compress scene GLBs for runtime decode via drei's useGLTF
 * (MeshoptDecoder + optional Draco are enabled in src/game/use-game-gltf.ts).
 *
 * Does not re-simplify or re-encode textures — those passes live in the
 * existing opt-*.mjs scripts. This script only adds EXT_meshopt_compression
 * (and optional LOD1 siblings) so download size drops without changing art.
 *
 * Usage:
 *   node scripts/compress-models.mjs
 *   node scripts/compress-models.mjs --lod            # also write -lod1.glb siblings
 *   node scripts/compress-models.mjs public/models/skull-gate.glb
 *   node scripts/compress-models.mjs --lod public/models/bone-spire.glb
 *
 * Note: Vite ignores public/*.glb for HMR watch — restart `npm run dev` after
 * adding brand-new model filenames so they are served.
 */
import { copyFileSync, existsSync, mkdirSync, renameSync, statSync, unlinkSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { getGLPrimitiveCount, meshopt, prune, simplify, weld } from "@gltf-transform/functions";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";
import { MeshoptSimplifier } from "meshoptimizer/simplifier";

const ROOT = resolve(import.meta.dirname, "..");
const DEFAULT_TARGETS = [
  "public/models/skull-gate.glb",
  "public/models/bone-spire.glb",
  "public/models/bone-bridge.glb",
  "public/models/sepia-cutout.glb",
  "public/models/hintze-hall.glb",
  "public/models/helicopter.glb",
];

const args = process.argv.slice(2);
const withLod = args.includes("--lod");
const paths = args.filter((a) => a !== "--lod");
const targets = (paths.length ? paths : DEFAULT_TARGETS).map((p) => resolve(ROOT, p));

function triangleCount(document) {
  let n = 0;
  for (const mesh of document.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) n += getGLPrimitiveCount(prim);
  }
  return n;
}

function alreadyMeshopt(document) {
  return document
    .getRoot()
    .listExtensionsUsed()
    .some((ext) => ext.extensionName === "EXT_meshopt_compression");
}

function mb(bytes) {
  return (bytes / 1e6).toFixed(2);
}

await MeshoptEncoder.ready;
await MeshoptDecoder.ready;
await MeshoptSimplifier.ready;

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "meshopt.encoder": MeshoptEncoder,
    "meshopt.decoder": MeshoptDecoder,
  });

const summary = [];

for (const src of targets) {
  if (!existsSync(src)) {
    console.error("missing", src);
    process.exitCode = 1;
    continue;
  }

  const before = statSync(src).size;
  const doc = await io.read(src);
  const trisIn = triangleCount(doc);

  if (alreadyMeshopt(doc)) {
    console.log("skip (already meshopt)", basename(src), mb(before), "MB");
    summary.push({ file: basename(src), before, after: before, tris: trisIn, skipped: true });
  } else {
    const tmp = resolve(dirname(src), `.${basename(src)}.meshopt.tmp.glb`);
    await doc.transform(meshopt({ encoder: MeshoptEncoder, level: "medium" }));
    mkdirSync(dirname(tmp), { recursive: true });
    await io.write(tmp, doc);
    const after = statSync(tmp).size;
    // Atomic-ish replace so a half-written file is never left as the public asset.
    const bak = `${src}.bak`;
    copyFileSync(src, bak);
    renameSync(tmp, src);
    unlinkSync(bak);
    console.log(
      "meshopt",
      basename(src),
      mb(before),
      "->",
      mb(after),
      "MB",
      `(${((1 - after / before) * 100).toFixed(1)}% smaller, tris=${Math.round(trisIn)})`,
    );
    summary.push({ file: basename(src), before, after, tris: trisIn, skipped: false });
  }

  if (!withLod) continue;

  const lodPath = src.replace(/\.glb$/i, "-lod1.glb");
  const lodDoc = await io.read(src);
  // Decode meshopt first by reading through registered decoder, then simplify.
  await lodDoc.transform(
    weld(),
    simplify({
      simplifier: MeshoptSimplifier,
      // Some Meshy props already sit on a topology floor (~80%+ of tris remain).
      // Use error=1 so ratio can actually land when further reduction is possible.
      ratio: 0.35,
      error: 1,
    }),
    prune(),
    meshopt({ encoder: MeshoptEncoder, level: "medium" }),
  );
  await io.write(lodPath, lodDoc);
  const lodTris = triangleCount(lodDoc);
  console.log(
    "lod1",
    basename(lodPath),
    mb(statSync(lodPath).size),
    "MB",
    `tris=${Math.round(lodTris)}`,
  );
  summary.push({
    file: basename(lodPath),
    before: 0,
    after: statSync(lodPath).size,
    tris: lodTris,
    skipped: false,
    lod: true,
  });
}

console.log("\n--- summary ---");
for (const row of summary) {
  if (row.lod) {
    console.log(`LOD  ${row.file.padEnd(22)} ${mb(row.after).padStart(6)} MB  tris=${Math.round(row.tris)}`);
  } else if (row.skipped) {
    console.log(`SKIP ${row.file.padEnd(22)} ${mb(row.before).padStart(6)} MB`);
  } else {
    console.log(
      `OK   ${row.file.padEnd(22)} ${mb(row.before).padStart(6)} -> ${mb(row.after).padStart(6)} MB`,
    );
  }
}
