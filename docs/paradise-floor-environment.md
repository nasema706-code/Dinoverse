# Paradise Floor environment (Earth-Like Worlds)

Art-direction pass for **The Floor** exterior — immersive sky dome, mist, warm lighting. Walkable HQ / atrium / soft-fail / shards / characters unchanged.

## Visual target

- Category: temperate / paradise terrestrial
- Palette: emerald green, warm gold sunlight (`#ffdfad`), misty teal (`#6eaea6`), cream moon
- Mood: lush valleys in the **sky dome**, golden-hour god-rays, giant pale moon — **not** a vertical painting beside HQ

Official still: `public/worlds/forum/paradise-plate-ref.jpg`

## What changed (code)

| Surface | File | Notes |
| --- | --- | --- |
| Sky | `src/game/floor/env.tsx` | Mid/high: `VisionSkyDome` on equirect bake; low: drei `<Sky>` + `PaleMoon`. **No vertical still billboards.** |
| Bake | `scripts/make-paradise-sky.mjs` | Projects the still into a forward frustum; fills 360° with zenith / teal horizon ring / soft ridge |
| Surround | `src/game/floor/cityscape.tsx` | Verdant ground, sparse far silhouettes, mist bands only |
| Fog / lights | `src/game/floor/kit.tsx` `Lights` | Stronger misty teal fog; warm sun; quality-gated god-rays |

## Critic fix (MAJOR)

Vertical `ParadiseHorizonPlates` (six planes at r≈78 with the still) made the painting read as a side billboard. Removed. Immersion is the equirect dome + fog.

## Tuning

```bash
# Replace paradise-plate-ref.jpg, then:
node scripts/make-paradise-sky.mjs
```

Live knobs: `SUN_POS`, fog near/far in `Lights`, dome radius in `HqEnvironment` (keep under quality `far`).

## Out of scope

- Full floating-island / hanging-gardens prop rebuild
- Rapier / museum (#6 HOLD)
- Merge / deploy

## Evidence

First-person look-around shots: `docs/paradise-floor/`
