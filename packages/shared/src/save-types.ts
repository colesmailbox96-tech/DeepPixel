import type { RunSummary, Difficulty } from './types';

/** Current save schema version. Bump when save format changes. */
export const SAVE_SCHEMA_VERSION = 1;

/** Versioned envelope wrapping any persisted data */
export interface SaveEnvelope<T = unknown> {
  version: number;
  timestamp: number;
  payload: T;
}

/** Data stored per save slot — represents an in-progress or completed run */
export interface SaveSlotData {
  /** Unique slot identifier (e.g., 'slot-1') */
  slotId: string;
  /** Human-readable name (e.g., 'Sewer Sweep Run #3') */
  name: string;
  /** ISO-8601 creation timestamp */
  createdAt: string;
  /** ISO-8601 last-updated timestamp */
  updatedAt: string;
  /** Serialized run state (null if slot is empty) */
  runState: SerializedRunState | null;
}

/** Serialized form of RunState suitable for IndexedDB storage */
export interface SerializedRunState {
  seed: string;
  difficulty: Difficulty;
  contractId: string;
  currentRoom: number;
  totalRooms: number;
  playerMaxHp: number;
  playerCurrentHp: number;
  playerAttack: number;
  playerDefense: number;
  playerSpeed: number;
  enemiesDefeated: number;
  damageDealt: number;
  damageTaken: number;
  itemsCollected: number;
  completed: boolean;
  victory: boolean;
}

/** Global meta-progression stored across all runs */
export interface MetaProgression {
  /** Total number of completed runs */
  totalRuns: number;
  /** Total victories */
  totalVictories: number;
  /** Total enemies defeated across all runs */
  lifetimeEnemiesDefeated: number;
  /** Total damage dealt across all runs */
  lifetimeDamageDealt: number;
  /** History of completed run summaries (capped) */
  runHistory: RunSummary[];
}

/** Create a fresh (empty) MetaProgression */
export function defaultMetaProgression(): MetaProgression {
  return {
    totalRuns: 0,
    totalVictories: 0,
    lifetimeEnemiesDefeated: 0,
    lifetimeDamageDealt: 0,
    runHistory: [],
  };
}
