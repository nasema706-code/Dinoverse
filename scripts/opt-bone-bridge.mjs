import { mkdirSync, existsSync, statSync, unlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, simplify, weld, getGLPrimitiveCount, quantize } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer/simplifier";
import sharp from "sharp";

const srcArg = process.argv[2];
const src = resolve(
  srcArg ?? "tmp/bone-bridge.source.glb",
);
const dest = resolve("public/models/bone-bridge.glb");
const mid = resolve("tmp/bone-bridge.unquant.glb");

if (!existsSync(src)) {
  console.error("missing source", src);
  process.exit(1);
}

function triangleCount(document) {
  let n = 0;
  for (const mesh of document.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) n += getGLPrimitiveCount(prim);
  }
  return n;
}

await MeshoptSimplifier.ready;

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
console.log("reading", src);
const doc = await io.read(src);
console.log("triangles in", triangleCount(doc));

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
    ratio: 0.07,
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

console.log("quantize pass");
const qdoc = await io.read(mid);
await qdoc.transform(
  quantize({
    quantizePosition: 14,
    quantizeNormal: 10,
    quantizeTexcoord: 12,
  }),
);
await io.write(dest, qdoc);
unlinkSync(mid);
console.log("triangles out", triangleCount(qdoc));
console.log("wrote", dest, (statSync(dest).size / 1e6).toFixed(2), "MB");
