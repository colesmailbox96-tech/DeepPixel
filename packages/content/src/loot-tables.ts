import { Rarity, type LootTable } from '@echo-party/shared';

/** Default loot table used when an enemy dies */
export const DEFAULT_LOOT_TABLE: LootTable = [
  { kind: 'health_potion', rarity: Rarity.Common, weight: 3, value: 20 },
  { kind: 'coin', rarity: Rarity.Common, weight: 7, value: 5 },
];
