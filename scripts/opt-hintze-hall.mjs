import { mkdirSync, existsSync, statSync, unlinkSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { dedup, prune, simplify, weld, quantize } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer/simplifier";
import {
  createGltfIO,
  triangleCount,
  writeCompressed,
} from "./lib/gltf-opt-shared.mjs";

const src = resolve(process.argv[2] ?? "tmp/hintze-hall.source.glb");
const dest = resolve(process.argv[3] ?? "public/models/hintze-hall.glb");
const ratio = Number(process.argv[4] ?? "0.18");
const texSize = Number(process.argv[5] ?? "1024");
const error = Number(process.argv[6] ?? "0.012");
const mid = resolve("tmp", "hintze-hall-unquant.glb");
const method = process.argv.includes("meshopt") ? "meshopt" : "draco";

if (!existsSync(src)) {
  console.error("missing source", src);
  process.exit(1);
}

const io = await createGltfIO();
console.log("reading", src, (statSync(src).size / 1e6).toFixed(2), "MB");
const doc = await io.read(src);
console.log("triangles in", triangleCount(doc), "ratio", ratio, "error", error, "tex", texSize, "compress", method);

const webpPath = resolve("tmp/hintze-tex.webp");
if (!existsSync(webpPath)) {
  console.error("missing", webpPath, "— run scripts/tex-hintze.mjs first");
  process.exit(1);
}
const webp = readFileSync(webpPath);
for (const texture of doc.getRoot().listTextures()) {
  const bytes = texture.getImage();
  if (!bytes) continue;
  const mime = texture.getMimeType() || "";
  if (!/jpeg|jpg|png|webp/i.test(mime)) continue;
  texture.setImage(webp);
  texture.setMimeType("image/webp");
  console.log("texture", texture.getName() || "anon", bytes.length, "->", webp.length, "texSize hint", texSize);
}

for (const anim of doc.getRoot().listAnimations()) anim.dispose();

await MeshoptSimplifier.ready;

await doc.transform(
  weld(),
  simplify({
    simplifier: MeshoptSimplifier,
    ratio,
    error,
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
await writeCompressed(io, qdoc, dest, { method });
try {
  unlinkSync(mid);
} catch {
  /* keep mid if delete fails */
}
console.log("triangles out", triangleCount(qdoc));
console.log("wrote", dest, (statSync(dest).size / 1e6).toFixed(2), "MB");
