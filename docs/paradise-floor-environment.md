# Paradise Floor environment (Earth-Like Worlds)

Art-direction pass for **The Floor** exterior plate — sky, horizon surround, mist, and warm lighting. Walkable HQ / atrium / soft-fail / shards / characters are unchanged.

## Visual target

- Category: temperate / paradise terrestrial
- Palette: emerald green, warm gold sunlight (`#ffdfad`), misty teal (`#7eb8b0`), cream moon (`#f3ead4`)
- Mood: lush valleys, terraced / floating forest masses, golden-hour god-rays, giant pale moon

Official still: `public/worlds/forum/paradise-plate-ref.jpg`

## What changed (code)

| Surface | File | Notes |
| --- | --- | --- |
| Sky + HDRI | `src/game/floor/env.tsx` | Mid/high: `VisionSkyDome` on baked `/worlds/forum/paradise-sky.jpg` (from official still); low: drei `<Sky>` + `PaleMoon`. Environment preset `park` (mid/high) |
| Horizon plates | `src/game/floor/cityscape.tsx` | Mid/high: ring of official-still billboards; fewer/farther procedural floating masses + terraces |
| God-rays | `ParadiseGodRays` in `env.tsx` | Soft planes; **skipped on `low`** quality |
| Lights + fog | `src/game/floor/kit.tsx` `Lights` | Teal fog `#7eb8b0`; warm sun + cool mist fill; fog near/far still derived from `quality.ts` |
| District tint | `src/game/districts3d.ts` `forum` | fog / ambient / ground / sky aligned (Floor still owns its own `Lights`) |

Quality tiers (`src/game/quality.ts`) are respected: fewer masses via `towers` / `crafts`, no HDRI / still plates / god-rays on low, shadows only on high.

## Tuning knobs

Live scene (fastest):

1. **Sun aim** — `SUN_POS` in `env.tsx` (shared by Sky, key light, shadows).
2. **Sky warmth** — low-tier `<Sky turbidity / rayleigh / mie*>` in `HqEnvironment`.
3. **Moon** — low-tier only (`PaleMoon`); mid/high moon comes from the still.
4. **Fog** — fog color / near / far math in `Lights` (`kit.tsx`).
5. **Plate density** — `settings.towers` / `settings.crafts`; mass layout in `ringMasses()`.
6. **God-rays** — opacity / plane count in `ParadiseGodRays`; gated with `level !== "low"`.
7. **Horizon billboards** — radius / count in `ParadiseHorizonPlates`.

Offline sky bake:

```bash
# Replace paradise-plate-ref.jpg first, then:
node scripts/make-paradise-sky.mjs
```

Samples the official still into an equirect wrap at `public/worlds/forum/paradise-sky.jpg`. Mid/high Floor loads that JPEG as the sky dome.

## Out of scope (this PR)

- Full floating-island city rebuild / new districts
- Rapier / museum (#6 HOLD)
- Engine rewrite

## Smoke

Orbit The Floor on `/worlds?district=forum` (high quality) and confirm golden sky, pale moon, teal mist, paradise still on the horizon — HQ glass box and plaza still readable. Then guest-walk `/explore` to confirm atrium / enter soft-fail / shards still boot.
