# Paradise Floor environment (Earth-Like Worlds)

Art-direction pass for **The Floor** exterior plate — sky, horizon surround, mist, and warm lighting. Walkable HQ / atrium / soft-fail / shards / characters are unchanged.

## Visual target

- Category: temperate / paradise terrestrial
- Palette: emerald green, warm gold sunlight (`#ffdfad`), misty teal (`#7eb8b0`), cream moon (`#f3ead4`)
- Mood: lush valleys, terraced / floating forest masses, golden-hour god-rays, giant pale moon

Official still (agent / art ref): `public/worlds/forum/paradise-plate-ref.png`

## What changed (code)

| Surface | File | Notes |
| --- | --- | --- |
| Sky + HDRI | `src/game/floor/env.tsx` | Mid/high: `VisionSkyDome` on `/worlds/forum/paradise-sky.jpg`; low: drei `<Sky>` + `PaleMoon`. Environment preset `park` (mid/high) |
| God-rays | `ParadiseGodRays` in `env.tsx` | Soft planes; **skipped on `low`** quality |
| Lights + fog | `src/game/floor/kit.tsx` `Lights` | Teal fog `#7eb8b0`; warm sun + cool mist fill; fog near/far still derived from `quality.ts` |
| Horizon plate | `src/game/floor/cityscape.tsx` | Grey tower ring → verdant floating masses, terraces, mist bands, emerald ground |
| District tint | `src/game/districts3d.ts` `forum` | fog / ambient / ground / sky aligned (Floor still owns its own `Lights`) |

Quality tiers (`src/game/quality.ts`) are respected: fewer masses via `towers` / `crafts`, no HDRI / god-rays / multi mist on low, shadows only on high.

## Tuning knobs

Live scene (fastest):

1. **Sun aim** — `SUN_POS` in `env.tsx` (shared by Sky, key light, shadows).
2. **Sky warmth** — `<Sky turbidity / rayleigh / mie*>` in `HqEnvironment`.
3. **Moon** — `MOON_POS` + sphere radius in `PaleMoon`.
4. **Fog** — fog color / near / far math in `Lights` (`kit.tsx`). Near follows `settings.fogNear`; far clamps to `settings.far`.
5. **Plate density** — `settings.towers` / `settings.crafts` from quality tier; mass layout in `ringMasses()`.
6. **God-rays** — opacity / plane count in `ParadiseGodRays`; gated with `level !== "low"`.

Offline sky bake:

```bash
node scripts/make-paradise-sky.mjs
```

Writes `public/worlds/forum/paradise-sky.jpg`. Edit palette constants at the top of that script (gold / teal / moon / forest). Mid/high Floor loads this JPEG as the sky dome; regenerate after palette edits.

## Out of scope (this PR)

- Full floating-island city rebuild / new districts
- Rapier / museum (#6 HOLD)
- Engine rewrite

## Smoke

Orbit The Floor on `/worlds?district=forum` (high quality) and confirm golden sky, pale moon, teal mist, green plate — HQ glass box and plaza still readable. Then guest-walk `/explore` to confirm atrium / enter soft-fail / shards still boot.
