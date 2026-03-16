import { Rarity, type LootTable } from '@echo-party/shared';

/** Default loot table used when an enemy dies */
export const DEFAULT_LOOT_TABLE: LootTable = [
  { kind: 'health_potion', rarity: Rarity.Common, weight: 3, value: 20 },
  { kind: 'coin', rarity: Rarity.Common, weight: 7, value: 5 },
];

/** Uncommon+ loot table — drops from elites and harder enemies */
export const ELITE_LOOT_TABLE: LootTable = [
  { kind: 'health_potion', rarity: Rarity.Uncommon, weight: 2, value: 35 },
  { kind: 'coin', rarity: Rarity.Uncommon, weight: 4, value: 15 },
  { kind: 'relic', rarity: Rarity.Uncommon, weight: 2, value: 0, relicId: 'relic-vampiric-fang' },
  { kind: 'relic', rarity: Rarity.Uncommon, weight: 2, value: 0, relicId: 'relic-power-gauntlet' },
];

/** Rare loot table — boss / late-run rewards */
export const RARE_LOOT_TABLE: LootTable = [
  { kind: 'health_potion', rarity: Rarity.Rare, weight: 1, value: 50 },
  { kind: 'coin', rarity: Rarity.Rare, weight: 3, value: 25 },
  { kind: 'relic', rarity: Rarity.Rare, weight: 2, value: 0, relicId: 'relic-berserker-helm' },
  { kind: 'relic', rarity: Rarity.Rare, weight: 2, value: 0, relicId: 'relic-siphon-amulet' },
  { kind: 'relic', rarity: Rarity.Epic, weight: 1, value: 0, relicId: 'relic-lifesteal-blade' },
];

/** Room-clear reward table */
export const ROOM_CLEAR_LOOT_TABLE: LootTable = [
  { kind: 'coin', rarity: Rarity.Common, weight: 5, value: 10 },
  { kind: 'health_potion', rarity: Rarity.Common, weight: 3, value: 15 },
  { kind: 'relic', rarity: Rarity.Common, weight: 1, value: 0, relicId: 'relic-lucky-coin' },
  { kind: 'relic', rarity: Rarity.Common, weight: 1, value: 0, relicId: 'relic-thorn-ring' },
];
