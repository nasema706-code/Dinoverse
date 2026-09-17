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
| `npm run compress:models` | Meshopt-compress heavy GLBs + write `.lod1.glb` siblings |

### Regenerating compressed GLBs

Scene props are Meshopt-compressed (`EXT_meshopt_compression`) for smaller downloads. Runtime decode is wired through `src/game/use-game-gltf.ts` (Draco + Meshopt on for every `useGLTF`).

1. If you re-export a source GLB, run the matching `scripts/opt-*.mjs` simplify/WebP pass first (needs original in `tmp/`).
2. Then compress (and refresh LOD1s):

```bash
npm run compress:models
# or one file:
node scripts/compress-models.mjs --lod public/models/skull-gate.glb
```

Bump the `?v=` query on model URLs after replacing binaries so browsers refetch.

## Where things live

```
src/routes/          Home, Worlds, Explore, Crew, Login
src/game/            3D explorer (R3F + three)
src/game/floor/      The Floor — desks, windows, sit/use
src/lib/characters.ts  Rex, Vex, Tria, Ptera
src/lib/worlds.ts      District copy, inspect lines
src/lib/store.ts       Character + shards (zustand, persisted)
public/life/           City plates (your photos)
public/characters/     Guide portraits
attachments/           Original uploads
```

## Play it

- **Explore** — WASD walk, mouse look, **E** sit / use / talk
- **Worlds** — orbit each district, then step inside
- Pick a guide on the home page; voice and HUD follow them

Ticker is **$DINOVERSE**.
