/** Unique identifier type for game entities */
export type EntityId = string;

/** 2D position in world space */
export interface Position {
  x: number;
  y: number;
}

/** Cardinal and intercardinal directions */
export enum Direction {
  North = 'N',
  South = 'S',
  East = 'E',
  West = 'W',
  NorthEast = 'NE',
  NorthWest = 'NW',
  SouthEast = 'SE',
  SouthWest = 'SW',
}

/** Damage types in the game */
export enum DamageType {
  Physical = 'physical',
  Fire = 'fire',
  Ice = 'ice',
  Lightning = 'lightning',
  Arcane = 'arcane',
}

/** Item rarity tiers */
export enum Rarity {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  Epic = 'epic',
  Legendary = 'legendary',
}

/** Contract difficulty settings */
export enum Difficulty {
  Normal = 'normal',
  Hard = 'hard',
  Nightmare = 'nightmare',
}

/** Core stat block used by player and enemies */
export interface StatBlock {
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  speed: number;
}

/** Minimal run configuration */
export interface RunConfig {
  seed: string;
  difficulty: Difficulty;
  contractId: string;
}

/** Run summary emitted after a run completes */
export interface RunSummary {
  seed: string;
  roomsCleared: number;
  enemiesDefeated: number;
  damageDealt: number;
  damageTaken: number;
  itemsCollected: number;
  durationMs: number;
  victory: boolean;
}
