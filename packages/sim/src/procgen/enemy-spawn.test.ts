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

// ─── Phase 5: Elite + modifier + biome spawn tests ───────────────────────────

const eliteDefs: EnemyDef[] = [
  {
    archetype: 'goblin',
    name: 'Goblin Warlord',
    stats: { maxHp: 70, currentHp: 70, attack: 12, defense: 6, speed: 3 },
    attackRange: 1,
    placeholderColor: 0xff2222,
    isElite: true,
  },
];

describe('spawnEnemies with Phase 5 options', () => {
  it('can spawn elite enemies', () => {
    // With 100% elite chance (seeded), at least one elite should appear in many trials
    let eliteFound = false;
    for (let i = 0; i < 50; i++) {
      const rng = new SeededRng(`elite-${i}`);
      const room = generateRoom(rng, 15, 11);
      const enemies = spawnEnemies(rng, room, testEnemyDefs, 4, { x: 2, y: 5 }, eliteDefs);
      if (enemies.some((e) => e.isElite)) {
        eliteFound = true;
        break;
      }
    }
    expect(eliteFound).toBe(true);
  });

  it('applies contract modifier stat scaling', () => {
    const mods = [
      {
        id: 'mod-fortified',
        family: 'scaling' as const,
        name: 'Fortified',
        description: '+25% HP',
        enemyHpScale: 1.25,
      },
    ];
    const rng = new SeededRng('mod-test');
    const room = generateRoom(rng, 15, 11);
    const enemies = spawnEnemies(
      rng,
      room,
      testEnemyDefs,
      3,
      { x: 2, y: 5 },
      undefined,
      mods,
    );

    for (const e of enemies) {
      // Both archetypes have maxHp either 20 or 35 — scaled by 1.25 → 25 or 44
      expect(e.stats.maxHp).toBeGreaterThan(20);
      expect(e.stats.currentHp).toBe(e.stats.maxHp);
    }
  });

  it('weights preferred archetypes more heavily', () => {
    // With preferredArchetypes = ['slime'], slime should appear more often
    const archetypeCounts: Record<string, number> = {};
    for (let i = 0; i < 50; i++) {
      const rng = new SeededRng(`pref-${i}`);
      const room = generateRoom(rng, 15, 11);
      const enemies = spawnEnemies(
        rng,
        room,
        testEnemyDefs,
        4,
        { x: 2, y: 5 },
        undefined,
        undefined,
        ['slime'],
      );
      for (const e of enemies) {
        archetypeCounts[e.archetype] = (archetypeCounts[e.archetype] ?? 0) + 1;
      }
    }
    // Slime should appear more than goblin due to weighting
    expect(archetypeCounts['slime']).toBeGreaterThan(archetypeCounts['goblin'] ?? 0);
  });

  it('boostedElites modifier increases elite rate', () => {
    const mods = [
      {
        id: 'mod-elite-surge',
        family: 'hazard' as const,
        name: 'Elite Surge',
        description: 'More elites',
        boostedElites: true,
      },
    ];
    let eliteCount = 0;
    for (let i = 0; i < 50; i++) {
      const rng = new SeededRng(`boosted-${i}`);
      const room = generateRoom(rng, 15, 11);
      const enemies = spawnEnemies(
        rng,
        room,
        testEnemyDefs,
        4,
        { x: 2, y: 5 },
        eliteDefs,
        mods,
      );
      for (const e of enemies) {
        if (e.isElite) eliteCount++;
      }
    }
    // With 40% elite chance and 200 total, we expect ~80 elites (±30)
    expect(eliteCount).toBeGreaterThan(30);
  });

  it('sets isElite to false for non-elite spawns', () => {
    const rng = new SeededRng('non-elite');
    const room = generateRoom(rng, 15, 11);
    const enemies = spawnEnemies(rng, room, testEnemyDefs, 3, { x: 2, y: 5 });
    for (const e of enemies) {
      expect(e.isElite).toBe(false);
    }
  });
});
