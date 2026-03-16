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

/** All modifier definitions keyed by ID */
export const CONTRACT_MODIFIERS: Record<string, ContractModifier> = {
  [MOD_FORTIFIED.id]: MOD_FORTIFIED,
  [MOD_ENRAGED.id]: MOD_ENRAGED,
  [MOD_DEEP_DELVE.id]: MOD_DEEP_DELVE,
  [MOD_ELITE_SURGE.id]: MOD_ELITE_SURGE,
  [MOD_ARMORED_HORDE.id]: MOD_ARMORED_HORDE,
  [MOD_TREASURE_HUNT.id]: MOD_TREASURE_HUNT,
  [MOD_SCAVENGER.id]: MOD_SCAVENGER,
};
