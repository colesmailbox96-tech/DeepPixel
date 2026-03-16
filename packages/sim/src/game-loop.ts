import type { Position, RunConfig, EnemyDef, LootTable, EchoProfileV1 } from '@echo-party/shared';
import { SeededRng } from './rng';
import { createRunState, type RunState } from './run-state';
import { generateRoom, getFloorPositions, TileType, type RoomLayout } from './procgen/room-gen';
import { spawnEnemies, type EnemyEntity } from './procgen/enemy-spawn';
import { resolveDamage } from './combat/combat-resolver';
import { computeEnemyActions } from './combat/enemy-ai';
import { rollDrop, type LootDrop } from './loot/drop-resolver';
import { createEchoCompanion, computeEchoAction, type EchoCompanion } from './echo/echo-companion';

/** Player action types */
export type PlayerAction = { type: 'move'; dx: number; dy: number } | { type: 'attack' };

/** Events emitted during a tick for the renderer */
export type GameEvent =
  | { type: 'player_moved'; position: Position }
  | { type: 'player_attacked'; targetId: string; damage: number; killed: boolean }
  | { type: 'enemy_moved'; enemyId: string; position: Position }
  | { type: 'enemy_attacked'; enemyId: string; damage: number }
  | { type: 'loot_dropped'; drop: LootDrop; position: Position }
  | { type: 'room_cleared' }
  | { type: 'run_victory' }
  | { type: 'player_died' }
  | { type: 'echo_moved'; position: Position }
  | { type: 'echo_attacked'; targetId: string; damage: number; killed: boolean }
  | { type: 'echo_took_damage'; damage: number }
  | { type: 'echo_died' };

/** Complete game state for an active run */
export interface GameState {
  run: RunState;
  rng: SeededRng;
  room: RoomLayout;
  playerPos: Position;
  enemies: EnemyEntity[];
  lootOnGround: { drop: LootDrop; position: Position }[];
  roomCleared: boolean;
  /** Optional Echo companion for this run */
  echo: EchoCompanion | null;
}

/**
 * Find a walkable spawn position near center-left of the room.
 * Prefers { x: 2, y: floor(height/2) } but falls back to the nearest floor tile.
 */
function findSpawnPosition(room: RoomLayout): Position {
  const preferred: Position = { x: 2, y: Math.floor(room.height / 2) };
  if (room.tiles[preferred.y][preferred.x] === TileType.Floor) {
    return preferred;
  }
  return findNearestFloor(room, preferred);
}

/**
 * Find the nearest walkable floor tile to a given position.
 * Optionally excludes a set of occupied positions.
 */
function findNearestFloor(room: RoomLayout, target: Position, exclude?: Position[]): Position {
  const floors = getFloorPositions(room);
  if (floors.length === 0) {
    throw new Error('findNearestFloor: room has no floor tiles');
  }
  const excSet = new Set((exclude ?? []).map((p) => `${p.x},${p.y}`));
  let best = floors[0];
  let bestDist = Infinity;
  for (const p of floors) {
    if (excSet.has(`${p.x},${p.y}`)) continue;
    const dist = Math.abs(p.x - target.x) + Math.abs(p.y - target.y);
    if (dist < bestDist) {
      bestDist = dist;
      best = p;
    }
  }
  return { x: best.x, y: best.y };
}

/**
 * Find a walkable floor tile adjacent to `anchor`, avoiding `exclude` positions.
 * Falls back to the nearest floor tile to `anchor` if no adjacent tile is available.
 */
