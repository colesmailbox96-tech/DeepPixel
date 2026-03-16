import { describe, it, expect } from 'vitest';
import { Direction } from '@echo-party/shared';
import { createActionLog, recordAction, deltaToDirection } from './action-log';

describe('createActionLog', () => {
  it('creates an empty log', () => {
    const log = createActionLog();
    expect(log.entries).toHaveLength(0);
  });
});

describe('recordAction', () => {
  it('appends an entry to the log', () => {
    const log = createActionLog();
    recordAction(
      log,
      { type: 'move', dx: 1, dy: 0 },
      { x: 5, y: 5 },
      [{ x: 10, y: 5 }],
      ['slime'],
      null,
    );
    expect(log.entries).toHaveLength(1);
    expect(log.entries[0].action).toEqual({ type: 'move', dx: 1, dy: 0 });
    expect(log.entries[0].playerPos).toEqual({ x: 5, y: 5 });
    expect(log.entries[0].enemyPositions).toEqual([{ x: 10, y: 5 }]);
    expect(log.entries[0].killedArchetype).toBeNull();
  });

  it('records kill archetype when provided', () => {
    const log = createActionLog();
    recordAction(log, { type: 'attack' }, { x: 5, y: 5 }, [{ x: 6, y: 5 }], ['goblin'], 'goblin');
    expect(log.entries[0].killedArchetype).toBe('goblin');
  });

  it('shallow-copies positions to prevent mutation', () => {
    const log = createActionLog();
    const playerPos = { x: 3, y: 3 };
    recordAction(log, null, playerPos, [], [], null);
    playerPos.x = 99;
    expect(log.entries[0].playerPos.x).toBe(3);
  });

  it('records null action for idle ticks', () => {
    const log = createActionLog();
    recordAction(log, null, { x: 0, y: 0 }, [], [], null);
    expect(log.entries[0].action).toBeNull();
  });
});

describe('deltaToDirection', () => {
  it('maps cardinal deltas correctly', () => {
    expect(deltaToDirection(1, 0)).toBe(Direction.East);
    expect(deltaToDirection(-1, 0)).toBe(Direction.West);
    expect(deltaToDirection(0, -1)).toBe(Direction.North);
    expect(deltaToDirection(0, 1)).toBe(Direction.South);
  });

  it('maps diagonal deltas correctly', () => {
    expect(deltaToDirection(1, -1)).toBe(Direction.NorthEast);
    expect(deltaToDirection(-1, -1)).toBe(Direction.NorthWest);
    expect(deltaToDirection(1, 1)).toBe(Direction.SouthEast);
    expect(deltaToDirection(-1, 1)).toBe(Direction.SouthWest);
  });

  it('returns null for zero delta', () => {
    expect(deltaToDirection(0, 0)).toBeNull();
  });
});
