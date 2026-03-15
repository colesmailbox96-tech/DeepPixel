import type { LootTable, ItemKind } from '@echo-party/shared';
import { SeededRng } from '../rng';

/** A resolved loot drop */
export interface LootDrop {
  kind: ItemKind;
  value: number;
}

/**
 * Roll a loot drop from a loot table using weighted random selection.
 * Returns null if nothing drops (30% chance of no drop).
 */
export function rollDrop(rng: SeededRng, table: LootTable): LootDrop | null {
  if (table.length === 0) {
    throw new Error('rollDrop: loot table must not be empty');
  }

  const totalWeight = table.reduce((sum, entry) => sum + entry.weight, 0);
  if (totalWeight <= 0) {
    throw new Error('rollDrop: loot table totalWeight must be greater than 0');
  }

  // 30% chance of no drop
  if (rng.next() < 0.3) return null;

  let roll = rng.next() * totalWeight;

  for (const entry of table) {
    roll -= entry.weight;
    if (roll <= 0) {
      return { kind: entry.kind, value: entry.value };
    }
  }

  // Fallback to last entry
  const last = table[table.length - 1];
  return { kind: last.kind, value: last.value };
}
