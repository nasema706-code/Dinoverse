import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup } from "@gltf-transform/functions";
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const src = resolve("tmp/enzo.source.glb");
const dest = resolve("public/models/enzo.glb");

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
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
await io.write(dest, doc);
console.log("wrote", dest);
