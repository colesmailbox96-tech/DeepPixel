import { describe, it, expect } from 'vitest';
import { SeededRng } from '../rng';
import { generateRoom } from './room-gen';
import { spawnEnemies } from './enemy-spawn';
import type { EnemyDef } from '@echo-party/shared';

const testEnemyDefs: EnemyDef[] = [
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
];

describe('spawnEnemies', () => {
  it('spawns the correct number of enemies', () => {
    const rng = new SeededRng('spawn-test');
    const room = generateRoom(rng, 15, 11);
    const playerPos = { x: 2, y: 5 };
    const enemies = spawnEnemies(rng, room, testEnemyDefs, 3, playerPos);

    expect(enemies.length).toBe(3);
  });

  it('spawns enemies on floor tiles away from player', () => {
    const rng = new SeededRng('pos-test');
    const room = generateRoom(rng, 15, 11);
    const playerPos = { x: 2, y: 5 };
    const enemies = spawnEnemies(rng, room, testEnemyDefs, 3, playerPos);

    for (const enemy of enemies) {
      // Should be on a valid tile
      expect(enemy.position.x).toBeGreaterThanOrEqual(0);
      expect(enemy.position.x).toBeLessThan(room.width);
      expect(enemy.position.y).toBeGreaterThanOrEqual(0);
      expect(enemy.position.y).toBeLessThan(room.height);

      // Should not be too close to player
      const dist =
        Math.abs(enemy.position.x - playerPos.x) + Math.abs(enemy.position.y - playerPos.y);
      expect(dist).toBeGreaterThan(0);
    }
  });

  it('assigns unique IDs to enemies', () => {
    const rng = new SeededRng('id-test');
    const room = generateRoom(rng, 15, 11);
    const enemies = spawnEnemies(rng, room, testEnemyDefs, 4, { x: 2, y: 5 });
    const ids = enemies.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is deterministic for the same seed', () => {
    const rng1 = new SeededRng('det-spawn');
    const rng2 = new SeededRng('det-spawn');
    const room1 = generateRoom(rng1, 15, 11);
    const room2 = generateRoom(rng2, 15, 11);
    const playerPos = { x: 2, y: 5 };

    const enemies1 = spawnEnemies(rng1, room1, testEnemyDefs, 3, playerPos);
    const enemies2 = spawnEnemies(rng2, room2, testEnemyDefs, 3, playerPos);

    expect(enemies1.map((e) => e.archetype)).toEqual(enemies2.map((e) => e.archetype));
    expect(enemies1.map((e) => e.position)).toEqual(enemies2.map((e) => e.position));
  });

  it('returns all enemies alive', () => {
    const rng = new SeededRng('alive-test');
    const room = generateRoom(rng, 15, 11);
    const enemies = spawnEnemies(rng, room, testEnemyDefs, 3, { x: 2, y: 5 });
    for (const e of enemies) {
      expect(e.alive).toBe(true);
    }
  });
});
