# The Dinoverse · $DINOVERSE

Solana meme-coin site + first-person 3D city. Rex Volt is Floor Chief. Four districts: **The Floor**, **Dino Mart**, **The Mall**, **The Arena**.

## Open in Cursor

1. Unzip this folder.
2. In Cursor: **File → Open Folder** and pick `dinoverse`.
3. In the terminal:

```bash
npm install
npm run dev
```

4. Open [http://localhost:8080](http://localhost:8080).

Needs **Node 22+**.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on `0.0.0.0:8080` |
| `npm run build` | Production build (Vercel / Nitro) |
| `npm run typecheck` | TypeScript |
| `npm run preview` | Serve the production build |

### Regenerating optimized GLBs

Heavy scene props go through the existing `scripts/opt-*.mjs` pipeline (`@gltf-transform` simplify + WebP + quantize), now ending in **Draco** compression by default (pass `meshopt` for Meshopt instead). Shared helpers: `scripts/lib/gltf-opt-shared.mjs`. Runtime decode: `src/game/use-game-gltf.ts` (Draco + Meshopt both on).

```bash
# Canyon props (skull-gate / sepia-cutout) — needs source GLB:
node scripts/opt-canyon-glb.mjs tmp/skull-gate.source.glb public/models/skull-gate.glb 0.06 draco --lod

node scripts/opt-bone-bridge.mjs tmp/bone-bridge.source.glb
node scripts/opt-bone-spire.mjs tmp/bone-spire.source.glb
node scripts/opt-hintze-hall.mjs   # needs tmp/hintze-tex.webp from tex-hintze.mjs
node scripts/opt-heli.mjs
```

LOD1 siblings (`*-lod1.glb`) are written when further simplification cuts ≥15% triangles. Bump `?v=` on model URLs after replacing binaries. Restart `npm run dev` after adding brand-new filenames under `public/models/`.

## Where things live

```
src/routes/          Home, Worlds, Explore, Crew, Login
src/game/            3D explorer (R3F + three)
src/game/floor/      The Floor — desks, windows, sit/use
src/lib/characters.ts  Rex, Vex, Tria, Ptera
src/lib/worlds.ts      District copy, inspect lines
src/lib/store.ts       Character + shards (zustand, persisted)
public/assets/         Drop new images and videos here
public/life/           City plates (your photos)
public/characters/     Guide portraits
attachments/           Original uploads
```

## Play it

- **Explore** — WASD walk, mouse look, **E** sit / use / talk
- **Worlds** — orbit each district, then step inside
- Pick a guide on the home page; voice and HUD follow them

Ticker is **$DINOVERSE**.
