import { mkdirSync, existsSync, statSync, unlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  dedup,
  prune,
  simplify,
  weld,
  quantize,
} from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer/simplifier";
import sharp from "sharp";
import {
  createGltfIO,
  triangleCount,
  writeCompressed,
  writeLod1,
} from "./lib/gltf-opt-shared.mjs";

const src = resolve(process.argv[2] ?? "");
const dest = resolve(process.argv[3] ?? "");
const ratio = Number(process.argv[4] ?? "0.06");
const mid = resolve("tmp", `${Date.now()}-canyon-unquant.glb`);
/** Optional: draco (default) | meshopt */
const method = process.argv[5] === "meshopt" ? "meshopt" : "draco";
const withLod = process.argv.includes("--lod");

if (!src || !dest || !existsSync(src)) {
  console.error("usage: opt-canyon-glb.mjs <src.glb> <dest.glb> [ratio] [draco|meshopt] [--lod]");
  process.exit(1);
}

await MeshoptSimplifier.ready;
const io = await createGltfIO();

console.log("reading", src, (statSync(src).size / 1e6).toFixed(2), "MB");
const doc = await io.read(src);
console.log("triangles in", triangleCount(doc), "ratio", ratio, "compress", method);

for (const texture of doc.getRoot().listTextures()) {
  const bytes = texture.getImage();
  if (!bytes) continue;
  const mime = texture.getMimeType() || "";
  const isColor = /jpeg|jpg|png|webp/i.test(mime);
  if (!isColor) continue;
  const out = await sharp(bytes)
    .rotate()
    .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 72 })
    .toBuffer();
  texture.setImage(out);
  texture.setMimeType("image/webp");
  console.log("texture", texture.getName() || "anon", bytes.length, "->", out.length);
}

await doc.transform(
  weld(),
  simplify({
    simplifier: MeshoptSimplifier,
    ratio,
    error: 0.02,
  }),
  prune(),
  dedup(),
);

const after = triangleCount(doc);
mkdirSync(dirname(mid), { recursive: true });
mkdirSync(dirname(dest), { recursive: true });
await io.write(mid, doc);
console.log("triangles after simplify", after);
console.log("mid", mid, (statSync(mid).size / 1e6).toFixed(2), "MB");

console.log("quantize + compress pass");
const qdoc = await io.read(mid);
await qdoc.transform(
  quantize({
    quantizePosition: 14,
    quantizeNormal: 10,
    quantizeTexcoord: 12,
  }),
);

if (withLod) {
  await writeLod1(io, qdoc, dest, { method, ratio: 0.35, error: 1 });
}
await writeCompressed(io, qdoc, dest, { method });
unlinkSync(mid);
console.log("triangles out", triangleCount(qdoc));
console.log("wrote", dest, (statSync(dest).size / 1e6).toFixed(2), "MB");
