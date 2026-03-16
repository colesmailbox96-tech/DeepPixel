import type { EnemyArchetype, EnemyDef } from '@echo-party/shared';

/** Standard (non-elite) enemy definitions — 10 archetypes */
export const ENEMY_DEFS: Record<EnemyArchetype, EnemyDef> = {
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
  skeleton: {
    archetype: 'skeleton',
    name: 'Skeleton',
    stats: { maxHp: 30, currentHp: 30, attack: 6, defense: 4, speed: 2 },
    attackRange: 1,
    placeholderColor: 0xdddddd,
  },
  wraith: {
    archetype: 'wraith',
    name: 'Wraith',
    stats: { maxHp: 22, currentHp: 22, attack: 9, defense: 0, speed: 4 },
    attackRange: 2,
    placeholderColor: 0x8844cc,
  },
  brute: {
    archetype: 'brute',
    name: 'Brute',
    stats: { maxHp: 60, currentHp: 60, attack: 10, defense: 6, speed: 1 },
    attackRange: 1,
    placeholderColor: 0x884422,
  },
  bomber: {
    archetype: 'bomber',
    name: 'Bomber',
    stats: { maxHp: 15, currentHp: 15, attack: 12, defense: 0, speed: 2 },
    attackRange: 3,
    placeholderColor: 0xff6600,
  },
  spider: {
    archetype: 'spider',
    name: 'Spider',
    stats: { maxHp: 18, currentHp: 18, attack: 5, defense: 1, speed: 5 },
    attackRange: 1,
    placeholderColor: 0x333333,
  },
  drake: {
    archetype: 'drake',
    name: 'Drake',
    stats: { maxHp: 50, currentHp: 50, attack: 11, defense: 5, speed: 2 },
    attackRange: 2,
    placeholderColor: 0xcc2222,
  },
  lich: {
    archetype: 'lich',
    name: 'Lich',
    stats: { maxHp: 40, currentHp: 40, attack: 13, defense: 3, speed: 2 },
    attackRange: 5,
    placeholderColor: 0x440066,
  },
};

/** Elite variants — stat-boosted versions of base enemies */
export const ELITE_ENEMY_DEFS: EnemyDef[] = [
  {
    archetype: 'goblin',
    name: 'Goblin Warlord',
    stats: { maxHp: 70, currentHp: 70, attack: 12, defense: 6, speed: 3 },
    attackRange: 1,
    placeholderColor: 0xff2222,
    isElite: true,
  },
  {
    archetype: 'skeleton',
    name: 'Skeleton Champion',
    stats: { maxHp: 60, currentHp: 60, attack: 10, defense: 8, speed: 2 },
    attackRange: 1,
    placeholderColor: 0xeeeeee,
    isElite: true,
  },
  {
    archetype: 'brute',
    name: 'Iron Brute',
    stats: { maxHp: 100, currentHp: 100, attack: 14, defense: 10, speed: 1 },
    attackRange: 1,
    placeholderColor: 0x664422,
    isElite: true,
  },
  {
    archetype: 'drake',
    name: 'Elder Drake',
    stats: { maxHp: 90, currentHp: 90, attack: 16, defense: 8, speed: 2 },
    attackRange: 3,
    placeholderColor: 0xff0000,
    isElite: true,
  },
  {
    archetype: 'lich',
    name: 'Arch-Lich',
    stats: { maxHp: 75, currentHp: 75, attack: 18, defense: 5, speed: 2 },
    attackRange: 5,
    placeholderColor: 0x660088,
    isElite: true,
  },
];

/** All enemy defs as a flat array (handy for spawn functions) */
export const ALL_ENEMY_DEFS: EnemyDef[] = Object.values(ENEMY_DEFS);
