import { Difficulty } from './types';

/** Modifier family identifiers */
export type ModifierFamily = 'scaling' | 'hazard' | 'reward';

/** A single contract modifier that alters run parameters */
export interface ContractModifier {
  id: string;
  family: ModifierFamily;
  name: string;
  description: string;
  /** Multiplicative scaling applied to enemy HP (default 1.0) */
  enemyHpScale?: number;
  /** Multiplicative scaling applied to enemy attack (default 1.0) */
  enemyAtkScale?: number;
  /** Additive bonus to rooms per run */
  extraRooms?: number;
  /** Multiplicative scaling for loot drop chance (default 1.0) */
  lootChanceScale?: number;
  /** Multiplicative scaling for coin rewards (default 1.0) */
  coinScale?: number;
  /** If true, elites spawn more frequently */
  boostedElites?: boolean;
}

/** Contract definition — a mission the player can undertake */
export interface ContractDef {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  roomCount: number;
  /** Optional modifiers applied to the contract run */
  modifiers?: ContractModifier[];
}
