# Icon Asset Brief

> **Phase 9 Deliverable** · Loot Icon Pipeline Standards

---

## 1. Overview

Icons represent items in the inventory, loot drops, shop, and reward screens. They must be instantly recognisable at native resolution (16 × 16 px) on a mobile screen.

---

## 2. Technical Spec

| Parameter          | Standard (16 px) | Large (32 px)   |
| ------------------ | ---------------- | --------------- |
| Canvas size        | 16 × 16 px       | 32 × 32 px      |
| Safe-zone inset    | 1 px             | 2 px            |
| Outline            | 1 px, `#111111`  | 1 px, `#111111` |
| Background         | Transparent      | Transparent     |
| Max unique colours | 8                | 12              |

The safe zone means the actual icon art occupies a 14 × 14 px area (standard) or 28 × 28 px area (large), centred in the canvas.

---

## 3. Categories & Silhouette Rules

### Weapons

- **Angle**: 45° pointing upper-right.
- **Silhouette**: clear blade/head distinct from handle.
- **Examples**: sword, axe, staff, bow, dagger.

### Armor

- **Angle**: front-facing, centred.
- **Silhouette**: wide top (shoulders), narrowing downward.
- **Examples**: chestplate, helmet, shield, boots.

### Consumables

- **Angle**: centred, upright.
- **Silhouette**: rounded, organic shapes (bottles, food).
- **Examples**: health potion, mana vial, food, scroll.

### Materials

- **Angle**: centred.
- **Silhouette**: irregular organic/mineral forms.
- **Examples**: ore, gem, bone, feather.

### Relics

- **Angle**: centred, symmetrical preferred.
- **Silhouette**: distinctive, memorable shape unique to each relic.
- **Examples**: ring, amulet, skull, orb.
- **Note**: Relics receive a rarity glow/border at runtime — do not bake glow into the sprite.

### Skill Icons

- **Angle**: centred, abstract.
- **Silhouette**: symbolic (flame shape, shield shape, arrow shape).
- **Max**: 4 colours to ensure clarity.

---

## 4. Naming Convention

```
{category}-{item-name}.png
```

Examples:

- `weapons-iron-sword.png`
- `armor-leather-chest.png`
- `consumables-health-potion.png`
- `materials-fire-gem.png`
- `relics-thorn-ring.png`
- `skill-icons-fireball.png`

---

## 5. Pipeline

```
1. Author at 16×16 or 32×32 (no upscale/downscale)
2. Validate with sprite-pipeline.ts → validateIcon()
3. Validate readability against UI panel background
4. Pack into atlas with atlas-pack.ts
5. Reference via atlas manifest in PreloadScene
```

---

## 6. Validation Checklist

- [ ] Dimensions match `ICON_STANDARD` or `ICON_STANDARD_LARGE`.
- [ ] Art stays within safe zone.
- [ ] 1 px outline using `#111111`.
- [ ] Transparent background.
- [ ] Foreground passes contrast check vs UI panel primary (`#1a1a2e`) at ≥ 3.0.
- [ ] File name follows naming convention.
- [ ] Colour count within limit.
