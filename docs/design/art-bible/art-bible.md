# Project Echo Party — Art Bible

> **Phase 9 Deliverable** · Premium Art Direction & Asset Pipeline

---

## 1. Vision & Pillars

Project Echo Party is an **offline-first, mobile-first pixel action RPG** with short-session dungeon runs. The visual identity must convey:

| Pillar          | Description                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------- |
| **Readable**    | Every element must be instantly identifiable on a 480 × 270 native canvas scaled ×3 on mobile.    |
| **Cohesive**    | All art shares the same restricted palette methodology and silhouette language.                   |
| **Premium**     | Pixel art should feel hand-crafted, not procedural-slop. Crisp edges, intentional colour choices. |
| **Atmospheric** | Each biome tells a story through colour temperature, ambient particles, and environmental detail. |

---

## 2. Technical Constraints

| Parameter         | Value                                              |
| ----------------- | -------------------------------------------------- |
| Native resolution | 480 × 270 px                                       |
| Scale factor      | ×3 (viewport 1440 × 810)                           |
| Tile size         | 16 × 16 px                                         |
| Character frame   | 16 × 16 px (enemies & player), 32 × 32 px (bosses) |
| Icon cell         | 16 × 16 px (standard), 32 × 32 px (large)          |
| Target FPS        | 60                                                 |
| Atlas format      | Power-of-two PNG (max 2048 × 2048)                 |
| Colour depth      | 32-bit RGBA                                        |

All assets are authored at **1× native** and upscaled by the engine at render time — **never** author at 2× or 3× and downscale.

---

## 3. Palette Methodology

### 3.1 Restricted Palette Approach

Every context (biome, rarity, UI) uses a **5-colour family** defined in `packages/content/src/palettes.ts`:

| Slot          | Role                              | Usage                         |
| ------------- | --------------------------------- | ----------------------------- |
| **Primary**   | Dominant fill / background colour | Floor tiles, large surfaces   |
| **Secondary** | Accent fills                      | Walls, secondary surfaces     |
| **Tertiary**  | Small highlights and detail       | Decorations, trim             |
| **Shadow**    | Outlines, drop shadows, depth     | 1 px borders, under-sprites   |
| **Highlight** | Specular, glow, emphasis          | Light sources, selected items |

### 3.2 Biome Palettes

Each of the 6 biomes has a unique family. See the [Palette Guide](../palette-guides/palette-guide.md) for full hex values.

| Biome    | Temperature    | Mood               |
| -------- | -------------- | ------------------ |
| Sewer    | Warm green     | Damp, oppressive   |
| Crypt    | Cool grey-blue | Eerie, quiet       |
| Forest   | Natural green  | Fresh, alive       |
| Volcano  | Hot red-orange | Hostile, fiery     |
| Ice Cave | Cold blue      | Crisp, dangerous   |
| Ruins    | Warm tan       | Ancient, weathered |

### 3.3 Rarity Palette Progression

Rarity colours progress from muted to vibrant, matching player expectation:

- **Common** — Neutral grey (no emotional weight)
- **Uncommon** — Soft green (nature, growth)
- **Uncommon** → **Rare** — Cool blue (magic, intelligence)
- **Epic** — Purple (power, mysticism)
- **Legendary** — Gold (prestige, ultimate reward)

### 3.4 Colour Rules

1. **No pure black (`000000`) in sprites** — use the palette shadow colour instead.
2. **No pure white (`ffffff`) in sprites** — reserve for VFX flashes only.
3. **Maximum 12 unique colours per single sprite** to maintain cohesion.
4. **Outline sprites with the shadow colour** at 1 px, all four cardinal directions.

---

## 4. Character Art Standards

### 4.1 Silhouette Rules

- Every character must be **recognisable from silhouette alone** at native scale.
- Player character occupies ≤ 14 × 14 px within a 16 × 16 frame (1 px border).
- Enemy silhouettes must differ from each other and the player in at least **2 of**: height, width, shape profile.
- Bosses use a 32 × 32 frame with stronger silhouette distinctiveness.

### 4.2 Animation States

| Entity           | Idle | Walk | Attack | Hurt | Death |
| ---------------- | ---- | ---- | ------ | ---- | ----- |
| Player           | 4 fr | 4 fr | 4 fr   | 2 fr | 4 fr  |
| Enemy (standard) | 4 fr | 4 fr | 4 fr   | —    | —     |
| Boss             | 6 fr | 6 fr | 6 fr   | 4 fr | 6 fr  |
| NPC              | 2 fr | 2 fr | —      | —    | —     |

Frame rate: **8 fps** for idle, **10 fps** for walk/attack, **6 fps** for death.

### 4.3 Facing & Flip

- Sprites face **right** by default. The engine mirrors horizontally for left-facing.
- Up/down differentiation is optional for standard enemies; required for player and bosses.

---

## 5. Icon Standards

See the [Icon Asset Brief](../asset-briefs/icon-brief.md) for pipeline details.

