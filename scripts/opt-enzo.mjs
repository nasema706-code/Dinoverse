import { mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { dedup } from "@gltf-transform/functions";
import sharp from "sharp";
import { createGltfIO, writeCompressed } from "./lib/gltf-opt-shared.mjs";

const src = resolve(process.argv[2] ?? "tmp/enzo.source.glb");
const dest = resolve(process.argv[3] ?? "public/models/enzo.glb");
const method = process.argv.includes("meshopt") ? "meshopt" : "draco";

if (!existsSync(src)) {
  console.error("missing source", src);
  process.exit(1);
}

const io = await createGltfIO();
const doc = await io.read(src);
for (const texture of doc.getRoot().listTextures()) {
  const bytes = texture.getImage();
  if (!bytes) continue;
  const out = await sharp(bytes)
    .rotate()
    .toColorspace("srgb")
    .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 72 })
    .toBuffer();
  texture.setImage(out);
  texture.setMimeType("image/webp");
}

await doc.transform(dedup());
mkdirSync(dirname(dest), { recursive: true });
await writeCompressed(io, doc, dest, { method });
console.log("wrote", dest);
