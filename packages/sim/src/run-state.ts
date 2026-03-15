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
  startedAt: number;
  completed: boolean;
  victory: boolean;
}

/** Difficulty multiplier lookup */
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
    startedAt: Date.now(),
    completed: false,
    victory: false,
  };
}

/** Produce a RunSummary from a completed RunState */
export function summarizeRun(state: RunState): RunSummary {
  return {
    seed: state.config.seed,
    roomsCleared: state.currentRoom,
    enemiesDefeated: state.enemiesDefeated,
    damageDealt: state.damageDealt,
    damageTaken: state.damageTaken,
    itemsCollected: state.itemsCollected,
    durationMs: Date.now() - state.startedAt,
    victory: state.victory,
  };
}
