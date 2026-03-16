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
    expect(() => rollDrop(rng, zeroTable)).toThrow(
      'rollDrop: loot table totalWeight must be greater than 0',
    );
  });
});

// ─── Phase 5: Enhanced drop resolver ──────────────────────────────────────────

describe('rollDrop Phase 5 features', () => {
  it('respects custom noDropChance', () => {
    const rng = new SeededRng('nodrop-0');
    // noDropChance = 0 → always drops
    const results = Array.from({ length: 50 }, () => rollDrop(rng, testTable, 0));
    expect(results.every((d) => d !== null)).toBe(true);
  });

  it('noDropChance = 1 → always no drop', () => {
    const rng = new SeededRng('nodrop-1');
    const results = Array.from({ length: 50 }, () => rollDrop(rng, testTable, 1));
    expect(results.every((d) => d === null)).toBe(true);
  });

  it('applies coinScale to coin drops', () => {
    const rng = new SeededRng('coin-scale');
    // coinScale 3 → coin value should be 15 instead of 5
    const results = Array.from({ length: 100 }, () => rollDrop(rng, testTable, 0, 3));
    const coins = results.filter((d) => d !== null && d.kind === 'coin');
    expect(coins.length).toBeGreaterThan(0);
    for (const c of coins) {
      expect(c!.value).toBe(15);
    }
  });

  it('preserves relicId from loot table entries', () => {
    const relicTable: LootTable = [
      { kind: 'relic', rarity: Rarity.Uncommon, weight: 10, value: 0, relicId: 'relic-test' },
    ];
    const rng = new SeededRng('relic-drop');
    const drop = rollDrop(rng, relicTable, 0);
    expect(drop).not.toBeNull();
    expect(drop!.kind).toBe('relic');
    expect(drop!.relicId).toBe('relic-test');
  });

  it('coinScale does not affect non-coin drops', () => {
    const potionTable: LootTable = [
      { kind: 'health_potion', rarity: Rarity.Common, weight: 10, value: 20 },
    ];
    const rng = new SeededRng('potion-scale');
    const drop = rollDrop(rng, potionTable, 0, 5);
    expect(drop!.value).toBe(20); // unchanged
  });
});
