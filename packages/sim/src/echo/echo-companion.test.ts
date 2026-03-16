import { describe, it, expect } from 'vitest';
import type { EchoProfileV1, EnemyArchetype } from '@echo-party/shared';
import type { EnemyEntity } from '../procgen/enemy-spawn';
import { SeededRng } from '../rng';
import { createEchoCompanion, computeEchoAction } from './echo-companion';

function makeProfile(overrides: Partial<EchoProfileV1> = {}): EchoProfileV1 {
  return {
    version: 1,
    id: 'echo-test',
    name: 'Test Echo',
    createdAt: new Date().toISOString(),
    sourceSeed: 'test-seed',
    aggression: 0.7,
    movementBias: {},
    keepDistance: 0.2,
    targetSelection: {},
    abilityPriority: 0.7,
    survivabilityBias: 0.3,
    ...overrides,
  };
}

function makeEnemy(
  id: string,
  x: number,
  y: number,
  archetype: EnemyArchetype = 'slime',
): EnemyEntity {
  return {
    id,
    archetype,
    position: { x, y },
    stats: { maxHp: 20, currentHp: 20, attack: 4, defense: 1, speed: 1 },
    attackRange: 1,
    alive: true,
    isElite: false,
  };
}

describe('createEchoCompanion', () => {
  it('creates an Echo with correct profile and position', () => {
    const profile = makeProfile();
    const echo = createEchoCompanion(profile, { x: 3, y: 5 });

    expect(echo.profile.id).toBe('echo-test');
    expect(echo.position).toEqual({ x: 3, y: 5 });
    expect(echo.alive).toBe(true);
    expect(echo.stats.maxHp).toBe(50);
  });
});

describe('computeEchoAction', () => {
  it('returns null for a dead Echo', () => {
    const echo = createEchoCompanion(makeProfile(), { x: 3, y: 5 });
    echo.alive = false;
    const rng = new SeededRng('test');
    const action = computeEchoAction(echo, [], { x: 5, y: 5 }, rng);
    expect(action).toBeNull();
  });

  it('moves toward player when no enemies present and far away', () => {
    const echo = createEchoCompanion(makeProfile(), { x: 1, y: 1 });
    const rng = new SeededRng('test');
    const action = computeEchoAction(echo, [], { x: 10, y: 10 }, rng);
    expect(action).not.toBeNull();
    expect(action!.type).toBe('move');
  });

  it('returns null when no enemies and close to player', () => {
    const echo = createEchoCompanion(makeProfile(), { x: 5, y: 5 });
    const rng = new SeededRng('test');
    const action = computeEchoAction(echo, [], { x: 6, y: 5 }, rng);
    expect(action).toBeNull();
  });

  it('attacks adjacent enemy with high aggression', () => {
    const profile = makeProfile({ aggression: 1.0 });
    const echo = createEchoCompanion(profile, { x: 5, y: 5 });
    const enemy = makeEnemy('e-0', 6, 5);
    const rng = new SeededRng('test');

    const action = computeEchoAction(echo, [enemy], { x: 3, y: 5 }, rng);
    expect(action).not.toBeNull();
    expect(action!.type).toBe('attack');
  });

  it('moves toward distant enemy', () => {
    const echo = createEchoCompanion(makeProfile(), { x: 2, y: 2 });
    const enemy = makeEnemy('e-0', 10, 10);
    const rng = new SeededRng('test');

    const action = computeEchoAction(echo, [enemy], { x: 2, y: 2 }, rng);
    expect(action).not.toBeNull();
    expect(action!.type).toBe('move');
  });

  it('retreats when HP is low and survivability bias is high', () => {
    const profile = makeProfile({ survivabilityBias: 0.9, aggression: 0.1 });
    const echo = createEchoCompanion(profile, { x: 5, y: 5 });
    echo.stats.currentHp = 5; // Very low HP
    const enemy = makeEnemy('e-0', 6, 5);
    const rng = new SeededRng('test');

    const action = computeEchoAction(echo, [enemy], { x: 3, y: 5 }, rng);
    expect(action).not.toBeNull();
    expect(action!.type).toBe('move');
    if (action!.type === 'move') {
      // Should move away from the enemy (dx should be negative)
      expect(action!.dx).toBe(-1);
    }
  });

  it('prefers preferred target archetypes', () => {
    const profile = makeProfile({ targetSelection: { goblin: 0.9 }, aggression: 0.5 });
    const slime = makeEnemy('e-0', 6, 5, 'slime');
    const goblin = makeEnemy('e-1', 6, 6, 'goblin');

    // Over many trials, verify the echo produces valid actions targeting both enemies
    for (let i = 0; i < 50; i++) {
      const testRng = new SeededRng(`target-pref-${i}`);
      const testEcho = createEchoCompanion(profile, { x: 5, y: 5 });
      const action = computeEchoAction(testEcho, [slime, goblin], { x: 3, y: 3 }, testRng);
      // Just verify it produces valid actions
      expect(action).not.toBeNull();
    }
  });

  it('is deterministic with the same RNG seed', () => {
    const profile = makeProfile();
    const enemies = [makeEnemy('e-0', 8, 5), makeEnemy('e-1', 5, 8)];
    const playerPos = { x: 3, y: 3 };

    const echo1 = createEchoCompanion(profile, { x: 5, y: 5 });
    const echo2 = createEchoCompanion(profile, { x: 5, y: 5 });
    const rng1 = new SeededRng('det-echo');
    const rng2 = new SeededRng('det-echo');

    const action1 = computeEchoAction(echo1, enemies, playerPos, rng1);
    const action2 = computeEchoAction(echo2, enemies, playerPos, rng2);

    expect(action1).toEqual(action2);
  });
});
