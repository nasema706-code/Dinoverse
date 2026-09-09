import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { getBounds, getGLPrimitiveCount } from "@gltf-transform/functions";

const src = resolve(process.argv[2] ?? "tmp/hintze-hall.source.glb");
if (!existsSync(src)) {
  console.error("missing", src);
  process.exit(1);
}

function triangleCount(document) {
  let n = 0;
  for (const mesh of document.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) n += getGLPrimitiveCount(prim);
  }
  return n;
}

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
console.log("reading", src, (statSync(src).size / 1e6).toFixed(2), "MB");
const doc = await io.read(src);
const root = doc.getRoot();
const scene = root.getDefaultScene() ?? root.listScenes()[0];
console.log("generator", root.getAsset().generator || "(none)");
console.log("scenes", root.listScenes().length, "nodes", root.listNodes().length, "meshes", root.listMeshes().length);
console.log("textures", root.listTextures().length, "materials", root.listMaterials().length);
console.log("animations", root.listAnimations().length);
console.log("triangles", triangleCount(doc));

if (scene) {
  const bounds = getBounds(scene);
  const size = {
    x: bounds.max[0] - bounds.min[0],
    y: bounds.max[1] - bounds.min[1],
    z: bounds.max[2] - bounds.min[2],
  };
  console.log("bounds min", bounds.min.map((n) => n.toFixed(3)).join(" "));
  console.log("bounds max", bounds.max.map((n) => n.toFixed(3)).join(" "));
  console.log("size", `x=${size.x.toFixed(3)} y=${size.y.toFixed(3)} z=${size.z.toFixed(3)}`);
  const dims = [size.x, size.y, size.z].sort((a, b) => b - a);
  console.log("longest axis", dims[0].toFixed(3), "shortest", dims[2].toFixed(3));
  const likelyUp = size.y >= size.x && size.y >= size.z ? "Y" : size.z >= size.x && size.z >= size.y ? "Z (tall)" : "X (tall)";
  console.log("tallest dimension", size.y >= size.z && size.y >= size.x ? "Y (Y-up likely)" : size.z >= size.y && size.z >= size.x ? "Z (Z-up possible)" : "X");
  console.log("ground guess", `minY=${bounds.min[1].toFixed(3)} minZ=${bounds.min[2].toFixed(3)}`);
  void likelyUp;
}

for (const texture of root.listTextures()) {
  const bytes = texture.getImage();
  console.log(
    "tex",
    texture.getName() || "anon",
    texture.getMimeType(),
    bytes ? `${(bytes.length / 1e6).toFixed(2)}MB` : "empty",
    texture.getSize()?.join("x") ?? "?",
  );
}

for (const node of root.listNodes().slice(0, 24)) {
  const t = node.getTranslation();
  const r = node.getRotation();
  const s = node.getScale();
  console.log(
    "node",
    node.getName() || "(unnamed)",
    "t",
    t.map((n) => n.toFixed(3)).join(","),
    "r",
    r.map((n) => n.toFixed(3)).join(","),
    "s",
    s.map((n) => n.toFixed(3)).join(","),
    node.getMesh() ? `mesh=${node.getMesh().getName() || "mesh"}` : "",
  );
}
