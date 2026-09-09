import { existsSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const src = resolve(process.argv[2] ?? "tmp/hintze-tex.jpg");
const dest = resolve(process.argv[3] ?? "tmp/hintze-tex.webp");
const texSize = Number(process.argv[4] ?? "2048");

if (!existsSync(src)) {
  console.error("missing", src);
  process.exit(1);
}

const bytes = readFileSync(src);
const out = await sharp(bytes, { failOn: "none" })
  .resize(texSize, texSize, { fit: "inside", withoutEnlargement: true })
  .webp({ quality: 74 })
  .toBuffer();
writeFileSync(dest, out);
console.log("wrote", dest, (statSync(dest).size / 1e6).toFixed(2), "MB");
