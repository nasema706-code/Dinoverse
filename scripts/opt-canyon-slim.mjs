/**
 * Re-slim a shipped canyon prop into a near model + a far LOD1 with smaller textures.
 * Works from an already-optimized GLB (no raw source needed), so run it on the
 * previous build of the file, not on its own output.
 *
 *   node scripts/opt-canyon-slim.mjs <src.glb> <dest.glb> [nearRatio] [farRatio]
 *   git show HEAD~1:public/models/skull-gate.glb > tmp/skull-gate.prev.glb
 *   node scripts/opt-canyon-slim.mjs tmp/skull-gate.prev.glb public/models/skull-gate.glb 0.22 0.06
 */
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { cloneDocument } from "@gltf-transform/functions";
import sharp from "sharp";
import {
  createGltfIO,
  mb,
  simplifyAcrossSeams,
  triangleCount,
  writeCompressed,
} from "./lib/gltf-opt-shared.mjs";

const src = resolve(process.argv[2] ?? "");
const dest = resolve(process.argv[3] ?? "");
const nearRatio = Number(process.argv[4] ?? "0.22");
const farRatio = Number(process.argv[5] ?? "0.06");
const FAR_TEXTURE = 512;

if (!process.argv[2] || !process.argv[3] || !existsSync(src)) {
  console.error("usage: opt-canyon-slim.mjs <src.glb> <dest.glb> [nearRatio] [farRatio]");
  process.exit(1);
}

async function shrinkTextures(document, size) {
  for (const texture of document.getRoot().listTextures()) {
    const bytes = texture.getImage();
    if (!bytes) continue;
    const out = await sharp(bytes)
      .resize(size, size, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 70 })
      .toBuffer();
    texture.setImage(out);
    texture.setMimeType("image/webp");
  }
}

const io = await createGltfIO();
console.log("reading", src, mb(statSync(src).size), "MB");
const doc = await io.read(src);
const before = triangleCount(doc);

const far = cloneDocument(doc);

const nearTris = await simplifyAcrossSeams(doc, { ratio: nearRatio, error: 0.02 });
console.log("near tris", before, "->", nearTris);
await writeCompressed(io, doc, dest);

const farTris = await simplifyAcrossSeams(far, { ratio: farRatio, error: 0.08 });
await shrinkTextures(far, FAR_TEXTURE);
console.log("far tris", before, "->", farTris, `textures ≤${FAR_TEXTURE}px`);
await writeCompressed(io, far, dest.replace(/\.glb$/i, "-lod1.glb"));
