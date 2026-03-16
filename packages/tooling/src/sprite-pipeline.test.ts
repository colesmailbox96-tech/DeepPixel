import { describe, it, expect } from 'vitest';
import {
  validateSpriteSheet,
  validateAnimations,
  validateCharacterSheet,
  validateIcon,
} from './sprite-pipeline';
import type { CharacterSpriteSheet, AnimationDef } from '@echo-party/shared';

// ── validateSpriteSheet ───────────────────────────────────────────────────────

describe('validateSpriteSheet', () => {
  it('passes for correctly sized sheet', () => {
    // 4 columns × 16px + 3 gaps × 1px padding = 67, 2 rows × 16px + 1 gap × 1px = 33
    const result = validateSpriteSheet(
      67,
      33,
      {
        frameWidth: 16,
        frameHeight: 16,
        framesPerAnim: 4,
        padding: 1,
      },
      4,
      2,
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails if width is wrong', () => {
    const result = validateSpriteSheet(
      100,
      33,
      {
        frameWidth: 16,
        frameHeight: 16,
        framesPerAnim: 4,
        padding: 1,
      },
      4,
      2,
    );
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('width');
  });

  it('fails if height is wrong', () => {
    const result = validateSpriteSheet(
      67,
      100,
      {
        frameWidth: 16,
        frameHeight: 16,
        framesPerAnim: 4,
        padding: 1,
      },
      4,
      2,
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('height'))).toBe(true);
  });

  it('works with zero padding', () => {
    const result = validateSpriteSheet(
      64,
      32,
      {
        frameWidth: 16,
        frameHeight: 16,
        framesPerAnim: 4,
        padding: 0,
      },
      4,
      2,
    );
    expect(result.valid).toBe(true);
  });
});

// ── validateAnimations ────────────────────────────────────────────────────────

describe('validateAnimations', () => {
  it('passes for valid animation defs', () => {
    const anims: AnimationDef[] = [
      { key: 'idle', startFrame: 0, endFrame: 3, frameRate: 8, repeat: -1 },
      { key: 'walk', startFrame: 4, endFrame: 7, frameRate: 10, repeat: -1 },
    ];
    const result = validateAnimations(anims, 8);
    expect(result.valid).toBe(true);
  });

  it('fails if endFrame exceeds total frames', () => {
    const anims: AnimationDef[] = [
      { key: 'walk', startFrame: 0, endFrame: 10, frameRate: 8, repeat: -1 },
    ];
    const result = validateAnimations(anims, 8);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('endFrame');
  });

  it('fails for negative startFrame', () => {
    const anims: AnimationDef[] = [
      { key: 'bad', startFrame: -1, endFrame: 3, frameRate: 8, repeat: -1 },
    ];
    const result = validateAnimations(anims, 8);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('negative');
  });

  it('fails if endFrame < startFrame', () => {
    const anims: AnimationDef[] = [
      { key: 'bad', startFrame: 5, endFrame: 2, frameRate: 8, repeat: 0 },
    ];
    const result = validateAnimations(anims, 8);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('before startFrame');
  });

  it('fails for non-positive frameRate', () => {
    const anims: AnimationDef[] = [
      { key: 'bad', startFrame: 0, endFrame: 3, frameRate: 0, repeat: -1 },
    ];
    const result = validateAnimations(anims, 8);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('frameRate');
  });
});

// ── validateCharacterSheet ────────────────────────────────────────────────────

describe('validateCharacterSheet', () => {
  it('passes for a valid character sprite sheet', () => {
    const sheet: CharacterSpriteSheet = {
      id: 'player',
      spec: { frameWidth: 16, frameHeight: 16, framesPerAnim: 4, padding: 1 },
      animations: [
        { key: 'idle', startFrame: 0, endFrame: 3, frameRate: 8, repeat: -1 },
        { key: 'walk', startFrame: 4, endFrame: 7, frameRate: 10, repeat: -1 },
      ],
    };
    // 4 cols × (16+1) - 1 = 67, 2 rows × (16+1) - 1 = 33, total frames = 8
    const result = validateCharacterSheet(sheet, 67, 33, 4, 2);
    expect(result.valid).toBe(true);
  });

  it('fails for mismatched dimensions and bad animations', () => {
    const sheet: CharacterSpriteSheet = {
      id: 'broken',
      spec: { frameWidth: 16, frameHeight: 16, framesPerAnim: 4, padding: 1 },
      animations: [{ key: 'idle', startFrame: 0, endFrame: 20, frameRate: 8, repeat: -1 }],
    };
    const result = validateCharacterSheet(sheet, 100, 100, 4, 2);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});

// ── validateIcon ──────────────────────────────────────────────────────────────

describe('validateIcon', () => {
  it('passes for correctly sized icon', () => {
    const result = validateIcon(16, 16, {
      size: 16,
      safeZoneInset: 1,
      outline: true,
      outlineColor: '111111',
    });
    expect(result.valid).toBe(true);
  });

  it('fails for wrong width', () => {
    const result = validateIcon(32, 16, {
      size: 16,
      safeZoneInset: 1,
      outline: true,
      outlineColor: '111111',
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('width');
  });

  it('fails for wrong height', () => {
    const result = validateIcon(16, 32, {
      size: 16,
      safeZoneInset: 1,
      outline: true,
      outlineColor: '111111',
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('height');
  });
});
