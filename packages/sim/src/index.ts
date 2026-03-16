export { SeededRng } from './rng';
export { createRunState, summarizeRun, hashRunSummary, type RunState } from './run-state';
export { generateRoom, getFloorPositions, TileType, type RoomLayout } from './procgen/room-gen';
export { spawnEnemies, type EnemyEntity } from './procgen/enemy-spawn';
export { resolveDamage, type CombatResult } from './combat/combat-resolver';
export { computeEnemyActions, type EnemyAction } from './combat/enemy-ai';
export { rollDrop, type LootDrop } from './loot/drop-resolver';
export {
  buildRunConfig,
  buildResolvedRunConfig,
  type ResolvedRunConfig,
} from './meta/contract-defs';
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
export {
  createRelicState,
  addRelic,
  hasRelic,
  passiveDamageReduction,
  passiveBonusSpeed,
  onHitBonusDamage,
  onHitLifesteal,
  onKillEffects,
  thornsDamage,
  onRoomClearEffects,
  onRoomEnterEffects,
  passiveLootLuck,
  passiveBonusCoinScale,
  applyHeal,
  type RelicState,
} from './relic';
export { calculateRunReward, type RunReward } from './economy';
export {
  createActionLog,
  recordAction,
  deltaToDirection,
  distillEcho,
  createEchoCompanion,
  computeEchoAction,
  createEchoLibrary,
  addEcho,
  removeEcho,
  equipEcho,
  unequipEcho,
  getEquippedEcho,
  type ActionLog,
  type ActionEntry,
  type EchoCompanion,
  type EchoAction,
  type EchoLibrary,
} from './echo';
