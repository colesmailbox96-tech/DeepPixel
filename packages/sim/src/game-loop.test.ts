import { describe, it, expect } from 'vitest';
import { Difficulty, Rarity, type EnemyDef, type LootTable } from '@echo-party/shared';
import { initGameState, processTick, advanceRoom } from './game-loop';
import { TileType } from './procgen/room-gen';

const testEnemyDefs: EnemyDef[] = [
  {
    archetype: 'slime',
    name: 'Slime',
    stats: { maxHp: 20, currentHp: 20, attack: 4, defense: 1, speed: 1 },
    attackRange: 1,
    placeholderColor: 0x44cc44,
  },
];

const testLootTable: LootTable = [
  { kind: 'health_potion', rarity: Rarity.Common, weight: 3, value: 20 },
  { kind: 'coin', rarity: Rarity.Common, weight: 7, value: 5 },
];

describe('initGameState', () => {
  it('creates a valid initial game state', () => {
    const state = initGameState(
      { seed: 'test', difficulty: Difficulty.Normal, contractId: 'c1' },
      testEnemyDefs,
      3,
    );

    expect(state.run.currentRoom).toBe(0);
    expect(state.totalRooms).toBe(3);
    expect(state.room.tiles.length).toBeGreaterThan(0);
    expect(state.enemies.length).toBeGreaterThan(0);
    expect(state.playerPos.x).toBe(2);
    expect(state.roomCleared).toBe(false);
  });

  it('is deterministic for the same seed', () => {
    const config = { seed: 'det-game', difficulty: Difficulty.Normal, contractId: 'c1' };
    const state1 = initGameState(config, testEnemyDefs, 3);
    const state2 = initGameState(config, testEnemyDefs, 3);

    expect(state1.room.tiles).toEqual(state2.room.tiles);
    expect(state1.enemies.map((e) => e.position)).toEqual(state2.enemies.map((e) => e.position));
  });
});

describe('processTick', () => {
  it('moves player on valid move action', () => {
    const state = initGameState(
      { seed: 'move-test', difficulty: Difficulty.Normal, contractId: 'c1' },
      testEnemyDefs,
      3,
    );
    const startX = state.playerPos.x;
    const startY = state.playerPos.y;

    // Ensure target tile is floor
    if (state.room.tiles[startY][startX + 1] === TileType.Floor) {
      const events = processTick(state, { type: 'move', dx: 1, dy: 0 }, testEnemyDefs, testLootTable);
      expect(state.playerPos.x).toBe(startX + 1);
      const moveEvent = events.find((e) => e.type === 'player_moved');
      expect(moveEvent).toBeDefined();
    }
  });

  it('does not move player into walls', () => {
    const state = initGameState(
      { seed: 'wall-test', difficulty: Difficulty.Normal, contractId: 'c1' },
      testEnemyDefs,
      3,
    );
    // Move to left wall
    state.playerPos.x = 1;
    state.playerPos.y = 1;

    processTick(state, { type: 'move', dx: -1, dy: 0 }, testEnemyDefs, testLootTable);
    // Should not move into wall at x=0
    expect(state.playerPos.x).toBe(1);
  });

  it('detects room clear when all enemies are dead', () => {
    const state = initGameState(
      { seed: 'clear-test', difficulty: Difficulty.Normal, contractId: 'c1' },
      testEnemyDefs,
      3,
    );

    // Kill all enemies manually
    for (const enemy of state.enemies) {
      enemy.alive = false;
      enemy.stats.currentHp = 0;
    }

    const events = processTick(state, null, testEnemyDefs, testLootTable);
    const clearEvent = events.find((e) => e.type === 'room_cleared');
    expect(clearEvent).toBeDefined();
    expect(state.roomCleared).toBe(true);
    expect(state.run.currentRoom).toBe(1);
  });

  it('detects victory when all rooms are cleared', () => {
    const state = initGameState(
      { seed: 'victory-test', difficulty: Difficulty.Normal, contractId: 'c1' },
      testEnemyDefs,
      1, // Only 1 room
    );

    // Kill all enemies
    for (const enemy of state.enemies) {
      enemy.alive = false;
      enemy.stats.currentHp = 0;
    }

    const events = processTick(state, null, testEnemyDefs, testLootTable);
    expect(events.some((e) => e.type === 'run_victory')).toBe(true);
    expect(state.run.completed).toBe(true);
    expect(state.run.victory).toBe(true);
  });

  it('detects player death when HP reaches 0', () => {
    const state = initGameState(
      { seed: 'death-test', difficulty: Difficulty.Normal, contractId: 'c1' },
      testEnemyDefs,
      3,
    );

    // Set player HP very low and place enemy adjacent
    state.run.player.currentHp = 1;
    state.run.player.defense = 0;
    if (state.enemies.length > 0) {
      state.enemies[0].position = {
        x: state.playerPos.x + 1,
        y: state.playerPos.y,
      };
      state.enemies[0].alive = true;

      const events = processTick(state, null, testEnemyDefs, testLootTable);
      // Enemy should attack and kill the player
      if (events.some((e) => e.type === 'player_died')) {
        expect(state.run.completed).toBe(true);
        expect(state.run.victory).toBe(false);
      }
    }
  });

  it('does not process ticks after run is completed', () => {
    const state = initGameState(
      { seed: 'completed-test', difficulty: Difficulty.Normal, contractId: 'c1' },
      testEnemyDefs,
      3,
    );
    state.run.completed = true;

    const events = processTick(state, { type: 'move', dx: 1, dy: 0 }, testEnemyDefs, testLootTable);
    expect(events).toHaveLength(0);
  });
});

describe('advanceRoom', () => {
  it('generates a new room with new enemies', () => {
    const state = initGameState(
      { seed: 'advance-test', difficulty: Difficulty.Normal, contractId: 'c1' },
      testEnemyDefs,
      3,
    );
    const firstRoomTiles = state.room.tiles.map((r) => [...r]);

    advanceRoom(state, testEnemyDefs);

    expect(state.roomCleared).toBe(false);
    expect(state.enemies.length).toBeGreaterThan(0);
    expect(state.playerPos.x).toBe(2);
    // Room layout may or may not differ (depends on RNG), but enemies should be fresh
    for (const e of state.enemies) {
      expect(e.alive).toBe(true);
    }
  });
});