| Rule          | Value                                               |
| ------------- | --------------------------------------------------- |
| Canvas        | 16 × 16 px (standard), 32 × 32 px (large)           |
| Safe zone     | 1 px inset (standard), 2 px inset (large)           |
| Outline       | 1 px, colour `#111111`                              |
| Rarity border | Applied at runtime via `RARITY_VISUALS` glow radius |
| Background    | Transparent — the UI frame supplies background      |

### 5.1 Icon Categories

- **Weapons** — silhouette angled 45° pointing upper-right
- **Armor** — centred, front-facing
- **Consumables** — centred, rounded shapes
- **Materials** — centred, organic/mineral forms
- **Relics** — centred, distinctive shape + rarity glow
- **Skill icons** — centred, abstract symbol

---

## 6. Environment Tile Standards

See the [Environment Asset Brief](../asset-briefs/environment-brief.md) for pipeline details.

| Rule           | Value                          |
| -------------- | ------------------------------ |
| Tile size      | 16 × 16 px                     |
| Floor variants | ≥ 4 per biome                  |
| Wall variants  | ≥ 2 per biome                  |
| Auto-tile      | Bitmask 47-tile set for walls  |
| Props          | Freeform, snapped to tile grid |

### 6.1 Layering Order (back to front)

1. Floor tiles
2. Ground decals (cracks, puddles, debris)
3. Wall base
4. Entities (enemies, player, NPCs, loot)
5. Wall tops / overhangs (foreground occlusion)
6. VFX overlays
7. UI

---

## 7. UI Art Standards

See the [UI Asset Brief](../asset-briefs/ui-brief.md) for pipeline details.

- UI panels use the **UI palette** (`UI_PALETTE` in `palettes.ts`).
- Buttons have 3 states: **idle**, **pressed** (1 px inset), **disabled** (desaturated).
- Rarity frames use `RARITY_VISUALS` border and glow colours.
- All text is rendered by the engine font system — **no baked text in art**.
- Minimum touch target: 48 × 48 css pixels (16 × 16 native at ×3 scale).

---

## 8. VFX Standards

See the [VFX Style Guide](../vfx-style-guides/vfx-style-guide.md) for full details.

- VFX use the **VFX palette** (`VFX_PALETTE` in `palettes.ts`) plus element-specific colours.
- All VFX sprites ship as sprite-sheet strips.
- Maximum VFX frame size: 32 × 32 px (combat), 16 × 16 px (ambient).
- Effects should read clearly against **all 6 biome backgrounds** (validated via readability tool).

---

## 9. Asset Pipeline Overview

```
Source PNGs (assets/)
       │
       ▼
  Validate (sprite-pipeline.ts / readability-validator.ts)
       │
       ▼
  Pack (atlas-pack.ts)
       │
       ▼
  Atlas PNG + manifest.json (dist/)
       │
       ▼
  Loaded by PreloadScene → used by RenderSync
```

### 9.1 Pipeline Tools

| Tool                       | Location                | Purpose                                       |
| -------------------------- | ----------------------- | --------------------------------------------- |
| `atlas-pack.ts`            | `packages/tooling/src/` | Shelf-based rectangle packing → manifest      |
| `readability-validator.ts` | `packages/tooling/src/` | WCAG contrast checks for fg/bg pairs          |
| `sprite-pipeline.ts`       | `packages/tooling/src/` | Sprite sheet dimension & animation validation |

### 9.2 Validation Gates

Before any art asset enters the atlas:

1. **Dimension check** — frame size matches `SpriteSpec` or `IconStandard`.
2. **Animation check** — frame indices are within bounds, positive frame rates.
3. **Readability check** — primary sprite colour vs every biome floor colour ≥ 2.5 contrast ratio.
4. **Icon check** — dimensions match `IconStandard`, safe-zone respected.

---

## 10. File Organisation

```
assets/
├── characters/
│   ├── player/        # Player sprite sheets
│   ├── enemies/       # Standard enemy sprite sheets
│   ├── bosses/        # Boss sprite sheets (32×32)
│   └── npc/           # NPC sprite sheets
├── environment/
│   ├── biomes/        # Per-biome tilesets
│   ├── props/         # Decorative objects
│   └── structures/    # Doors, chests, etc.
├── icons/
│   ├── weapons/
│   ├── armor/
│   ├── consumables/
│   ├── materials/
│   └── relics/
├── ui/
│   ├── buttons/
│   ├── frames/
│   ├── rarity/
│   └── skill-icons/
└── vfx/
    ├── combat/
    ├── loot/
    ├── ambient/
    └── elemental/
```

---

## 11. Acceptance Criteria

- [ ] All palette families are defined in code (`palettes.ts`) and documented.
- [ ] Every asset type has a brief with dimensions, animation, and naming rules.
- [ ] Atlas packing tool produces valid manifests for test inputs.
- [ ] Readability validator catches low-contrast pairs.
- [ ] Sprite pipeline catches dimension mismatches.
- [ ] No ad-hoc art generation — every asset follows this bible.
