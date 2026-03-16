# Environment Tile Asset Brief

> **Phase 9 Deliverable** · Environment Tile Standards

---

## 1. Overview

Environment tiles form the dungeon floors, walls, and decorative props for each biome. All tiles share a 16 × 16 px grid and support auto-tiling for seamless wall transitions.

---

## 2. Technical Spec

| Parameter | Value |
|-----------|-------|
| Tile size | 16 × 16 px |
| Floor variants | ≥ 4 per biome |
| Wall variants | ≥ 2 per biome |
| Auto-tile method | 47-tile bitmask (Wang tiles) |
| Prop size | Freeform, grid-aligned |
| Max colours per tile | 6 |
| Padding in atlas | 1 px |

---

## 3. Tile Types

### 3.1 Floor Tiles

- **Variants**: minimum 4 per biome for visual variety.
- **Pattern**: subtle variation (cracks, colour shifts, small details) — not distracting.
- **Colour**: use biome palette primary + secondary.
- **Readability**: entities must pop against floor — floor tiles should be darker/more muted than sprite colours.

### 3.2 Wall Tiles

- **Auto-tile**: 47-tile bitmask set covering all corner/edge/interior combinations.
- **Visual**: clearly distinct from floor (darker, more saturated, or different hue shift).
- **Colour**: biome palette secondary + shadow.
- **Top edge**: 1-2 px lighter strip to suggest depth/height.

### 3.3 Props & Decorations

- **Grid-aligned**: must snap to 16 px grid positions.
- **Sizes**: 16 × 16 (small), 16 × 32 or 32 × 16 (medium), 32 × 32 (large).
- **Categories per biome**:

| Biome | Prop Examples |
|-------|---------------|
| Sewer | Pipes, grates, puddles, barrels |
| Crypt | Tombstones, candelabras, bones, cobwebs |
| Forest | Tree stumps, mushrooms, rocks, bushes |
| Volcano | Lava pools, charred pillars, obsidian shards |
| Ice Cave | Icicles, frozen pools, snow piles, crystals |
| Ruins | Broken columns, urns, inscribed slabs, vines |

### 3.4 Structures

Interactive environment objects placed on the tile grid:

| Structure | Size | Biome-agnostic? |
|-----------|------|-----------------|
| Door | 16 × 16 | Yes (tinted by biome) |
| Chest | 16 × 16 | Yes (rarity glow applied) |
| Portal | 32 × 32 | Yes (VFX overlay) |
| Trap | 16 × 16 | Yes (biome-tinted warning) |

---

## 4. Biome-Specific Tileset Requirements

Each biome tileset must include:

| Asset | Count | Notes |
|-------|-------|-------|
| Floor variants | 4+ | Shuffled randomly per room |
| Wall auto-tile | 47 | Full bitmask coverage |
| Wall top edge | 2+ | Parallax depth illusion |
| Ground decals | 4+ | Cracks, puddles, debris |
| Props (small) | 4+ | Decorative variety |
| Props (medium/large) | 2+ | Landmark objects |
| Light sources | 1-2 | Torches, crystals, lava glow |

---

## 5. Colour Rules

- **Floor tiles** use biome palette primary.
- **Wall tiles** use biome palette secondary + shadow.
- **Props** use biome palette tertiary + shadow.
- **Light sources** use biome palette highlight.
- **Maximum 6 unique colours per tile** (fewer is better for cohesion).
- **No colours from other biome palettes** in a biome's tileset.

---

## 6. Naming Convention

```
{biome}-{type}-{variant}.png
```

Examples:
- `sewer-floor-01.png`
- `crypt-wall-autotile.png` (contains 47-tile grid)
- `forest-prop-mushroom.png`
- `volcano-decal-crack-02.png`
- `ruins-structure-door.png`

---

## 7. Pipeline

```
1. Author at 16×16 per tile cell
2. Validate tile dimensions match TILE_STANDARD
3. Validate colour count ≤ 6
4. Validate readability: floor primary vs expected entity colours (≥ 2.5)
5. Pack into per-biome atlas with atlas-pack.ts
6. Register in atlas manifest
7. Engine selects variants via RNG seed for room gen
```

---

## 8. Validation Checklist

- [ ] All tiles are 16 × 16 px.
- [ ] Floor variants ≥ 4 per biome.
- [ ] Wall auto-tile set covers 47 combinations.
- [ ] Colour count ≤ 6 per tile.
- [ ] Floor colours pass readability check vs player sprite primary (≥ 2.5).
- [ ] No cross-biome colour contamination.
- [ ] File name follows naming convention.
