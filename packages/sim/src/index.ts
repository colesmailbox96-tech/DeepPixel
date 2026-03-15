export { SeededRng } from './rng';
export { createRunState, summarizeRun, hashRunSummary, type RunState } from './run-state';
export { generateRoom, getFloorPositions, TileType, type RoomLayout } from './procgen/room-gen';
export { spawnEnemies, type EnemyEntity } from './procgen/enemy-spawn';
export { resolveDamage, type CombatResult } from './combat/combat-resolver';
export { computeEnemyActions, type EnemyAction } from './combat/enemy-ai';
export { rollDrop, type LootDrop } from './loot/drop-resolver';
export { buildRunConfig } from './meta/contract-defs';
export {
  initGameState,
  processTick,
  advanceRoom,
  type GameState,
  type PlayerAction,
  type GameEvent,
} from './game-loop';
export {
  serializeRunState,
  deserializeRunState,
  wrapEnvelope,
  unwrapEnvelope,
  createEmptySlot,
  serializeSaveSlot,
  deserializeSaveSlot,
  serializeMeta,
  deserializeMeta,
  parseSaveJson,
  defaultMetaProgression,
  migrateSave,
  needsMigration,
  type MigrationFn,
  SaveAdapter,
  DB_NAME,
  recordRun,
  MAX_RUN_HISTORY,
} from './save';
