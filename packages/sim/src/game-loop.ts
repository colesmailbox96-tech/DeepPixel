import type { Position, RunConfig, EnemyDef, LootTable } from '@echo-party/shared';
import { SeededRng } from './rng';
import { createRunState, type RunState } from './run-state';
import { generateRoom, TileType, type RoomLayout } from './procgen/room-gen';
import { spawnEnemies, type EnemyEntity } from './procgen/enemy-spawn';
import { resolveDamage } from './combat/combat-resolver';
import { computeEnemyActions } from './combat/enemy-ai';
import { rollDrop, type LootDrop } from './loot/drop-resolver';

/** Player action types */
export type PlayerAction =
  | { type: 'move'; dx: number; dy: number }
  | { type: 'attack' };

/** Events emitted during a tick for the renderer */
export type GameEvent =
  | { type: 'player_moved'; position: Position }
  | { type: 'player_attacked'; targetId: string; damage: number; killed: boolean }
  | { type: 'enemy_moved'; enemyId: string; position: Position }
  | { type: 'enemy_attacked'; enemyId: string; damage: number }
  | { type: 'loot_dropped'; drop: LootDrop; position: Position }
  | { type: 'room_cleared' }
  | { type: 'run_victory' }
  | { type: 'player_died' };

/** Complete game state for an active run */
export interface GameState {
  run: RunState;
  rng: SeededRng;
  room: RoomLayout;
  playerPos: Position;
  enemies: EnemyEntity[];
  lootOnGround: { drop: LootDrop; position: Position }[];
  roomCleared: boolean;
  /** Number of rooms this contract has */
  totalRooms: number;
}

/**
 * Initialize a full game state for a run, including first room generation.
 */
export function initGameState(
  config: RunConfig,
  enemyDefs: EnemyDef[],
  totalRooms: number,
): GameState {
  const rng = new SeededRng(config.seed);
  const run = createRunState(config);
  run.totalRooms = totalRooms;

  const room = generateRoom(rng);
  // Player starts near center-left of the room
  const playerPos: Position = { x: 2, y: Math.floor(room.height / 2) };

  const enemyCount = rng.nextInt(2, 4);
  const enemies = spawnEnemies(rng, room, enemyDefs, enemyCount, playerPos);

  return {
    run,
    rng,
    room,
    playerPos,
    enemies,
    lootOnGround: [],
    roomCleared: false,
    totalRooms,
  };
}

/**
 * Process one game tick: apply player action, then enemy actions.
 * Returns events for the renderer.
 */
export function processTick(
  state: GameState,
  action: PlayerAction | null,
  enemyDefs: EnemyDef[],
  lootTable: LootTable,
): GameEvent[] {
  const events: GameEvent[] = [];

  if (state.run.completed) return events;

  // 1. Process player action
  if (action) {
    if (action.type === 'move') {
      const newX = state.playerPos.x + action.dx;
      const newY = state.playerPos.y + action.dy;

      // Bounds check and wall collision
      if (
        newX >= 0 &&
        newX < state.room.width &&
        newY >= 0 &&
        newY < state.room.height &&
        state.room.tiles[newY][newX] !== TileType.Wall
      ) {
        state.playerPos.x = newX;
        state.playerPos.y = newY;
        events.push({ type: 'player_moved', position: { ...state.playerPos } });
      }

      // Check for loot pickup
      const lootIdx = state.lootOnGround.findIndex(
        (l) => l.position.x === state.playerPos.x && l.position.y === state.playerPos.y,
      );
      if (lootIdx >= 0) {
        const loot = state.lootOnGround[lootIdx];
        state.lootOnGround.splice(lootIdx, 1);
        if (loot.drop.kind === 'health_potion') {
          state.run.player.currentHp = Math.min(
            state.run.player.maxHp,
            state.run.player.currentHp + loot.drop.value,
          );
        }
        state.run.itemsCollected++;
      }
    } else if (action.type === 'attack') {
      // Attack nearest enemy in range using Chebyshev distance (supports diagonal adjacency)
      const attackRange = 1;
      let closestEnemy: EnemyEntity | null = null;
      let closestDist = Infinity;

      for (const enemy of state.enemies) {
        if (!enemy.alive) continue;
        const dist = Math.max(
          Math.abs(enemy.position.x - state.playerPos.x),
          Math.abs(enemy.position.y - state.playerPos.y),
        );
        if (dist <= attackRange && dist < closestDist) {
          closestEnemy = enemy;
          closestDist = dist;
        }
      }

      if (closestEnemy) {
        const result = resolveDamage(state.run.player, closestEnemy.stats);
        state.run.damageDealt += result.damage;
        events.push({
          type: 'player_attacked',
          targetId: closestEnemy.id,
          damage: result.damage,
          killed: result.targetDied,
        });

        if (result.targetDied) {
          closestEnemy.alive = false;
          state.run.enemiesDefeated++;

          // Roll loot
          const drop = rollDrop(state.rng, lootTable);
          if (drop) {
            state.lootOnGround.push({
              drop,
              position: { ...closestEnemy.position },
            });
            events.push({
              type: 'loot_dropped',
              drop,
              position: { ...closestEnemy.position },
            });
          }
        }
      }
    }
  }

  // 2. Check room clear
  const allDead = state.enemies.every((e) => !e.alive);
  if (allDead && !state.roomCleared) {
    state.roomCleared = true;
    state.run.currentRoom++;
    events.push({ type: 'room_cleared' });

    // Check for victory
    if (state.run.currentRoom >= state.totalRooms) {
      state.run.completed = true;
      state.run.victory = true;
      events.push({ type: 'run_victory' });
      return events;
    }
  }

  // 3. Process enemy actions (only if room not cleared)
  if (!state.roomCleared) {
    const enemyActions = computeEnemyActions(state.enemies, state.playerPos);
    for (const ea of enemyActions) {
      const enemy = state.enemies.find((e) => e.id === ea.enemyId);
      if (!enemy || !enemy.alive) continue;

      if (ea.type === 'move') {
        // Check that the target tile is walkable
        if (
          ea.targetPosition.x >= 0 &&
          ea.targetPosition.x < state.room.width &&
          ea.targetPosition.y >= 0 &&
          ea.targetPosition.y < state.room.height &&
          state.room.tiles[ea.targetPosition.y][ea.targetPosition.x] !== TileType.Wall
        ) {
          enemy.position = ea.targetPosition;
          events.push({
            type: 'enemy_moved',
            enemyId: enemy.id,
            position: { ...enemy.position },
          });
        }
      } else if (ea.type === 'attack') {
        const result = resolveDamage(enemy.stats, state.run.player);
        state.run.damageTaken += result.damage;
        events.push({
          type: 'enemy_attacked',
          enemyId: enemy.id,
          damage: result.damage,
        });

        if (result.targetDied) {
          state.run.completed = true;
          state.run.victory = false;
          events.push({ type: 'player_died' });
          return events;
        }
      }
    }
  }

  return events;
}

/**
 * Advance to the next room — generates a new room layout and spawns enemies.
 */
export function advanceRoom(state: GameState, enemyDefs: EnemyDef[]): void {
  state.room = generateRoom(state.rng);
  state.playerPos = { x: 2, y: Math.floor(state.room.height / 2) };
  const enemyCount = state.rng.nextInt(2, 5);
  state.enemies = spawnEnemies(state.rng, state.room, enemyDefs, enemyCount, state.playerPos);
  state.lootOnGround = [];
  state.roomCleared = false;
}