function findEchoSpawn(room: RoomLayout, anchor: Position, exclude?: Position[]): Position {
  const excSet = new Set((exclude ?? []).map((p) => `${p.x},${p.y}`));

  const isValid = (x: number, y: number): boolean =>
    x >= 0 &&
    x < room.width &&
    y >= 0 &&
    y < room.height &&
    room.tiles[y][x] === TileType.Floor &&
    !excSet.has(`${x},${y}`);

  // Prefer east of anchor first, then remaining cardinal + diagonal
  const offsets = [
    { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
    { dx: 1, dy: -1 }, { dx: -1, dy: -1 }, { dx: 1, dy: 1 }, { dx: -1, dy: 1 },
  ];
  for (const { dx, dy } of offsets) {
    const nx = anchor.x + dx;
    const ny = anchor.y + dy;
    if (isValid(nx, ny)) {
      return { x: nx, y: ny };
    }
  }
  // Fall back to nearest floor tile
  return findNearestFloor(room, anchor, exclude);
}

/**
 * Initialize a full game state for a run, including first room generation.
 * Optionally equips an Echo companion if an EchoProfileV1 is provided.
 */
export function initGameState(
  config: RunConfig,
  enemyDefs: EnemyDef[],
  totalRooms: number,
  echoProfile?: EchoProfileV1,
): GameState {
  const rng = new SeededRng(config.seed);
  const run = createRunState(config);
  run.totalRooms = totalRooms;

  const room = generateRoom(rng);
  const playerPos = findSpawnPosition(room);

  const enemyCount = rng.nextInt(2, 4);
  const enemies = spawnEnemies(rng, room, enemyDefs, enemyCount, playerPos);

  const echo = echoProfile
    ? createEchoCompanion(echoProfile, findEchoSpawn(room, playerPos, [playerPos]))
    : null;

  return {
    run,
    rng,
    room,
    playerPos,
    enemies,
    lootOnGround: [],
    roomCleared: false,
    echo,
  };
}

/**
 * Process one game tick: apply player action, then enemy actions.
 * Returns events for the renderer.
 */
export function processTick(
  state: GameState,
  action: PlayerAction | null,
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
    if (state.run.currentRoom >= state.run.totalRooms) {
      state.run.completed = true;
      state.run.victory = true;
      events.push({ type: 'run_victory' });
      return events;
    }
  }

  // 3. Process Echo companion actions (before enemies, only if room not cleared)
  if (!state.roomCleared && state.echo && state.echo.alive) {
    const echoAction = computeEchoAction(state.echo, state.enemies, state.playerPos, state.rng);
    if (echoAction) {
      if (echoAction.type === 'move') {
        const newX = state.echo.position.x + echoAction.dx;
        const newY = state.echo.position.y + echoAction.dy;
        if (
          newX >= 0 &&
          newX < state.room.width &&
          newY >= 0 &&
          newY < state.room.height &&
          state.room.tiles[newY][newX] !== TileType.Wall
        ) {
          state.echo.position.x = newX;
          state.echo.position.y = newY;
          events.push({ type: 'echo_moved', position: { ...state.echo.position } });
        }
      } else if (echoAction.type === 'attack') {
        const target = state.enemies.find((e) => e.id === echoAction.targetId);
        if (target && target.alive) {
          const result = resolveDamage(state.echo.stats, target.stats);
          state.run.damageDealt += result.damage;
          events.push({
            type: 'echo_attacked',
            targetId: target.id,
            damage: result.damage,
            killed: result.targetDied,
          });
          if (result.targetDied) {
            target.alive = false;
            state.run.enemiesDefeated++;
            const drop = rollDrop(state.rng, lootTable);
            if (drop) {
              state.lootOnGround.push({ drop, position: { ...target.position } });
              events.push({ type: 'loot_dropped', drop, position: { ...target.position } });
            }
          }
        }
      }
    }
  }

  // Re-check room clear after Echo actions
  const allDeadAfterEcho = state.enemies.every((e) => !e.alive);
  if (allDeadAfterEcho && !state.roomCleared) {
    state.roomCleared = true;
    state.run.currentRoom++;
    events.push({ type: 'room_cleared' });
    if (state.run.currentRoom >= state.run.totalRooms) {
      state.run.completed = true;
      state.run.victory = true;
      events.push({ type: 'run_victory' });
      return events;
    }
  }

  // 4. Process enemy actions (only if room not cleared)
  if (!state.roomCleared) {
    const echoPos = state.echo && state.echo.alive ? state.echo.position : null;
    const enemyActions = computeEnemyActions(state.enemies, state.playerPos, echoPos);
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
        // Determine whether the enemy targeted the Echo or the player
        const attackedEcho =
          state.echo &&
          state.echo.alive &&
          ea.targetPosition.x === state.echo.position.x &&
          ea.targetPosition.y === state.echo.position.y;

        if (attackedEcho && state.echo) {
          const result = resolveDamage(enemy.stats, state.echo.stats);
          events.push({ type: 'echo_took_damage', damage: result.damage });
          if (result.targetDied) {
            state.echo.alive = false;
            events.push({ type: 'echo_died' });
          }
        } else {
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
  }

  return events;
}

/**
 * Advance to the next room — generates a new room layout and spawns enemies.
 * Repositions the Echo companion if present.
 */
export function advanceRoom(state: GameState, enemyDefs: EnemyDef[]): void {
  state.room = generateRoom(state.rng);
  state.playerPos = findSpawnPosition(state.room);
  const enemyCount = state.rng.nextInt(2, 5);
  state.enemies = spawnEnemies(state.rng, state.room, enemyDefs, enemyCount, state.playerPos);
  state.lootOnGround = [];
  state.roomCleared = false;

  // Reposition Echo companion on a valid floor tile near the player
  if (state.echo && state.echo.alive) {
    state.echo.position = findEchoSpawn(state.room, state.playerPos, [state.playerPos]);
  }
}
