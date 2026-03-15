import type { EnemyDef } from '@echo-party/shared';

export const ENEMY_DEFS: Record<string, EnemyDef> = {
  slime: {
    archetype: 'slime',
    name: 'Slime',
    stats: { maxHp: 20, currentHp: 20, attack: 4, defense: 1, speed: 1 },
    attackRange: 1,
    placeholderColor: 0x44cc44,
  },
  goblin: {
    archetype: 'goblin',
    name: 'Goblin',
    stats: { maxHp: 35, currentHp: 35, attack: 7, defense: 3, speed: 3 },
    attackRange: 1,
    placeholderColor: 0xcc4444,
  },
  archer: {
    archetype: 'archer',
    name: 'Archer',
    stats: { maxHp: 25, currentHp: 25, attack: 8, defense: 2, speed: 2 },
    attackRange: 4,
    placeholderColor: 0xcccc44,
  },
};
