import { describe, it, expect } from 'vitest';
import { validateVfxEffect, validateVfxRegistry } from './vfx-validator';
import type { VfxEffectDef, VfxRegistry } from '@echo-party/shared';

// ── Minimal valid fixture ──────────────────────────────────────────────────────

const MINIMAL_VALID: VfxEffectDef = {
  id: 'test_effect',
  triggers: ['on_hit'],
};

// ── validateVfxEffect ─────────────────────────────────────────────────────────

describe('validateVfxEffect', () => {
  it('accepts a minimal valid effect', () => {
    const result = validateVfxEffect(MINIMAL_VALID);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects an effect with an empty id', () => {
    const result = validateVfxEffect({ ...MINIMAL_VALID, id: '' });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('id'))).toBe(true);
  });

  it('rejects an effect with uppercase characters in id', () => {
    const result = validateVfxEffect({ ...MINIMAL_VALID, id: 'My_Effect' });
    expect(result.valid).toBe(false);
  });

  it('allows hyphens and underscores in id', () => {
    const result = validateVfxEffect({ ...MINIMAL_VALID, id: 'my-effect_v2' });
    expect(result.valid).toBe(true);
  });

  it('rejects an effect with no triggers', () => {
    const result = validateVfxEffect({ ...MINIMAL_VALID, triggers: [] });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('triggers'))).toBe(true);
  });

  // ── particles ──────────────────────────────────────────────────────────────

  describe('particles', () => {
    it('accepts valid particle config', () => {
      const result = validateVfxEffect({
        ...MINIMAL_VALID,
        particles: {
          count: 8,
          distance: { min: 10, max: 30 },
          lifetimeMs: { min: 200, max: 500 },
          radius: 3,
          colors: [0xffffff, 0xff8844],
          blendMode: 'additive',
        },
      });
      expect(result.valid).toBe(true);
    });

    it('rejects count = 0', () => {
      const result = validateVfxEffect({
        ...MINIMAL_VALID,
        particles: {
          count: 0,
          distance: { min: 10, max: 30 },
          lifetimeMs: { min: 200, max: 500 },
          radius: 3,
          colors: [0xffffff],
          blendMode: 'normal',
        },
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('particles.count'))).toBe(true);
    });

    it('rejects count > 64', () => {
      const result = validateVfxEffect({
        ...MINIMAL_VALID,
        particles: {
          count: 65,
          distance: { min: 10, max: 30 },
          lifetimeMs: { min: 200, max: 500 },
          radius: 3,
          colors: [0xffffff],
          blendMode: 'normal',
        },
      });
      expect(result.valid).toBe(false);
    });

    it('rejects distance.min > distance.max', () => {
      const result = validateVfxEffect({
        ...MINIMAL_VALID,
        particles: {
          count: 4,
          distance: { min: 40, max: 10 },
          lifetimeMs: { min: 200, max: 500 },
          radius: 2,
          colors: [0xffffff],
          blendMode: 'normal',
        },
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('particles.distance'))).toBe(true);
    });

    it('rejects lifetimeMs.min < 50', () => {
      const result = validateVfxEffect({
        ...MINIMAL_VALID,
        particles: {
          count: 4,
          distance: { min: 10, max: 30 },
          lifetimeMs: { min: 10, max: 200 },
          radius: 2,
          colors: [0xffffff],
          blendMode: 'normal',
        },
      });
      expect(result.valid).toBe(false);
    });

    it('rejects empty colors array', () => {
      const result = validateVfxEffect({
        ...MINIMAL_VALID,
        particles: {
          count: 4,
          distance: { min: 10, max: 30 },
          lifetimeMs: { min: 200, max: 500 },
          radius: 2,
          colors: [],
          blendMode: 'normal',
        },
      });
      expect(result.valid).toBe(false);
    });

    it('rejects an out-of-range colour', () => {
      const result = validateVfxEffect({
        ...MINIMAL_VALID,
        particles: {
          count: 4,
          distance: { min: 10, max: 30 },
          lifetimeMs: { min: 200, max: 500 },
          radius: 2,
          colors: [0x1000000], // > 0xffffff
          blendMode: 'normal',
        },
      });
      expect(result.valid).toBe(false);
    });
  });

  // ── hitFlash ───────────────────────────────────────────────────────────────

  describe('hitFlash', () => {
    it('accepts valid hitFlash config', () => {
      const result = validateVfxEffect({
        ...MINIMAL_VALID,
        hitFlash: { color: 0xffffff, alpha: 0.8, durationMs: 100 },
      });
      expect(result.valid).toBe(true);
    });

    it('rejects durationMs > 300', () => {
      const result = validateVfxEffect({
        ...MINIMAL_VALID,
        hitFlash: { color: 0xffffff, alpha: 0.8, durationMs: 400 },
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('hitFlash.durationMs'))).toBe(true);
    });

    it('rejects alpha > 1', () => {
      const result = validateVfxEffect({
        ...MINIMAL_VALID,
        hitFlash: { color: 0xffffff, alpha: 1.5, durationMs: 100 },
      });
      expect(result.valid).toBe(false);
    });

    it('rejects invalid colour', () => {
      const result = validateVfxEffect({
        ...MINIMAL_VALID,
        hitFlash: { color: -1, alpha: 0.8, durationMs: 100 },
      });
      expect(result.valid).toBe(false);
    });
  });

  // ── shake ──────────────────────────────────────────────────────────────────

  describe('shake', () => {
    it('accepts valid shake config', () => {
      const result = validateVfxEffect({
        ...MINIMAL_VALID,
        shake: { intensity: 0.005, durationMs: 80 },
      });
      expect(result.valid).toBe(true);
    });

    it('rejects intensity > 0.05', () => {
      const result = validateVfxEffect({
        ...MINIMAL_VALID,
        shake: { intensity: 0.1, durationMs: 80 },
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('shake.intensity'))).toBe(true);
    });

    it('rejects durationMs > 1000', () => {
      const result = validateVfxEffect({
        ...MINIMAL_VALID,
        shake: { intensity: 0.004, durationMs: 2000 },
      });
      expect(result.valid).toBe(false);
    });
  });

  // ── lootGlow ───────────────────────────────────────────────────────────────

  describe('lootGlow', () => {
    it('accepts valid lootGlow config', () => {
      const result = validateVfxEffect({
        ...MINIMAL_VALID,
        lootGlow: { color: 0x44aa44, radius: 10, maxAlpha: 0.4, pulsePeriodMs: 2000 },
      });
      expect(result.valid).toBe(true);
    });

    it('rejects pulsePeriodMs < 400', () => {
      const result = validateVfxEffect({
        ...MINIMAL_VALID,
        lootGlow: { color: 0x44aa44, radius: 10, maxAlpha: 0.4, pulsePeriodMs: 100 },
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('lootGlow.pulsePeriodMs'))).toBe(true);
    });

    it('rejects pulsePeriodMs > 5000', () => {
      const result = validateVfxEffect({
        ...MINIMAL_VALID,
        lootGlow: { color: 0x44aa44, radius: 10, maxAlpha: 0.4, pulsePeriodMs: 6000 },
      });
      expect(result.valid).toBe(false);
    });

    it('rejects radius = 0', () => {
      const result = validateVfxEffect({
        ...MINIMAL_VALID,
        lootGlow: { color: 0x44aa44, radius: 0, maxAlpha: 0.4, pulsePeriodMs: 2000 },
      });
      expect(result.valid).toBe(false);
    });
  });

  // ── ambient ────────────────────────────────────────────────────────────────

  describe('ambient', () => {
    it('accepts valid ambient config', () => {
      const result = validateVfxEffect({
        ...MINIMAL_VALID,
        ambient: {
          emitRatePerSecond: 3,
          distance: { min: 20, max: 50 },
          lifetimeMs: { min: 800, max: 2000 },
          radius: 2,
          colors: [0x3a5a40],
          blendMode: 'normal',
          directionDeg: 270,
          spreadDeg: 25,
        },
      });
      expect(result.valid).toBe(true);
    });

    it('rejects emitRatePerSecond > 30', () => {
      const result = validateVfxEffect({
        ...MINIMAL_VALID,
        ambient: {
          emitRatePerSecond: 50,
          distance: { min: 20, max: 50 },
          lifetimeMs: { min: 800, max: 2000 },
          radius: 2,
          colors: [0x3a5a40],
          blendMode: 'normal',
          directionDeg: 270,
          spreadDeg: 25,
        },
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('emitRatePerSecond'))).toBe(true);
    });

    it('rejects spreadDeg > 180', () => {
      const result = validateVfxEffect({
        ...MINIMAL_VALID,
        ambient: {
          emitRatePerSecond: 3,
          distance: { min: 20, max: 50 },
          lifetimeMs: { min: 800, max: 2000 },
          radius: 2,
          colors: [0x3a5a40],
          blendMode: 'normal',
          directionDeg: 270,
          spreadDeg: 200,
        },
      });
      expect(result.valid).toBe(false);
    });

    it('rejects lifetimeMs.min < 100', () => {
      const result = validateVfxEffect({
        ...MINIMAL_VALID,
        ambient: {
          emitRatePerSecond: 3,
          distance: { min: 20, max: 50 },
          lifetimeMs: { min: 50, max: 2000 },
          radius: 2,
          colors: [0x3a5a40],
          blendMode: 'normal',
          directionDeg: 270,
          spreadDeg: 25,
        },
      });
      expect(result.valid).toBe(false);
    });
  });
});

