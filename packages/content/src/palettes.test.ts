import { describe, it, expect } from 'vitest';
import { Biome, Rarity } from '@echo-party/shared';
import {
  BIOME_PALETTES,
  RARITY_PALETTES,
  RARITY_VISUALS,
  UI_PALETTE,
  VFX_PALETTE,
  ICON_STANDARD,
  ICON_STANDARD_LARGE,
  TILE_STANDARD,
  PLAYER_SPRITE_SPEC,
  ENEMY_SPRITE_SPEC,
  BOSS_SPRITE_SPEC,
  NPC_SPRITE_SPEC,
} from './palettes';

const HEX_RE = /^[0-9a-f]{6}$/;

function assertPalette(p: { primary: string; secondary: string; tertiary: string; shadow: string; highlight: string }) {
  expect(p.primary).toMatch(HEX_RE);
  expect(p.secondary).toMatch(HEX_RE);
  expect(p.tertiary).toMatch(HEX_RE);
  expect(p.shadow).toMatch(HEX_RE);
  expect(p.highlight).toMatch(HEX_RE);
}

// ── Biome Palettes ────────────────────────────────────────────────────────────

describe('BIOME_PALETTES', () => {
  it('covers all Biome enum values', () => {
    for (const biome of Object.values(Biome)) {
      expect(BIOME_PALETTES[biome]).toBeDefined();
    }
  });

  it('all biome palettes have valid hex colours', () => {
    for (const palette of Object.values(BIOME_PALETTES)) {
      assertPalette(palette);
    }
  });

  it('each biome palette has a non-empty name', () => {
    for (const palette of Object.values(BIOME_PALETTES)) {
      expect(palette.name.length).toBeGreaterThan(0);
    }
  });
});

// ── Rarity Palettes ───────────────────────────────────────────────────────────

describe('RARITY_PALETTES', () => {
  it('covers all Rarity enum values', () => {
    for (const rarity of Object.values(Rarity)) {
      expect(RARITY_PALETTES[rarity]).toBeDefined();
    }
  });

  it('all rarity palettes have valid hex colours', () => {
    for (const palette of Object.values(RARITY_PALETTES)) {
      assertPalette(palette);
    }
  });
});

// ── Rarity Visuals ────────────────────────────────────────────────────────────

describe('RARITY_VISUALS', () => {
  it('covers all Rarity enum values', () => {
    for (const rarity of Object.values(Rarity)) {
      expect(RARITY_VISUALS[rarity]).toBeDefined();
    }
  });

  it('glow radius increases with rarity tier', () => {
    expect(RARITY_VISUALS[Rarity.Common].glowRadius).toBeLessThan(
      RARITY_VISUALS[Rarity.Legendary].glowRadius,
    );
  });

  it('Common has zero glow radius', () => {
    expect(RARITY_VISUALS[Rarity.Common].glowRadius).toBe(0);
  });
});

// ── UI & VFX Palettes ─────────────────────────────────────────────────────────

describe('UI_PALETTE', () => {
  it('has valid hex colours', () => {
    assertPalette(UI_PALETTE);
  });
});

describe('VFX_PALETTE', () => {
  it('has valid hex colours', () => {
    assertPalette(VFX_PALETTE);
  });
});

// ── Icon Standards ────────────────────────────────────────────────────────────

describe('ICON_STANDARD', () => {
  it('has a 16px size with 1px safe zone', () => {
    expect(ICON_STANDARD.size).toBe(16);
    expect(ICON_STANDARD.safeZoneInset).toBe(1);
    expect(ICON_STANDARD.outline).toBe(true);
  });
});

describe('ICON_STANDARD_LARGE', () => {
  it('has a 32px size with 2px safe zone', () => {
    expect(ICON_STANDARD_LARGE.size).toBe(32);
    expect(ICON_STANDARD_LARGE.safeZoneInset).toBe(2);
  });
});

// ── Tile Standard ─────────────────────────────────────────────────────────────

describe('TILE_STANDARD', () => {
  it('uses 16px tiles with autotile', () => {
    expect(TILE_STANDARD.tileSize).toBe(16);
    expect(TILE_STANDARD.autotile).toBe(true);
    expect(TILE_STANDARD.variants).toBeGreaterThanOrEqual(2);
  });
});

// ── Sprite Specs ──────────────────────────────────────────────────────────────

describe('sprite specs', () => {
  it('PLAYER_SPRITE_SPEC is 16×16 with 4 frames', () => {
    expect(PLAYER_SPRITE_SPEC.frameWidth).toBe(16);
    expect(PLAYER_SPRITE_SPEC.frameHeight).toBe(16);
    expect(PLAYER_SPRITE_SPEC.framesPerAnim).toBe(4);
  });

  it('ENEMY_SPRITE_SPEC matches player dimensions', () => {
    expect(ENEMY_SPRITE_SPEC.frameWidth).toBe(PLAYER_SPRITE_SPEC.frameWidth);
    expect(ENEMY_SPRITE_SPEC.frameHeight).toBe(PLAYER_SPRITE_SPEC.frameHeight);
  });

  it('BOSS_SPRITE_SPEC is 32×32 with 6 frames', () => {
    expect(BOSS_SPRITE_SPEC.frameWidth).toBe(32);
    expect(BOSS_SPRITE_SPEC.frameHeight).toBe(32);
    expect(BOSS_SPRITE_SPEC.framesPerAnim).toBe(6);
  });

  it('NPC_SPRITE_SPEC is 16×16 with 2 frames', () => {
    expect(NPC_SPRITE_SPEC.frameWidth).toBe(16);
    expect(NPC_SPRITE_SPEC.frameHeight).toBe(16);
    expect(NPC_SPRITE_SPEC.framesPerAnim).toBe(2);
  });

  it('all specs have non-negative padding', () => {
    for (const spec of [PLAYER_SPRITE_SPEC, ENEMY_SPRITE_SPEC, BOSS_SPRITE_SPEC, NPC_SPRITE_SPEC]) {
      expect(spec.padding).toBeGreaterThanOrEqual(0);
    }
  });
});
