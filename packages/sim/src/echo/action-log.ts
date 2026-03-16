import type { Direction, EnemyArchetype, Position } from '@echo-party/shared';
import type { PlayerAction } from '../game-loop';

/**
 * One recorded tick during a run.
 * Captures the player's action and surrounding context so the
 * distillation pipeline can extract behavioural traits.
 */
export interface ActionEntry {
  /** The player action taken (or null for idle ticks) */
  action: PlayerAction | null;
  /** Player position at the time of the action */
  playerPos: Position;
  /** Positions of alive enemies when the action was taken */
  enemyPositions: Position[];
  /** Archetypes of alive enemies (parallel array to enemyPositions) */
  enemyArchetypes: EnemyArchetype[];
  /** Whether an enemy was killed this tick */
  killedArchetype: EnemyArchetype | null;
}

/**
 * Mutable log that accumulates ActionEntry records over an entire run.
 * Kept lightweight — no deep copies, just snapshots of primitives.
 */
export interface ActionLog {
  entries: ActionEntry[];
}

/** Create a fresh empty action log */
export function createActionLog(): ActionLog {
  return { entries: [] };
}

/**
 * Record a single tick into the action log.
 *
 * Position objects are shallow-copied so later mutation of GameState
 * does not corrupt the log.
 */
export function recordAction(
  log: ActionLog,
  action: PlayerAction | null,
  playerPos: Position,
  enemyPositions: readonly Position[],
  enemyArchetypes: readonly EnemyArchetype[],
  killedArchetype: EnemyArchetype | null,
): void {
  log.entries.push({
    action,
    playerPos: { ...playerPos },
    enemyPositions: enemyPositions.map((p) => ({ ...p })),
    enemyArchetypes: [...enemyArchetypes],
    killedArchetype,
  });
}

/**
 * Derive a Direction from a move delta, or null if the delta is zero.
 */
export function deltaToDirection(dx: number, dy: number): Direction | null {
  if (dx === 0 && dy === 0) return null;

  if (dx > 0 && dy === 0) return 'E' as Direction;
  if (dx < 0 && dy === 0) return 'W' as Direction;
  if (dx === 0 && dy < 0) return 'N' as Direction;
  if (dx === 0 && dy > 0) return 'S' as Direction;
  if (dx > 0 && dy < 0) return 'NE' as Direction;
  if (dx < 0 && dy < 0) return 'NW' as Direction;
  if (dx > 0 && dy > 0) return 'SE' as Direction;
  if (dx < 0 && dy > 0) return 'SW' as Direction;

  return null;
}
