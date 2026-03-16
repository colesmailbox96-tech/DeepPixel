# Character Sprite Asset Brief

> **Phase 9 Deliverable** · Character Sprite Pipeline & Silhouette Standards

---

## 1. Overview

Character sprites include the player, standard enemies, elite enemies, bosses, and NPCs. Each must be recognisable from silhouette alone at native resolution.

---

## 2. Technical Specs

| Entity Type | Frame Size | Frames/Anim | Padding | Sheet Layout              |
| ----------- | ---------- | ----------- | ------- | ------------------------- |
| Player      | 16 × 16    | 4           | 1 px    | Horizontal strip per anim |
| Enemy (std) | 16 × 16    | 4           | 1 px    | Horizontal strip per anim |
| Boss        | 32 × 32    | 6           | 1 px    | Horizontal strip per anim |
| NPC         | 16 × 16    | 2           | 1 px    | Horizontal strip per anim |

---

## 3. Silhouette Standards

### 3.1 Player Character

- Occupies ≤ 14 × 14 px within the 16 × 16 frame.
- **Distinctive feature**: weapon visible in idle pose.
- **Shape**: humanoid, upright stance, clearly differentiated from all enemies.

### 3.2 Standard Enemies (15 archetypes)

Each archetype must differ from others in **at least 2** of: height, width, outline profile.

| Archetype | Silhouette Hint            | Height Range               |
| --------- | -------------------------- | -------------------------- |
| Slime     | Round, low                 | 6-8 px                     |
| Goblin    | Small humanoid, hunched    | 10-12 px                   |
| Archer    | Thin humanoid, bow visible | 12-14 px                   |
| Skeleton  | Thin humanoid, angular     | 12-14 px                   |
| Wraith    | Tapered bottom (hovering)  | 12-14 px                   |
| Brute     | Wide, stocky               | 14-16 px                   |
| Bomber    | Round body, fuse on top    | 8-10 px                    |
| Spider    | Wide, low, 8 legs          | 8-10 px                    |
| Drake     | Winged, long neck          | 12-14 px                   |
| Lich      | Tall humanoid, staff       | 14-16 px                   |
| Troll     | Large, hunched, arms long  | 14-16 px                   |
| Witch     | Tall, hat, flowing robe    | 14-16 px                   |
| Bat       | Wide wings, small body     | 8-10 px                    |
| Golem     | Blocky, square             | 14-16 px                   |
| Serpent   | Long horizontal, no legs   | 6-8 px tall, 14-16 px wide |

### 3.3 Elite Enemies

- Use the same silhouette as their base archetype.
- **Visual differentiator**: brighter palette + 1 px aura/outline in rarity colour.

### 3.4 Bosses (32 × 32)

- Must be immediately recognisable as a threat.
- Occupy ≤ 28 × 28 px within frame.
- **Distinctive features**: exaggerated proportions, glowing elements.

### 3.5 NPCs

- Friendly, non-threatening silhouette.
- Visually distinct from all enemies (robes, civilian clothing, no weapons drawn).

---

## 4. Animation States

### Player

| State  | Frames | FPS | Loop |
| ------ | ------ | --- | ---- |
| idle   | 4      | 8   | Yes  |
| walk   | 4      | 10  | Yes  |
| attack | 4      | 10  | No   |
| hurt   | 2      | 8   | No   |
| death  | 4      | 6   | No   |

### Standard Enemy

| State  | Frames | FPS | Loop |
| ------ | ------ | --- | ---- |
| idle   | 4      | 8   | Yes  |
| walk   | 4      | 10  | Yes  |
| attack | 4      | 10  | No   |

### Boss

| State  | Frames | FPS | Loop |
| ------ | ------ | --- | ---- |
| idle   | 6      | 8   | Yes  |
| walk   | 6      | 10  | Yes  |
| attack | 6      | 10  | No   |
| hurt   | 4      | 8   | No   |
| death  | 6      | 6   | No   |

### NPC

| State | Frames | FPS | Loop |
| ----- | ------ | --- | ---- |
| idle  | 2      | 6   | Yes  |
| walk  | 2      | 8   | Yes  |

---

## 5. Facing & Flip

- All sprites face **right** by default.
- Engine mirrors horizontally for left-facing.
- Up/down differentiation optional for standard enemies; **required** for player and bosses.

---

## 6. Colour Rules

- Maximum **12 unique colours** per character sprite (across all frames).
- Use the entity's own palette (not biome palette) for the sprite body.
- **1 px outline** using the entity palette's shadow colour (not pure black).
- Elite aura uses `RARITY_VISUALS` border colour for their rarity tier.

---

## 7. Naming Convention

```
{type}-{name}-{state}.png
```

Examples:

- `player-knight-idle.png`
- `enemy-slime-walk.png`
- `enemy-goblin-attack.png`
- `boss-arch-lich-death.png`
- `npc-merchant-idle.png`

---

## 8. Pipeline

```
1. Author at correct frame size (16×16 or 32×32)
2. Validate with sprite-pipeline.ts → validateSpriteSheet() + validateAnimations()
3. Validate readability against all 6 biome floor primaries
4. Pack into atlas with atlas-pack.ts
5. Register animations in CharacterSpriteSheet definition
6. Reference via atlas manifest in PreloadScene
```

---

## 9. Validation Checklist

- [ ] Frame dimensions match entity `SpriteSpec`.
- [ ] Sheet dimensions match expected (cols × frameW + padding, rows × frameH + padding).
- [ ] Animation frame ranges are within total frame count.
- [ ] Silhouette is unique among its entity category.
- [ ] Primary body colour passes readability check vs all 6 biome floor primaries (≥ 2.5).
- [ ] Colour count ≤ 12.
- [ ] File name follows naming convention.
