/**
 * Deterministic regression tests for Phase 3.
 *
 * These tests pin the exact output of each sim subsystem to a known seed.
 * Any change that alters the deterministic output of room generation,
 * enemy spawn, loot rolls, or the run summary hash will fail here.
 *
 * Acceptance criteria (Phase 3):
 *  - Room layout is the same given the same seed
 *  - Enemy spawn result is the same given the same seed
 *  - Loot output is the same given the same seed
 *  - Summary hash is stable given the same seed and inputs
 */

import { describe, it, expect } from 'vitest';
import { Rarity, Difficulty } from '@echo-party/shared';
import type { EnemyDef, LootTable } from '@echo-party/shared';
import { SeededRng } from './rng';
import { generateRoom, TileType } from './procgen/room-gen';
import { spawnEnemies } from './procgen/enemy-spawn';
import { rollDrop } from './loot/drop-resolver';
import { summarizeRun, hashRunSummary } from './run-state';
import { initGameState, processTick, advanceRoom } from './game-loop';

/** Canonical seed used across all Phase 3 regression tests. */
const REGRESSION_SEED = 'regression-v1';

/** Enemy definitions mirroring @echo-party/content ENEMY_DEFS for sim-layer tests. */
const REGRESSION_ENEMY_DEFS: EnemyDef[] = [
  {
    archetype: 'slime',
    name: 'Slime',
    stats: { maxHp: 20, currentHp: 20, attack: 4, defense: 1, speed: 1 },
    attackRange: 1,
    placeholderColor: 0x44cc44,
  },
  {
    archetype: 'goblin',
    name: 'Goblin',
    stats: { maxHp: 35, currentHp: 35, attack: 7, defense: 3, speed: 3 },
    attackRange: 1,
    placeholderColor: 0xcc4444,
  },
  {
    archetype: 'archer',
    name: 'Archer',
    stats: { maxHp: 25, currentHp: 25, attack: 8, defense: 2, speed: 2 },
    attackRange: 4,
    placeholderColor: 0xcccc44,
  },
];

/** Loot table mirroring @echo-party/content DEFAULT_LOOT_TABLE. */
const REGRESSION_LOOT_TABLE: LootTable = [
  { kind: 'health_potion', rarity: Rarity.Common, weight: 3, value: 20 },
  { kind: 'coin', rarity: Rarity.Common, weight: 7, value: 5 },
];

// ─── Room generation ──────────────────────────────────────────────────────────

describe('deterministic room generation', () => {
  it('produces the pinned tile layout for seed "regression-v1"', () => {
    const rng = new SeededRng(REGRESSION_SEED);
    const room = generateRoom(rng);

    // Dimensions must match defaults
    expect(room.width).toBe(15);
    expect(room.height).toBe(11);

    // Perimeter must always be walls
    for (let x = 0; x < room.width; x++) {
      expect(room.tiles[0][x]).toBe(TileType.Wall);
      expect(room.tiles[room.height - 1][x]).toBe(TileType.Wall);
    }
    for (let y = 0; y < room.height; y++) {
      expect(room.tiles[y][0]).toBe(TileType.Wall);
      expect(room.tiles[y][room.width - 1]).toBe(TileType.Wall);
    }

    // Pinned interior obstacle: row 8, col 7 is a Wall for this seed
    expect(room.tiles[8][7]).toBe(TileType.Wall);

    // All other interior positions must be Floor (obstacles are at known spots)
    const wallInteriorCount = room.tiles
      .slice(1, room.height - 1)
      .flatMap((row) => row.slice(1, room.width - 1))
      .filter((t) => t === TileType.Wall).length;

    // Obstacle count is rng.nextInt(1,3) — for this seed it's 1
    expect(wallInteriorCount).toBe(1);
  });

  it('room layout is identical on repeated calls with the same seed', () => {
    const rng1 = new SeededRng(REGRESSION_SEED);
    const rng2 = new SeededRng(REGRESSION_SEED);
    expect(generateRoom(rng1).tiles).toEqual(generateRoom(rng2).tiles);
  });
});

// ─── Enemy spawn ──────────────────────────────────────────────────────────────

describe('deterministic enemy spawn', () => {
  it('produces the pinned spawn positions for seed "regression-v1"', () => {
    const rng = new SeededRng(REGRESSION_SEED);
    const room = generateRoom(rng);
    const playerPos = { x: 2, y: Math.floor(room.height / 2) };
    const enemies = spawnEnemies(rng, room, REGRESSION_ENEMY_DEFS, 3, playerPos);

    expect(enemies).toHaveLength(3);

    // Pinned archetypes and positions
    expect(enemies[0].archetype).toBe('archer');
    expect(enemies[0].position).toEqual({ x: 13, y: 2 });

    expect(enemies[1].archetype).toBe('slime');
    expect(enemies[1].position).toEqual({ x: 5, y: 4 });

    expect(enemies[2].archetype).toBe('slime');
    expect(enemies[2].position).toEqual({ x: 6, y: 9 });
  });

  it('spawn result is identical on repeated calls with the same seed', () => {
    const rng1 = new SeededRng(REGRESSION_SEED);
    const rng2 = new SeededRng(REGRESSION_SEED);
    const room1 = generateRoom(rng1);
    const room2 = generateRoom(rng2);
    const playerPos = { x: 2, y: 5 };
    const e1 = spawnEnemies(rng1, room1, REGRESSION_ENEMY_DEFS, 3, playerPos);
    const e2 = spawnEnemies(rng2, room2, REGRESSION_ENEMY_DEFS, 3, playerPos);
    expect(e1.map((e) => e.archetype)).toEqual(e2.map((e) => e.archetype));
    expect(e1.map((e) => e.position)).toEqual(e2.map((e) => e.position));
  });
});

