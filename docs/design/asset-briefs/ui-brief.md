# UI Art Asset Brief

> **Phase 9 Deliverable** · Premium UI Art Standards

---

## 1. Overview

UI art covers HUD elements, menu panels, buttons, inventory frames, rarity borders, and skill icons. All UI art uses the **UI palette** and must work consistently across all biomes.

---

## 2. Technical Spec

| Parameter        | Value                                             |
| ---------------- | ------------------------------------------------- |
| Panel background | UI palette primary (`#1a1a2e`)                    |
| Panel border     | UI palette shadow (`#0a0a14`), 1 px               |
| Button size      | 48 × 16 px (minimum), height multiple of 16       |
| Frame size       | 20 × 20 px (icon frame, 16 px icon + 2 px border) |
| Touch target     | ≥ 48 × 48 css px (16 × 16 native at ×3 scale)     |
| Text rendering   | Engine font — **never bake text into art**        |

---

## 3. UI Components

### 3.1 Buttons

Three visual states per button:

| State    | Visual Treatment                                           |
| -------- | ---------------------------------------------------------- |
| Idle     | UI secondary fill, shadow border                           |
| Pressed  | 1 px inset (shadow on top/left, highlight on bottom/right) |
| Disabled | Desaturated colours, reduced opacity hint                  |

- Rounded corners: 1 px chamfer on each corner.
- Minimum internal padding: 2 px on all sides.

### 3.2 Panels

- **Background**: UI primary, semi-transparent (engine handles opacity).
- **Border**: 1 px UI shadow.
- **Corners**: 1 px chamfer.
- **Drop shadow**: 1 px offset using UI shadow colour at 50% opacity.

### 3.3 Inventory Frames

Used to display item icons in the inventory grid.

| Rarity    | Border    | Glow Radius |
| --------- | --------- | ----------- |
| Common    | `#888888` | 0 px        |
| Uncommon  | `#44aa44` | 1 px        |
| Rare      | `#4488cc` | 2 px        |
| Epic      | `#9944cc` | 3 px        |
| Legendary | `#cc8800` | 4 px        |

- Frame inner size: 16 × 16 px (fits standard icon).
- Frame outer size: 20 × 20 px (16 + 2 px border on each side).
- Glow is rendered at runtime via `RARITY_VISUALS`.

### 3.4 Health / Resource Bars

- Bar height: 3 px.
- Background: UI shadow.
- Fill: bright colour (health = `#44aa44`, mana = `#4488cc`).
- Border: 1 px UI shadow.
- Positioned above entities in the game world, or in the HUD panel.

### 3.5 Skill Icons

- Canvas: 16 × 16 px.
- Follow icon standards (1 px safe zone, outline).
- Abstract symbolic representation (fire, shield, arrow, heal).
- Maximum 4 colours for clarity.
- Cooldown overlay rendered at runtime (desaturation + sweep).

### 3.6 Minimap / Room Indicator

- Room indicator: simple grid of squares.
- Current room: UI highlight colour.
- Visited rooms: UI tertiary.
- Unvisited: UI shadow (barely visible).
- Size: 4 × 4 px per room cell.

---

## 4. Colour Rules

1. All UI art uses the **UI palette** exclusively.
2. Rarity-specific elements use `RARITY_PALETTES` / `RARITY_VISUALS` for borders/glows.
3. **Never use biome colours in UI** — UI must look consistent across all biomes.
4. Text colour: UI palette highlight (`#e94560`) for emphasis, `#cccccc` for body, `#888888` for secondary.
5. **All text is rendered by the engine** — no pre-rendered text in art assets.

---

## 5. Naming Convention

```
ui-{component}-{variant}.png
```

Examples:

- `ui-button-idle.png`
- `ui-button-pressed.png`
- `ui-button-disabled.png`
- `ui-panel-standard.png`
- `ui-frame-common.png`
- `ui-frame-legendary.png`
- `ui-bar-health.png`

---

## 6. Pipeline

```
1. Author at specified dimensions
2. Validate contrast: text colours vs panel background (≥ 4.5:1)
3. Validate touch target size (≥ 48 css px at ×3 scale)
4. Pack into UI atlas with atlas-pack.ts
5. Reference via atlas manifest in UIScene
```

---

## 7. Validation Checklist

- [ ] All panels use UI palette colours only.
- [ ] Button has all 3 states (idle, pressed, disabled).
- [ ] Text colours pass contrast check vs panel background (≥ 4.5:1).
- [ ] Touch targets meet 48 × 48 css px minimum.
- [ ] Rarity frames use correct `RARITY_VISUALS` values.
- [ ] No baked text in any UI art asset.
- [ ] File name follows naming convention.
