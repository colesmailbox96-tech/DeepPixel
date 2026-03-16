import type {
  PaletteFamily,
  PaletteMap,
  RarityVisual,
  IconStandard,
  TileStandard,
  SpriteSpec,
} from '@echo-party/shared';
import { Biome, Rarity } from '@echo-party/shared';

/**
 * Phase 9 — Finalized Palette Families & Art Constants
 *
 * Single source of truth for every palette, icon spec, tile spec, and
 * character-sprite spec used by both the tooling pipeline and the client
 * renderer.  All colours are 6-digit hex (no # prefix).
 */

// ── Biome Palettes ────────────────────────────────────────────────────────────

export const BIOME_PALETTES: PaletteMap<Biome> = {
  [Biome.Sewer]: {
    name: 'Sewer',
    primary: '3a5a40',
    secondary: '5a7a50',
    tertiary: '8aaa60',
    shadow: '1a2a20',
    highlight: 'b0d060',
  },
  [Biome.Crypt]: {
    name: 'Crypt',
    primary: '2e2e3a',
    secondary: '4a4a5e',
    tertiary: '7a7a8e',
    shadow: '14141a',
    highlight: 'b0b0c4',
  },
  [Biome.Forest]: {
    name: 'Forest',
    primary: '2d5a27',
    secondary: '4a8a3a',
    tertiary: '8ec07c',
    shadow: '1a3a14',
    highlight: 'c4e8a0',
  },
  [Biome.Volcano]: {
    name: 'Volcano',
    primary: '6a2020',
    secondary: 'aa4430',
    tertiary: 'ee7744',
    shadow: '2a0a0a',
    highlight: 'ffcc44',
  },
  [Biome.IceCave]: {
    name: 'Ice Cave',
    primary: '3a6a8a',
    secondary: '6a9aba',
    tertiary: 'aaddee',
    shadow: '1a3a4a',
    highlight: 'eeffff',
  },
  [Biome.Ruins]: {
    name: 'Ruins',
    primary: '5a5040',
    secondary: '8a7a60',
    tertiary: 'baa880',
    shadow: '2a2820',
    highlight: 'eed8a0',
  },
};

// ── Rarity Palettes ───────────────────────────────────────────────────────────

export const RARITY_PALETTES: PaletteMap<Rarity> = {
  [Rarity.Common]: {
    name: 'Common',
    primary: '888888',
    secondary: 'aaaaaa',
    tertiary: 'cccccc',
    shadow: '555555',
    highlight: 'eeeeee',
  },
  [Rarity.Uncommon]: {
    name: 'Uncommon',
    primary: '44aa44',
    secondary: '66cc66',
    tertiary: '88ee88',
    shadow: '227722',
    highlight: 'bbffbb',
  },
  [Rarity.Rare]: {
    name: 'Rare',
    primary: '4488cc',
    secondary: '66aaee',
    tertiary: '88ccff',
    shadow: '225588',
    highlight: 'bbddff',
  },
  [Rarity.Epic]: {
    name: 'Epic',
    primary: '9944cc',
    secondary: 'bb66ee',
    tertiary: 'dd88ff',
    shadow: '662288',
    highlight: 'eeccff',
  },
  [Rarity.Legendary]: {
    name: 'Legendary',
    primary: 'cc8800',
    secondary: 'eeaa22',
    tertiary: 'ffcc44',
    shadow: '885500',
    highlight: 'ffeeaa',
  },
};

// ── Rarity Visual Effects ─────────────────────────────────────────────────────

export const RARITY_VISUALS: Record<Rarity, RarityVisual> = {
  [Rarity.Common]: { borderColor: '888888', glowColor: 'aaaaaa', glowRadius: 0 },
  [Rarity.Uncommon]: { borderColor: '44aa44', glowColor: '66cc66', glowRadius: 1 },
  [Rarity.Rare]: { borderColor: '4488cc', glowColor: '66aaee', glowRadius: 2 },
  [Rarity.Epic]: { borderColor: '9944cc', glowColor: 'bb66ee', glowRadius: 3 },
  [Rarity.Legendary]: { borderColor: 'cc8800', glowColor: 'ffcc44', glowRadius: 4 },
};

// ── UI Palette ────────────────────────────────────────────────────────────────

export const UI_PALETTE: PaletteFamily = {
  name: 'UI Base',
  primary: '1a1a2e',
  secondary: '16213e',
  tertiary: '0f3460',
  shadow: '0a0a14',
  highlight: 'e94560',
};

// ── VFX Palette ───────────────────────────────────────────────────────────────

export const VFX_PALETTE: PaletteFamily = {
  name: 'VFX Base',
  primary: 'ffffff',
  secondary: 'ffee88',
  tertiary: 'ff8844',
  shadow: '442200',
  highlight: 'ffffcc',
};

// ── Icon Standards ────────────────────────────────────────────────────────────

export const ICON_STANDARD: IconStandard = {
  size: 16,
  safeZoneInset: 1,
  outline: true,
  outlineColor: '111111',
};

export const ICON_STANDARD_LARGE: IconStandard = {
  size: 32,
  safeZoneInset: 2,
  outline: true,
  outlineColor: '111111',
};

// ── Tile Standards ────────────────────────────────────────────────────────────

export const TILE_STANDARD: TileStandard = {
  tileSize: 16,
  variants: 4,
  autotile: true,
};

// ── Character Sprite Specs ────────────────────────────────────────────────────

export const PLAYER_SPRITE_SPEC: SpriteSpec = {
  frameWidth: 16,
  frameHeight: 16,
  framesPerAnim: 4,
  padding: 1,
};

export const ENEMY_SPRITE_SPEC: SpriteSpec = {
  frameWidth: 16,
  frameHeight: 16,
  framesPerAnim: 4,
  padding: 1,
};

export const BOSS_SPRITE_SPEC: SpriteSpec = {
  frameWidth: 32,
  frameHeight: 32,
  framesPerAnim: 6,
  padding: 1,
};

export const NPC_SPRITE_SPEC: SpriteSpec = {
  frameWidth: 16,
  frameHeight: 16,
  framesPerAnim: 2,
  padding: 1,
};
