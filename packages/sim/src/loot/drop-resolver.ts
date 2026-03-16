import type { LootTable, ItemKind, RelicId } from '@echo-party/shared';
import { SeededRng } from '../rng';

/** A resolved loot drop */
export interface LootDrop {
  kind: ItemKind;
  value: number;
  /** Relic ID, present only when kind === 'relic' */
  relicId?: RelicId;
}

/** Apply coin scaling to a drop value when the drop is a coin. */
function scaleValue(kind: ItemKind, baseValue: number, coinScale: number): number {
  return kind === 'coin' ? Math.round(baseValue * coinScale) : baseValue;
}

/**
 * Roll a loot drop from a loot table using weighted random selection.
 * Returns null if nothing drops.
 *
 * @param noDropChance — base probability of no drop (default 0.3 = 30%).
 *   Contract modifiers adjust this via `lootChanceScale`.
 * @param coinScale — multiplier for coin values (default 1).
 */
export function rollDrop(
  rng: SeededRng,
  table: LootTable,
  noDropChance = 0.3,
  coinScale = 1,
): LootDrop | null {
  if (table.length === 0) {
    throw new Error('rollDrop: loot table must not be empty');
  }

  const totalWeight = table.reduce((sum, entry) => sum + entry.weight, 0);
  if (totalWeight <= 0) {
    throw new Error('rollDrop: loot table totalWeight must be greater than 0');
  }

  // No-drop check
  if (rng.next() < noDropChance) return null;

  let roll = rng.next() * totalWeight;

  for (const entry of table) {
    roll -= entry.weight;
    if (roll <= 0) {
      const drop: LootDrop = { kind: entry.kind, value: scaleValue(entry.kind, entry.value, coinScale) };
      if (entry.relicId !== undefined) drop.relicId = entry.relicId;
      return drop;
    }
  }

  // Fallback to last entry
  const last = table[table.length - 1];
  const drop: LootDrop = { kind: last.kind, value: scaleValue(last.kind, last.value, coinScale) };
  if (last.relicId !== undefined) drop.relicId = last.relicId;
  return drop;
}