// ─── Loot rolls ───────────────────────────────────────────────────────────────

describe('deterministic loot rolls', () => {
  it('produces the pinned drop sequence for seed "regression-v1-loot"', () => {
    const rng = new SeededRng(REGRESSION_SEED + '-loot');
    const drops = Array.from({ length: 10 }, () => rollDrop(rng, REGRESSION_LOOT_TABLE));

    // Pinned sequence
    expect(drops).toEqual([
      { kind: 'coin', value: 5 },
      { kind: 'coin', value: 5 },
      { kind: 'health_potion', value: 20 },
      { kind: 'coin', value: 5 },
      { kind: 'coin', value: 5 },
      null,
      null,
      { kind: 'health_potion', value: 20 },
      { kind: 'coin', value: 5 },
      { kind: 'coin', value: 5 },
    ]);
  });

  it('loot sequence is identical on repeated calls with the same seed', () => {
    const rng1 = new SeededRng(REGRESSION_SEED + '-loot');
    const rng2 = new SeededRng(REGRESSION_SEED + '-loot');
    const drops1 = Array.from({ length: 20 }, () => rollDrop(rng1, REGRESSION_LOOT_TABLE));
    const drops2 = Array.from({ length: 20 }, () => rollDrop(rng2, REGRESSION_LOOT_TABLE));
    expect(drops1).toEqual(drops2);
  });
});

// ─── Run summary hash ─────────────────────────────────────────────────────────

describe('hashRunSummary', () => {
  it('is stable for the same summary fields', () => {
    const summary = {
      seed: REGRESSION_SEED,
      roomsCleared: 3,
      enemiesDefeated: 0,
      damageDealt: 0,
      damageTaken: 0,
      itemsCollected: 0,
      durationMs: 12345,
      victory: true,
    };

    // Hash must be identical regardless of durationMs
    expect(hashRunSummary({ ...summary, durationMs: 0 })).toBe(
      hashRunSummary({ ...summary, durationMs: 99999 }),
    );
  });

  it('produces the pinned hash for seed "regression-v1" three-room victory', () => {
    // Run a full 3-room simulation with fixed-kill inputs (no combat RNG consumed)
    const state = initGameState(
      { seed: REGRESSION_SEED, difficulty: Difficulty.Normal, contractId: 'contract-sewer-sweep' },
      REGRESSION_ENEMY_DEFS,
      3,
    );

    // Progress through each room by immediately force-killing enemies
    let guard = 0;
    while (!state.run.completed && guard < 20) {
      for (const e of state.enemies) {
        e.alive = false;
        e.stats.currentHp = 0;
      }
      const events = processTick(state, null, REGRESSION_LOOT_TABLE);
      if (state.run.completed) break;
      if (events.some((ev) => ev.type === 'room_cleared')) {
        advanceRoom(state, REGRESSION_ENEMY_DEFS);
      }
      guard++;
    }

    expect(state.run.victory).toBe(true);
    expect(state.run.currentRoom).toBe(3);

    const summary = summarizeRun(state.run, 0);
    const hash = hashRunSummary(summary);

    // Pinned hash — must not change unless simulation logic is intentionally altered
    expect(hash).toBe('6688d080');
  });

  it('produces a different hash when the seed changes', () => {
    const hashA = hashRunSummary({
      seed: 'seed-a',
      roomsCleared: 3,
      enemiesDefeated: 5,
      damageDealt: 50,
      damageTaken: 20,
      itemsCollected: 2,
      durationMs: 0,
      victory: true,
    });
    const hashB = hashRunSummary({
      seed: 'seed-b',
      roomsCleared: 3,
      enemiesDefeated: 5,
      damageDealt: 50,
      damageTaken: 20,
      itemsCollected: 2,
      durationMs: 0,
      victory: true,
    });
    expect(hashA).not.toBe(hashB);
  });

  it('produces a different hash when outcome fields change', () => {
    const base = {
      seed: REGRESSION_SEED,
      roomsCleared: 3,
      enemiesDefeated: 5,
      damageDealt: 50,
      damageTaken: 20,
      itemsCollected: 2,
      durationMs: 0,
      victory: true,
    };
    const hashVictory = hashRunSummary(base);
    const hashDefeat = hashRunSummary({ ...base, victory: false });
    expect(hashVictory).not.toBe(hashDefeat);
  });
});
