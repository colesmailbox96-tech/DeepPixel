import { Rarity } from './types';

/** Types of items that can drop */
export type ItemKind = 'health_potion' | 'coin';

/** Loot table entry */
export interface LootEntry {
  kind: ItemKind;
  rarity: Rarity;
  /** Drop chance weight (higher = more likely) */
  weight: number;
  /** Amount granted when picked up */
  value: number;
}

/** A full loot table is just an array of weighted entries */
export type LootTable = LootEntry[];
