import { Rarity, type RelicId } from './types';

/** Types of items that can drop */
export type ItemKind = 'health_potion' | 'coin' | 'relic' | 'equipment';

/** Loot table entry */
export interface LootEntry {
  kind: ItemKind;
  rarity: Rarity;
  /** Drop chance weight (higher = more likely) */
  weight: number;
  /** Amount granted when picked up (HP for potions, gold for coins, 0 for relics) */
  value: number;
  /** Optional relic ID — only used when kind === 'relic' */
  relicId?: RelicId;
}

/** A full loot table is just an array of weighted entries */
export type LootTable = LootEntry[];
