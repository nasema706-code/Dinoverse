import { mkdirSync, existsSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { dedup, prune, simplify, weld } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer/simplifier";
import sharp from "sharp";
import {
  createGltfIO,
  triangleCount,
  writeCompressed,
} from "./lib/gltf-opt-shared.mjs";

const src = resolve(process.argv[2] ?? "tmp/helicopter.source.glb");
const dest = resolve(process.argv[3] ?? "public/models/helicopter.glb");
const ratio = Number(process.argv[4] ?? "0.09");
const method = process.argv.includes("meshopt") ? "meshopt" : "draco";

if (!existsSync(src)) {
  console.error("missing source", src);
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

// Drop the baked rotor clip — we spin the hub nodes in the Floor component.
for (const anim of doc.getRoot().listAnimations()) anim.dispose();

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
mkdirSync(dirname(dest), { recursive: true });
await writeCompressed(io, doc, dest, { method });
console.log("triangles out", after);
console.log("wrote", dest, (statSync(dest).size / 1e6).toFixed(2), "MB");
