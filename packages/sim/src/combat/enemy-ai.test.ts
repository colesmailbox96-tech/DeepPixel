import { describe, it, expect } from 'vitest';
import { computeEnemyActions } from './enemy-ai';
import type { EnemyEntity } from '../procgen/enemy-spawn';

function makeEnemy(overrides: Partial<EnemyEntity> = {}): EnemyEntity {
  return {
    id: 'enemy-0',
    archetype: 'slime',
    position: { x: 5, y: 5 },
    stats: { maxHp: 20, currentHp: 20, attack: 4, defense: 1, speed: 1 },
    attackRange: 1,
    alive: true,
    ...overrides,
  };
}

describe('computeEnemyActions', () => {
  it('returns attack action when player is in range', () => {
    const enemy = makeEnemy({ position: { x: 5, y: 5 }, attackRange: 1 });
    const playerPos = { x: 5, y: 6 }; // Adjacent

    const actions = computeEnemyActions([enemy], playerPos);
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('attack');
    expect(actions[0].enemyId).toBe('enemy-0');
  });

  it('returns move action toward player when out of range', () => {
    const enemy = makeEnemy({ position: { x: 2, y: 2 }, attackRange: 1 });
    const playerPos = { x: 8, y: 8 };

    const actions = computeEnemyActions([enemy], playerPos);
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('move');
    // Should move on one axis only (the one with greater or equal distance)
    expect(actions[0].targetPosition.x).toBe(3);
    expect(actions[0].targetPosition.y).toBe(2);
  });

  it('skips dead enemies', () => {
    const enemy = makeEnemy({ alive: false });
    const actions = computeEnemyActions([enemy], { x: 5, y: 6 });
    expect(actions).toHaveLength(0);
  });

  it('handles multiple enemies', () => {
    const enemies = [
      makeEnemy({ id: 'e-0', position: { x: 5, y: 5 } }),
      makeEnemy({ id: 'e-1', position: { x: 10, y: 10 } }),
    ];
    const actions = computeEnemyActions(enemies, { x: 5, y: 6 });
    expect(actions).toHaveLength(2);
  });

  it('ranged enemy attacks from distance', () => {
    const enemy = makeEnemy({ position: { x: 5, y: 5 }, attackRange: 4 });
    const playerPos = { x: 5, y: 8 }; // Distance 3, within range 4

    const actions = computeEnemyActions([enemy], playerPos);
    expect(actions[0].type).toBe('attack');
  });
});
