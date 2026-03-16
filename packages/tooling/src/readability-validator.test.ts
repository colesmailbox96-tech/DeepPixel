import { describe, it, expect } from 'vitest';
import {
  relativeLuminance,
  contrastRatio,
  validateContrast,
  validateBatch,
  MIN_CONTRAST,
} from './readability-validator';

// ── relativeLuminance ─────────────────────────────────────────────────────────

describe('relativeLuminance', () => {
  it('returns 0 for pure black', () => {
    expect(relativeLuminance('000000')).toBeCloseTo(0, 4);
  });

  it('returns 1 for pure white', () => {
    expect(relativeLuminance('ffffff')).toBeCloseTo(1, 4);
  });

  it('returns ~0.2126 for pure red', () => {
    expect(relativeLuminance('ff0000')).toBeCloseTo(0.2126, 3);
  });
});

// ── contrastRatio ─────────────────────────────────────────────────────────────

describe('contrastRatio', () => {
  it('black vs white is 21:1', () => {
    expect(contrastRatio('000000', 'ffffff')).toBeCloseTo(21, 0);
  });

  it('same colour is 1:1', () => {
    expect(contrastRatio('888888', '888888')).toBeCloseTo(1, 1);
  });

  it('is commutative', () => {
    const a = contrastRatio('ff0000', '0000ff');
    const b = contrastRatio('0000ff', 'ff0000');
    expect(a).toBeCloseTo(b, 4);
  });

  it('returns a value ≥ 1', () => {
    expect(contrastRatio('123456', '654321')).toBeGreaterThanOrEqual(1);
  });
});

// ── validateContrast ──────────────────────────────────────────────────────────

describe('validateContrast', () => {
  it('passes for black on white (high contrast)', () => {
    const result = validateContrast('test', '000000', 'ffffff', 'ui_text');
    expect(result.passed).toBe(true);
    expect(result.contrastRatio).toBeGreaterThan(MIN_CONTRAST['ui_text']);
  });

  it('fails for similar colours', () => {
    const result = validateContrast('test', '888888', '999999', 'ui_text');
    expect(result.passed).toBe(false);
    expect(result.notes).toContain('below minimum');
  });

  it('uses sprite category by default', () => {
    const result = validateContrast('test', '000000', 'ffffff');
    expect(result.minimumRequired).toBe(MIN_CONTRAST['sprite']);
  });

  it('assetId is preserved in result', () => {
    const result = validateContrast('my-sprite', '000000', 'ffffff');
    expect(result.assetId).toBe('my-sprite');
  });
});

// ── validateBatch ─────────────────────────────────────────────────────────────

describe('validateBatch', () => {
  it('returns one result per item', () => {
    const results = validateBatch([
      { assetId: 'a', fg: '000000', bg: 'ffffff' },
      { assetId: 'b', fg: '888888', bg: '888888' },
    ]);
    expect(results).toHaveLength(2);
    expect(results[0].passed).toBe(true);
    expect(results[1].passed).toBe(false);
  });

  it('handles empty input', () => {
    const results = validateBatch([]);
    expect(results).toHaveLength(0);
  });
});

// ── MIN_CONTRAST thresholds ───────────────────────────────────────────────────

describe('MIN_CONTRAST', () => {
  it('defines sprite, icon, ui_text, vfx categories', () => {
    expect(MIN_CONTRAST['sprite']).toBeDefined();
    expect(MIN_CONTRAST['icon']).toBeDefined();
    expect(MIN_CONTRAST['ui_text']).toBeDefined();
    expect(MIN_CONTRAST['vfx']).toBeDefined();
  });

  it('ui_text has the highest threshold', () => {
    expect(MIN_CONTRAST['ui_text']).toBeGreaterThan(MIN_CONTRAST['sprite']);
    expect(MIN_CONTRAST['ui_text']).toBeGreaterThan(MIN_CONTRAST['vfx']);
  });
});
