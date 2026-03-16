import { describe, it, expect } from 'vitest';
import { computeAtlasSize, packSprites, generateManifest } from './atlas-pack';
import type { SpriteInput } from './atlas-pack';

// ── computeAtlasSize ──────────────────────────────────────────────────────────

describe('computeAtlasSize', () => {
  it('returns 64 for a single small sprite', () => {
    const sprites: SpriteInput[] = [{ id: 'a', width: 16, height: 16 }];
    expect(computeAtlasSize(sprites, 1)).toBe(64);
  });

  it('scales up for many sprites', () => {
    const sprites: SpriteInput[] = Array.from({ length: 100 }, (_, i) => ({
      id: `s${i}`,
      width: 16,
      height: 16,
    }));
    const size = computeAtlasSize(sprites, 1);
    expect(size).toBeGreaterThanOrEqual(128);
    // Power of two
    expect(Math.log2(size) % 1).toBe(0);
  });

  it('returns a power of two', () => {
    const sprites: SpriteInput[] = [
      { id: 'a', width: 64, height: 64 },
      { id: 'b', width: 64, height: 64 },
    ];
    const size = computeAtlasSize(sprites, 0);
    expect(Math.log2(size) % 1).toBe(0);
  });
});

// ── packSprites ───────────────────────────────────────────────────────────────

describe('packSprites', () => {
  it('packs a single sprite at origin', () => {
    const sprites: SpriteInput[] = [{ id: 'only', width: 16, height: 16 }];
    const manifest = packSprites(sprites, 0);
    expect(manifest.entries).toHaveLength(1);
    expect(manifest.entries[0]).toEqual({ id: 'only', x: 0, y: 0, width: 16, height: 16 });
  });

  it('packs multiple sprites without overlap', () => {
    const sprites: SpriteInput[] = [
      { id: 'a', width: 16, height: 16 },
      { id: 'b', width: 16, height: 16 },
      { id: 'c', width: 16, height: 16 },
    ];
    const manifest = packSprites(sprites, 1);
    expect(manifest.entries).toHaveLength(3);

    // No two entries should overlap
    for (let i = 0; i < manifest.entries.length; i++) {
      for (let j = i + 1; j < manifest.entries.length; j++) {
        const a = manifest.entries[i];
        const b = manifest.entries[j];
        const noOverlap =
          a.x + a.width <= b.x ||
          b.x + b.width <= a.x ||
          a.y + a.height <= b.y ||
          b.y + b.height <= a.y;
        expect(noOverlap).toBe(true);
      }
    }
  });

  it('all entries fit within atlas bounds', () => {
    const sprites: SpriteInput[] = Array.from({ length: 20 }, (_, i) => ({
      id: `icon-${i}`,
      width: 16,
      height: 16,
    }));
    const manifest = packSprites(sprites, 1);
    for (const entry of manifest.entries) {
      expect(entry.x + entry.width).toBeLessThanOrEqual(manifest.atlasWidth);
      expect(entry.y + entry.height).toBeLessThanOrEqual(manifest.atlasHeight);
    }
  });

  it('atlas dimensions are power-of-two', () => {
    const sprites: SpriteInput[] = [
      { id: 'a', width: 32, height: 32 },
      { id: 'b', width: 32, height: 32 },
    ];
    const manifest = packSprites(sprites, 1);
    expect(Math.log2(manifest.atlasWidth) % 1).toBe(0);
    expect(Math.log2(manifest.atlasHeight) % 1).toBe(0);
  });
});

// ── generateManifest ──────────────────────────────────────────────────────────

describe('generateManifest', () => {
  it('produces valid JSON with all entries', () => {
    const manifest = packSprites([{ id: 'test', width: 16, height: 16 }], 0);
    const json = generateManifest(manifest);
    const parsed = JSON.parse(json);
    expect(parsed.atlasWidth).toBe(manifest.atlasWidth);
    expect(parsed.entries).toHaveLength(1);
    expect(parsed.entries[0].id).toBe('test');
  });
});
