import { describe, it, expect } from 'vitest';
import {
  Rarity,
  Difficulty,
  DamageType,
  Direction,
  TILE_SIZE,
  GAME_WIDTH,
  GAME_HEIGHT,
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
  SCALE_FACTOR,
} from '@echo-party/shared';

describe('shared types', () => {
  it('exports Rarity enum values', () => {
    expect(Rarity.Common).toBe('common');
    expect(Rarity.Legendary).toBe('legendary');
  });

  it('exports Difficulty enum values', () => {
    expect(Difficulty.Normal).toBe('normal');
    expect(Difficulty.Hard).toBe('hard');
    expect(Difficulty.Nightmare).toBe('nightmare');
  });

  it('exports DamageType enum values', () => {
    expect(DamageType.Physical).toBe('physical');
    expect(DamageType.Fire).toBe('fire');
  });

  it('exports Direction enum values', () => {
    expect(Direction.North).toBe('N');
    expect(Direction.SouthEast).toBe('SE');
  });
});

describe('shared constants', () => {
  it('exports valid tile and viewport dimensions', () => {
    expect(TILE_SIZE).toBe(16);
    expect(GAME_WIDTH).toBe(480);
    expect(GAME_HEIGHT).toBe(270);
    expect(SCALE_FACTOR).toBe(3);
    expect(VIEWPORT_WIDTH).toBe(GAME_WIDTH * SCALE_FACTOR);
    expect(VIEWPORT_HEIGHT).toBe(GAME_HEIGHT * SCALE_FACTOR);
  });
});
