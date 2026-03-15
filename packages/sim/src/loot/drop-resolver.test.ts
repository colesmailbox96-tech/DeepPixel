import { describe, it, expect } from 'vitest';
import { SeededRng } from '../rng';
import { rollDrop } from './drop-resolver';
import { Rarity, type LootTable } from '@echo-party/shared';

const testTable: LootTable = [
  { kind: 'health_potion', rarity: Rarity.Common, weight: 3, value: 20 },
  { kind: 'coin', rarity: Rarity.Common, weight: 7, value: 5 },
];

describe('rollDrop', () => {
  it('returns null or a valid drop', () => {
    const rng = new SeededRng('drop-test');
    for (let i = 0; i < 100; i++) {
      const drop = rollDrop(rng, testTable);
      if (drop !== null) {
        expect(['health_potion', 'coin']).toContain(drop.kind);
        expect(drop.value).toBeGreaterThan(0);
      }
    }
  });

  it('is deterministic for the same seed', () => {
    const rng1 = new SeededRng('det-drop');
    const rng2 = new SeededRng('det-drop');

    const drops1 = Array.from({ length: 50 }, () => rollDrop(rng1, testTable));
    const drops2 = Array.from({ length: 50 }, () => rollDrop(rng2, testTable));

    expect(drops1).toEqual(drops2);
  });

  it('sometimes returns null (no drop)', () => {
    const rng = new SeededRng('null-test');
    const results = Array.from({ length: 100 }, () => rollDrop(rng, testTable));
    const nullCount = results.filter((d) => d === null).length;
    // With 30% no-drop chance, we expect ~30 nulls in 100 rolls
    expect(nullCount).toBeGreaterThan(0);
    expect(nullCount).toBeLessThan(100);
  });

  it('throws on empty loot table', () => {
    const rng = new SeededRng('empty-table');
    expect(() => rollDrop(rng, [])).toThrow('rollDrop: loot table must not be empty');
  });

  it('throws on zero-weight loot table', () => {
    const rng = new SeededRng('zero-weight');
    const zeroTable: LootTable = [{ kind: 'coin', rarity: Rarity.Common, weight: 0, value: 5 }];
    // The no-drop check consumes one rng call; use a seed that skips it
    // Run enough times that at least one attempt gets past the 30% no-drop gate
    let threw = false;
    for (let i = 0; i < 100; i++) {
      try {
        rollDrop(new SeededRng(`zero-weight-${i}`), zeroTable);
      } catch (e: unknown) {
        expect((e as Error).message).toBe(
          'rollDrop: loot table totalWeight must be greater than 0',
        );
        threw = true;
        break;
      }
    }
    expect(threw).toBe(true);
  });
});
