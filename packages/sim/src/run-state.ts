import { Difficulty, type RunConfig, type RunSummary, type StatBlock } from '@echo-party/shared';

/** Live state of an in-progress run */
export interface RunState {
  config: RunConfig;
  currentRoom: number;
  totalRooms: number;
  player: StatBlock;
  enemiesDefeated: number;
  damageDealt: number;
  damageTaken: number;
  itemsCollected: number;
  completed: boolean;
  victory: boolean;
}

/** Starting HP per difficulty */
const DIFFICULTY_HP: Record<Difficulty, number> = {
  [Difficulty.Normal]: 100,
  [Difficulty.Hard]: 80,
  [Difficulty.Nightmare]: 60,
};

/** Create a fresh RunState from a config */
export function createRunState(config: RunConfig): RunState {
  return {
    config,
    currentRoom: 0,
    totalRooms: 5, // stub — will be driven by procgen later
    player: {
      maxHp: DIFFICULTY_HP[config.difficulty],
      currentHp: DIFFICULTY_HP[config.difficulty],
      attack: 10,
      defense: 5,
      speed: 3,
    },
    enemiesDefeated: 0,
    damageDealt: 0,
    damageTaken: 0,
    itemsCollected: 0,
    completed: false,
    victory: false,
  };
}

/** Produce a RunSummary from a completed RunState.
 *  @param durationMs - wall-clock duration tracked by the adapter (e.g., the Phaser scene),
 *                      kept outside the sim layer to preserve deterministic run summaries.
 */
export function summarizeRun(state: RunState, durationMs: number): RunSummary {
  return {
    seed: state.config.seed,
    roomsCleared: state.currentRoom,
    enemiesDefeated: state.enemiesDefeated,
    damageDealt: state.damageDealt,
    damageTaken: state.damageTaken,
    itemsCollected: state.itemsCollected,
    durationMs,
    victory: state.victory,
  };
}

/**
 * Produce a deterministic hex hash of a RunSummary.
 *
 * `durationMs` is intentionally excluded because it records wall-clock time
 * and would break determinism across runs with the same seed and inputs.
 * All other fields are gameplay-derived and must be identical for equal seeds.
 *
 * Uses FNV-1a (32-bit) for a compact, reproducible hash.
 */
export function hashRunSummary(summary: RunSummary): string {
  const payload = JSON.stringify({
    seed: summary.seed,
    roomsCleared: summary.roomsCleared,
    enemiesDefeated: summary.enemiesDefeated,
    damageDealt: summary.damageDealt,
    damageTaken: summary.damageTaken,
    itemsCollected: summary.itemsCollected,
    victory: summary.victory,
  });

  // FNV-1a 32-bit
  let hash = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}
