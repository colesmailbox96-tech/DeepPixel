import type { ContractModifier } from '@echo-party/shared';

// ── Scaling family — make enemies tougher ────────────────────────────────────

export const MOD_FORTIFIED: ContractModifier = {
  id: 'mod-fortified',
  family: 'scaling',
  name: 'Fortified',
  description: 'Enemies have 25% more HP.',
  enemyHpScale: 1.25,
};

export const MOD_ENRAGED: ContractModifier = {
  id: 'mod-enraged',
  family: 'scaling',
  name: 'Enraged',
  description: 'Enemies deal 20% more damage.',
  enemyAtkScale: 1.2,
};

export const MOD_DEEP_DELVE: ContractModifier = {
  id: 'mod-deep-delve',
  family: 'scaling',
  name: 'Deep Delve',
  description: '2 extra rooms added to the run.',
  extraRooms: 2,
};

// ── Hazard family — environmental dangers ────────────────────────────────────

export const MOD_ELITE_SURGE: ContractModifier = {
  id: 'mod-elite-surge',
  family: 'hazard',
  name: 'Elite Surge',
  description: 'Elites appear more frequently.',
  boostedElites: true,
};

export const MOD_ARMORED_HORDE: ContractModifier = {
  id: 'mod-armored-horde',
  family: 'hazard',
  name: 'Armored Horde',
  description: 'Enemies have 30% more HP and 10% more attack.',
  enemyHpScale: 1.3,
  enemyAtkScale: 1.1,
};

export const MOD_CURSED: ContractModifier = {
  id: 'mod-cursed',
  family: 'hazard',
  name: 'Cursed',
  description: 'Enemies have 50% more HP and deal 40% more damage.',
  enemyHpScale: 1.5,
  enemyAtkScale: 1.4,
};

export const MOD_GLASS_CANNON: ContractModifier = {
  id: 'mod-glass-cannon',
  family: 'hazard',
  name: 'Glass Cannon',
  description: 'Enemies deal 50% more damage but have 30% less HP.',
  enemyHpScale: 0.7,
  enemyAtkScale: 1.5,
};

export const MOD_ELITE_TIDE: ContractModifier = {
  id: 'mod-elite-tide',
  family: 'hazard',
  name: 'Elite Tide',
  description: 'An extra room of elites floods the dungeon.',
  boostedElites: true,
  extraRooms: 1,
};

// ── Reward family — alter rewards ────────────────────────────────────────────

export const MOD_TREASURE_HUNT: ContractModifier = {
  id: 'mod-treasure-hunt',
  family: 'reward',
  name: 'Treasure Hunt',
  description: 'Loot drops 50% more often and coins are worth double.',
  lootChanceScale: 1.5,
  coinScale: 2.0,
};

export const MOD_SCAVENGER: ContractModifier = {
  id: 'mod-scavenger',
  family: 'reward',
  name: 'Scavenger',
  description: 'Loot drops 30% more often.',
  lootChanceScale: 1.3,
};

export const MOD_RICH_RUINS: ContractModifier = {
  id: 'mod-rich-ruins',
  family: 'reward',
  name: 'Rich Ruins',
  description:
    'Ancient coffers spill over — loot drops 40% more often and coins are worth 50% more.',
  lootChanceScale: 1.4,
  coinScale: 1.5,
};

/** All modifier definitions keyed by ID */
export const CONTRACT_MODIFIERS: Record<string, ContractModifier> = {
  [MOD_FORTIFIED.id]: MOD_FORTIFIED,
  [MOD_ENRAGED.id]: MOD_ENRAGED,
  [MOD_DEEP_DELVE.id]: MOD_DEEP_DELVE,
  [MOD_ELITE_SURGE.id]: MOD_ELITE_SURGE,
  [MOD_ARMORED_HORDE.id]: MOD_ARMORED_HORDE,
  [MOD_CURSED.id]: MOD_CURSED,
  [MOD_GLASS_CANNON.id]: MOD_GLASS_CANNON,
  [MOD_ELITE_TIDE.id]: MOD_ELITE_TIDE,
  [MOD_TREASURE_HUNT.id]: MOD_TREASURE_HUNT,
  [MOD_SCAVENGER.id]: MOD_SCAVENGER,
  [MOD_RICH_RUINS.id]: MOD_RICH_RUINS,
};
