# Project Echo Party — Palette Guide

> **Phase 9 Deliverable** · Finalized Palette Families

All colours are expressed as 6-digit hex values (no `#` prefix in code, shown with `#` here for readability). The canonical source is `packages/content/src/palettes.ts`.

---

## 1. Biome Palettes

Each biome uses a 5-colour family applied to floor tiles, walls, props, and ambient effects.

### Sewer

| Slot | Hex | Preview | Usage |
|------|-----|---------|-------|
| Primary | `#3a5a40` | 🟩 | Floor tiles, water |
| Secondary | `#5a7a50` | 🟩 | Walls, pipes |
| Tertiary | `#8aaa60` | 🟩 | Moss, lichen details |
| Shadow | `#1a2a20` | ⬛ | Outlines, dark water |
| Highlight | `#b0d060` | 🟢 | Dripping slime, glow |

### Crypt

| Slot | Hex | Preview | Usage |
|------|-----|---------|-------|
| Primary | `#2e2e3a` | ⬛ | Stone floors |
| Secondary | `#4a4a5e` | 🔲 | Walls, sarcophagi |
| Tertiary | `#7a7a8e` | 🔲 | Carved details |
| Shadow | `#14141a` | ⬛ | Deep shadow |
| Highlight | `#b0b0c4` | ⬜ | Bone, moonlight |

### Forest

| Slot | Hex | Preview | Usage |
|------|-----|---------|-------|
| Primary | `#2d5a27` | 🟩 | Grass, undergrowth |
| Secondary | `#4a8a3a` | 🟩 | Tree trunks, bushes |
| Tertiary | `#8ec07c` | 🟢 | Leaves, flowers |
| Shadow | `#1a3a14` | ⬛ | Deep forest shadow |
| Highlight | `#c4e8a0` | 🟢 | Sunlit leaves, clearings |

### Volcano

| Slot | Hex | Preview | Usage |
|------|-----|---------|-------|
| Primary | `#6a2020` | 🟥 | Cooled basalt |
| Secondary | `#aa4430` | 🟧 | Hot rock, magma crust |
| Tertiary | `#ee7744` | 🟧 | Lava glow, embers |
| Shadow | `#2a0a0a` | ⬛ | Char, obsidian |
| Highlight | `#ffcc44` | 🟡 | Molten highlights |

### Ice Cave

| Slot | Hex | Preview | Usage |
|------|-----|---------|-------|
| Primary | `#3a6a8a` | 🔵 | Ice floor |
| Secondary | `#6a9aba` | 🔵 | Frozen walls |
| Tertiary | `#aaddee` | 🔵 | Ice crystals |
| Shadow | `#1a3a4a` | ⬛ | Deep ice crevice |
| Highlight | `#eeffff` | ⬜ | Frost sparkle |

### Ruins

| Slot | Hex | Preview | Usage |
|------|-----|---------|-------|
| Primary | `#5a5040` | 🟫 | Sandstone floor |
| Secondary | `#8a7a60` | 🟫 | Crumbled walls |
| Tertiary | `#baa880` | 🟫 | Carved reliefs |
| Shadow | `#2a2820` | ⬛ | Deep cracks |
| Highlight | `#eed8a0` | 🟡 | Gilded trim, sunlight |

---

## 2. Rarity Palettes

Used for item icons, loot glow, inventory borders, and UI text emphasis.

| Rarity | Primary | Secondary | Tertiary | Shadow | Highlight |
|--------|---------|-----------|----------|--------|-----------|
| Common | `#888888` | `#aaaaaa` | `#cccccc` | `#555555` | `#eeeeee` |
| Uncommon | `#44aa44` | `#66cc66` | `#88ee88` | `#227722` | `#bbffbb` |
| Rare | `#4488cc` | `#66aaee` | `#88ccff` | `#225588` | `#bbddff` |
| Epic | `#9944cc` | `#bb66ee` | `#dd88ff` | `#662288` | `#eeccff` |
| Legendary | `#cc8800` | `#eeaa22` | `#ffcc44` | `#885500` | `#ffeeaa` |

### Rarity Glow Effects

Applied at runtime via `RARITY_VISUALS`:

| Rarity | Border | Glow | Radius |
|--------|--------|------|--------|
| Common | `#888888` | `#aaaaaa` | 0 px |
| Uncommon | `#44aa44` | `#66cc66` | 1 px |
| Rare | `#4488cc` | `#66aaee` | 2 px |
| Epic | `#9944cc` | `#bb66ee` | 3 px |
| Legendary | `#cc8800` | `#ffcc44` | 4 px |

---

## 3. UI Palette

Used for HUD panels, menus, dialogue boxes, and overlay backgrounds.

| Slot | Hex | Usage |
|------|-----|-------|
| Primary | `#1a1a2e` | Panel backgrounds |
| Secondary | `#16213e` | Secondary panels, tooltips |
| Tertiary | `#0f3460` | Active/selected state |
| Shadow | `#0a0a14` | Panel borders, dividers |
| Highlight | `#e94560` | Call-to-action, warnings |

---

## 4. VFX Palette

Base colours for combat flashes, loot sparkle, and ambient particles. Element-specific VFX layer additional colours from the biome palette.

| Slot | Hex | Usage |
|------|-----|-------|
| Primary | `#ffffff` | Hit flash, maximum brightness |
| Secondary | `#ffee88` | Warm glow, fire trail |
| Tertiary | `#ff8844` | Impact burst, explosion |
| Shadow | `#442200` | Smoke, dark particle |
| Highlight | `#ffffcc` | Sparkle, lens flare |

---

## 5. Usage Rules

1. **Never mix palette families** — a Sewer tile must only use Sewer palette colours (plus the entity's own palette).
2. **Entity sprites use their own palette** independent of the biome, but must pass readability validation against all biome floor primaries.
3. **Rarity colours are additive** — they are applied as borders/glows on top of the item's base sprite palette.
4. **UI palette is biome-independent** — menus look the same regardless of current biome.
5. **VFX palette is the only context where pure white (`ffffff`) is allowed.**

---

## 6. Contrast Validation

All colour pairs must pass the readability validator at the following thresholds:

| Category | Minimum Contrast Ratio |
|----------|----------------------|
| Sprite vs biome floor | ≥ 2.5:1 |
| Icon fg vs icon bg | ≥ 3.0:1 |
| UI text vs panel bg | ≥ 4.5:1 |
| VFX flash | ≥ 2.0:1 |

Run validation with:

```ts
import { validateContrast } from '@echo-party/tooling';
const result = validateContrast('player-sprite', 'ff0000', '3a5a40', 'sprite');
// result.passed === true if contrast ≥ 2.5
```
