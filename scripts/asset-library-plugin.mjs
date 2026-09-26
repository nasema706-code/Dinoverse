import { mkdirSync, watch } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";

const IMAGE = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif"]);
const VIDEO = new Set([".mp4", ".webm", ".mov"]);
const VIRTUAL_ID = "virtual:dinoverse-assets";
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

async function scan(dir, base = dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await scan(abs, base)));
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    const kind = IMAGE.has(ext) ? "image" : VIDEO.has(ext) ? "video" : null;
    if (!kind) continue;
    const rel = path.relative(base, abs).split(path.sep).join("/");
    const src = `/assets/${rel.split("/").map(encodeURIComponent).join("/")}`;
    files.push({ name: rel, src, kind });
  }
  files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  return files;
}

/** Lists images and videos dropped in public/assets for the library page. */
export function assetLibraryPlugin() {
  let root = "";
  let timer;
  return {
    name: "dinoverse-assets",
    configResolved(config) {
      root = path.resolve(config.root, "public/assets");
      mkdirSync(root, { recursive: true });
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    async load(id) {
      if (id !== RESOLVED_ID) return null;
      const files = await scan(root);
      return `export default ${JSON.stringify(files)};`;
    },
    configureServer(server) {
      let watcher;
      try {
        watcher = watch(root, { recursive: true }, () => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
            if (mod) server.moduleGraph.invalidateModule(mod);
            server.ws.send({ type: "full-reload" });
          }, 400);
        });
      } catch (err) {
        server.config.logger.warn(`[dinoverse-assets] watch failed: ${err}`);
      }
      server.httpServer?.once("close", () => watcher?.close());
    },
  };
}
