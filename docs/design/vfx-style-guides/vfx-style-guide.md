# Project Echo Party — VFX Style Guide

> **Phase 9 Deliverable** · VFX Standards & Style Reference

---

## 1. VFX Philosophy

VFX in Echo Party serve **gameplay readability first**, spectacle second. Every effect must:

1. **Communicate** — tell the player what happened (damage, heal, crit, pickup).
2. **Not obscure** — never cover the player or enemies for more than 2 frames.
3. **Read on all biomes** — pass contrast validation against every biome floor colour.
4. **Feel premium** — hand-crafted frame-by-frame animation, not random noise.

---

## 2. VFX Categories

### 2.1 Combat VFX

| Effect         | Frames | Size    | Loop | Description                           |
| -------------- | ------ | ------- | ---- | ------------------------------------- |
| Hit flash      | 3      | 16 × 16 | No   | White flash overlay on damaged entity |
| Weapon trail   | 4      | 16 × 16 | No   | Arc following weapon swing            |
| Crit impact    | 6      | 32 × 32 | No   | Larger burst with star particles      |
| Spell charge   | 4      | 16 × 16 | Yes  | Swirling particles at cast point      |
| Spell impact   | 6      | 32 × 32 | No   | Elemental burst at target             |
| Boss telegraph | 8      | 32 × 32 | Yes  | Warning zone indicator                |

### 2.2 Loot VFX

| Effect         | Frames | Size    | Loop | Description                |
| -------------- | ------ | ------- | ---- | -------------------------- |
| Common drop    | 2      | 16 × 16 | No   | Subtle bounce sparkle      |
| Uncommon drop  | 3      | 16 × 16 | Yes  | Green shimmer              |
| Rare drop      | 4      | 16 × 16 | Yes  | Blue pulse glow            |
| Epic drop      | 5      | 16 × 16 | Yes  | Purple orbiting particles  |
| Legendary drop | 6      | 16 × 16 | Yes  | Gold beam + particle burst |
| Pickup flash   | 3      | 16 × 16 | No   | Quick collect confirmation |

### 2.3 Ambient VFX

| Effect        | Frames | Size    | Loop | Description               |
| ------------- | ------ | ------- | ---- | ------------------------- |
| Torch flicker | 4      | 16 × 16 | Yes  | Warm light variation      |
| Water ripple  | 4      | 16 × 16 | Yes  | Concentric ring animation |
| Dust mote     | 3      | 16 × 16 | Yes  | Slow floating particle    |
| Snow fall     | 4      | 16 × 16 | Yes  | Diagonal drift (Ice Cave) |
| Ember float   | 3      | 16 × 16 | Yes  | Upward drift (Volcano)    |
| Fog wisp      | 6      | 32 × 32 | Yes  | Slow horizontal drift     |

### 2.4 Elemental VFX

| Effect         | Frames | Size    | Loop | Description                |
| -------------- | ------ | ------- | ---- | -------------------------- |
| Fire burst     | 5      | 16 × 16 | No   | Orange-red flame puff      |
| Ice shard      | 4      | 16 × 16 | No   | Blue crystalline shatter   |
| Lightning bolt | 3      | 16 × 16 | No   | White-yellow jagged strike |
| Arcane swirl   | 6      | 16 × 16 | No   | Purple spiral dissipation  |
| Heal pulse     | 4      | 16 × 16 | No   | Green upward sparkle       |

---

## 3. Colour Rules for VFX

### 3.1 Base VFX Palette

All VFX start from the VFX base palette (`VFX_PALETTE` in `palettes.ts`):

- **Primary** `#ffffff` — maximum-energy flashes (hit, crit)
- **Secondary** `#ffee88` — warm glow (fire, gold)
- **Tertiary** `#ff8844` — impact energy (explosion)
- **Shadow** `#442200` — smoke, dark residue
- **Highlight** `#ffffcc` — sparkle, afterglow

### 3.2 Element-Specific Colours

VFX for elemental damage types layer these colours on top of the base palette:

| Element   | Core Colour | Accent    | Particle  |
| --------- | ----------- | --------- | --------- |
| Physical  | `#ffffff`   | `#cccccc` | `#888888` |
| Fire      | `#ff4422`   | `#ffcc44` | `#ff8844` |
| Ice       | `#88ccff`   | `#aaddee` | `#eeffff` |
| Lightning | `#ffee44`   | `#ffffff` | `#ffffcc` |
| Arcane    | `#bb66ee`   | `#dd88ff` | `#eeccff` |

### 3.3 Rules

1. **VFX is the only context where pure white (`ffffff`) is permitted** in sprite data.
2. **Maximum 6 colours per VFX effect** to keep them crisp and readable.
3. **No dark outlines on VFX** — they should feel ethereal, not solid.
4. **Additive blending is preferred** for light-emitting effects (engine applies via blend mode).

---

## 4. Animation Principles

### 4.1 Timing

- **Impact effects** (hit, crit, spell impact): fast onset (1-2 frames), lingering fade (2-4 frames).
- **Looping effects** (ambient, loot glow): smooth cycle, no jarring pop at loop boundary.
- **Telegraph effects**: slow build (4+ frames) with clear visual escalation.

### 4.2 Frame Rate

- Combat VFX: **12 fps** (snappy, responsive)
- Ambient VFX: **6 fps** (gentle, non-distracting)
- Loot glow: **8 fps** (attention-grabbing but not frantic)

### 4.3 Scale & Position

- All VFX are centred on the triggering entity or tile.
- Combat VFX may extend 4 px beyond the entity frame.
- Ambient VFX must stay within their tile boundary.

---

## 5. Sprite Sheet Format

VFX sprite sheets are horizontal strips:

```
┌────────┬────────┬────────┬────────┐
│ Frame 0│ Frame 1│ Frame 2│ Frame 3│  ← single row
└────────┴────────┴────────┴────────┘
```

- **No vertical stacking** — one effect per row.
- **1 px padding** between frames.
- **Transparent background** (alpha = 0).

Naming convention: `{category}-{name}.png`

Examples:

- `combat-hit-flash.png`
- `loot-legendary-glow.png`
- `ambient-torch-flicker.png`
- `elemental-fire-burst.png`

---

## 6. Validation Checklist

Before any VFX asset enters the atlas:

- [ ] Frame size matches the spec table above.
- [ ] Colour count ≤ 6 per effect.
- [ ] Core colour passes readability check against all 6 biome floor primaries (≥ 2.0 ratio).
- [ ] Loop effects have seamless first-to-last frame transition.
- [ ] Non-loop effects end on a fully transparent frame.
- [ ] File name follows the `{category}-{name}.png` convention.