// ── validateVfxRegistry ───────────────────────────────────────────────────────

describe('validateVfxRegistry', () => {
  it('returns empty map for a fully valid registry', () => {
    const registry: VfxRegistry = {
      test_a: { id: 'test_a', triggers: ['on_hit'] },
      test_b: { id: 'test_b', triggers: ['on_kill'] },
    };
    const failures = validateVfxRegistry(registry);
    expect(failures.size).toBe(0);
  });

  it('reports only the failing entries', () => {
    const registry: VfxRegistry = {
      valid_one: { id: 'valid_one', triggers: ['on_hit'] },
      bad_one: {
        id: 'bad_one',
        triggers: [],
        hitFlash: { color: 0xff0000, alpha: 0.8, durationMs: 500 }, // durationMs too long
      },
    };
    const failures = validateVfxRegistry(registry);
    expect(failures.size).toBe(1);
    expect(failures.has('bad_one')).toBe(true);
    expect(failures.has('valid_one')).toBe(false);
  });

  it('returns empty map for an empty registry', () => {
    const failures = validateVfxRegistry({});
    expect(failures.size).toBe(0);
  });

  it('validates the production VFX_EFFECTS registry without failures', async () => {
    const { VFX_EFFECTS } = await import('@echo-party/content');
    const failures = validateVfxRegistry(VFX_EFFECTS);
    const messages: string[] = [];
    for (const [id, result] of failures) {
      messages.push(`${id}: ${result.errors.join('; ')}`);
    }
    expect(failures.size, messages.join('\n')).toBe(0);
  });
});
